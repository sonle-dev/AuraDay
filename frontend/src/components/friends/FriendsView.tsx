import React, { useState, useEffect } from 'react';
import { FriendSuggestion, Buddy, FriendRequestItem } from '../../types';
import { friendsApi } from '../../services/api';

interface FriendsViewProps {
  onNudgeBuddy?: (username: string) => void;
  currentUsername?: string;
}

export const FriendsView: React.FC<FriendsViewProps> = ({ 
  onNudgeBuddy,
  currentUsername = 'Lê Hồng Sơn'
}) => {
  const [activeTab, setActiveTab] = useState<'suggestions' | 'search' | 'my-buddies' | 'requests'>('suggestions');
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // Clean ASCII URL without messy % diacritics
  const cleanUsername = (currentUsername || 'sonle')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');

  const inviteUrl = `https://auraday.app/join/${cleanUsername || 'sonle'}`;

  // Suggestions state - ranked organically by algorithm behind the scenes without blunt exposed badges
  const [suggestions, setSuggestions] = useState<FriendSuggestion[]>([
    {
      userId: 101,
      username: 'linh_coffee_code',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
      bio: 'Lập trình viên Gen Z mê latte art ☕ • Cam kết dậy 5:30 sáng và không thức khuya quá 23:30.',
      streakDays: 19,
      mutualFriendsCount: 4,
      mutualFriendNames: ['hoang_nam', 'thu_ha'],
      suggestionReason: '',
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
      suggestionReason: '',
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
      mutualFriendNames: ['minh_anh_zen'],
      suggestionReason: '',
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
      suggestionReason: '',
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
      suggestionReason: '',
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
      lastActive: 'Chưa check-in hôm nay ⏳',
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
      location: 'Hà Nội',
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
      location: 'Hà Nội',
      mutualCount: 3,
      createdAt: '3 giờ trước'
    }
  ]);

  // Synchronize friends, suggestions and requests from Database
  useEffect(() => {
    // 1. Load Suggestions from DB
    friendsApi.getSuggestions()
      .then((data) => {
        if (data && data.length > 0) {
          const mapped: FriendSuggestion[] = data.map((s) => ({
            userId: s.userId,
            username: s.username,
            avatarUrl: s.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
            bio: s.bio || 'Thành viên cộng đồng kỷ luật AuraDay',
            streakDays: s.streakDays || 5,
            mutualFriendsCount: s.mutualFriendsCount || 0,
            mutualFriendNames: s.mutualFriendNames || [],
            suggestionReason: s.suggestionReason || '',
            location: s.location || 'Hà Nội',
            distanceKm: s.distanceKm || 1.2,
            habitHighlight: s.habitHighlight || 'Deep Work • Dậy sớm',
            status: 'IDLE'
          }));
          setSuggestions(mapped);
        }
      })
      .catch((err) => console.warn('Could not load suggestions from DB:', err));

    // 2. Load Friends (Buddies) from DB
    friendsApi.getFriends()
      .then((data) => {
        if (data && data.length > 0) {
          const mappedBuddies: Buddy[] = data.map((f, idx) => ({
            id: f.id || idx + 1,
            userId: f.id,
            username: f.username,
            avatarUrl: f.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=300&auto=format&fit=crop&q=80',
            bio: f.bio || 'Đồng đội kỷ luật trên AuraDay',
            streakDays: 7,
            location: 'Hà Nội',
            distanceKm: 1.0,
            isOnline: true,
            lastActive: 'Hoạt động gần đây',
            currentHabit: 'Kỷ luật hàng ngày',
            todayCheckedIn: true,
            nudgedToday: false
          }));
          setBuddies(mappedBuddies);
        }
      })
      .catch((err) => console.warn('Could not load buddies from DB:', err));

    // 3. Load Pending Requests from DB
    friendsApi.getRequests()
      .then((data) => {
        if (data && data.length > 0) {
          const mappedReqs: FriendRequestItem[] = data.map((r) => ({
            id: r.id,
            fromUserId: r.fromUser?.id || r.userId,
            username: r.fromUser?.username || r.username || 'Bạn mới',
            avatarUrl: r.fromUser?.avatarUrl || 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300&auto=format&fit=crop&q=80',
            bio: r.fromUser?.bio || 'Muốn kết nối cùng bạn rèn luyện kỷ luật',
            streakDays: 5,
            location: 'Hà Nội',
            mutualCount: 1,
            createdAt: 'Gần đây'
          }));
          setRequests(mappedReqs);
        }
      })
      .catch((err) => console.warn('Could not load friend requests from DB:', err));
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleCopyInviteLink = () => {
    navigator.clipboard.writeText(inviteUrl);
    setCopiedLink(true);
    showToast('✨ Đã sao chép link mời vào bộ nhớ tạm!');
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleShareInviteLink = async () => {
    const shareData = {
      title: 'AuraDay - Kỷ Luật & Bạn Đồng Hành',
      text: `Cùng mình rèn luyện thói quen dậy sớm, ăn uống healthy và tập trung mỗi ngày trên AuraDay nhé! 🔥`,
      url: inviteUrl
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        showToast('🚀 Đã mở giao diện chia sẻ!');
      } catch (err) {
        handleCopyInviteLink();
      }
    } else {
      handleCopyInviteLink();
    }
  };

  const handleSendRequest = async (userId: number, username: string) => {
    setSuggestions((prev) =>
      prev.map((s) => (s.userId === userId ? { ...s, status: 'REQUEST_SENT' } : s))
    );
    showToast(`✨ Đã gửi lời mời kết bạn đến @${username}!`);

    try {
      await friendsApi.sendRequest(userId);
    } catch (e: any) {
      console.warn('Friend request API notice:', e.message);
    }
  };

  const handleRemoveSuggestion = (userId: number) => {
    setSuggestions((prev) => prev.filter((s) => s.userId !== userId));
  };

  const handleAcceptRequest = async (requestId: number, username: string, avatarUrl?: string, bio?: string, streakDays?: number, location?: string) => {
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
    showToast(`🤝 Bạn và @${username} đã trở thành bạn đồng hành!`);

    try {
      await friendsApi.acceptRequest(requestId);
    } catch (e: any) {
      console.warn('Accept friend request DB notice:', e.message);
    }
  };

  const handleRejectRequest = async (requestId: number, username: string) => {
    setRequests((prev) => prev.filter((r) => r.id !== requestId));
    showToast(`Đã từ chối lời mời từ @${username}`);

    try {
      await friendsApi.rejectRequest(requestId);
    } catch (e: any) {
      console.warn('Reject friend request DB notice:', e.message);
    }
  };

  const handleNudge = (buddyId: number, username: string) => {
    setBuddies((prev) =>
      prev.map((b) => (b.id === buddyId ? { ...b, nudgedToday: true } : b))
    );
    showToast(`🔔 Đã huých (Nudge) @${username}! Cùng giữ kỷ luật hôm nay 🔥`);
    if (onNudgeBuddy) onNudgeBuddy(username);
  };

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

      {/* Clean, Non-Cluttered Header Banner */}
      <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-transparent border border-amber-500/20 shadow-sm space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-amber-500/15 text-amber-800 text-xs font-bold">
          <span>🤝 Đồng Hành Cùng Tiến</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-black text-[#2C221E] tracking-tight">
          Cùng Nhau Giữ Chuỗi Kỷ Luật 🔥
        </h2>
        <p className="text-xs sm:text-sm text-[#736357] max-w-xl leading-relaxed">
          Khoa học chứng minh bạn duy trì thói quen cao hơn <strong>65%</strong> khi có đồng đội giám sát. Kết bạn từ gợi ý thông minh, tìm kiếm hoặc chia sẻ link mời.
        </p>
      </div>

      {/* Spacious, Never-Crammed Sub-Tabs Bar (Clean Scroll, 4 distinct tabs) */}
      <div className="flex items-center gap-2.5 p-1.5 rounded-2xl bg-[#FAF8F5] border border-[#EFEAE2] overflow-x-auto no-scrollbar scroll-smooth">
        {[
          { id: 'suggestions', label: '✨ Gợi Ý', count: suggestions.length },
          { id: 'search', label: '🔍 Tìm & Mời Bạn' },
          { id: 'my-buddies', label: '👥 Đồng Đội', count: buddies.length },
          { id: 'requests', label: '📩 Lời Mời', count: requests.length, alert: requests.length > 0 }
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`shrink-0 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all whitespace-nowrap flex items-center gap-2 ${
                isActive
                  ? 'bg-amber-500 text-white shadow-sm'
                  : 'text-[#736357] hover:text-[#2C221E] hover:bg-white/70'
              }`}
            >
              <span>{tab.label}</span>
              {tab.count !== undefined && tab.count > 0 && (
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  tab.alert
                    ? 'bg-rose-500 text-white animate-pulse'
                    : isActive
                      ? 'bg-amber-600 text-white'
                      : 'bg-[#EFEAE2] text-[#736357]'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ================= TAB 1: GỢI Ý KẾT BẠN (SẠCH SẼ, TỰ NHIÊN) ================= */}
      {activeTab === 'suggestions' && (
        <div className="space-y-4">
          {/* Subtle Quick Invite Pill */}
          <div className="p-3.5 sm:p-4 rounded-2xl bg-white border border-[#EFEAE2] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="text-xl">💌</span>
              <div>
                <p className="text-xs font-bold text-[#2C221E]">Rủ bạn bè cùng tham gia AuraDay</p>
                <p className="text-[11px] text-[#736357]">Chia sẻ link mời riêng để kết bạn tức thì</p>
              </div>
            </div>
            <button
              onClick={() => setActiveTab('search')}
              className="px-4 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 font-bold text-xs transition-all self-start sm:self-auto shadow-sm"
            >
              Lấy Link Mời 🔗
            </button>
          </div>

          {/* Grid of Suggestions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {suggestions.map((user) => (
              <div
                key={user.userId}
                className="p-5 rounded-3xl bg-white border border-[#EFEAE2] shadow-sm shadow-amber-950/5 hover:border-amber-400/50 transition-all flex flex-col justify-between space-y-4"
              >
                <div className="flex items-start gap-3.5">
                  {/* 1:1 Square Rounded Avatar with streak flame */}
                  <div className="relative shrink-0">
                    <img
                      src={user.avatarUrl}
                      alt={user.username}
                      className="w-16 h-16 sm:w-18 sm:h-18 aspect-square rounded-2xl object-cover border-2 border-amber-300/60 shadow-sm"
                    />
                    <span className="absolute -bottom-1 -right-1 px-1.5 py-0.5 rounded-lg bg-[#2C221E] text-white text-[10px] font-black border border-white">
                      🔥 {user.streakDays}d
                    </span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-sm sm:text-base text-[#2C221E] truncate">
                        @{user.username}
                      </h4>
                      <button
                        onClick={() => handleRemoveSuggestion(user.userId)}
                        className="text-[#A89A8D] hover:text-[#2C221E] text-xs p-1"
                        title="Ẩn người này"
                      >
                        ✕
                      </button>
                    </div>

                    {/* Bio text (Clean natural social discovery) */}
                    <p className="text-xs text-[#736357] mt-1.5 line-clamp-2 leading-relaxed">
                      {user.bio}
                    </p>
                  </div>
                </div>

                {/* Habit goal card */}
                {user.habitHighlight && (
                  <div className="px-3.5 py-2 rounded-xl bg-[#FAF8F5] border border-[#EFEAE2] flex items-center justify-between text-xs">
                    <span className="text-[#A89A8D] font-medium">Mục tiêu hôm nay:</span>
                    <span className="font-bold text-[#2C221E]">{user.habitHighlight}</span>
                  </div>
                )}

                {/* Action Buttons */}
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
            ))}
          </div>

          {suggestions.length === 0 && (
            <div className="p-8 rounded-3xl bg-white border border-[#EFEAE2] text-center space-y-3">
              <div className="text-3xl">🌱</div>
              <h4 className="font-bold text-sm text-[#2C221E]">Đã xem hết danh sách gợi ý</h4>
              <p className="text-xs text-[#736357]">
                Hãy chuyển qua tab <strong>Tìm & Mời Bạn</strong> để tìm kiếm hoặc gửi link mời riêng nhé!
              </p>
            </div>
          )}
        </div>
      )}

      {/* ================= TAB 2: TÌM KIẾM & MỜI BẠN BÈ (SEARCH & INVITE LINK) ================= */}
      {activeTab === 'search' && (
        <div className="space-y-6 animate-fade-in">
          {/* Card 1: Gửi Link Mời Cá Nhân (Clean & Spacious Layout) */}
          <div className="p-5 sm:p-6 rounded-3xl bg-white border border-[#EFEAE2] shadow-sm space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center text-xl shrink-0">
                💌
              </div>
              <div>
                <h4 className="font-bold text-sm sm:text-base text-[#2C221E]">
                  Gửi Link Mời Kết Bạn
                </h4>
                <p className="text-xs text-[#736357] mt-0.5">
                  Chia sẻ link này cho bạn bè qua Messenger, Zalo để tự động kết nối
                </p>
              </div>
            </div>

            {/* Clean Link Bar */}
            <div className="p-2.5 rounded-2xl bg-[#FAF8F5] border border-[#EFEAE2] flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
              <div className="flex-1 flex items-center gap-2 px-3 py-1.5 min-w-0 bg-white sm:bg-transparent rounded-xl sm:rounded-none border sm:border-none border-[#EFEAE2]">
                <span className="text-amber-600 text-sm shrink-0">🔗</span>
                <span className="text-xs font-mono font-bold text-[#2C221E] truncate select-all">
                  {inviteUrl}
                </span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={handleCopyInviteLink}
                  className={`flex-1 sm:flex-none px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1.5 ${
                    copiedLink
                      ? 'bg-emerald-600 text-white'
                      : 'bg-amber-500 hover:bg-amber-600 text-white'
                  }`}
                >
                  <span>{copiedLink ? 'Đã Chép ✓' : 'Sao Chép 📋'}</span>
                </button>
                <button
                  onClick={handleShareInviteLink}
                  className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-[#2C221E] hover:bg-black text-white text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1.5"
                >
                  <span>Chia Sẻ 📲</span>
                </button>
              </div>
            </div>
          </div>

          {/* Card 2: Tìm Kiếm Trực Tiếp Theo Username / Lối Sống */}
          <div className="space-y-4">
            <div className="p-4 rounded-3xl bg-white border border-[#EFEAE2] shadow-sm flex items-center gap-3">
              <span className="text-xl">🔍</span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Nhập tên @username hoặc thói quen để tìm bạn..."
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

            {/* Quick Filter Tags */}
            <div className="flex items-center gap-2 flex-wrap text-xs px-1">
              <span className="text-[#A89A8D] font-medium">Gợi ý tìm kiếm:</span>
              {['Dậy sớm 5:30', 'Deep Work', 'Eat Clean', 'Gym 45p', 'Đọc sách'].map((chip) => (
                <button
                  key={chip}
                  onClick={() => setSearchQuery(chip)}
                  className="px-3 py-1 rounded-xl bg-white border border-[#EFEAE2] text-[#736357] hover:border-amber-400 hover:text-amber-800 transition-all font-semibold"
                >
                  #{chip}
                </button>
              ))}
            </div>

            {/* Search Results */}
            {searchQuery && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                {searchResults.map((user) => (
                  <div
                    key={user.userId}
                    className="p-5 rounded-3xl bg-white border border-[#EFEAE2] shadow-sm flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <img
                        src={user.avatarUrl}
                        alt={user.username}
                        className="w-14 h-14 aspect-square rounded-2xl object-cover border border-amber-300/50 shrink-0"
                      />
                      <div className="min-w-0">
                        <h4 className="font-bold text-sm text-[#2C221E] truncate">@{user.username}</h4>
                        <p className="text-xs text-amber-700 font-medium">🔥 {user.streakDays} ngày streak</p>
                        <p className="text-xs text-[#736357] truncate mt-0.5">{user.habitHighlight}</p>
                      </div>
                    </div>

                    <div className="shrink-0">
                      {user.status === 'REQUEST_SENT' ? (
                        <span className="text-xs text-emerald-700 font-bold px-3 py-1.5 rounded-xl bg-emerald-50">
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
            )}

            {searchQuery && searchResults.length === 0 && (
              <div className="p-8 rounded-3xl bg-white border border-[#EFEAE2] text-center space-y-2">
                <div className="text-3xl">🔎</div>
                <h4 className="font-bold text-sm text-[#2C221E]">Không tìm thấy bạn bè với "{searchQuery}"</h4>
                <p className="text-xs text-[#736357]">
                  Bạn bè của bạn chưa có tài khoản? Hãy gửi link mời ở trên để rủ họ cùng tham gia nhé!
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================= TAB 3: ĐỒNG ĐỘI CỦA TÔI (MY BUDDIES) ================= */}
      {activeTab === 'my-buddies' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-black text-sm text-[#2C221E]">
              Đồng Đội Đang Cùng Rèn Luyện ({buddies.length})
            </h3>
            <span className="text-xs text-[#736357]">
              💡 Bấm "Huých 🔔" để nhắc bạn bè check-in hôm nay
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {buddies.map((buddy) => (
              <div
                key={buddy.id}
                className="p-5 rounded-3xl bg-white border border-[#EFEAE2] shadow-sm shadow-amber-950/5 space-y-4"
              >
                <div className="flex items-start gap-3.5">
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
                      <span className="text-xs font-black text-amber-700 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200">
                        🔥 {buddy.streakDays} ngày
                      </span>
                    </div>

                    <p className="text-xs text-[#736357] mt-1 line-clamp-1 italic">
                      "{buddy.bio}"
                    </p>
                  </div>
                </div>

                {/* Status bar */}
                <div className="p-3 rounded-2xl bg-[#FAF8F5] border border-[#EFEAE2] flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${buddy.todayCheckedIn ? 'bg-emerald-500' : 'bg-rose-500 animate-ping'}`} />
                    <span className="font-semibold text-[#2C221E]">
                      {buddy.todayCheckedIn ? 'Đã check-in hôm nay 🎉' : 'Chưa check-in hôm nay ⏳'}
                    </span>
                  </div>
                  <span className="font-bold text-amber-800">{buddy.currentHabit}</span>
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
                    onClick={() => showToast(`💬 Mở hộp thư trò chuyện cùng @${buddy.username}`)}
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

      {/* ================= TAB 4: LỜI MỜI (PENDING REQUESTS) ================= */}
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
                    <div className="text-[11px] text-[#A89A8D] mt-1">
                      <span>Gửi {req.createdAt}</span>
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
                  Bạn đã xử lý hết các lời mời! Hãy qua tab "Gợi Ý" hoặc dùng "Tìm & Mời Bạn" để kết nối thêm bạn bè mới.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
