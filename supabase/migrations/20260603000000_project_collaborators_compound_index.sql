-- Add a compound index on (owner_id, project_id) to support the per-project
-- collaborator policy in 20260602000001 which filters by both columns.
-- Without this index, every UPDATE on diagrams requires a sequential scan of
-- project_collaborators, which causes write timeouts under concurrent edits.

create index if not exists project_collaborators_owner_project_idx
  on public.project_collaborators (owner_id, project_id);
