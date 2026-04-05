import React, { useState, useRef } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import ModalShell from './ModalShell';

interface SignatureCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (signatureData: string) => void;
}

type TabKey = 'draw' | 'type' | 'upload';

const SIGNATURE_FONTS = [
  'font-family: "Dancing Script", cursive;',
  'font-family: "Great Vibes", cursive;',
  'font-family: "Homemade Apple", cursive;',
  'font-family: "Sacramento", cursive;',
];

const SignatureCreationModal: React.FC<SignatureCreationModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [activeTab, setActiveTab] = useState<TabKey>('draw');
  const [typedName, setTypedName] = useState('');
  const [selectedFont, setSelectedFont] = useState(0);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);

  const sigCanvas = useRef<SignatureCanvas | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleClear = () => {
    if (activeTab === 'draw') sigCanvas.current?.clear();
    if (activeTab === 'type') setTypedName('');
    if (activeTab === 'upload') setUploadedImage(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleConfirm = () => {
    let result: string | undefined;

    if (activeTab === 'draw') {
      if (sigCanvas.current?.isEmpty()) return;
      result = sigCanvas.current?.getTrimmedCanvas().toDataURL('image/png');
    } else if (activeTab === 'type') {
      if (!typedName.trim()) return;
      // In a real app, we would render this text to a canvas to get a data URL
      // For now, we'll use a placeholder or simplified approach
      const canvas = document.createElement('canvas');
      canvas.width = 400;
      canvas.height = 100;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = 'black';
        ctx.font = `italic 48px cursive`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(typedName, 200, 50);
        result = canvas.toDataURL('image/png');
      }
    } else if (activeTab === 'upload') {
      if (!uploadedImage) return;
      result = uploadedImage;
    }

    if (result) {
      onSubmit(result);
    }
  };

  return (
    <ModalShell isOpen={isOpen} onClose={onClose} title="Tạo chữ ký của bạn" maxWidth="max-w-2xl">
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
                placeholder="Nhập tên của bạn tại đây..."
                className="w-full bg-transparent text-center text-4xl font-medium focus:outline-none placeholder:text-slate-200"
                style={{ fontFamily: 'cursive' }}
              />
              <div className="mt-8 flex gap-3 overflow-x-auto pb-2 w-full justify-center">
                {[1, 2, 3, 4].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedFont(i)}
                    className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg border-2 transition-all ${
                      selectedFont === i ? 'border-[#134BBA] bg-white text-[#134BBA]' : 'border-transparent bg-slate-200 text-slate-400'
                    }`}
                  >
                    <span className="text-xl">Ag</span>
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
                accept="image/*"
              />
            </div>
          )}

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
            className="rounded-xl bg-[#134BBA] px-8 py-2.5 text-sm font-bold text-white transition-all hover:bg-[#0e378c] active:scale-95"
          >
            Xác nhận chữ ký
          </button>
        </div>
      </div>
    </ModalShell>
  );
};

export default SignatureCreationModal;
