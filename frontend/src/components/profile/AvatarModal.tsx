import React, { useState, useEffect, useRef } from 'react';

interface AvatarModalProps {
  isOpen: boolean;
  currentAvatarUrl: string;
  onClose: () => void;
  onAvatarSelected: (newAvatarUrl: string) => void;
}

export const AvatarModal: React.FC<AvatarModalProps> = ({
  isOpen,
  currentAvatarUrl,
  onClose,
  onAvatarSelected,
}) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'camera' | 'presets'>('upload');
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isCapturingFlash, setIsCapturingFlash] = useState<boolean>(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const presets = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=400&auto=format&fit=crop&q=80'
  ];

  // Lifecycle
  useEffect(() => {
    if (isOpen) {
      setPreviewImage(null);
      setCameraError(null);
      if (activeTab === 'camera') {
        startCamera(facingMode);
      }
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [isOpen, activeTab, facingMode]);

  const startCamera = async (facing: 'user' | 'environment') => {
    stopCamera();
    setCameraError(null);

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraError('Trình duyệt không hỗ trợ mở camera trực tiếp. Vui lòng chuyển sang tab "Tải ảnh từ máy"');
      return;
    }

    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facing,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.warn('Camera error:', err);
      try {
        const fallbackStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });
        setStream(fallbackStream);
        if (videoRef.current) {
          videoRef.current.srcObject = fallbackStream;
        }
      } catch (fallbackErr) {
        setCameraError('Không thể mở camera (vui lòng cho phép quyền truy cập camera). Bạn có thể chọn tải ảnh từ máy tính/điện thoại.');
      }
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  };

  // Crop to 1:1 Square
  const cropToSquareDataUrl = (imgElement: HTMLImageElement | HTMLVideoElement): string => {
    const canvas = document.createElement('canvas');
    const size = 500;
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';

    let srcWidth = (imgElement instanceof HTMLVideoElement) ? imgElement.videoWidth : imgElement.naturalWidth;
    let srcHeight = (imgElement instanceof HTMLVideoElement) ? imgElement.videoHeight : imgElement.naturalHeight;

    if (!srcWidth || !srcHeight) {
      srcWidth = 500;
      srcHeight = 500;
    }

    const minDim = Math.min(srcWidth, srcHeight);
    const startX = (srcWidth - minDim) / 2;
    const startY = (srcHeight - minDim) / 2;

    ctx.drawImage(imgElement, startX, startY, minDim, minDim, 0, 0, size, size);
    return canvas.toDataURL('image/jpeg', 0.92);
  };

  const handleCapturePhoto = () => {
    if (!videoRef.current) return;
    setIsCapturingFlash(true);
    setTimeout(() => setIsCapturingFlash(false), 200);

    const squareDataUrl = cropToSquareDataUrl(videoRef.current);
    if (squareDataUrl) {
      setPreviewImage(squareDataUrl);
      stopCamera();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Vui lòng chọn file hình ảnh hợp lệ (JPG, PNG, WEBP...)');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const squareDataUrl = cropToSquareDataUrl(img);
        setPreviewImage(squareDataUrl);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleDownload = () => {
    if (!previewImage) return;
    const a = document.createElement('a');
    a.href = previewImage;
    a.download = `auraday-avatar-${Date.now()}.jpg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleApplyAvatar = () => {
    if (!previewImage) return;
    onAvatarSelected(previewImage);
    stopCamera();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#2C221E]/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl border border-[#EFEAE2] shadow-2xl max-w-lg w-full overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#EFEAE2] flex items-center justify-between bg-[#FAF8F5]">
          <div className="flex items-center gap-2">
            <span className="text-xl">📸</span>
            <div>
              <h3 className="font-black text-sm sm:text-base text-[#2C221E]">
                Cập Nhật Ảnh Đại Diện (Avatar)
              </h3>
              <p className="text-[11px] text-[#736357]">
                Chuẩn hình vuông 1:1 • Bo viền Gen Z ấm áp
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="w-8 h-8 rounded-full bg-white border border-[#EFEAE2] text-[#736357] hover:text-[#2C221E] flex items-center justify-center text-sm shadow-sm transition-all"
          >
            ✕
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
          {/* Mode Switcher (Hidden when viewing Preview) */}
          {!previewImage && (
            <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-[#FAF8F5] border border-[#EFEAE2]">
              <button
                type="button"
                onClick={() => {
                  stopCamera();
                  setActiveTab('upload');
                }}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === 'upload'
                    ? 'bg-amber-500 text-white shadow-sm'
                    : 'text-[#736357] hover:text-[#2C221E]'
                }`}
              >
                <span>📁 Tải Ảnh Từ Máy</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('camera')}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === 'camera'
                    ? 'bg-amber-500 text-white shadow-sm'
                    : 'text-[#736357] hover:text-[#2C221E]'
                }`}
              >
                <span>📸 Chụp Trực Tiếp</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  stopCamera();
                  setActiveTab('presets');
                }}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === 'presets'
                    ? 'bg-amber-500 text-white shadow-sm'
                    : 'text-[#736357] hover:text-[#2C221E]'
                }`}
              >
                <span>✨ Gợi Ý</span>
              </button>
            </div>
          )}

          {/* ================= VIEW 1: PREVIEW STATE ================= */}
          {previewImage ? (
            <div className="space-y-4 animate-fade-in text-center">
              <div className="relative inline-block mx-auto">
                {/* 1:1 Square Rounded Avatar Preview */}
                <img
                  src={previewImage}
                  alt="Avatar Preview"
                  className="w-56 h-56 sm:w-64 sm:h-64 aspect-square rounded-3xl object-cover border-4 border-amber-400 shadow-xl shadow-amber-500/15 mx-auto"
                />

                {/* Badge "Xem trước - Chưa lưu" */}
                <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-[#2C221E]/80 backdrop-blur-sm text-white text-[11px] font-bold border border-white/20">
                  👁️ Xem trước
                </span>

                {/* Download Button */}
                <button
                  type="button"
                  onClick={handleDownload}
                  className="absolute top-3 right-3 p-2 rounded-2xl bg-white/90 hover:bg-white text-[#2C221E] shadow-md border border-[#EFEAE2] transition-all text-xs font-bold flex items-center gap-1"
                  title="Tải ảnh về máy"
                >
                  <span>📥</span>
                </button>
              </div>

              <div className="space-y-1">
                <p className="text-xs font-bold text-[#2C221E]">Ảnh đại diện mới đã được căn chuẩn tỉ lệ vuông 1:1</p>
                <p className="text-[11px] text-[#736357]">Bấm "Dùng Làm Avatar ✨" để cập nhật ngay vào tài khoản của bạn.</p>
              </div>

              {/* Action Buttons for Preview */}
              <div className="flex items-center gap-2 pt-2 border-t border-[#EFEAE2]">
                <button
                  type="button"
                  onClick={() => {
                    setPreviewImage(null);
                    if (activeTab === 'camera') startCamera(facingMode);
                  }}
                  className="flex-1 py-2.5 rounded-2xl bg-[#FAF8F5] hover:bg-[#EFEAE2] text-[#736357] font-bold text-xs transition-all"
                >
                  🔄 Chụp / Chọn lại
                </button>

                <button
                  type="button"
                  onClick={handleApplyAvatar}
                  className="flex-1 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-black text-xs shadow-md shadow-amber-500/25 transition-all flex items-center justify-center gap-1.5"
                >
                  <span>Dùng Làm Avatar ✨</span>
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* ================= VIEW 2: UPLOAD FILE ================= */}
              {activeTab === 'upload' && (
                <div className="space-y-4">
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-amber-300 hover:border-amber-500 rounded-3xl p-8 text-center cursor-pointer bg-[#FAF8F5] hover:bg-amber-50/50 transition-all space-y-3 group"
                  >
                    <div className="w-16 h-16 rounded-2xl bg-white border border-[#EFEAE2] text-3xl flex items-center justify-center mx-auto shadow-sm group-hover:scale-110 transition-transform">
                      📁
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-[#2C221E]">
                        Nhấp để chọn ảnh từ máy tính hoặc điện thoại
                      </h4>
                      <p className="text-xs text-[#736357] mt-1">
                        Hỗ trợ PNG, JPG, WEBP • Tự động cắt chuẩn vuông 1:1 bo viền
                      </p>
                    </div>
                    <button
                      type="button"
                      className="px-5 py-2 rounded-xl bg-amber-500 text-white text-xs font-bold shadow-sm"
                    >
                      Duyệt File Ảnh
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </div>

                  <div className="p-3.5 rounded-2xl bg-amber-50/60 border border-amber-200/60 text-xs text-amber-900 flex items-center gap-2">
                    <span className="text-base">💡</span>
                    <span>Hệ thống tự động canh giữa và cắt thành ảnh vuông sắc nét để hiển thị đẹp mắt trên cả máy tính lẫn điện thoại.</span>
                  </div>
                </div>
              )}

              {/* ================= VIEW 3: LIVE CAMERA ================= */}
              {activeTab === 'camera' && (
                <div className="space-y-4">
                  {cameraError ? (
                    <div className="p-6 rounded-3xl bg-rose-50 border border-rose-200 text-center space-y-3">
                      <span className="text-3xl">⚠️</span>
                      <h4 className="font-bold text-sm text-rose-800">Không Thể Truy Cập Camera</h4>
                      <p className="text-xs text-rose-700 leading-relaxed">{cameraError}</p>
                      <button
                        type="button"
                        onClick={() => setActiveTab('upload')}
                        className="px-4 py-2 rounded-xl bg-amber-500 text-white font-bold text-xs"
                      >
                        Chuyển Sang Tải Ảnh Từ Máy
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {/* Viewfinder 1:1 Square */}
                      <div className="relative aspect-square max-w-[280px] sm:max-w-[320px] mx-auto rounded-3xl overflow-hidden border-4 border-amber-400 bg-black shadow-xl">
                        {isCapturingFlash && (
                          <div className="absolute inset-0 bg-white z-20 animate-fade-in" />
                        )}

                        <video
                          ref={videoRef}
                          autoPlay
                          playsInline
                          muted
                          className="w-full h-full object-cover transform scale-x-[-1]"
                        />

                        {/* Framing guide overlay */}
                        <div className="absolute inset-4 rounded-2xl border-2 border-white/60 pointer-events-none flex items-center justify-center">
                          <span className="text-[10px] text-white/80 bg-black/40 px-2 py-0.5 rounded-full font-semibold">
                            Căn khuôn mặt vào khung
                          </span>
                        </div>

                        {/* Switch camera button */}
                        <button
                          type="button"
                          onClick={() => setFacingMode((prev) => (prev === 'user' ? 'environment' : 'user'))}
                          className="absolute bottom-3 right-3 p-2 rounded-full bg-black/60 text-white text-xs hover:bg-black/80 transition-all border border-white/30"
                          title="Đổi camera trước/sau"
                        >
                          🔄
                        </button>
                      </div>

                      {/* Shutter Button */}
                      <div className="flex items-center justify-center pt-1">
                        <button
                          type="button"
                          onClick={handleCapturePhoto}
                          className="w-16 h-16 rounded-full bg-gradient-to-tr from-amber-500 to-orange-500 p-1.5 shadow-lg shadow-amber-500/30 hover:scale-105 active:scale-95 transition-transform"
                          title="Chụp ảnh ngay"
                        >
                          <div className="w-full h-full rounded-full border-2 border-white flex items-center justify-center text-white text-xl">
                            📸
                          </div>
                        </button>
                      </div>
                      <p className="text-center text-[11px] text-[#736357]">
                        Bấm nút máy ảnh để chụp và xem trước
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* ================= VIEW 4: PRESET AVATARS ================= */}
              {activeTab === 'presets' && (
                <div className="space-y-3">
                  <p className="text-xs text-[#736357]">Chọn một trong các ảnh đại diện phong cách Gen Z có sẵn:</p>
                  <div className="grid grid-cols-4 gap-3">
                    {presets.map((preset, idx) => (
                      <div
                        key={idx}
                        onClick={() => {
                          setPreviewImage(preset);
                        }}
                        className="group relative cursor-pointer aspect-square rounded-2xl overflow-hidden border-2 border-[#EFEAE2] hover:border-amber-400 hover:scale-105 transition-all shadow-sm"
                      >
                        <img
                          src={preset}
                          alt={`Preset ${idx}`}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-amber-500/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-sm font-bold">
                          ✓
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer info */}
        <div className="p-3 bg-[#FAF8F5] border-t border-[#EFEAE2] text-center text-[11px] text-[#A89A8D]">
          Ảnh đại diện sẽ hiển thị trên Hồ sơ, Tủ Khóa Locker và Danh sách Bạn Bè đồng hành.
        </div>
      </div>
    </div>
  );
};
