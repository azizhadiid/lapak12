-- Hapus Hati-hati
-- Drop semua tabel di schema public
drop schema public cascade;

-- Buat ulang schema public kosong
create schema public;

-- Kasih akses default ke public
grant usage on schema public to postgres, authenticated, anon;

-- Set default privileges
alter default privileges in schema public grant all on tables to postgres, authenticated, anon;
alter default privileges in schema public grant all on sequences to postgres, authenticated, anon;
alter default privileges in schema public grant all on functions to postgres, authenticated, anon;

- Hapus trigger & function di auth
drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user();

select users from information_schema.tables where table_schema = 'public';

delete from auth.users;

-- /////////////////////////////////////////////////////////////////////////////////
-- Bagian Users
-- 1. Buat tabel users
create table if not exists public.users (
  id uuid references auth.users(id) on delete cascade primary key,
  username text not null,
  email text unique not null,
  role text default 'pembeli',
  created_at timestamp with time zone default now()
);

-- 2. Buat fungsi handle_new_user
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public, auth
as $$
begin
  insert into public.users (id, username, email, role)
  values (
    new.id,
    new.raw_user_meta_data ->> 'username',
    new.email,
    coalesce(new.raw_user_meta_data ->> 'role', 'pembeli')
  );
  return new;
end;
$$;

-- 3. Buat trigger
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

-- 4. Tambah index
create index if not exists users_email_idx on public.users (email);
create index if not exists users_role_idx on public.users (role);
-- /////////////////////////////////////////////////////////////////////////////////////

-- /////////////////////////////////////////////////////////////////////////////////
-- Bagian Produk
-- /////////////////////////////////////////////////////////////////////////////////
-- 1. Buat ulang tabel 'produk'
CREATE TABLE IF NOT EXISTS public.produk (
    -- Primary Key untuk tabel produk
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,

    -- Foreign Key BARU yang menghubungkan ke tabel 'profile_penjual'
    -- Ini adalah relasi intinya.
    -- 'on delete cascade' berarti: jika profile_penjual dihapus, semua produknya juga ikut terhapus.
    penjual_id uuid REFERENCES public.profile_penjual(id) ON DELETE CASCADE NOT NULL,

    -- Kolom data produk
    nama_produk TEXT NOT NULL,
    jenis_produk TEXT, -- Nama kolom sudah diubah di skema awal Anda
    deskripsi TEXT,
    keunggulan_produk TEXT,
    stok INT DEFAULT 0 CHECK (stok >= 0),
    harga NUMERIC(10, 2) DEFAULT 0 CHECK (harga >= 0), -- Menggunakan NUMERIC seperti skema akhir Anda
    gambar TEXT, -- Ini akan berisi URL ke file di Supabase Storage

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Tambahkan index untuk optimasi JOIN
CREATE INDEX IF NOT EXISTS produk_penjual_id_idx ON public.produk (penjual_id);

-- 3. Terapkan trigger untuk auto-update 'updated_at' (menggunakan fungsi yang sudah ada)
CREATE TRIGGER on_barang_updated
BEFORE UPDATE ON public.produk
FOR EACH ROW
EXECUTE PROCEDURE public.handle_updated_at();

-- RLS Produk
-- 1. Aktifkan Row Level Security (RLS)
ALTER TABLE public.produk ENABLE ROW LEVEL SECURITY;

-- 2. Kebijakan untuk MELIHAT (SELECT)
CREATE POLICY "Semua user authenticated bisa melihat produk"
ON public.produk
FOR SELECT
USING (
  auth.uid() IS NOT NULL
);

-- 3. Kebijakan untuk MEMBUAT (INSERT)
CREATE POLICY "Penjual bisa MEMBUAT produk sendiri"
ON public.produk
FOR INSERT
WITH CHECK (
 auth.uid() = penjual_id AND
 public.get_my_role() = 'penjual' AND
 EXISTS (SELECT 1 FROM public.profile_penjual WHERE id = auth.uid()) -- Tambahan cek agar lebih aman
);

-- 4. Kebijakan untuk MENGUPDATE (UPDATE)
CREATE POLICY "Penjual bisa MENGUPDATE produk sendiri"
ON public.produk
FOR UPDATE
USING (
 auth.uid() = penjual_id AND
 public.get_my_role() = 'penjual'
)
WITH CHECK (
 auth.uid() = penjual_id
);

-- 5. Kebijakan untuk MENGHAPUS (DELETE)
CREATE POLICY "Penjual bisa MENGHAPUS produk sendiri"
ON public.produk
FOR DELETE
USING (
 auth.uid() = penjual_id AND
 public.get_my_role() = 'penjual'
);

-- 6. Kebijakan INSERT (Upload File)
CREATE POLICY "Penjual bisa upload produk gambar"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  -- Memastikan bucket_id benar
  (bucket_id = 'product-images') AND 
  -- Memastikan user ID cocok dengan folder produk di path products/user_id/file.ext
  -- Casting dilakukan pada hasil split_part untuk dicocokkan dengan auth.uid() (UUID)
  (split_part(name, '/', 2)::uuid = auth.uid())
);

-- 7. Policy SELECT (Melihat File) - Optional jika Anda ingin membatasi, tapi umumnya dibuat publik
DROP POLICY IF EXISTS "Semua user authenticated bisa melihat produk" ON storage.objects;

CREATE POLICY "Semua bisa melihat gambar produk"
ON storage.objects
FOR SELECT
TO public -- Gunakan public jika ingin diakses tanpa login
USING (
  (bucket_id = 'product-images')
);

/////////////////////////////////////////////////////////////////////////////////////////////////


-- /////////////////////////////////////////////////////////////////////////////////
-- Bagian Profile Penjual (Toko)
-- /////////////////////////////////////////////////////////////////////////////////

-- 1. Buat tabel 'profile_penjual'
CREATE TABLE IF NOT EXISTS public.profile_penjual (
    -- KUNCI 1-ke-1:
    -- 'id' ini adalah Primary Key DAN Foreign Key.
    -- Ini memaksa bahwa 'id' user hanya bisa muncul satu kali di tabel ini.
    id uuid PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
    
    -- Kolom dari form Anda
    foto_url TEXT,
    store_name TEXT,
    owner_name TEXT,
    phone TEXT,
    address TEXT,
    description TEXT,
    status boolean DEFAULT false NOT NULL,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Buat trigger 'updated_at' (Fungsi ini mungkin sudah ada dari tabel 'produk')
-- Anda hanya perlu 'CREATE OR REPLACE FUNCTION' satu kali per database
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Terapkan trigger ke tabel 'profile_penjual'
CREATE TRIGGER on_profile_penjual_updated
BEFORE UPDATE ON public.profile_penjual
FOR EACH ROW
EXECUTE PROCEDURE public.handle_updated_at();

-- 3. (PENTING) Aktifkan Row Level Security (RLS)
ALTER TABLE public.profile_penjual ENABLE ROW LEVEL SECURITY;

/////////////////////////////////////////////////////////////////
Polisi Profile profile_penjual
/////////////////////////////////////////////////////////////////
CREATE POLICY "Penjual bisa MELIHAT profil toko sendiri"
ON public.profile_penjual
FOR SELECT
USING (
  -- Cek 1: Apakah ID user cocok dengan baris data?
  auth.uid() = id AND
  -- Cek 2: Apakah role user adalah 'penjual'?
  public.get_my_role() = 'penjual'
);

CREATE POLICY "Penjual bisa MEMBUAT profil toko sendiri"
ON public.profile_penjual
FOR INSERT
WITH CHECK (
  auth.uid() = id AND
  public.get_my_role() = 'penjual'
);

CREATE POLICY "Penjual bisa MENGUPDATE profil toko sendiri"
ON public.profile_penjual
FOR UPDATE
USING (
  auth.uid() = id AND
  public.get_my_role() = 'penjual'
);
/////////////////////////////////////////////////////////////////////////////////////////////////

/////////////////////////////////////////////////////////////////////////////////////////////
-- Read Dashboard admin

-- ///RLS ADMIN DASHBOARD
SELECT auth.uid() AS user_id, public.get_my_role();

-- 1. Buat fungsi untuk mengupdate status pengguna
CREATE OR REPLACE FUNCTION public.update_user_status(
    p_user_id UUID,
    p_role TEXT,
    p_new_status TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER -- PENTING: Menjalankan fungsi dengan hak akses tertinggi (bypass RLS)
AS $$
DECLARE
    target_table TEXT;
    status_value BOOLEAN;
BEGIN
    -- Tentukan tabel dan nilai boolean (Sesuai logika Anda)
    IF p_role = 'pembeli' THEN
        target_table := 'profile_pembeli';
        -- Pembeli: 'good' = TRUE, 'bad' = FALSE
        status_value := (p_new_status = 'good');
    ELSIF p_role = 'penjual' THEN
        target_table := 'profile_penjual';
        -- Penjual: 'good' = FALSE, 'bad' = TRUE
        status_value := (p_new_status != 'good');
    ELSE
        RAISE EXCEPTION 'Role tidak valid: %', p_role;
    END IF;

    -- Lakukan update dinamis (bypass RLS karena SECURITY DEFINER)
    EXECUTE format('
        UPDATE public.%I
        SET status = %L, updated_at = now()
        WHERE id = %L;
    ', target_table, status_value, p_user_id);

END;
$$;

-- 2. Berikan hak eksekusi kepada pengguna yang telah terautentikasi (authenticated)
GRANT EXECUTE ON FUNCTION public.update_user_status(uuid, text, text) TO authenticated;

CREATE POLICY "Admin bisa UPDATE semua profil pembeli"
ON public.profile_pembeli
FOR UPDATE
USING (
  public.get_my_role() = 'admin'
)
WITH CHECK (
  public.get_my_role() = 'admin'
);

CREATE POLICY "Admin bisa UPDATE semua profil penjual"
ON public.profile_penjual
FOR UPDATE
USING (
  public.get_my_role() = 'admin'
)
WITH CHECK (
  public.get_my_role() = 'admin'
);

-- Contoh Konsep VIEW untuk menggabungkan data Pembeli dan Penjual
-- (Ini harus dikerjakan di editor SQL Supabase)

CREATE VIEW public.admin_dashboard_users AS
SELECT
    u.id,
    u.username,
    u.email,
    u.role,
    u.created_at AS join_date,
    -- Logika Status Pembeli
    CASE
        WHEN u.role = 'pembeli' AND pp.id IS NOT NULL THEN
            CASE
                WHEN pp.status = TRUE THEN 'good'
                ELSE 'bad'
            END
        -- Logika Status Penjual
        WHEN u.role = 'penjual' AND ps.id IS NOT NULL THEN
            CASE
                WHEN ps.status = FALSE THEN 'good' -- Status Baik = FALSE
                ELSE 'bad'                       -- Status Buruk = TRUE
            END
        ELSE 'neutral'
    END AS status
    -- Kolom lain yang diperlukan
FROM
    public.users u
LEFT JOIN
    public.profile_pembeli pp ON u.id = pp.id AND u.role = 'pembeli'
LEFT JOIN
    public.profile_penjual ps ON u.id = ps.id AND u.role = 'penjual';
////////////////////////////////////////////////////////////////////////////


-- /////////////////////////////////////////////////////////////////////////////////
-- Bagian Profile Pembeli
-- /////////////////////////////////////////////////////////////////////////////////

CREATE TABLE IF NOT EXISTS public.profile_pembeli (
    -- KUNCI 1-ke-1:
    -- 'id' adalah Primary Key DAN Foreign Key ke tabel users
    id uuid PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
    
    -- Kolom untuk data profil pembeli
    full_name TEXT,               -- Nama lengkap pembeli
    foto_url TEXT,                -- Foto profil
    phone TEXT,                   -- Nomor telepon pembeli
    gender TEXT CHECK (gender IN ('laki-laki', 'perempuan')), -- Jenis kelamin
    birth_date DATE,              -- Tanggal lahir
    address TEXT,                 -- Alamat utama
    preferences TEXT,             -- Preferensi belanja atau minat
    status BOOLEAN DEFAULT true NOT NULL,  -- Status aktif
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- /////////////////////////////////////////////////////////////////////////////////
-- Trigger untuk auto-update kolom updated_at setiap kali data berubah
-- (gunakan fungsi yang sudah ada jika kamu sudah buat sebelumnya)
-- /////////////////////////////////////////////////////////////////////////////////

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_profile_pembeli_updated
BEFORE UPDATE ON public.profile_pembeli
FOR EACH ROW
EXECUTE PROCEDURE public.handle_updated_at();

-- /////////////////////////////////////////////////////////////////////////////////
-- Polisi Profile profile_pembeli
-- Fungsi ini akan mengambil 'role' dari tabel 'users'
-- berdasarkan ID user yang sedang login (auth.uid())
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER -- PENTING! Agar bisa membaca tabel 'users'
SET search_path = public
AS $$
DECLARE
  user_role TEXT;
BEGIN
  SELECT role INTO user_role
  FROM public.users
  WHERE id = auth.uid();
  RETURN user_role;
END;
$$;

ALTER TABLE public.profile_pembeli
ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Pembeli bisa MELIHAT profil sendiri"
ON public.profile_pembeli
FOR SELECT
USING (
  -- Cek 1: Apakah user ID-nya cocok dengan baris data?
  auth.uid() = id AND
  -- Cek 2: Apakah role user adalah 'pembeli'?
  public.get_my_role() = 'pembeli'
);

CREATE POLICY "Pembeli bisa MEMBUAT profil sendiri"
ON public.profile_pembeli
FOR INSERT
WITH CHECK (
  auth.uid() = id AND
  public.get_my_role() = 'pembeli'
);

CREATE POLICY "Pembeli bisa MENGUPDATE profil sendiri"
ON public.profile_pembeli
FOR UPDATE
USING (
  -- Kondisi 'USING' untuk baris mana yang boleh di-update
  auth.uid() = id AND
  public.get_my_role() = 'pembeli'
)
WITH CHECK (
  -- Kondisi 'WITH CHECK' untuk data baru yang masuk
  auth.uid() = id
);

-- /////////////////////////////////////////////////////////////////////////////////
-- End Profile profile_pembeli
-- /////////////////////////////////////////////////////////////////////////////////

-- /////////////////////////////////////////////////////////////////////////////////
-- Bagian Pencatatan Penjual
-- /////////////////////////////////////////////////////////////////////////////////
-- Tabel Pencatatan
CREATE TABLE IF NOT EXISTS public.penjualan (
    id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    
    -- Kunci Asing (Foreign Key) yang berelasi dengan tabel users
    -- Ini adalah ID dari user yang login (penjual/pencatat)
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,

    -- Kolom dari form Anda
    tanggal DATE NOT NULL,
    kategori TEXT NOT NULL,
    nama_produk TEXT NOT NULL,
    jumlah INTEGER NOT NULL CHECK (jumlah > 0),
    harga_satuan NUMERIC NOT NULL CHECK (harga_satuan >= 0),
    total_harga NUMERIC NOT NULL CHECK (total_harga >= 0),
    nama_pembeli TEXT NOT NULL,
    metode_pembayaran TEXT NOT NULL,

    -- Timestamp
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- PENTING: Selalu aktifkan RLS di Supabase
ALTER TABLE public.penjualan ENABLE ROW LEVEL SECURITY;

-- /////////////////////////////////////////////////////////////////////////////////
-- End Pencatatan Penjual
-- /////////////////////////////////////////////////////////////////////////////////