import React, { useState, useEffect } from 'react';
import { MealStatus } from '../../types';

interface CheckInViewProps {
  onCheckInSuccess?: (data: any) => void;
}

export const CheckInView: React.FC<CheckInViewProps> = ({ onCheckInSuccess }) => {
  // State: Meal Status
  const [mealStatus, setMealStatus] = useState<MealStatus>('ON_TIME');
  // State: Had Snacks
  const [hadSnacks, setHadSnacks] = useState<boolean>(false);
  // State: Note
  const [note, setNote] = useState<string>('');

  // State: Study Focus Timer (tối thiểu 15 phút = 900 giây)
  const MIN_STUDY_SECONDS = 15 * 60; // 900s
  const [studySeconds, setStudySeconds] = useState<number>(15 * 60);
  const [isRunning, setIsRunning] = useState<boolean>(false);

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
  const isEligible = studyMinutes >= 15;

  const mealOptions: { id: MealStatus; label: string; icon: string; desc: string }[] = [
    { id: 'ON_TIME', label: 'Đúng Giờ', icon: '🍲', desc: 'Ăn no & đúng cữ' },
    { id: 'LATE', label: 'Ăn Trễ', icon: '⏳', desc: 'Lệch cữ sinh hoạt' },
    { id: 'SKIPPED', label: 'Bỏ Bữa', icon: '⚠️', desc: 'Bận rộn / Quên ăn' },
  ];

  const handleQuickAddMinutes = (mins: number) => {
    setStudySeconds((prev) => prev + mins * 60);
  };

  const handleSaveCheckIn = () => {
    if (!isEligible) {
      alert('Kỷ luật AuraDay yêu cầu thời gian tập trung tối thiểu từ 15 phút trở lên!');
      return;
    }

    const payload = {
      logDate: new Date().toISOString().split('T')[0],
      ateOnTime: mealStatus,
      hadSnacks: hadSnacks,
      studyMinutes: studyMinutes,
      note: note
    };

    if (onCheckInSuccess) {
      onCheckInSuccess(payload);
    } else {
      alert(`Đã lưu check-in kỷ luật thành công! (${studyMinutes} phút tập trung)`);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-black text-[#2C221E] tracking-tight">Check-in Kỷ Luật Hôm Nay</h2>
        <p className="text-sm text-[#736357]">Theo dõi dinh dưỡng, chống ăn vặt và thời gian tập trung học tập</p>
      </div>

      {/* 1. Ăn Uống Đúng Giờ */}
      <div className="p-6 rounded-3xl bg-white border border-[#EFEAE2] shadow-sm shadow-amber-950/5">
        <label className="text-xs font-bold text-amber-800 uppercase tracking-wider block mb-3">
          1. Trạng Thái Dinh Dưỡng Bữa Chính
        </label>
        <div className="grid grid-cols-3 gap-3">
          {mealOptions.map((opt) => {
            const isSelected = mealStatus === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => setMealStatus(opt.id)}
                className={`flex flex-col items-center p-4 rounded-2xl border transition-all duration-200 text-center ${
                  isSelected
                    ? 'bg-gradient-to-b from-[#FFF5EB] to-[#FEF3C7]/40 border-amber-400 text-amber-950 shadow-md shadow-amber-500/10 scale-[1.02]'
                    : 'bg-[#FAF8F5] border-[#EFEAE2] hover:border-amber-300 hover:bg-white text-[#5D4F45]'
                }`}
              >
                <span className="text-3xl mb-2">{opt.icon}</span>
                <span className={`text-sm font-bold ${isSelected ? 'text-amber-900' : 'text-[#2C221E]'}`}>
                  {opt.label}
                </span>
                <span className="text-[11px] text-[#918072] mt-1">{opt.desc}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Thói Quen Ăn Vặt */}
      <div className="p-6 rounded-3xl bg-white border border-[#EFEAE2] shadow-sm shadow-amber-950/5 flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xl">🧋</span>
            <span className="text-sm font-bold text-[#2C221E]">Hôm nay bạn có ăn vặt khuya không?</span>
          </div>
          <p className="text-xs text-[#918072] mt-1">Tránh trà sữa, bánh ngọt khuya để duy trì tinh thần tỉnh táo</p>
        </div>

        <button
          type="button"
          onClick={() => setHadSnacks(!hadSnacks)}
          className={`px-5 py-2.5 rounded-2xl font-bold text-xs uppercase tracking-wider transition-all duration-200 border ${
            hadSnacks
              ? 'bg-rose-50 border-rose-200 text-rose-700 shadow-sm'
              : 'bg-emerald-50 border-emerald-200 text-emerald-800 shadow-sm'
          }`}
        >
          {hadSnacks ? '❌ Có Ăn Vặt' : '✅ Không Ăn Vặt'}
        </button>
      </div>

      {/* 3. Focus Study Timer (>= 15 phút) */}
      <div className="p-6 rounded-3xl bg-white border border-[#EFEAE2] shadow-sm shadow-amber-950/5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <label className="text-xs font-bold text-amber-800 uppercase tracking-wider block">
              2. Đồng Hồ Tập Trung (Deep Work & Focus Timer)
            </label>
            <span className="text-xs text-[#918072]">Tối thiểu 15 phút để được ghi nhận vào nhật ký</span>
          </div>

          <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
            isEligible
              ? 'bg-amber-100 text-amber-900 border-amber-300'
              : 'bg-rose-100 text-rose-800 border-rose-200'
          }`}>
            {isEligible ? 'Đạt chuẩn >= 15p' : 'Chưa đủ 15p'}
          </span>
        </div>

        {/* Circular Timer Display */}
        <div className="flex flex-col items-center justify-center py-6">
          <div className="relative w-52 h-52 flex items-center justify-center">
            {/* Ambient Background Glow */}
            <div className={`absolute inset-0 rounded-full blur-2xl transition-all duration-700 ${
              isRunning ? 'bg-amber-400/25 animate-pulse' : 'bg-amber-400/10'
            }`}></div>

            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="104"
                cy="104"
                r="90"
                stroke="currentColor"
                strokeWidth="10"
                className="text-[#F5F0E8]"
                fill="transparent"
              />
              <circle
                cx="104"
                cy="104"
                r="90"
                stroke="currentColor"
                strokeWidth="10"
                className="text-amber-500 transition-all duration-500"
                fill="transparent"
                strokeDasharray={2 * Math.PI * 90}
                strokeDashoffset={Math.max(0, 2 * Math.PI * 90 * (1 - Math.min(studyMinutes / 60, 1)))}
                strokeLinecap="round"
              />
            </svg>

            {/* Time Counter */}
            <div className="absolute flex flex-col items-center">
              <span className="text-4xl font-black tracking-tight text-[#2C221E]">
                {String(studyMinutes).padStart(2, '0')}:{String(remainingSeconds).padStart(2, '0')}
              </span>
              <span className="text-xs text-amber-800 font-bold uppercase tracking-widest mt-1">
                {studyMinutes} Phút Tập Trung
              </span>
            </div>
          </div>

          {/* Timer Controls */}
          <div className="flex items-center space-x-3 mt-6">
            <button
              type="button"
              onClick={() => setIsRunning(!isRunning)}
              className={`px-8 py-3.5 rounded-2xl font-bold text-sm transition-all duration-200 shadow-md ${
                isRunning
                  ? 'bg-amber-650 bg-amber-600 hover:bg-amber-700 text-white'
                  : 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-black shadow-amber-500/25 scale-105'
              }`}
            >
              {isRunning ? '⏸ Tạm Dừng' : '▶ Bắt Đầu Tập Trung'}
            </button>

            <button
              type="button"
              onClick={() => { setIsRunning(false); setStudySeconds(15 * 60); }}
              className="px-4 py-3.5 rounded-2xl bg-[#F5F0E8] hover:bg-[#EFEAE2] text-[#5D4F45] hover:text-[#2C221E] text-xs font-semibold border border-[#EFEAE2]"
            >
              Đặt Lại 15p
            </button>
          </div>

          {/* Quick presets */}
          <div className="flex items-center space-x-2 mt-4 text-xs text-[#918072]">
            <span>Cộng nhanh:</span>
            {[15, 30, 45].map((mins) => (
              <button
                key={mins}
                type="button"
                onClick={() => handleQuickAddMinutes(mins)}
                className="px-2.5 py-1 rounded-xl bg-[#FAF8F5] hover:bg-amber-100/70 text-amber-800 border border-[#EFEAE2] transition-colors font-medium"
              >
                +{mins}p
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 4. Ghi Chú & Cảm Xúc */}
      <div className="p-6 rounded-3xl bg-white border border-[#EFEAE2] shadow-sm shadow-amber-950/5">
        <label className="text-xs font-bold text-amber-800 uppercase tracking-wider block mb-2">
          3. Nhật Ký & Ghi Chú Kỷ Luật
        </label>
        <textarea
          rows={3}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Hôm nay bạn đã vượt qua sự trì hoãn như thế nào? Cảm xúc sau khi hoàn thành mục tiêu..."
          className="w-full p-4 rounded-2xl bg-[#FAF8F5] border border-[#E5DCCE] text-[#2C221E] placeholder-[#918072]/60 focus:outline-none focus:bg-white focus:border-amber-500 transition-colors text-sm resize-none"
        ></textarea>
      </div>

      {/* Nút Hoàn Tất Check-in */}
      <button
        type="button"
        onClick={handleSaveCheckIn}
        className="w-full py-4 rounded-3xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 hover:brightness-105 text-white font-black text-base tracking-wide shadow-xl shadow-amber-500/25 transition-all duration-200 active:scale-[0.99]"
      >
        LƯU CHECK-IN HÔM NAY 🔥
      </button>
    </div>
  );
};
