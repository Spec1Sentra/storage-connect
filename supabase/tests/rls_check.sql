-- This script checks that RLS is enabled on all tables in the public schema.
-- It is intended to be run in a CI pipeline.
-- If any table has RLS disabled, the script will exit with an error.

do $$
declare
  table_name text;
  rls_enabled boolean;
begin
  for table_name in
    select tablename from pg_tables where schemaname = 'public'
  loop
    select relrowsecurity into rls_enabled from pg_class where relname = table_name;
    if not rls_enabled then
      raise exception 'RLS is not enabled on table: %', table_name;
    end if;
  end loop;
end;
$$;
