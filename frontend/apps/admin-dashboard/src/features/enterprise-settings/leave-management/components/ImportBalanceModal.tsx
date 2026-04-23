import React, { useState } from 'react';
import { useToast } from '../../../../hooks/useToast';

interface ImportBalanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const ImportBalanceModal: React.FC<ImportBalanceModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [branch, setBranch] = useState('');
  const [department, setDepartment] = useState('');
  const [importType, setImportType] = useState('total');
  const [isDownloading, setIsDownloading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  
  const { showToast } = useToast();

  if (!isOpen) return null;

  const handleNextStep1 = () => {
    if (!branch) {
      showToast("Vui lòng chọn Chi nhánh để tiếp tục", "error");
      return;
    }
    setStep(2);
  };

  const handleDownloadTemplate = () => {
    setIsDownloading(true);
    // Mock download API call
    setTimeout(() => {
      setIsDownloading(false);
      showToast("Tải file mẫu thành công!", "success");
      setStep(3);
    }, 1500);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = () => {
    if (!file) {
      showToast("Vui lòng chọn file để tải lên", "error");
      return;
    }
    
    setIsUploading(true);
    // Mock upload API call
    setTimeout(() => {
      setIsUploading(false);
      showToast("Import số dư phép thành công! Đã cập nhật 120 nhân viên.", "success");
      onSuccess();
      onClose();
    }, 2000);
  };

  const resetAndClose = () => {
    setStep(1);
    setBranch('');
    setDepartment('');
    setFile(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[1100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-2xl rounded-[24px] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        <header className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">Nhập số dư phép đầu kỳ</h3>
            <p className="text-xs font-bold text-slate-400 mt-0.5">Bước {step}/3</p>
          </div>
          <button onClick={resetAndClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-400 transition-colors">
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </header>

        <div className="p-8">
          {/* Progress Bar */}
          <div className="flex items-center justify-between mb-8 relative">
            <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-0.5 bg-slate-100 -z-10"></div>
            <div className={`absolute left-0 top-1/2 -translate-y-1/2 h-0.5 bg-emerald-500 -z-10 transition-all duration-500`} style={{ width: step === 1 ? '0%' : step === 2 ? '50%' : '100%' }}></div>
            
            {[1, 2, 3].map((s) => (
              <div key={s} className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black transition-all duration-300 ${
                step >= s ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-200' : 'bg-white border-2 border-slate-100 text-slate-300'
              }`}>
                {step > s ? <span className="material-symbols-outlined text-[16px]">check</span> : s}
              </div>
            ))}
          </div>

          {/* Content Step 1 */}
          {step === 1 && (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
              <div className="text-center mb-6">
                <h4 className="text-base font-black text-slate-800">Lọc dữ liệu nhân viên</h4>
                <p className="text-xs text-slate-500 mt-1">Chọn chi nhánh và phòng ban để tạo file mẫu có sẵn danh sách nhân viên.</p>
              </div>
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600">Chi nhánh <span className="text-red-500">*</span></label>
                  <select 
                    value={branch}
                    onChange={(e) => setBranch(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  >
                    <option value="">-- Chọn Chi nhánh --</option>
                    <option value="HN">Hội sở Hà Nội</option>
                    <option value="HCM">Chi nhánh Hồ Chí Minh</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600">Phòng ban (Tùy chọn)</label>
                  <select 
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  >
                    <option value="">Tất cả phòng ban</option>
                    <option value="IT">Phòng Công nghệ</option>
                    <option value="HR">Phòng Nhân sự</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600">Loại số dư</label>
                  <select 
                    value={importType}
                    onChange={(e) => setImportType(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  >
                    <option value="total">Tổng số dư (Ghi đè)</option>
                    <option value="add">Cộng thêm vào số dư hiện tại</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end pt-4">
                <button 
                  onClick={handleNextStep1}
                  className="px-8 py-3 rounded-xl text-sm font-black uppercase tracking-widest text-white bg-emerald-500 hover:bg-emerald-600 shadow-lg shadow-emerald-100 hover:-translate-y-0.5 transition-all"
                >
                  Tiếp tục
                </button>
              </div>
            </div>
          )}

          {/* Content Step 2 */}
          {step === 2 && (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
               <div className="text-center mb-6">
                <h4 className="text-base font-black text-slate-800">Tải file mẫu (Template)</h4>
                <p className="text-xs text-slate-500 mt-1">Hệ thống đã chuẩn bị sẵn file Excel chứa danh sách nhân viên thuộc chi nhánh bạn đã chọn.</p>
              </div>

              <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6 flex flex-col items-center justify-center text-center space-y-4">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm">
                  <span className="material-symbols-outlined text-[32px] text-blue-500">description</span>
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-800">Template_SoDuPhep_{branch}.xlsx</div>
                  <div className="text-xs text-slate-500 mt-1">Chứa mã NV, Tên NV và cột điền số dư. Vui lòng không sửa mã NV.</div>
                </div>
                <button 
                  onClick={handleDownloadTemplate}
                  disabled={isDownloading}
                  className="mt-2 flex items-center gap-2 bg-white text-blue-600 border border-blue-200 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest shadow-sm hover:bg-blue-50 transition-all disabled:opacity-50"
                >
                  {isDownloading ? (
                    <span className="material-symbols-outlined text-[18px] animate-spin">refresh</span>
                  ) : (
                    <span className="material-symbols-outlined text-[18px]">download</span>
                  )}
                  {isDownloading ? 'Đang tạo file...' : 'Tải xuống File mẫu'}
                </button>
              </div>
              
              <div className="flex justify-between pt-4">
                <button 
                  onClick={() => setStep(1)}
                  className="px-6 py-3 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-100 transition-all"
                >
                  Quay lại
                </button>
                <button 
                  onClick={() => setStep(3)}
                  className="px-8 py-3 rounded-xl text-sm font-black uppercase tracking-widest text-slate-400 border border-slate-200 hover:bg-slate-50 hover:text-slate-600 transition-all"
                >
                  Bỏ qua (Đã có file)
                </button>
              </div>
            </div>
          )}

          {/* Content Step 3 */}
          {step === 3 && (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
               <div className="text-center mb-6">
                <h4 className="text-base font-black text-slate-800">Tải lên dữ liệu</h4>
                <p className="text-xs text-slate-500 mt-1">Upload file Excel bạn vừa điền để cập nhật vào hệ thống.</p>
              </div>

              <div className="border-2 border-dashed border-slate-200 rounded-2xl p-8 flex flex-col items-center justify-center text-center bg-slate-50/50 hover:bg-slate-50 transition-colors relative">
                <input 
                  type="file" 
                  accept=".xlsx, .xls"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                />
                <span className="material-symbols-outlined text-[48px] text-slate-300 mb-4">upload_file</span>
                <div className="text-sm font-bold text-slate-700">
                  {file ? file.name : 'Kéo thả file vào đây hoặc Click để chọn'}
                </div>
                <div className="text-[11px] text-slate-400 mt-1">Hỗ trợ .xlsx, .xls (Tối đa 5MB)</div>
                {file && (
                   <div className="mt-4 px-4 py-1.5 bg-emerald-100 text-emerald-700 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1">
                     <span className="material-symbols-outlined text-[14px]">check_circle</span>
                     Đã chọn file
                   </div>
                )}
              </div>

              <div className="flex justify-between pt-4">
                <button 
                  onClick={() => setStep(2)}
                  className="px-6 py-3 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-100 transition-all"
                >
                  Quay lại
                </button>
                <button 
                  onClick={handleUpload}
                  disabled={!file || isUploading}
                  className="px-8 py-3 rounded-xl text-sm font-black uppercase tracking-widest text-white bg-emerald-500 hover:bg-emerald-600 shadow-lg shadow-emerald-100 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:hover:translate-y-0"
                >
                  {isUploading ? 'Đang xử lý...' : 'Cập nhật hệ thống'}
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default ImportBalanceModal;
