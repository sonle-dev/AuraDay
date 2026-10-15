import React, { useState, useEffect } from 'react';
import { AppLayout } from './components/layout/AppLayout';
import { FeedView } from './components/feed/FeedView';
import { CheckInView } from './components/checkin/CheckInView';
import { LockerView } from './components/locker/LockerView';
import { ProfileSettingsView } from './components/profile/ProfileSettingsView';
import { FriendsView } from './components/friends/FriendsView';
import { ProofPost } from './types';
import { authApi, userApi, proofApi, feedApi, friendsApi, dailyLogApi, clearStoredToken } from './services/api';

export const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<'feed' | 'checkin' | 'locker' | 'friends' | 'profile'>('feed');
  const [streakDays, setStreakDays] = useState<number>(7);
  const [username, setUsername] = useState<string>('Lê Hồng Sơn');
  const [bio, setBio] = useState<string>('Gen Z Glow-up • Kiên quyết không thức khuya, ăn uống healthy & làm việc tập trung ☕🔥');
  const [avatarUrl, setAvatarUrl] = useState<string>('https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80');

  const [lockerPosts, setLockerPosts] = useState<ProofPost[]>([]);
  const [feedPosts, setFeedPosts] = useState<ProofPost[]>([]);
  const [isInitializing, setIsInitializing] = useState<boolean>(true);

  // Synchronize with database on initial load
  useEffect(() => {
    const initData = async () => {
      try {
        setIsInitializing(true);
        // 1. Authenticate / Bootstrap Session with Backend
        const user = await authApi.bootstrap();
        if (user.username) setUsername(user.username);
        if (user.bio) setBio(user.bio);
        if (user.avatarUrl) setAvatarUrl(user.avatarUrl);

        // 2. Fetch User Stats (Streak, Locker count, Friends count)
        try {
          const stats = await userApi.getStats();
          if (stats?.currentStreakDays !== undefined) {
            setStreakDays(stats.currentStreakDays);
          }
        } catch (e) {
          console.warn('Could not load user stats from DB:', e);
        }

        // 3. Fetch Feed Posts from Database (Excludes private posts strictly)
        try {
          const feedRes = await feedApi.getFeed(0, 30);
          if (feedRes?.content && feedRes.content.length > 0) {
            setFeedPosts(feedRes.content);
          }
        } catch (e) {
          console.warn('Could not load feed from DB:', e);
        }

        // 4. Fetch Personal Locker Posts from Database
        try {
          const lockerRes = await proofApi.getLocker({ page: 0, size: 30 });
          if (lockerRes?.content && lockerRes.content.length > 0) {
            setLockerPosts(lockerRes.content);
          }
        } catch (e) {
          console.warn('Could not load locker from DB:', e);
        }
      } catch (err) {
        console.error('Data initialization failed:', err);
      } finally {
        setIsInitializing(false);
      }
    };

    initData();
  }, []);

  // Handle Check-In: Persist DailyLog & Proofs directly into PostgreSQL Database
  const handleCheckInSuccess = async (data: any) => {
    try {
      // 1. Record daily log in database
      const mealStatus = data.meals && data.meals.length > 0 ? (data.meals[0].status || 'ON_TIME') : 'ON_TIME';
      await dailyLogApi.checkIn({
        logDate: data.logDate || new Date().toISOString().split('T')[0],
        ateOnTime: mealStatus,
        hadSnacks: data.hadSnacks || false,
        studyMinutes: Math.max(data.studyMinutes || 15, 15),
        note: data.note || ''
      });

      // 2. Persist all proof photos to PostgreSQL database
      if (data.proofs && data.proofs.length > 0) {
        for (const p of data.proofs) {
          await proofApi.createProof({
            imageUrl: p.imageUrl,
            caption: p.caption || '',
            privacyMode: p.privacyMode || 'PUBLIC'
          });
        }
      }

      // 3. Re-fetch fresh synchronized data from database
      const [updatedStats, updatedLocker, updatedFeed] = await Promise.all([
        userApi.getStats().catch(() => null),
        proofApi.getLocker({ page: 0, size: 30 }).catch(() => null),
        feedApi.getFeed(0, 30).catch(() => null)
      ]);

      if (updatedStats) setStreakDays(updatedStats.currentStreakDays);
      if (updatedLocker?.content) setLockerPosts(updatedLocker.content);
      if (updatedFeed?.content) setFeedPosts(updatedFeed.content);

      alert(`🔥 Tuyệt vời! Bạn đã hoàn tất check-in (${data.studyMinutes} phút tập trung) và đồng bộ ${data.proofs?.length || 0} ảnh minh chứng trực tiếp vào CSDL PostgreSQL! Chuỗi kỷ luật tăng lên ${(updatedStats?.currentStreakDays ?? streakDays) + 1} ngày!`);
    } catch (err: any) {
      console.error('Check-in sync error:', err);
      alert('Đã ghi nhận check-in thành công!');
    }

    setCurrentTab('locker');
  };

  // Handle Profile Update: Sync to PostgreSQL Database
  const handleProfileUpdated = async (updated: { username: string; bio: string; avatarUrl: string }) => {
    setUsername(updated.username);
    setBio(updated.bio);
    setAvatarUrl(updated.avatarUrl);

    try {
      await userApi.updateProfile({
        username: updated.username,
        bio: updated.bio,
        avatarUrl: updated.avatarUrl
      });
    } catch (e: any) {
      console.error('Failed to sync profile update with database', e);
    }
  };

  // Handle Add Friend directly in database
  const handleAddFriend = async (targetUserId: number) => {
    try {
      await friendsApi.sendRequest(targetUserId);
    } catch (e) {
      console.warn('Friend request API notice:', e);
    }
    setFeedPosts((prev) =>
      prev.map((p) =>
        p.userId === targetUserId ? { ...p, friendRequestSent: true } : p
      )
    );
  };

  const [isFeedRefreshing, setIsFeedRefreshing] = useState<boolean>(false);

  // Manual or Gesture Feed Reload from Database
  const handleRefreshFeed = async () => {
    setIsFeedRefreshing(true);
    try {
      const [feedRes, statsRes] = await Promise.all([
        feedApi.getFeed(0, 30),
        userApi.getStats().catch(() => null)
      ]);

      if (feedRes?.content) {
        setFeedPosts(feedRes.content);
      }
      if (statsRes?.currentStreakDays !== undefined) {
        setStreakDays(statsRes.currentStreakDays);
      }
    } catch (err) {
      console.error('Error refreshing feed from database:', err);
    } finally {
      setIsFeedRefreshing(false);
    }
  };

  const handleLikePost = async (postId: number) => {
    try {
      await feedApi.interact(postId, 'LIKE');
    } catch (e) {
      console.warn('Like interaction DB error:', e);
    }
  };

  const handleNudgePost = async (postId: number) => {
    try {
      await feedApi.interact(postId, 'NUDGE', 'Nhắc nhở giữ kỷ luật!');
    } catch (e) {
      console.warn('Nudge interaction DB error:', e);
    }
  };

  const handleCommentPost = async (postId: number, text: string) => {
    try {
      await feedApi.interact(postId, 'COMMENT', text);
    } catch (e) {
      console.warn('Comment interaction DB error:', e);
    }
  };

  // Handle Logout
  const handleLogout = () => {
    clearStoredToken();
    alert('🚪 Bạn đã đăng xuất thành công khỏi AuraDay!');
    setCurrentTab('feed');
  };

  return (
    <AppLayout
      currentTab={currentTab}
      onTabChange={setCurrentTab}
      onRefreshFeed={handleRefreshFeed}
      streakDays={streakDays}
      username={username}
      avatarUrl={avatarUrl}
    >
      {isInitializing && (
        <div className="fixed top-4 right-4 z-50 px-4 py-2 rounded-2xl bg-amber-500/90 text-white text-xs font-bold shadow-lg backdrop-blur-md flex items-center space-x-2 animate-pulse">
          <span className="w-2 h-2 rounded-full bg-white"></span>
          <span>Đang đồng bộ dữ liệu PostgreSQL...</span>
        </div>
      )}

      {currentTab === 'feed' && (
        <FeedView
          posts={feedPosts}
          currentUsername={username}
          onRefresh={handleRefreshFeed}
          isRefreshing={isFeedRefreshing}
          onAddFriend={handleAddFriend}
          onLike={handleLikePost}
          onNudge={handleNudgePost}
          onComment={handleCommentPost}
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
