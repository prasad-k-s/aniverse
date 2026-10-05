-- =============================================================================
-- AniVerse database schema
-- Run this whole file once in Supabase: Dashboard -> SQL Editor -> New query -> Run
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Profiles: one row per user, created automatically on sign up
-- -----------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  username text not null unique check (username ~ '^[a-z0-9_]{3,20}$'),
  display_name text check (char_length(display_name) <= 50),
  avatar_url text,
  bio text check (char_length(bio) <= 200),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Profiles are viewable by everyone"
  on public.profiles for select using (true);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id) with check (auth.uid() = id);

-- Create a profile when a user signs up. The username comes from the sign-up
-- form (user metadata); if it is taken, a number is added to make it unique.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
declare
  base text;
  candidate text;
  n int := 0;
begin
  base := regexp_replace(
    lower(coalesce(new.raw_user_meta_data ->> 'username', split_part(new.email, '@', 1))),
    '[^a-z0-9_]', '', 'g'
  );
  if char_length(base) < 3 then
    base := base || 'fan';
  end if;
  base := left(base, 16);
  candidate := base;

  while exists (select 1 from public.profiles where username = candidate) loop
    n := n + 1;
    candidate := base || n::text;
  end loop;

  insert into public.profiles (id, username, display_name)
  values (new.id, candidate, coalesce(new.raw_user_meta_data ->> 'display_name', candidate));

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- -----------------------------------------------------------------------------
-- Watchlist: anime a user is tracking
-- -----------------------------------------------------------------------------
do $$ begin
  create type public.watch_status as enum ('watching', 'completed', 'planning', 'paused', 'dropped');
exception when duplicate_object then null;
end $$;

create table if not exists public.watchlist (
  user_id uuid not null references public.profiles (id) on delete cascade,
  anime_id integer not null,
  status public.watch_status not null default 'planning',
  progress integer not null default 0 check (progress >= 0),
  score integer check (score between 1 and 10),
  -- Copied from AniList so the list renders without extra API calls
  title text not null,
  cover_image text,
  episodes integer,
  format text,
  updated_at timestamptz not null default now(),
  primary key (user_id, anime_id)
);

create index if not exists watchlist_user_updated_idx on public.watchlist (user_id, updated_at desc);

alter table public.watchlist enable row level security;

-- Watchlists are public so they can be shown on profile pages
create policy "Watchlists are viewable by everyone"
  on public.watchlist for select using (true);

create policy "Users can add to their own watchlist"
  on public.watchlist for insert with check (auth.uid() = user_id);

create policy "Users can update their own watchlist"
  on public.watchlist for update
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users can delete from their own watchlist"
  on public.watchlist for delete using (auth.uid() = user_id);

-- -----------------------------------------------------------------------------
-- Reviews: one per user per anime
-- -----------------------------------------------------------------------------
create table if not exists public.reviews (
  id bigint generated always as identity primary key,
  user_id uuid not null references public.profiles (id) on delete cascade,
  anime_id integer not null,
  anime_title text not null,
  rating integer not null check (rating between 1 and 10),
  body text not null check (char_length(body) between 20 and 2000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, anime_id)
);

create index if not exists reviews_anime_idx on public.reviews (anime_id, created_at desc);

alter table public.reviews enable row level security;

create policy "Reviews are viewable by everyone"
  on public.reviews for select using (true);

create policy "Users can write their own reviews"
  on public.reviews for insert with check (auth.uid() = user_id);

create policy "Users can edit their own reviews"
  on public.reviews for update
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users can delete their own reviews"
  on public.reviews for delete using (auth.uid() = user_id);

-- -----------------------------------------------------------------------------
-- Comments: live discussion on each anime page (Supabase Realtime)
-- -----------------------------------------------------------------------------
create table if not exists public.comments (
  id bigint generated always as identity primary key,
  user_id uuid not null references public.profiles (id) on delete cascade,
  anime_id integer not null,
  body text not null check (char_length(body) between 1 and 500),
  created_at timestamptz not null default now()
);

create index if not exists comments_anime_idx on public.comments (anime_id, created_at desc);

alter table public.comments enable row level security;

create policy "Comments are viewable by everyone"
  on public.comments for select using (true);

create policy "Users can post comments as themselves"
  on public.comments for insert with check (auth.uid() = user_id);

create policy "Users can delete their own comments"
  on public.comments for delete using (auth.uid() = user_id);

-- Send inserts/deletes on comments to subscribed browsers
alter publication supabase_realtime add table public.comments;

-- -----------------------------------------------------------------------------
-- Storage: public "avatars" bucket; users can only write inside their own folder
-- -----------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

create policy "Avatar images are publicly accessible"
  on storage.objects for select using (bucket_id = 'avatars');

create policy "Users can upload their own avatar"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "Users can update their own avatar"
  on storage.objects for update to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "Users can delete their own avatar"
  on storage.objects for delete to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
