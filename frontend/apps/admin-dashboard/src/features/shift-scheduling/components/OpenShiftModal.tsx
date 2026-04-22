import { useState, useEffect } from "react";
import { shiftsService } from "../../../services/shiftsService";

interface ShiftType {
  id: number;
  name: string;
  presetBranch?: string;
  presetDept?: string;
  presetJob?: string;
}

interface OpenShiftModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const OpenShiftModal = ({ isOpen, onClose, onSuccess }: OpenShiftModalProps) => {
  const [shiftTypes, setShiftTypes] = useState<ShiftType[]>([]);
  const [isLoadingShiftTypes, setIsLoadingShiftTypes] = useState(false);
  const [selectedShiftTypeId, setSelectedShiftTypeId] = useState<number | "">("");
  const [selectedShiftType, setSelectedShiftType] = useState<ShiftType | null>(null);
  
  const [tags, setTags] = useState<{ branch: string[]; dept: string[]; job: string[] }>({
    branch: [],
    dept: [],
    job: [],
  });
  const [quantity, setQuantity] = useState<string>("1");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch shift types from API
  useEffect(() => {
    if (!isOpen) return;
    
    const loadShiftTypes = async () => {
      setIsLoadingShiftTypes(true);
      try {
        const data = await shiftsService.getShifts();
        const mapped: ShiftType[] = (data ?? []).map((s: any) => ({
          id: s.id ?? s.Id,
          name: s.name ?? s.Name ?? s.shiftName ?? s.ShiftName ?? `Ca ${s.id}`,
          presetBranch: s.branchName ?? s.BranchName ?? "",
          presetDept: s.departmentName ?? s.DepartmentName ?? "",
          presetJob: s.jobTitleName ?? s.JobTitleName ?? "",
        }));
        setShiftTypes(mapped);
      } catch (error) {
        console.error("Failed to load shift types:", error);
        setShiftTypes([]);
      } finally {
        setIsLoadingShiftTypes(false);
      }
    };
    
    void loadShiftTypes();
  }, [isOpen]);

  useEffect(() => {
    if (selectedShiftTypeId) {
      const shift = shiftTypes.find(s => s.id === Number(selectedShiftTypeId));
      if (shift) {
        setSelectedShiftType(shift);
        setTags({
          branch: shift.presetBranch ? [shift.presetBranch] : [],
          dept: shift.presetDept ? [shift.presetDept] : [],
          job: shift.presetJob ? [shift.presetJob] : [],
        });
      }
    } else {
      setSelectedShiftType(null);
    }
  }, [selectedShiftTypeId, shiftTypes]);

  // Reset state when closed
  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setSelectedShiftTypeId("");
        setSelectedShiftType(null);
        setTags({ branch: [], dept: [], job: [] });
        setQuantity("1");
        setIsSubmitting(false);
      }, 300);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const removeTag = (type: "branch" | "dept" | "job", val: string) => {
    setTags(prev => ({
      ...prev,
      [type]: prev[type].filter(t => t !== val)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const qty = parseInt(quantity, 10);
    if (isNaN(qty) || qty < 1) {
      alert("Số lượng phải là số nguyên dương (>= 1)");
      return;
    }

    if (!selectedShiftType) return;

    setIsSubmitting(true);
    shiftsService.createOpenShiftBatch({
      shiftId: selectedShiftType.id,
      quantity: qty,
      branchIds: [],
      departmentIds: [],
      positionIds: [],
      date: new Date().toISOString().split("T")[0],
      isAutoPublish: true,
    })
      .then(() => {
        onSuccess();
      })
      .catch((error: unknown) => {
        console.error("Failed to create open shift:", error);
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 transition-opacity antialiased">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-xl flex flex-col max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <h2 className="text-lg font-bold text-[#192841] tracking-tight">Khởi tạo Ca mở</h2>
          <button 
            onClick={onClose} 
            className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
            title="Đóng"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="overflow-y-auto px-6 py-5 flex flex-col gap-6 shift-scheduling-scrollbar">
          
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-700">
              Loại ca mở <span className="text-red-500 font-bold">*</span>
            </label>
            <div className="relative group">
              <span className="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[20px] text-slate-400 group-focus-within:text-[#134BBA] transition-colors">
                schedule
              </span>
              <select 
                value={selectedShiftTypeId}
                onChange={(e) => setSelectedShiftTypeId(e.target.value === "" ? "" : Number(e.target.value))}
                className="w-full appearance-none rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-10 text-[13px] font-medium text-slate-700 focus:border-[#192841] focus:outline-none focus:ring-1 focus:ring-[#192841] transition-all hover:border-gray-400"
                required
                disabled={isLoadingShiftTypes}
              >
                <option value="" disabled hidden>
                  {isLoadingShiftTypes ? "Đang tải..." : "Chọn loại ca cần khởi tạo"}
                </option>
                {shiftTypes.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
              <span className="material-symbols-outlined pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[20px] text-slate-400">
                expand_more
              </span>
            </div>
          </div>

          <div className={`flex flex-col gap-5 overflow-hidden transition-all duration-300 ${selectedShiftType ? "max-h-[800px] opacity-100" : "max-h-0 opacity-0"}`}>
            
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-4 shadow-sm">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Đối tượng áp dụng</p>
              
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-600">Chi nhánh</label>
                <div className="flex min-h-[42px] flex-wrap items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 focus-within:border-[#192841] focus-within:ring-1 focus-within:ring-[#192841] transition-all">
                  {tags.branch.map(tag => (
                    <span key={tag} className="flex items-center gap-1 rounded-md bg-slate-100 px-2 py-1 text-[11px] font-bold text-[#192841] border border-slate-200">
                      {tag}
                      <button 
                        type="button" 
                        onClick={() => removeTag("branch", tag)} 
                        className="flex items-center justify-center text-slate-400 hover:text-red-500 transition-colors"
                      >
                        <span className="material-symbols-outlined text-[14px]">close</span>
                      </button>
                    </span>
                  ))}
                  <input 
                    type="text" 
                    placeholder="Thêm chi nhánh..." 
                    className="flex-1 min-w-[120px] bg-transparent text-[13px] font-medium outline-none text-slate-700 placeholder:text-slate-400" 
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700">
                  Số lượng người cần <span className="text-red-500 font-bold">*</span>
                </label>
                <input 
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-[13px] font-semibold text-slate-900 outline-none transition-all focus:border-[#192841] focus:ring-1 focus:ring-[#192841] hover:border-gray-400"
                  required
                />
              </div>
              <div className="flex flex-col justify-end">
                <label className="flex items-center gap-3 py-2.5 cursor-pointer group">
                  <div className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" defaultChecked className="sr-only peer" />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#134BBA]"></div>
                  </div>
                  <span className="text-sm font-semibold text-slate-700 group-hover:text-[#134BBA] transition-colors">Công bố tự động</span>
                </label>
              </div>
            </div>

          </div>
        </form>

        <div className="flex items-center justify-end gap-3 border-t border-slate-100 bg-slate-50 px-6 py-4">
          <button 
            onClick={onClose}
            className="rounded-xl px-5 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-200 transition-colors"
          >
            Hủy
          </button>
          <button 
            onClick={handleSubmit}
            disabled={!selectedShiftType || isSubmitting}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#134BBA] px-8 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-900/10 transition-all hover:bg-[#0F3F9F] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed min-w-[120px]"
          >
            {isSubmitting ? (
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              "Tạo mới"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default OpenShiftModal;
