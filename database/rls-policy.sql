-- ==========================
-- ENABLE RLS
-- ==========================

alter table profiles enable row level security;

alter table transaksi enable row level security;

alter table kategori enable row level security;

alter table donatur enable row level security;

alter table program enable row level security;



-- ==========================
-- PROFILE POLICY
-- ==========================


create policy
"profile sendiri"

on profiles

for select

using
(
auth.uid() = id
);



-- ==========================
-- TRANSAKSI
-- ==========================


create policy
"lihat transaksi"

on transaksi

for select

using
(true);



create policy
"input transaksi"

on transaksi

for insert

with check
(
exists(

select 1

from profiles

where id=auth.uid()

and role in
(
'admin',
'bendahara'
)

)

);



create policy
"ubah transaksi"

on transaksi

for update

using
(
exists(

select 1

from profiles

where id=auth.uid()

and role in
(
'admin',
'bendahara'
)

)

);



-- ==========================
-- PROGRAM
-- ==========================


create policy
"program publik"

on program

for select

using(true);



-- ==========================
-- KATEGORI
-- ==========================


create policy
"kategori publik"

on kategori

for select

using(true);