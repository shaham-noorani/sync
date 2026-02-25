-- Seed availability data for all users except Shaham and Emily
-- Covers the next 3 weeks from 2026-02-25 through 2026-03-17
-- Excludes: Shaham (30195d8c) and Emily (d8dbad15)

-- Clear any existing patterns/slots for these users
DELETE FROM availability_patterns WHERE user_id IN (
  '7bee92b5-4b26-4675-a5d1-f0ea14ff8503', -- testuser_sync
  'ef5bd451-dc60-43cb-9467-49c57ce134bd', -- alexchen
  '7088d687-99f0-46dd-a37e-39ab1f45fe81', -- jordankim
  'be28a3ee-83a7-4339-b687-2064f46baebf', -- mayapatel
  '13feef63-2291-41d7-ad0e-eebfe10f44df', -- samrivera
  'be53c5c2-6012-473c-95e3-69be508da895', -- tylerbrooks
  '9f8b50bb-6ed4-4510-99f1-8b7a32c3256e', -- rishi
  '1f542858-78f2-4aca-9c9d-6f844c16b4dd', -- shikhar
  '4f308711-56de-4c37-9710-89d531b43c04', -- vivian
  '8ff448d5-c3b3-4b5c-b397-ea4d6d80d78b', -- james
  'af180fe0-a3be-497f-bec3-c2a8dec40266', -- eunsoo
  '7101fcb0-07a9-44fc-b961-c2066f9c04e8', -- pavan
  '5220aef7-7508-4e33-aa2b-7a0fc4b7ee00', -- ady
  '97660462-30ed-4575-82da-82f106aabf45', -- vinisha
  '53fa598f-fa40-49e2-bf91-b495dbac3b55', -- stefano
  'cbb1bfd8-beb0-4a1a-9c48-fba695d6e1f9', -- kethan
  'fa975638-465d-45e4-9f0c-5944b6300783', -- ronin
  'e3cf8a88-1d42-4141-a7ec-5841891c07f6', -- sloan
  '00e6f687-a9be-4633-870c-f0aea3904f99', -- ajit
  '35458c1e-f8e6-421d-b499-40651de1417a', -- thomas
  '245add94-1f0d-4a03-ae65-b7d43c2fed7e', -- eren
  'f80ba9e3-f645-473e-b22c-bc4766c50d59'  -- kevin
);

DELETE FROM availability_slots WHERE user_id IN (
  '7bee92b5-4b26-4675-a5d1-f0ea14ff8503',
  'ef5bd451-dc60-43cb-9467-49c57ce134bd',
  '7088d687-99f0-46dd-a37e-39ab1f45fe81',
  'be28a3ee-83a7-4339-b687-2064f46baebf',
  '13feef63-2291-41d7-ad0e-eebfe10f44df',
  'be53c5c2-6012-473c-95e3-69be508da895',
  '9f8b50bb-6ed4-4510-99f1-8b7a32c3256e',
  '1f542858-78f2-4aca-9c9d-6f844c16b4dd',
  '4f308711-56de-4c37-9710-89d531b43c04',
  '8ff448d5-c3b3-4b5c-b397-ea4d6d80d78b',
  'af180fe0-a3be-497f-bec3-c2a8dec40266',
  '7101fcb0-07a9-44fc-b961-c2066f9c04e8',
  '5220aef7-7508-4e33-aa2b-7a0fc4b7ee00',
  '97660462-30ed-4575-82da-82f106aabf45',
  '53fa598f-fa40-49e2-bf91-b495dbac3b55',
  'cbb1bfd8-beb0-4a1a-9c48-fba695d6e1f9',
  'fa975638-465d-45e4-9f0c-5944b6300783',
  'e3cf8a88-1d42-4141-a7ec-5841891c07f6',
  '00e6f687-a9be-4633-870c-f0aea3904f99',
  '35458c1e-f8e6-421d-b499-40651de1417a',
  '245add94-1f0d-4a03-ae65-b7d43c2fed7e',
  'f80ba9e3-f645-473e-b22c-bc4766c50d59'
);

-- ============================================================
-- AVAILABILITY PATTERNS (recurring weekly schedule)
-- day_of_week: 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat
-- ============================================================

INSERT INTO availability_patterns (user_id, day_of_week, time_block, is_available) VALUES

-- Alex Chen: office worker, free evenings + full weekends
('ef5bd451-dc60-43cb-9467-49c57ce134bd', 1, 'evening', true),
('ef5bd451-dc60-43cb-9467-49c57ce134bd', 2, 'evening', true),
('ef5bd451-dc60-43cb-9467-49c57ce134bd', 3, 'evening', true),
('ef5bd451-dc60-43cb-9467-49c57ce134bd', 4, 'evening', true),
('ef5bd451-dc60-43cb-9467-49c57ce134bd', 5, 'evening', true),
('ef5bd451-dc60-43cb-9467-49c57ce134bd', 6, 'morning', true),
('ef5bd451-dc60-43cb-9467-49c57ce134bd', 6, 'afternoon', true),
('ef5bd451-dc60-43cb-9467-49c57ce134bd', 6, 'evening', true),
('ef5bd451-dc60-43cb-9467-49c57ce134bd', 0, 'morning', true),
('ef5bd451-dc60-43cb-9467-49c57ce134bd', 0, 'afternoon', true),
('ef5bd451-dc60-43cb-9467-49c57ce134bd', 0, 'evening', true),

-- Jordan Kim: student, free afternoons + evenings most days
('7088d687-99f0-46dd-a37e-39ab1f45fe81', 1, 'afternoon', true),
('7088d687-99f0-46dd-a37e-39ab1f45fe81', 1, 'evening', true),
('7088d687-99f0-46dd-a37e-39ab1f45fe81', 2, 'afternoon', true),
('7088d687-99f0-46dd-a37e-39ab1f45fe81', 2, 'evening', true),
('7088d687-99f0-46dd-a37e-39ab1f45fe81', 3, 'evening', true),
('7088d687-99f0-46dd-a37e-39ab1f45fe81', 4, 'afternoon', true),
('7088d687-99f0-46dd-a37e-39ab1f45fe81', 4, 'evening', true),
('7088d687-99f0-46dd-a37e-39ab1f45fe81', 5, 'afternoon', true),
('7088d687-99f0-46dd-a37e-39ab1f45fe81', 5, 'evening', true),
('7088d687-99f0-46dd-a37e-39ab1f45fe81', 6, 'morning', true),
('7088d687-99f0-46dd-a37e-39ab1f45fe81', 6, 'afternoon', true),
('7088d687-99f0-46dd-a37e-39ab1f45fe81', 6, 'evening', true),
('7088d687-99f0-46dd-a37e-39ab1f45fe81', 0, 'morning', true),
('7088d687-99f0-46dd-a37e-39ab1f45fe81', 0, 'afternoon', true),

-- Maya Patel: 9-5, free evenings + weekend mornings
('be28a3ee-83a7-4339-b687-2064f46baebf', 1, 'evening', true),
('be28a3ee-83a7-4339-b687-2064f46baebf', 2, 'evening', true),
('be28a3ee-83a7-4339-b687-2064f46baebf', 3, 'evening', true),
('be28a3ee-83a7-4339-b687-2064f46baebf', 4, 'evening', true),
('be28a3ee-83a7-4339-b687-2064f46baebf', 5, 'afternoon', true),
('be28a3ee-83a7-4339-b687-2064f46baebf', 5, 'evening', true),
('be28a3ee-83a7-4339-b687-2064f46baebf', 6, 'morning', true),
('be28a3ee-83a7-4339-b687-2064f46baebf', 6, 'afternoon', true),
('be28a3ee-83a7-4339-b687-2064f46baebf', 0, 'morning', true),
('be28a3ee-83a7-4339-b687-2064f46baebf', 0, 'afternoon', true),
('be28a3ee-83a7-4339-b687-2064f46baebf', 0, 'evening', true),

-- Sam Rivera: freelancer, very available
('13feef63-2291-41d7-ad0e-eebfe10f44df', 0, 'morning', true),
('13feef63-2291-41d7-ad0e-eebfe10f44df', 0, 'afternoon', true),
('13feef63-2291-41d7-ad0e-eebfe10f44df', 0, 'evening', true),
('13feef63-2291-41d7-ad0e-eebfe10f44df', 1, 'afternoon', true),
('13feef63-2291-41d7-ad0e-eebfe10f44df', 1, 'evening', true),
('13feef63-2291-41d7-ad0e-eebfe10f44df', 2, 'afternoon', true),
('13feef63-2291-41d7-ad0e-eebfe10f44df', 2, 'evening', true),
('13feef63-2291-41d7-ad0e-eebfe10f44df', 3, 'afternoon', true),
('13feef63-2291-41d7-ad0e-eebfe10f44df', 3, 'evening', true),
('13feef63-2291-41d7-ad0e-eebfe10f44df', 4, 'morning', true),
('13feef63-2291-41d7-ad0e-eebfe10f44df', 4, 'afternoon', true),
('13feef63-2291-41d7-ad0e-eebfe10f44df', 4, 'evening', true),
('13feef63-2291-41d7-ad0e-eebfe10f44df', 5, 'afternoon', true),
('13feef63-2291-41d7-ad0e-eebfe10f44df', 5, 'evening', true),
('13feef63-2291-41d7-ad0e-eebfe10f44df', 6, 'morning', true),
('13feef63-2291-41d7-ad0e-eebfe10f44df', 6, 'afternoon', true),
('13feef63-2291-41d7-ad0e-eebfe10f44df', 6, 'evening', true),

-- Tyler Brooks: night owl, evenings + weekend afternoons
('be53c5c2-6012-473c-95e3-69be508da895', 1, 'evening', true),
('be53c5c2-6012-473c-95e3-69be508da895', 2, 'evening', true),
('be53c5c2-6012-473c-95e3-69be508da895', 3, 'evening', true),
('be53c5c2-6012-473c-95e3-69be508da895', 4, 'evening', true),
('be53c5c2-6012-473c-95e3-69be508da895', 5, 'evening', true),
('be53c5c2-6012-473c-95e3-69be508da895', 6, 'afternoon', true),
('be53c5c2-6012-473c-95e3-69be508da895', 6, 'evening', true),
('be53c5c2-6012-473c-95e3-69be508da895', 0, 'afternoon', true),
('be53c5c2-6012-473c-95e3-69be508da895', 0, 'evening', true),

-- Rishi: free Tue/Thu/Fri evenings + weekends
('9f8b50bb-6ed4-4510-99f1-8b7a32c3256e', 2, 'afternoon', true),
('9f8b50bb-6ed4-4510-99f1-8b7a32c3256e', 2, 'evening', true),
('9f8b50bb-6ed4-4510-99f1-8b7a32c3256e', 4, 'afternoon', true),
('9f8b50bb-6ed4-4510-99f1-8b7a32c3256e', 4, 'evening', true),
('9f8b50bb-6ed4-4510-99f1-8b7a32c3256e', 5, 'afternoon', true),
('9f8b50bb-6ed4-4510-99f1-8b7a32c3256e', 5, 'evening', true),
('9f8b50bb-6ed4-4510-99f1-8b7a32c3256e', 6, 'morning', true),
('9f8b50bb-6ed4-4510-99f1-8b7a32c3256e', 6, 'afternoon', true),
('9f8b50bb-6ed4-4510-99f1-8b7a32c3256e', 6, 'evening', true),
('9f8b50bb-6ed4-4510-99f1-8b7a32c3256e', 0, 'morning', true),
('9f8b50bb-6ed4-4510-99f1-8b7a32c3256e', 0, 'afternoon', true),
('9f8b50bb-6ed4-4510-99f1-8b7a32c3256e', 0, 'evening', true),

-- Shikhar: busy weekdays, free weekends + occasional evenings
('1f542858-78f2-4aca-9c9d-6f844c16b4dd', 3, 'evening', true),
('1f542858-78f2-4aca-9c9d-6f844c16b4dd', 5, 'evening', true),
('1f542858-78f2-4aca-9c9d-6f844c16b4dd', 6, 'morning', true),
('1f542858-78f2-4aca-9c9d-6f844c16b4dd', 6, 'afternoon', true),
('1f542858-78f2-4aca-9c9d-6f844c16b4dd', 6, 'evening', true),
('1f542858-78f2-4aca-9c9d-6f844c16b4dd', 0, 'morning', true),
('1f542858-78f2-4aca-9c9d-6f844c16b4dd', 0, 'afternoon', true),
('1f542858-78f2-4aca-9c9d-6f844c16b4dd', 0, 'evening', true),

-- Vivian: morning person, free most mornings + Sunday afternoons
('4f308711-56de-4c37-9710-89d531b43c04', 1, 'morning', true),
('4f308711-56de-4c37-9710-89d531b43c04', 2, 'morning', true),
('4f308711-56de-4c37-9710-89d531b43c04', 3, 'morning', true),
('4f308711-56de-4c37-9710-89d531b43c04', 4, 'morning', true),
('4f308711-56de-4c37-9710-89d531b43c04', 5, 'morning', true),
('4f308711-56de-4c37-9710-89d531b43c04', 6, 'morning', true),
('4f308711-56de-4c37-9710-89d531b43c04', 6, 'afternoon', true),
('4f308711-56de-4c37-9710-89d531b43c04', 0, 'morning', true),
('4f308711-56de-4c37-9710-89d531b43c04', 0, 'afternoon', true),
('4f308711-56de-4c37-9710-89d531b43c04', 0, 'evening', true),

-- James: evenings only on weekdays, full weekends
('8ff448d5-c3b3-4b5c-b397-ea4d6d80d78b', 1, 'evening', true),
('8ff448d5-c3b3-4b5c-b397-ea4d6d80d78b', 2, 'evening', true),
('8ff448d5-c3b3-4b5c-b397-ea4d6d80d78b', 3, 'evening', true),
('8ff448d5-c3b3-4b5c-b397-ea4d6d80d78b', 4, 'evening', true),
('8ff448d5-c3b3-4b5c-b397-ea4d6d80d78b', 5, 'evening', true),
('8ff448d5-c3b3-4b5c-b397-ea4d6d80d78b', 6, 'morning', true),
('8ff448d5-c3b3-4b5c-b397-ea4d6d80d78b', 6, 'afternoon', true),
('8ff448d5-c3b3-4b5c-b397-ea4d6d80d78b', 6, 'evening', true),
('8ff448d5-c3b3-4b5c-b397-ea4d6d80d78b', 0, 'morning', true),
('8ff448d5-c3b3-4b5c-b397-ea4d6d80d78b', 0, 'afternoon', true),
('8ff448d5-c3b3-4b5c-b397-ea4d6d80d78b', 0, 'evening', true),

-- Eunsoo: 9-5 worker, evenings + full weekends
('af180fe0-a3be-497f-bec3-c2a8dec40266', 1, 'evening', true),
('af180fe0-a3be-497f-bec3-c2a8dec40266', 2, 'evening', true),
('af180fe0-a3be-497f-bec3-c2a8dec40266', 3, 'evening', true),
('af180fe0-a3be-497f-bec3-c2a8dec40266', 4, 'evening', true),
('af180fe0-a3be-497f-bec3-c2a8dec40266', 5, 'evening', true),
('af180fe0-a3be-497f-bec3-c2a8dec40266', 6, 'morning', true),
('af180fe0-a3be-497f-bec3-c2a8dec40266', 6, 'afternoon', true),
('af180fe0-a3be-497f-bec3-c2a8dec40266', 6, 'evening', true),
('af180fe0-a3be-497f-bec3-c2a8dec40266', 0, 'morning', true),
('af180fe0-a3be-497f-bec3-c2a8dec40266', 0, 'afternoon', true),
('af180fe0-a3be-497f-bec3-c2a8dec40266', 0, 'evening', true),

-- Pavan: mixed, free Mon/Wed/Fri evenings + full weekends
('7101fcb0-07a9-44fc-b961-c2066f9c04e8', 1, 'evening', true),
('7101fcb0-07a9-44fc-b961-c2066f9c04e8', 3, 'afternoon', true),
('7101fcb0-07a9-44fc-b961-c2066f9c04e8', 3, 'evening', true),
('7101fcb0-07a9-44fc-b961-c2066f9c04e8', 5, 'afternoon', true),
('7101fcb0-07a9-44fc-b961-c2066f9c04e8', 5, 'evening', true),
('7101fcb0-07a9-44fc-b961-c2066f9c04e8', 6, 'morning', true),
('7101fcb0-07a9-44fc-b961-c2066f9c04e8', 6, 'afternoon', true),
('7101fcb0-07a9-44fc-b961-c2066f9c04e8', 6, 'evening', true),
('7101fcb0-07a9-44fc-b961-c2066f9c04e8', 0, 'morning', true),
('7101fcb0-07a9-44fc-b961-c2066f9c04e8', 0, 'afternoon', true),
('7101fcb0-07a9-44fc-b961-c2066f9c04e8', 0, 'evening', true),

-- Ady: very available, almost always free
('5220aef7-7508-4e33-aa2b-7a0fc4b7ee00', 0, 'morning', true),
('5220aef7-7508-4e33-aa2b-7a0fc4b7ee00', 0, 'afternoon', true),
('5220aef7-7508-4e33-aa2b-7a0fc4b7ee00', 0, 'evening', true),
('5220aef7-7508-4e33-aa2b-7a0fc4b7ee00', 1, 'morning', true),
('5220aef7-7508-4e33-aa2b-7a0fc4b7ee00', 1, 'afternoon', true),
('5220aef7-7508-4e33-aa2b-7a0fc4b7ee00', 1, 'evening', true),
('5220aef7-7508-4e33-aa2b-7a0fc4b7ee00', 2, 'afternoon', true),
('5220aef7-7508-4e33-aa2b-7a0fc4b7ee00', 2, 'evening', true),
('5220aef7-7508-4e33-aa2b-7a0fc4b7ee00', 3, 'afternoon', true),
('5220aef7-7508-4e33-aa2b-7a0fc4b7ee00', 3, 'evening', true),
('5220aef7-7508-4e33-aa2b-7a0fc4b7ee00', 4, 'afternoon', true),
('5220aef7-7508-4e33-aa2b-7a0fc4b7ee00', 4, 'evening', true),
('5220aef7-7508-4e33-aa2b-7a0fc4b7ee00', 5, 'morning', true),
('5220aef7-7508-4e33-aa2b-7a0fc4b7ee00', 5, 'afternoon', true),
('5220aef7-7508-4e33-aa2b-7a0fc4b7ee00', 5, 'evening', true),
('5220aef7-7508-4e33-aa2b-7a0fc4b7ee00', 6, 'morning', true),
('5220aef7-7508-4e33-aa2b-7a0fc4b7ee00', 6, 'afternoon', true),
('5220aef7-7508-4e33-aa2b-7a0fc4b7ee00', 6, 'evening', true),

-- Vinisha: evenings only on weekdays, full weekends
('97660462-30ed-4575-82da-82f106aabf45', 1, 'evening', true),
('97660462-30ed-4575-82da-82f106aabf45', 2, 'evening', true),
('97660462-30ed-4575-82da-82f106aabf45', 3, 'evening', true),
('97660462-30ed-4575-82da-82f106aabf45', 4, 'evening', true),
('97660462-30ed-4575-82da-82f106aabf45', 5, 'afternoon', true),
('97660462-30ed-4575-82da-82f106aabf45', 5, 'evening', true),
('97660462-30ed-4575-82da-82f106aabf45', 6, 'morning', true),
('97660462-30ed-4575-82da-82f106aabf45', 6, 'afternoon', true),
('97660462-30ed-4575-82da-82f106aabf45', 6, 'evening', true),
('97660462-30ed-4575-82da-82f106aabf45', 0, 'morning', true),
('97660462-30ed-4575-82da-82f106aabf45', 0, 'afternoon', true),
('97660462-30ed-4575-82da-82f106aabf45', 0, 'evening', true),

-- Stefano: afternoons + evenings most days
('53fa598f-fa40-49e2-bf91-b495dbac3b55', 1, 'afternoon', true),
('53fa598f-fa40-49e2-bf91-b495dbac3b55', 1, 'evening', true),
('53fa598f-fa40-49e2-bf91-b495dbac3b55', 2, 'afternoon', true),
('53fa598f-fa40-49e2-bf91-b495dbac3b55', 2, 'evening', true),
('53fa598f-fa40-49e2-bf91-b495dbac3b55', 3, 'afternoon', true),
('53fa598f-fa40-49e2-bf91-b495dbac3b55', 3, 'evening', true),
('53fa598f-fa40-49e2-bf91-b495dbac3b55', 4, 'afternoon', true),
('53fa598f-fa40-49e2-bf91-b495dbac3b55', 4, 'evening', true),
('53fa598f-fa40-49e2-bf91-b495dbac3b55', 5, 'afternoon', true),
('53fa598f-fa40-49e2-bf91-b495dbac3b55', 5, 'evening', true),
('53fa598f-fa40-49e2-bf91-b495dbac3b55', 6, 'morning', true),
('53fa598f-fa40-49e2-bf91-b495dbac3b55', 6, 'afternoon', true),
('53fa598f-fa40-49e2-bf91-b495dbac3b55', 6, 'evening', true),
('53fa598f-fa40-49e2-bf91-b495dbac3b55', 0, 'afternoon', true),
('53fa598f-fa40-49e2-bf91-b495dbac3b55', 0, 'evening', true),

-- Kethan: free weekday afternoons + full weekends
('cbb1bfd8-beb0-4a1a-9c48-fba695d6e1f9', 1, 'afternoon', true),
('cbb1bfd8-beb0-4a1a-9c48-fba695d6e1f9', 2, 'afternoon', true),
('cbb1bfd8-beb0-4a1a-9c48-fba695d6e1f9', 2, 'evening', true),
('cbb1bfd8-beb0-4a1a-9c48-fba695d6e1f9', 3, 'afternoon', true),
('cbb1bfd8-beb0-4a1a-9c48-fba695d6e1f9', 4, 'afternoon', true),
('cbb1bfd8-beb0-4a1a-9c48-fba695d6e1f9', 4, 'evening', true),
('cbb1bfd8-beb0-4a1a-9c48-fba695d6e1f9', 5, 'afternoon', true),
('cbb1bfd8-beb0-4a1a-9c48-fba695d6e1f9', 6, 'morning', true),
('cbb1bfd8-beb0-4a1a-9c48-fba695d6e1f9', 6, 'afternoon', true),
('cbb1bfd8-beb0-4a1a-9c48-fba695d6e1f9', 6, 'evening', true),
('cbb1bfd8-beb0-4a1a-9c48-fba695d6e1f9', 0, 'morning', true),
('cbb1bfd8-beb0-4a1a-9c48-fba695d6e1f9', 0, 'afternoon', true),
('cbb1bfd8-beb0-4a1a-9c48-fba695d6e1f9', 0, 'evening', true),

-- Ronin: night owl, evenings only
('fa975638-465d-45e4-9f0c-5944b6300783', 1, 'evening', true),
('fa975638-465d-45e4-9f0c-5944b6300783', 2, 'evening', true),
('fa975638-465d-45e4-9f0c-5944b6300783', 3, 'evening', true),
('fa975638-465d-45e4-9f0c-5944b6300783', 4, 'evening', true),
('fa975638-465d-45e4-9f0c-5944b6300783', 5, 'evening', true),
('fa975638-465d-45e4-9f0c-5944b6300783', 6, 'afternoon', true),
('fa975638-465d-45e4-9f0c-5944b6300783', 6, 'evening', true),
('fa975638-465d-45e4-9f0c-5944b6300783', 0, 'evening', true),

-- Sloan: weekend warrior, free Sat/Sun + Friday evenings
('e3cf8a88-1d42-4141-a7ec-5841891c07f6', 5, 'evening', true),
('e3cf8a88-1d42-4141-a7ec-5841891c07f6', 6, 'morning', true),
('e3cf8a88-1d42-4141-a7ec-5841891c07f6', 6, 'afternoon', true),
('e3cf8a88-1d42-4141-a7ec-5841891c07f6', 6, 'evening', true),
('e3cf8a88-1d42-4141-a7ec-5841891c07f6', 0, 'morning', true),
('e3cf8a88-1d42-4141-a7ec-5841891c07f6', 0, 'afternoon', true),
('e3cf8a88-1d42-4141-a7ec-5841891c07f6', 0, 'evening', true),

-- Ajit: morning person, free mornings + Sunday
('00e6f687-a9be-4633-870c-f0aea3904f99', 1, 'morning', true),
('00e6f687-a9be-4633-870c-f0aea3904f99', 2, 'morning', true),
('00e6f687-a9be-4633-870c-f0aea3904f99', 3, 'morning', true),
('00e6f687-a9be-4633-870c-f0aea3904f99', 4, 'morning', true),
('00e6f687-a9be-4633-870c-f0aea3904f99', 5, 'morning', true),
('00e6f687-a9be-4633-870c-f0aea3904f99', 5, 'afternoon', true),
('00e6f687-a9be-4633-870c-f0aea3904f99', 6, 'morning', true),
('00e6f687-a9be-4633-870c-f0aea3904f99', 6, 'afternoon', true),
('00e6f687-a9be-4633-870c-f0aea3904f99', 0, 'morning', true),
('00e6f687-a9be-4633-870c-f0aea3904f99', 0, 'afternoon', true),
('00e6f687-a9be-4633-870c-f0aea3904f99', 0, 'evening', true),

-- Thomas: evenings + full weekends
('35458c1e-f8e6-421d-b499-40651de1417a', 1, 'evening', true),
('35458c1e-f8e6-421d-b499-40651de1417a', 2, 'evening', true),
('35458c1e-f8e6-421d-b499-40651de1417a', 3, 'evening', true),
('35458c1e-f8e6-421d-b499-40651de1417a', 4, 'evening', true),
('35458c1e-f8e6-421d-b499-40651de1417a', 5, 'afternoon', true),
('35458c1e-f8e6-421d-b499-40651de1417a', 5, 'evening', true),
('35458c1e-f8e6-421d-b499-40651de1417a', 6, 'morning', true),
('35458c1e-f8e6-421d-b499-40651de1417a', 6, 'afternoon', true),
('35458c1e-f8e6-421d-b499-40651de1417a', 6, 'evening', true),
('35458c1e-f8e6-421d-b499-40651de1417a', 0, 'morning', true),
('35458c1e-f8e6-421d-b499-40651de1417a', 0, 'afternoon', true),
('35458c1e-f8e6-421d-b499-40651de1417a', 0, 'evening', true),

-- Eren: mixed, afternoons and evenings
('245add94-1f0d-4a03-ae65-b7d43c2fed7e', 1, 'afternoon', true),
('245add94-1f0d-4a03-ae65-b7d43c2fed7e', 1, 'evening', true),
('245add94-1f0d-4a03-ae65-b7d43c2fed7e', 2, 'evening', true),
('245add94-1f0d-4a03-ae65-b7d43c2fed7e', 3, 'afternoon', true),
('245add94-1f0d-4a03-ae65-b7d43c2fed7e', 4, 'evening', true),
('245add94-1f0d-4a03-ae65-b7d43c2fed7e', 5, 'afternoon', true),
('245add94-1f0d-4a03-ae65-b7d43c2fed7e', 5, 'evening', true),
('245add94-1f0d-4a03-ae65-b7d43c2fed7e', 6, 'morning', true),
('245add94-1f0d-4a03-ae65-b7d43c2fed7e', 6, 'afternoon', true),
('245add94-1f0d-4a03-ae65-b7d43c2fed7e', 6, 'evening', true),
('245add94-1f0d-4a03-ae65-b7d43c2fed7e', 0, 'afternoon', true),
('245add94-1f0d-4a03-ae65-b7d43c2fed7e', 0, 'evening', true),

-- Kevin: afternoons + evenings + weekends
('f80ba9e3-f645-473e-b22c-bc4766c50d59', 1, 'afternoon', true),
('f80ba9e3-f645-473e-b22c-bc4766c50d59', 1, 'evening', true),
('f80ba9e3-f645-473e-b22c-bc4766c50d59', 2, 'afternoon', true),
('f80ba9e3-f645-473e-b22c-bc4766c50d59', 2, 'evening', true),
('f80ba9e3-f645-473e-b22c-bc4766c50d59', 3, 'afternoon', true),
('f80ba9e3-f645-473e-b22c-bc4766c50d59', 3, 'evening', true),
('f80ba9e3-f645-473e-b22c-bc4766c50d59', 4, 'afternoon', true),
('f80ba9e3-f645-473e-b22c-bc4766c50d59', 4, 'evening', true),
('f80ba9e3-f645-473e-b22c-bc4766c50d59', 5, 'afternoon', true),
('f80ba9e3-f645-473e-b22c-bc4766c50d59', 5, 'evening', true),
('f80ba9e3-f645-473e-b22c-bc4766c50d59', 6, 'morning', true),
('f80ba9e3-f645-473e-b22c-bc4766c50d59', 6, 'afternoon', true),
('f80ba9e3-f645-473e-b22c-bc4766c50d59', 6, 'evening', true),
('f80ba9e3-f645-473e-b22c-bc4766c50d59', 0, 'morning', true),
('f80ba9e3-f645-473e-b22c-bc4766c50d59', 0, 'afternoon', true),
('f80ba9e3-f645-473e-b22c-bc4766c50d59', 0, 'evening', true),

-- Test User: moderate availability, evenings + weekends
('7bee92b5-4b26-4675-a5d1-f0ea14ff8503', 1, 'evening', true),
('7bee92b5-4b26-4675-a5d1-f0ea14ff8503', 3, 'evening', true),
('7bee92b5-4b26-4675-a5d1-f0ea14ff8503', 5, 'evening', true),
('7bee92b5-4b26-4675-a5d1-f0ea14ff8503', 6, 'afternoon', true),
('7bee92b5-4b26-4675-a5d1-f0ea14ff8503', 6, 'evening', true),
('7bee92b5-4b26-4675-a5d1-f0ea14ff8503', 0, 'afternoon', true),
('7bee92b5-4b26-4675-a5d1-f0ea14ff8503', 0, 'evening', true);

-- ============================================================
-- AVAILABILITY SLOTS (specific date overrides for next 3 weeks)
-- These add variety on top of patterns
-- Dates: 2026-02-25 through 2026-03-17
-- ============================================================

INSERT INTO availability_slots (user_id, date, time_block, is_available) VALUES

-- Alex Chen: busy this coming weekend (Feb 28 - Mar 1), free extra Sat Mar 7 morning
('ef5bd451-dc60-43cb-9467-49c57ce134bd', '2026-03-01', 'morning', false),
('ef5bd451-dc60-43cb-9467-49c57ce134bd', '2026-03-01', 'afternoon', false),
('ef5bd451-dc60-43cb-9467-49c57ce134bd', '2026-03-07', 'morning', true),
('ef5bd451-dc60-43cb-9467-49c57ce134bd', '2026-03-12', 'morning', true),

-- Jordan Kim: busy Wed Mar 4 evening (exam), free extra Fri Feb 28 morning
('7088d687-99f0-46dd-a37e-39ab1f45fe81', '2026-03-04', 'evening', false),
('7088d687-99f0-46dd-a37e-39ab1f45fe81', '2026-02-28', 'morning', true),
('7088d687-99f0-46dd-a37e-39ab1f45fe81', '2026-03-10', 'morning', true),

-- Maya Patel: free extra Sat Feb 28 afternoon, busy Mon Mar 9 evening
('be28a3ee-83a7-4339-b687-2064f46baebf', '2026-02-28', 'afternoon', true),
('be28a3ee-83a7-4339-b687-2064f46baebf', '2026-03-09', 'evening', false),
('be28a3ee-83a7-4339-b687-2064f46baebf', '2026-03-14', 'morning', true),

-- Sam Rivera: busy entire weekend Mar 7-8 (out of town)
('13feef63-2291-41d7-ad0e-eebfe10f44df', '2026-03-07', 'morning', false),
('13feef63-2291-41d7-ad0e-eebfe10f44df', '2026-03-07', 'afternoon', false),
('13feef63-2291-41d7-ad0e-eebfe10f44df', '2026-03-07', 'evening', false),
('13feef63-2291-41d7-ad0e-eebfe10f44df', '2026-03-08', 'morning', false),
('13feef63-2291-41d7-ad0e-eebfe10f44df', '2026-03-08', 'afternoon', false),
('13feef63-2291-41d7-ad0e-eebfe10f44df', '2026-03-08', 'evening', false),

-- Tyler Brooks: free extra Thu Feb 27 afternoon
('be53c5c2-6012-473c-95e3-69be508da895', '2026-02-27', 'afternoon', true),
('be53c5c2-6012-473c-95e3-69be508da895', '2026-03-05', 'afternoon', true),
('be53c5c2-6012-473c-95e3-69be508da895', '2026-03-13', 'morning', true),

-- Rishi: busy Sat Mar 14 (wedding), free extra Wed Mar 11 afternoon
('9f8b50bb-6ed4-4510-99f1-8b7a32c3256e', '2026-03-14', 'morning', false),
('9f8b50bb-6ed4-4510-99f1-8b7a32c3256e', '2026-03-14', 'afternoon', false),
('9f8b50bb-6ed4-4510-99f1-8b7a32c3256e', '2026-03-14', 'evening', false),
('9f8b50bb-6ed4-4510-99f1-8b7a32c3256e', '2026-03-11', 'afternoon', true),

-- Shikhar: free Fri Mar 6 + Mon Mar 2 evening
('1f542858-78f2-4aca-9c9d-6f844c16b4dd', '2026-03-06', 'afternoon', true),
('1f542858-78f2-4aca-9c9d-6f844c16b4dd', '2026-03-06', 'evening', true),
('1f542858-78f2-4aca-9c9d-6f844c16b4dd', '2026-03-02', 'evening', true),

-- Vivian: busy Sat Mar 7 morning (commitment), free Tue Mar 10 morning
('4f308711-56de-4c37-9710-89d531b43c04', '2026-03-07', 'morning', false),
('4f308711-56de-4c37-9710-89d531b43c04', '2026-03-10', 'morning', true),
('4f308711-56de-4c37-9710-89d531b43c04', '2026-03-16', 'morning', true),

-- James: busy Thu Mar 12 evening, free extra Sat Feb 28 morning
('8ff448d5-c3b3-4b5c-b397-ea4d6d80d78b', '2026-03-12', 'evening', false),
('8ff448d5-c3b3-4b5c-b397-ea4d6d80d78b', '2026-02-28', 'morning', true),

-- Eunsoo: free extra Thu Feb 27 afternoon, busy Sun Mar 15
('af180fe0-a3be-497f-bec3-c2a8dec40266', '2026-02-27', 'afternoon', true),
('af180fe0-a3be-497f-bec3-c2a8dec40266', '2026-03-15', 'morning', false),
('af180fe0-a3be-497f-bec3-c2a8dec40266', '2026-03-15', 'afternoon', false),

-- Pavan: busy Sat Mar 7 (travel), free Wed Mar 11 afternoon
('7101fcb0-07a9-44fc-b961-c2066f9c04e8', '2026-03-07', 'morning', false),
('7101fcb0-07a9-44fc-b961-c2066f9c04e8', '2026-03-07', 'afternoon', false),
('7101fcb0-07a9-44fc-b961-c2066f9c04e8', '2026-03-11', 'afternoon', true),
('7101fcb0-07a9-44fc-b961-c2066f9c04e8', '2026-03-04', 'morning', true),

-- Ady: briefly busy Mon Mar 9 evening
('5220aef7-7508-4e33-aa2b-7a0fc4b7ee00', '2026-03-09', 'evening', false),
('5220aef7-7508-4e33-aa2b-7a0fc4b7ee00', '2026-03-16', 'morning', true),

-- Vinisha: busy Sun Mar 1 (family), free extra Fri Mar 6 afternoon
('97660462-30ed-4575-82da-82f106aabf45', '2026-03-01', 'morning', false),
('97660462-30ed-4575-82da-82f106aabf45', '2026-03-01', 'afternoon', false),
('97660462-30ed-4575-82da-82f106aabf45', '2026-03-06', 'afternoon', true),

-- Stefano: free extra Tue Mar 3 morning, busy Sat Mar 14 afternoon
('53fa598f-fa40-49e2-bf91-b495dbac3b55', '2026-03-03', 'morning', true),
('53fa598f-fa40-49e2-bf91-b495dbac3b55', '2026-03-14', 'afternoon', false),
('53fa598f-fa40-49e2-bf91-b495dbac3b55', '2026-03-14', 'evening', false),

-- Kethan: free Fri Feb 27 afternoon + morning, busy Sun Mar 8
('cbb1bfd8-beb0-4a1a-9c48-fba695d6e1f9', '2026-02-27', 'morning', true),
('cbb1bfd8-beb0-4a1a-9c48-fba695d6e1f9', '2026-03-08', 'morning', false),
('cbb1bfd8-beb0-4a1a-9c48-fba695d6e1f9', '2026-03-08', 'afternoon', false),
('cbb1bfd8-beb0-4a1a-9c48-fba695d6e1f9', '2026-03-13', 'afternoon', true),

-- Ronin: free extra Sat Mar 7 morning (unusual), busy Wed Mar 4 evening
('fa975638-465d-45e4-9f0c-5944b6300783', '2026-03-07', 'morning', true),
('fa975638-465d-45e4-9f0c-5944b6300783', '2026-03-04', 'evening', false),

-- Sloan: free extra Wed Mar 11 evening, busy Sat Mar 14 (out of town)
('e3cf8a88-1d42-4141-a7ec-5841891c07f6', '2026-03-11', 'evening', true),
('e3cf8a88-1d42-4141-a7ec-5841891c07f6', '2026-03-14', 'morning', false),
('e3cf8a88-1d42-4141-a7ec-5841891c07f6', '2026-03-14', 'afternoon', false),
('e3cf8a88-1d42-4141-a7ec-5841891c07f6', '2026-03-14', 'evening', false),
('e3cf8a88-1d42-4141-a7ec-5841891c07f6', '2026-03-15', 'morning', false),
('e3cf8a88-1d42-4141-a7ec-5841891c07f6', '2026-03-15', 'afternoon', false),

-- Ajit: busy Sat Mar 7 morning (marathon!), free Thu Mar 5 afternoon
('00e6f687-a9be-4633-870c-f0aea3904f99', '2026-03-07', 'morning', false),
('00e6f687-a9be-4633-870c-f0aea3904f99', '2026-03-05', 'afternoon', true),
('00e6f687-a9be-4633-870c-f0aea3904f99', '2026-03-12', 'afternoon', true),

-- Thomas: busy Fri Mar 6 evening, free extra Mon Mar 2 afternoon
('35458c1e-f8e6-421d-b499-40651de1417a', '2026-03-06', 'evening', false),
('35458c1e-f8e6-421d-b499-40651de1417a', '2026-03-02', 'afternoon', true),
('35458c1e-f8e6-421d-b499-40651de1417a', '2026-03-16', 'morning', true),

-- Eren: free extra Mon Mar 9 morning, busy Sat Mar 14
('245add94-1f0d-4a03-ae65-b7d43c2fed7e', '2026-03-09', 'morning', true),
('245add94-1f0d-4a03-ae65-b7d43c2fed7e', '2026-03-14', 'morning', false),
('245add94-1f0d-4a03-ae65-b7d43c2fed7e', '2026-03-14', 'afternoon', false),
('245add94-1f0d-4a03-ae65-b7d43c2fed7e', '2026-03-10', 'morning', true),

-- Kevin: busy Wed Feb 25 evening (tonight), free Sat Mar 14 + Sun Mar 15 extra
('f80ba9e3-f645-473e-b22c-bc4766c50d59', '2026-02-25', 'evening', false),
('f80ba9e3-f645-473e-b22c-bc4766c50d59', '2026-03-15', 'morning', true),
('f80ba9e3-f645-473e-b22c-bc4766c50d59', '2026-03-03', 'morning', true);
