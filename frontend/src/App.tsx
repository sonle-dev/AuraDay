import React, { useState } from 'react';
import { AppLayout } from './components/layout/AppLayout';
import { FeedView } from './components/feed/FeedView';
import { CheckInView } from './components/checkin/CheckInView';
import { LockerView } from './components/locker/LockerView';
import { ProfileSettingsView } from './components/profile/ProfileSettingsView';
import { FriendsView } from './components/friends/FriendsView';
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

  const [feedPosts, setFeedPosts] = useState<ProofPost[]>([
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

      // ALL posts go to Locker (including PRIVATE)
      setLockerPosts((prev) => [...newPosts, ...prev]);

      // ONLY PUBLIC and FRIENDS_ONLY go to Feed (PRIVATE never appears on Feed!)
      const feedEligible = newPosts
        .filter((p) => p.privacyMode !== 'PRIVATE')
        .map((p) => ({ ...p, isCurrentUser: true }));

      if (feedEligible.length > 0) {
        setFeedPosts((prev) => [...feedEligible, ...prev]);
      }

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
      {currentTab === 'feed' && (
        <FeedView
          posts={feedPosts}
          onAddFriend={(targetUserId) => {
            setFeedPosts((prev) =>
              prev.map((p) =>
                p.userId === targetUserId ? { ...p, friendRequestSent: true } : p
              )
            );
          }}
        />
      )}
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
      {currentTab === 'friends' && <FriendsView currentUsername={username} />}
    </AppLayout>
  );
};

export default App;
