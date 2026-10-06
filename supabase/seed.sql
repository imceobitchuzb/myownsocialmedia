-- CEOWEB Seed Data for Supabase
-- Populates demo users, initial wall posts, ephemeral stories, and challenges

INSERT INTO public.profiles (id, username, display_name, avatar_url, bio, status_line, xp, belt_rank, age, is_admin)
VALUES 
  ('00000000-0000-0000-0000-000000000001', 'kenji_coder', 'Kenji Sato', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80', 'Competitive programmer & mechanical keyboard builder.', 'Debugging Rust kernels 🦀', 5240, 'black', 19, true),
  ('00000000-0000-0000-0000-000000000002', 'maya_ai', 'Maya Lin', 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=300&q=80', 'CS sophomore @ Berkeley. Building agentic social feeds.', 'In library prepping for Midterms 📚', 2850, 'brown', 20, false),
  ('00000000-0000-0000-0000-000000000003', 'alex_cyber', 'Alex Vance', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80', 'Digital artist, synthwave enthusiast, and indie game dev.', 'Listening to Japanese City Pop 🎧', 1420, 'blue', 18, false)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.communities (id, name, slug, description, creator_id, rules_text, members_count)
VALUES
  ('10000000-0000-0000-0000-000000000001', 'Tokyo Creative Coders', 'tokyo-coders', 'Generative art & systems programming community in Tokyo.', '00000000-0000-0000-0000-000000000001', 'Be constructive and open source your work.', 1420),
  ('10000000-0000-0000-0000-000000000002', 'Minimalist Desk Setups', 'desk-setups', 'Ergonomic workspaces, monitor arms, and ambient lighting inspiration.', '00000000-0000-0000-0000-000000000003', 'Post original workspace setups.', 3890)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.posts (id, author_id, content, media_urls, mood, privacy, likes_count, comments_count)
VALUES
  ('20000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'Just deployed our custom sharding layer for the CEOWEB stream! Latency dropped under 18ms across all WebSocket regions.', ARRAY['https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80'], 'study', 'public', 34, 8),
  ('20000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000002', 'Finished round 4 of the campus hackathon! Our agentic assistant just synthesized 40 papers in under a minute.', ARRAY['https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80'], 'creative', 'public', 52, 14)
ON CONFLICT (id) DO NOTHING;
