-- Create some test conversations and messages for demo
-- Conversation between DJ Luna and Le Warehouse
INSERT INTO public.conversations (id, title, type) VALUES 
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Booking - Le Warehouse', 'direct'),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Collaboration Sophie & Marcus', 'direct');

-- Add participants to conversations
INSERT INTO public.conversation_participants (conversation_id, user_id) VALUES 
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111'), -- DJ Luna
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '55555555-5555-5555-5555-555555555555'), -- Le Warehouse
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '33333333-3333-3333-3333-333333333333'), -- Sophie Dubois
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '22222222-2222-2222-2222-222222222222'); -- Marcus Beat

-- Add some test messages
INSERT INTO public.messages (conversation_id, sender_id, content) VALUES 
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '55555555-5555-5555-5555-555555555555', 'Salut DJ Luna ! Nous recherchons un DJ pour notre soirée du 15 septembre. Êtes-vous disponible ?'),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', 'Bonjour ! Oui je suis disponible cette date. Pouvez-vous me donner plus de détails sur l''événement ?'),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '55555555-5555-5555-5555-555555555555', 'Parfait ! C''est une soirée house/techno, de 22h à 4h. Budget entre 800-1200€. Matériel fourni.'),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '33333333-3333-3333-3333-333333333333', 'Salut Marcus ! J''ai vu ton profil, ton style m''intéresse pour un de mes événements.'),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '22222222-2222-2222-2222-222222222222', 'Merci Sophie ! Je serais ravi de discuter d''une collaboration. De quel type d''événement s''agit-il ?');