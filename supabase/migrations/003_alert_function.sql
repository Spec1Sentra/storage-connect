--
-- Function to find matching saved searches for a new item and create notifications.
-- This is designed to be called by a trigger or an edge function when an item is created.
--
create or replace function public.find_and_alert_matches(p_item_id uuid)
returns void
language plpgsql
as $$
declare
  item_record record;
  item_tags_array text[];
begin
  -- Get the new item's details
  select * into item_record from public.items where id = p_item_id;

  -- If item not found or not active, do nothing
  if not found or item_record.status <> 'active' then
    return;
  end if;

  -- Get the item's tags
  select array_agg(t.name) into item_tags_array
  from public.item_tags it
  join public.tags t on it.tag_id = t.id
  where it.item_id = p_item_id;

  -- Insert notifications for each matching saved search
  insert into public.notifications (user_id, item_id, saved_search_id, type)
  select
    ss.user_id,
    p_item_id,
    ss.id,
    'new_match'
  from public.saved_searches ss
  where
    -- Don't notify the item owner
    ss.user_id <> item_record.created_by
    -- Geospatial match (if both item and search have location)
    and (item_record.location is null or ss.location is null or ST_DWithin(item_record.location, ss.location, ss.radius_km * 1000))
    -- Tag match (if search has tags, check for intersection)
    and (ss.tags is null or ss.tags = '{}' or ss.tags && item_tags_array)
    -- Text match (if search has text)
    and (ss.query_text is null or ss.query_text = '' or item_record.tsv @@ plainto_tsquery('english', ss.query_text));
end;
$$;
