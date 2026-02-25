-- Corrective migration: replace FOR ALL RLS policies with explicit per-operation policies
-- and fix get_effective_availability to read is_available from the gcal row.

-- Drop old FOR ALL policies
drop policy if exists "users manage own gcal_connections" on gcal_connections;
drop policy if exists "users manage own gcal_calendars" on gcal_calendars;

-- Explicit per-operation policies for gcal_connections
create policy "users view own gcal_connections"
  on gcal_connections for select using (user_id = auth.uid());
create policy "users insert own gcal_connections"
  on gcal_connections for insert with check (user_id = auth.uid());
create policy "users update own gcal_connections"
  on gcal_connections for update using (user_id = auth.uid());
create policy "users delete own gcal_connections"
  on gcal_connections for delete using (user_id = auth.uid());

-- Explicit per-operation policies for gcal_calendars
create policy "users view own gcal_calendars"
  on gcal_calendars for select using (user_id = auth.uid());
create policy "users insert own gcal_calendars"
  on gcal_calendars for insert with check (user_id = auth.uid());
create policy "users update own gcal_calendars"
  on gcal_calendars for update using (user_id = auth.uid());
create policy "users delete own gcal_calendars"
  on gcal_calendars for delete using (user_id = auth.uid());

-- Replace get_effective_availability with fixed version:
-- GCal branch now reads is_available from the actual row instead of hardcoding false.
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

      -- 3. GCal slot — reads is_available from the actual row
      elsif exists (
        select 1 from availability_slots s
        where s.user_id = p_user_id
        and s.date = d
        and s.time_block = tb
        and s.source = 'gcal'
      ) then
        return query
          select d, s.time_block, s.is_available, 'gcal'::text
          from availability_slots s
          where s.user_id = p_user_id
          and s.date = d
          and s.time_block = tb
          and s.source = 'gcal';

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
