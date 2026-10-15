import React, { useState } from 'react';
import { PrivacyMode, ProofPost } from '../../types';

interface LockerViewProps {
  initialPosts?: ProofPost[];
}

export const LockerView: React.FC<LockerViewProps> = ({ initialPosts }) => {
  // Mock proof photos if none provided
  const defaultProofs: ProofPost[] = initialPosts || [
    {
      id: 1,
      userId: 1,
      username: 'Bạn',
      imageUrl: 'https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?w=600&auto=format&fit=crop&q=80',
      caption: 'Bàn làm việc gọn gàng lúc 5:45 sáng, sẵn sàng cho 2 tiếng Deep Work! ☕💻',
      privacyMode: 'PRIVATE',
      privacyModeLabel: 'Chỉ mình tôi',
      createdAt: '2026-10-16T06:15:00Z',
      likeCount: 0,
      commentCount: 0,
      nudgeCount: 0,
      likedByCurrentUser: false
    },
    {
      id: 2,
      userId: 1,
      username: 'Bạn',
      imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80',
      caption: 'Bữa trưa healthy đúng giờ 11h45, no và đủ chất nạp năng lượng sạch.',
      privacyMode: 'FRIENDS_ONLY',
      privacyModeLabel: 'Bạn bè',
      createdAt: '2026-10-15T11:50:00Z',
      likeCount: 4,
      commentCount: 2,
      nudgeCount: 1,
      likedByCurrentUser: true
    },
    {
      id: 3,
      userId: 1,
      username: 'Bạn',
      imageUrl: 'https://images.unsplash.com/photo-1517842645767-c639042777db?w=600&auto=format&fit=crop&q=80',
      caption: 'Sổ tay kế hoạch tuần mới và mục tiêu 300 phút làm việc tập trung.',
      privacyMode: 'PUBLIC',
      privacyModeLabel: 'Công khai',
      createdAt: '2026-10-14T20:30:00Z',
      likeCount: 12,
      commentCount: 5,
      nudgeCount: 3,
      likedByCurrentUser: true
    }
  ];

  const [posts, setPosts] = useState<ProofPost[]>(defaultProofs);
  const [selectedPost, setSelectedPost] = useState<ProofPost | null>(null);
  const [filterPrivacy, setFilterPrivacy] = useState<string>('ALL');
  const [filterMonth, setFilterMonth] = useState<string>('10');
  const [filterYear, setFilterYear] = useState<string>('2026');

  const filteredPosts = posts.filter((p) => {
    if (filterPrivacy !== 'ALL' && p.privacyMode !== filterPrivacy) return false;
    return true;
  });

  const handleUpdatePrivacy = (newMode: PrivacyMode) => {
    if (!selectedPost) return;
    const labelMap: Record<PrivacyMode, string> = {
      PUBLIC: 'Công khai',
      FRIENDS_ONLY: 'Bạn bè',
      PRIVATE: 'Chỉ mình tôi'
    };
    const updated = {
      ...selectedPost,
      privacyMode: newMode,
      privacyModeLabel: labelMap[newMode]
    };
    setSelectedPost(updated);
    setPosts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
  };

  const privacyBadge = (mode: PrivacyMode) => {
    switch (mode) {
      case 'PUBLIC':
        return <span className="bg-emerald-50 text-emerald-800 border border-emerald-200/80 px-2.5 py-0.5 rounded-full text-xs font-semibold shadow-sm">🌐 Công khai</span>;
      case 'FRIENDS_ONLY':
        return <span className="bg-amber-50 text-amber-900 border border-amber-200/80 px-2.5 py-0.5 rounded-full text-xs font-semibold shadow-sm">👥 Bạn bè</span>;
      case 'PRIVATE':
        return <span className="bg-stone-100 text-stone-800 border border-stone-200 px-2.5 py-0.5 rounded-full text-xs font-semibold shadow-sm">🔒 Chỉ mình tôi</span>;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Title & Upload Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-[#2C221E] tracking-tight">Tủ Khóa Cá Nhân (Locker)</h2>
          <p className="text-sm text-[#736357]">Kho lưu trữ ảnh minh chứng kỷ luật theo ngày/tháng/năm</p>
        </div>

        {/* Camera / Upload Proof Trigger */}
        <button
          type="button"
          onClick={() => alert('Mở camera / chọn ảnh minh chứng từ thiết bị!')}
          className="flex items-center justify-center space-x-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold text-sm shadow-md shadow-amber-500/25 transition-all active:scale-95"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span>Chụp Ảnh Minh Chứng</span>
        </button>
      </div>

      {/* Date & Privacy Filter Bar */}
      <div className="p-4 rounded-3xl bg-white border border-[#EFEAE2] shadow-sm shadow-amber-950/5 flex flex-wrap items-center gap-3">
        {/* Month Filter */}
        <div className="flex items-center space-x-2 bg-[#FAF8F5] px-3 py-2 rounded-2xl border border-[#EFEAE2] text-xs">
          <span className="text-[#918072]">Tháng:</span>
          <select
            value={filterMonth}
            onChange={(e) => setFilterMonth(e.target.value)}
            className="bg-transparent text-amber-800 font-bold focus:outline-none cursor-pointer"
          >
            {[...Array(12)].map((_, i) => (
              <option key={i + 1} value={String(i + 1)} className="bg-white text-[#2C221E]">
                Tháng {i + 1}
              </option>
            ))}
          </select>
        </div>

        {/* Year Filter */}
        <div className="flex items-center space-x-2 bg-[#FAF8F5] px-3 py-2 rounded-2xl border border-[#EFEAE2] text-xs">
          <span className="text-[#918072]">Năm:</span>
          <select
            value={filterYear}
            onChange={(e) => setFilterYear(e.target.value)}
            className="bg-transparent text-amber-800 font-bold focus:outline-none cursor-pointer"
          >
            <option value="2026" className="bg-white text-[#2C221E]">2026</option>
            <option value="2025" className="bg-white text-[#2C221E]">2025</option>
          </select>
        </div>

        {/* Privacy Filter Tabs */}
        <div className="flex items-center space-x-1.5 ml-auto bg-[#FAF8F5] p-1 rounded-2xl border border-[#EFEAE2] text-xs">
          {[
            { id: 'ALL', label: 'Tất cả' },
            { id: 'PUBLIC', label: 'Công khai' },
            { id: 'FRIENDS_ONLY', label: 'Bạn bè' },
            { id: 'PRIVATE', label: 'Chỉ mình tôi' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterPrivacy(tab.id)}
              className={`px-3 py-1.5 rounded-xl font-semibold transition-all ${
                filterPrivacy === tab.id
                  ? 'bg-amber-500 text-white font-bold shadow-sm shadow-amber-500/20'
                  : 'text-[#736357] hover:text-[#2C221E]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Proof Photo Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {filteredPosts.map((post) => (
          <div
            key={post.id}
            onClick={() => setSelectedPost(post)}
            className="group relative rounded-3xl overflow-hidden bg-white border border-[#EFEAE2] cursor-pointer hover:border-amber-400 transition-all duration-300 hover:-translate-y-1 shadow-sm shadow-amber-950/5"
          >
            {/* Image Thumbnail */}
            <div className="aspect-square w-full overflow-hidden bg-amber-50/40">
              <img
                src={post.imageUrl}
                alt={post.caption || 'Minh chứng'}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>

            {/* Gradient Overlay & Metadata */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#2C221E]/90 via-[#2C221E]/30 to-transparent p-4 flex flex-col justify-between">
              <div className="flex justify-end">
                {privacyBadge(post.privacyMode)}
              </div>

              <div>
                <p className="text-xs font-semibold text-white/95 line-clamp-2">{post.caption}</p>
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/20 text-[11px] text-amber-200">
                  <span>{new Date(post.createdAt).toLocaleDateString('vi-VN')}</span>
                  <div className="flex items-center space-x-2">
                    <span>❤️ {post.likeCount}</span>
                    <span>🔔 {post.nudgeCount}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ================= MODAL XEM CHI TIẾT & ĐỔI QUYỀN RIÊNG TƯ ================= */}
      {selectedPost && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2C221E]/40 backdrop-blur-sm animate-fade-in"
          onClick={() => setSelectedPost(null)}
        >
          <div
            className="max-w-lg w-full bg-white rounded-3xl border border-[#EFEAE2] p-6 space-y-5 shadow-2xl shadow-amber-950/15"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black text-[#2C221E]">Chi Tiết Minh Chứng</h3>
                <span className="text-xs text-[#918072]">
                  {new Date(selectedPost.createdAt).toLocaleString('vi-VN')}
                </span>
              </div>
              <button
                onClick={() => setSelectedPost(null)}
                className="w-8 h-8 rounded-full bg-[#FAF8F5] text-[#736357] hover:text-[#2C221E] hover:bg-[#F5F0E8] flex items-center justify-center border border-[#EFEAE2] transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Full Image */}
            <div className="w-full h-64 rounded-2xl overflow-hidden bg-amber-50/40 border border-[#EFEAE2]">
              <img src={selectedPost.imageUrl} alt="Chi tiết" className="w-full h-full object-cover" />
            </div>

            {/* Caption */}
            <p className="text-sm text-[#382D25] bg-[#FAF8F5] p-3.5 rounded-2xl border border-[#EFEAE2] leading-relaxed">
              {selectedPost.caption || 'Không có ghi chú kèm theo'}
            </p>

            {/* Privacy Mode Switcher */}
            <div>
              <label className="text-xs font-bold text-amber-800 uppercase tracking-wider block mb-2">
                Quyền Riêng Tư Của Ảnh:
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { mode: 'PUBLIC' as PrivacyMode, label: 'Công Khai', icon: '🌐' },
                  { mode: 'FRIENDS_ONLY' as PrivacyMode, label: 'Bạn Bè', icon: '👥' },
                  { mode: 'PRIVATE' as PrivacyMode, label: 'Chỉ Mình Tôi', icon: '🔒' }
                ].map((item) => (
                  <button
                    key={item.mode}
                    type="button"
                    onClick={() => handleUpdatePrivacy(item.mode)}
                    className={`p-3 rounded-2xl text-xs font-bold flex flex-col items-center space-y-1 border transition-all ${
                      selectedPost.privacyMode === item.mode
                        ? 'bg-amber-50 text-amber-900 border-amber-400 font-extrabold shadow-sm'
                        : 'bg-[#FAF8F5] text-[#736357] border-[#EFEAE2] hover:border-amber-300'
                    }`}
                  >
                    <span className="text-base">{item.icon}</span>
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Close Button */}
            <button
              type="button"
              onClick={() => setSelectedPost(null)}
              className="w-full py-3 rounded-2xl bg-[#F5F0E8] hover:bg-[#EFEAE2] text-[#2C221E] font-bold text-sm border border-[#EFEAE2] transition-colors"
            >
              Đóng
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
