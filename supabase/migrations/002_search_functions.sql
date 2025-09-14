--
-- Search function for finding items based on multiple criteria.
--

create or replace function search_items(
  query_text text default null,
  tag_names text[] default null,
  in_lat float default null,
  in_lng float default null,
  radius_km float default null,
  query_embedding vector default null,
  similarity_threshold float default 0.8,
  match_limit int default 20,
  match_offset int default 0
)
returns table (
  id uuid,
  created_by uuid,
  description text,
  description_auto text,
  is_sentimental boolean,
  status public.item_status,
  expires_at timestamptz,
  location geography(Point, 4326),
  created_at timestamptz,
  similarity float,
  rank float
)
language plpgsql
as $$
begin
  return query
  select
    i.id,
    i.created_by,
    i.description,
    i.description_auto,
    i.is_sentimental,
    i.status,
    i.expires_at,
    i.location,
    i.created_at,
    (case when query_embedding is not null then (ie.embedding <=> query_embedding) else null end) as similarity,
    (case when query_text is not null then ts_rank(i.tsv, plainto_tsquery('english', query_text)) else 0 end) as rank
  from public.items as i
  left join public.item_embeddings as ie on i.id = ie.item_id
  where
    i.status = 'active'
    and (query_text is null or i.tsv @@ plainto_tsquery('english', query_text))
    and (in_lat is null or ST_DWithin(i.location, ST_SetSRID(ST_MakePoint(in_lng, in_lat), 4326)::geography, radius_km * 1000))
    and (tag_names is null or exists (
        select 1 from public.item_tags it
        join public.tags t on it.tag_id = t.id
        where it.item_id = i.id and t.name = any(tag_names)
      ))
    and (query_embedding is null or (ie.embedding <=> query_embedding) < 1 - similarity_threshold)
  order by
    similarity asc,
    rank desc,
    i.created_at desc
  limit match_limit
  offset match_offset;
end;
$$;
