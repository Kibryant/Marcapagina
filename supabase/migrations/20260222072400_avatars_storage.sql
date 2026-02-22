-- =========================================================
-- Marcapagina - Storage Bucket for Profile Pictures (Avatars)
-- Cole no Supabase SQL Editor e execute.
-- =========================================================

-- Create a bucket for avatars
insert into storage.buckets (id, name, public) 
values ('avatars', 'avatars', true) 
on conflict (id) do nothing;

-- Ensure RLS is enabled on storage.objects
alter table storage.objects enable row level security;

-- Policy: Allow public access to view avatars
create policy "Avatar images are publicly accessible."
  on storage.objects for select
  using ( bucket_id = 'avatars' );

-- Policy: Allow authenticated users to upload new avatars
create policy "Users can upload their own avatars."
  on storage.objects for insert
  with check ( 
    bucket_id = 'avatars' and 
    auth.uid() = owner 
  );

-- Policy: Allow users to update their own avatars
create policy "Users can update their own avatars."
  on storage.objects for update
  using ( 
    bucket_id = 'avatars' and 
    auth.uid() = owner 
  );

-- Policy: Allow users to delete their own avatars
create policy "Users can delete their own avatars."
  on storage.objects for delete
  using ( 
    bucket_id = 'avatars' and 
    auth.uid() = owner 
  );
