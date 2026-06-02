-- Ensure diagrams updates are published to Supabase Realtime.
-- This avoids environments where postgres_changes listeners receive no events.

do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'diagrams'
  ) then
    alter publication supabase_realtime add table public.diagrams;
  end if;
end
$$;
