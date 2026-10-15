import React, { useState } from 'react';
import { AppLayout } from './components/layout/AppLayout';
import { FeedView } from './components/feed/FeedView';
import { CheckInView } from './components/checkin/CheckInView';
import { LockerView } from './components/locker/LockerView';

export const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<'feed' | 'checkin' | 'locker' | 'friends'>('feed');
  const [streakDays, setStreakDays] = useState<number>(7);

  const handleCheckInSuccess = (data: any) => {
    setStreakDays((prev) => prev + 1);
    alert(`🔥 Tuyệt vời! Bạn đã hoàn thành check-in (${data.studyMinutes} phút học). Chuỗi kỷ luật tăng lên ${streakDays + 1} ngày!`);
    setCurrentTab('locker');
  };

  return (
    <AppLayout
      currentTab={currentTab}
      onTabChange={setCurrentTab}
      streakDays={streakDays}
      username="Lê Hồng Sơn"
    >
      {currentTab === 'feed' && <FeedView />}
      {currentTab === 'checkin' && <CheckInView onCheckInSuccess={handleCheckInSuccess} />}
      {currentTab === 'locker' && <LockerView />}
      {currentTab === 'friends' && (
        <div className="p-8 rounded-3xl bg-[#26211E]/80 backdrop-blur-xl border border-amber-900/30 text-center space-y-4">
          <div className="text-4xl">👥🤝</div>
          <h3 className="text-lg font-bold text-[#F5EBE1]">Đồng Hành & Giám Sát Kỷ Luật</h3>
          <p className="text-sm text-[#A8998C] max-w-md mx-auto">
            Kết nối với bạn bè cùng phòng, bạn cùng lớp để cùng giữ thói quen dậy sớm, ăn uống điều độ và không lướt điện thoại khuya.
          </p>
          <button
            onClick={() => setCurrentTab('feed')}
            className="px-6 py-2.5 rounded-2xl bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold text-xs"
          >
            Quay lại Bảng Tin
          </button>
        </div>
      )}
    </AppLayout>
  );
};

export default App;
