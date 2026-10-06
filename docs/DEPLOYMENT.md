# CEOWEB Deployment Guide

This document describes how to deploy **CEOWEB** to **Vercel** (frontend) and **Supabase** (backend database, authentication, storage, and realtime).

---

## 1. Prerequisites
- A GitHub repository with the CEOWEB codebase.
- A free account on [Supabase](https://supabase.com).
- A free account on [Vercel](https://vercel.com).
- (Optional for Live Audio/Video & Streaming): A free account on [LiveKit Cloud](https://livekit.io).

---

## 2. Backend Setup (Supabase)

1. Create a new project in the Supabase Dashboard.
2. Go to **Project Settings > API** and copy:
   - `Project URL`
   - `Project API anon/public key`
3. In the **SQL Editor**, run the migrations located in `/supabase/migrations/`:
   - `20261006000001_initial_schema.sql` (Creates all tables and indexes)
   - `20261006000002_rls_policies.sql` (Applies Row Level Security policies)
4. (Optional) Run `supabase/seed.sql` to populate sample profiles, wall posts, and challenges.

---

## 3. Storage Buckets Setup
In the **Storage** section of your Supabase dashboard, create the following public buckets:
- `avatars` (Profile pictures and covers)
- `posts` (Wall post images and attachments)
- `snaps` (Single-view ephemeral snaps)
- `voice_notes` (Recorded audio messages)

---

## 4. Frontend Deployment (Vercel)

1. Connect your GitHub repository to **Vercel**.
2. Set Framework Preset to **Next.js**.
3. Configure the following **Environment Variables**:
   - `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase Project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anon public key
   - `NEXT_PUBLIC_APP_URL`: Your Vercel production domain (e.g. `https://ceoweb.vercel.app`)
   - `NEXT_PUBLIC_LIVEKIT_URL`: (Optional) LiveKit Cloud WebSocket URL
   - `LIVEKIT_API_KEY`: (Optional) LiveKit API Key
   - `LIVEKIT_API_SECRET`: (Optional) LiveKit API Secret
4. Click **Deploy**. Vercel will run `npm run build` and launch the application.
