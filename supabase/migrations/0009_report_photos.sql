-- Public bucket for water-outage photos uploaded with reports.
-- Anonymous uploads + public read, no overwrites or deletes.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'report-photos',
  'report-photos',
  true,
  2097152, -- 2 MB safety net (client compresses to ~500 KB)
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

-- Anon can upload to this bucket.
drop policy if exists "report_photos_insert" on storage.objects;
create policy "report_photos_insert"
  on storage.objects for insert
  to anon, authenticated
  with check (bucket_id = 'report-photos');

-- Anyone can read (the bucket is also marked public above so URLs work).
drop policy if exists "report_photos_select" on storage.objects;
create policy "report_photos_select"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'report-photos');
