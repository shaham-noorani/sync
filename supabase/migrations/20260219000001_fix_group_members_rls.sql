-- Fix infinite recursion: group_members SELECT policy references itself.
-- Use a SECURITY DEFINER function to break the cycle.

drop policy "Group members can view members" on group_members;

create or replace function is_group_member(p_group_id uuid)
returns boolean as $$
  select exists (
    select 1 from group_members
    where group_id = p_group_id and user_id = auth.uid()
  );
$$ language sql security definer stable;

create policy "Users can view group members"
  on group_members for select
  using (is_group_member(group_id));
