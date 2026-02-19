-- ============================================
-- PHASE 2: HANGOUT PROPOSALS
-- ============================================

create table if not exists hangout_proposals (
  id uuid default gen_random_uuid() primary key,
  created_by uuid references profiles(id) not null,
  group_id uuid references groups(id) on delete set null,
  title text not null,
  description text,
  activity_tag text,
  proposed_date date,
  proposed_time_block text check (proposed_time_block in ('morning', 'afternoon', 'evening', 'night')),
  location_name text,
  location_city text,
  status text not null default 'open' check (status in ('open', 'confirmed', 'cancelled', 'completed')),
  created_at timestamptz default now()
);

create table if not exists proposal_responses (
  id uuid default gen_random_uuid() primary key,
  proposal_id uuid references hangout_proposals(id) on delete cascade not null,
  user_id uuid references profiles(id) on delete cascade not null,
  response text not null default 'pending' check (response in ('pending', 'accepted', 'declined', 'maybe')),
  responded_at timestamptz,
  unique(proposal_id, user_id)
);

-- ============================================
-- PHASE 3: HANGOUT LOGS + FEED
-- ============================================

create table if not exists hangouts (
  id uuid default gen_random_uuid() primary key,
  proposal_id uuid references hangout_proposals(id) on delete set null,
  group_id uuid references groups(id) on delete set null,
  title text not null,
  activity_tag text,
  location_name text,
  location_city text,
  date date not null default current_date,
  created_by uuid references profiles(id) not null,
  created_at timestamptz default now()
);

create table if not exists hangout_attendees (
  id uuid default gen_random_uuid() primary key,
  hangout_id uuid references hangouts(id) on delete cascade not null,
  user_id uuid references profiles(id) on delete cascade not null,
  unique(hangout_id, user_id)
);

create table if not exists hangout_photos (
  id uuid default gen_random_uuid() primary key,
  hangout_id uuid references hangouts(id) on delete cascade not null,
  uploaded_by uuid references profiles(id) on delete cascade not null,
  storage_path text not null,
  caption text,
  created_at timestamptz default now()
);

create table if not exists hangout_reactions (
  id uuid default gen_random_uuid() primary key,
  hangout_id uuid references hangouts(id) on delete cascade not null,
  user_id uuid references profiles(id) on delete cascade not null,
  emoji text not null default '🔥',
  created_at timestamptz default now(),
  unique(hangout_id, user_id)
);

-- Raw LLM availability inputs (for Phase 4)
create table if not exists availability_inputs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  raw_text text not null,
  parsed_successfully boolean default false,
  created_at timestamptz default now()
);

-- ============================================
-- RLS
-- ============================================

alter table hangout_proposals enable row level security;
alter table proposal_responses enable row level security;
alter table hangouts enable row level security;
alter table hangout_attendees enable row level security;
alter table hangout_photos enable row level security;
alter table hangout_reactions enable row level security;
alter table availability_inputs enable row level security;

-- PROPOSALS: read if creator, invitee, or group member
create policy "read_proposals" on hangout_proposals for select using (
  created_by = auth.uid()
  or id in (select proposal_id from proposal_responses where user_id = auth.uid())
  or (group_id is not null and group_id in (
    select group_id from group_members where user_id = auth.uid()
  ))
);

create policy "create_proposals" on hangout_proposals for insert with check (
  created_by = auth.uid()
);

create policy "update_own_proposals" on hangout_proposals for update using (
  created_by = auth.uid()
);

-- PROPOSAL RESPONSES
create policy "read_responses" on proposal_responses for select using (
  user_id = auth.uid()
  or proposal_id in (
    select id from hangout_proposals where created_by = auth.uid()
  )
  or proposal_id in (
    select proposal_id from proposal_responses where user_id = auth.uid()
  )
);

create policy "create_response" on proposal_responses for insert with check (
  user_id = auth.uid()
);

create policy "update_own_response" on proposal_responses for update using (
  user_id = auth.uid()
);

-- HANGOUTS: visible to creator, attendees, and group members
create policy "read_hangouts" on hangouts for select using (
  created_by = auth.uid()
  or id in (select hangout_id from hangout_attendees where user_id = auth.uid())
  or (group_id is not null and group_id in (
    select group_id from group_members where user_id = auth.uid()
  ))
  or created_by in (
    select case when requester_id = auth.uid() then addressee_id else requester_id end
    from friendships where status = 'accepted'
    and (requester_id = auth.uid() or addressee_id = auth.uid())
  )
);

create policy "create_hangout" on hangouts for insert with check (
  created_by = auth.uid()
);

create policy "update_own_hangout" on hangouts for update using (
  created_by = auth.uid()
);

-- ATTENDEES
create policy "read_attendees" on hangout_attendees for select using (
  hangout_id in (select id from hangouts)
);

create policy "manage_attendees" on hangout_attendees for all using (
  hangout_id in (select id from hangouts where created_by = auth.uid())
);

-- PHOTOS
create policy "read_photos" on hangout_photos for select using (
  hangout_id in (select id from hangouts)
);

create policy "upload_photos" on hangout_photos for insert with check (
  uploaded_by = auth.uid()
);

-- REACTIONS
create policy "read_reactions" on hangout_reactions for select using (
  hangout_id in (select id from hangouts)
);

create policy "manage_own_reaction" on hangout_reactions for all using (
  user_id = auth.uid()
);

-- AVAILABILITY INPUTS
create policy "manage_own_inputs" on availability_inputs for all using (
  user_id = auth.uid()
);

-- ============================================
-- REALTIME
-- ============================================

alter publication supabase_realtime add table hangout_proposals;
alter publication supabase_realtime add table proposal_responses;
alter publication supabase_realtime add table hangouts;
alter publication supabase_realtime add table hangout_reactions;

-- ============================================
-- INDEXES
-- ============================================

create index if not exists idx_proposals_group on hangout_proposals(group_id);
create index if not exists idx_proposals_created_by on hangout_proposals(created_by);
create index if not exists idx_responses_proposal on proposal_responses(proposal_id);
create index if not exists idx_hangouts_group on hangouts(group_id);
create index if not exists idx_hangouts_date on hangouts(date desc);
create index if not exists idx_hangout_attendees_user on hangout_attendees(user_id);
create index if not exists idx_hangout_photos_hangout on hangout_photos(hangout_id);
create index if not exists idx_hangout_reactions_hangout on hangout_reactions(hangout_id);

-- ============================================
-- STORAGE BUCKET FOR HANGOUT PHOTOS
-- ============================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'hangout-photos',
  'hangout-photos',
  true,
  10485760, -- 10MB
  array['image/jpeg', 'image/png', 'image/webp']
) on conflict (id) do nothing;

-- Storage policy: authenticated users can upload; public can read
create policy "hangout_photos_public_read" on storage.objects for select
  using (bucket_id = 'hangout-photos');

create policy "hangout_photos_auth_upload" on storage.objects for insert
  with check (bucket_id = 'hangout-photos' and auth.role() = 'authenticated');
