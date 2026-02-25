-- Allow authenticated users to upload group icons to avatars bucket under groups/ prefix
create policy "group_icons_upload"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = 'groups'
);

-- Allow authenticated users to update (upsert) group icons
create policy "group_icons_update"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = 'groups'
);

-- Allow public read of group icons (same as other avatars)
create policy "group_icons_read"
on storage.objects
for select
to public
using (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = 'groups'
);
