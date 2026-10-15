import React, { useState } from 'react';
import { PostCard } from './PostCard';
import { ProofPost } from '../../types';

interface FeedViewProps {
  posts?: ProofPost[];
  onAddFriend?: (userId: number, username: string) => void;
}

export const FeedView: React.FC<FeedViewProps> = ({ 
  posts,
  onAddFriend
}) => {
  const [filter, setFilter] = useState<'ALL' | 'FRIENDS' | 'DISCOVER'>('ALL');

  // Default sample posts if no external posts provided
  const defaultPosts: ProofPost[] = [
    {
      id: 101,
      userId: 2,
      username: 'Trần Minh Quân',
      userAvatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=120&auto=format&fit=crop&q=80',
      imageUrl: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=700&auto=format&fit=crop&q=80',
      caption: 'Hoàn thành 120 phút Deep Work không dùng điện thoại! Kỷ luật tạo nên tự do ☕🔥',
      privacyMode: 'FRIENDS_ONLY',
      privacyModeLabel: 'Bạn bè',
      createdAt: '2026-10-16T08:00:00Z',
      likeCount: 18,
      commentCount: 4,
      nudgeCount: 5,
      likedByCurrentUser: false,
      isFriend: true,
      isCurrentUser: false
    },
    {
      id: 102,
      userId: 3,
      username: 'Lê Thảo My',
      userAvatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80',
      imageUrl: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=700&auto=format&fit=crop&q=80',
      caption: 'Ăn trưa lành mạnh đúng 11h30 và kiên quyết nói không với trà sữa trân châu chiều nay! 🥗✨',
      privacyMode: 'PUBLIC',
      privacyModeLabel: 'Công khai',
      createdAt: '2026-10-16T07:15:00Z',
      likeCount: 29,
      commentCount: 9,
      nudgeCount: 12,
      likedByCurrentUser: true,
      isFriend: false,
      isCurrentUser: false
    },
    {
      id: 103,
      userId: 4,
      username: 'Đỗ Hoàng Long',
      userAvatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
      imageUrl: 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=700&auto=format&fit=crop&q=80',
      caption: '5km chạy bộ đón bình minh hồ Tây lúc 6h sáng. Khởi đầu ngày mới tràn đầy năng lượng! 🏃‍♂️🌅',
      privacyMode: 'PUBLIC',
      privacyModeLabel: 'Công khai',
      createdAt: '2026-10-16T06:30:00Z',
      likeCount: 35,
      commentCount: 6,
      nudgeCount: 8,
      likedByCurrentUser: false,
      isFriend: false,
      isCurrentUser: false
    }
  ];

  const allPosts = posts && posts.length > 0 ? posts : defaultPosts;

  // RULE: Bài viết PRIVATE (Chỉ mình tôi) TUYỆT ĐỐI KHÔNG hiển thị trên Bảng Tin!
  const nonPrivatePosts = allPosts.filter((p) => p.privacyMode !== 'PRIVATE');

  // Filter based on active sub-tab
  const filteredPosts = nonPrivatePosts.filter((p) => {
    if (filter === 'FRIENDS') {
      return p.isFriend || p.privacyMode === 'FRIENDS_ONLY';
    }
    if (filter === 'DISCOVER') {
      return !p.isFriend && !p.isCurrentUser && p.privacyMode === 'PUBLIC';
    }
    return true; // 'ALL' shows all Public and Friends_Only
  });

  return (
    <div className="space-y-6 animate-fade-in">
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
        <div className="text-3xl shrink-0">☕📖</div>
      </div>

      {/* Feed Filter Sub-Tabs */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-[#FAF8F5] border border-[#EFEAE2] overflow-x-auto no-scrollbar">
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

      {/* Feed List */}
      <div className="space-y-6">
        {filteredPosts.map((post) => (
          <PostCard 
            key={post.id} 
            post={post}
            onAddFriend={onAddFriend}
          />
        ))}

        {filteredPosts.length === 0 && (
          <div className="p-8 rounded-3xl bg-white border border-[#EFEAE2] text-center space-y-3">
            <div className="text-3xl">🌱</div>
            <h4 className="font-bold text-sm text-[#2C221E]">Chưa có bài viết nào trong mục này</h4>
            <p className="text-xs text-[#736357]">
              Hãy chuyển sang mục "Tất Cả" hoặc hoàn thành check-in công khai hôm nay để chia sẻ lên Bảng Tin!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
