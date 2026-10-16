import React, { useState, useRef } from 'react';
import { PostCard } from './PostCard';
import { ProofPost, PrivacyMode } from '../../types';
import { CameraModal } from '../checkin/CameraModal';
import { proofApi } from '../../services/api';

interface FeedViewProps {
  posts?: ProofPost[];
  currentUsername?: string;
  currentUserAvatar?: string;
  onAddFriend?: (userId: number, username: string) => void;
  onLike?: (postId: number) => void;
  onNudge?: (postId: number) => void;
  onComment?: (postId: number, text: string) => void;
  onRefresh?: () => Promise<void> | void;
  onPostCreated?: (newPost: ProofPost) => void;
  isRefreshing?: boolean;
}

export const FeedView: React.FC<FeedViewProps> = ({ 
  posts,
  currentUsername = 'lehongson',
  currentUserAvatar = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  onAddFriend,
  onLike,
  onNudge,
  onComment,
  onRefresh,
  onPostCreated,
  isRefreshing = false
}) => {
  const [filter, setFilter] = useState<'ALL' | 'FRIENDS' | 'DISCOVER'>('ALL');
  const [pullY, setPullY] = useState<number>(0);
  const [isPulling, setIsPulling] = useState<boolean>(false);
  const touchStartY = useRef<number>(0);

  // Quick Post Composer State
  const [caption, setCaption] = useState<string>('');
  const [postImage, setPostImage] = useState<string | null>(null);
  const [privacyMode, setPrivacyMode] = useState<PrivacyMode>('PUBLIC');
  const [isCameraOpen, setIsCameraOpen] = useState<boolean>(false);
  const [isPosting, setIsPosting] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setPostImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCameraCapture = (result: { imageUrl: string; privacyMode: PrivacyMode; caption: string }) => {
    setPostImage(result.imageUrl);
    if (result.caption) setCaption(result.caption);
    setPrivacyMode(result.privacyMode);
    setIsCameraOpen(false);
  };

  const handlePublishPost = async () => {
    if (!postImage) {
      alert('Vui lòng chụp ảnh hoặc tải ảnh lên để đăng bài minh chứng!');
      return;
    }

    try {
      setIsPosting(true);
      const res = await proofApi.createProof({
        imageUrl: postImage,
        caption: caption.trim() || 'Chia sẻ kỷ luật hôm nay cùng AuraDay ✨',
        privacyMode
      });

      setPostImage(null);
      setCaption('');
      setPrivacyMode('PUBLIC');

      if (onPostCreated && res) {
        onPostCreated(res);
      }
      if (onRefresh) {
        await onRefresh();
      }

      alert('✨ Chúc mừng! Bài viết và ảnh minh chứng của bạn đã được đăng thành công lên Bảng Tin!');
    } catch (err: any) {
      console.error('Publish error:', err);
      alert('Lỗi khi đăng bài: ' + (err.message || 'Vui lòng thử lại.'));
    } finally {
      setIsPosting(false);
    }
  };

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

      {/* Quick Post Box (Chụp ảnh & Đăng bài trực tiếp trên Bảng Tin) */}
      <div className="p-4 sm:p-5 rounded-3xl bg-white border border-[#E5DCCE] shadow-md shadow-amber-950/5">
        <div className="flex items-start gap-3">
          <img
            src={currentUserAvatar}
            alt={currentUsername}
            className="w-10 h-10 rounded-2xl object-cover border-2 border-amber-300 shadow-xs shrink-0 mt-1"
          />
          <div className="flex-1 space-y-3">
            <textarea
              rows={2}
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder={`Chào ${currentUsername}! Hôm nay bạn có khoảnh khắc kỷ luật nào muốn chia sẻ không?`}
              className="w-full p-3 rounded-2xl bg-[#FAF8F5] border border-[#E5DCCE] text-xs sm:text-sm text-[#2C221E] placeholder-[#918072]/70 focus:outline-none focus:bg-white focus:border-amber-500 transition-colors resize-none"
            />

            {/* Attached Photo Preview */}
            {postImage && (
              <div className="relative inline-block rounded-2xl overflow-hidden border-2 border-amber-400 shadow-sm">
                <img
                  src={postImage}
                  alt="Ảnh minh chứng"
                  className="w-32 h-32 sm:w-40 sm:h-40 object-cover"
                />
                <button
                  type="button"
                  onClick={() => setPostImage(null)}
                  className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/70 hover:bg-black text-white text-xs flex items-center justify-center transition-colors"
                  title="Xóa ảnh"
                >
                  ✕
                </button>
              </div>
            )}

            {/* Hidden File Input */}
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />

            {/* Actions Bar */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-[#EFEAE2]">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsCameraOpen(true)}
                  className="px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 hover:bg-amber-100 text-amber-900 text-xs font-bold transition-all flex items-center gap-1.5 active:scale-95"
                >
                  <span>📸</span>
                  <span>Chụp ảnh ngay</span>
                </button>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-1.5 rounded-xl bg-stone-50 border border-stone-200 hover:bg-stone-100 text-[#736357] text-xs font-bold transition-all flex items-center gap-1.5 active:scale-95"
                >
                  <span>🖼️</span>
                  <span>Tải ảnh từ máy</span>
                </button>

                {/* Privacy selector */}
                <select
                  value={privacyMode}
                  onChange={(e) => setPrivacyMode(e.target.value as PrivacyMode)}
                  className="px-2.5 py-1.5 rounded-xl bg-[#FAF8F5] border border-[#E5DCCE] text-xs font-bold text-[#2C221E] focus:outline-none focus:border-amber-500 cursor-pointer"
                >
                  <option value="PUBLIC">🌍 Công khai</option>
                  <option value="FRIENDS_ONLY">👥 Bạn bè</option>
                  <option value="PRIVATE">🔒 Chỉ mình tôi</option>
                </select>
              </div>

              <button
                type="button"
                onClick={handlePublishPost}
                disabled={isPosting || !postImage}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:brightness-105 text-white font-black text-xs sm:text-sm tracking-wide shadow-md shadow-amber-500/25 transition-all active:scale-95 disabled:opacity-50 flex items-center gap-1.5"
              >
                <span>{isPosting ? 'Đang tải lên...' : 'Đăng Bài 🚀'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Camera Modal */}
      {isCameraOpen && (
        <CameraModal
          isOpen={isCameraOpen}
          itemTitle="Chụp Ảnh Kỷ Luật Bảng Tin"
          itemIcon="📸"
          initialPrivacy={privacyMode}
          onClose={() => setIsCameraOpen(false)}
          onPublish={handleCameraCapture}
        />
      )}

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
