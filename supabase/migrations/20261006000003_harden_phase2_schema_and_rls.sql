-- CEOWEB Database Schema Hardening & Server-Authoritative Logic
-- Supabase Migration: 20261006000003_harden_phase2_schema_and_rls.sql

-- 1. Extend profiles with all fields
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS cover_url TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS location_city TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS ghost_mode BOOLEAN DEFAULT FALSE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS website_url TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS pronouns TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS relationship_status TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS interests TEXT[] DEFAULT '{}';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS accent_color TEXT DEFAULT '#E11D48';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS pinned_post_id UUID;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS username_last_changed TIMESTAMPTZ;

-- 2. Follows Table (Social Graph)
CREATE TABLE IF NOT EXISTS public.follows (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  follower_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  following_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  CONSTRAINT unique_follow UNIQUE (follower_id, following_id),
  CONSTRAINT no_self_follow CHECK (follower_id <> following_id)
);

CREATE INDEX IF NOT EXISTS idx_follows_follower ON public.follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_following ON public.follows(following_id);

-- 3. Story Views Table
CREATE TABLE IF NOT EXISTS public.story_views (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  story_id UUID REFERENCES public.stories(id) ON DELETE CASCADE NOT NULL,
  viewer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  CONSTRAINT unique_story_view UNIQUE (story_id, viewer_id)
);

CREATE INDEX IF NOT EXISTS idx_story_views_story ON public.story_views(story_id);

-- 4. Server-Authoritative XP Ledger Table
CREATE TABLE IF NOT EXISTS public.xp_ledger (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  amount INTEGER NOT NULL CHECK (amount > 0 AND amount <= 100),
  source_action TEXT NOT NULL,
  source_ref_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  CONSTRAINT unique_user_xp_event UNIQUE (user_id, source_action, source_ref_id)
);

CREATE INDEX IF NOT EXISTS idx_xp_ledger_user ON public.xp_ledger(user_id);

-- 5. Notifications Table
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  recipient_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('like', 'comment', 'follow', 'snap', 'belt_rank', 'challenge', 'chain_turn', 'system')),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  link TEXT,
  is_read BOOLEAN DEFAULT FALSE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_notifications_recipient ON public.notifications(recipient_id, created_at DESC);

-- 6. Snaps Expiration Column
ALTER TABLE public.snaps ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '24 hours') NOT NULL;
CREATE INDEX IF NOT EXISTS idx_snaps_recipient_status ON public.snaps(recipient_id, status);

-- 7. ENABLE ROW LEVEL SECURITY ON NEW TABLES
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.story_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.xp_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- 8. RLS POLICIES FOR ALL PREVIOUSLY UNCOVERED TABLES

-- Post Likes
DROP POLICY IF EXISTS "Post likes are viewable by everyone" ON public.post_likes;
CREATE POLICY "Post likes are viewable by everyone" ON public.post_likes
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can like posts" ON public.post_likes;
CREATE POLICY "Authenticated users can like posts" ON public.post_likes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can unlike their own likes" ON public.post_likes;
CREATE POLICY "Users can unlike their own likes" ON public.post_likes
  FOR DELETE USING (auth.uid() = user_id);

-- Post Comments
DROP POLICY IF EXISTS "Comments are viewable by everyone" ON public.post_comments;
CREATE POLICY "Comments are viewable by everyone" ON public.post_comments
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can comment" ON public.post_comments;
CREATE POLICY "Authenticated users can comment" ON public.post_comments
  FOR INSERT WITH CHECK (auth.uid() = author_id);

DROP POLICY IF EXISTS "Authors can update their own comments" ON public.post_comments;
CREATE POLICY "Authors can update their own comments" ON public.post_comments
  FOR UPDATE USING (auth.uid() = author_id);

DROP POLICY IF EXISTS "Authors can delete their own comments" ON public.post_comments;
CREATE POLICY "Authors can delete their own comments" ON public.post_comments
  FOR DELETE USING (auth.uid() = author_id);

-- Follows
DROP POLICY IF EXISTS "Follows are viewable by everyone" ON public.follows;
CREATE POLICY "Follows are viewable by everyone" ON public.follows
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can follow" ON public.follows;
CREATE POLICY "Authenticated users can follow" ON public.follows
  FOR INSERT WITH CHECK (auth.uid() = follower_id AND follower_id <> following_id);

DROP POLICY IF EXISTS "Users can unfollow" ON public.follows;
CREATE POLICY "Users can unfollow" ON public.follows
  FOR DELETE USING (auth.uid() = follower_id);

-- Stories (Strict 24h expiration in DB query)
DROP POLICY IF EXISTS "Active stories are viewable by everyone" ON public.stories;
CREATE POLICY "Active stories are viewable by everyone" ON public.stories
  FOR SELECT USING (expires_at > NOW());

DROP POLICY IF EXISTS "Authenticated users can post stories" ON public.stories;
CREATE POLICY "Authenticated users can post stories" ON public.stories
  FOR INSERT WITH CHECK (auth.uid() = author_id);

DROP POLICY IF EXISTS "Authors can delete their own stories" ON public.stories;
CREATE POLICY "Authors can delete their own stories" ON public.stories
  FOR DELETE USING (auth.uid() = author_id);

-- Story Views
DROP POLICY IF EXISTS "Story views viewable by viewer or story author" ON public.story_views;
CREATE POLICY "Story views viewable by viewer or story author" ON public.story_views
  FOR SELECT USING (
    viewer_id = auth.uid() OR
    EXISTS (SELECT 1 FROM public.stories s WHERE s.id = story_id AND s.author_id = auth.uid())
  );

DROP POLICY IF EXISTS "Users can record story view" ON public.story_views;
CREATE POLICY "Users can record story view" ON public.story_views
  FOR INSERT WITH CHECK (auth.uid() = viewer_id);

-- Snaps (Strict Ephemeral Security: Burned snaps inaccessible to recipient)
DROP POLICY IF EXISTS "Snaps viewable only by sender or recipient while delivered" ON public.snaps;
CREATE POLICY "Snaps viewable only by sender or recipient while delivered" ON public.snaps
  FOR SELECT USING (
    sender_id = auth.uid() OR
    (recipient_id = auth.uid() AND status = 'delivered' AND expires_at > NOW())
  );

-- XP Ledger
DROP POLICY IF EXISTS "Users can read own XP ledger" ON public.xp_ledger;
CREATE POLICY "Users can read own XP ledger" ON public.xp_ledger
  FOR SELECT USING (user_id = auth.uid());

-- Notifications
DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;
CREATE POLICY "Users can view own notifications" ON public.notifications
  FOR SELECT USING (recipient_id = auth.uid());

DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;
CREATE POLICY "Users can update own notifications" ON public.notifications
  FOR UPDATE USING (recipient_id = auth.uid());

DROP POLICY IF EXISTS "Users can delete own notifications" ON public.notifications;
CREATE POLICY "Users can delete own notifications" ON public.notifications
  FOR DELETE USING (recipient_id = auth.uid());

-- Communities & Members
DROP POLICY IF EXISTS "Communities are viewable by everyone" ON public.communities;
CREATE POLICY "Communities are viewable by everyone" ON public.communities
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Community members are viewable by everyone" ON public.community_members;
CREATE POLICY "Community members are viewable by everyone" ON public.community_members
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can join communities" ON public.community_members;
CREATE POLICY "Authenticated users can join communities" ON public.community_members
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Members can leave communities" ON public.community_members;
CREATE POLICY "Members can leave communities" ON public.community_members
  FOR DELETE USING (auth.uid() = user_id);

-- Story Chains & Nodes
DROP POLICY IF EXISTS "Story chains viewable by everyone" ON public.story_chains;
CREATE POLICY "Story chains viewable by everyone" ON public.story_chains
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Chain nodes viewable by everyone" ON public.chain_nodes;
CREATE POLICY "Chain nodes viewable by everyone" ON public.chain_nodes
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can add chain nodes" ON public.chain_nodes;
CREATE POLICY "Authenticated users can add chain nodes" ON public.chain_nodes
  FOR INSERT WITH CHECK (auth.uid() = author_id);

-- Challenges
DROP POLICY IF EXISTS "Challenges viewable by everyone" ON public.challenges;
CREATE POLICY "Challenges viewable by everyone" ON public.challenges
  FOR SELECT USING (true);

-- 9. ATOMIC RPC FUNCTIONS

-- Function 1: Atomic Open and Burn Snap (guarantees view-once, replay safe)
CREATE OR REPLACE FUNCTION public.burn_snap(snap_id UUID)
RETURNS TABLE(id UUID, media_url TEXT, caption TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  UPDATE public.snaps
  SET status = 'opened', opened_at = NOW()
  WHERE public.snaps.id = snap_id
    AND public.snaps.recipient_id = auth.uid()
    AND public.snaps.status = 'delivered'
    AND public.snaps.expires_at > NOW()
  RETURNING public.snaps.id, public.snaps.media_url, public.snaps.caption;
END;
$$;

-- Function 2: Server-Authoritative Idempotent XP Awarding
CREATE OR REPLACE FUNCTION public.award_xp(p_amount INTEGER, p_action TEXT, p_ref_id TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_inserted BOOLEAN := FALSE;
  v_new_xp INTEGER;
  v_new_belt TEXT;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Validate maximum reward bound per event
  IF p_amount <= 0 OR p_amount > 100 THEN
    RAISE EXCEPTION 'Invalid XP amount: must be between 1 and 100';
  END IF;

  -- Idempotent ledger entry
  INSERT INTO public.xp_ledger (user_id, amount, source_action, source_ref_id)
  VALUES (v_user_id, p_amount, p_action, p_ref_id)
  ON CONFLICT (user_id, source_action, source_ref_id) DO NOTHING;

  GET DIAGNOSTICS v_inserted = ROW_COUNT;

  IF v_inserted THEN
    UPDATE public.profiles
    SET xp = xp + p_amount,
        belt_rank = CASE
          WHEN (xp + p_amount) >= 5000 THEN 'black'
          WHEN (xp + p_amount) >= 2500 THEN 'brown'
          WHEN (xp + p_amount) >= 1200 THEN 'blue'
          WHEN (xp + p_amount) >= 600 THEN 'green'
          WHEN (xp + p_amount) >= 300 THEN 'orange'
          WHEN (xp + p_amount) >= 100 THEN 'yellow'
          ELSE 'white'
        END,
        updated_at = NOW()
    WHERE id = v_user_id
    RETURNING xp, belt_rank INTO v_new_xp, v_new_belt;

    RETURN jsonb_build_object(
      'success', true,
      'awarded', p_amount,
      'xp', v_new_xp,
      'belt_rank', v_new_belt
    );
  ELSE
    SELECT xp, belt_rank INTO v_new_xp, v_new_belt FROM public.profiles WHERE id = v_user_id;
    RETURN jsonb_build_object(
      'success', false,
      'reason', 'duplicate_event',
      'xp', v_new_xp,
      'belt_rank', v_new_belt
    );
  END IF;
END;
$$;

-- Function 3: Story View Recording
CREATE OR REPLACE FUNCTION public.record_story_view(p_story_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_inserted BOOLEAN := FALSE;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RETURN FALSE;
  END IF;

  INSERT INTO public.story_views (story_id, viewer_id)
  VALUES (p_story_id, v_user_id)
  ON CONFLICT (story_id, viewer_id) DO NOTHING;

  GET DIAGNOSTICS v_inserted = ROW_COUNT;

  IF v_inserted THEN
    UPDATE public.stories
    SET views_count = views_count + 1
    WHERE id = p_story_id;
    RETURN TRUE;
  END IF;

  RETURN FALSE;
END;
$$;

-- Function 4: Safe Profile Creation Trigger for Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_username TEXT;
  v_display_name TEXT;
BEGIN
  v_username := COALESCE(
    NEW.raw_user_meta_data->>'username',
    split_part(NEW.email, '@', 1) || '_' || substr(NEW.id::text, 1, 4)
  );
  v_display_name := COALESCE(
    NEW.raw_user_meta_data->>'display_name',
    split_part(NEW.email, '@', 1)
  );

  INSERT INTO public.profiles (
    id,
    username,
    display_name,
    avatar_url,
    xp,
    belt_rank,
    age
  ) VALUES (
    NEW.id,
    v_username,
    v_display_name,
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    0,
    'white',
    18
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
