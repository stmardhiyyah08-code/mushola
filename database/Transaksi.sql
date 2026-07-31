create policy "upload transaksi"

on storage.objects

for insert

with check

(
bucket_id='dokumen-masjid'
);