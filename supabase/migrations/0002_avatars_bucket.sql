-- Avatars bucket for user profile pictures
-- Path convention: {user_id}/avatar.{ext}
-- Private bucket — access via signed URLs only

insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', false)
on conflict (id) do nothing;

-- SELECT: user can read their own avatar
drop policy if exists "avatars_owner_select" on storage.objects;
create policy "avatars_owner_select" on storage.objects
  for select using (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- INSERT: user can upload into their own folder
drop policy if exists "avatars_owner_insert" on storage.objects;
create policy "avatars_owner_insert" on storage.objects
  for insert with check (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- UPDATE: required for upsert (replacing an existing avatar)
drop policy if exists "avatars_owner_update" on storage.objects;
create policy "avatars_owner_update" on storage.objects
  for update using (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- DELETE: user can remove their own avatar
drop policy if exists "avatars_owner_delete" on storage.objects;
create policy "avatars_owner_delete" on storage.objects
  for delete using (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
