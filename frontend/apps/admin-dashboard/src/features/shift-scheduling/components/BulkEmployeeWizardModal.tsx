import React, { useState } from "react";
import { shiftTaskService } from "../services/shiftTaskService";
import { useToast } from "../../../hooks/useToast";

interface BulkEmployeeWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (employeeIds: string[]) => void;
}

const BulkEmployeeWizardModal: React.FC<BulkEmployeeWizardModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [step, setStep] = useState(1);
  const [input, setInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const { showToast, ToastComponent } = useToast();

  if (!isOpen) return null;

  const handleProcess = async () => {
    setIsProcessing(true);
    setStep(2);
    try {
      const result = await shiftTaskService.processBulkEmployees(input);
      if (result.invalidCount > 0) {
        showToast(`Không tìm thấy ${result.invalidCount} nhân viên theo dữ liệu đã nhập.`, "error");
      } else {
        showToast("Xử lý danh sách thành công", "success");
      }
      
      // Chờ một chút để user thấy bước xử lý
      setTimeout(() => {
        onSuccess(result.validIds);
        handleClose();
      }, 1500);
    } catch (e) {
      showToast("Lỗi khi xử lý dữ liệu", "error");
      setStep(1);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClear = () => {
    if (window.confirm("Bạn có chắc muốn xóa danh sách hiện tại?")) {
      setInput("");
    }
  };

  const handleClose = () => {
    setStep(1);
    setInput("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[1100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl bg-white rounded-[32px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        {/* Header with Stepper */}
        <div className="px-8 py-6 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">Chọn nhanh Nhân viên</h3>
            <button onClick={handleClose} className="text-slate-400 hover:text-slate-600 transition-colors">
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
          
          {/* Stepper UI */}
          <div className="flex items-center gap-4">
            <StepItem number={1} label="Nhập dữ liệu" active={step === 1} completed={step > 1} />
            <div className="flex-1 h-px bg-slate-200"></div>
            <StepItem number={2} label="Xử lý & Gán" active={step === 2} completed={step > 2} />
          </div>
        </div>

        <div className="p-8">
          {step === 1 ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Dán danh sách Email hoặc Mã nhân viên</p>
                <button 
                  onClick={handleClear}
                  className="text-xs font-bold text-red-500 hover:text-red-600 uppercase tracking-widest transition-colors"
                >
                  Xóa danh sách có sẵn
                </button>
              </div>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ví dụ: NV001, NV002, admin@gmail.com... mỗi người một dòng hoặc cách nhau bằng dấu phẩy"
                className="w-full h-48 bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm font-medium text-slate-700 outline-none focus:ring-2 focus:ring-[#134BBA]/20 focus:border-[#134BBA] transition-all resize-none"
              />
              <div className="flex justify-end gap-3 pt-4">
                <button onClick={handleClose} className="px-6 py-2.5 rounded-xl text-sm font-bold text-slate-500 hover:bg-slate-50 transition-all">Hủy</button>
                <button 
                  onClick={handleProcess}
                  disabled={isProcessing || !input.trim()}
                  className="px-8 py-2.5 bg-[#134BBA] text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-100 hover:bg-[#0f41a8] disabled:opacity-50 disabled:shadow-none transition-all"
                >
                  {isProcessing ? "Đang xử lý..." : "Xử lý dữ liệu"}
                </button>
              </div>
            </div>
          ) : (
            <div className="py-12 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 border-4 border-[#134BBA] border-t-transparent rounded-full animate-spin mb-6"></div>
              <h4 className="text-lg font-black text-slate-800 uppercase tracking-tight">Đang phân tích dữ liệu</h4>
              <p className="text-sm font-bold text-slate-400 mt-2">Hệ thống đang tìm kiếm nhân viên phù hợp trong cơ sở dữ liệu...</p>
            </div>
          )}
        </div>
      </div>
      {ToastComponent}
    </div>
  );
};

const StepItem = ({ number, label, active, completed }: any) => (
  <div className="flex items-center gap-3">
    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black transition-all ${
      active ? "bg-[#134BBA] text-white shadow-lg shadow-blue-100" : completed ? "bg-emerald-500 text-white" : "bg-slate-200 text-slate-500"
    }`}>
      {completed ? <span className="material-symbols-outlined text-[16px]">check</span> : number}
    </div>
    <span className={`text-xs font-black uppercase tracking-widest ${active ? "text-slate-800" : "text-slate-400"}`}>{label}</span>
  </div>
);

export default BulkEmployeeWizardModal;
