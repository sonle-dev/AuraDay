import React, { useState, useEffect } from 'react';
import { MealStatus, PrivacyMode } from '../../types';
import { CameraModal } from './CameraModal';

export interface CheckInItemProof {
  imageUrl: string;
  privacyMode: PrivacyMode;
  caption: string;
  timestamp: string;
}

export interface HabitItem {
  id: string;
  title: string;
  icon: string;
  isCompleted: boolean;
  proof: CheckInItemProof | null;
  privacyMode: PrivacyMode;
}

export interface MealCheckInItem {
  id: 'breakfast' | 'lunch' | 'dinner';
  name: string;
  icon: string;
  timeHint: string;
  status: MealStatus;
  proof: CheckInItemProof | null;
  privacyMode: PrivacyMode;
}

interface CheckInViewProps {
  onCheckInSuccess?: (data: any) => void;
}

export const CheckInView: React.FC<CheckInViewProps> = ({ onCheckInSuccess }) => {
  // ================= 1. NUTRITION & SEPARATE MEALS =================
  const [meals, setMeals] = useState<MealCheckInItem[]>([
    {
      id: 'breakfast',
      name: 'Bữa Sáng',
      icon: '🌅',
      timeHint: '6:30 - 8:30',
      status: 'ON_TIME',
      proof: null,
      privacyMode: 'PUBLIC',
    },
    {
      id: 'lunch',
      name: 'Bữa Trưa',
      icon: '☀️',
      timeHint: '11:30 - 13:00',
      status: 'ON_TIME',
      proof: null,
      privacyMode: 'FRIENDS_ONLY',
    },
    {
      id: 'dinner',
      name: 'Bữa Tối',
      icon: '🌙',
      timeHint: '18:00 - 20:00',
      status: 'ON_TIME',
      proof: null,
      privacyMode: 'FRIENDS_ONLY',
    },
  ]);

  // Snack habit
  const [hadSnacks, setHadSnacks] = useState<boolean>(false);
  const [snackNote, setSnackNote] = useState<string>('');
  const [snackProof, setSnackProof] = useState<CheckInItemProof | null>(null);
  const [snackPrivacy, setSnackPrivacy] = useState<PrivacyMode>('FRIENDS_ONLY');

  // ================= 2. STUDY / DEEP WORK =================
  const [studyMinutes, setStudyMinutes] = useState<number>(60); // Nhập số phút trực tiếp
  const [isTimerMode, setIsTimerMode] = useState<boolean>(false);
  const [timerSeconds, setTimerSeconds] = useState<number>(60 * 60);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const [focusPrivacy, setFocusPrivacy] = useState<PrivacyMode>('PUBLIC');
  const [focusProof, setFocusProof] = useState<CheckInItemProof | null>(null);

  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning && isTimerMode) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => {
          const next = prev + 1;
          setStudyMinutes(Math.floor(next / 60));
          return next;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning, isTimerMode]);

  // ================= 3. CUSTOMIZABLE HABITS (CÓ THỂ THÊM/SỬA/XÓA & ẢNH RIÊNG) =================
  const [habits, setHabits] = useState<HabitItem[]>([
    {
      id: 'h1',
      title: 'Dậy sớm trước 6:30',
      icon: '⏰',
      isCompleted: true,
      proof: null,
      privacyMode: 'PUBLIC',
    },
    {
      id: 'h2',
      title: 'Uống đủ 2L nước lọc',
      icon: '💧',
      isCompleted: true,
      proof: null,
      privacyMode: 'PUBLIC',
    },
    {
      id: 'h3',
      title: 'Vận động / Thể thao 20 phút',
      icon: '🏃‍♂️',
      isCompleted: false,
      proof: null,
      privacyMode: 'FRIENDS_ONLY',
    },
    {
      id: 'h4',
      title: 'Đọc sách & Phát triển bản thân',
      icon: '📖',
      isCompleted: false,
      proof: null,
      privacyMode: 'PRIVATE',
    },
  ]);

  // Adding/Editing Habit state
  const [isAddingHabit, setIsAddingHabit] = useState<boolean>(false);
  const [newHabitTitle, setNewHabitTitle] = useState<string>('');
  const [newHabitIcon, setNewHabitIcon] = useState<string>('✨');
  const [editingHabitId, setEditingHabitId] = useState<string | null>(null);
  const [editingHabitTitle, setEditingHabitTitle] = useState<string>('');

  // ================= 4. JOURNAL / REFLECTION =================
  const [note, setNote] = useState<string>('');
  const [reflectionPrivacy, setReflectionPrivacy] = useState<PrivacyMode>('PRIVATE');
  const [reflectionProof, setReflectionProof] = useState<CheckInItemProof | null>(null);

  // ================= CAMERA MODAL STATE =================
  const [activeCamTarget, setActiveCamTarget] = useState<{
    targetType: 'meal' | 'snack' | 'focus' | 'habit' | 'reflection';
    targetId?: string;
    title: string;
    icon: string;
    privacy: PrivacyMode;
  } | null>(null);

  // Helper meal options
  const mealStatusOptions: { id: MealStatus; label: string; icon: string }[] = [
    { id: 'ON_TIME', label: 'Đúng Giờ', icon: '🍲' },
    { id: 'LATE', label: 'Ăn Trễ', icon: '⏳' },
    { id: 'SKIPPED', label: 'Bỏ Bữa', icon: '⚠️' },
  ];

  // Update meal status
  const handleMealStatusChange = (mealId: 'breakfast' | 'lunch' | 'dinner', status: MealStatus) => {
    setMeals((prev) => prev.map((m) => (m.id === mealId ? { ...m, status } : m)));
  };

  // Update meal privacy
  const handleMealPrivacyChange = (mealId: 'breakfast' | 'lunch' | 'dinner', privacy: PrivacyMode) => {
    setMeals((prev) => prev.map((m) => (m.id === mealId ? { ...m, privacyMode: privacy } : m)));
  };

  // Open camera for meal
  const handleOpenMealCam = (meal: MealCheckInItem) => {
    setActiveCamTarget({
      targetType: 'meal',
      targetId: meal.id,
      title: `Minh Chứng ${meal.name}`,
      icon: meal.icon,
      privacy: meal.privacyMode,
    });
  };

  // Open camera for habit
  const handleOpenHabitCam = (habit: HabitItem) => {
    setActiveCamTarget({
      targetType: 'habit',
      targetId: habit.id,
      title: `Minh Chứng: ${habit.title}`,
      icon: habit.icon,
      privacy: habit.privacyMode,
    });
  };

  // Habit management functions
  const handleToggleHabit = (id: string) => {
    setHabits((prev) =>
      prev.map((h) => (h.id === id ? { ...h, isCompleted: !h.isCompleted } : h))
    );
  };

  const handleHabitPrivacyChange = (id: string, privacy: PrivacyMode) => {
    setHabits((prev) =>
      prev.map((h) => (h.id === id ? { ...h, privacyMode: privacy } : h))
    );
  };

  const handleCreateHabit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHabitTitle.trim()) return;

    const newHabit: HabitItem = {
      id: `h_${Date.now()}`,
      title: newHabitTitle.trim(),
      icon: newHabitIcon || '✨',
      isCompleted: false,
      proof: null,
      privacyMode: 'PUBLIC',
    };

    setHabits((prev) => [...prev, newHabit]);
    setNewHabitTitle('');
    setIsAddingHabit(false);
  };

  const handleStartEditHabit = (habit: HabitItem) => {
    setEditingHabitId(habit.id);
    setEditingHabitTitle(habit.title);
  };

  const handleSaveEditHabit = (id: string) => {
    if (!editingHabitTitle.trim()) return;
    setHabits((prev) =>
      prev.map((h) => (h.id === id ? { ...h, title: editingHabitTitle.trim() } : h))
    );
    setEditingHabitId(null);
  };

  const handleDeleteHabit = (id: string) => {
    if (confirm('Bạn có chắc muốn xóa thói quen này khỏi danh sách check-in?')) {
      setHabits((prev) => prev.filter((h) => h.id !== id));
    }
  };

  // Handle camera modal publish
  const handleProofPublished = (result: { imageUrl: string; privacyMode: PrivacyMode; caption: string }) => {
    if (!activeCamTarget) return;

    const proofData: CheckInItemProof = {
      imageUrl: result.imageUrl,
      privacyMode: result.privacyMode,
      caption: result.caption,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    if (activeCamTarget.targetType === 'meal' && activeCamTarget.targetId) {
      setMeals((prev) =>
        prev.map((m) =>
          m.id === activeCamTarget.targetId
            ? { ...m, proof: proofData, privacyMode: result.privacyMode }
            : m
        )
      );
    } else if (activeCamTarget.targetType === 'snack') {
      setSnackProof(proofData);
      setSnackPrivacy(result.privacyMode);
    } else if (activeCamTarget.targetType === 'focus') {
      setFocusProof(proofData);
      setFocusPrivacy(result.privacyMode);
    } else if (activeCamTarget.targetType === 'habit' && activeCamTarget.targetId) {
      setHabits((prev) =>
        prev.map((h) =>
          h.id === activeCamTarget.targetId
            ? { ...h, proof: proofData, privacyMode: result.privacyMode, isCompleted: true }
            : h
        )
      );
    } else if (activeCamTarget.targetType === 'reflection') {
      setReflectionProof(proofData);
      setReflectionPrivacy(result.privacyMode);
    }

    setActiveCamTarget(null);
  };

  // Collect all proofs
  const allCollectedProofs = [
    ...meals.filter((m) => m.proof).map((m) => ({ type: `MEAL_${m.id.toUpperCase()}`, ...m.proof })),
    snackProof && { type: 'SNACK', ...snackProof },
    focusProof && { type: 'FOCUS_WORK', ...focusProof },
    ...habits.filter((h) => h.proof).map((h) => ({ type: `HABIT_${h.title}`, ...h.proof })),
    reflectionProof && { type: 'REFLECTION', ...reflectionProof },
  ].filter(Boolean);

  const isFocusEligible = studyMinutes >= 15;

  // Submit check-in
  const handleSaveCheckIn = () => {
    if (!isFocusEligible) {
      alert('Kỷ luật AuraDay yêu cầu thời gian học tập / làm việc tối thiểu từ 15 phút trở lên!');
      return;
    }

    const payload = {
      logDate: new Date().toISOString().split('T')[0],
      meals: meals.map((m) => ({ id: m.id, status: m.status })),
      hadSnacks: hadSnacks,
      studyMinutes: studyMinutes,
      habitsCompleted: habits.filter((h) => h.isCompleted).map((h) => h.title),
      note: note,
      proofs: allCollectedProofs,
    };

    if (onCheckInSuccess) {
      onCheckInSuccess(payload);
    } else {
      alert(
        `🎉 Đã lưu check-in hôm nay thành công!\n- ${studyMinutes} phút tập trung.\n- ${allCollectedProofs.length} ảnh minh chứng đã sẵn sàng trong Locker.`
      );
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* ================= HEADER SUMMARY ================= */}
      <div className="p-6 rounded-3xl bg-white border border-[#EFEAE2] shadow-sm shadow-amber-950/5 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl font-black text-[#2C221E] tracking-tight">Check-in Kỷ Luật Hôm Nay</h2>
            <p className="text-xs text-[#736357] mt-0.5">
              Tách riêng từng bữa ăn, nhập thời gian học tập & tùy chỉnh thói quen với ảnh minh chứng độc lập.
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <span className="px-3 py-1.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 font-bold text-xs flex items-center space-x-1">
              <span>📸</span>
              <span>{allCollectedProofs.length} Minh Chứng</span>
            </span>
            <span className="px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300 font-bold text-xs flex items-center space-x-1">
              <span>🎯</span>
              <span>{habits.filter((h) => h.isCompleted).length}/{habits.length} Thói Quen</span>
            </span>
          </div>
        </div>
      </div>

      {/* ================= PHẦN 1: DINH DƯỠNG & ĂN UỐNG LÀNH MẠNH (TÁCH SÁNG, TRƯA, TỐI, ĂN VẶT) ================= */}
      <div className="p-6 rounded-3xl bg-white border border-[#EFEAE2] shadow-sm shadow-amber-950/5 space-y-5">
        <div className="flex items-center space-x-2.5 border-b border-[#FAF8F5] pb-3">
          <span className="text-2xl">🥗</span>
          <div>
            <h3 className="text-base font-black text-[#2C221E]">
              1. Dinh Dưỡng: Bữa Sáng, Bữa Trưa, Bữa Tối & Ăn Vặt
            </h3>
            <p className="text-xs text-[#918072]">
              Tùy chỉnh trạng thái, minh chứng chụp camera và đối tượng xem riêng cho từng bữa ăn
            </p>
          </div>
        </div>

        {/* 3 Bữa Chính */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {meals.map((meal) => (
            <div
              key={meal.id}
              className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#EFEAE2] flex flex-col justify-between space-y-3.5 hover:border-amber-300 transition-all"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-2xl">{meal.icon}</span>
                  <div>
                    <h4 className="text-sm font-black text-[#2C221E]">{meal.name}</h4>
                    <span className="text-[10px] text-[#918072] font-semibold">{meal.timeHint}</span>
                  </div>
                </div>

                {/* Privacy Mode Selector */}
                <select
                  value={meal.privacyMode}
                  onChange={(e) => handleMealPrivacyChange(meal.id, e.target.value as PrivacyMode)}
                  className="text-[11px] px-2 py-1 rounded-lg bg-white border border-[#E5DCCE] text-[#2C221E] focus:outline-none focus:border-amber-500"
                >
                  <option value="PUBLIC">🌐 Công khai</option>
                  <option value="FRIENDS_ONLY">👥 Bạn bè</option>
                  <option value="PRIVATE">🔒 Chỉ tôi</option>
                </select>
              </div>

              {/* Status Buttons */}
              <div className="grid grid-cols-3 gap-1.5">
                {mealStatusOptions.map((opt) => {
                  const isSelected = meal.status === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => handleMealStatusChange(meal.id, opt.id)}
                      className={`py-2 px-1 rounded-xl text-[11px] font-bold transition-all text-center border ${
                        isSelected
                          ? 'bg-amber-500 text-white border-amber-500 shadow-sm shadow-amber-500/20'
                          : 'bg-white text-[#5D4F45] border-[#EFEAE2] hover:bg-amber-50'
                      }`}
                    >
                      <div className="text-sm mb-0.5">{opt.icon}</div>
                      <div>{opt.label}</div>
                    </button>
                  );
                })}
              </div>

              {/* Meal Proof Area */}
              <div className="pt-1">
                {meal.proof ? (
                  <div className="relative rounded-xl overflow-hidden border border-amber-200 bg-white p-2 flex items-center space-x-2.5">
                    <img
                      src={meal.proof.imageUrl}
                      alt={meal.name}
                      className="w-12 h-12 rounded-lg object-cover border border-[#EFEAE2]"
                    />
                    <div className="flex-1 min-w-0">
                      <span className="text-[11px] font-bold text-[#2C221E] truncate block">
                        Đã có minh chứng
                      </span>
                      <span className="text-[10px] text-[#918072]">{meal.proof.timestamp}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <button
                        type="button"
                        onClick={() => handleOpenMealCam(meal)}
                        className="px-2 py-1 rounded-lg bg-[#FAF8F5] text-amber-800 text-[10px] font-bold border border-[#EFEAE2] hover:bg-amber-100"
                      >
                        🔄 Đổi
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setMeals((prev) =>
                            prev.map((m) => (m.id === meal.id ? { ...m, proof: null } : m))
                          )
                        }
                        className="text-stone-400 hover:text-rose-600 p-1 text-xs"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleOpenMealCam(meal)}
                    className="w-full py-2.5 rounded-xl bg-white hover:bg-amber-50/80 border border-dashed border-amber-300 text-amber-800 text-xs font-bold flex items-center justify-center space-x-1.5 shadow-sm transition-all"
                  >
                    <span>📸</span>
                    <span>Chụp Ảnh {meal.name}</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Bữa Ăn Vặt Khuya (Tách riêng) */}
        <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#EFEAE2] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">🧋</span>
            <div>
              <h4 className="text-xs font-bold text-[#2C221E]">Thói Quen Ăn Vặt / Trà Sữa Khuya</h4>
              <p className="text-[11px] text-[#918072]">
                Không nạp calorie rỗng sau 21:00 giúp giấc ngủ sâu và cơ thể nhẹ nhàng
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
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

            {hadSnacks && !snackProof && (
              <button
                type="button"
                onClick={() =>
                  setActiveCamTarget({
                    targetType: 'snack',
                    title: 'Minh Chứng Món Ăn Vặt',
                    icon: '🧋',
                    privacy: snackPrivacy,
                  })
                }
                className="px-3 py-2 rounded-xl bg-white border border-amber-300 text-amber-800 text-xs font-bold hover:bg-amber-50 shadow-sm flex items-center space-x-1"
              >
                <span>📸</span>
                <span>Chụp Ảnh Món</span>
              </button>
            )}

            {snackProof && (
              <div className="flex items-center space-x-1 bg-white p-1 rounded-xl border border-amber-200">
                <img
                  src={snackProof.imageUrl}
                  alt="Snack"
                  className="w-8 h-8 rounded-lg object-cover"
                />
                <button
                  type="button"
                  onClick={() => setSnackProof(null)}
                  className="text-stone-400 hover:text-rose-600 p-1 text-xs"
                >
                  ✕
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ================= PHẦN 2: HỌC TẬP & DEEP WORK (NHẬP THỜI GIAN TRỰC TIẾP XONG CHỤP ẢNH) ================= */}
      <div className="p-6 rounded-3xl bg-white border border-[#EFEAE2] shadow-sm shadow-amber-950/5 space-y-5">
        <div className="flex items-center justify-between border-b border-[#FAF8F5] pb-3">
          <div className="flex items-center space-x-2.5">
            <span className="text-2xl">💻</span>
            <div>
              <h3 className="text-base font-black text-[#2C221E]">
                2. Học Tập & Deep Work (Nhập Số Phút & Chụp Ảnh)
              </h3>
              <p className="text-xs text-[#918072]">
                Nhập số phút bạn đã hoàn thành (tối thiểu 15 phút), sau đó chụp ảnh góc làm việc minh chứng
              </p>
            </div>
          </div>

          <span
            className={`text-xs font-bold px-3 py-1 rounded-full border ${
              isFocusEligible
                ? 'bg-amber-100 text-amber-900 border-amber-300'
                : 'bg-rose-100 text-rose-800 border-rose-200'
            }`}
          >
            {isFocusEligible ? `✅ Đạt ${studyMinutes}p (>= 15p)` : `⚠️ Cần tối thiểu 15p`}
          </span>
        </div>

        {/* Input thời gian học tập & preset */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Ô nhập số phút trực tiếp */}
          <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#EFEAE2] space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-amber-900 uppercase tracking-wider">
                Nhập thời gian đã học / làm việc
              </label>
              <button
                type="button"
                onClick={() => setIsTimerMode(!isTimerMode)}
                className="text-[11px] font-bold text-amber-800 hover:underline flex items-center space-x-1"
              >
                <span>⏱️</span>
                <span>{isTimerMode ? 'Chuyển về Nhập Thủ Công' : 'Mở Đồng Hồ Đếm Giờ (Timer)'}</span>
              </button>
            </div>

            {!isTimerMode ? (
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="relative flex-1">
                    <input
                      type="number"
                      min={1}
                      max={720}
                      value={studyMinutes || ''}
                      onChange={(e) => setStudyMinutes(Math.max(0, parseInt(e.target.value) || 0))}
                      placeholder="Nhập số phút..."
                      className="w-full px-4 py-3 rounded-2xl bg-white border border-[#E5DCCE] text-lg font-black text-[#2C221E] focus:outline-none focus:border-amber-500 shadow-inner"
                    />
                    <span className="absolute right-4 top-3.5 text-xs font-bold text-[#918072]">
                      Phút
                    </span>
                  </div>

                  <span className="text-xs font-black text-[#736357]">
                    ≈ {(studyMinutes / 60).toFixed(1)} Giờ
                  </span>
                </div>

                {/* Nút cộng nhanh */}
                <div className="flex items-center space-x-1.5 flex-wrap gap-y-1.5">
                  <span className="text-[11px] text-[#918072] mr-1">Cộng nhanh:</span>
                  {[15, 30, 45, 60, 90, 120].map((mins) => (
                    <button
                      key={mins}
                      type="button"
                      onClick={() => setStudyMinutes(mins)}
                      className={`px-2.5 py-1 rounded-xl text-xs font-bold border transition-all ${
                        studyMinutes === mins
                          ? 'bg-amber-500 text-white border-amber-500 shadow-sm'
                          : 'bg-white text-amber-800 border-[#EFEAE2] hover:bg-amber-50'
                      }`}
                    >
                      {mins}p
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              /* Timer mode */
              <div className="flex items-center justify-between p-2 bg-white rounded-xl border border-amber-200">
                <div className="text-xl font-black text-[#2C221E] px-2">
                  {String(Math.floor(timerSeconds / 60)).padStart(2, '0')}:
                  {String(timerSeconds % 60).padStart(2, '0')}
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => setIsTimerRunning(!isTimerRunning)}
                    className="px-4 py-2 rounded-xl bg-amber-500 text-white font-bold text-xs shadow-sm hover:bg-amber-600"
                  >
                    {isTimerRunning ? '⏸ Tạm Dừng' : '▶ Tiếp Tục'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsTimerRunning(false);
                      setTimerSeconds(60 * 60);
                      setStudyMinutes(60);
                    }}
                    className="px-2.5 py-2 rounded-xl bg-stone-100 text-[#5D4F45] text-xs font-semibold hover:bg-stone-200"
                  >
                    Reset
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Khu vực chụp ảnh minh chứng học tập */}
          <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200/70 flex flex-col justify-between space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-xl">📸</span>
                <div>
                  <h4 className="text-xs font-black text-[#2C221E]">Minh Chứng Bàn Học / Deep Work</h4>
                  <p className="text-[11px] text-[#918072]">Chụp màn hình làm việc, sách vở hoặc đồng hồ</p>
                </div>
              </div>

              <select
                value={focusPrivacy}
                onChange={(e) => setFocusPrivacy(e.target.value as PrivacyMode)}
                className="text-xs px-2.5 py-1 rounded-lg bg-white border border-[#E5DCCE] text-[#2C221E] font-medium focus:outline-none focus:border-amber-500"
              >
                <option value="PUBLIC">🌐 Công khai</option>
                <option value="FRIENDS_ONLY">👥 Bạn bè</option>
                <option value="PRIVATE">🔒 Chỉ mình tôi</option>
              </select>
            </div>

            {focusProof ? (
              <div className="flex items-center space-x-3 p-2.5 rounded-xl bg-white border border-amber-200">
                <img
                  src={focusProof.imageUrl}
                  alt="Focus Proof"
                  className="w-14 h-14 rounded-lg object-cover border border-[#EFEAE2] shadow-sm"
                />
                <div className="flex-1 min-w-0">
                  <span className="text-xs font-bold text-[#2C221E] block truncate">
                    {focusProof.caption || `Đã hoàn thành ${studyMinutes} phút tập trung`}
                  </span>
                  <span className="text-[10px] text-[#918072]">Chụp lúc {focusProof.timestamp}</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <button
                    type="button"
                    onClick={() =>
                      setActiveCamTarget({
                        targetType: 'focus',
                        title: 'Minh Chứng Deep Work & Học Tập',
                        icon: '💻',
                        privacy: focusPrivacy,
                      })
                    }
                    className="px-2.5 py-1.5 rounded-lg bg-[#FAF8F5] text-amber-800 text-xs font-bold border border-[#EFEAE2] hover:bg-amber-100"
                  >
                    🔄 Đổi
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
                onClick={() =>
                  setActiveCamTarget({
                    targetType: 'focus',
                    title: 'Minh Chứng Deep Work & Học Tập',
                    icon: '💻',
                    privacy: focusPrivacy,
                  })
                }
                className="w-full py-3.5 rounded-xl bg-white hover:bg-amber-100/60 border border-dashed border-amber-300 text-amber-800 text-xs font-bold flex items-center justify-center space-x-2 shadow-sm transition-all hover:scale-[1.01]"
              >
                <span className="text-base">📸</span>
                <span>Mở Camera Chụp Minh Chứng ({studyMinutes} Phút)</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ================= PHẦN 3: THÓI QUEN LÀNH MẠNH (ẢNH RIÊNG TỪNG MỤC & THÊM/SỬA/XÓA TÙY CHỈNH) ================= */}
      <div className="p-6 rounded-3xl bg-white border border-[#EFEAE2] shadow-sm shadow-amber-950/5 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#FAF8F5] pb-3">
          <div className="flex items-center space-x-2.5">
            <span className="text-2xl">🌅</span>
            <div>
              <h3 className="text-base font-black text-[#2C221E]">
                3. Thói Quen Lành Mạnh (Ảnh Riêng & Tùy Chỉnh)
              </h3>
              <p className="text-xs text-[#918072]">
                Chọn thói quen nào thì chỉ đẩy ảnh cho riêng thói quen đó; có thể thêm, sửa, xóa mục tùy thích
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsAddingHabit(true)}
            className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-sm shadow-amber-500/20 transition-all flex items-center space-x-1.5 self-start sm:self-auto"
          >
            <span>➕</span>
            <span>Thêm Thói Quen Mới</span>
          </button>
        </div>

        {/* Form thêm thói quen mới */}
        {isAddingHabit && (
          <form
            onSubmit={handleCreateHabit}
            className="p-4 rounded-2xl bg-[#FAF8F5] border border-amber-200/90 space-y-3 animate-fade-in"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-900 uppercase tracking-wider">
                Tạo Thói Quen Kỷ Luật Mới
              </span>
              <button
                type="button"
                onClick={() => setIsAddingHabit(false)}
                className="text-stone-400 hover:text-stone-600 text-xs"
              >
                ✕ Đóng
              </button>
            </div>

            <div className="flex items-center space-x-2">
              <select
                value={newHabitIcon}
                onChange={(e) => setNewHabitIcon(e.target.value)}
                className="px-3 py-2 text-base rounded-xl bg-white border border-[#E5DCCE] focus:outline-none"
              >
                <option value="✨">✨</option>
                <option value="⏰">⏰</option>
                <option value="💧">💧</option>
                <option value="🏃‍♂️">🏃‍♂️</option>
                <option value="📖">📖</option>
                <option value="🧘">🧘</option>
                <option value="🎸">🎸</option>
                <option value="💪">💪</option>
                <option value="🍎">🍎</option>
                <option value="💤">💤</option>
              </select>

              <input
                type="text"
                value={newHabitTitle}
                onChange={(e) => setNewHabitTitle(e.target.value)}
                placeholder="Ví dụ: Đi ngủ trước 23:00, Thiền 10 phút, Uống nước ấm sáng..."
                className="flex-1 px-3.5 py-2 rounded-xl bg-white border border-[#E5DCCE] text-xs text-[#2C221E] focus:outline-none focus:border-amber-500"
              />

              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-sm transition-all"
              >
                Lưu Thói Quen
              </button>
            </div>
          </form>
        )}

        {/* Danh sách các thói quen */}
        <div className="space-y-3">
          {habits.map((habit) => (
            <div
              key={habit.id}
              className={`p-4 rounded-2xl border transition-all ${
                habit.isCompleted
                  ? 'bg-amber-50/40 border-amber-200/90 shadow-sm'
                  : 'bg-[#FAF8F5] border-[#EFEAE2]'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                {/* Checkbox & Title */}
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  <button
                    type="button"
                    onClick={() => handleToggleHabit(habit.id)}
                    className={`w-7 h-7 rounded-lg flex items-center justify-center text-sm font-bold transition-all border ${
                      habit.isCompleted
                        ? 'bg-amber-500 text-white border-amber-500 shadow-sm'
                        : 'bg-white text-transparent border-[#D6CBBF] hover:border-amber-400'
                    }`}
                  >
                    ✓
                  </button>

                  <span className="text-xl">{habit.icon}</span>

                  {editingHabitId === habit.id ? (
                    <div className="flex items-center space-x-2 flex-1">
                      <input
                        type="text"
                        value={editingHabitTitle}
                        onChange={(e) => setEditingHabitTitle(e.target.value)}
                        className="px-2.5 py-1 text-xs rounded-lg bg-white border border-amber-400 text-[#2C221E] flex-1"
                      />
                      <button
                        type="button"
                        onClick={() => handleSaveEditHabit(habit.id)}
                        className="px-2.5 py-1 bg-amber-500 text-white text-xs font-bold rounded-lg"
                      >
                        Lưu
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingHabitId(null)}
                        className="px-2 py-1 text-xs text-stone-500"
                      >
                        Hủy
                      </button>
                    </div>
                  ) : (
                    <div className="flex-1 min-w-0">
                      <span
                        onClick={() => handleToggleHabit(habit.id)}
                        className={`text-xs sm:text-sm font-bold cursor-pointer block truncate ${
                          habit.isCompleted ? 'text-amber-950' : 'text-[#5D4F45]'
                        }`}
                      >
                        {habit.title}
                      </span>
                      {habit.proof && (
                        <span className="text-[10px] text-amber-700 font-semibold block">
                          📸 Đã có minh chứng riêng ({habit.proof.timestamp})
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Right controls: Privacy + Camera button + Edit/Delete */}
                <div className="flex items-center space-x-2 self-end sm:self-center">
                  {/* Privacy for this specific habit */}
                  <select
                    value={habit.privacyMode}
                    onChange={(e) => handleHabitPrivacyChange(habit.id, e.target.value as PrivacyMode)}
                    className="text-[11px] px-2 py-1 rounded-lg bg-white border border-[#E5DCCE] text-[#2C221E] focus:outline-none focus:border-amber-500"
                  >
                    <option value="PUBLIC">🌐 Công khai</option>
                    <option value="FRIENDS_ONLY">👥 Bạn bè</option>
                    <option value="PRIVATE">🔒 Chỉ mình tôi</option>
                  </select>

                  {/* Nút chụp ảnh minh chứng RIÊNG cho thói quen này */}
                  {habit.proof ? (
                    <div className="flex items-center space-x-1.5 bg-white p-1 rounded-xl border border-amber-200">
                      <img
                        src={habit.proof.imageUrl}
                        alt={habit.title}
                        className="w-7 h-7 rounded-lg object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => handleOpenHabitCam(habit)}
                        className="text-[10px] text-amber-800 font-bold px-1 hover:underline"
                      >
                        Đổi
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setHabits((prev) =>
                            prev.map((h) => (h.id === habit.id ? { ...h, proof: null } : h))
                          )
                        }
                        className="text-stone-400 hover:text-rose-600 px-1 text-xs"
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleOpenHabitCam(habit)}
                      className="px-2.5 py-1.5 rounded-xl bg-white border border-amber-300 text-amber-800 hover:bg-amber-100 text-xs font-bold shadow-sm transition-all flex items-center space-x-1"
                    >
                      <span>📸</span>
                      <span className="hidden xs:inline">Chụp Ảnh</span>
                    </button>
                  )}

                  {/* Edit button */}
                  <button
                    type="button"
                    onClick={() => handleStartEditHabit(habit)}
                    title="Sửa tên thói quen"
                    className="p-1.5 rounded-lg text-stone-400 hover:text-amber-700 hover:bg-amber-100/60 transition-colors text-xs"
                  >
                    ✏️
                  </button>

                  {/* Delete button */}
                  <button
                    type="button"
                    onClick={() => handleDeleteHabit(habit.id)}
                    title="Xóa thói quen này"
                    className="p-1.5 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition-colors text-xs"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ================= PHẦN 4: NHẬT KÝ & PHẢN TƯ ================= */}
      <div className="p-6 rounded-3xl bg-white border border-[#EFEAE2] shadow-sm shadow-amber-950/5 space-y-4">
        <div className="flex items-center justify-between border-b border-[#FAF8F5] pb-3">
          <div className="flex items-center space-x-2.5">
            <span className="text-2xl">📝</span>
            <div>
              <h3 className="text-base font-black text-[#2C221E]">4. Nhật Ký & Ghi Chú Phản Tư</h3>
              <p className="text-xs text-[#918072]">Cảm xúc, thành tựu hoặc bài học rút ra trong ngày</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <select
              value={reflectionPrivacy}
              onChange={(e) => setReflectionPrivacy(e.target.value as PrivacyMode)}
              className="text-xs px-2.5 py-1 rounded-lg bg-[#FAF8F5] border border-[#E5DCCE] text-[#2C221E] font-medium focus:outline-none"
            >
              <option value="PRIVATE">🔒 Chỉ mình tôi</option>
              <option value="FRIENDS_ONLY">👥 Bạn bè</option>
              <option value="PUBLIC">🌐 Công khai</option>
            </select>

            {reflectionProof ? (
              <div className="flex items-center space-x-1 bg-amber-50 px-2 py-1 rounded-xl border border-amber-200">
                <img
                  src={reflectionProof.imageUrl}
                  alt="Journal"
                  className="w-6 h-6 rounded object-cover"
                />
                <button
                  type="button"
                  onClick={() => setReflectionProof(null)}
                  className="text-stone-400 hover:text-rose-600 text-xs px-1"
                >
                  ✕
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() =>
                  setActiveCamTarget({
                    targetType: 'reflection',
                    title: 'Minh Chứng Sổ Tay & To-do List',
                    icon: '📝',
                    privacy: reflectionPrivacy,
                  })
                }
                className="px-3 py-1.5 rounded-xl bg-white border border-amber-300 text-amber-800 text-xs font-bold hover:bg-amber-50 shadow-sm flex items-center space-x-1"
              >
                <span>📸</span>
                <span>Chụp Trang Sổ</span>
              </button>
            )}
          </div>
        </div>

        <textarea
          rows={3}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Hôm nay bạn đã vượt qua sự trì hoãn như thế nào? Mục tiêu quan trọng nhất ngày mai là gì..."
          className="w-full p-4 rounded-2xl bg-[#FAF8F5] border border-[#E5DCCE] text-[#2C221E] placeholder-[#918072]/60 focus:outline-none focus:bg-white focus:border-amber-500 transition-colors text-xs sm:text-sm resize-none"
        ></textarea>
      </div>

      {/* ================= NÚT HOÀN TẤT TỔNG THỂ ================= */}
      <button
        type="button"
        onClick={handleSaveCheckIn}
        className="w-full py-4 rounded-3xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 hover:brightness-105 text-white font-black text-base tracking-wide shadow-xl shadow-amber-500/25 transition-all duration-200 active:scale-[0.99] flex items-center justify-center space-x-2"
      >
        <span>🔥</span>
        <span>
          HOÀN TẤT & LƯU TỔNG THỂ CHECK-IN HÔM NAY ({allCollectedProofs.length} MINH CHỨNG SẴN SÀNG)
        </span>
      </button>

      {/* ================= CAMERA MODAL TỰ ĐỘNG MỞ ================= */}
      {activeCamTarget && (
        <CameraModal
          isOpen={!!activeCamTarget}
          itemTitle={activeCamTarget.title}
          itemIcon={activeCamTarget.icon}
          initialPrivacy={activeCamTarget.privacy}
          onClose={() => setActiveCamTarget(null)}
          onPublish={handleProofPublished}
        />
      )}
    </div>
  );
};
