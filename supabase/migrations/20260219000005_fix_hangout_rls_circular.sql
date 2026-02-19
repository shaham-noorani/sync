-- Fix circular RLS between hangouts and hangout_attendees/photos/reactions
-- Root cause:
--   hangouts.read_hangouts queries hangout_attendees
--   hangout_attendees.read_attendees queries hangouts → infinite recursion
--   hangout_photos.read_photos queries hangouts → recursion through attendees chain
--   hangout_reactions.read_reactions queries hangout_attendees → recursion

-- ============================================
-- STEP 1: Drop all conflicting policies
-- ============================================

drop policy if exists "read_hangouts" on hangouts;
drop policy if exists "read_attendees" on hangout_attendees;
drop policy if exists "manage_attendees" on hangout_attendees;
drop policy if exists "read_photos" on hangout_photos;
drop policy if exists "read_reactions" on hangout_reactions;

-- ============================================
-- STEP 2: SECURITY DEFINER helper – checks hangout access without RLS
-- ============================================

create or replace function user_can_access_hangout(p_hangout_id uuid)
returns boolean
language plpgsql
security definer
stable
as $$
declare
  v_created_by uuid;
  v_group_id   uuid;
begin
  select created_by, group_id
  into v_created_by, v_group_id
  from hangouts
  where id = p_hangout_id;

  -- Creator always has access
  if v_created_by = auth.uid() then return true; end if;

  -- Group member has access
  if v_group_id is not null and exists (
    select 1 from group_members
    where group_id = v_group_id and user_id = auth.uid()
  ) then return true; end if;

  -- Friend of creator has access
  if exists (
    select 1 from friendships
    where status = 'accepted'
      and (
        (requester_id = auth.uid() and addressee_id = v_created_by)
        or (addressee_id = auth.uid() and requester_id = v_created_by)
      )
  ) then return true; end if;

  return false;
end;
$$;

-- ============================================
-- STEP 3: Non-circular policies
-- ============================================

-- hangouts: creator, group member, or friend of creator
-- Does NOT reference hangout_attendees → no recursion
create policy "read_hangouts" on hangouts for select using (
  created_by = auth.uid()
  or (group_id is not null and group_id in (
    select group_id from group_members where user_id = auth.uid()
  ))
  or created_by in (
    select case
      when requester_id = auth.uid() then addressee_id
      else requester_id
    end
    from friendships
    where status = 'accepted'
      and (requester_id = auth.uid() or addressee_id = auth.uid())
  )
);

-- hangout_attendees: user can see their own attendance record
-- Does NOT reference hangouts → no recursion
create policy "read_attendees" on hangout_attendees for select using (
  user_id = auth.uid()
  or user_can_access_hangout(hangout_id)
);

-- hangout_attendees management (creator can add/remove)
create policy "manage_attendees" on hangout_attendees for all using (
  user_can_access_hangout(hangout_id)
);

-- hangout_photos: use SECURITY DEFINER fn → no recursion
create policy "read_photos" on hangout_photos for select using (
  user_can_access_hangout(hangout_id)
);

-- hangout_reactions: use SECURITY DEFINER fn → no recursion
create policy "read_reactions" on hangout_reactions for select using (
  user_id = auth.uid()
  or user_can_access_hangout(hangout_id)
);
