-- Ensure ad-assets bucket exists and is public
insert into storage.buckets (id, name, public)
values ('ad-assets', 'ad-assets', true)
on conflict (id) do nothing;

-- Allow public read access to ad-assets
do $$
begin
  if not exists (
    select 1 from pg_policies 
    where schemaname = 'storage' and tablename = 'objects' and policyname = 'Public can read ad-assets'
  ) then
    create policy "Public can read ad-assets"
    on storage.objects for select
    using (bucket_id = 'ad-assets');
  end if;
end $$;

-- Allow admins to manage files in ad-assets
do $$
begin
  if not exists (
    select 1 from pg_policies 
    where schemaname = 'storage' and tablename = 'objects' and policyname = 'Admins can manage ad-assets'
  ) then
    create policy "Admins can manage ad-assets"
    on storage.objects for all
    using (bucket_id = 'ad-assets' and public.has_role(auth.uid(), 'admin'))
    with check (bucket_id = 'ad-assets' and public.has_role(auth.uid(), 'admin'));
  end if;
end $$;
