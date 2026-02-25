-- Add source column to availability_slots
-- 'manual' = user set this explicitly, 'gcal' = synced from Google Calendar
alter table availability_slots
  add column source text not null default 'manual'
  check (source in ('manual', 'gcal'));

-- Mark all existing slots as manual
update availability_slots set source = 'manual';

-- gcal_connections: one row per connected Google account per user
create table gcal_connections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  google_email text not null,
  vault_secret_name text not null,
  access_token text,
  token_expiry timestamptz,
  connected_at timestamptz not null default now(),
  unique(user_id, google_email)
);

-- gcal_calendars: one row per calendar per connection
create table gcal_calendars (
  id uuid primary key default gen_random_uuid(),
  gcal_connection_id uuid not null references gcal_connections(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  google_calendar_id text not null,
  calendar_name text not null,
  color text,
  is_enabled boolean not null default false,
  is_primary boolean not null default false,
  unique(gcal_connection_id, google_calendar_id)
);

-- RLS
alter table gcal_connections enable row level security;
alter table gcal_calendars enable row level security;

create policy "users manage own gcal_connections"
  on gcal_connections for all using (user_id = auth.uid());

create policy "users manage own gcal_calendars"
  on gcal_calendars for all using (user_id = auth.uid());

-- Indexes
create index idx_gcal_connections_user on gcal_connections(user_id);
create index idx_gcal_calendars_connection on gcal_calendars(gcal_connection_id);
create index idx_gcal_calendars_user_enabled on gcal_calendars(user_id, is_enabled);

-- Updated get_effective_availability:
-- Priority: travel (highest) → manual slot → gcal slot → pattern → default (lowest)
create or replace function get_effective_availability(
  p_user_id uuid,
  p_start_date date,
  p_end_date date
)
returns table (
  date date,
  time_block text,
  is_available boolean,
  source text
) as $$
declare
  d date;
  tb text;
begin
  d := p_start_date;
  while d <= p_end_date loop
    foreach tb in array array['morning', 'afternoon', 'evening'] loop
      -- 1. Travel period → always busy
      if exists (
        select 1 from travel_periods tp
        where tp.user_id = p_user_id
        and d between tp.start_date and tp.end_date
      ) then
        return query select d, tb, false, 'travel'::text;

      -- 2. Manual slot override → highest user-controlled priority
      elsif exists (
        select 1 from availability_slots s
        where s.user_id = p_user_id
        and s.date = d
        and s.time_block = tb
        and s.source = 'manual'
      ) then
        return query
          select d, s.time_block, s.is_available, 'slot'::text
          from availability_slots s
          where s.user_id = p_user_id
          and s.date = d
          and s.time_block = tb
          and s.source = 'manual';

      -- 3. GCal busy slot
      elsif exists (
        select 1 from availability_slots s
        where s.user_id = p_user_id
        and s.date = d
        and s.time_block = tb
        and s.source = 'gcal'
      ) then
        return query select d, tb, false, 'gcal'::text;

      -- 4. Weekly pattern
      elsif exists (
        select 1 from availability_patterns p
        where p.user_id = p_user_id
        and p.day_of_week = extract(dow from d)::int
        and p.time_block = tb
      ) then
        return query
          select d, p.time_block, p.is_available, 'pattern'::text
          from availability_patterns p
          where p.user_id = p_user_id
          and p.day_of_week = extract(dow from d)::int
          and p.time_block = tb;

      -- 5. Default: not available
      else
        return query select d, tb, false, 'default'::text;
      end if;
    end loop;
    d := d + 1;
  end loop;
end;
$$ language plpgsql stable security definer;
