-- Shared project collaborators and access policies
create table if not exists public.project_collaborators (
  owner_id uuid references auth.users not null,
  project_id text not null,
  collaborator_id uuid references auth.users not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  primary key (owner_id, project_id, collaborator_id)
);

alter table public.project_collaborators enable row level security;

create policy "Owners can manage project collaborators"
  on public.project_collaborators for all
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

create policy "Collaborators can view their memberships"
  on public.project_collaborators for select
  using (auth.uid() = collaborator_id);

create index if not exists project_collaborators_collaborator_idx
  on public.project_collaborators (collaborator_id);

create index if not exists project_collaborators_owner_idx
  on public.project_collaborators (owner_id);

create or replace function public.invite_project_collaborator(
  p_project_id text,
  p_collaborator_email text
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_owner_id uuid;
  v_collaborator_id uuid;
begin
  v_owner_id := auth.uid();

  if v_owner_id is null then
    raise exception 'Authentication required';
  end if;

  if p_project_id is null or length(trim(p_project_id)) = 0 then
    raise exception 'Project id is required';
  end if;

  select u.id
    into v_collaborator_id
  from auth.users u
  where lower(u.email) = lower(trim(p_collaborator_email))
  limit 1;

  if v_collaborator_id is null then
    raise exception 'No registered user found for that email';
  end if;

  if v_collaborator_id = v_owner_id then
    raise exception 'You are already the owner';
  end if;

  insert into public.project_collaborators (owner_id, project_id, collaborator_id)
  values (v_owner_id, p_project_id, v_collaborator_id)
  on conflict (owner_id, project_id, collaborator_id) do nothing;

  return v_collaborator_id;
end;
$$;

grant execute on function public.invite_project_collaborator(text, text) to authenticated;

create or replace function public.remove_project_collaborator(
  p_project_id text,
  p_collaborator_id uuid
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  delete from public.project_collaborators
  where owner_id = auth.uid()
    and project_id = p_project_id
    and collaborator_id = p_collaborator_id;
end;
$$;

grant execute on function public.remove_project_collaborator(text, uuid) to authenticated;

create policy "Collaborators can view shared project rows"
  on public.diagrams for select
  using (
    name = '__projects_store_v1__'
    and exists (
      select 1
      from public.project_collaborators pc
      where pc.owner_id = diagrams.user_id
        and pc.collaborator_id = auth.uid()
    )
  );

create policy "Collaborators can edit shared project rows"
  on public.diagrams for update
  using (
    name = '__projects_store_v1__'
    and exists (
      select 1
      from public.project_collaborators pc
      where pc.owner_id = diagrams.user_id
        and pc.collaborator_id = auth.uid()
    )
  )
  with check (
    name = '__projects_store_v1__'
    and exists (
      select 1
      from public.project_collaborators pc
      where pc.owner_id = diagrams.user_id
        and pc.collaborator_id = auth.uid()
    )
  );
