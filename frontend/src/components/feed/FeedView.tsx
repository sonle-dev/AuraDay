import React, { useState, useRef } from 'react';
import { PostCard } from './PostCard';
import { ProofPost } from '../../types';

interface FeedViewProps {
  posts?: ProofPost[];
  currentUsername?: string;
  onAddFriend?: (userId: number, username: string) => void;
  onLike?: (postId: number) => void;
  onNudge?: (postId: number) => void;
  onComment?: (postId: number, text: string) => void;
  onRefresh?: () => Promise<void> | void;
  isRefreshing?: boolean;
}

export const FeedView: React.FC<FeedViewProps> = ({ 
  posts,
  currentUsername = 'lehongson',
  onAddFriend,
  onLike,
  onNudge,
  onComment,
  onRefresh,
  isRefreshing = false
}) => {
  const [filter, setFilter] = useState<'ALL' | 'FRIENDS' | 'DISCOVER'>('ALL');
  const [pullY, setPullY] = useState<number>(0);
  const [isPulling, setIsPulling] = useState<boolean>(false);
  const touchStartY = useRef<number>(0);

  // Pull-to-refresh mobile gesture handling
  const handleTouchStart = (e: React.TouchEvent) => {
    if (window.scrollY <= 5) {
      touchStartY.current = e.touches[0].clientY;
      setIsPulling(true);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isPulling || window.scrollY > 10) return;
    const currentY = e.touches[0].clientY;
    const diff = currentY - touchStartY.current;
    if (diff > 0) {
      // Smooth resistance curve
      setPullY(Math.min(diff * 0.45, 80));
    }
  };

  const handleTouchEnd = async () => {
    if (pullY >= 48 && onRefresh) {
      setPullY(54);
      try {
        await onRefresh();
      } finally {
        setTimeout(() => {
          setPullY(0);
          setIsPulling(false);
        }, 400);
      }
    } else {
      setPullY(0);
      setIsPulling(false);
    }
  };

  const allPosts = posts && posts.length > 0 ? posts : [];

  // RULE: Bài viết PRIVATE (Chỉ mình tôi) TUYỆT ĐỐI KHÔNG hiển thị trên Bảng Tin!
  const nonPrivatePosts = allPosts.filter((p) => p.privacyMode !== 'PRIVATE');

  // Filter based on active sub-tab
  const filteredPosts = nonPrivatePosts.filter((p) => {
    const isFriend = Boolean(p.isFriend || p.friend);
    const isSelf = Boolean(
      p.isCurrentUser ||
      p.currentUser ||
      (currentUsername && p.username.trim().toLowerCase() === currentUsername.trim().toLowerCase())
    );

    if (filter === 'FRIENDS') {
      return isFriend || p.privacyMode === 'FRIENDS_ONLY';
    }
    if (filter === 'DISCOVER') {
      return !isFriend && !isSelf && p.privacyMode === 'PUBLIC';
    }
    return true; // 'ALL' shows all Public and Friends_Only
  });

  return (
    <div 
      className="space-y-6 animate-fade-in"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Pull-To-Refresh Interactive Indicator (Mobile & Top of Page) */}
      <div 
        className="overflow-hidden transition-all duration-200 flex items-center justify-center"
        style={{ height: `${pullY > 0 ? pullY : (isRefreshing ? 52 : 0)}px` }}
      >
        <div className="flex items-center space-x-2 text-xs font-black text-amber-900 bg-amber-100/95 border border-amber-300 px-4 py-2 rounded-2xl shadow-sm backdrop-blur-md">
          <span className={`inline-block ${pullY >= 48 || isRefreshing ? 'animate-spin' : ''}`}>
            🔄
          </span>
          <span>
            {isRefreshing 
              ? 'Đang làm mới dữ liệu Bảng Tin từ Database...' 
              : pullY >= 48 
                ? 'Thả ra để tải lại Bảng Tin ✨' 
                : 'Kéo xuống để làm mới Bảng Tin...'}
          </span>
        </div>
      </div>

      {/* Top Banner */}
      <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-amber-100/80 via-orange-50/70 to-white border border-amber-200/80 shadow-sm shadow-amber-950/5 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-[#2C221E] tracking-tight">
            Bảng Tin Kỷ Luật & Kết Nối Gen Z
          </h2>
          <p className="text-xs sm:text-sm text-[#736357] mt-1">
            Theo dõi nhật ký của bạn bè và khám phá những người bạn mới cùng chí hướng
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {onRefresh && (
            <button
              type="button"
              onClick={() => onRefresh()}
              disabled={isRefreshing}
              className="p-2.5 sm:px-3.5 sm:py-2 rounded-2xl bg-white border border-amber-200 hover:border-amber-400 hover:bg-amber-50 text-amber-900 text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 active:scale-95"
              title="Làm mới bài viết từ CSDL PostgreSQL"
            >
              <span className={`text-sm ${isRefreshing ? 'animate-spin' : ''}`}>🔄</span>
              <span className="hidden sm:inline">Làm Mới</span>
            </button>
          )}
          <div className="text-3xl hidden sm:block">☕📖</div>
        </div>
      </div>

      {/* Feed Filter Sub-Tabs */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-[#FAF8F5] border border-[#EFEAE2] overflow-x-auto no-scrollbar flex-1">
          <button
            onClick={() => setFilter('ALL')}
            className={`shrink-0 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              filter === 'ALL'
                ? 'bg-amber-500 text-white shadow-sm'
                : 'text-[#736357] hover:text-[#2C221E] hover:bg-white/60'
            }`}
          >
            Tất Cả ({nonPrivatePosts.length})
          </button>

          <button
            onClick={() => setFilter('FRIENDS')}
            className={`shrink-0 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5 ${
              filter === 'FRIENDS'
                ? 'bg-amber-500 text-white shadow-sm'
                : 'text-[#736357] hover:text-[#2C221E] hover:bg-white/60'
            }`}
          >
            <span>👥 Bạn Bè</span>
          </button>

          <button
            onClick={() => setFilter('DISCOVER')}
            className={`shrink-0 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5 ${
              filter === 'DISCOVER'
                ? 'bg-amber-500 text-white shadow-sm'
                : 'text-[#736357] hover:text-[#2C221E] hover:bg-white/60'
            }`}
          >
            <span>🌐 Khám Phá & Kết Bạn</span>
          </button>
        </div>
      </div>

      {/* Feed List */}
      <div className="space-y-6">
        {filteredPosts.map((post) => (
          <PostCard 
            key={post.id} 
            post={post}
            currentUsername={currentUsername}
            onAddFriend={onAddFriend}
            onLike={onLike}
            onNudge={onNudge}
            onComment={onComment}
          />
        ))}

        {filteredPosts.length === 0 && (
          <div className="p-8 rounded-3xl bg-white border border-[#EFEAE2] text-center space-y-3">
            <div className="text-3xl">🌱</div>
            <h4 className="font-bold text-sm text-[#2C221E]">Chưa có bài viết nào trong mục này</h4>
            <p className="text-xs text-[#736357]">
              Hãy chuyển sang mục "Tất Cả" hoặc hoàn thành check-in công khai hôm nay để chia sẻ lên Bảng Tin!
            </p>
            {onRefresh && (
              <button
                type="button"
                onClick={() => onRefresh()}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 text-white font-bold text-xs shadow-sm hover:bg-amber-600 transition-all"
              >
                <span>🔄 Tải Lại Dữ Liệu</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
