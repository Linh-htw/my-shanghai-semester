-- Run this file once in the Supabase SQL Editor.
-- It creates a publicly viewable archive. Only authenticated users can upload.

create table if not exists public.photos (
  id uuid primary key default gen_random_uuid(),
  date date not null,
  place text not null check (char_length(place) <= 120),
  category text not null check (char_length(category) <= 60),
  caption text not null check (char_length(caption) <= 1000),
  image_path text not null unique,
  created_at timestamptz not null default now()
);

alter table public.photos enable row level security;

create policy "Anyone can view the archive"
  on public.photos for select using (true);

create policy "Authenticated users can add photos"
  on public.photos for insert to authenticated with check (true);

create policy "Authenticated users can edit photos"
  on public.photos for update to authenticated using (true) with check (true);

create policy "Authenticated users can remove photos"
  on public.photos for delete to authenticated using (true);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('photos', 'photos', true, 10485760, array['image/jpeg', 'image/png', 'image/webp', 'image/heic'])
on conflict (id) do update set public = true, file_size_limit = 10485760,
  allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp', 'image/heic'];

create policy "Anyone can view photos"
  on storage.objects for select using (bucket_id = 'photos');

create policy "Authenticated users can upload photos"
  on storage.objects for insert to authenticated with check (bucket_id = 'photos');

create policy "Authenticated users can update photos"
  on storage.objects for update to authenticated using (bucket_id = 'photos') with check (bucket_id = 'photos');

create policy "Authenticated users can delete photos"
  on storage.objects for delete to authenticated using (bucket_id = 'photos');
