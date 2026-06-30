-- ============================================================
-- ЦЭНХЭР ТЕХ – Supabase Database Schema
-- Supabase Dashboard → SQL Editor → "New query" дотор оруул
-- ============================================================

-- ── Хэрэглэгчийн нэмэлт мэдээлэл (auth.users-г өргөтгөнө) ──
create table if not exists public.user_profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  name       text not null default '',
  created_at timestamptz default now()
);

-- Шинэ хэрэглэгч бүртгүүлэхэд автоматаар profile үүсгэх trigger
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.user_profiles (id, name)
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data->>'full_name',
      new.raw_user_meta_data->>'name',
      ''
    )
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ── Row Level Security ──
alter table public.user_profiles enable row level security;

-- Хэрэглэгч өөрийн profile-г унших, засах эрхтэй
create policy "Users can view own profile"
  on public.user_profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.user_profiles for update
  using (auth.uid() = id);

-- ── Захиалгууд (orders) ──
create table if not exists public.orders (
  id                   text primary key,
  created_at           timestamptz default now(),
  customer_full_name   text not null,
  customer_phone       text not null,
  customer_district    text not null,
  customer_address     text not null,
  payment              text not null,
  items                jsonb not null default '[]',
  total                numeric not null,
  status               text not null default 'new',
  user_id              uuid references auth.users(id)
);

-- Захиалга нийтэд харагдахгүй, зөвхөн admin (service_role) харна
alter table public.orders enable row level security;

-- Нэвтэрсэн хэрэглэгч өөрийн захиалгыг харах
create policy "Users can view own orders"
  on public.orders for select
  using (auth.uid() = user_id);

-- Захиалга нэмэх (нэвтрэсэн болон зочин хэрэглэгч)
create policy "Anyone can insert orders"
  on public.orders for insert
  with check (true);

-- ============================================================
-- Дараагийн алхам (Dashboard дотор хий):
-- 1. Authentication → Providers → Phone → Enable → Twilio тохируул
-- 2. Authentication → Providers → Google → Enable → Client ID/Secret нэм
-- 3. Authentication → Providers → Facebook → Enable → App ID/Secret нэм
-- 4. Authentication → URL Configuration → Redirect URLs → http://localhost:3000 нэм
-- ============================================================
