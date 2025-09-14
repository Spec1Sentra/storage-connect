import { supabase } from '../lib/supabaseClient';

export const createClaimAndConversation = async (itemId: string, itemOwnerId: string, claimantId: string) => {
  // 1. Create a claim
  const { data: claimData, error: claimError } = await supabase
    .from('claims')
    .insert({
      item_id: itemId,
      claimant_id: claimantId,
    })
    .select()
    .single();

  if (claimError) throw claimError;

  // 2. Create a conversation
  const { data: conversationData, error: conversationError } = await supabase
    .from('conversations')
    .insert({
      claim_id: claimData.id,
      item_owner_id: itemOwnerId,
      claimant_id: claimantId,
    })
    .select()
    .single();

  if (conversationError) {
    // Rollback the claim if conversation creation fails
    await supabase.from('claims').delete().eq('id', claimData.id);
    throw conversationError;
  }

  return conversationData;
};
