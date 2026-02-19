-- Fix circular RLS infinite recursion between hangout_proposals and proposal_responses
-- The previous migration applied but had a policy that was still circular.
-- This migration drops all conflicting policies and rebuilds them cleanly.

-- ============================================
-- STEP 1: Drop conflicting policies
-- ============================================

drop policy if exists "read_proposals" on hangout_proposals;
drop policy if exists "read_responses" on proposal_responses;
drop policy if exists "read_hangouts" on hangouts;
drop policy if exists "read_reactions" on hangout_reactions;

-- ============================================
-- STEP 2: SECURITY DEFINER helper to check proposal access without RLS
-- ============================================

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

  if v_created_by = auth.uid() then return true; end if;

  if v_group_id is not null and exists (
    select 1 from group_members
    where group_id = v_group_id and user_id = auth.uid()
  ) then return true; end if;

  return false;
end;
$$;

-- ============================================
-- STEP 3: Rebuild non-circular policies
-- ============================================

-- hangout_proposals: uses proposal_responses with simple user_id=auth.uid() filter → no recursion
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

-- proposal_responses: uses SECURITY DEFINER fn → bypasses hangout_proposals RLS → no recursion
create policy "read_responses" on proposal_responses for select using (
  user_id = auth.uid()
  or user_can_access_proposal(proposal_id)
);

-- hangouts
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

-- hangout_reactions
create policy "read_reactions" on hangout_reactions for select using (
  auth.uid() in (
    select user_id from hangout_attendees where hangout_id = hangout_reactions.hangout_id
  )
  or auth.uid() = (
    select created_by from hangouts where id = hangout_reactions.hangout_id
  )
);
