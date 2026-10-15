import React, { useState } from 'react';
import { AppLayout } from './components/layout/AppLayout';
import { FeedView } from './components/feed/FeedView';
import { CheckInView } from './components/checkin/CheckInView';
import { LockerView } from './components/locker/LockerView';
import { ProfileSettingsView } from './components/profile/ProfileSettingsView';

export const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<'feed' | 'checkin' | 'locker' | 'friends' | 'profile'>('feed');
  const [streakDays, setStreakDays] = useState<number>(7);
  const [username, setUsername] = useState<string>('Lê Hồng Sơn');
  const [bio, setBio] = useState<string>('Sinh viên K20 CNTT • Quyết tâm không thức khuya & duy trì chuỗi học tập đều đặn ☕🔥');
  const [avatarUrl, setAvatarUrl] = useState<string>('https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80');

  const handleCheckInSuccess = (data: any) => {
    setStreakDays((prev) => prev + 1);
    alert(`🔥 Tuyệt vời! Bạn đã hoàn thành check-in (${data.studyMinutes} phút học). Chuỗi kỷ luật tăng lên ${streakDays + 1} ngày!`);
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
      {currentTab === 'locker' && <LockerView />}
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
            Kết nối với bạn bè cùng phòng, bạn cùng lớp để cùng giữ thói quen dậy sớm, ăn uống điều độ và không lướt điện thoại khuya.
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
