import React from 'react';

interface AppLayoutProps {
  currentTab: 'feed' | 'checkin' | 'locker' | 'friends';
  onTabChange: (tab: 'feed' | 'checkin' | 'locker' | 'friends') => void;
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
      label: 'Tủ Khóa (Locker)',
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
    }
  ];

  return (
    <div className="min-h-screen bg-[#1A1614] text-[#F5EBE1] flex flex-col md:flex-row antialiased selection:bg-amber-600/30 selection:text-amber-200">
      {/* ================= DESKTOP SIDEBAR ================= */}
      <aside className="hidden md:flex flex-col w-72 bg-[#221C18]/90 backdrop-blur-xl border-r border-amber-900/25 p-6 justify-between sticky top-0 h-screen z-30">
        <div>
          {/* Logo Brand */}
          <div className="flex items-center space-x-3 mb-8 cursor-pointer group" onClick={() => onTabChange('feed')}>
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#2A221D] to-[#1A1614] border border-amber-500/30 p-1 flex items-center justify-center shadow-lg shadow-amber-950/50 group-hover:border-amber-400 transition-all">
              <img src="/logo.png" alt="AuraDay Logo" className="w-full h-full object-contain filter drop-shadow(0 2px 4px rgba(217, 119, 6, 0.4))" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-amber-200 via-amber-400 to-amber-600 bg-clip-text text-transparent">
                AuraDay
              </h1>
              <p className="text-xs text-amber-200/60 font-medium">Kỷ Luật & Bạn Bè</p>
            </div>
          </div>

          {/* Streak Status Card */}
          <div className="p-4 rounded-2xl bg-[#2A221D] border border-amber-600/20 mb-8 relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 w-20 h-20 bg-amber-500/10 rounded-full blur-xl group-hover:bg-amber-500/20 transition-all"></div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-2xl animate-bounce">🔥</span>
                <div>
                  <div className="text-sm font-semibold text-amber-400">Chuỗi Kỷ Luật</div>
                  <div className="text-xl font-extrabold text-[#F5EBE1]">{streakDays} Ngày Liên Tiếp</div>
                </div>
              </div>
            </div>
            <div className="w-full bg-[#1A1614] h-2 rounded-full mt-3 overflow-hidden">
              <div className="bg-gradient-to-r from-amber-600 to-amber-400 h-full rounded-full transition-all duration-500" style={{ width: '85%' }}></div>
            </div>
          </div>

          {/* Nav List */}
          <nav className="space-y-2">
            {navItems.map((item) => {
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={`w-full flex items-center space-x-3.5 px-4 py-3.5 rounded-2xl font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-amber-600/20 to-amber-500/10 text-amber-400 border border-amber-600/30 shadow-md shadow-amber-950/40'
                      : 'text-[#A8998C] hover:text-[#F5EBE1] hover:bg-[#2A221D]/60'
                  }`}
                >
                  <span className={`${isActive ? 'text-amber-400' : 'text-[#A8998C]'}`}>{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* User Card */}
        <div className="p-3.5 rounded-2xl bg-[#2A221D]/70 border border-amber-900/20 flex items-center space-x-3">
          <img src={avatarUrl} alt={username} className="w-10 h-10 rounded-full object-cover border border-amber-500/40" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate text-[#F5EBE1]">{username}</p>
            <p className="text-xs text-amber-400/80">K20 - CNTT</p>
          </div>
        </div>
      </aside>

      {/* ================= MAIN CONTENT AREA ================= */}
      <main className="flex-1 flex flex-col min-w-0 pb-24 md:pb-8">
        {/* Mobile Header Bar */}
        <header className="md:hidden flex items-center justify-between p-4 bg-[#221C18]/90 backdrop-blur-md border-b border-amber-900/25 sticky top-0 z-20">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#2A221D] border border-amber-500/30 p-1 flex items-center justify-center shadow-md">
              <img src="/logo.png" alt="AuraDay Logo" className="w-full h-full object-contain filter drop-shadow(0 1px 3px rgba(217, 119, 6, 0.4))" />
            </div>
            <span className="font-bold text-amber-300 tracking-tight">AuraDay</span>
          </div>

          <div className="flex items-center space-x-2 bg-[#2A221D] px-3 py-1 rounded-full border border-amber-600/25 text-xs text-amber-300 font-semibold">
            <span>🔥</span>
            <span>{streakDays} ngày</span>
          </div>
        </header>

        {/* Dynamic Screen View */}
        <div className="flex-1 max-w-4xl w-full mx-auto p-4 md:p-8">
          {children}
        </div>
      </main>

      {/* ================= MOBILE BOTTOM NAVIGATION ================= */}
      <nav className="md:hidden fixed bottom-3 left-3 right-3 bg-[#26211E]/90 backdrop-blur-2xl border border-amber-600/25 rounded-3xl p-2 z-40 shadow-2xl shadow-black/80">
        <div className="flex items-center justify-around">
          {navItems.map((item) => {
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-2xl transition-all duration-200 ${
                  isActive ? 'text-amber-400 scale-105' : 'text-[#A8998C]'
                }`}
              >
                <div className={`p-1 rounded-xl ${isActive ? 'bg-amber-500/15' : ''}`}>
                  {item.icon}
                </div>
                <span className="text-[11px] font-medium mt-0.5 tracking-tight">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
};
