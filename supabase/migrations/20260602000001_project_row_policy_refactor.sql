-- Refine collaborator access to per-project system rows.
-- This migration replaces broad owner-row collaborator policies with project-level checks.

drop policy if exists "Collaborators can view shared project rows" on public.diagrams;
drop policy if exists "Collaborators can edit shared project rows" on public.diagrams;

create policy "Collaborators can view shared project rows"
  on public.diagrams for select
  using (
    name like '__project_v1__:%'
    and exists (
      select 1
      from public.project_collaborators pc
      where pc.owner_id = diagrams.user_id
        and pc.project_id = coalesce(diagrams.data->'project'->>'id', '')
        and pc.collaborator_id = auth.uid()
    )
  );

create policy "Collaborators can edit shared project rows"
  on public.diagrams for update
  using (
    name like '__project_v1__:%'
    and exists (
      select 1
      from public.project_collaborators pc
      where pc.owner_id = diagrams.user_id
        and pc.project_id = coalesce(diagrams.data->'project'->>'id', '')
        and pc.collaborator_id = auth.uid()
    )
  )
  with check (
    name like '__project_v1__:%'
    and exists (
      select 1
      from public.project_collaborators pc
      where pc.owner_id = diagrams.user_id
        and pc.project_id = coalesce(diagrams.data->'project'->>'id', '')
        and pc.collaborator_id = auth.uid()
    )
  );
