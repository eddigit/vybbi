-- Test migration with just ENUMs
do $$ begin
  create type public.app_role as enum ('admin','artist','agent','venue');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.profile_type as enum ('artist','agent','venue');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.annonce_status as enum ('draft','open','closed');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.application_status as enum ('pending','accepted','rejected','withdrawn');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.media_type as enum ('image','video','audio','doc');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.conversation_type as enum ('direct','group');
exception when duplicate_object then null; end $$;