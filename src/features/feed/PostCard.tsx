'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Post, User } from '@/types/models';
import { BeltBadge } from '@/components/shared/BeltBadge';
import { Heart, MessageCircle, Share2, Sparkles, Pin } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

interface PostCardProps {
  post: Post;
  currentUser?: User | null;
  onLikeToggle?: (postId: string) => void;
  onAddComment?: (postId: string, commentText: string) => void;
}

export const PostCard: React.FC<PostCardProps> = ({
  post,
  currentUser,
  onLikeToggle,
  onAddComment,
}) => {
  const [liked, setLiked] = useState(post.has_liked || false);
  const [likesCount, setLikesCount] = useState(post.likes_count);
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [commentsList, setCommentsList] = useState<string[]>([]);

  const handleLike = () => {
    const nextState = !liked;
    setLiked(nextState);
    setLikesCount(prev => (nextState ? prev + 1 : prev - 1));
    if (onLikeToggle) onLikeToggle(post.id);
  };

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setCommentsList(prev => [...prev, newComment.trim()]);
    if (onAddComment) onAddComment(post.id, newComment.trim());
    setNewComment('');
  };

  const moodColors: Record<string, string> = {
    chill: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    funny: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    creative: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
    study: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    none: 'hidden',
  };

  return (
    <article className="bg-card border border-border/80 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <Link href={`/profile/${post.author.username}`}>
            <img
              src={post.author.avatar_url}
              alt={post.author.display_name}
              className="w-11 h-11 rounded-full object-cover ring-2 ring-primary/20 hover:scale-105 transition-transform"
            />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <Link href={`/profile/${post.author.username}`} className="font-semibold text-sm hover:underline">
                {post.author.display_name}
              </Link>
              <BeltBadge xp={post.author.xp} size="sm" />
              {post.is_pinned && (
                <span className="flex items-center gap-0.5 text-[10px] text-amber-500 font-medium bg-amber-500/10 px-1.5 py-0.5 rounded-full">
                  <Pin className="w-2.5 h-2.5" /> Pinned
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
              <span>@{post.author.username}</span>
              <span>•</span>
              <time dateTime={post.created_at}>
                {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
              </time>
              {post.community_name && (
                <>
                  <span>•</span>
                  <span className="text-cyan-500 font-medium">in {post.community_name}</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Mood Tag */}
        {post.mood !== 'none' && (
          <span className={cn('text-xs font-semibold px-2.5 py-1 rounded-full border capitalize', moodColors[post.mood])}>
            {post.mood}
          </span>
        )}
      </div>

      {/* Content */}
      <p className="text-foreground text-sm leading-relaxed whitespace-pre-line mb-3 font-normal">
        {post.content}
      </p>

      {/* Media Gallery */}
      {post.media_urls && post.media_urls.length > 0 && (
        <div className="rounded-xl overflow-hidden mb-4 border border-border/60 max-h-96">
          <img
            src={post.media_urls[0]}
            alt="Post attachment"
            className="w-full h-full object-cover max-h-96 hover:scale-[1.01] transition-transform"
            loading="lazy"
          />
        </div>
      )}

      {/* Action Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-border/60 text-muted-foreground text-xs font-medium">
        <div className="flex items-center gap-4">
          <button
            onClick={handleLike}
            aria-label="Like post"
            className={cn(
              'flex items-center gap-1.5 transition-colors p-1 rounded-lg hover:bg-secondary',
              liked ? 'text-rose-500 font-bold' : 'hover:text-foreground'
            )}
          >
            <Heart className={cn('w-4 h-4', liked && 'fill-rose-500')} />
            <span>{likesCount}</span>
          </button>
          <button
            onClick={() => setShowComments(!showComments)}
            aria-label="Toggle comments"
            className="flex items-center gap-1.5 hover:text-foreground transition-colors p-1 rounded-lg hover:bg-secondary"
          >
            <MessageCircle className="w-4 h-4" />
            <span>{post.comments_count + commentsList.length}</span>
          </button>
        </div>
        <button
          onClick={() => {
            navigator.clipboard?.writeText(window.location.href);
            alert('Post link copied to clipboard!');
          }}
          aria-label="Share post"
          className="flex items-center gap-1 hover:text-foreground transition-colors p-1 rounded-lg hover:bg-secondary"
        >
          <Share2 className="w-4 h-4" />
          <span>Share</span>
        </button>
      </div>

      {/* Comments Drawer */}
      {showComments && (
        <div className="mt-4 pt-3 border-t border-border/40 flex flex-col gap-3">
          <form onSubmit={handleCommentSubmit} className="flex gap-2">
            <input
              type="text"
              placeholder="Write a constructive comment (+10 XP)..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="flex-1 bg-secondary/60 border border-border rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <button
              type="submit"
              className="px-3 py-1.5 bg-primary text-primary-foreground text-xs font-semibold rounded-xl hover:opacity-90 transition"
            >
              Reply
            </button>
          </form>

          {commentsList.map((comm, idx) => (
            <div key={idx} className="bg-secondary/40 p-2.5 rounded-xl text-xs flex gap-2">
              <span className="font-semibold text-primary">{currentUser?.display_name || 'You'}:</span>
              <span>{comm}</span>
            </div>
          ))}
        </div>
      )}
    </article>
  );
};
