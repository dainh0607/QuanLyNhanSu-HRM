
import React, { useState, useRef, useEffect } from 'react';
import { type CanvasObject, SIGNATURE_COLORS, ART_FONTS } from '../types';
import CanvasEditor from './CanvasEditor';
import { signatureService } from '../../../services/signatureService';
import { authService } from '../../../services/authService';

interface SignatureEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  employeeId: number;
}

const SignatureEditorModal: React.FC<SignatureEditorModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  employeeId
}) => {
  const [name, setName] = useState('');
  const [activeTool, setActiveTool] = useState<'scribble' | 'text' | 'move' | 'image'>('scribble');
  const [activeColor, setActiveColor] = useState(SIGNATURE_COLORS[0].value);
  const [activeFont, setActiveFont] = useState(ART_FONTS[0].value);
  const [watermarkConfig, setWatermarkConfig] = useState<'both' | 'image_only' | 'info_only'>('both');
  const [objects, setObjects] = useState<CanvasObject[]>([]);
  const [history, setHistory] = useState<CanvasObject[][]>([]);
  const [redoStack, setRedoStack] = useState<CanvasObject[][]>([]);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const user = authService.getCurrentUser();
  const dateStr = new Date().toLocaleDateString('vi-VN');
  const watermarkText = `Chữ ký hợp lệ, Ký bởi: ${user?.fullName || 'Nhân viên'}, Ngày: ${dateStr}`;

  useEffect(() => {
    if (isOpen) {
      setName('');
      setObjects([]);
      setHistory([]);
      setRedoStack([]);
      setActiveTool('scribble');
    }
  }, [isOpen]);

  const handleUpdateObjects = (newObjects: React.SetStateAction<CanvasObject[]>) => {
    setObjects(prev => {
      const next = typeof newObjects === 'function' ? newObjects(prev) : newObjects;
      setHistory(h => [...h, prev]);
      setRedoStack([]);
      return next;
    });
  };

  const handleUndo = () => {
    if (history.length === 0) return;
    const prev = history[history.length - 1];
    setRedoStack(r => [...r, objects]);
    setObjects(prev);
    setHistory(h => h.slice(0, -1));
  };

  const handleRedo = () => {
    if (redoStack.length === 0) return;
    const next = redoStack[redoStack.length - 1];
    setHistory(h => [...h, objects]);
    setObjects(next);
    setRedoStack(r => r.slice(0, -1));
  };

  const handleClear = () => {
    handleUpdateObjects([]);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        const newObj: CanvasObject = {
          id: Math.random().toString(36).substr(2, 9),
          type: 'image',
          x: 50,
          y: 50,
          width: 200,
          height: 150,
          content: dataUrl
        };
        handleUpdateObjects([...objects, newObj]);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      alert('Vui lòng nhập tên chữ ký mẫu');
      return;
    }
    if (objects.length === 0) {
      alert('Vui lòng tạo nội dung chữ ký');
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    // Export logic - transparent PNG
    const imageUrl = canvas.toDataURL('image/png');
    
    try {
      await signatureService.createSignature(employeeId, name, imageUrl, watermarkConfig);
      onSuccess();
      onClose();
    } catch (error) {
      alert('Có lỗi xảy ra khi lưu chữ ký');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1300] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-[32px] w-full max-w-4xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h2 className="text-xl font-black text-slate-800 tracking-tight">Tạo chữ ký mẫu</h2>
            <p className="text-xs text-slate-400 font-medium">Sáng tạo chữ ký điện tử mang bản sắc riêng của bạn</p>
          </div>
          <button onClick={onClose} className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-slate-100 transition-colors">
            <span className="material-symbols-outlined text-slate-400">close</span>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 space-y-8">
          {/* Name Field */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
              Tên chữ ký mẫu <span className="text-red-500">*</span>
            </label>
            <input 
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="VD: Chữ ký chính, Chữ ký nháy..."
              className="w-full h-12 px-4 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all outline-none font-medium"
            />
          </div>

          {/* Canvas Area with Toolbar */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-bold text-slate-700">Chữ ký mẫu</label>
              <div className="flex items-center gap-2">
                <button onClick={handleUndo} disabled={history.length === 0} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-slate-100 disabled:opacity-30">
                  <span className="material-symbols-outlined text-[18px]">undo</span>
                </button>
                <button onClick={handleRedo} disabled={redoStack.length === 0} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-slate-100 disabled:opacity-30">
                  <span className="material-symbols-outlined text-[18px]">redo</span>
                </button>
                <button onClick={handleClear} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-red-50 text-red-500">
                  <span className="material-symbols-outlined text-[18px]">delete</span>
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              {/* Toolbar */}
              <div className="flex items-center gap-4 p-2 bg-slate-100/80 rounded-2xl">
                <div className="flex items-center gap-1 border-r border-slate-200 pr-4">
                  {[
                    { id: 'scribble', icon: 'draw', label: 'Vẽ' },
                    { id: 'text', icon: 'title', label: 'Chữ' },
                    { id: 'image', icon: 'image', label: 'Ảnh' },
                    { id: 'move', icon: 'open_with', label: 'Di chuyển' },
                  ].map(tool => (
                    <button
                      key={tool.id}
                      onClick={() => tool.id === 'image' ? fileInputRef.current?.click() : setActiveTool(tool.id as any)}
                      className={`h-10 px-3 rounded-xl flex items-center gap-2 transition-all ${
                        activeTool === tool.id ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                      }`}
                      title={tool.label}
                    >
                      <span className="material-symbols-outlined text-[20px]">{tool.icon}</span>
                      <span className="text-xs font-bold">{tool.label}</span>
                    </button>
                  ))}
                  <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
                </div>

                {activeTool === 'text' && (
                  <div className="flex items-center gap-2 border-r border-slate-200 pr-4">
                    <select 
                      value={activeFont}
                      onChange={(e) => setActiveFont(e.target.value)}
                      className="h-10 px-3 rounded-xl bg-white border-none text-xs font-bold outline-none cursor-pointer"
                    >
                      {ART_FONTS.map(font => (
                        <option key={font.name} value={font.value} style={{ fontFamily: font.value }}>{font.name}</option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  {SIGNATURE_COLORS.map(color => (
                    <button
                      key={color.value}
                      onClick={() => setActiveColor(color.value)}
                      className={`w-8 h-8 rounded-full border-2 transition-all ${
                        activeColor === color.value ? 'border-emerald-500 scale-110 shadow-sm' : 'border-transparent'
                      }`}
                      style={{ backgroundColor: color.value }}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>

              {/* Editor */}
              <CanvasEditor 
                objects={objects}
                setObjects={setObjects}
                activeTool={activeTool}
                activeColor={activeColor}
                activeFont={activeFont}
                canvasRef={canvasRef}
                watermarkText={watermarkText}
                watermarkConfig={watermarkConfig}
              />
            </div>
          </div>

          {/* Watermark Config (AC 4.2) */}
          <div className="space-y-4">
            <label className="text-sm font-bold text-slate-700">Tùy chọn hiển thị chứng thực</label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { id: 'both', label: 'Hiển thị phía dưới', desc: 'Có chữ ký và text chứng thực' },
                { id: 'image_only', label: 'Chỉ hiển thị hình ảnh', desc: 'Ẩn text chứng thực' },
                { id: 'info_only', label: 'Chỉ hiển thị chứng thực', desc: 'Ẩn nét ký, chỉ hiện text' },
              ].map(opt => (
                <label key={opt.id} className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                  watermarkConfig === opt.id ? 'border-emerald-500 bg-emerald-50/30' : 'border-slate-100 hover:border-slate-200'
                }`}>
                  <div className="flex items-center gap-3">
                    <input 
                      type="radio" 
                      name="watermarkConfig"
                      checked={watermarkConfig === opt.id}
                      onChange={() => setWatermarkConfig(opt.id as any)}
                      className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 border-slate-300"
                    />
                    <div>
                      <p className="text-sm font-bold text-slate-800">{opt.label}</p>
                      <p className="text-[11px] text-slate-400 font-medium">{opt.desc}</p>
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-8 py-6 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
          <button onClick={onClose} className="h-12 px-8 rounded-2xl text-[14px] font-bold text-slate-500 hover:bg-slate-100 transition-all">
            Hủy bỏ
          </button>
          <button onClick={handleSave} className="h-12 px-10 rounded-2xl text-[14px] font-bold text-white bg-emerald-500 hover:bg-emerald-600 shadow-lg shadow-emerald-500/20 active:scale-95 transition-all outline-none">
            Tạo mới
          </button>
        </div>
      </div>
    </div>
  );
};

export default SignatureEditorModal;
