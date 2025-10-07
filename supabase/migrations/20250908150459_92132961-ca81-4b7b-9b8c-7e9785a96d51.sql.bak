
-- Enable required extension
create extension if not exists pgcrypto;

-- =========================
-- ENUMS
-- =========================
do $$ begin
  create type public.app_role as enum ('admin','artist','agent','venue');
exception when duplicate_object then null end $$;

do $$ begin
  create type public.profile_type as enum ('artist','agent','venue');
exception when duplicate_object then null end $$;

do $$ begin
  create type public.annonce_status as enum ('draft','open','closed');
exception when duplicate_object then null end $$;

do $$ begin
  create type public.application_status as enum ('pending','accepted','rejected','withdrawn');
exception when duplicate_object then null end $$;

do $$ begin
  create type public.media_type as enum ('image','video','audio','doc');
exception when duplicate_object then null end $$;

do $$ begin
  create type public.conversation_type as enum ('direct','group');
exception when duplicate_object then null end $$;

-- =========================
-- UTILITY: updated_at trigger
-- =========================
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- =========================
-- ROLES (multi-profils)
-- =========================
create table if not exists public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null, -- equals auth.uid(), no FK to auth.users by design
  role public.app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);

alter table public.user_roles enable row level security;

-- Function to check role (SECURITY DEFINER bypasses RLS safely)
create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.user_roles
    where user_id = _user_id and role = _role
  );
$$;

-- Policies for user_roles
do $$ begin
  create policy "Users can read their own roles"
    on public.user_roles
    for select
    to authenticated
    using (user_id = auth.uid());
exception when duplicate_object then null end $$;

do $$ begin
  create policy "Users can add their own non-admin roles"
    on public.user_roles
    for insert
    to authenticated
    with check (user_id = auth.uid() and role <> 'admin');
exception when duplicate_object then null end $$;

do $$ begin
  create policy "Users can update their own non-admin roles"
    on public.user_roles
    for update
    to authenticated
    using (user_id = auth.uid() and role <> 'admin')
    with check (user_id = auth.uid() and role <> 'admin');
exception when duplicate_object then null end $$;

do $$ begin
  create policy "Users can delete their own non-admin roles"
    on public.user_roles
    for delete
    to authenticated
    using (user_id = auth.uid() and role <> 'admin');
exception when duplicate_object then null end $$;

-- =========================
-- PROFILES (public directory)
-- =========================
create table if not exists public.profiles (
  id uuid primary key, -- must equal auth.uid(); set by app on signup
  display_name text not null,
  profile_type public.profile_type not null, -- primary type for the profile
  bio text,
  avatar_url text,
  location text,
  genres text[],               -- e.g. ['house','techno'] etc.
  years_experience int,
  website_url text,
  is_public boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists profiles_display_name_idx on public.profiles using gin (to_tsvector('simple', coalesce(display_name,'') || ' ' || coalesce(location,'')));
create index if not exists profiles_profile_type_idx on public.profiles (profile_type);

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

alter table public.profiles enable row level security;

-- Public read access (directory)
do $$ begin
  create policy "Anyone can read public profiles"
    on public.profiles
    for select
    to anon, authenticated
    using (is_public = true);
exception when duplicate_object then null end $$;

-- Owners can read their own profile even if not public
do $$ begin
  create policy "Owner can read own profile"
    on public.profiles
    for select
    to authenticated
    using (id = auth.uid());
exception when duplicate_object then null end $$;

-- Owners manage their profile
do $$ begin
  create policy "Owner can insert their profile"
    on public.profiles
    for insert
    to authenticated
    with check (id = auth.uid());
exception when duplicate_object then null end $$;

do $$ begin
  create policy "Owner can update their profile"
    on public.profiles
    for update
    to authenticated
    using (id = auth.uid())
    with check (id = auth.uid());
exception when duplicate_object then null end $$;

do $$ begin
  create policy "Owner can delete their profile"
    on public.profiles
    for delete
    to authenticated
    using (id = auth.uid());
exception when duplicate_object then null end $$;

-- =========================
-- MEDIA ASSETS (portfolio)
-- =========================
create table if not exists public.media_assets (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  type public.media_type not null,
  url text not null,
  title text,
  created_at timestamptz not null default now()
);
alter table public.media_assets enable row level security;

do $$ begin
  create policy "Public can read media assets of public profiles"
    on public.media_assets
    for select
    to anon, authenticated
    using (exists(select 1 from public.profiles p where p.id = media_assets.profile_id and p.is_public = true));
exception when duplicate_object then null end $$;

do $$ begin
  create policy "Owner can manage media assets"
    on public.media_assets
    for all
    to authenticated
    using (profile_id = auth.uid())
    with check (profile_id = auth.uid());
exception when duplicate_object then null end $$;

-- =========================
-- ROSTER (agents ↔ artistes)
-- =========================
create table if not exists public.agent_artists (
  id uuid primary key default gen_random_uuid(),
  agent_id uuid not null references public.profiles(id) on delete cascade,
  artist_id uuid not null references public.profiles(id) on delete cascade,
  status text not null default 'active', -- 'pending','active','ended' (free text for simplicity)
  created_at timestamptz not null default now(),
  unique (agent_id, artist_id)
);

-- Validation trigger: ensure types (agent_id -> agent, artist_id -> artist)
create or replace function public.validate_agent_artist_types()
returns trigger
language plpgsql
as $$
declare
  agent_type public.profile_type;
  artist_type public.profile_type;
begin
  select profile_type into agent_type from public.profiles where id = new.agent_id;
  select profile_type into artist_type from public.profiles where id = new.artist_id;

  if agent_type is distinct from 'agent' then
    raise exception 'agent_id must reference a profile with type=agent';
  end if;
  if artist_type is distinct from 'artist' then
    raise exception 'artist_id must reference a profile with type=artist';
  end if;

  return new;
end;
$$;

drop trigger if exists agent_artists_validate_types on public.agent_artists;
create trigger agent_artists_validate_types
before insert or update on public.agent_artists
for each row
execute function public.validate_agent_artist_types();

alter table public.agent_artists enable row level security;

-- Public can read rosters (to afficher roster sur la fiche agent)
do $$ begin
  create policy "Anyone can read agent rosters"
    on public.agent_artists
    for select
    to anon, authenticated
    using (true);
exception when duplicate_object then null end $$;

-- Only the agent can manage their roster
do $$ begin
  create policy "Agent can manage their roster"
    on public.agent_artists
    for all
    to authenticated
    using (agent_id = auth.uid())
    with check (agent_id = auth.uid());
exception when duplicate_object then null end $$;

-- =========================
-- ANNONCES (jobs/offres) & APPLICATIONS (candidatures)
-- =========================
create table if not exists public.annonces (
  id uuid primary key default gen_random_uuid(),
  posted_by uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  description text,
  location text,
  event_date timestamptz,
  status public.annonce_status not null default 'open',
  budget_min_cents int,
  budget_max_cents int,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger annonces_set_updated_at
before update on public.annonces
for each row execute function public.set_updated_at();

alter table public.annonces enable row level security;

-- Public reads annonces
do $$ begin
  create policy "Anyone can read annonces"
    on public.annonces
    for select
    to anon, authenticated
    using (true);
exception when duplicate_object then null end $$;

-- Only venues or agents can create annonces
do $$ begin
  create policy "Venue/Agent can create annonces"
    on public.annonces
    for insert
    to authenticated
    with check (
      posted_by = auth.uid()
      and (public.has_role(auth.uid(),'venue') or public.has_role(auth.uid(),'agent'))
    );
exception when duplicate_object then null end $$;

-- Owner or admin can update/delete
do $$ begin
  create policy "Owner or admin can update annonces"
    on public.annonces
    for update
    to authenticated
    using (posted_by = auth.uid() or public.has_role(auth.uid(),'admin'))
    with check (posted_by = auth.uid() or public.has_role(auth.uid(),'admin'));
exception when duplicate_object then null end $$;

do $$ begin
  create policy "Owner or admin can delete annonces"
    on public.annonces
    for delete
    to authenticated
    using (posted_by = auth.uid() or public.has_role(auth.uid(),'admin'));
exception when duplicate_object then null end $$;

-- Applications (candidatures)
create table if not exists public.applications (
  id uuid primary key default gen_random_uuid(),
  annonce_id uuid not null references public.annonces(id) on delete cascade,
  applicant_id uuid not null references public.profiles(id) on delete cascade,
  message text,
  status public.application_status not null default 'pending',
  created_at timestamptz not null default now(),
  unique (annonce_id, applicant_id)
);
alter table public.applications enable row level security;

-- Visibility: applicant or annonce owner (poster)
do $$ begin
  create policy "Applicant or poster can read applications"
    on public.applications
    for select
    to authenticated
    using (
      applicant_id = auth.uid()
      or exists (
        select 1 from public.annonces a
        where a.id = applications.annonce_id and a.posted_by = auth.uid()
      )
    );
exception when duplicate_object then null end $$;

-- Applicant can create application
do $$ begin
  create policy "Applicant can create application"
    on public.applications
    for insert
    to authenticated
    with check (applicant_id = auth.uid());
exception when duplicate_object then null end $$;

-- Applicant can update own application (e.g., withdraw) OR poster can update (accept/reject)
do $$ begin
  create policy "Applicant or poster can update application"
    on public.applications
    for update
    to authenticated
    using (
      applicant_id = auth.uid()
      or exists (
        select 1 from public.annonces a
        where a.id = applications.annonce_id and a.posted_by = auth.uid()
      )
    )
    with check (
      applicant_id = auth.uid()
      or exists (
        select 1 from public.annonces a
        where a.id = applications.annonce_id and a.posted_by = auth.uid()
      )
    );
exception when duplicate_object then null end $$;

-- =========================
-- MESSAGING (conversations & messages)
-- =========================
create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  type public.conversation_type not null default 'direct',
  created_by uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now()
);
alter table public.conversations enable row level security;

-- Only participants (or creator) can see conversation metadata
do $$ begin
  create policy "Participants can read conversations"
    on public.conversations
    for select
    to authenticated
    using (
      exists (
        select 1 from public.conversation_participants cp
        where cp.conversation_id = conversations.id
          and cp.profile_id = auth.uid()
      ) or created_by = auth.uid()
    );
exception when duplicate_object then null end $$;

-- Creator can create conversation
do $$ begin
  create policy "Creator can create conversation"
    on public.conversations
    for insert
    to authenticated
    with check (created_by = auth.uid());
exception when duplicate_object then null end $$;

-- Creator can delete conversation (optional: or admin)
do $$ begin
  create policy "Creator or admin can delete conversation"
    on public.conversations
    for delete
    to authenticated
    using (created_by = auth.uid() or public.has_role(auth.uid(),'admin'));
exception when duplicate_object then null end $$;

-- Participants table
create table if not exists public.conversation_participants (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (conversation_id, profile_id)
);
alter table public.conversation_participants enable row level security;

-- Participants can read rows they belong to
do $$ begin
  create policy "Participants can read participant rows"
    on public.conversation_participants
    for select
    to authenticated
    using (profile_id = auth.uid());
exception when duplicate_object then null end $$;

-- Only conversation creator can add/remove participants (simple rule for MVP)
do $$ begin
  create policy "Creator can manage participants"
    on public.conversation_participants
    for all
    to authenticated
    using (
      exists (
        select 1 from public.conversations c
        where c.id = conversation_participants.conversation_id
          and c.created_by = auth.uid()
      )
    )
    with check (
      exists (
        select 1 from public.conversations c
        where c.id = conversation_participants.conversation_id
          and c.created_by = auth.uid()
      )
    );
exception when duplicate_object then null end $$;

-- Messages
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete cascade,
  content text not null,
  created_at timestamptz not null default now()
);

-- Realtime support
alter table public.messages replica identity full;
alter publication supabase_realtime add table public.messages;

alter table public.messages enable row level security;

-- Only participants can read messages
do $$ begin
  create policy "Participants can read messages"
    on public.messages
    for select
    to authenticated
    using (
      exists (
        select 1 from public.conversation_participants cp
        where cp.conversation_id = messages.conversation_id
          and cp.profile_id = auth.uid()
      )
    );
exception when duplicate_object then null end $$;

-- Only participants can send messages (sender must match auth.uid)
do $$ begin
  create policy "Participants can send messages"
    on public.messages
    for insert
    to authenticated
    with check (
      sender_id = auth.uid()
      and exists (
        select 1 from public.conversation_participants cp
        where cp.conversation_id = messages.conversation_id
          and cp.profile_id = auth.uid()
      )
    );
exception when duplicate_object then null end $$;

-- Sender can delete their own message; admin too
do $$ begin
  create policy "Sender or admin can delete messages"
    on public.messages
    for delete
    to authenticated
    using (sender_id = auth.uid() or public.has_role(auth.uid(),'admin'));
exception when duplicate_object then null end $$;

-- =========================
-- REVIEWS
-- =========================
create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles(id) on delete cascade,
  subject_id uuid not null references public.profiles(id) on delete cascade,
  rating int not null check (rating between 1 and 5),
  comment text,
  created_at timestamptz not null default now(),
  unique (author_id, subject_id)
);
alter table public.reviews enable row level security;

-- Public can read reviews
do $$ begin
  create policy "Anyone can read reviews"
    on public.reviews
    for select
    to anon, authenticated
    using (true);
exception when duplicate_object then null end $$;

-- Authenticated user can write a review about others (not themselves)
do $$ begin
  create policy "User can write a review"
    on public.reviews
    for insert
    to authenticated
    with check (author_id = auth.uid() and subject_id <> auth.uid());
exception when duplicate_object then null end $$;

-- Author can update/delete their review; admin can delete
do $$ begin
  create policy "Author can update review"
    on public.reviews
    for update
    to authenticated
    using (author_id = auth.uid())
    with check (author_id = auth.uid());
exception when duplicate_object then null end $$;

do $$ begin
  create policy "Author or admin can delete review"
    on public.reviews
    for delete
    to authenticated
    using (author_id = auth.uid() or public.has_role(auth.uid(),'admin'));
exception when duplicate_object then null end $$;

-- =========================
-- OPTIONAL: simple indexes for performance
-- =========================
create index if not exists annonces_status_idx on public.annonces (status);
create index if not exists annonces_location_idx on public.annonces (location);
create index if not exists applications_status_idx on public.applications (status);
create index if not exists messages_conversation_id_idx on public.messages (conversation_id);
