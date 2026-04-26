import React, { useState } from "react";
import { shiftJobsService, type MatchedEmployee } from "../services/shiftJobsService";
import { useToast } from "../../../hooks/useToast";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSelectionComplete: (employees: MatchedEmployee[]) => void;
}

const EmployeeBulkSelectionWizard: React.FC<Props> = ({ isOpen, onClose, onSelectionComplete }) => {
  const [step, setStep] = useState(1);
  const [inputText, setInputText] = useState("");
  const [matchedEmployees, setMatchedEmployees] = useState<MatchedEmployee[]>([]);
  const [unmatched, setUnmatched] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const { showToast, ToastComponent } = useToast();

  if (!isOpen) return null;

  const handleNext = async () => {
    if (step === 1) {
      if (!inputText.trim()) {
        showToast("Vui lòng nhập mã nhân viên hoặc email", "warning");
        return;
      }

      setLoading(true);
      try {
        const identifiers = inputText.split(/[\n,;]+/).map(i => i.trim()).filter(i => i);
        const result = await shiftJobsService.quickMatchEmployees(identifiers);
        
        setMatchedEmployees(result.matched_employees);
        setUnmatched(result.unmatched_identifiers);
        
        if (result.unmatched_identifiers.length > 0) {
          showToast(`Không tìm thấy ${result.unmatched_identifiers.length} nhân viên theo dữ liệu đã nhập`, "error");
        }
        
        setStep(2);
      } catch (e) {
        showToast("Lỗi khi kiểm tra dữ liệu", "error");
      } finally {
        setLoading(false);
      }
    } else {
      onSelectionComplete(matchedEmployees);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-2xl rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
          <div>
            <h3 className="text-xl font-black text-slate-900">Chọn nhanh Nhân viên</h3>
            <p className="text-slate-500 text-sm font-medium">Bước {step}/2: {step === 1 ? "Nhập thông tin" : "Xác nhận danh sách"}</p>
          </div>
          <button onClick={onClose} className="w-10 h-10 rounded-full hover:bg-white flex items-center justify-center transition-colors">
            <span className="material-symbols-outlined text-slate-400">close</span>
          </button>
        </div>

        <div className="p-8">
          {step === 1 ? (
            <div className="space-y-6">
              <div className="bg-blue-50 p-6 rounded-[24px] flex gap-4 border border-blue-100/50">
                <span className="material-symbols-outlined text-blue-500 text-[24px] shrink-0">info</span>
                <p className="text-sm text-blue-700 font-medium leading-relaxed">
                  Nhập danh sách Mã nhân viên hoặc Email. Mỗi thông tin cách nhau bằng dấu phẩy (,) hoặc xuống dòng.
                </p>
              </div>
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="VD: NV001&#10;NV002, employee@company.com"
                className="w-full h-48 bg-slate-50 border-none rounded-[24px] p-6 text-slate-800 font-bold placeholder:text-slate-300 focus:ring-2 focus:ring-[#134BBA]/20 transition-all resize-none outline-none"
              />
            </div>
          ) : (
            <div className="space-y-6">
              <div className="max-h-72 overflow-y-auto space-y-2 pr-2">
                {matchedEmployees.map(emp => (
                  <div key={emp.id} className="flex items-center justify-between p-4 bg-emerald-50/50 border border-emerald-100 rounded-[16px]">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-black">
                        {emp.full_name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-black text-slate-800">{emp.full_name}</p>
                        <p className="text-[11px] font-bold text-slate-500">{emp.employee_code} {emp.email ? `• ${emp.email}` : ''}</p>
                      </div>
                    </div>
                    <span className="material-symbols-outlined text-emerald-500">check_circle</span>
                  </div>
                ))}
                {unmatched.map((id, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 bg-rose-50/50 border border-rose-100 rounded-[16px]">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center text-rose-600">
                        <span className="material-symbols-outlined text-[20px]">person_off</span>
                      </div>
                      <div>
                        <p className="text-sm font-black text-slate-800">Không tìm thấy: {id}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="p-8 pt-0 flex gap-4">
          {step === 2 && (
            <button
              onClick={() => setStep(1)}
              className="flex-1 px-6 py-4 rounded-[20px] font-black text-slate-500 bg-slate-100 hover:bg-slate-200 transition-all"
            >
              Quay lại
            </button>
          )}
          <button
            onClick={handleNext}
            disabled={loading || (step === 2 && matchedEmployees.length === 0)}
            className="flex-[2] bg-[#134BBA] hover:bg-[#134BBA]/90 text-white px-6 py-4 rounded-[20px] font-black transition-all shadow-lg shadow-blue-200 disabled:opacity-50 disabled:shadow-none flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <span>{step === 1 ? "Kiểm tra dữ liệu" : "Xác nhận & Thêm"}</span>
                <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
              </>
            )}
          </button>
        </div>
      </div>
      {ToastComponent}
    </div>
  );
};

export default EmployeeBulkSelectionWizard;
