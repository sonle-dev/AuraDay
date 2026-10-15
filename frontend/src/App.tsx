import React, { useState } from 'react';
import { AppLayout } from './components/layout/AppLayout';
import { FeedView } from './components/feed/FeedView';
import { CheckInView } from './components/checkin/CheckInView';
import { LockerView } from './components/locker/LockerView';
import { ProfileSettingsView } from './components/profile/ProfileSettingsView';
import { PrivacyMode, ProofPost } from './types';

export const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<'feed' | 'checkin' | 'locker' | 'friends' | 'profile'>('feed');
  const [streakDays, setStreakDays] = useState<number>(7);
  const [username, setUsername] = useState<string>('Lê Hồng Sơn');
  const [bio, setBio] = useState<string>('Gen Z Glow-up • Kiên quyết không thức khuya, ăn uống healthy & làm việc tập trung ☕🔥');
  const [avatarUrl, setAvatarUrl] = useState<string>('https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80');

  const [lockerPosts, setLockerPosts] = useState<ProofPost[]>([
    {
      id: 1,
      userId: 1,
      username: 'Lê Hồng Sơn',
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
      username: 'Lê Hồng Sơn',
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
      username: 'Lê Hồng Sơn',
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
  ]);

  const handleCheckInSuccess = (data: any) => {
    setStreakDays((prev) => prev + 1);

    if (data.proofs && data.proofs.length > 0) {
      const labelMap: Record<PrivacyMode, string> = {
        PUBLIC: 'Công khai',
        FRIENDS_ONLY: 'Bạn bè',
        PRIVATE: 'Chỉ mình tôi'
      };

      const newPosts: ProofPost[] = data.proofs.map((p: any, idx: number) => ({
        id: Date.now() + idx,
        userId: 1,
        username: username,
        userAvatarUrl: avatarUrl,
        imageUrl: p.imageUrl,
        caption: p.caption,
        privacyMode: p.privacyMode,
        privacyModeLabel: labelMap[p.privacyMode as PrivacyMode] || 'Chỉ mình tôi',
        createdAt: new Date().toISOString(),
        likeCount: 0,
        commentCount: 0,
        nudgeCount: 0,
        likedByCurrentUser: false
      }));

      setLockerPosts((prev) => [...newPosts, ...prev]);
      alert(`🔥 Tuyệt vời! Bạn đã hoàn tất check-in (${data.studyMinutes} phút tập trung) và đồng bộ ${data.proofs.length} ảnh minh chứng vào Tủ Khóa Locker! Chuỗi kỷ luật tăng lên ${streakDays + 1} ngày!`);
    } else {
      alert(`🔥 Tuyệt vời! Bạn đã hoàn thành check-in (${data.studyMinutes} phút tập trung). Chuỗi kỷ luật tăng lên ${streakDays + 1} ngày!`);
    }

    setCurrentTab('locker');
  };

  const handleProfileUpdated = (updated: { username: string; bio: string; avatarUrl: string }) => {
    setUsername(updated.username);
    setBio(updated.bio);
    setAvatarUrl(updated.avatarUrl);
  };

  const handleLogout = () => {
    alert('🚪 Bạn đã đăng xuất thành công khỏi AuraDay!');
    setCurrentTab('feed');
  };

  return (
    <AppLayout
      currentTab={currentTab}
      onTabChange={setCurrentTab}
      streakDays={streakDays}
      username={username}
      avatarUrl={avatarUrl}
    >
      {currentTab === 'feed' && <FeedView />}
      {currentTab === 'checkin' && <CheckInView onCheckInSuccess={handleCheckInSuccess} />}
      {currentTab === 'locker' && <LockerView initialPosts={lockerPosts} />}
      {currentTab === 'profile' && (
        <ProfileSettingsView
          initialUsername={username}
          initialBio={bio}
          initialAvatarUrl={avatarUrl}
          initialStreakDays={streakDays}
          onProfileUpdated={handleProfileUpdated}
          onLogout={handleLogout}
        />
      )}
      {currentTab === 'friends' && (
        <div className="p-8 rounded-3xl bg-white border border-[#EFEAE2] shadow-sm shadow-amber-950/5 text-center space-y-4">
          <div className="text-4xl">👥🤝</div>
          <h3 className="text-lg font-black text-[#2C221E]">Đồng Hành & Giám Sát Kỷ Luật</h3>
          <p className="text-sm text-[#736357] max-w-md mx-auto">
            Kết nối với bạn bè, đồng đội (Accountability Buddies) để cùng giữ thói quen dậy sớm, ăn uống healthy, làm việc năng suất và không thức khuya.
          </p>
          <button
            onClick={() => setCurrentTab('feed')}
            className="px-6 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-md shadow-amber-500/20"
          >
            Quay lại Bảng Tin
          </button>
        </div>
      )}
    </AppLayout>
  );
};

export default App;
