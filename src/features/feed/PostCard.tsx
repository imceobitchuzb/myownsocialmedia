'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Post, User, Comment } from '@/types/models';
import { BeltBadge } from '@/components/shared/BeltBadge';
import { Heart, MessageCircle, Share2, Pin, Trash2, Check, MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { socialDataService } from '@/lib/socialDataService';
import { useAuth } from '@/features/auth/AuthContext';
import { useI18n } from '@/features/i18n/LanguageContext';

interface PostCardProps {
  post: Post;
  currentUser?: User | null;
  onDelete?: (postId: string) => void;
  onLikeToggle?: (postId: string, liked: boolean) => void;
}

export const PostCard: React.FC<PostCardProps> = ({
  post,
  currentUser,
  onDelete,
  onLikeToggle,
}) => {
  const { addXP } = useAuth();
  const { t } = useI18n();

  const [liked, setLiked] = useState<boolean>(post.has_liked || false);
  const [likesCount, setLikesCount] = useState<number>(post.likes_count);
  const [showComments, setShowComments] = useState<boolean>(false);
  const [newComment, setNewComment] = useState<string>('');
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentsCount, setCommentsCount] = useState<number>(post.comments_count);
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const isOwner = currentUser?.id === post.author_id || currentUser?.is_admin;

  // Handle Like with real persistence
  const handleLike = async () => {
    if (!currentUser) return;
    const nextState = !liked;
    setLiked(nextState);
    setLikesCount((prev) => (nextState ? prev + 1 : Math.max(0, prev - 1)));

    try {
      const res = await socialDataService.toggleLikePost(post.id, currentUser.id);
      setLikesCount(res.count);
      setLiked(res.liked);
      if (res.liked) {
        addXP(5, 'like_post', `like_${post.id}`);
      }
      if (onLikeToggle) onLikeToggle(post.id, res.liked);
    } catch (err) {
      console.error('Failed to toggle like:', err);
    }
  };

  // Load comments on drawer expand
  const handleToggleComments = async () => {
    const nextShow = !showComments;
    setShowComments(nextShow);
    if (nextShow && comments.length === 0) {
      const loaded = await socialDataService.getComments(post.id);
      setComments(loaded);
      setCommentsCount(loaded.length);
    }
  };

  // Submit comment with real persistence
  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !currentUser) return;

    const commentText = newComment.trim();
    setNewComment('');

    try {
      const created = await socialDataService.addComment(post.id, {
        author_id: currentUser.id,
        author: currentUser,
        content: commentText,
      });

      setComments((prev) => [...prev, created]);
      setCommentsCount((prev) => prev + 1);
      addXP(10, 'comment_post', `comment_${created.id}`);
    } catch (err) {
      console.error('Failed to add comment:', err);
    }
  };

  // Delete post
  const handleDeletePost = async () => {
    if (!currentUser || !isOwner) return;
    if (!confirm(t.delete_confirm)) return;

    setIsDeleting(true);
    try {
      const ok = await socialDataService.deletePost(post.id, currentUser.id);
      if (ok && onDelete) {
        onDelete(post.id);
      }
    } catch (err) {
      console.error('Failed to delete post:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  // Share post link
  const handleShare = () => {
    if (typeof window !== 'undefined') {
      const url = `${window.location.origin}/#post-${post.id}`;
      navigator.clipboard?.writeText(url);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const moodBadges: Record<string, { label: string; bg: string }> = {
    chill: { label: t.chill, bg: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' },
    funny: { label: t.funny, bg: 'bg-amber-500/10 text-amber-500 border-amber-500/20' },
    creative: { label: t.creative, bg: 'bg-purple-500/10 text-purple-500 border-purple-500/20' },
    study: { label: t.study, bg: 'bg-blue-500/10 text-blue-500 border-blue-500/20' },
    none: { label: '', bg: 'hidden' },
  };

  return (
    <article
      id={`post-${post.id}`}
      className="bg-card border border-border/80 rounded-3xl p-5 sm:p-6 shadow-sm hover:border-border transition-all duration-200"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4 gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <Link href={`/profile/${post.author.username}`} className="flex-shrink-0 group">
            <img
              src={post.author.avatar_url}
              alt={post.author.display_name}
              className="w-11 h-11 rounded-full object-cover ring-2 ring-border/80 group-hover:ring-primary/50 transition"
              loading="lazy"
            />
          </Link>
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <Link
                href={`/profile/${post.author.username}`}
                className="font-bold text-sm text-foreground hover:text-primary transition truncate"
              >
                {post.author.display_name}
              </Link>
              <BeltBadge xp={post.author.xp} size="sm" showTitle={false} />
              {post.is_pinned && (
                <span className="flex items-center gap-1 text-[10px] text-amber-500 font-semibold bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                  <Pin className="w-2.5 h-2.5" /> {t.pinned}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
              <span>@{post.author.username}</span>
              <span>•</span>
              <time dateTime={post.created_at}>
                {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
              </time>
              {post.community_name && (
                <>
                  <span>•</span>
                  <span className="text-primary font-medium">{post.community_name}</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Right Header: Mood Badge & Delete option */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {post.mood && post.mood !== 'none' && moodBadges[post.mood] && (
            <span
              className={cn(
                'text-[11px] font-semibold px-2.5 py-1 rounded-full border',
                moodBadges[post.mood].bg
              )}
            >
              {moodBadges[post.mood].label}
            </span>
          )}

          {isOwner && (
            <button
              onClick={handleDeletePost}
              disabled={isDeleting}
              title={t.delete_post}
              className="p-1.5 text-muted-foreground/60 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Post Text Content */}
      <p className="text-foreground/95 text-sm sm:text-[15px] leading-relaxed whitespace-pre-line mb-4 font-normal break-words">
        {post.content}
      </p>

      {/* Media Attachment Gallery */}
      {post.media_urls && post.media_urls.length > 0 && (
        <div className="rounded-2xl overflow-hidden mb-4 border border-border/80 bg-secondary/30 max-h-[460px]">
          <img
            src={post.media_urls[0]}
            alt="Attachment"
            className="w-full h-full object-cover max-h-[460px] hover:scale-[1.01] transition-transform duration-300"
            loading="lazy"
          />
        </div>
      )}

      {/* Action Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-border/60 text-muted-foreground text-xs font-medium">
        <div className="flex items-center gap-4">
          <button
            onClick={handleLike}
            aria-label="Like"
            className={cn(
              'flex items-center gap-1.5 transition-colors px-2 py-1.5 rounded-xl hover:bg-secondary/70 active:scale-95',
              liked ? 'text-rose-500 font-bold' : 'hover:text-foreground'
            )}
          >
            <Heart className={cn('w-4 h-4 transition-transform', liked && 'fill-rose-500 scale-110')} />
            <span>{likesCount}</span>
          </button>

          <button
            onClick={handleToggleComments}
            aria-label="Comments"
            className="flex items-center gap-1.5 hover:text-foreground transition-colors px-2 py-1.5 rounded-xl hover:bg-secondary/70 active:scale-95"
          >
            <MessageCircle className="w-4 h-4" />
            <span>{commentsCount}</span>
          </button>
        </div>

        <button
          onClick={handleShare}
          aria-label="Share"
          className="flex items-center gap-1.5 hover:text-foreground transition-colors px-2.5 py-1.5 rounded-xl hover:bg-secondary/70 active:scale-95"
        >
          {isCopied ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
          <span>{isCopied ? 'Скопировано' : t.share}</span>
        </button>
      </div>

      {/* Comments Drawer */}
      {showComments && (
        <div className="mt-4 pt-4 border-t border-border/50 flex flex-col gap-3 animate-fade-in">
          {currentUser && (
            <form onSubmit={handleCommentSubmit} className="flex gap-2">
              <input
                type="text"
                placeholder={t.add_comment_placeholder}
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="flex-1 bg-secondary/50 border border-border rounded-xl px-3.5 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <button
                type="submit"
                disabled={!newComment.trim()}
                className="px-4 py-2 bg-primary text-primary-foreground text-xs font-semibold rounded-xl hover:opacity-90 disabled:opacity-50 transition"
              >
                {t.reply}
              </button>
            </form>
          )}

          <div className="flex flex-col gap-2 max-h-60 overflow-y-auto pr-1">
            {comments.map((comm) => (
              <div key={comm.id} className="bg-secondary/30 border border-border/40 p-3 rounded-2xl text-xs flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <Link href={`/profile/${comm.author.username}`} className="font-semibold text-foreground hover:underline">
                    {comm.author.display_name}
                  </Link>
                  <span className="text-[10px] text-muted-foreground">
                    {formatDistanceToNow(new Date(comm.created_at), { addSuffix: true })}
                  </span>
                </div>
                <p className="text-foreground/90 leading-relaxed">{comm.content}</p>
              </div>
            ))}

            {comments.length === 0 && (
              <p className="text-center py-3 text-xs text-muted-foreground italic">
                Пока нет комментариев. Будьте первыми!
              </p>
            )}
          </div>
        </div>
      )}
    </article>
  );
};
