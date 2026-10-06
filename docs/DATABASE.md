# NinjaLoop Database Architecture

## Entity-Relationship Diagram (Mermaid)

```mermaid
erDiagram
    PROFILES ||--o{ POSTS : "authors"
    PROFILES ||--o{ POST_COMMENTS : "writes"
    PROFILES ||--o{ POST_LIKES : "likes"
    PROFILES ||--o{ STORIES : "creates"
    PROFILES ||--o{ SNAPS : "sends/receives"
    PROFILES ||--o{ COMMUNITY_MEMBERS : "joins"
    PROFILES ||--o{ STORY_CHAINS : "starts"
    PROFILES ||--o{ CHAIN_NODES : "contributes"

    PROFILES {
        uuid id PK
        string username
        string display_name
        string avatar_url
        string bio
        string status_line
        int xp
        string belt_rank
        int age
        boolean is_admin
        timestamp created_at
    }

    POSTS {
        uuid id PK
        uuid author_id FK
        uuid community_id FK
        text content
        string[] media_urls
        string mood
        string privacy
        int likes_count
        int comments_count
        boolean is_pinned
        timestamp created_at
    }

    STORIES {
        uuid id PK
        uuid author_id FK
        string media_url
        string text_overlay
        int views_count
        timestamp created_at
        timestamp expires_at
    }

    SNAPS {
        uuid id PK
        uuid sender_id FK
        uuid recipient_id FK
        string media_url
        string caption
        string status
        timestamp opened_at
        timestamp created_at
    }

    STREAKS {
        uuid id PK
        uuid user1_id FK
        uuid user2_id FK
        int streak_count
        timestamp last_snap_at
        timestamp expires_at
    }

    STORY_CHAINS {
        uuid id PK
        string title
        text prompt
        uuid creator_id FK
        string status
        int current_round
        timestamp created_at
    }

    CHAIN_NODES {
        uuid id PK
        uuid chain_id FK
        uuid author_id FK
        int round_number
        text content
        int votes_count
        boolean is_winner
        timestamp created_at
    }
```

## Indexes for Query Acceleration
- `idx_posts_created_at`: `posts (created_at DESC)` for high-throughput feed queries.
- `idx_posts_mood`: `posts (mood)` for instant Mood Feed filtering.
- `idx_stories_expires_at`: `stories (expires_at)` for fast 24h expiration culling.
- `idx_chain_nodes_chain_round`: `chain_nodes (chain_id, round_number)` for efficient collaborative voting.
