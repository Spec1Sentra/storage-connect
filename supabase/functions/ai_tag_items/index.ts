import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import { supabaseAdmin } from "../_shared/supabase-client.ts"
import { getGoogleAuthToken } from "../_shared/gcloud-auth.ts"

const VISION_API_URL = 'https://vision.googleapis.com/v1/images:annotate'
const PII_REGEX = /\b\d{3}[- ]?\d{2}[- ]?\d{4}\b/g; // Simple SSN-like regex

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const userClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )
    const { data: { user }, error: userError } = await userClient.auth.getUser()
    if (userError || !user) throw new Error('User not found')

    const { item_id, images } = await req.json()
    if (!item_id || !images || !Array.isArray(images) || images.length === 0) {
      throw new Error("Missing 'item_id' or 'images' in request body")
    }

    const { data: item, error: itemError } = await supabaseAdmin.from('items').select('created_by').eq('id', item_id).single()
    if (itemError || !item) throw new Error('Item not found')
    if (item.created_by !== user.id) throw new Error('User does not own this item')

    const gcloudServiceAccount = JSON.parse(Deno.env.get('GCLOUD_SERVICE_ACCOUNT')!)
    const authToken = await getGoogleAuthToken(gcloudServiceAccount)

    const imageRequests = await Promise.all(images.map(async (image) => {
      if (!image.path) throw new Error("Image object must have a 'path' property")
      const { data: imageData, error: downloadError } = await supabaseAdmin.storage.from('item-raw').download(image.path)
      if (downloadError) throw downloadError
      const imageBytes = new Uint8Array(await imageData.arrayBuffer())
      return {
        image: { content: btoa(String.fromCharCode(...imageBytes)) },
        features: [
          { type: 'LABEL_DETECTION', maxResults: 15 },
          { type: 'SAFE_SEARCH_DETECTION' },
          { type: 'TEXT_DETECTION' },
        ],
        imageContext: { "uri": image.path }
      }
    }))

    const visionApiResponse = await fetch(VISION_API_URL, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${authToken}`, 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({ requests: imageRequests }),
    })
    if (!visionApiResponse.ok) throw new Error(`Vision API request failed: ${visionApiResponse.status} ${await visionApiResponse.text()}`)

    const visionData = await visionApiResponse.json()
    const responses = visionData.responses

    let allLabels = new Map<string, number>()
    let needsModeration = false
    let moderationReasons: string[] = []
    const piiImagePaths = new Set<string>()

    responses.forEach((response: any, index: number) => {
      response.labelAnnotations?.forEach((label: any) => {
        const name = label.description.toLowerCase().trim()
        if (name && label.score > (allLabels.get(name) || 0)) {
          allLabels.set(name, label.score)
        }
      })

      const safeSearch = response.safeSearchAnnotation
      if (['LIKELY', 'VERY_LIKELY'].includes(safeSearch.adult) || ['LIKELY', 'VERY_LIKELY'].includes(safeSearch.violence)) {
        needsModeration = true
        moderationReasons.push(`Image ${index + 1} flagged for adult/violent content.`)
      }

      const text = response.fullTextAnnotation?.text || ''
      if (PII_REGEX.test(text)) {
        needsModeration = true
        const imagePath = imageRequests[index].imageContext.uri
        piiImagePaths.add(imagePath)
        moderationReasons.push(`Image at path ${imagePath} may contain PII.`)
      }
    })

    // Database updates
    if (allLabels.size > 0) {
      const tagsToUpsert = Array.from(allLabels.keys()).map(name => ({ name }))
      const { data: upsertedTags, error: tagsUpsertError } = await supabaseAdmin.from('tags').upsert(tagsToUpsert, { onConflict: 'name' }).select('id, name')
      if (tagsUpsertError) throw tagsUpsertError

      const itemTagsToInsert = upsertedTags!.map(tag => ({
        item_id,
        tag_id: tag.id,
        confidence: allLabels.get(tag.name),
        tag_source: 'cloud_vision',
      }))
      const { error: itemTagsInsertError } = await supabaseAdmin.from('item_tags').insert(itemTagsToInsert)
      if (itemTagsInsertError) throw itemTagsInsertError
    }

    if (piiImagePaths.size > 0) {
      const { error: piiUpdateError } = await supabaseAdmin.from('images').update({ has_pii: true }).in('storage_path_raw', [...piiImagePaths])
      if (piiUpdateError) throw piiUpdateError
    }

    if (needsModeration) {
      const { error: reportError } = await supabaseAdmin.from('reports').insert({
        item_id,
        reporter_id: user.id,
        reason: moderationReasons.join('\n'),
        status: 'open',
      })
      if (reportError) throw reportError

      const { error: itemUpdateError } = await supabaseAdmin.from('items').update({ status: 'review' }).eq('id', item_id)
      if (itemUpdateError) throw itemUpdateError
    }

    // Optional Gemini integration would go here

    return new Response(JSON.stringify({ success: true, needsModeration, tags: Object.fromEntries(allLabels) }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    })

  } catch (error) {
    console.error("Error in ai_tag_items:", error.message)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    })
  }
})
