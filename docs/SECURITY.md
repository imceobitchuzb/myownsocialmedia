# NinjaLoop Security & Row Level Security (RLS)

## 1. Principles
- **Least Privilege**: Users only access records explicitly allowed by active policies.
- **Strict Ephemeral Snap Guarantees**: Snaps are strictly constrained to `sender_id = auth.uid() OR recipient_id = auth.uid()`. Once viewed, the recipient initiates the `'opened'` state transition, locking further playback.
- **Moderation Isolation**: Content reports and flags are restricted to verified administrators (`is_admin = true`).

## 2. RLS Policy Matrix

| Table | Policy Name | Permitted Roles | SQL Check Expression |
|---|---|---|---|
| `profiles` | Public profiles | Authenticated & Anon | `FOR SELECT USING (true)` |
| `profiles` | Own profile edits | Authenticated | `FOR UPDATE USING (auth.uid() = id)` |
| `posts` | Privacy filtering | Authenticated | `privacy = 'public' OR author_id = auth.uid() OR is_friend()` |
| `snaps` | Strict participant check | Authenticated | `sender_id = auth.uid() OR recipient_id = auth.uid()` |
| `messages` | Conversation participant check | Authenticated | `EXISTS (SELECT 1 FROM conversation_participants WHERE user_id = auth.uid())` |
| `reports` | Admin review only | Admin users | `EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)` |

## 3. Rate Limiting & Safety
- **Profanity Filtering**: Text submissions pass client and database sanitization layers to prevent harassment.
- **Age Gate**: Minimum age of 13 enforced at signup schema level.
- **Session Protection**: JWT bearer tokens signed by Supabase Auth with automatic refresh.
