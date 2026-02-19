-- Fix circular RLS infinite recursion between hangout_proposals and proposal_responses
-- hangout_proposals policy queries proposal_responses
-- proposal_responses policy queries hangout_proposals → infinite recursion

-- ============================================
-- STEP 1: Drop all circular policies
-- ============================================

drop policy if exists "read_proposals" on hangout_proposals;
drop policy if exists "read_responses" on proposal_responses;
drop policy if exists "read_hangouts" on hangouts;
drop policy if exists "read_reactions" on hangout_reactions;

-- ============================================
-- STEP 2: Helper function (SECURITY DEFINER bypasses RLS)
-- ============================================

-- Check if auth.uid() can access a given proposal (bypasses hangout_proposals RLS)
create or replace function user_can_access_proposal(p_proposal_id uuid)
returns boolean
language plpgsql
security definer
stable
as $$
declare
  v_created_by uuid;
  v_group_id uuid;
begin
  select created_by, group_id
  into v_created_by, v_group_id
  from hangout_proposals
  where id = p_proposal_id;

  -- Creator always has access
  if v_created_by = auth.uid() then return true; end if;

  -- Group member has access
  if v_group_id is not null and exists (
    select 1 from group_members
    where group_id = v_group_id and user_id = auth.uid()
  ) then return true; end if;

  return false;
end;
$$;

-- ============================================
-- STEP 3: Non-circular policies
-- ============================================

-- hangout_proposals: readable if creator, invitee (direct response check), or group member
-- Does NOT recurse because proposal_responses policy uses user_id = auth.uid() (simple)
create policy "read_proposals" on hangout_proposals for select using (
  created_by = auth.uid()
  or id in (
    select proposal_id from proposal_responses
    where user_id = auth.uid()
  )
  or (group_id is not null and group_id in (
    select group_id from group_members where user_id = auth.uid()
  ))
);

-- proposal_responses: readable if own response OR user can access parent proposal
-- Uses SECURITY DEFINER fn for proposal check → no recursion back to hangout_proposals RLS
create policy "read_responses" on proposal_responses for select using (
  user_id = auth.uid()
  or user_can_access_proposal(proposal_id)
);

-- hangouts: readable if creator, attendee, group member, or friend of creator
create policy "read_hangouts" on hangouts for select using (
  created_by = auth.uid()
  or id in (select hangout_id from hangout_attendees where user_id = auth.uid())
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

-- hangout_reactions: readable alongside parent hangout (simple attendee/creator check)
create policy "read_reactions" on hangout_reactions for select using (
  auth.uid() in (
    select user_id from hangout_attendees where hangout_id = hangout_reactions.hangout_id
  )
  or auth.uid() = (
    select created_by from hangouts where id = hangout_reactions.hangout_id
  )
);
