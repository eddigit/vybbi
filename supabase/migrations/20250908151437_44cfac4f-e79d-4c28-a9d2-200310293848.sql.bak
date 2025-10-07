
-- 1) Enrichir les enums et renommer venue -> lieu
do $$ begin
  alter type public.profile_type rename value 'venue' to 'lieu';
exception when undefined_object then null end $$;

do $$ begin
  alter type public.app_role rename value 'venue' to 'lieu';
exception when undefined_object then null end $$;

do $$ begin
  alter type public.app_role add value 'manager';
exception when duplicate_object then null end $$;

do $$ begin
  alter type public.profile_type add value 'manager';
exception when duplicate_object then null end $$;

-- 2) Mettre à jour la policy de création d'annonces (autoriser lieu/agent/manager)
drop policy if exists "Venue/Agent can create annonces" on public.annonces;

create policy "Lieu/Agent/Manager can create annonces"
  on public.annonces
  for insert
  to authenticated
  with check (
    posted_by = auth.uid()
    and (
      public.has_role(auth.uid(),'lieu')
      or public.has_role(auth.uid(),'agent')
      or public.has_role(auth.uid(),'manager')
    )
  );

-- 3) manager_artists: relation Manager <-> Artiste
create table if not exists public.manager_artists (
  id uuid primary key default gen_random_uuid(),
  manager_id uuid not null references public.profiles(id) on delete cascade,
  artist_id uuid not null references public.profiles(id) on delete cascade,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  unique (manager_id, artist_id)
);

-- Validation: manager_id doit être de type 'manager' et artist_id 'artist'
create or replace function public.validate_manager_artist_types()
returns trigger
language plpgsql
as $$
declare
  m_type public.profile_type;
  a_type public.profile_type;
begin
  select profile_type into m_type from public.profiles where id = new.manager_id;
  select profile_type into a_type from public.profiles where id = new.artist_id;

  if m_type is distinct from 'manager' then
    raise exception 'manager_id must reference a profile with type=manager';
  end if;
  if a_type is distinct from 'artist' then
    raise exception 'artist_id must reference a profile with type=artist';
  end if;

  return new;
end;
$$;

drop trigger if exists manager_artists_validate_types on public.manager_artists;
create trigger manager_artists_validate_types
before insert or update on public.manager_artists
for each row execute function public.validate_manager_artist_types();

-- Contrainte: max 1 manager actif par artiste
create unique index if not exists manager_artists_one_active_per_artist
  on public.manager_artists(artist_id)
  where (status = 'active');

alter table public.manager_artists enable row level security;

-- Lecture publique (affichage manager sur page artiste)
do $$ begin
  create policy "Anyone can read manager rosters"
    on public.manager_artists
    for select
    to anon, authenticated
    using (true);
exception when duplicate_object then null end $$;

-- Seul le manager gère son roster
do $$ begin
  create policy "Manager can manage their roster"
    on public.manager_artists
    for all
    to authenticated
    using (manager_id = auth.uid())
    with check (manager_id = auth.uid());
exception when duplicate_object then null end $$;

-- 4) EVENTS (événements créés par les lieux)
do $$ begin
  create type public.event_status as enum ('draft','published','cancelled');
exception when duplicate_object then null end $$;

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  host_lieu_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  description text,
  start_at timestamptz not null,
  end_at timestamptz,
  status public.event_status not null default 'published',
  created_by uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.validate_event_types()
returns trigger
language plpgsql
as $$
declare
  host_type public.profile_type;
begin
  select profile_type into host_type from public.profiles where id = new.host_lieu_id;
  if host_type is distinct from 'lieu' then
    raise exception 'host_lieu_id must reference a profile with type=lieu';
  end if;
  return new;
end;
$$;

drop trigger if exists events_validate_types on public.events;
create trigger events_validate_types
before insert or update on public.events
for each row execute function public.validate_event_types();

create trigger events_set_updated_at
before update on public.events
for each row execute function public.set_updated_at();

alter table public.events enable row level security;

-- Lecture publique des événements publiés
do $$ begin
  create policy "Anyone can read published events"
    on public.events
    for select
    to anon, authenticated
    using (status = 'published');
exception when duplicate_object then null end $$;

-- Propriétaire (lieu) ou créateur: lecture/gestion
do $$ begin
  create policy "Owner can read own events"
    on public.events
    for select
    to authenticated
    using (host_lieu_id = auth.uid() or created_by = auth.uid());
exception when duplicate_object then null end $$;

do $$ begin
  create policy "Lieu owner can create events"
    on public.events
    for insert
    to authenticated
    with check (
      created_by = auth.uid()
      and host_lieu_id = auth.uid()
      and public.has_role(auth.uid(),'lieu')
    );
exception when duplicate_object then null end $$;

do $$ begin
  create policy "Owner or admin can update events"
    on public.events
    for update
    to authenticated
    using (host_lieu_id = auth.uid() or created_by = auth.uid() or public.has_role(auth.uid(),'admin'))
    with check (host_lieu_id = auth.uid() or created_by = auth.uid() or public.has_role(auth.uid(),'admin'));
exception when duplicate_object then null end $$;

do $$ begin
  create policy "Owner or admin can delete events"
    on public.events
    for delete
    to authenticated
    using (host_lieu_id = auth.uid() or created_by = auth.uid() or public.has_role(auth.uid(),'admin'));
exception when duplicate_object then null end $$;

-- 5) BOOKINGS (Artiste booké sur un événement)
do $$ begin
  create type public.booking_status as enum ('draft','proposed','confirmed','cancelled','completed');
exception when duplicate_object then null end $$;

create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  artist_id uuid not null references public.profiles(id) on delete cascade,
  facilitated_by uuid references public.profiles(id) on delete set null,
  status public.booking_status not null default 'proposed',
  fee_cents int,
  currency char(3) not null default 'EUR',
  start_at timestamptz,
  end_at timestamptz,
  created_by uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now()
);

create or replace function public.validate_booking_types()
returns trigger
language plpgsql
as $$
declare
  a_type public.profile_type;
begin
  select profile_type into a_type from public.profiles where id = new.artist_id;
  if a_type is distinct from 'artist' then
    raise exception 'artist_id must reference a profile with type=artist';
  end if;
  return new;
end;
$$;

drop trigger if exists bookings_validate_types on public.bookings;
create trigger bookings_validate_types
before insert or update on public.bookings
for each row execute function public.validate_booking_types();

alter table public.bookings enable row level security;

-- Lecture: artiste, lieu hôte de l'event, créateur, agent/manager actif de l'artiste
do $$ begin
  create policy "Stakeholders can read bookings"
    on public.bookings
    for select
    to authenticated
    using (
      artist_id = auth.uid()
      or created_by = auth.uid()
      or exists (
        select 1 from public.events e
        where e.id = bookings.event_id and e.host_lieu_id = auth.uid()
      )
      or exists (
        select 1 from public.agent_artists aa
        where aa.artist_id = bookings.artist_id
          and aa.agent_id = auth.uid()
          and aa.status = 'active'
      )
      or exists (
        select 1 from public.manager_artists ma
        where ma.artist_id = bookings.artist_id
          and ma.manager_id = auth.uid()
          and ma.status = 'active'
      )
    );
exception when duplicate_object then null end $$;

-- Création: lieu hôte, artiste lui-même, agent ou manager actif
do $$ begin
  create policy "Stakeholders can create bookings"
    on public.bookings
    for insert
    to authenticated
    with check (
      created_by = auth.uid()
      and (
        artist_id = auth.uid()
        or exists (select 1 from public.events e where e.id = bookings.event_id and e.host_lieu_id = auth.uid())
        or exists (select 1 from public.agent_artists aa where aa.artist_id = bookings.artist_id and aa.agent_id = auth.uid() and aa.status='active')
        or exists (select 1 from public.manager_artists ma where ma.artist_id = bookings.artist_id and ma.manager_id = auth.uid() and ma.status='active')
      )
    );
exception when duplicate_object then null end $$;

-- Mise à jour: mêmes parties + admin
do $$ begin
  create policy "Stakeholders can update bookings"
    on public.bookings
    for update
    to authenticated
    using (
      artist_id = auth.uid()
      or created_by = auth.uid()
      or exists (select 1 from public.events e where e.id = bookings.event_id and e.host_lieu_id = auth.uid())
      or public.has_role(auth.uid(),'admin')
    )
    with check (
      artist_id = auth.uid()
      or created_by = auth.uid()
      or exists (select 1 from public.events e where e.id = bookings.event_id and e.host_lieu_id = auth.uid())
      or public.has_role(auth.uid(),'admin')
    );
exception when duplicate_object then null end $$;

-- Suppression: artistes, hôte, créateur, admin
do $$ begin
  create policy "Stakeholders can delete bookings"
    on public.bookings
    for delete
    to authenticated
    using (
      artist_id = auth.uid()
      or exists (select 1 from public.events e where e.id = bookings.event_id and e.host_lieu_id = auth.uid())
      or created_by = auth.uid()
      or public.has_role(auth.uid(),'admin')
    );
exception when duplicate_object then null end $$;

-- 6) Disponibilités simples (agenda artiste)
do $$ begin
  create type public.availability_status as enum ('available','unavailable','tentative');
exception when duplicate_object then null end $$;

create table if not exists public.availability_slots (
  id uuid primary key default gen_random_uuid(),
  artist_id uuid not null references public.profiles(id) on delete cascade,
  start_at timestamptz not null,
  end_at timestamptz not null,
  status public.availability_status not null default 'available',
  is_public boolean not null default false,
  note text,
  created_at timestamptz not null default now()
);

create or replace function public.validate_availability_artist_type()
returns trigger
language plpgsql
as $$
declare
  a_type public.profile_type;
begin
  select profile_type into a_type from public.profiles where id = new.artist_id;
  if a_type is distinct from 'artist' then
    raise exception 'artist_id must reference a profile with type=artist';
  end if;
  return new;
end;
$$;

drop trigger if exists availability_validate_types on public.availability_slots;
create trigger availability_validate_types
before insert or update on public.availability_slots
for each row execute function public.validate_availability_artist_type();

alter table public.availability_slots enable row level security;

-- Lecture publique si is_public = true
do $$ begin
  create policy "Public can read public availability"
    on public.availability_slots
    for select
    to anon, authenticated
    using (is_public = true);
exception when duplicate_object then null end $$;

-- L'artiste voit/édite ses propres slots
do $$ begin
  create policy "Artist can read own availability"
    on public.availability_slots
    for select
    to authenticated
    using (artist_id = auth.uid());
exception when duplicate_object then null end $$;

do $$ begin
  create policy "Artist can manage own availability"
    on public.availability_slots
    for all
    to authenticated
    using (artist_id = auth.uid())
    with check (artist_id = auth.uid());
exception when duplicate_object then null end $$;

-- 7) Index utiles
create index if not exists events_host_idx on public.events(host_lieu_id);
create index if not exists events_status_idx on public.events(status);
create index if not exists bookings_event_idx on public.bookings(event_id);
create index if not exists bookings_artist_idx on public.bookings(artist_id);
