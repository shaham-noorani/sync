-- =============================================================
-- Sync App — Initial Schema
-- =============================================================

-- Enable required extensions
create extension if not exists pgcrypto;

-- =============================================================
-- Utility functions
-- =============================================================

-- nanoid generator (11 chars, URL-safe alphabet)
create or replace function nanoid(size int default 11)
returns text as $$
declare
  id text := '';
  i int := 0;
  alphabet char(64) := 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_-';
  bytes bytea := gen_random_bytes(size);
  byte int;
begin
  while i < size loop
    byte := get_byte(bytes, i);
    id := id || substr(alphabet, (byte & 63) + 1, 1);
    i := i + 1;
  end loop;
  return id;
end;
$$ language plpgsql volatile;

-- Auto-update updated_at trigger function
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- =============================================================
-- Tables
-- =============================================================

-- Profiles (extends auth.users)
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null,
  display_name text not null,
  avatar_url text,
  city text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger profiles_updated_at
  before update on profiles
  for each row execute function update_updated_at();

-- User interests
create table user_interests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  interest text not null,
  created_at timestamptz not null default now(),
  unique(user_id, interest)
);

-- Friendships
create table friendships (
  id uuid primary key default gen_random_uuid(),
  requester_id uuid not null references profiles(id) on delete cascade,
  addressee_id uuid not null references profiles(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'declined')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(requester_id, addressee_id)
);

create trigger friendships_updated_at
  before update on friendships
  for each row execute function update_updated_at();

-- Groups
create table groups (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  invite_code text unique not null default nanoid(8),
  created_by uuid not null references profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger groups_updated_at
  before update on groups
  for each row execute function update_updated_at();

-- Group members
create table group_members (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references groups(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  role text not null default 'member' check (role in ('owner', 'admin', 'member')),
  joined_at timestamptz not null default now(),
  unique(group_id, user_id)
);

-- Availability patterns (recurring weekly schedule)
-- day_of_week: 0=Sunday, 6=Saturday
-- time_block: 'morning', 'afternoon', 'evening'
create table availability_patterns (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  day_of_week int not null check (day_of_week between 0 and 6),
  time_block text not null check (time_block in ('morning', 'afternoon', 'evening')),
  is_available boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, day_of_week, time_block)
);

create trigger availability_patterns_updated_at
  before update on availability_patterns
  for each row execute function update_updated_at();

-- Availability slots (specific date overrides)
create table availability_slots (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  date date not null,
  time_block text not null check (time_block in ('morning', 'afternoon', 'evening')),
  is_available boolean not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, date, time_block)
);

create trigger availability_slots_updated_at
  before update on availability_slots
  for each row execute function update_updated_at();

-- Travel periods (user is away)
create table travel_periods (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  start_date date not null,
  end_date date not null,
  label text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (end_date >= start_date)
);

create trigger travel_periods_updated_at
  before update on travel_periods
  for each row execute function update_updated_at();

-- =============================================================
-- RLS Policies
-- =============================================================

alter table profiles enable row level security;
alter table user_interests enable row level security;
alter table friendships enable row level security;
alter table groups enable row level security;
alter table group_members enable row level security;
alter table availability_patterns enable row level security;
alter table availability_slots enable row level security;
alter table travel_periods enable row level security;

-- Profiles: anyone can read, users can update their own
create policy "Profiles are viewable by everyone"
  on profiles for select using (true);

create policy "Users can insert their own profile"
  on profiles for insert with check (auth.uid() = id);

create policy "Users can update their own profile"
  on profiles for update using (auth.uid() = id);

-- User interests: anyone can read, users manage their own
create policy "Interests are viewable by everyone"
  on user_interests for select using (true);

create policy "Users can insert their own interests"
  on user_interests for insert with check (auth.uid() = user_id);

create policy "Users can delete their own interests"
  on user_interests for delete using (auth.uid() = user_id);

-- Friendships: participants can view, requester can insert, addressee can update
create policy "Users can view their friendships"
  on friendships for select
  using (auth.uid() = requester_id or auth.uid() = addressee_id);

create policy "Users can send friend requests"
  on friendships for insert
  with check (auth.uid() = requester_id);

create policy "Addressee can respond to friend requests"
  on friendships for update
  using (auth.uid() = addressee_id);

create policy "Users can delete their friendships"
  on friendships for delete
  using (auth.uid() = requester_id or auth.uid() = addressee_id);

-- Groups: members can view, authenticated users can create
create policy "Group members can view groups"
  on groups for select
  using (
    exists (
      select 1 from group_members
      where group_members.group_id = groups.id
      and group_members.user_id = auth.uid()
    )
  );

-- Allow anyone to view a group by invite code (for join preview)
create policy "Anyone can view groups by invite code"
  on groups for select
  using (true);

create policy "Authenticated users can create groups"
  on groups for insert
  with check (auth.uid() = created_by);

create policy "Group owner can update group"
  on groups for update
  using (auth.uid() = created_by);

-- Group members: members can view their group, users can join/leave
create policy "Group members can view members"
  on group_members for select
  using (
    exists (
      select 1 from group_members gm
      where gm.group_id = group_members.group_id
      and gm.user_id = auth.uid()
    )
  );

create policy "Users can join groups"
  on group_members for insert
  with check (auth.uid() = user_id);

create policy "Users can leave groups"
  on group_members for delete
  using (auth.uid() = user_id);

-- Availability patterns: users manage their own, friends can view
create policy "Users can view own patterns"
  on availability_patterns for select
  using (auth.uid() = user_id);

create policy "Friends can view patterns"
  on availability_patterns for select
  using (
    exists (
      select 1 from friendships
      where status = 'accepted'
      and (
        (requester_id = auth.uid() and addressee_id = availability_patterns.user_id)
        or (addressee_id = auth.uid() and requester_id = availability_patterns.user_id)
      )
    )
  );

create policy "Users can manage their own patterns"
  on availability_patterns for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own patterns"
  on availability_patterns for update
  using (auth.uid() = user_id);

create policy "Users can delete their own patterns"
  on availability_patterns for delete
  using (auth.uid() = user_id);

-- Availability slots: same as patterns
create policy "Users can view own slots"
  on availability_slots for select
  using (auth.uid() = user_id);

create policy "Friends can view slots"
  on availability_slots for select
  using (
    exists (
      select 1 from friendships
      where status = 'accepted'
      and (
        (requester_id = auth.uid() and addressee_id = availability_slots.user_id)
        or (addressee_id = auth.uid() and requester_id = availability_slots.user_id)
      )
    )
  );

create policy "Users can manage their own slots"
  on availability_slots for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own slots"
  on availability_slots for update
  using (auth.uid() = user_id);

create policy "Users can delete their own slots"
  on availability_slots for delete
  using (auth.uid() = user_id);

-- Travel periods: same pattern
create policy "Users can view own travel periods"
  on travel_periods for select
  using (auth.uid() = user_id);

create policy "Friends can view travel periods"
  on travel_periods for select
  using (
    exists (
      select 1 from friendships
      where status = 'accepted'
      and (
        (requester_id = auth.uid() and addressee_id = travel_periods.user_id)
        or (addressee_id = auth.uid() and requester_id = travel_periods.user_id)
      )
    )
  );

create policy "Users can manage their own travel periods"
  on travel_periods for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own travel periods"
  on travel_periods for update
  using (auth.uid() = user_id);

create policy "Users can delete their own travel periods"
  on travel_periods for delete
  using (auth.uid() = user_id);

-- =============================================================
-- RPC Functions
-- =============================================================

-- Get effective availability for a user over a date range
-- Merges weekly patterns with specific slot overrides
-- Travel periods mark everything as unavailable
create or replace function get_effective_availability(
  p_user_id uuid,
  p_start_date date,
  p_end_date date
)
returns table (
  date date,
  time_block text,
  is_available boolean,
  source text -- 'pattern', 'slot', or 'travel'
) as $$
declare
  d date;
begin
  d := p_start_date;
  while d <= p_end_date loop
    for time_block in select unnest(array['morning', 'afternoon', 'evening']) loop
      -- Check travel period first
      if exists (
        select 1 from travel_periods tp
        where tp.user_id = p_user_id
        and d between tp.start_date and tp.end_date
      ) then
        return query select d, time_block, false, 'travel'::text;
      -- Check specific slot override
      elsif exists (
        select 1 from availability_slots s
        where s.user_id = p_user_id
        and s.date = d
        and s.time_block = get_effective_availability.time_block
      ) then
        return query
          select d, s.time_block, s.is_available, 'slot'::text
          from availability_slots s
          where s.user_id = p_user_id
          and s.date = d
          and s.time_block = get_effective_availability.time_block;
      -- Fall back to weekly pattern
      elsif exists (
        select 1 from availability_patterns p
        where p.user_id = p_user_id
        and p.day_of_week = extract(dow from d)::int
        and p.time_block = get_effective_availability.time_block
      ) then
        return query
          select d, p.time_block, p.is_available, 'pattern'::text
          from availability_patterns p
          where p.user_id = p_user_id
          and p.day_of_week = extract(dow from d)::int
          and p.time_block = get_effective_availability.time_block;
      else
        -- No data = not available
        return query select d, time_block, false, 'default'::text;
      end if;
    end loop;
    d := d + 1;
  end loop;
end;
$$ language plpgsql stable security definer;

-- Get group availability overlaps
create or replace function get_group_overlaps(
  p_group_id uuid,
  p_start_date date,
  p_end_date date
)
returns table (
  date date,
  time_block text,
  available_count int,
  total_members int,
  available_members uuid[]
) as $$
begin
  return query
  with members as (
    select user_id from group_members where group_id = p_group_id
  ),
  member_count as (
    select count(*)::int as cnt from members
  ),
  dates as (
    select generate_series(p_start_date, p_end_date, '1 day'::interval)::date as d
  ),
  blocks as (
    select unnest(array['morning', 'afternoon', 'evening']) as tb
  ),
  grid as (
    select dates.d, blocks.tb from dates cross join blocks
  ),
  member_availability as (
    select
      g.d,
      g.tb,
      m.user_id,
      coalesce(
        (select ea.is_available from get_effective_availability(m.user_id, g.d, g.d) ea
         where ea.time_block = g.tb limit 1),
        false
      ) as is_available
    from grid g
    cross join members m
  )
  select
    ma.d as date,
    ma.tb as time_block,
    count(*) filter (where ma.is_available)::int as available_count,
    mc.cnt as total_members,
    array_agg(ma.user_id) filter (where ma.is_available) as available_members
  from member_availability ma
  cross join member_count mc
  group by ma.d, ma.tb, mc.cnt
  order by ma.d, ma.tb;
end;
$$ language plpgsql stable security definer;

-- =============================================================
-- Realtime
-- =============================================================

alter publication supabase_realtime add table friendships;
alter publication supabase_realtime add table group_members;
alter publication supabase_realtime add table availability_patterns;
alter publication supabase_realtime add table availability_slots;

-- =============================================================
-- Indexes
-- =============================================================

create index idx_friendships_requester on friendships(requester_id);
create index idx_friendships_addressee on friendships(addressee_id);
create index idx_group_members_group on group_members(group_id);
create index idx_group_members_user on group_members(user_id);
create index idx_availability_patterns_user on availability_patterns(user_id);
create index idx_availability_slots_user_date on availability_slots(user_id, date);
create index idx_travel_periods_user_dates on travel_periods(user_id, start_date, end_date);
create index idx_user_interests_user on user_interests(user_id);
create index idx_groups_invite_code on groups(invite_code);

-- =============================================================
-- Storage bucket for avatars
-- =============================================================

insert into storage.buckets (id, name, public) values ('avatars', 'avatars', true);

create policy "Avatar images are publicly accessible"
  on storage.objects for select
  using (bucket_id = 'avatars');

create policy "Users can upload their own avatar"
  on storage.objects for insert
  with check (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Users can update their own avatar"
  on storage.objects for update
  using (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Users can delete their own avatar"
  on storage.objects for delete
  using (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);
