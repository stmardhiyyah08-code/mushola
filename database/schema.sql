-- ======================================
-- SIMAS MASJID DATABASE
-- SUPABASE POSTGRESQL
-- ======================================


create extension if not exists "uuid-ossp";


-- ==========================
-- DATA MASJID
-- ==========================

create table masjid (

id uuid primary key default uuid_generate_v4(),

nama varchar(150) not null,

alamat text,

telepon varchar(30),

logo_url text,

created_at timestamp default now()

);



-- ==========================
-- USER PROFILE
-- ==========================

create table profiles (

id uuid primary key references auth.users(id)
on delete cascade,

nama varchar(100),

email varchar(150),

role varchar(30)
default 'jamaah',

created_at timestamp default now()

);



-- ==========================
-- KATEGORI TRANSAKSI
-- ==========================

create table kategori (

id uuid primary key default uuid_generate_v4(),

nama varchar(100) not null,

tipe varchar(20) not null,

created_at timestamp default now()

);



-- ==========================
-- TRANSAKSI KEUANGAN
-- ==========================

create table transaksi (

id uuid primary key default uuid_generate_v4(),

tanggal date not null,

jenis varchar(20) not null,

kategori_id uuid references kategori(id),

nominal bigint not null,

keterangan text,

bukti_url text,

created_by uuid references profiles(id),

created_at timestamp default now()

);



-- ==========================
-- DONATUR
-- ==========================

create table donatur (

id uuid primary key default uuid_generate_v4(),

nama varchar(100),

telepon varchar(30),

alamat text,

created_at timestamp default now()

);



-- ==========================
-- DONASI
-- ==========================

create table donasi (

id uuid primary key default uuid_generate_v4(),

donatur_id uuid references donatur(id),

transaksi_id uuid references transaksi(id),

program varchar(150),

jumlah bigint,

tanggal date,

created_at timestamp default now()

);



-- ==========================
-- PROGRAM MASJID
-- ==========================

create table program (

id uuid primary key default uuid_generate_v4(),

nama varchar(150),

deskripsi text,

target bigint default 0,

terkumpul bigint default 0,

status varchar(30)
default 'aktif',

created_at timestamp default now()

);



-- ==========================
-- AUDIT LOG
-- ==========================

create table audit_log (

id uuid primary key default uuid_generate_v4(),

user_id uuid references profiles(id),

aktivitas text,

ip_address varchar(50),

created_at timestamp default now()

);