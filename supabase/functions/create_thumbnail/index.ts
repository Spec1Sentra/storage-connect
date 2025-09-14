import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import * as ImageScript from "https://deno.land/x/imagescript@1.2.15/mod.ts"
import { supabaseAdmin } from "../_shared/supabase-client.ts"

const THUMBNAIL_WIDTH = 400;
const TARGET_BUCKET = 'item-public';

serve(async (req) => {
  try {
    // This function is designed to be triggered by a Supabase Storage Object creation.
    const payload = await req.json()
    const record = payload.record;

    if (!record || !record.bucket_id || !record.path) {
      throw new Error("Invalid webhook payload received.")
    }

    const sourceBucket = record.bucket_id;
    const sourcePath = record.path;

    // Ignore events from other buckets
    if (sourceBucket !== 'item-raw') {
      console.log(`Ignoring event from bucket '${sourceBucket}'.`)
      return new Response("ok")
    }

    // Download the original image from the 'item-raw' bucket
    const { data: originalImage, error: downloadError } = await supabaseAdmin.storage
      .from(sourceBucket)
      .download(sourcePath)

    if (downloadError) throw downloadError
    if (!originalImage) throw new Error(`Image not found at path: ${sourcePath}`)

    // Resize the image using ImageScript
    const image = await ImageScript.decode(new Uint8Array(await originalImage.arrayBuffer()))
    image.resize(THUMBNAIL_WIDTH, ImageScript.RESIZE_AUTO)
    const thumbnailData = await image.encodeJPEG(80) // 80% quality JPEG

    // Upload the thumbnail to the 'item-public' bucket
    const thumbnailPath = sourcePath; // Use the same path for simplicity
    const { error: uploadError } = await supabaseAdmin.storage
      .from(TARGET_BUCKET)
      .upload(thumbnailPath, thumbnailData, {
        contentType: 'image/jpeg',
        upsert: true // Overwrite if it already exists
      })

    if (uploadError) throw uploadError

    // Finally, update the corresponding row in the public.images table
    const { error: dbError } = await supabaseAdmin
      .from('images')
      .update({ storage_path_thumbnail: thumbnailPath })
      .eq('storage_path_raw', sourcePath)

    if (dbError) throw dbError

    console.log(`Successfully created thumbnail for ${sourcePath}`);

    return new Response(JSON.stringify({ success: true, thumbnailPath }), {
      headers: { "Content-Type": "application/json" },
    })

  } catch (error) {
    console.error("Error in create_thumbnail function:", error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
})
