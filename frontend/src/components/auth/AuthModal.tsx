import React, { useState } from 'react';
import { authApi, ApiUser } from '../../services/api';

interface AuthModalProps {
  isOpen: boolean;
  onAuthSuccess: (user: ApiUser) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onAuthSuccess }) => {
  const [tab, setTab] = useState<'LOGIN' | 'REGISTER'>('LOGIN');

  // Login form state
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register form state
  const [regUsername, setRegUsername] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginIdentifier.trim() || !loginPassword.trim()) {
      setErrorMessage('Vui lòng nhập đầy đủ tên đăng nhập/email và mật khẩu.');
      return;
    }

    try {
      setIsLoading(true);
      setErrorMessage(null);
      const res = await authApi.login(loginIdentifier.trim(), loginPassword.trim());
      onAuthSuccess(res.user);
    } catch (err: any) {
      setErrorMessage(err.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickLogin = async (username: string) => {
    try {
      setIsLoading(true);
      setErrorMessage(null);
      const res = await authApi.login(username, 'password123');
      onAuthSuccess(res.user);
    } catch (err: any) {
      setErrorMessage(err.message || 'Không thể đăng nhập tài khoản mẫu.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regUsername.trim() || !regEmail.trim() || !regPassword.trim()) {
      setErrorMessage('Vui lòng điền đầy đủ tất cả các trường.');
      return;
    }
    if (regPassword.length < 6) {
      setErrorMessage('Mật khẩu phải có ít nhất 6 ký tự.');
      return;
    }
    if (regPassword !== regConfirmPassword) {
      setErrorMessage('Mật khẩu xác nhận không khớp.');
      return;
    }

    try {
      setIsLoading(true);
      setErrorMessage(null);
      const res = await authApi.register({
        username: regUsername.trim(),
        email: regEmail.trim(),
        password: regPassword.trim()
      });
      onAuthSuccess(res.user);
    } catch (err: any) {
      setErrorMessage(err.message || 'Đăng ký thất bại. Tên đăng nhập hoặc email có thể đã tồn tại.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md bg-[#FAF8F5] rounded-3xl overflow-hidden shadow-2xl border border-[#E5DCCE]">
        
        {/* Brand Banner */}
        <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 p-6 text-white text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm text-2xl shadow-inner mb-2">
            ✨
          </div>
          <h2 className="text-2xl font-black tracking-tight">AuraDay</h2>
          <p className="text-xs text-amber-100 font-medium mt-1">
            Không Gian Kỷ Luật & Kết Nối Bạn Bè Gen Z
          </p>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-[#E5DCCE] bg-[#F4EFEA]/60 p-1.5 mx-4 mt-4 rounded-2xl">
          <button
            type="button"
            onClick={() => { setTab('LOGIN'); setErrorMessage(null); }}
            className={`flex-1 py-2 text-xs font-black rounded-xl transition-all duration-200 ${
              tab === 'LOGIN'
                ? 'bg-white text-amber-700 shadow-sm'
                : 'text-[#918072] hover:text-[#2C221E]'
            }`}
          >
            Đăng Nhập
          </button>
          <button
            type="button"
            onClick={() => { setTab('REGISTER'); setErrorMessage(null); }}
            className={`flex-1 py-2 text-xs font-black rounded-xl transition-all duration-200 ${
              tab === 'REGISTER'
                ? 'bg-white text-amber-700 shadow-sm'
                : 'text-[#918072] hover:text-[#2C221E]'
            }`}
          >
            Đăng Ký Tài Khoản
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6">
          {errorMessage && (
            <div className="mb-4 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-start space-x-2 animate-shake">
              <span>⚠️</span>
              <span>{errorMessage}</span>
            </div>
          )}

          {tab === 'LOGIN' ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#2C221E] mb-1.5">
                  Tên đăng nhập hoặc Email
                </label>
                <input
                  type="text"
                  value={loginIdentifier}
                  onChange={(e) => setLoginIdentifier(e.target.value)}
                  placeholder="Ví dụ: lehongson hoặc son@gmail.com"
                  className="w-full px-4 py-2.5 rounded-2xl bg-white border border-[#E5DCCE] text-sm text-[#2C221E] placeholder-[#918072]/60 focus:outline-none focus:border-amber-500 shadow-sm transition-colors"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#2C221E] mb-1.5">
                  Mật khẩu
                </label>
                <input
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="Nhập mật khẩu..."
                  className="w-full px-4 py-2.5 rounded-2xl bg-white border border-[#E5DCCE] text-sm text-[#2C221E] placeholder-[#918072]/60 focus:outline-none focus:border-amber-500 shadow-sm transition-colors"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:brightness-105 text-white font-black text-sm tracking-wide shadow-lg shadow-amber-500/25 transition-all duration-200 active:scale-[0.99] disabled:opacity-50 mt-2"
              >
                {isLoading ? 'Đang xác thực...' : 'Đăng Nhập Ngay 🚀'}
              </button>

              {/* Quick sample account picker */}
              <div className="pt-4 border-t border-[#E5DCCE]/60 mt-4">
                <p className="text-[11px] font-bold text-[#918072] text-center mb-2">
                  Hoặc đăng nhập nhanh bằng tài khoản mẫu:
                </p>
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { name: 'Lê Hồng Sơn', user: 'lehongson' },
                    { name: 'Linh Đan', user: 'linh_dan' },
                    { name: 'Hoàng Nam', user: 'hoang_nam' }
                  ].map((acc) => (
                    <button
                      key={acc.user}
                      type="button"
                      onClick={() => handleQuickLogin(acc.user)}
                      className="px-2 py-1.5 rounded-xl bg-white border border-amber-200 hover:bg-amber-50 text-[11px] font-bold text-amber-800 transition-colors shadow-2xs truncate"
                    >
                      {acc.name}
                    </button>
                  ))}
                </div>
              </div>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-[#2C221E] mb-1">
                  Tên đăng nhập (Username)
                </label>
                <input
                  type="text"
                  value={regUsername}
                  onChange={(e) => setRegUsername(e.target.value)}
                  placeholder="Ví dụ: anh_tuan, mai_linh..."
                  className="w-full px-4 py-2 rounded-2xl bg-white border border-[#E5DCCE] text-sm text-[#2C221E] placeholder-[#918072]/60 focus:outline-none focus:border-amber-500 shadow-sm transition-colors"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#2C221E] mb-1">
                  Địa chỉ Email
                </label>
                <input
                  type="email"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="ban@example.com"
                  className="w-full px-4 py-2 rounded-2xl bg-white border border-[#E5DCCE] text-sm text-[#2C221E] placeholder-[#918072]/60 focus:outline-none focus:border-amber-500 shadow-sm transition-colors"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#2C221E] mb-1">
                  Mật khẩu (Tối thiểu 6 ký tự)
                </label>
                <input
                  type="password"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-2 rounded-2xl bg-white border border-[#E5DCCE] text-sm text-[#2C221E] placeholder-[#918072]/60 focus:outline-none focus:border-amber-500 shadow-sm transition-colors"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#2C221E] mb-1">
                  Xác nhận lại mật khẩu
                </label>
                <input
                  type="password"
                  value={regConfirmPassword}
                  onChange={(e) => setRegConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-2 rounded-2xl bg-white border border-[#E5DCCE] text-sm text-[#2C221E] placeholder-[#918072]/60 focus:outline-none focus:border-amber-500 shadow-sm transition-colors"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:brightness-105 text-white font-black text-sm tracking-wide shadow-lg shadow-amber-500/25 transition-all duration-200 active:scale-[0.99] disabled:opacity-50 mt-2"
              >
                {isLoading ? 'Đang tạo tài khoản...' : 'Tạo Tài Khoản Mới ✨'}
              </button>
            </form>
          )}

          <p className="text-[11px] text-[#918072] text-center mt-4">
            Tài khoản của bạn sẽ được lưu vĩnh viễn trên thiết bị này cho đến khi bạn bấm Đăng Xuất.
          </p>
        </div>
      </div>
    </div>
  );
};
