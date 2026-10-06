import React from 'react';
import { cn } from '@/lib/utils';

export interface User {
  id: string;
  username: string;
  display_name: string;
  avatar_url: string;
  bio: string;
  status_line: string;
  xp: number;
  belt_rank: string;
  age: number;
  is_admin?: boolean;
}

export interface Post {
  id: string;
  author_id: string;
  author: User;
  community_id?: string | null;
  community_name?: string | null;
  content: string;
  media_urls?: string[];
  mood: 'chill' | 'funny' | 'creative' | 'study' | 'none';
  privacy: 'public' | 'friends_only';
  likes_count: number;
  comments_count: number;
  has_liked?: boolean;
  is_pinned?: boolean;
  created_at: string;
}

export interface Comment {
  id: string;
  post_id: string;
  author_id: string;
  author: User;
  parent_id?: string | null;
  content: string;
  created_at: string;
  replies?: Comment[];
}

export interface Story {
  id: string;
  author_id: string;
  author: User;
  media_url: string;
  text_overlay?: string;
  views_count: number;
  created_at: string;
  expires_at: string;
}

export interface SnapMessage {
  id: string;
  sender_id: string;
  sender: User;
  recipient_id: string;
  recipient: User;
  media_url: string;
  caption?: string;
  status: 'delivered' | 'opened';
  created_at: string;
  opened_at?: string;
}

export interface DirectMessage {
  id: string;
  conversation_id: string;
  sender_id: string;
  sender: User;
  content: string;
  media_url?: string;
  is_read: boolean;
  created_at: string;
}

export interface Community {
  id: string;
  slug: string;
  name: string;
  description: string;
  avatar_url: string;
  cover_url: string;
  creator_id: string;
  rules_text: string;
  members_count: number;
  is_joined?: boolean;
  is_admin?: boolean;
}

export interface StoryChainNode {
  id: string;
  chain_id: string;
  author_id: string;
  author: User;
  round_number: number;
  content: string;
  votes_count: number;
  has_voted?: boolean;
  is_winner: boolean;
  created_at: string;
}

export interface StoryChain {
  id: string;
  title: string;
  prompt: string;
  creator_id: string;
  creator: User;
  status: 'active' | 'completed';
  current_round: number;
  nodes: StoryChainNode[];
  created_at: string;
}

export interface WeeklyChallenge {
  id: string;
  title: string;
  prompt: string;
  theme_tag: string;
  starts_at: string;
  ends_at: string;
  is_active: boolean;
  submissions_count: number;
}

export interface ChallengeSubmission {
  id: string;
  challenge_id: string;
  user_id: string;
  user: User;
  post: Post;
  votes_count: number;
  has_voted?: boolean;
}

export interface NotificationItem {
  id: string;
  recipient_id: string;
  actor: User;
  type: 'friend_request' | 'like' | 'comment' | 'snap' | 'chain_vote' | 'challenge_win';
  message: string;
  link: string;
  is_read: boolean;
  created_at: string;
}
