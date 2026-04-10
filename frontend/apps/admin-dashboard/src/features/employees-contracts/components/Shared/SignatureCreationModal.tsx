import React, { useEffect, useRef, useState } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import ModalShell from './ModalShell';
import type { SignatureMethod } from '../../services/signersService';

interface SignatureCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: SignaturePayload) => void;
}

type TabKey = 'draw' | 'type' | 'upload';

export interface SignaturePayload {
  dataUrl: string;
  method: SignatureMethod;
}

const SIGNATURE_FONTS = [
  {
    label: 'Mau 1',
    fontFamily: "'Brush Script MT', 'Segoe Script', cursive",
  },
  {
    label: 'Mau 2',
    fontFamily: "'Lucida Handwriting', 'Brush Script MT', cursive",
  },
  {
    label: 'Mau 3',
    fontFamily: "'Segoe Print', 'Comic Sans MS', cursive",
  },
  {
    label: 'Mau 4',
    fontFamily: "'Snell Roundhand', 'Brush Script MT', cursive",
  },
];

const SignatureCreationModal: React.FC<SignatureCreationModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [activeTab, setActiveTab] = useState<TabKey>('draw');
  const [typedName, setTypedName] = useState('');
  const [selectedFont, setSelectedFont] = useState(0);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const sigCanvas = useRef<SignatureCanvas | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setActiveTab('draw');
    setTypedName('');
    setSelectedFont(0);
    setUploadedImage(null);
    setUploadError(null);
    sigCanvas.current?.clear();
  }, [isOpen]);

  const renderTypedSignature = () => {
    const value = typedName.trim();
    if (!value) {
      return null;
    }

    const fontFamily = SIGNATURE_FONTS[selectedFont]?.fontFamily ?? SIGNATURE_FONTS[0].fontFamily;
    const canvas = document.createElement('canvas');
    canvas.width = 640;
    canvas.height = 180;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      return null;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#0f172a';
    ctx.font = `64px ${fontFamily}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(value, canvas.width / 2, canvas.height / 2);

    return canvas.toDataURL('image/png');
  };

  const canSubmit =
    (activeTab === 'draw' && (sigCanvas.current ? !sigCanvas.current.isEmpty() : false)) ||
    (activeTab === 'type' && typedName.trim().length > 0) ||
    (activeTab === 'upload' && Boolean(uploadedImage));

  const handleClear = () => {
    if (activeTab === 'draw') sigCanvas.current?.clear();
    if (activeTab === 'type') setTypedName('');
    if (activeTab === 'upload') {
      setUploadedImage(null);
      setUploadError(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const allowedTypes = new Set(['image/png', 'image/jpeg', 'image/jpg']);
      if (!allowedTypes.has(file.type)) {
        setUploadedImage(null);
        setUploadError('Chi ho tro dinh dang PNG hoac JPG.');
        return;
      }

      setUploadError(null);
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleConfirm = () => {
    let result: string | null = null;
    let method: SignatureMethod | null = null;

    if (activeTab === 'draw') {
      if (sigCanvas.current?.isEmpty()) return;
      result = sigCanvas.current?.getTrimmedCanvas().toDataURL('image/png') ?? null;
      method = 'draw';
    } else if (activeTab === 'type') {
      result = renderTypedSignature();
      method = 'type';
    } else if (activeTab === 'upload') {
      if (!uploadedImage) return;
      result = uploadedImage;
      method = 'upload';
    }

    if (result && method) {
      onSubmit({
        dataUrl: result,
        method,
      });
    }
  };

  return (
    <ModalShell
      isOpen={isOpen}
      onClose={onClose}
      title="Tao chu ky cua ban"
      maxWidthClassName="max-w-2xl"
    >
      <div className="flex flex-col gap-6">
        {/* Tabs */}
        <div className="flex rounded-xl bg-slate-100 p-1">
          {(['draw', 'type', 'upload'] as TabKey[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 rounded-lg py-2 text-sm font-bold transition-all ${
                activeTab === tab 
                  ? 'bg-white text-[#134BBA] shadow-sm' 
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {tab === 'draw' ? 'Vẽ tay' : tab === 'type' ? 'Nhập tên' : 'Tải ảnh'}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="relative min-h-[300px] rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50">
          {activeTab === 'draw' && (
            <SignatureCanvas
              ref={sigCanvas}
              penColor="black"
              canvasProps={{
                className: 'h-[300px] w-full cursor-crosshair',
              }}
            />
          )}

          {activeTab === 'type' && (
            <div className="flex h-[300px] flex-col items-center justify-center p-8 text-center">
              <input
                type="text"
                value={typedName}
                onChange={(e) => setTypedName(e.target.value)}
                placeholder="Nhap ten cua ban tai day..."
                className="w-full bg-transparent text-center text-4xl font-medium focus:outline-none placeholder:text-slate-200"
                style={{
                  fontFamily: SIGNATURE_FONTS[selectedFont]?.fontFamily ?? SIGNATURE_FONTS[0].fontFamily,
                }}
              />
              <div className="mt-8 flex w-full gap-3 overflow-x-auto pb-2">
                {SIGNATURE_FONTS.map((fontOption, i) => (
                  <button
                    key={fontOption.label}
                    onClick={() => setSelectedFont(i)}
                    className={`flex min-w-[120px] flex-shrink-0 items-center justify-center rounded-2xl border-2 px-4 py-3 transition-all ${
                      selectedFont === i ? 'border-[#134BBA] bg-white text-[#134BBA]' : 'border-transparent bg-slate-200 text-slate-400'
                    }`}
                    style={{ fontFamily: fontOption.fontFamily }}
                  >
                    <span className="text-lg">{typedName.trim() || fontOption.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'upload' && (
            <div 
              className="flex h-[300px] flex-col items-center justify-center p-8 cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              {uploadedImage ? (
                <img src={uploadedImage} alt="Uploaded signature" className="max-h-full max-w-full object-contain" />
              ) : (
                <>
                  <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 text-[#134BBA]">
                    <span className="material-symbols-outlined text-3xl">upload_file</span>
                  </div>
                  <p className="font-bold text-slate-700">Tải ảnh chữ ký</p>
                  <p className="mt-1 text-xs text-slate-400 text-center">Hỗ trợ định dạng PNG, JPG (nên dùng ảnh có nền trong suốt)</p>
                </>
              )}
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                className="hidden" 
                accept="image/png,image/jpeg"
              />
            </div>
          )}

          {uploadError ? (
            <div className="absolute inset-x-4 bottom-16 rounded-2xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-600">
              {uploadError}
            </div>
          ) : null}

          {/* Action Buttons in Drawing Area */}
          <button
            onClick={handleClear}
            className="absolute bottom-4 right-4 flex h-10 w-10 items-center justify-center rounded-full bg-white text-slate-400 shadow-md transition-colors hover:bg-rose-50 hover:text-rose-500"
            title="Xóa chữ ký"
          >
            <span className="material-symbols-outlined text-xl">delete</span>
          </button>
        </div>

        {/* Modal Footer */}
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="rounded-xl px-6 py-2.5 text-sm font-bold text-slate-600 transition-colors hover:bg-slate-100"
          >
            Hủy bỏ
          </button>
          <button
            onClick={handleConfirm}
            disabled={!canSubmit}
            className="rounded-xl bg-[#134BBA] px-8 py-2.5 text-sm font-bold text-white transition-all hover:bg-[#0e378c] disabled:cursor-not-allowed disabled:bg-slate-300 active:scale-95"
          >
            Xác nhận chữ ký
          </button>
        </div>
      </div>
    </ModalShell>
  );
};

export default SignatureCreationModal;
