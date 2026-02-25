alter table public.groups
  add column if not exists icon_url text null,
  add column if not exists icon_name text null;
