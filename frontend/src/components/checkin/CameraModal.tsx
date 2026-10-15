import React, { useState, useEffect, useRef } from 'react';
import { PrivacyMode } from '../../types';

interface CameraModalProps {
  isOpen: boolean;
  itemTitle: string;
  itemIcon: string;
  initialPrivacy: PrivacyMode;
  onClose: () => void;
  onPublish: (result: { imageUrl: string; privacyMode: PrivacyMode; caption: string }) => void;
}

export const CameraModal: React.FC<CameraModalProps> = ({
  isOpen,
  itemTitle,
  itemIcon,
  initialPrivacy,
  onClose,
  onPublish,
}) => {
  const [mode, setMode] = useState<'CAMERA' | 'PREVIEW'>('CAMERA');
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [privacyMode, setPrivacyMode] = useState<PrivacyMode>(initialPrivacy);
  const [caption, setCaption] = useState<string>('');
  const [flashEffect, setFlashEffect] = useState<boolean>(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Synchronize privacy with props when modal opens
  useEffect(() => {
    if (isOpen) {
      setPrivacyMode(initialPrivacy);
      setMode('CAMERA');
      setCapturedImage(null);
      setCaption('');
      setCameraError(null);
      startCamera(facingMode);
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [isOpen]);

  const startCamera = async (facing: 'user' | 'environment') => {
    stopCamera();
    setCameraError(null);

    // Check if mediaDevices is supported
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraError('Trình duyệt không hỗ trợ truy cập camera trực tiếp. Bạn có thể chọn ảnh từ thiết bị bên dưới.');
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
    } catch (err: any) {
      console.warn('Camera access error:', err);
      // Try fallback without facingMode constraints
      try {
        const fallbackStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });
        setStream(fallbackStream);
        if (videoRef.current) {
          videoRef.current.srcObject = fallbackStream;
        }
      } catch (fallbackErr: any) {
        setCameraError(
          'Không thể mở camera (vui lòng cấp quyền hoặc kết nối camera). Bạn có thể tải ảnh có sẵn từ thiết bị.'
        );
      }
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  // Flip camera between front/back
  const handleToggleFacingMode = () => {
    const nextFacing = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextFacing);
    startCamera(nextFacing);
  };

  // Take photo from video stream with automatic 1:1 square crop
  const handleSnapPhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const vW = video.videoWidth || 640;
    const vH = video.videoHeight || 480;
    const size = Math.min(vW, vH);
    const startX = (vW - size) / 2;
    const startY = (vH - size) / 2;

    canvas.width = size;
    canvas.height = size;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Trigger flash animation
    setFlashEffect(true);
    setTimeout(() => setFlashEffect(false), 200);

    // Draw square cropped video frame to canvas
    ctx.drawImage(video, startX, startY, size, size, 0, 0, size, size);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.92);

    setCapturedImage(dataUrl);
    stopCamera();
    setMode('PREVIEW');
  };

  // Upload fallback file with automatic 1:1 square crop
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        const rawUrl = event.target.result as string;
        const img = new Image();
        img.onload = () => {
          if (!canvasRef.current) {
            setCapturedImage(rawUrl);
            stopCamera();
            setMode('PREVIEW');
            return;
          }
          const canvas = canvasRef.current;
          const size = Math.min(img.width, img.height);
          const startX = (img.width - size) / 2;
          const startY = (img.height - size) / 2;
          canvas.width = size;
          canvas.height = size;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, startX, startY, size, size, 0, 0, size, size);
            setCapturedImage(canvas.toDataURL('image/jpeg', 0.92));
          } else {
            setCapturedImage(rawUrl);
          }
          stopCamera();
          setMode('PREVIEW');
        };
        img.src = rawUrl;
      }
    };
    reader.readAsDataURL(file);
  };

  // Download captured image to device
  const handleDownload = () => {
    if (!capturedImage) return;

    const link = document.createElement('a');
    link.href = capturedImage;
    link.download = `auraday-proof-${Date.now()}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Retake photo
  const handleRetake = () => {
    setCapturedImage(null);
    setMode('CAMERA');
    startCamera(facingMode);
  };

  // Publish / Confirm photo
  const handlePublishClick = () => {
    if (!capturedImage) return;
    onPublish({
      imageUrl: capturedImage,
      privacyMode,
      caption: caption.trim() || `Minh chứng cho mục: ${itemTitle}`,
    });
    handleCloseModal();
  };

  // Close modal and cleanup
  const handleCloseModal = () => {
    stopCamera();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg bg-[#FAF8F5] rounded-3xl overflow-hidden shadow-2xl border border-[#EFEAE2] flex flex-col max-h-[95vh]">
        {/* Hidden Canvas for capture processing */}
        <canvas ref={canvasRef} className="hidden" />
        <input
          type="file"
          ref={fileInputRef}
          accept="image/*"
          capture="environment"
          onChange={handleFileUpload}
          className="hidden"
        />

        {/* ================= MODAL HEADER ================= */}
        <div className="p-4 bg-white border-b border-[#EFEAE2] flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-2xl">{itemIcon}</span>
            <div>
              <h3 className="text-sm font-black text-[#2C221E] leading-tight line-clamp-1">{itemTitle}</h3>
              <p className="text-[11px] text-[#918072]">
                {mode === 'CAMERA' ? 'Đang mở camera chụp thực tế' : 'Xem lại & xác nhận minh chứng'}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Nút tải về trên góc khi ở chế độ xem trước */}
            {mode === 'PREVIEW' && capturedImage && (
              <button
                type="button"
                onClick={handleDownload}
                title="Tải ảnh này về máy"
                className="flex items-center space-x-1 px-3 py-1.5 rounded-full bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold shadow-md shadow-amber-500/20 transition-all active:scale-95"
              >
                <span>📥</span>
                <span>Tải Về Máy</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleCloseModal}
              className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-[#5D4F45] flex items-center justify-center text-sm font-bold transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        {/* ================= MODAL BODY ================= */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* CAMERA MODE */}
          {mode === 'CAMERA' && (
            <div className="space-y-3">
              <div className="relative w-full max-w-[360px] aspect-square mx-auto bg-stone-900 rounded-3xl overflow-hidden shadow-inner flex items-center justify-center border-2 border-amber-300/80">
                {/* White Flash overlay */}
                {flashEffect && <div className="absolute inset-0 bg-white z-30 animate-ping opacity-90"></div>}

                {/* Viewfinder brackets */}
                <div className="absolute inset-3 border border-white/20 rounded-xl pointer-events-none z-10">
                  <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-amber-400"></div>
                  <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-amber-400"></div>
                  <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-amber-400"></div>
                  <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-amber-400"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-10 h-10 border border-white/30 rounded-full flex items-center justify-center">
                      <div className="w-1.5 h-1.5 bg-amber-400 rounded-full"></div>
                    </div>
                  </div>
                </div>

                {/* Live Video Feed */}
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />

                {/* Error overlay or placeholder if camera failed */}
                {cameraError && (
                  <div className="absolute inset-0 bg-stone-900/90 text-white p-6 flex flex-col items-center justify-center text-center space-y-3 z-20">
                    <span className="text-3xl">📷⚠️</span>
                    <p className="text-xs text-stone-300 max-w-xs">{cameraError}</p>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold shadow-md transition-all"
                    >
                      📁 Chọn ảnh từ thiết bị
                    </button>
                  </div>
                )}

                {/* Bottom camera controls overlay */}
                <div className="absolute bottom-3 inset-x-0 flex items-center justify-between px-6 z-20">
                  {/* Flip camera */}
                  <button
                    type="button"
                    onClick={handleToggleFacingMode}
                    title="Đổi camera trước / sau"
                    className="w-10 h-10 rounded-full bg-black/50 hover:bg-black/70 backdrop-blur-sm text-white flex items-center justify-center text-lg transition-transform active:rotate-180"
                  >
                    🔄
                  </button>

                  {/* Main Shutter Button */}
                  <button
                    type="button"
                    onClick={handleSnapPhoto}
                    disabled={!!cameraError}
                    title="Chụp ảnh minh chứng"
                    className="w-16 h-16 rounded-full border-4 border-white bg-amber-500 hover:bg-amber-400 active:scale-90 transition-all flex items-center justify-center shadow-lg shadow-amber-500/50"
                  >
                    <div className="w-11 h-11 rounded-full bg-white flex items-center justify-center text-xl">
                      📸
                    </div>
                  </button>

                  {/* Upload photo button */}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    title="Tải từ thư viện ảnh"
                    className="w-10 h-10 rounded-full bg-black/50 hover:bg-black/70 backdrop-blur-sm text-white flex items-center justify-center text-lg transition-transform active:scale-95"
                  >
                    📁
                  </button>
                </div>
              </div>

              <div className="text-center">
                <span className="text-[11px] text-[#918072]">
                  💡 Căn chỉnh góc chụp rõ ràng (bàn làm việc, đĩa ăn, bình nước, sổ ghi chép) rồi bấm chụp.
                </span>
              </div>
            </div>
          )}

          {/* PREVIEW MODE: "ở trạng thái xem chứ chưa đăng vẫn có nút trên góc chọn ấn tải về được" */}
          {mode === 'PREVIEW' && capturedImage && (
            <div className="space-y-4 animate-fade-in">
              {/* TOP STATUS BADGE: "Bản xem trước (Chưa đăng)" */}
              <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200/90 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="flex h-2.5 w-2.5 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
                  </span>
                  <div>
                    <span className="text-xs font-black text-amber-950 uppercase tracking-wider block">
                      👁️ Trạng Thái: Bản Xem Trước (Chưa Đăng)
                    </span>
                    <span className="text-[11px] text-amber-800">
                      Ảnh này chỉ hiển thị tạm thời trên máy bạn, chưa đăng lên hệ thống.
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleDownload}
                  className="px-2.5 py-1 rounded-xl bg-white border border-amber-300 text-amber-800 text-[11px] font-bold hover:bg-amber-100/60 shadow-sm transition-all flex items-center space-x-1"
                >
                  <span>📥</span>
                  <span>Lưu về máy</span>
                </button>
              </div>

              {/* Photo Preview Frame - Square 1:1 with rounded border */}
              <div className="relative w-full max-w-[360px] aspect-square mx-auto bg-stone-900 rounded-3xl overflow-hidden shadow-lg border-2 border-amber-400">
                <img
                  src={capturedImage}
                  alt="Proof Preview"
                  className="w-full h-full object-cover"
                />

                {/* Watermark badge */}
                <div className="absolute bottom-2 right-2 px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-sm text-white text-[10px] font-bold tracking-wider uppercase">
                  AuraDay Proof • {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>

              {/* Privacy Setting Selector */}
              <div className="p-3.5 rounded-2xl bg-white border border-[#EFEAE2] space-y-2">
                <label className="text-xs font-bold text-[#2C221E] block">
                  Đối Tượng Được Xem Minh Chứng Này:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { mode: 'PUBLIC' as PrivacyMode, icon: '🌐', label: 'Công Khai' },
                    { mode: 'FRIENDS_ONLY' as PrivacyMode, icon: '👥', label: 'Bạn Bè' },
                    { mode: 'PRIVATE' as PrivacyMode, icon: '🔒', label: 'Chỉ Mình Tôi' },
                  ].map((item) => {
                    const isSelected = privacyMode === item.mode;
                    return (
                      <button
                        key={item.mode}
                        type="button"
                        onClick={() => setPrivacyMode(item.mode)}
                        className={`flex items-center justify-center space-x-1.5 py-2 px-2 rounded-xl text-xs font-bold transition-all border ${
                          isSelected
                            ? 'bg-amber-500 text-white border-amber-500 shadow-sm shadow-amber-500/25 scale-[1.02]'
                            : 'bg-[#FAF8F5] text-[#5D4F45] border-[#EFEAE2] hover:bg-white'
                        }`}
                      >
                        <span>{item.icon}</span>
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Optional Caption */}
              <div>
                <label className="text-xs font-bold text-[#2C221E] block mb-1">
                  Ghi chú minh chứng (Tùy chọn):
                </label>
                <input
                  type="text"
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder={`Ví dụ: Hoàn thành ${itemTitle.toLowerCase()}...`}
                  className="w-full px-3.5 py-2 rounded-xl bg-white border border-[#E5DCCE] text-xs text-[#2C221E] placeholder-[#918072] focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>
          )}
        </div>

        {/* ================= MODAL FOOTER ================= */}
        <div className="p-4 bg-white border-t border-[#EFEAE2] flex items-center justify-end space-x-3">
          {mode === 'CAMERA' ? (
            <button
              type="button"
              onClick={handleCloseModal}
              className="w-full py-2.5 rounded-2xl bg-stone-100 hover:bg-stone-200 text-[#5D4F45] font-bold text-xs transition-colors"
            >
              Đóng Camera
            </button>
          ) : (
            <>
              {/* Nút Hủy: Hủy ảnh vừa chụp, không đăng */}
              <button
                type="button"
                onClick={handleRetake}
                className="flex-1 py-3 rounded-2xl bg-[#FAF8F5] hover:bg-rose-50 text-rose-700 hover:text-rose-800 font-bold text-xs border border-[#EFEAE2] hover:border-rose-200 transition-all active:scale-95"
              >
                ✕ Hủy / Chụp Lại
              </button>

              {/* Nút Đăng: Xác nhận và đăng minh chứng */}
              <button
                type="button"
                onClick={handlePublishClick}
                className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-black text-xs shadow-md shadow-amber-500/25 transition-all active:scale-95 flex items-center justify-center space-x-1.5"
              >
                <span>🚀</span>
                <span>ĐĂNG MINH CHỨNG</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
