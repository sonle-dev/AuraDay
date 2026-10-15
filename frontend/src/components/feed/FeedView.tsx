import React from 'react';
import { PostCard } from './PostCard';
import { ProofPost } from '../../types';

export const FeedView: React.FC = () => {
  const samplePosts: ProofPost[] = [
    {
      id: 101,
      userId: 2,
      username: 'Trần Minh Quân',
      userAvatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=120&auto=format&fit=crop&q=80',
      imageUrl: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=700&auto=format&fit=crop&q=80',
      caption: 'Hoàn thành 120 phút học Java Spring Boot không dùng điện thoại! Kỷ luật tạo nên tự do ☕🔥',
      privacyMode: 'FRIENDS_ONLY',
      privacyModeLabel: 'Bạn bè',
      createdAt: '2026-10-16T08:00:00Z',
      likeCount: 18,
      commentCount: 4,
      nudgeCount: 5,
      likedByCurrentUser: false
    },
    {
      id: 102,
      userId: 3,
      username: 'Lê Thảo My',
      userAvatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80',
      imageUrl: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=700&auto=format&fit=crop&q=80',
      caption: 'Ăn trưa lành mạnh đúng 11h30 và kiên quyết nói không với trà sữa trân châu chiều nay!',
      privacyMode: 'PUBLIC',
      privacyModeLabel: 'Công khai',
      createdAt: '2026-10-16T07:15:00Z',
      likeCount: 29,
      commentCount: 9,
      nudgeCount: 12,
      likedByCurrentUser: true
    }
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-amber-100/80 via-orange-50/70 to-white border border-amber-200/80 shadow-sm shadow-amber-950/5 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-[#2C221E] tracking-tight">Bảng Tin Kỷ Luật Sinh Viên</h2>
          <p className="text-xs text-[#736357] mt-1">Cùng bạn bè thúc đẩy, giám sát và giữ vững nề nếp mỗi ngày</p>
        </div>
        <div className="text-3xl">☕📖</div>
      </div>

      {/* Feed List */}
      <div className="space-y-6">
        {samplePosts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
    </div>
  );
};
