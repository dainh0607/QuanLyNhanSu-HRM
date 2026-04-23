import React, { useState, useEffect, useRef } from "react";
import { settingsService, type BrandingInfo } from "../../services/settingsService";

interface EnterpriseBrandingViewProps {
  onDirtyChange: (isDirty: boolean) => void;
  saveTriggered: number;
  onSaveComplete: () => void;
}

const EnterpriseBrandingView: React.FC<EnterpriseBrandingViewProps> = ({
  onDirtyChange,
  saveTriggered,
  onSaveComplete
}) => {
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState<BrandingInfo>({
    logoUrl: null,
    themeColor: "#10B981",
    useCustomSubdomain: false,
    subdomainPrefix: ""
  });
  const [initialData, setInitialData] = useState<BrandingInfo | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const swatches = [
    "#10B981", // Emerald
    "#134BBA", // Nexa Blue
    "#6366F1", // Indigo
    "#F43F5E", // Rose
    "#F59E0B", // Amber
    "#8B5CF6", // Violet
    "#06B6D4", // Cyan
    "#475569", // Slate
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await settingsService.getBrandingSettings();
        setFormData(data);
        setInitialData(data);
        setPreviewUrl(data.logoUrl);
      } catch (e) {
        console.error("Failed to fetch branding data", e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (initialData) {
      const isDirty = JSON.stringify(formData) !== JSON.stringify(initialData);
      onDirtyChange(isDirty);
    }
  }, [formData, initialData, onDirtyChange]);

  useEffect(() => {
    if (saveTriggered > 0 && initialData) {
      // Only trigger if actually dirty
      const isDirty = JSON.stringify(formData) !== JSON.stringify(initialData);
      if (isDirty) {
        handleSave();
      }
    }
  }, [saveTriggered]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Validate Subdomain if enabled
      if (formData.useCustomSubdomain) {
        const subdomainRegex = /^[a-z0-9-]+$/;
        if (!formData.subdomainPrefix) {
          throw new Error("Vui lòng nhập tiền tố tên miền");
        }
        if (!subdomainRegex.test(formData.subdomainPrefix)) {
          throw new Error("Tên miền chỉ được chứa chữ cái không dấu, số và dấu gạch ngang");
        }
      }

      await settingsService.updateBrandingSettings(formData);
      
      if (formData.useCustomSubdomain && formData.subdomainPrefix !== initialData?.subdomainPrefix) {
        alert("Cập nhật thành công. Bạn cần đăng nhập lại do thay đổi tên miền.");
        // Redirect logic would go here
        // window.location.href = `https://${formData.subdomainPrefix}.nexa.vn/login`;
      }
      
      setInitialData(formData);
      onSaveComplete();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Có lỗi xảy ra khi lưu cấu hình");
    } finally {
      setIsSaving(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validation
    const allowedTypes = ["image/png", "image/jpeg", "image/jpg", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      alert("Chỉ chấp nhận định dạng .png, .gif, .jpg, .jpeg");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      alert("Kích thước tối đa không quá 2MB");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      setPreviewUrl(result);
      setFormData(prev => ({ ...prev, logoUrl: result }));
    };
    reader.readAsDataURL(file);
  };

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-slate-400 text-xs font-medium uppercase tracking-widest">Đang tải cấu hình...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      {/* Logo Section */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div>
          <h4 className="text-sm font-bold text-slate-900 mb-1">Logo doanh nghiệp</h4>
          <p className="text-[12px] text-slate-500 leading-relaxed font-medium">Logo này sẽ hiển thị trên Sidebar và trang đăng nhập của nhân viên.</p>
        </div>
        <div className="lg:col-span-2 flex items-start gap-8">
          <div 
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const file = e.dataTransfer.files[0];
              if (file) {
                const dataTransfer = new DataTransfer();
                dataTransfer.items.add(file);
                if (fileInputRef.current) {
                  fileInputRef.current.files = dataTransfer.files;
                  // Manually create a change event
                  const event = { target: { files: dataTransfer.files } } as React.ChangeEvent<HTMLInputElement>;
                  handleFileChange(event);
                }
              }
            }}
            className="flex-1 h-32 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center bg-slate-50/50 hover:bg-slate-50 hover:border-emerald-300 transition-all cursor-pointer group"
          >
            <span className="material-symbols-outlined text-slate-400 group-hover:text-emerald-500 transition-colors text-3xl mb-2">upload_file</span>
            <p className="text-[11px] font-bold text-slate-500 group-hover:text-emerald-600">Kéo thả hoặc click để tải lên</p>
            <p className="text-[10px] text-slate-400 mt-1">PNG, JPG, GIF (Max 2MB)</p>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              className="hidden" 
              accept=".png,.jpg,.jpeg,.gif"
            />
          </div>
          <div className="w-32 h-32 bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center justify-center p-4">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Xem trước</p>
            {previewUrl ? (
              <img src={previewUrl} alt="Logo Preview" className="max-w-full max-h-16 object-contain" />
            ) : (
              <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center">
                <span className="material-symbols-outlined text-slate-200 text-3xl">image</span>
              </div>
            )}
          </div>
        </div>
      </section>

      <hr className="border-slate-50" />

      {/* Theme Color Section */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div>
          <h4 className="text-sm font-bold text-slate-900 mb-1">Màu sắc chủ đề</h4>
          <p className="text-[12px] text-slate-500 leading-relaxed font-medium">Thay đổi màu sắc các nút bấm, icon và trạng thái trên toàn hệ thống.</p>
        </div>
        <div className="lg:col-span-2 space-y-6">
          <div className="flex flex-wrap gap-3">
            {swatches.map((color) => (
              <button
                key={color}
                onClick={() => setFormData(prev => ({ ...prev, themeColor: color }))}
                className={`w-10 h-10 rounded-xl transition-all relative flex items-center justify-center ${
                  formData.themeColor === color ? 'ring-2 ring-offset-2 ring-slate-900 scale-110 shadow-lg' : 'hover:scale-105'
                }`}
                style={{ backgroundColor: color }}
              >
                {formData.themeColor === color && (
                  <span className="material-symbols-outlined text-white text-[18px]">check</span>
                )}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-[200px]">
              <div 
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border border-white shadow-sm"
                style={{ backgroundColor: formData.themeColor }}
              />
              <input 
                type="text" 
                value={formData.themeColor.toUpperCase()}
                onChange={(e) => setFormData(prev => ({ ...prev, themeColor: e.target.value }))}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-100 uppercase"
                placeholder="#000000"
              />
            </div>
            <span className="text-[11px] font-bold text-slate-400">Hoặc nhập mã HEX</span>
          </div>
        </div>
      </section>

      <hr className="border-slate-50" />

      {/* Subdomain Section */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div>
          <h4 className="text-sm font-bold text-slate-900 mb-1">Tên miền đăng nhập</h4>
          <p className="text-[12px] text-slate-500 leading-relaxed font-medium">Thiết lập đường dẫn truy cập riêng mang thương hiệu của bạn.</p>
        </div>
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center gap-3">
            <div 
              onClick={() => setFormData(prev => ({ ...prev, useCustomSubdomain: !prev.useCustomSubdomain }))}
              className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-all duration-300 ${
                formData.useCustomSubdomain ? 'bg-emerald-500' : 'bg-slate-200'
              }`}
            >
              <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-all duration-300 ${
                formData.useCustomSubdomain ? 'translate-x-6' : 'translate-x-0'
              }`} />
            </div>
            <span className="text-xs font-bold text-slate-700">Sử dụng tên miền tùy chọn</span>
          </div>

          {formData.useCustomSubdomain && (
            <div className="space-y-4 animate-in slide-in-from-top-4 duration-300">
              <div className="flex items-center gap-1">
                <input 
                  type="text" 
                  value={formData.subdomainPrefix}
                  onChange={(e) => setFormData(prev => ({ ...prev, subdomainPrefix: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') }))}
                  className="flex-1 bg-white border border-slate-200 px-4 py-2.5 rounded-xl text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  placeholder="vi-du: minh-6637502"
                />
                <span className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-400">.nexa.vn</span>
              </div>
              
              <div className="flex gap-3 bg-amber-50/50 border border-amber-100 p-4 rounded-2xl">
                <span className="material-symbols-outlined text-amber-500 text-[20px] shrink-0">warning</span>
                <p className="text-[11px] text-amber-700 font-medium leading-relaxed">
                  <span className="font-bold">Lưu ý quan trọng:</span> Bạn và tất cả nhân viên sẽ cần phải đăng nhập lại sau khi thay đổi tên miền truy cập thành công. Hệ thống sẽ chuyển hướng sang địa chỉ mới ngay lập tức.
                </p>
              </div>
            </div>
          )}
        </div>
      </section>

      {isSaving && (
        <div className="fixed inset-0 z-[2000] bg-white/60 backdrop-blur-[1px] flex items-center justify-center">
          <div className="flex flex-col items-center">
            <div className="w-10 h-10 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-xs font-bold text-slate-600 uppercase tracking-widest">Đang cập nhật cấu hình...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnterpriseBrandingView;
