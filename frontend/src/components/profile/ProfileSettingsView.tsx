import React, { useState } from 'react';
import { PrivacyMode } from '../../types';

interface ProfileSettingsViewProps {
  initialUsername?: string;
  initialBio?: string;
  initialAvatarUrl?: string;
  initialStreakDays?: number;
  onLogout?: () => void;
  onProfileUpdated?: (updated: { username: string; bio: string; avatarUrl: string }) => void;
}

export const ProfileSettingsView: React.FC<ProfileSettingsViewProps> = ({
  initialUsername = 'Lê Hồng Sơn',
  initialBio = 'Gen Z Glow-up • Kiên quyết không thức khuya, ăn uống healthy & làm việc tập trung ☕🔥',
  initialAvatarUrl = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  initialStreakDays = 7,
  onLogout,
  onProfileUpdated
}) => {
  // Navigation inside Settings
  const [activeSubTab, setActiveSubTab] = useState<'profile' | 'privacy' | 'security'>('profile');

  // User State
  const [username, setUsername] = useState<string>(initialUsername);
  const [bio, setBio] = useState<string>(initialBio);
  const [avatarUrl, setAvatarUrl] = useState<string>(initialAvatarUrl);
  const [isEditingProfile, setIsEditingProfile] = useState<boolean>(false);
  const [editUsername, setEditUsername] = useState<string>(username);
  const [editBio, setEditBio] = useState<string>(bio);
  const [editAvatarUrl, setEditAvatarUrl] = useState<string>(avatarUrl);

  // Privacy State
  const [defaultPrivacy, setDefaultPrivacy] = useState<PrivacyMode>('FRIENDS_ONLY');
  const [showStreakPublic, setShowStreakPublic] = useState<boolean>(true);
  const [allowNudge, setAllowNudge] = useState<boolean>(true);
  const [emailNotify, setEmailNotify] = useState<boolean>(false);

  // Password State
  const [currentPassword, setCurrentPassword] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [showPwd, setShowPwd] = useState<boolean>(false);

  // Feedback Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editUsername.trim()) {
      alert('Tên người dùng không được để trống!');
      return;
    }
    setUsername(editUsername.trim());
    setBio(editBio.trim());
    setAvatarUrl(editAvatarUrl.trim());
    setIsEditingProfile(false);
    showToast('✨ Đã cập nhật hồ sơ cá nhân thành công!');
    if (onProfileUpdated) {
      onProfileUpdated({
        username: editUsername.trim(),
        bio: editBio.trim(),
        avatarUrl: editAvatarUrl.trim()
      });
    }
  };

  const handleSavePrivacy = () => {
    showToast('🔒 Đã lưu cài đặt quyền riêng tư thành công!');
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword) {
      alert('Vui lòng nhập mật khẩu hiện tại!');
      return;
    }
    if (newPassword.length < 6) {
      alert('Mật khẩu mới phải có tối thiểu 6 ký tự!');
      return;
    }
    if (newPassword !== confirmPassword) {
      alert('Mật khẩu xác nhận không khớp!');
      return;
    }
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    showToast('🔑 Đổi mật khẩu thành công! Hãy ghi nhớ mật khẩu mới.');
  };

  const handleLogoutClick = () => {
    if (window.confirm('Bạn có chắc chắn muốn đăng xuất khỏi AuraDay?')) {
      if (onLogout) {
        onLogout();
      } else {
        alert('Đã đăng xuất tài khoản an toàn!');
      }
    }
  };

  const avatarPresets = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
  ];

  return (
    <div className="space-y-6 animate-fade-in relative">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 p-4 rounded-2xl bg-white border border-amber-300 shadow-xl shadow-amber-900/10 text-xs font-bold text-amber-900 flex items-center space-x-2 animate-bounce">
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div>
        <h2 className="text-2xl font-black text-[#2C221E] tracking-tight">Tài Khoản & Cài Đặt</h2>
        <p className="text-sm text-[#736357]">Quản lý hồ sơ cá nhân, thiết lập quyền riêng tư và bảo mật</p>
      </div>

      {/* Tabs Selector */}
      <div className="flex items-center space-x-2 p-1.5 rounded-2xl bg-white border border-[#EFEAE2] shadow-sm shadow-amber-950/5">
        {[
          { id: 'profile', label: '👤 Hồ Sơ', desc: 'Thông tin cá nhân' },
          { id: 'privacy', label: '🔒 Quyền Riêng Tư', desc: 'Chế độ Locker' },
          { id: 'security', label: '🛡️ Bảo Mật', desc: 'Mật khẩu & Đăng xuất' }
        ].map((tab) => {
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`flex-1 py-2.5 px-3 rounded-xl font-bold text-xs md:text-sm transition-all text-center ${
                isActive
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md shadow-amber-500/25'
                  : 'text-[#736357] hover:text-[#2C221E] hover:bg-[#FAF8F5]'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ================= TAB 1: HỒ SƠ CÁ NHÂN ================= */}
      {activeSubTab === 'profile' && (
        <div className="space-y-6">
          {/* Profile Card */}
          <div className="p-6 rounded-3xl bg-white border border-[#EFEAE2] shadow-sm shadow-amber-950/5 flex flex-col md:flex-row items-center md:items-start gap-6">
            <div className="relative group">
              <img
                src={avatarUrl}
                alt={username}
                className="w-24 h-24 md:w-28 md:h-28 rounded-full object-cover border-4 border-amber-300 shadow-md shadow-amber-500/10"
              />
              <button
                type="button"
                onClick={() => {
                  setEditUsername(username);
                  setEditBio(bio);
                  setEditAvatarUrl(avatarUrl);
                  setIsEditingProfile(true);
                }}
                className="absolute bottom-0 right-0 p-2 rounded-full bg-amber-500 text-white shadow-md hover:bg-amber-600 transition-colors"
                title="Đổi ảnh đại diện"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
            </div>

            <div className="flex-1 text-center md:text-left space-y-2">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div>
                  <h3 className="text-xl font-black text-[#2C221E]">{username}</h3>
                  <div className="flex items-center justify-center md:justify-start space-x-2 mt-1">
                    <span className="bg-amber-100 text-amber-800 text-xs font-bold px-2.5 py-0.5 rounded-full border border-amber-300">
                      Aura Gen Z ✨
                    </span>
                    <span className="text-xs text-[#918072]">sonle@auraday.com</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setEditUsername(username);
                    setEditBio(bio);
                    setEditAvatarUrl(avatarUrl);
                    setIsEditingProfile(!isEditingProfile);
                  }}
                  className="px-4 py-2 rounded-2xl bg-amber-50 text-amber-900 border border-amber-200/80 hover:bg-amber-100 text-xs font-bold transition-all shadow-sm"
                >
                  ✏️ Chỉnh Sửa Hồ Sơ
                </button>
              </div>

              <p className="text-sm text-[#5D4F45] leading-relaxed pt-2 border-t border-[#EFEAE2]">
                {bio || 'Chưa cập nhật tiểu sử cá nhân. Hãy thêm mục tiêu để cùng bạn bè giám sát!'}
              </p>
            </div>
          </div>

          {/* Form Chỉnh Sửa Hồ Sơ (Modal / Inline Drawer) */}
          {isEditingProfile && (
            <form onSubmit={handleSaveProfile} className="p-6 rounded-3xl bg-white border border-amber-300 shadow-md shadow-amber-950/5 space-y-4 animate-fade-in">
              <div className="flex items-center justify-between pb-2 border-b border-[#EFEAE2]">
                <h4 className="font-black text-sm text-[#2C221E]">Cập Nhật Thông Tin Cá Nhân</h4>
                <button
                  type="button"
                  onClick={() => setIsEditingProfile(false)}
                  className="text-xs text-[#918072] hover:text-[#2C221E]"
                >
                  ✕ Đóng
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-xs font-bold text-amber-800 uppercase tracking-wider block mb-1">
                    Tên hiển thị (Username)
                  </label>
                  <input
                    type="text"
                    value={editUsername}
                    onChange={(e) => setEditUsername(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-2xl bg-[#FAF8F5] border border-[#E5DCCE] text-sm text-[#2C221E] focus:bg-white focus:border-amber-500 focus:outline-none"
                    placeholder="Nhập username mới..."
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-amber-800 uppercase tracking-wider block mb-1">
                    Tiểu sử (Bio / Mục tiêu kỷ luật)
                  </label>
                  <textarea
                    rows={2}
                    value={editBio}
                    onChange={(e) => setEditBio(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-2xl bg-[#FAF8F5] border border-[#E5DCCE] text-sm text-[#2C221E] focus:bg-white focus:border-amber-500 focus:outline-none resize-none"
                    placeholder="Mục tiêu của bạn trong kỳ học này..."
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-amber-800 uppercase tracking-wider block mb-1">
                    Link Ảnh Đại Diện (Avatar URL)
                  </label>
                  <input
                    type="text"
                    value={editAvatarUrl}
                    onChange={(e) => setEditAvatarUrl(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-2xl bg-[#FAF8F5] border border-[#E5DCCE] text-xs text-[#2C221E] focus:bg-white focus:border-amber-500 focus:outline-none"
                    placeholder="https://images.unsplash.com/..."
                  />
                  <div className="flex items-center space-x-2 mt-2">
                    <span className="text-[11px] text-[#918072]">Avatar gợi ý:</span>
                    {avatarPresets.map((preset, idx) => (
                      <img
                        key={idx}
                        src={preset}
                        alt="preset"
                        onClick={() => setEditAvatarUrl(preset)}
                        className={`w-7 h-7 rounded-full cursor-pointer object-cover border-2 transition-all ${
                          editAvatarUrl === preset ? 'border-amber-500 scale-110' : 'border-[#EFEAE2] hover:border-amber-300'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-[#EFEAE2]">
                <button
                  type="button"
                  onClick={() => setIsEditingProfile(false)}
                  className="px-4 py-2 rounded-2xl bg-[#FAF8F5] text-[#736357] hover:bg-[#F5F0E8] text-xs font-semibold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold text-xs shadow-md shadow-amber-500/20"
                >
                  Lưu Thay Đổi
                </button>
              </div>
            </form>
          )}

          {/* 4 Visual Statistics Cards */}
          <div>
            <h4 className="text-xs font-bold text-amber-800 uppercase tracking-wider mb-3">
              Thống Kê Kỷ Luật Cá Nhân
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-4 rounded-2xl bg-white border border-[#EFEAE2] shadow-sm shadow-amber-950/5 text-center">
                <span className="text-2xl">🔥</span>
                <div className="text-lg font-black text-[#2C221E] mt-1">{initialStreakDays} Ngày</div>
                <div className="text-[11px] font-semibold text-[#918072]">Chuỗi liên tiếp</div>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-[#EFEAE2] shadow-sm shadow-amber-950/5 text-center">
                <span className="text-2xl">📸</span>
                <div className="text-lg font-black text-[#2C221E] mt-1">14 Bài</div>
                <div className="text-[11px] font-semibold text-[#918072]">Minh chứng Locker</div>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-[#EFEAE2] shadow-sm shadow-amber-950/5 text-center">
                <span className="text-2xl">👥</span>
                <div className="text-lg font-black text-[#2C221E] mt-1">8 Bạn</div>
                <div className="text-[11px] font-semibold text-[#918072]">Đồng hành kỷ luật</div>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-[#EFEAE2] shadow-sm shadow-amber-950/5 text-center">
                <span className="text-2xl">⏳</span>
                <div className="text-lg font-black text-[#2C221E] mt-1">420 Phút</div>
                <div className="text-[11px] font-semibold text-[#918072]">Tổng giờ tập trung</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 2: CÀI ĐẶT QUYỀN RIÊNG TƯ ================= */}
      {activeSubTab === 'privacy' && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-white border border-[#EFEAE2] shadow-sm shadow-amber-950/5 space-y-6">
            <div>
              <h3 className="text-base font-black text-[#2C221E]">Chế Độ Quyền Riêng Tư Mặc Định Khi Đăng Ảnh</h3>
              <p className="text-xs text-[#736357] mt-1">
                Ảnh minh chứng mới chụp sẽ tự động được gán quyền riêng tư này (bạn vẫn có thể thay đổi sau).
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                {
                  mode: 'PUBLIC' as PrivacyMode,
                  icon: '🌐',
                  label: 'Công Khai',
                  desc: 'Mọi người trên AuraDay đều có thể xem bài của bạn'
                },
                {
                  mode: 'FRIENDS_ONLY' as PrivacyMode,
                  icon: '👥',
                  label: 'Bạn Bè',
                  desc: 'Chỉ bạn bè đã chấp nhận mới được xem và tương tác'
                },
                {
                  mode: 'PRIVATE' as PrivacyMode,
                  icon: '🔒',
                  label: 'Chỉ Mình Tôi',
                  desc: 'Tủ khóa bí mật, hoàn toàn ẩn với người khác'
                }
              ].map((item) => {
                const isSelected = defaultPrivacy === item.mode;
                return (
                  <button
                    key={item.mode}
                    type="button"
                    onClick={() => setDefaultPrivacy(item.mode)}
                    className={`p-4 rounded-2xl border text-left transition-all ${
                      isSelected
                        ? 'bg-gradient-to-b from-[#FFF5EB] to-[#FEF3C7]/40 border-amber-400 text-amber-950 shadow-md shadow-amber-500/10 scale-[1.02]'
                        : 'bg-[#FAF8F5] border-[#EFEAE2] hover:bg-white text-[#5D4F45]'
                    }`}
                  >
                    <div className="text-2xl mb-2">{item.icon}</div>
                    <div className={`text-sm font-bold ${isSelected ? 'text-amber-900' : 'text-[#2C221E]'}`}>
                      {item.label}
                    </div>
                    <div className="text-[11px] text-[#918072] mt-1 leading-normal">
                      {item.desc}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Toggle Switches */}
            <div className="space-y-4 pt-4 border-t border-[#EFEAE2]">
              <h4 className="text-xs font-bold text-amber-800 uppercase tracking-wider">
                Tùy Chọn Tương Tác & Hiển Thị
              </h4>

              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#EFEAE2]">
                <div>
                  <div className="text-xs font-bold text-[#2C221E]">Chia sẻ Chuỗi Kỷ Luật (Streak Flame 🔥)</div>
                  <div className="text-[11px] text-[#918072]">Cho phép bạn bè thấy số ngày liên tiếp của bạn trên bảng tin</div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowStreakPublic(!showStreakPublic)}
                  className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${
                    showStreakPublic ? 'bg-amber-500 justify-end' : 'bg-stone-300 justify-start'
                  }`}
                >
                  <div className="bg-white w-4 h-4 rounded-full shadow-md transform transition-transform"></div>
                </button>
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#EFEAE2]">
                <div>
                  <div className="text-xs font-bold text-[#2C221E]">Nhận Huých Nhắc Nhở ("Nudge" 🔔)</div>
                  <div className="text-[11px] text-[#918072]">Bạn bè có thể bấm nút Nudge để nhắc bạn tập trung làm việc hoặc ăn đúng giờ</div>
                </div>
                <button
                  type="button"
                  onClick={() => setAllowNudge(!allowNudge)}
                  className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${
                    allowNudge ? 'bg-amber-500 justify-end' : 'bg-stone-300 justify-start'
                  }`}
                >
                  <div className="bg-white w-4 h-4 rounded-full shadow-md transform transition-transform"></div>
                </button>
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#EFEAE2]">
                <div>
                  <div className="text-xs font-bold text-[#2C221E]">Thông báo bình luận qua Email</div>
                  <div className="text-[11px] text-[#918072]">Nhận thông báo khi bạn bè để lại lời động viên trên bài minh chứng</div>
                </div>
                <button
                  type="button"
                  onClick={() => setEmailNotify(!emailNotify)}
                  className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${
                    emailNotify ? 'bg-amber-500 justify-end' : 'bg-stone-300 justify-start'
                  }`}
                >
                  <div className="bg-white w-4 h-4 rounded-full shadow-md transform transition-transform"></div>
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={handleSavePrivacy}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold text-sm shadow-md shadow-amber-500/25 transition-all"
            >
              Lưu Cài Đặt Quyền Riêng Tư 🔒
            </button>
          </div>
        </div>
      )}

      {/* ================= TAB 3: TÀI KHOẢN & BẢO MẬT ================= */}
      {activeSubTab === 'security' && (
        <div className="space-y-6">
          {/* Change Password Card */}
          <div className="p-6 rounded-3xl bg-white border border-[#EFEAE2] shadow-sm shadow-amber-950/5 space-y-5">
            <div>
              <h3 className="text-base font-black text-[#2C221E]">Đổi Mật Khẩu Tài Khoản</h3>
              <p className="text-xs text-[#736357] mt-1">
                Sử dụng mật khẩu có độ dài tối thiểu 6 ký tự kết hợp chữ và số để bảo vệ tài khoản an toàn.
              </p>
            </div>

            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-amber-800 uppercase tracking-wider block mb-1">
                  Mật khẩu hiện tại
                </label>
                <input
                  type={showPwd ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Nhập mật khẩu đang dùng..."
                  className="w-full px-4 py-2.5 rounded-2xl bg-[#FAF8F5] border border-[#E5DCCE] text-sm text-[#2C221E] focus:bg-white focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-amber-800 uppercase tracking-wider block mb-1">
                  Mật khẩu mới
                </label>
                <input
                  type={showPwd ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)..."
                  className="w-full px-4 py-2.5 rounded-2xl bg-[#FAF8F5] border border-[#E5DCCE] text-sm text-[#2C221E] focus:bg-white focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-amber-800 uppercase tracking-wider block mb-1">
                  Xác nhận mật khẩu mới
                </label>
                <input
                  type={showPwd ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Nhập lại mật khẩu mới..."
                  className="w-full px-4 py-2.5 rounded-2xl bg-[#FAF8F5] border border-[#E5DCCE] text-sm text-[#2C221E] focus:bg-white focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="showPasswordCheck"
                  checked={showPwd}
                  onChange={(e) => setShowPwd(e.target.checked)}
                  className="rounded text-amber-600 focus:ring-amber-500 cursor-pointer"
                />
                <label htmlFor="showPasswordCheck" className="text-xs text-[#736357] cursor-pointer font-medium">
                  Hiện mật khẩu
                </label>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm shadow-md shadow-amber-500/20 transition-all"
              >
                Cập Nhật Mật Khẩu Mới 🔑
              </button>
            </form>
          </div>

          {/* Danger Zone / Logout Card */}
          <div className="p-6 rounded-3xl bg-rose-50/50 border border-rose-200/80 shadow-sm space-y-4">
            <div>
              <h4 className="text-sm font-black text-rose-900">Phiên Đăng Nhập & Đăng Xuất</h4>
              <p className="text-xs text-rose-700/80 mt-0.5">
                Đăng xuất khỏi thiết bị này để bảo vệ quyền riêng tư nếu bạn dùng máy tính công cộng hoặc quán cà phê.
              </p>
            </div>

            <button
              type="button"
              onClick={handleLogoutClick}
              className="px-5 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md shadow-rose-600/20 transition-all active:scale-95"
            >
              🚪 Đăng Xuất Khỏi Tài Khoản
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
