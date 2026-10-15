import React, { useState } from 'react';
import { FriendSuggestion, Buddy, FriendRequestItem } from '../../types';

interface FriendsViewProps {
  onNudgeBuddy?: (username: string) => void;
}

export const FriendsView: React.FC<FriendsViewProps> = ({ onNudgeBuddy }) => {
  const [activeTab, setActiveTab] = useState<'suggestions' | 'search' | 'my-buddies' | 'requests'>('suggestions');
  const [suggestionFilter, setSuggestionFilter] = useState<'ALL' | 'MUTUAL' | 'NEARBY'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Suggestions state
  const [suggestions, setSuggestions] = useState<FriendSuggestion[]>([
    {
      userId: 101,
      username: 'linh_coffee_code',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
      bio: 'Lập trình viên Gen Z mê latte art ☕ • Cam kết dậy 5:30 sáng và không thức khuya quá 23:30.',
      streakDays: 19,
      mutualFriendsCount: 4,
      mutualFriendNames: ['hoang_nam', 'thu_ha', 'quoc_bao'],
      suggestionReason: 'Có 4 bạn chung với @hoang_nam và @thu_ha',
      location: 'Cầu Giấy, Hà Nội',
      distanceKm: 0.8,
      habitHighlight: 'Dậy sớm 5:30 • Deep Work 180p',
      status: 'IDLE'
    },
    {
      userId: 102,
      username: 'duy_fitness_daily',
      avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=300&auto=format&fit=crop&q=80',
      bio: 'Calisthenics & Healthy Meal Prep 🥗. Cần tìm đồng đội giám sát ăn đúng bữa mỗi trưa!',
      streakDays: 24,
      mutualFriendsCount: 0,
      mutualFriendNames: [],
      suggestionReason: 'Gần khu vực học tập & làm việc của bạn (~0.6 km)',
      location: 'Đống Đa, Hà Nội',
      distanceKm: 0.6,
      habitHighlight: 'Ăn healthy 3 bữa • Gym 45p',
      status: 'IDLE'
    },
    {
      userId: 103,
      username: 'minh_an_designer',
      avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&auto=format&fit=crop&q=80',
      bio: 'UI/UX Designer • Pomodoro 25/5 • Đang thử thách 30 ngày đọc sách 20 trang trước khi ngủ 📖',
      streakDays: 14,
      mutualFriendsCount: 3,
      mutualFriendNames: ['minh_anh_zen', 'quoc_bao'],
      suggestionReason: 'Có 3 bạn chung với @minh_anh_zen',
      location: 'Cùng nhóm kết nối Gen Z',
      distanceKm: 1.5,
      habitHighlight: 'Đọc sách 30p • Không bấm điện thoại đêm',
      status: 'IDLE'
    },
    {
      userId: 104,
      username: 'hai_tri_runner',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
      bio: 'Chạy bộ hồ Tây mỗi sáng 6:00 🏃‍♂️. Bạn nào gần mạn Tây Hồ - Ba Đình cùng lập team chạy!',
      streakDays: 31,
      mutualFriendsCount: 0,
      mutualFriendNames: [],
      suggestionReason: 'Cùng khu vực sinh hoạt (~1.1 km)',
      location: 'Ba Đình, Hà Nội',
      distanceKm: 1.1,
      habitHighlight: 'Chạy bộ 5km • Uống 2.5L nước',
      status: 'IDLE'
    },
    {
      userId: 105,
      username: 'phuong_thao_green',
      avatarUrl: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=300&auto=format&fit=crop&q=80',
      bio: 'Ăn chay bán phần 🥑 • Thích đi bộ buổi tối và ghi chép nhật ký biết ơn mỗi ngày.',
      streakDays: 12,
      mutualFriendsCount: 2,
      mutualFriendNames: ['hoang_nam'],
      suggestionReason: 'Có 2 bạn chung với @hoang_nam',
      location: 'Cầu Giấy, Hà Nội',
      distanceKm: 0.9,
      habitHighlight: 'Ăn chay • Viết Journal 15p',
      status: 'IDLE'
    }
  ]);

  // Buddies state
  const [buddies, setBuddies] = useState<Buddy[]>([
    {
      id: 1,
      userId: 201,
      username: 'hoang_nam',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80',
      bio: 'Kiên trì từng bước nhỏ. Đồng đội giám sát thức dậy lúc 5:30.',
      streakDays: 28,
      location: 'Cầu Giấy, Hà Nội',
      distanceKm: 0.5,
      isOnline: true,
      lastActive: 'Đang hoạt động',
      currentHabit: 'Dậy sớm 5:30',
      todayCheckedIn: true,
      nudgedToday: false
    },
    {
      id: 2,
      userId: 202,
      username: 'minh_anh_zen',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&auto=format&fit=crop&q=80',
      bio: 'Sống chậm, làm việc sâu và ăn uống lành mạnh.',
      streakDays: 17,
      location: 'Ba Đình, Hà Nội',
      distanceKm: 1.8,
      isOnline: false,
      lastActive: 'Hoạt động 35 phút trước',
      currentHabit: 'Học tiếng Anh 45p',
      todayCheckedIn: true,
      nudgedToday: false
    },
    {
      id: 3,
      userId: 203,
      username: 'quoc_bao_focus',
      avatarUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=300&auto=format&fit=crop&q=80',
      bio: 'Thử thách 100 ngày kỷ luật coding & gym.',
      streakDays: 7,
      location: 'Đống Đa, Hà Nội',
      distanceKm: 2.1,
      isOnline: false,
      lastActive: 'Chưa check-in hôm nay ⚠️',
      currentHabit: 'Ăn tối đúng giờ',
      todayCheckedIn: false,
      nudgedToday: false
    }
  ]);

  // Friend Requests state
  const [requests, setRequests] = useState<FriendRequestItem[]>([
    {
      id: 1,
      fromUserId: 301,
      username: 'thanh_tung_dev',
      avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300&auto=format&fit=crop&q=80',
      bio: 'Frontend Dev muốn tìm bạn lập trình Pomodoro cùng.',
      streakDays: 15,
      location: 'Cầu Giấy, Hà Nội (~0.7 km)',
      mutualCount: 2,
      createdAt: '1 giờ trước'
    },
    {
      id: 2,
      fromUserId: 302,
      username: 'mai_hoa_healthy',
      avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&auto=format&fit=crop&q=80',
      bio: 'Eat clean & yoga mỗi chiều. Cùng giữ dáng và da đẹp nhé!',
      streakDays: 21,
      location: 'Cùng nhóm bạn chung với @thu_ha',
      mutualCount: 3,
      createdAt: '3 giờ trước'
    }
  ]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleSendRequest = (userId: number, username: string) => {
    setSuggestions((prev) =>
      prev.map((s) => (s.userId === userId ? { ...s, status: 'REQUEST_SENT' } : s))
    );
    showToast(`✨ Đã gửi lời mời kết bạn đến @${username}!`);
  };

  const handleRemoveSuggestion = (userId: number) => {
    setSuggestions((prev) => prev.filter((s) => s.userId !== userId));
  };

  const handleAcceptRequest = (requestId: number, username: string, avatarUrl?: string, bio?: string, streakDays?: number, location?: string) => {
    setRequests((prev) => prev.filter((r) => r.id !== requestId));
    const newBuddy: Buddy = {
      id: Date.now(),
      userId: requestId + 900,
      username,
      avatarUrl,
      bio: bio || 'Đồng đội mới kết nối',
      streakDays: streakDays || 1,
      location: location || 'Hà Nội',
      distanceKm: 1.0,
      isOnline: true,
      lastActive: 'Vừa kết nối',
      currentHabit: 'Thói quen tích cực',
      todayCheckedIn: false,
      nudgedToday: false
    };
    setBuddies((prev) => [newBuddy, ...prev]);
    showToast(`🤝 Bạn và @${username} đã trở thành bạn đồng hành (Buddies)!`);
  };

  const handleRejectRequest = (requestId: number, username: string) => {
    setRequests((prev) => prev.filter((r) => r.id !== requestId));
    showToast(`Đã từ chối lời mời từ @${username}`);
  };

  const handleNudge = (buddyId: number, username: string) => {
    setBuddies((prev) =>
      prev.map((b) => (b.id === buddyId ? { ...b, nudgedToday: true } : b))
    );
    showToast(`🔔 Bạn vừa huých (Nudge) @${username}! Đã gửi lời nhắc giữ kỷ luật hôm nay 🔥`);
    if (onNudgeBuddy) onNudgeBuddy(username);
  };

  // Filtered suggestions
  const filteredSuggestions = suggestions.filter((s) => {
    if (suggestionFilter === 'MUTUAL') return s.mutualFriendsCount > 0;
    if (suggestionFilter === 'NEARBY') return s.distanceKm !== undefined && s.distanceKm <= 1.5;
    return true;
  });

  // Filtered search results
  const searchResults = suggestions.filter((s) =>
    s.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (s.location && s.location.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (s.bio && s.bio.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-[#2C221E] text-white px-5 py-3 rounded-2xl shadow-xl flex items-center space-x-3 text-sm font-medium border border-amber-500/30 animate-in fade-in slide-in-from-top-3 duration-300">
          <span className="text-amber-400 text-lg">✨</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-transparent border border-amber-500/20 shadow-sm relative overflow-hidden">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 text-amber-700 text-xs font-bold mb-3">
            <span>🤝 Đồng Hành & Bạn Bè Cùng Tiến</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-black text-[#2C221E] tracking-tight">
            Cùng Nhau Giữ Chuỗi Kỷ Luật 🔥
          </h2>
          <p className="text-sm text-[#736357] mt-2 leading-relaxed">
            Khoa học chứng minh bạn có tỷ lệ duy trì thói quen cao hơn <strong>65%</strong> khi có đồng đội giám sát (Accountability Partner). Tìm kiếm bạn bè chung hoặc những người cùng sống gần khu vực của bạn!
          </p>
        </div>

        {/* Quick Stats Pill */}
        <div className="mt-4 flex flex-wrap items-center gap-3 text-xs font-semibold">
          <span className="px-3 py-1.5 rounded-xl bg-white/80 border border-[#EFEAE2] text-[#2C221E] shadow-sm">
            👥 {buddies.length} Bạn đồng hành
          </span>
          <span className="px-3 py-1.5 rounded-xl bg-white/80 border border-[#EFEAE2] text-[#2C221E] shadow-sm">
            📩 {requests.length} Lời mời đang chờ
          </span>
          <span className="px-3 py-1.5 rounded-xl bg-amber-100/70 border border-amber-300/40 text-amber-800 shadow-sm">
            ✨ {suggestions.length} Gợi ý mới
          </span>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-[#EFEAE2] pb-2 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab('suggestions')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs md:text-sm font-bold transition-all whitespace-nowrap ${
            activeTab === 'suggestions'
              ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20'
              : 'text-[#736357] hover:bg-[#FAF8F5]'
          }`}
        >
          <span>✨ Gợi Ý Kết Bạn</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] ${activeTab === 'suggestions' ? 'bg-amber-600 text-white' : 'bg-[#EFEAE2] text-[#736357]'}`}>
            {suggestions.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('search')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs md:text-sm font-bold transition-all whitespace-nowrap ${
            activeTab === 'search'
              ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20'
              : 'text-[#736357] hover:bg-[#FAF8F5]'
          }`}
        >
          <span>🔍 Tìm Kiếm & Khám Phá</span>
        </button>

        <button
          onClick={() => setActiveTab('my-buddies')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs md:text-sm font-bold transition-all whitespace-nowrap ${
            activeTab === 'my-buddies'
              ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20'
              : 'text-[#736357] hover:bg-[#FAF8F5]'
          }`}
        >
          <span>👥 Đồng Đội Của Tôi</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] ${activeTab === 'my-buddies' ? 'bg-amber-600 text-white' : 'bg-[#EFEAE2] text-[#736357]'}`}>
            {buddies.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('requests')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs md:text-sm font-bold transition-all whitespace-nowrap ${
            activeTab === 'requests'
              ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20'
              : 'text-[#736357] hover:bg-[#FAF8F5]'
          }`}
        >
          <span>📩 Lời Mời Kết Bạn</span>
          {requests.length > 0 && (
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-rose-500 text-white font-extrabold animate-pulse">
              {requests.length}
            </span>
          )}
        </button>
      </div>

      {/* TAB 1: SUGGESTIONS */}
      {activeTab === 'suggestions' && (
        <div className="space-y-4">
          {/* Filter Pills for Suggestions */}
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-[#736357]">Lọc gợi ý theo:</span>
              <button
                onClick={() => setSuggestionFilter('ALL')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  suggestionFilter === 'ALL'
                    ? 'bg-[#2C221E] text-white shadow-sm'
                    : 'bg-white border border-[#EFEAE2] text-[#736357] hover:bg-[#FAF8F5]'
                }`}
              >
                Tất cả
              </button>
              <button
                onClick={() => setSuggestionFilter('MUTUAL')}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  suggestionFilter === 'MUTUAL'
                    ? 'bg-amber-500 text-white shadow-sm'
                    : 'bg-white border border-[#EFEAE2] text-[#736357] hover:bg-[#FAF8F5]'
                }`}
              >
                <span>👥 Bạn của bạn bè</span>
              </button>
              <button
                onClick={() => setSuggestionFilter('NEARBY')}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  suggestionFilter === 'NEARBY'
                    ? 'bg-amber-500 text-white shadow-sm'
                    : 'bg-white border border-[#EFEAE2] text-[#736357] hover:bg-[#FAF8F5]'
                }`}
              >
                <span>📍 Gần vị trí của tôi</span>
              </button>
            </div>

            <span className="text-xs text-[#736357]">
              Hiển thị <strong>{filteredSuggestions.length}</strong> người bạn phù hợp
            </span>
          </div>

          {/* Grid of Suggestions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredSuggestions.map((user) => {
              const isMutual = user.mutualFriendsCount > 0;
              const isNearby = user.distanceKm !== undefined && user.distanceKm <= 1.5;

              return (
                <div
                  key={user.userId}
                  className="p-5 rounded-3xl bg-white border border-[#EFEAE2] shadow-sm shadow-amber-950/5 hover:border-amber-400/50 transition-all flex flex-col justify-between space-y-4"
                >
                  <div className="flex items-start gap-4">
                    {/* 1:1 Square Rounded Avatar */}
                    <div className="relative shrink-0">
                      <img
                        src={user.avatarUrl}
                        alt={user.username}
                        className="w-16 h-16 md:w-18 md:h-18 aspect-square rounded-2xl object-cover border-2 border-amber-300/60 shadow-sm"
                      />
                      <span className="absolute -bottom-1 -right-1 px-1.5 py-0.5 rounded-lg bg-[#2C221E] text-white text-[10px] font-black border border-white">
                        🔥 {user.streakDays}d
                      </span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-sm md:text-base text-[#2C221E] truncate">
                          @{user.username}
                        </h4>
                        <button
                          onClick={() => handleRemoveSuggestion(user.userId)}
                          className="text-[#A89A8D] hover:text-[#2C221E] text-xs p-1"
                          title="Ẩn gợi ý"
                        >
                          ✕
                        </button>
                      </div>

                      {/* Smart Reason Badge (Mutual Friends OR Nearby) */}
                      <div className="mt-1 flex flex-wrap gap-1.5">
                        {isMutual && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-[11px] font-semibold">
                            <span>👥</span>
                            <span>{user.suggestionReason}</span>
                          </span>
                        )}
                        {isNearby && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] font-semibold">
                            <span>📍</span>
                            <span>Cách bạn ~{user.distanceKm} km ({user.location})</span>
                          </span>
                        )}
                      </div>

                      {/* Bio */}
                      <p className="text-xs text-[#736357] mt-2 line-clamp-2 leading-relaxed">
                        {user.bio}
                      </p>
                    </div>
                  </div>

                  {/* Habit highlight */}
                  {user.habitHighlight && (
                    <div className="px-3 py-2 rounded-xl bg-[#FAF8F5] border border-[#EFEAE2] flex items-center justify-between text-xs">
                      <span className="text-[#A89A8D] font-medium">Mục tiêu hôm nay:</span>
                      <span className="font-bold text-[#2C221E]">{user.habitHighlight}</span>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-1 border-t border-[#FAF8F5]">
                    {user.status === 'REQUEST_SENT' ? (
                      <button
                        disabled
                        className="w-full py-2.5 rounded-2xl bg-[#EFEAE2] text-[#736357] font-bold text-xs cursor-not-allowed flex items-center justify-center gap-1"
                      >
                        <span>Đã gửi lời mời ✅</span>
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={() => handleSendRequest(user.userId, user.username)}
                          className="flex-1 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-md shadow-amber-500/20 transition-all flex items-center justify-center gap-1.5"
                        >
                          <span>Kết Bạn Đồng Hành 🤝</span>
                        </button>
                        <button
                          onClick={() => handleRemoveSuggestion(user.userId)}
                          className="px-4 py-2.5 rounded-2xl bg-[#FAF8F5] hover:bg-[#EFEAE2] text-[#736357] font-semibold text-xs transition-all"
                        >
                          Bỏ qua
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {filteredSuggestions.length === 0 && (
            <div className="p-8 rounded-3xl bg-white border border-[#EFEAE2] text-center space-y-3">
              <div className="text-3xl">🌱</div>
              <h4 className="font-bold text-sm text-[#2C221E]">Chưa có thêm gợi ý phù hợp</h4>
              <p className="text-xs text-[#736357]">
                Hãy thử chọn bộ lọc "Tất cả" hoặc qua tab "Tìm Kiếm" để khám phá thêm bạn bè xung quanh bạn.
              </p>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: SEARCH & DISCOVER */}
      {activeTab === 'search' && (
        <div className="space-y-4">
          <div className="p-4 rounded-3xl bg-white border border-[#EFEAE2] shadow-sm flex items-center gap-3">
            <span className="text-xl">🔍</span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Nhập tên @username, địa điểm (Cầu Giấy, Đống Đa...) hoặc thói quen..."
              className="flex-1 bg-transparent border-none text-sm text-[#2C221E] placeholder-[#A89A8D] focus:outline-none"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="text-xs text-[#A89A8D] hover:text-[#2C221E] px-2 py-1 rounded-lg"
              >
                Xóa
              </button>
            )}
          </div>

          {/* Quick Location Pills */}
          <div className="flex items-center gap-2 flex-wrap text-xs">
            <span className="text-[#A89A8D] font-medium">Khu vực phổ biến:</span>
            {['Cầu Giấy', 'Đống Đa', 'Ba Đình', 'Tây Hồ', 'Dậy sớm 5:30', 'Eat clean'].map((chip) => (
              <button
                key={chip}
                onClick={() => setSearchQuery(chip)}
                className="px-3 py-1 rounded-xl bg-white border border-[#EFEAE2] text-[#736357] hover:border-amber-400 hover:text-amber-700 transition-all font-semibold"
              >
                #{chip}
              </button>
            ))}
          </div>

          {/* Search Results */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {searchResults.map((user) => (
              <div
                key={user.userId}
                className="p-5 rounded-3xl bg-white border border-[#EFEAE2] shadow-sm flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={user.avatarUrl}
                    alt={user.username}
                    className="w-14 h-14 aspect-square rounded-2xl object-cover border border-amber-300/50 shrink-0"
                  />
                  <div className="min-w-0">
                    <h4 className="font-bold text-sm text-[#2C221E] truncate">@{user.username}</h4>
                    <p className="text-xs text-amber-700 font-medium">🔥 {user.streakDays} ngày streak</p>
                    <p className="text-xs text-[#736357] truncate mt-0.5">📍 {user.location}</p>
                  </div>
                </div>

                <div className="shrink-0">
                  {user.status === 'REQUEST_SENT' ? (
                    <span className="text-xs text-emerald-600 font-bold px-3 py-1.5 rounded-xl bg-emerald-50">
                      Đã gửi ✅
                    </span>
                  ) : (
                    <button
                      onClick={() => handleSendRequest(user.userId, user.username)}
                      className="px-4 py-2 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-sm transition-all"
                    >
                      Kết Bạn
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {searchResults.length === 0 && (
            <div className="p-8 rounded-3xl bg-white border border-[#EFEAE2] text-center space-y-2">
              <div className="text-3xl">🔎</div>
              <h4 className="font-bold text-sm text-[#2C221E]">Không tìm thấy bạn bè phù hợp với "{searchQuery}"</h4>
              <p className="text-xs text-[#736357]">Hãy thử từ khóa khác hoặc bấm vào các hashtag gợi ý phía trên.</p>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: MY BUDDIES */}
      {activeTab === 'my-buddies' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-black text-sm text-[#2C221E]">
              Đồng Đội Cùng Rèn Luyện ({buddies.length})
            </h3>
            <span className="text-xs text-[#736357]">
              💡 Hãy dùng nút "Huých 🔔" để nhắc nhở nhau khi bạn bè chưa check-in!
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {buddies.map((buddy) => (
              <div
                key={buddy.id}
                className="p-5 rounded-3xl bg-white border border-[#EFEAE2] shadow-sm shadow-amber-950/5 space-y-4"
              >
                <div className="flex items-start gap-4">
                  <div className="relative shrink-0">
                    <img
                      src={buddy.avatarUrl}
                      alt={buddy.username}
                      className="w-16 h-16 aspect-square rounded-2xl object-cover border-2 border-amber-300/60 shadow-sm"
                    />
                    {buddy.isOnline && (
                      <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white shadow-sm" title="Online" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-sm text-[#2C221E] truncate">@{buddy.username}</h4>
                      <span className="text-xs font-black text-amber-600 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200">
                        🔥 {buddy.streakDays} ngày
                      </span>
                    </div>

                    <div className="mt-1 flex items-center gap-2 text-xs text-[#736357]">
                      <span>📍 {buddy.location}</span>
                      <span>•</span>
                      <span>{buddy.lastActive}</span>
                    </div>

                    <p className="text-xs text-[#736357] mt-1.5 line-clamp-1 italic">
                      "{buddy.bio}"
                    </p>
                  </div>
                </div>

                {/* Status bar */}
                <div className="p-3 rounded-2xl bg-[#FAF8F5] border border-[#EFEAE2] flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${buddy.todayCheckedIn ? 'bg-emerald-500' : 'bg-rose-500 animate-ping'}`} />
                    <span className="font-semibold text-[#2C221E]">
                      {buddy.todayCheckedIn ? 'Đã hoàn thành check-in hôm nay 🎉' : 'Chưa check-in hôm nay ⏳'}
                    </span>
                  </div>
                  <span className="font-bold text-amber-700">{buddy.currentHabit}</span>
                </div>

                {/* Interaction Button */}
                <div className="flex items-center gap-2 pt-1 border-t border-[#FAF8F5]">
                  <button
                    disabled={buddy.nudgedToday}
                    onClick={() => handleNudge(buddy.id, buddy.username)}
                    className={`flex-1 py-2.5 rounded-2xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 ${
                      buddy.nudgedToday
                        ? 'bg-[#EFEAE2] text-[#736357] cursor-not-allowed'
                        : 'bg-amber-500 hover:bg-amber-600 text-white shadow-md shadow-amber-500/20'
                    }`}
                  >
                    <span>{buddy.nudgedToday ? 'Đã Huých Hôm Nay 🔔' : 'Huých Nudge Nhắc Nhở 🔔'}</span>
                  </button>

                  <button
                    onClick={() => showToast(`💬 Mở tin nhắn riêng với @${buddy.username}`)}
                    className="px-4 py-2.5 rounded-2xl bg-[#FAF8F5] hover:bg-[#EFEAE2] text-[#2C221E] font-semibold text-xs transition-all"
                  >
                    Nhắn tin 💬
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: PENDING REQUESTS */}
      {activeTab === 'requests' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-black text-sm text-[#2C221E]">
              Lời Mời Kết Bạn Đang Chờ ({requests.length})
            </h3>
          </div>

          <div className="space-y-3">
            {requests.map((req) => (
              <div
                key={req.id}
                className="p-5 rounded-3xl bg-white border border-[#EFEAE2] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-start sm:items-center gap-4">
                  <img
                    src={req.avatarUrl}
                    alt={req.username}
                    className="w-14 h-14 aspect-square rounded-2xl object-cover border-2 border-amber-300/60 shadow-sm shrink-0"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm text-[#2C221E]">@{req.username}</h4>
                      <span className="text-xs font-black text-amber-600">🔥 {req.streakDays} ngày</span>
                    </div>
                    <p className="text-xs text-[#736357] mt-0.5">{req.bio}</p>
                    <div className="flex items-center gap-2 mt-1 text-[11px] text-[#A89A8D]">
                      <span>📍 {req.location}</span>
                      <span>•</span>
                      <span>{req.mutualCount} bạn chung</span>
                      <span>•</span>
                      <span>{req.createdAt}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                  <button
                    onClick={() => handleAcceptRequest(req.id, req.username, req.avatarUrl, req.bio, req.streakDays, req.location)}
                    className="px-4 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-md shadow-amber-500/20 transition-all"
                  >
                    Đồng Ý 🤝
                  </button>
                  <button
                    onClick={() => handleRejectRequest(req.id, req.username)}
                    className="px-4 py-2.5 rounded-2xl bg-[#FAF8F5] hover:bg-[#EFEAE2] text-[#736357] font-semibold text-xs transition-all"
                  >
                    Từ Chối
                  </button>
                </div>
              </div>
            ))}

            {requests.length === 0 && (
              <div className="p-8 rounded-3xl bg-white border border-[#EFEAE2] text-center space-y-2">
                <div className="text-3xl">📭</div>
                <h4 className="font-bold text-sm text-[#2C221E]">Không có lời mời nào đang chờ</h4>
                <p className="text-xs text-[#736357]">
                  Bạn đã xử lý hết các lời mời kết bạn! Hãy xem tab "Gợi Ý Kết Bạn" để tìm thêm đồng đội mới.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
