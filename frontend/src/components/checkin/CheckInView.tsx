import React, { useState, useEffect } from 'react';
import { MealStatus, PrivacyMode } from '../../types';
import { CameraModal } from './CameraModal';

export interface CheckInItemProof {
  imageUrl: string;
  privacyMode: PrivacyMode;
  caption: string;
  timestamp: string;
}

interface CheckInViewProps {
  onCheckInSuccess?: (data: any) => void;
}

export const CheckInView: React.FC<CheckInViewProps> = ({ onCheckInSuccess }) => {
  // ================= ITEM 1: NUTRITION & MEAL =================
  const [mealStatus, setMealStatus] = useState<MealStatus>('ON_TIME');
  const [hadSnacks, setHadSnacks] = useState<boolean>(false);
  const [mealPrivacy, setMealPrivacy] = useState<PrivacyMode>('FRIENDS_ONLY');
  const [mealProof, setMealProof] = useState<CheckInItemProof | null>(null);

  // ================= ITEM 2: DEEP WORK & FOCUS =================
  const [studySeconds, setStudySeconds] = useState<number>(15 * 60); // 15 mins default
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [focusPrivacy, setFocusPrivacy] = useState<PrivacyMode>('PUBLIC');
  const [focusProof, setFocusProof] = useState<CheckInItemProof | null>(null);

  // ================= ITEM 3: HEALTHY HABITS & WELLNESS =================
  const [wokeUpEarly, setWokeUpEarly] = useState<boolean>(true);
  const [drankWater, setDrankWater] = useState<boolean>(true);
  const [didExercise, setDidExercise] = useState<boolean>(false);
  const [wellnessPrivacy, setWellnessPrivacy] = useState<PrivacyMode>('PUBLIC');
  const [wellnessProof, setWellnessProof] = useState<CheckInItemProof | null>(null);

  // ================= ITEM 4: JOURNAL & REFLECTION =================
  const [note, setNote] = useState<string>('');
  const [reflectionPrivacy, setReflectionPrivacy] = useState<PrivacyMode>('PRIVATE');
  const [reflectionProof, setReflectionProof] = useState<CheckInItemProof | null>(null);

  // ================= CAMERA MODAL STATE =================
  const [activeCameraItem, setActiveCameraItem] = useState<{
    id: 'meal' | 'focus' | 'wellness' | 'reflection';
    title: string;
    icon: string;
    privacy: PrivacyMode;
  } | null>(null);

  // Focus Timer effect
  useEffect(() => {
    let timer: any = null;
    if (isRunning) {
      timer = setInterval(() => {
        setStudySeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isRunning]);

  const studyMinutes = Math.floor(studySeconds / 60);
  const remainingSeconds = studySeconds % 60;
  const isFocusEligible = studyMinutes >= 15;

  const mealOptions: { id: MealStatus; label: string; icon: string; desc: string }[] = [
    { id: 'ON_TIME', label: 'Đúng Giờ', icon: '🍲', desc: 'Ăn no & đúng cữ' },
    { id: 'LATE', label: 'Ăn Trễ', icon: '⏳', desc: 'Lệch cữ sinh hoạt' },
    { id: 'SKIPPED', label: 'Bỏ Bữa', icon: '⚠️', desc: 'Bận rộn / Quên ăn' },
  ];

  const handleQuickAddMinutes = (mins: number) => {
    setStudySeconds((prev) => prev + mins * 60);
  };

  // Open camera for a specific section
  const handleOpenCamForItem = (
    id: 'meal' | 'focus' | 'wellness' | 'reflection',
    title: string,
    icon: string,
    privacy: PrivacyMode
  ) => {
    setActiveCameraItem({ id, title, icon, privacy });
  };

  // Handle published proof from camera modal
  const handleProofPublished = (result: { imageUrl: string; privacyMode: PrivacyMode; caption: string }) => {
    if (!activeCameraItem) return;

    const newProof: CheckInItemProof = {
      imageUrl: result.imageUrl,
      privacyMode: result.privacyMode,
      caption: result.caption,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    switch (activeCameraItem.id) {
      case 'meal':
        setMealProof(newProof);
        setMealPrivacy(result.privacyMode);
        break;
      case 'focus':
        setFocusProof(newProof);
        setFocusPrivacy(result.privacyMode);
        break;
      case 'wellness':
        setWellnessProof(newProof);
        setWellnessPrivacy(result.privacyMode);
        break;
      case 'reflection':
        setReflectionProof(newProof);
        setReflectionPrivacy(result.privacyMode);
        break;
    }

    setActiveCameraItem(null);
  };

  // Calculate progress
  const completedItemsCount = [
    mealStatus !== undefined,
    isFocusEligible,
    wokeUpEarly || drankWater || didExercise,
    note.trim().length > 0 || reflectionProof !== null,
  ].filter(Boolean).length;

  const proofCount = [mealProof, focusProof, wellnessProof, reflectionProof].filter(Boolean).length;

  // Final check-in submission
  const handleSaveCheckIn = () => {
    if (!isFocusEligible) {
      alert('Kỷ luật AuraDay yêu cầu thời gian tập trung tối thiểu từ 15 phút trở lên!');
      return;
    }

    const payload = {
      logDate: new Date().toISOString().split('T')[0],
      ateOnTime: mealStatus,
      hadSnacks: hadSnacks,
      studyMinutes: studyMinutes,
      note: note,
      proofs: [
        mealProof && { type: 'MEAL', ...mealProof },
        focusProof && { type: 'FOCUS', ...focusProof },
        wellnessProof && { type: 'WELLNESS', ...wellnessProof },
        reflectionProof && { type: 'REFLECTION', ...reflectionProof },
      ].filter(Boolean),
    };

    if (onCheckInSuccess) {
      onCheckInSuccess(payload);
    } else {
      alert(
        `🎉 Đã lưu check-in kỷ luật hôm nay thành công!\n- ${studyMinutes} phút tập trung.\n- Đã gắn ${proofCount} ảnh minh chứng thực tế.`
      );
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Banner with Progress */}
      <div className="p-6 rounded-3xl bg-white border border-[#EFEAE2] shadow-sm shadow-amber-950/5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl font-black text-[#2C221E] tracking-tight">Check-in Kỷ Luật Từng Mục</h2>
            <p className="text-sm text-[#736357]">
              Mỗi mục đều có phần chụp minh chứng qua camera thực tế và tùy chỉnh quyền riêng tư linh hoạt.
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <span className="px-3.5 py-1.5 rounded-full bg-amber-100/80 text-amber-900 border border-amber-300 font-bold text-xs">
              📸 {proofCount}/4 Minh Chứng
            </span>
            <span className="px-3.5 py-1.5 rounded-full bg-emerald-100/80 text-emerald-900 border border-emerald-300 font-bold text-xs">
              ✅ {completedItemsCount}/4 Mục Đạt
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-[#FAF8F5] border border-[#EFEAE2] h-2.5 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-500 rounded-full"
            style={{ width: `${(completedItemsCount / 4) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* ================= MỤC 1: DINH DƯỠNG & ĂN UỐNG ================= */}
      <div className="p-6 rounded-3xl bg-white border border-[#EFEAE2] shadow-sm shadow-amber-950/5 space-y-5">
        <div className="flex items-center justify-between border-b border-[#FAF8F5] pb-3">
          <div className="flex items-center space-x-2.5">
            <span className="text-2xl">🥗</span>
            <div>
              <h3 className="text-base font-black text-[#2C221E]">Mục 1: Dinh Dưỡng & Ăn Uống Lành Mạnh</h3>
              <p className="text-xs text-[#918072]">Cam kết ăn đúng bữa, đủ chất và không nạp đồ ăn vặt khuya</p>
            </div>
          </div>
          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
            {mealProof ? '✅ Đã có minh chứng' : 'Chưa có ảnh'}
          </span>
        </div>

        {/* 1.1 Chọn bữa chính */}
        <div>
          <label className="text-xs font-bold text-amber-800 uppercase tracking-wider block mb-2.5">
            Trạng thái bữa ăn hôm nay
          </label>
          <div className="grid grid-cols-3 gap-3">
            {mealOptions.map((opt) => {
              const isSelected = mealStatus === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setMealStatus(opt.id)}
                  className={`flex flex-col items-center p-3 sm:p-4 rounded-2xl border transition-all text-center ${
                    isSelected
                      ? 'bg-gradient-to-b from-[#FFF5EB] to-[#FEF3C7]/40 border-amber-400 text-amber-950 shadow-md shadow-amber-500/10 scale-[1.02]'
                      : 'bg-[#FAF8F5] border-[#EFEAE2] hover:border-amber-300 hover:bg-white text-[#5D4F45]'
                  }`}
                >
                  <span className="text-2xl mb-1.5">{opt.icon}</span>
                  <span className={`text-xs sm:text-sm font-bold ${isSelected ? 'text-amber-900' : 'text-[#2C221E]'}`}>
                    {opt.label}
                  </span>
                  <span className="text-[10px] text-[#918072] mt-0.5">{opt.desc}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 1.2 Ăn vặt */}
        <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#EFEAE2]">
          <div className="flex items-center space-x-2">
            <span className="text-lg">🧋</span>
            <div>
              <span className="text-xs font-bold text-[#2C221E] block">Bạn có ăn vặt / trà sữa khuya không?</span>
              <span className="text-[11px] text-[#918072]">Giữ hệ tiêu hóa nhẹ nhàng trước khi ngủ</span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setHadSnacks(!hadSnacks)}
            className={`px-4 py-2 rounded-xl font-bold text-xs transition-all border ${
              hadSnacks
                ? 'bg-rose-50 border-rose-200 text-rose-700 shadow-sm'
                : 'bg-emerald-50 border-emerald-200 text-emerald-800 shadow-sm'
            }`}
          >
            {hadSnacks ? '❌ Có Ăn Vặt' : '✅ Không Ăn Vặt'}
          </button>
        </div>

        {/* 1.3 Khu vực chụp minh chứng & chọn quyền riêng tư */}
        <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200/60 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center space-x-2">
              <span className="text-lg">📸</span>
              <div>
                <span className="text-xs font-black text-[#2C221E] block">Minh Chứng Bữa Ăn Thực Tế</span>
                <span className="text-[11px] text-[#918072]">Chụp đĩa cơm, hộp ăn trưa hoặc ly nước ép</span>
              </div>
            </div>

            {/* Privacy Selector for this item */}
            <div className="flex items-center space-x-1.5">
              <span className="text-[11px] font-semibold text-[#736357]">Ai xem được:</span>
              <select
                value={mealPrivacy}
                onChange={(e) => setMealPrivacy(e.target.value as PrivacyMode)}
                className="px-2.5 py-1 text-xs rounded-lg bg-white border border-[#E5DCCE] text-[#2C221E] font-medium focus:outline-none focus:border-amber-500"
              >
                <option value="PUBLIC">🌐 Công khai</option>
                <option value="FRIENDS_ONLY">👥 Bạn bè</option>
                <option value="PRIVATE">🔒 Chỉ mình tôi</option>
              </select>
            </div>
          </div>

          {/* Proof Preview or Camera Trigger */}
          {mealProof ? (
            <div className="flex items-center space-x-3 p-2.5 rounded-xl bg-white border border-amber-200">
              <img
                src={mealProof.imageUrl}
                alt="Meal Proof"
                className="w-16 h-16 rounded-lg object-cover border border-[#EFEAE2] shadow-sm"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold text-[#2C221E] truncate">{mealProof.caption}</span>
                  <span className="text-[10px] text-amber-700 bg-amber-100 px-2 py-0.5 rounded font-semibold">
                    {mealProof.privacyMode === 'PUBLIC'
                      ? '🌐 Công khai'
                      : mealProof.privacyMode === 'FRIENDS_ONLY'
                      ? '👥 Bạn bè'
                      : '🔒 Chỉ mình tôi'}
                  </span>
                </div>
                <div className="text-[11px] text-[#918072] mt-0.5">Chụp lúc {mealProof.timestamp}</div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => handleOpenCamForItem('meal', 'Bữa Ăn Dinh Dưỡng', '🥗', mealPrivacy)}
                  className="px-2.5 py-1.5 rounded-lg bg-[#FAF8F5] hover:bg-amber-100 text-amber-800 text-xs font-bold border border-[#EFEAE2] transition-colors"
                >
                  🔄 Chụp Lại
                </button>
                <button
                  type="button"
                  onClick={() => setMealProof(null)}
                  className="text-stone-400 hover:text-rose-600 p-1 text-xs"
                  title="Xóa minh chứng này"
                >
                  ✕
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => handleOpenCamForItem('meal', 'Bữa Ăn Dinh Dưỡng', '🥗', mealPrivacy)}
              className="w-full py-3 rounded-xl bg-white hover:bg-amber-100/60 border border-dashed border-amber-300 text-amber-800 text-xs font-bold flex items-center justify-center space-x-2 shadow-sm transition-all hover:scale-[1.01]"
            >
              <span className="text-base">📸</span>
              <span>Mở Camera Chụp Minh Chứng Bữa Ăn</span>
            </button>
          )}
        </div>
      </div>

      {/* ================= MỤC 2: DEEP WORK & TẬP TRUNG ================= */}
      <div className="p-6 rounded-3xl bg-white border border-[#EFEAE2] shadow-sm shadow-amber-950/5 space-y-5">
        <div className="flex items-center justify-between border-b border-[#FAF8F5] pb-3">
          <div className="flex items-center space-x-2.5">
            <span className="text-2xl">💻</span>
            <div>
              <h3 className="text-base font-black text-[#2C221E]">Mục 2: Deep Work & Tập Trung Cao Độ</h3>
              <p className="text-xs text-[#918072]">
                Thời gian làm việc / học tập không điện thoại (Tối thiểu 15 phút)
              </p>
            </div>
          </div>
          <span
            className={`text-xs font-bold px-2.5 py-1 rounded-full border ${
              isFocusEligible
                ? 'bg-amber-100 text-amber-900 border-amber-300'
                : 'bg-rose-100 text-rose-800 border-rose-200'
            }`}
          >
            {isFocusEligible ? 'Đạt >= 15p' : 'Chưa đủ 15p'}
          </span>
        </div>

        {/* 2.1 Focus Timer Circular Visual */}
        <div className="flex flex-col items-center justify-center py-4">
          <div className="relative w-44 h-44 flex items-center justify-center">
            <div
              className={`absolute inset-0 rounded-full blur-xl transition-all duration-700 ${
                isRunning ? 'bg-amber-400/25 animate-pulse' : 'bg-amber-400/10'
              }`}
            ></div>

            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="88"
                cy="88"
                r="76"
                stroke="currentColor"
                strokeWidth="8"
                className="text-[#F5F0E8]"
                fill="transparent"
              />
              <circle
                cx="88"
                cy="88"
                r="76"
                stroke="currentColor"
                strokeWidth="8"
                className="text-amber-500 transition-all duration-500"
                fill="transparent"
                strokeDasharray={2 * Math.PI * 76}
                strokeDashoffset={Math.max(0, 2 * Math.PI * 76 * (1 - Math.min(studyMinutes / 60, 1)))}
                strokeLinecap="round"
              />
            </svg>

            <div className="absolute flex flex-col items-center">
              <span className="text-3xl font-black tracking-tight text-[#2C221E]">
                {String(studyMinutes).padStart(2, '0')}:{String(remainingSeconds).padStart(2, '0')}
              </span>
              <span className="text-[11px] text-amber-800 font-bold uppercase tracking-wider mt-0.5">
                {studyMinutes} Phút Tập Trung
              </span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center space-x-2.5 mt-4">
            <button
              type="button"
              onClick={() => setIsRunning(!isRunning)}
              className={`px-6 py-2.5 rounded-2xl font-bold text-xs transition-all shadow-md ${
                isRunning
                  ? 'bg-amber-600 hover:bg-amber-700 text-white'
                  : 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-black shadow-amber-500/25 scale-105'
              }`}
            >
              {isRunning ? '⏸ Tạm Dừng' : '▶ Bắt Đầu Tập Trung'}
            </button>

            <button
              type="button"
              onClick={() => {
                setIsRunning(false);
                setStudySeconds(15 * 60);
              }}
              className="px-3.5 py-2.5 rounded-2xl bg-[#FAF8F5] hover:bg-[#EFEAE2] text-[#5D4F45] text-xs font-semibold border border-[#EFEAE2]"
            >
              Đặt Lại 15p
            </button>
          </div>

          {/* Quick presets */}
          <div className="flex items-center space-x-2 mt-3 text-xs text-[#918072]">
            <span>Cộng nhanh:</span>
            {[15, 30, 45].map((mins) => (
              <button
                key={mins}
                type="button"
                onClick={() => handleQuickAddMinutes(mins)}
                className="px-2.5 py-1 rounded-xl bg-[#FAF8F5] hover:bg-amber-100 text-amber-800 border border-[#EFEAE2] transition-colors font-medium text-xs"
              >
                +{mins}p
              </button>
            ))}
          </div>
        </div>

        {/* 2.2 Khu vực chụp minh chứng & chọn quyền riêng tư */}
        <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200/60 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center space-x-2">
              <span className="text-lg">📸</span>
              <div>
                <span className="text-xs font-black text-[#2C221E] block">Minh Chứng Không Gian Làm Việc</span>
                <span className="text-[11px] text-[#918072]">Chụp bàn làm việc, màn hình code, sách vở</span>
              </div>
            </div>

            <div className="flex items-center space-x-1.5">
              <span className="text-[11px] font-semibold text-[#736357]">Ai xem được:</span>
              <select
                value={focusPrivacy}
                onChange={(e) => setFocusPrivacy(e.target.value as PrivacyMode)}
                className="px-2.5 py-1 text-xs rounded-lg bg-white border border-[#E5DCCE] text-[#2C221E] font-medium focus:outline-none focus:border-amber-500"
              >
                <option value="PUBLIC">🌐 Công khai</option>
                <option value="FRIENDS_ONLY">👥 Bạn bè</option>
                <option value="PRIVATE">🔒 Chỉ mình tôi</option>
              </select>
            </div>
          </div>

          {focusProof ? (
            <div className="flex items-center space-x-3 p-2.5 rounded-xl bg-white border border-amber-200">
              <img
                src={focusProof.imageUrl}
                alt="Focus Proof"
                className="w-16 h-16 rounded-lg object-cover border border-[#EFEAE2] shadow-sm"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold text-[#2C221E] truncate">{focusProof.caption}</span>
                  <span className="text-[10px] text-amber-700 bg-amber-100 px-2 py-0.5 rounded font-semibold">
                    {focusProof.privacyMode === 'PUBLIC'
                      ? '🌐 Công khai'
                      : focusProof.privacyMode === 'FRIENDS_ONLY'
                      ? '👥 Bạn bè'
                      : '🔒 Chỉ mình tôi'}
                  </span>
                </div>
                <div className="text-[11px] text-[#918072] mt-0.5">Chụp lúc {focusProof.timestamp}</div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => handleOpenCamForItem('focus', 'Không Gian Deep Work', '💻', focusPrivacy)}
                  className="px-2.5 py-1.5 rounded-lg bg-[#FAF8F5] hover:bg-amber-100 text-amber-800 text-xs font-bold border border-[#EFEAE2] transition-colors"
                >
                  🔄 Chụp Lại
                </button>
                <button
                  type="button"
                  onClick={() => setFocusProof(null)}
                  className="text-stone-400 hover:text-rose-600 p-1 text-xs"
                >
                  ✕
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => handleOpenCamForItem('focus', 'Không Gian Deep Work', '💻', focusPrivacy)}
              className="w-full py-3 rounded-xl bg-white hover:bg-amber-100/60 border border-dashed border-amber-300 text-amber-800 text-xs font-bold flex items-center justify-center space-x-2 shadow-sm transition-all hover:scale-[1.01]"
            >
              <span className="text-base">📸</span>
              <span>Mở Camera Chụp Minh Chứng Deep Work</span>
            </button>
          )}
        </div>
      </div>

      {/* ================= MỤC 3: LỐI SỐNG LÀNH MẠNH & KHỞI ĐỘNG ================= */}
      <div className="p-6 rounded-3xl bg-white border border-[#EFEAE2] shadow-sm shadow-amber-950/5 space-y-5">
        <div className="flex items-center justify-between border-b border-[#FAF8F5] pb-3">
          <div className="flex items-center space-x-2.5">
            <span className="text-2xl">🌅</span>
            <div>
              <h3 className="text-base font-black text-[#2C221E]">Mục 3: Thói Quen Sáng & Năng Lượng Lành Mạnh</h3>
              <p className="text-xs text-[#918072]">Dậy sớm khởi động, uống nước đầy đủ và vận động nhẹ</p>
            </div>
          </div>
          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
            {wellnessProof ? '✅ Đã có minh chứng' : 'Chưa có ảnh'}
          </span>
        </div>

        {/* 3.1 Checkboxes for healthy morning habits */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            type="button"
            onClick={() => setWokeUpEarly(!wokeUpEarly)}
            className={`p-3.5 rounded-2xl border text-left flex items-center justify-between transition-all ${
              wokeUpEarly
                ? 'bg-amber-50/80 border-amber-400 shadow-sm'
                : 'bg-[#FAF8F5] border-[#EFEAE2] text-[#736357]'
            }`}
          >
            <div>
              <span className="text-base">⏰</span>
              <div className="text-xs font-bold text-[#2C221E] mt-1">Dậy Sớm Trước 6:30</div>
              <div className="text-[10px] text-[#918072]">Không nằm bấm điện thoại</div>
            </div>
            <span className="text-lg">{wokeUpEarly ? '✅' : '⚪'}</span>
          </button>

          <button
            type="button"
            onClick={() => setDrankWater(!drankWater)}
            className={`p-3.5 rounded-2xl border text-left flex items-center justify-between transition-all ${
              drankWater
                ? 'bg-amber-50/80 border-amber-400 shadow-sm'
                : 'bg-[#FAF8F5] border-[#EFEAE2] text-[#736357]'
            }`}
          >
            <div>
              <span className="text-base">💧</span>
              <div className="text-xs font-bold text-[#2C221E] mt-1">Uống Đủ 2L Nước</div>
              <div className="text-[10px] text-[#918072]">Thanh lọc & giữ tỉnh táo</div>
            </div>
            <span className="text-lg">{drankWater ? '✅' : '⚪'}</span>
          </button>

          <button
            type="button"
            onClick={() => setDidExercise(!didExercise)}
            className={`p-3.5 rounded-2xl border text-left flex items-center justify-between transition-all ${
              didExercise
                ? 'bg-amber-50/80 border-amber-400 shadow-sm'
                : 'bg-[#FAF8F5] border-[#EFEAE2] text-[#736357]'
            }`}
          >
            <div>
              <span className="text-base">🏃‍♂️</span>
              <div className="text-xs font-bold text-[#2C221E] mt-1">Vận Động 20 Phút</div>
              <div className="text-[10px] text-[#918072]">Chạy bộ, gym hoặc stretch</div>
            </div>
            <span className="text-lg">{didExercise ? '✅' : '⚪'}</span>
          </button>
        </div>

        {/* 3.2 Khu vực chụp minh chứng & chọn quyền riêng tư */}
        <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200/60 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center space-x-2">
              <span className="text-lg">📸</span>
              <div>
                <span className="text-xs font-black text-[#2C221E] block">Minh Chứng Lối Sống Lành Mạnh</span>
                <span className="text-[11px] text-[#918072]">Chụp bình nước, đôi giày chạy bộ, bình minh</span>
              </div>
            </div>

            <div className="flex items-center space-x-1.5">
              <span className="text-[11px] font-semibold text-[#736357]">Ai xem được:</span>
              <select
                value={wellnessPrivacy}
                onChange={(e) => setWellnessPrivacy(e.target.value as PrivacyMode)}
                className="px-2.5 py-1 text-xs rounded-lg bg-white border border-[#E5DCCE] text-[#2C221E] font-medium focus:outline-none focus:border-amber-500"
              >
                <option value="PUBLIC">🌐 Công khai</option>
                <option value="FRIENDS_ONLY">👥 Bạn bè</option>
                <option value="PRIVATE">🔒 Chỉ mình tôi</option>
              </select>
            </div>
          </div>

          {wellnessProof ? (
            <div className="flex items-center space-x-3 p-2.5 rounded-xl bg-white border border-amber-200">
              <img
                src={wellnessProof.imageUrl}
                alt="Wellness Proof"
                className="w-16 h-16 rounded-lg object-cover border border-[#EFEAE2] shadow-sm"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold text-[#2C221E] truncate">{wellnessProof.caption}</span>
                  <span className="text-[10px] text-amber-700 bg-amber-100 px-2 py-0.5 rounded font-semibold">
                    {wellnessProof.privacyMode === 'PUBLIC'
                      ? '🌐 Công khai'
                      : wellnessProof.privacyMode === 'FRIENDS_ONLY'
                      ? '👥 Bạn bè'
                      : '🔒 Chỉ mình tôi'}
                  </span>
                </div>
                <div className="text-[11px] text-[#918072] mt-0.5">Chụp lúc {wellnessProof.timestamp}</div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => handleOpenCamForItem('wellness', 'Lối Sống Lành Mạnh', '🌅', wellnessPrivacy)}
                  className="px-2.5 py-1.5 rounded-lg bg-[#FAF8F5] hover:bg-amber-100 text-amber-800 text-xs font-bold border border-[#EFEAE2] transition-colors"
                >
                  🔄 Chụp Lại
                </button>
                <button
                  type="button"
                  onClick={() => setWellnessProof(null)}
                  className="text-stone-400 hover:text-rose-600 p-1 text-xs"
                >
                  ✕
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => handleOpenCamForItem('wellness', 'Lối Sống Lành Mạnh', '🌅', wellnessPrivacy)}
              className="w-full py-3 rounded-xl bg-white hover:bg-amber-100/60 border border-dashed border-amber-300 text-amber-800 text-xs font-bold flex items-center justify-center space-x-2 shadow-sm transition-all hover:scale-[1.01]"
            >
              <span className="text-base">📸</span>
              <span>Mở Camera Chụp Minh Chứng Lối Sống</span>
            </button>
          )}
        </div>
      </div>

      {/* ================= MỤC 4: NHẬT KÝ & PHẢN TƯ ================= */}
      <div className="p-6 rounded-3xl bg-white border border-[#EFEAE2] shadow-sm shadow-amber-950/5 space-y-5">
        <div className="flex items-center justify-between border-b border-[#FAF8F5] pb-3">
          <div className="flex items-center space-x-2.5">
            <span className="text-2xl">📝</span>
            <div>
              <h3 className="text-base font-black text-[#2C221E]">Mục 4: Nhật Ký & Ghi Chú Phản Tư</h3>
              <p className="text-xs text-[#918072]">Tự nhủ, đúc kết kinh nghiệm và cảm nhận về ngày hôm nay</p>
            </div>
          </div>
          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
            {reflectionProof ? '✅ Đã có minh chứng' : 'Chưa có ảnh'}
          </span>
        </div>

        {/* 4.1 Note Textarea */}
        <div>
          <textarea
            rows={3}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Hôm nay bạn đã vượt qua sự trì hoãn như thế nào? Mục tiêu quan trọng nhất bạn đã hoàn thành..."
            className="w-full p-4 rounded-2xl bg-[#FAF8F5] border border-[#E5DCCE] text-[#2C221E] placeholder-[#918072]/60 focus:outline-none focus:bg-white focus:border-amber-500 transition-colors text-xs sm:text-sm resize-none"
          ></textarea>
        </div>

        {/* 4.2 Khu vực chụp minh chứng sổ tay / quote */}
        <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200/60 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center space-x-2">
              <span className="text-lg">📸</span>
              <div>
                <span className="text-xs font-black text-[#2C221E] block">Minh Chứng Sổ Tay / Kế Hoạch Viết Tay</span>
                <span className="text-[11px] text-[#918072]">Chụp trang sổ ghi chép, checklist hoặc to-do list</span>
              </div>
            </div>

            <div className="flex items-center space-x-1.5">
              <span className="text-[11px] font-semibold text-[#736357]">Ai xem được:</span>
              <select
                value={reflectionPrivacy}
                onChange={(e) => setReflectionPrivacy(e.target.value as PrivacyMode)}
                className="px-2.5 py-1 text-xs rounded-lg bg-white border border-[#E5DCCE] text-[#2C221E] font-medium focus:outline-none focus:border-amber-500"
              >
                <option value="PRIVATE">🔒 Chỉ mình tôi</option>
                <option value="FRIENDS_ONLY">👥 Bạn bè</option>
                <option value="PUBLIC">🌐 Công khai</option>
              </select>
            </div>
          </div>

          {reflectionProof ? (
            <div className="flex items-center space-x-3 p-2.5 rounded-xl bg-white border border-amber-200">
              <img
                src={reflectionProof.imageUrl}
                alt="Reflection Proof"
                className="w-16 h-16 rounded-lg object-cover border border-[#EFEAE2] shadow-sm"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold text-[#2C221E] truncate">{reflectionProof.caption}</span>
                  <span className="text-[10px] text-amber-700 bg-amber-100 px-2 py-0.5 rounded font-semibold">
                    {reflectionProof.privacyMode === 'PUBLIC'
                      ? '🌐 Công khai'
                      : reflectionProof.privacyMode === 'FRIENDS_ONLY'
                      ? '👥 Bạn bè'
                      : '🔒 Chỉ mình tôi'}
                  </span>
                </div>
                <div className="text-[11px] text-[#918072] mt-0.5">Chụp lúc {reflectionProof.timestamp}</div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => handleOpenCamForItem('reflection', 'Sổ Tay & Phản Tư', '📝', reflectionPrivacy)}
                  className="px-2.5 py-1.5 rounded-lg bg-[#FAF8F5] hover:bg-amber-100 text-amber-800 text-xs font-bold border border-[#EFEAE2] transition-colors"
                >
                  🔄 Chụp Lại
                </button>
                <button
                  type="button"
                  onClick={() => setReflectionProof(null)}
                  className="text-stone-400 hover:text-rose-600 p-1 text-xs"
                >
                  ✕
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => handleOpenCamForItem('reflection', 'Sổ Tay & Phản Tư', '📝', reflectionPrivacy)}
              className="w-full py-3 rounded-xl bg-white hover:bg-amber-100/60 border border-dashed border-amber-300 text-amber-800 text-xs font-bold flex items-center justify-center space-x-2 shadow-sm transition-all hover:scale-[1.01]"
            >
              <span className="text-base">📸</span>
              <span>Mở Camera Chụp Minh Chứng Sổ Tay</span>
            </button>
          )}
        </div>
      </div>

      {/* ================= NÚT HOÀN TẤT TOÀN DIỆN ================= */}
      <button
        type="button"
        onClick={handleSaveCheckIn}
        className="w-full py-4 rounded-3xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 hover:brightness-105 text-white font-black text-base tracking-wide shadow-xl shadow-amber-500/25 transition-all duration-200 active:scale-[0.99] flex items-center justify-center space-x-2"
      >
        <span>🔥</span>
        <span>HOÀN TẤT & LƯU TỔNG THỂ CHECK-IN HÔM NAY ({proofCount} MINH CHỨNG)</span>
      </button>

      {/* ================= CAMERA MODAL ================= */}
      {activeCameraItem && (
        <CameraModal
          isOpen={!!activeCameraItem}
          itemTitle={activeCameraItem.title}
          itemIcon={activeCameraItem.icon}
          initialPrivacy={activeCameraItem.privacy}
          onClose={() => setActiveCameraItem(null)}
          onPublish={handleProofPublished}
        />
      )}
    </div>
  );
};
