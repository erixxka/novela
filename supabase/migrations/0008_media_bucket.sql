-- Media bucket for song / movie cover art uploads
-- Path convention: {user_id}/{kind}/{timestamp}.{ext}  (kind = 'songs' | 'movies')
-- Private bucket — access via signed URLs only

insert into storage.buckets (id, name, public)
values ('media', 'media', false)
on conflict (id) do nothing;

-- SELECT: user can read files inside their own folder
drop policy if exists "media_owner_select" on storage.objects;
create policy "media_owner_select" on storage.objects
  for select using (
    bucket_id = 'media'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- INSERT: user can upload into their own folder
drop policy if exists "media_owner_insert" on storage.objects;
create policy "media_owner_insert" on storage.objects
  for insert with check (
    bucket_id = 'media'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- UPDATE: required for any re-uploads
drop policy if exists "media_owner_update" on storage.objects;
create policy "media_owner_update" on storage.objects
  for update using (
    bucket_id = 'media'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- DELETE: user can remove their own media files
drop policy if exists "media_owner_delete" on storage.objects;
create policy "media_owner_delete" on storage.objects
  for delete using (
    bucket_id = 'media'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
