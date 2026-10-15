import React from 'react';

interface AppLayoutProps {
  currentTab: 'feed' | 'checkin' | 'locker' | 'friends' | 'profile';
  onTabChange: (tab: 'feed' | 'checkin' | 'locker' | 'friends' | 'profile') => void;
  children: React.ReactNode;
  streakDays?: number;
  username?: string;
  avatarUrl?: string;
}

export const AppLayout: React.FC<AppLayoutProps> = ({
  currentTab,
  onTabChange,
  children,
  streakDays = 7,
  username = "Sinh Viên Kỷ Luật",
  avatarUrl = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
}) => {
  const navItems = [
    {
      id: 'feed' as const,
      label: 'Bảng Tin',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
        </svg>
      )
    },
    {
      id: 'checkin' as const,
      label: 'Check-in',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    {
      id: 'locker' as const,
      label: 'Tủ Khóa',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      )
    },
    {
      id: 'friends' as const,
      label: 'Đồng Hành',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      )
    },
    {
      id: 'profile' as const,
      label: 'Hồ Sơ',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      )
    }
  ];

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#2C221E] flex flex-col md:flex-row antialiased selection:bg-amber-200 selection:text-amber-900">
      {/* ================= DESKTOP SIDEBAR ================= */}
      <aside className="hidden md:flex flex-col w-72 bg-white/85 backdrop-blur-xl border-r border-[#EFEAE2] p-6 justify-between sticky top-0 h-screen z-30">
        <div>
          {/* Logo Brand */}
          <div className="flex items-center space-x-3 mb-8 cursor-pointer group" onClick={() => onTabChange('feed')}>
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#FFF5EB] to-[#FEF3C7] border border-amber-200/90 p-1 flex items-center justify-center shadow-sm shadow-amber-900/10 group-hover:scale-105 group-hover:border-amber-400 transition-all">
              <img src="/logo.png" alt="AuraDay Logo" className="w-full h-full object-contain filter drop-shadow(0 2px 4px rgba(217, 119, 6, 0.25))" />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight bg-gradient-to-r from-amber-600 via-orange-500 to-amber-700 bg-clip-text text-transparent">
                AuraDay
              </h1>
              <p className="text-xs text-[#918072] font-semibold tracking-wide">Kỷ Luật & Bạn Bè</p>
            </div>
          </div>

          {/* Streak Status Card */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-[#FFF9F2] via-[#FFF5EB] to-[#FEF3C7]/40 border border-amber-200/80 mb-8 relative overflow-hidden shadow-sm group">
            <div className="absolute -right-4 -top-4 w-20 h-20 bg-amber-400/15 rounded-full blur-xl group-hover:bg-amber-400/25 transition-all"></div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <span className="text-2xl animate-bounce">🔥</span>
                <div>
                  <div className="text-xs font-bold text-amber-800 uppercase tracking-wider">Chuỗi Kỷ Luật</div>
                  <div className="text-lg font-black text-[#2C221E]">{streakDays} Ngày Liên Tiếp</div>
                </div>
              </div>
            </div>
            <div className="w-full bg-[#EFEAE2] h-2 rounded-full mt-3 overflow-hidden">
              <div className="bg-gradient-to-r from-amber-500 to-orange-400 h-full rounded-full transition-all duration-500 shadow-sm" style={{ width: '85%' }}></div>
            </div>
          </div>

          {/* Nav List */}
          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={`w-full flex items-center space-x-3.5 px-4 py-3 rounded-2xl font-semibold text-sm transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md shadow-amber-500/25 scale-[1.02]'
                      : 'text-[#736357] hover:text-[#2C221E] hover:bg-[#F5F0E8]'
                  }`}
                >
                  <span className={`${isActive ? 'text-white' : 'text-[#918072]'}`}>{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* User Card */}
        <div 
          onClick={() => onTabChange('profile')}
          className="p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#EFEAE2] flex items-center space-x-3 shadow-sm cursor-pointer hover:border-amber-400 group transition-all"
        >
          <img src={avatarUrl} alt={username} className="w-10 h-10 rounded-full object-cover border-2 border-amber-300 group-hover:scale-105 transition-transform" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold truncate text-[#2C221E] group-hover:text-amber-800">{username}</p>
            <p className="text-xs text-amber-700 font-medium">Hồ Sơ & Cài Đặt ⚙️</p>
          </div>
        </div>
      </aside>

      {/* ================= MAIN CONTENT AREA ================= */}
      <main className="flex-1 flex flex-col min-w-0 pb-24 md:pb-8">
        {/* Mobile Header Bar */}
        <header className="md:hidden flex items-center justify-between p-4 bg-white/90 backdrop-blur-md border-b border-[#EFEAE2] sticky top-0 z-20">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#FFF5EB] to-[#FEF3C7] border border-amber-200 p-1 flex items-center justify-center shadow-sm">
              <img src="/logo.png" alt="AuraDay Logo" className="w-full h-full object-contain filter drop-shadow(0 1px 2px rgba(217, 119, 6, 0.2))" />
            </div>
            <span className="font-extrabold text-amber-700 tracking-tight">AuraDay</span>
          </div>

          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1.5 bg-amber-50 px-3 py-1 rounded-full border border-amber-200 text-xs text-amber-800 font-bold">
              <span>🔥</span>
              <span>{streakDays} ngày</span>
            </div>
            <img 
              src={avatarUrl} 
              alt={username} 
              onClick={() => onTabChange('profile')} 
              className="w-8 h-8 rounded-full object-cover border border-amber-300 cursor-pointer" 
            />
          </div>
        </header>

        {/* Dynamic Screen View */}
        <div className="flex-1 max-w-4xl w-full mx-auto p-4 md:p-8">
          {children}
        </div>
      </main>

      {/* ================= MOBILE BOTTOM NAVIGATION ================= */}
      <nav className="md:hidden fixed bottom-3 left-3 right-3 bg-white/95 backdrop-blur-2xl border border-[#EFEAE2] rounded-3xl p-1.5 z-40 shadow-xl shadow-amber-950/10">
        <div className="flex items-center justify-around">
          {navItems.map((item) => {
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-2xl transition-all duration-200 ${
                  isActive ? 'text-amber-600 font-bold scale-105' : 'text-[#918072]'
                }`}
              >
                <div className={`p-1.5 rounded-xl ${isActive ? 'bg-amber-100/70 text-amber-700' : ''}`}>
                  {item.icon}
                </div>
                <span className="text-[11px] font-semibold mt-0.5 tracking-tight">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
};
