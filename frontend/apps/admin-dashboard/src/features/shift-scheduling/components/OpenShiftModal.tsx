import { useState, useEffect } from "react";

interface OpenShiftModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const mockShiftTypes = [
  { id: 1, name: "Ca hành chính (08:00 - 17:00)", presetBranch: "Hà Nội", presetDept: "Phát triển", presetJob: "Lập trình viên" },
  { id: 2, name: "Ca đêm (22:00 - 06:00)", presetBranch: "Hồ Chí Minh", presetDept: "Vận hành", presetJob: "CSKH" },
];

export const OpenShiftModal = ({ isOpen, onClose, onSuccess }: OpenShiftModalProps) => {
  const [selectedShiftTypeId, setSelectedShiftTypeId] = useState<number | "">("");
  const [selectedShiftType, setSelectedShiftType] = useState<typeof mockShiftTypes[0] | null>(null);
  
  const [tags, setTags] = useState<{ branch: string[]; dept: string[]; job: string[] }>({
    branch: [],
    dept: [],
    job: [],
  });
  const [quantity, setQuantity] = useState<string>("1");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (selectedShiftTypeId) {
      const shift = mockShiftTypes.find(s => s.id === Number(selectedShiftTypeId));
      if (shift) {
        setSelectedShiftType(shift);
        // Pre-fill
        setTags({
          branch: [shift.presetBranch],
          dept: [shift.presetDept],
          job: [shift.presetJob],
        });
      }
    } else {
      setSelectedShiftType(null);
    }
  }, [selectedShiftTypeId]);

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

    setIsSubmitting(true);
    // Giả lập gọi API
    setTimeout(() => {
      setIsSubmitting(false);
      onSuccess();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 transition-opacity">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-xl flex flex-col max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <h2 className="text-lg font-bold text-slate-900">Khởi tạo Ca mở</h2>
          <button onClick={onClose} className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition">
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="overflow-y-auto px-6 py-5 flex flex-col gap-6 shift-scheduling-scrollbar">
          
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">Loại ca mở <span className="text-red-500">*</span></label>
            <div className="relative">
              <span className="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[20px] text-slate-400">schedule</span>
              <select 
                value={selectedShiftTypeId}
                onChange={(e) => setSelectedShiftTypeId(e.target.value === "" ? "" : Number(e.target.value))}
                className="w-full appearance-none rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-10 text-sm font-medium text-slate-700 focus:border-[#134BBA] focus:outline-none focus:ring-1 focus:ring-[#134BBA]"
                required
              >
                <option value="" disabled hidden>Chọn loại ca cần khởi tạo</option>
                {mockShiftTypes.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
              <span className="material-symbols-outlined pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[20px] text-slate-400">expand_more</span>
            </div>
          </div>

          <div className={`flex flex-col gap-5 overflow-hidden transition-all duration-300 ${selectedShiftType ? "max-h-[800px] opacity-100 mt-2" : "max-h-0 opacity-0"}`}>
            
            <div className="rounded-xl border border-[#E5E7EB] bg-slate-50 p-4 space-y-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-[#134BBA]">Đối tượng áp dụng</p>
              
              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-600">Chi nhánh</label>
                <div className="flex min-h-[42px] flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2">
                  {tags.branch.map(tag => (
                    <span key={tag} className="flex items-center gap-1 rounded bg-[#EFF6FF] px-2 py-1 text-[11px] font-semibold text-[#134BBA] border border-[#BFDBFE]">
                      {tag}
                      <button type="button" onClick={() => removeTag("branch", tag)} className="flex items-center justify-center hover:text-red-500">
                        <span className="material-symbols-outlined text-[14px]">close</span>
                      </button>
                    </span>
                  ))}
                  <input type="text" placeholder="Thêm chi nhánh..." className="flex-1 min-w-[120px] bg-transparent text-xs outline-none text-slate-700" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Số lượng người cần <span className="text-red-500">*</span></label>
                <input 
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-900 outline-none transition focus:border-[#134BBA] focus:ring-1 focus:ring-[#134BBA]"
                  required
                />
              </div>
              <div className="flex flex-col justify-end">
                <label className="flex items-center gap-3 py-2.5 cursor-pointer">
                  <div className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" defaultChecked className="sr-only peer" />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#134BBA]"></div>
                  </div>
                  <span className="text-sm font-semibold text-slate-700">Công bố tự động</span>
                </label>
              </div>
            </div>

          </div>
        </form>

        <div className="flex items-center justify-end gap-3 border-t border-slate-100 bg-slate-50 px-6 py-4">
          <button 
            onClick={onClose}
            className="rounded-xl px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-200 transition"
          >
            Hủy
          </button>
          <button 
            onClick={handleSubmit}
            disabled={!selectedShiftType || isSubmitting}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#134BBA] px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-[#0F3F9F] disabled:opacity-50 disabled:cursor-not-allowed min-w-[120px]"
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
