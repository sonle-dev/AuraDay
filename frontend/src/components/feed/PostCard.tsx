import React, { useState } from 'react';
import { ProofPost } from '../../types';

interface PostCardProps {
  post: ProofPost;
  onLike?: (postId: number) => void;
  onNudge?: (postId: number) => void;
  onComment?: (postId: number, content: string) => void;
}

export const PostCard: React.FC<PostCardProps> = ({
  post,
  onLike,
  onNudge,
  onComment
}) => {
  const [isLiked, setIsLiked] = useState<boolean>(post.likedByCurrentUser);
  const [likeCount, setLikeCount] = useState<number>(post.likeCount);
  const [nudgeCount, setNudgeCount] = useState<number>(post.nudgeCount);
  const [isNudging, setIsNudging] = useState<boolean>(false);
  const [showComments, setShowComments] = useState<boolean>(false);
  const [commentText, setCommentText] = useState<string>('');
  const [comments, setComments] = useState<{ id: number; username: string; text: string }[]>([
    { id: 1, username: 'hoang_nam', text: 'Cố lên nhé đồng chí, mai lại dậy sớm tiếp!' }
  ]);
  const [nudgeFeedback, setNudgeFeedback] = useState<string | null>(null);

  // Toggle Like with heart pulse animation
  const handleToggleLike = () => {
    const nextState = !isLiked;
    setIsLiked(nextState);
    setLikeCount((prev) => (nextState ? prev + 1 : Math.max(0, prev - 1)));
    if (onLike) onLike(post.id);
  };

  // Nudge Micro-interaction
  const handleNudge = () => {
    setIsNudging(true);
    setNudgeCount((prev) => prev + 1);
    setNudgeFeedback(`🔔 Bạn vừa huých (Nudge) nhắc nhở ${post.username} giữ kỷ luật!`);

    setTimeout(() => {
      setIsNudging(false);
    }, 500);

    setTimeout(() => {
      setNudgeFeedback(null);
    }, 3000);

    if (onNudge) onNudge(post.id);
  };

  // Add Comment
  const handleSendComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    setComments((prev) => [
      ...prev,
      { id: Date.now(), username: 'Bạn', text: commentText.trim() }
    ]);
    if (onComment) onComment(post.id, commentText.trim());
    setCommentText('');
  };

  return (
    <article className="p-6 rounded-3xl bg-white border border-[#EFEAE2] space-y-4 shadow-sm shadow-amber-950/5 relative overflow-hidden transition-all hover:border-amber-300">
      {/* Toast Notification khi Nudge */}
      {nudgeFeedback && (
        <div className="absolute top-3 left-6 right-6 z-10 p-2.5 rounded-2xl bg-gradient-to-r from-amber-400 to-orange-400 text-stone-950 font-black text-xs text-center shadow-lg shadow-amber-500/25 animate-bounce">
          {nudgeFeedback}
        </div>
      )}

      {/* Author Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <img
            src={post.userAvatarUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80"}
            alt={post.username}
            className="w-11 h-11 rounded-full object-cover border-2 border-amber-300"
          />
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-sm text-[#2C221E]">{post.username}</span>
              <span className="bg-gradient-to-r from-amber-50 to-orange-50 text-amber-800 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border border-amber-200/80">
                🔥 Chuỗi 5 ngày
              </span>
            </div>
            <span className="text-xs text-[#918072]">
              {new Date(post.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} • Hôm nay
            </span>
          </div>
        </div>

        {/* Privacy Tag */}
        <span className="text-[11px] font-semibold text-[#736357] bg-[#FAF8F5] px-2.5 py-1 rounded-xl border border-[#EFEAE2]">
          {post.privacyMode === 'PUBLIC' ? '🌐 Công khai' : '👥 Bạn bè'}
        </span>
      </div>

      {/* Caption */}
      {post.caption && (
        <p className="text-sm text-[#382D25] leading-relaxed font-normal">
          {post.caption}
        </p>
      )}

      {/* Proof Photo Display */}
      <div className="relative rounded-2xl overflow-hidden bg-amber-50/50 border border-[#EFEAE2] group">
        <img
          src={post.imageUrl}
          alt="Minh chứng"
          className="w-full max-h-[460px] object-cover transition-transform duration-500 group-hover:scale-[1.01]"
        />
        <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-emerald-800 border border-emerald-200/60 shadow-sm">
          ✓ Minh chứng đã xác thực
        </div>
      </div>

      {/* Interactive Action Bar */}
      <div className="flex items-center justify-between pt-2 border-t border-[#EFEAE2]">
        <div className="flex items-center space-x-3">
          {/* 1. NÚT LIKE (Thả Tim) */}
          <button
            type="button"
            onClick={handleToggleLike}
            className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-2xl text-xs font-bold transition-all duration-200 ${
              isLiked
                ? 'bg-rose-50 text-rose-600 border border-rose-200/80 shadow-sm'
                : 'bg-[#FAF8F5] text-[#736357] hover:text-rose-600 hover:bg-rose-50/50 border border-[#EFEAE2]'
            }`}
          >
            <span className={`text-sm ${isLiked ? 'animate-heart' : ''}`}>❤️</span>
            <span>{likeCount}</span>
          </button>

          {/* 2. NÚT COMMENT (Bình Luận) */}
          <button
            type="button"
            onClick={() => setShowComments(!showComments)}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-2xl text-xs font-bold bg-[#FAF8F5] text-[#736357] hover:text-[#2C221E] hover:bg-[#F5F0E8] border border-[#EFEAE2] transition-all"
          >
            <span>💬</span>
            <span>{comments.length}</span>
          </button>
        </div>

        {/* 3. NÚT NUDGE ("Huých" Nhắc Nhở) - Signature Micro-interaction */}
        <button
          type="button"
          onClick={handleNudge}
          className={`flex items-center space-x-2 px-4 py-2 rounded-2xl text-xs font-black transition-all duration-300 shadow-sm ${
            isNudging
              ? 'animate-nudge bg-amber-500 text-white scale-105 shadow-md shadow-amber-500/25'
              : 'bg-gradient-to-r from-amber-50 to-orange-50 hover:from-amber-100 hover:to-orange-100 text-amber-900 border border-amber-200/80 active:scale-95'
          }`}
        >
          <span className="text-sm">🔔</span>
          <span>Nudge ({nudgeCount})</span>
        </button>
      </div>

      {/* Expandable Comments Drawer */}
      {showComments && (
        <div className="pt-3 border-t border-[#EFEAE2] space-y-3 animate-fade-in">
          <div className="space-y-2">
            {comments.map((c) => (
              <div key={c.id} className="p-3 rounded-2xl bg-[#FAF8F5] border border-[#EFEAE2] text-xs">
                <span className="font-bold text-amber-800 mr-2">{c.username}:</span>
                <span className="text-[#382D25]">{c.text}</span>
              </div>
            ))}
          </div>

          <form onSubmit={handleSendComment} className="flex items-center space-x-2">
            <input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Gửi lời động viên bạn bè..."
              className="flex-1 px-4 py-2.5 rounded-2xl bg-[#FAF8F5] border border-[#E5DCCE] text-xs text-[#2C221E] placeholder-[#918072]/60 focus:outline-none focus:bg-white focus:border-amber-500"
            />
            <button
              type="submit"
              className="px-4 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-sm transition-colors"
            >
              Gửi
            </button>
          </form>
        </div>
      )}
    </article>
  );
};
