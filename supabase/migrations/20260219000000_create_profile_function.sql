-- Server-side function to create a profile + interests after signup.
-- SECURITY DEFINER bypasses RLS so it works before email confirmation.
create or replace function create_profile(
  p_user_id uuid,
  p_username text,
  p_display_name text,
  p_city text default null,
  p_interests text[] default '{}'
)
returns void as $$
begin
  insert into profiles (id, username, display_name, city)
  values (p_user_id, p_username, p_display_name, p_city);

  if array_length(p_interests, 1) > 0 then
    insert into user_interests (user_id, interest)
    select p_user_id, unnest(p_interests);
  end if;
end;
$$ language plpgsql security definer;
