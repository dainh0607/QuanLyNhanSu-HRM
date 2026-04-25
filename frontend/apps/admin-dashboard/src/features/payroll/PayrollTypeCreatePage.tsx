import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "../../hooks/useToast";
import { employeeService } from "../../services/employeeService";
import { payrollService } from "../../services/payrollService";

// Types for Master Data
interface MasterItem {
  id: number;
  name: string;
}

const PAYMENT_TYPES = [
  { id: "ONCE", label: "Chi trả một lần" },
  { id: "HOURLY", label: "Chi trả theo giờ" },
  { id: "MONTHLY", label: "Chi trả theo tháng" },
  { id: "DAILY", label: "Chi trả theo ngày công" }
];

const PayrollTypeCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const { showToast, ToastComponent } = useToast();

  const [activeTab, setActiveTab] = useState<"info" | "formula">("info");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    paymentType: "MONTHLY",
    applicableBranches: [] as number[],
    applicableDepartments: [] as number[],
    applicableJobTitles: [] as number[],
    applicableEmployees: [] as any[], // Objects {id, name, code}
    viewerPermissions: [] as any[], // Objects {id, name, code}
    description: "",
  });

  // Master Data State
  const [branches, setBranches] = useState<MasterItem[]>([]);
  const [departments, setDepartments] = useState<MasterItem[]>([]);
  const [jobTitles, setJobTitles] = useState<MasterItem[]>([]);

  // Modal States
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [isEmployeeModalOpen, setIsEmployeeModalOpen] = useState(false);
  const [employeeModalTarget, setEmployeeModalTarget] = useState<"applicable" | "viewers">("applicable");

  // Load Master Data
  useEffect(() => {
    const loadMasterData = async () => {
      try {
        const [b, d, j] = await Promise.all([
          employeeService.getBranchesMetadata(),
          employeeService.getDepartmentsMetadata(),
          employeeService.getJobTitlesMetadata()
        ]);
        setBranches(b.map(x => ({ id: x.id, name: x.name })));
        setDepartments(d.map(x => ({ id: x.id, name: x.name })));
        setJobTitles(j.map(x => ({ id: x.id, name: x.name })));
      } catch (error) {
        console.error("Failed to load master data", error);
      }
    };
    void loadMasterData();
  }, []);

  // Auto-slugify Code
  const slugify = (text: string) => {
    return text
      .toString()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '_')
      .replace(/[^\w-]+/g, '')
      .replace(/--+/g, '_')
      .toUpperCase();
  };

  useEffect(() => {
    if (formData.name) {
      setFormData(prev => ({ ...prev, code: slugify(prev.name) }));
    }
  }, [formData.name]);

  const handleCreate = async () => {
    if (!formData.name || !formData.code || formData.applicableBranches.length === 0) {
      showToast("Vui lòng điền đầy đủ thông tin bắt buộc (*)", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        name: formData.name,
        code: formData.code,
        paymentType: formData.paymentType,
        applicableBranches: JSON.stringify(formData.applicableBranches),
        applicableDepartments: JSON.stringify(formData.applicableDepartments),
        applicableJobTitles: JSON.stringify(formData.applicableJobTitles),
        applicableEmployees: JSON.stringify(formData.applicableEmployees.map(e => e.id)),
        viewerPermissions: JSON.stringify(formData.viewerPermissions.map(e => e.id)),
        description: formData.description,
      };

      await payrollService.createPayrollType(payload);
      showToast("Tạo loại bảng lương thành công", "success");
      setTimeout(() => navigate("/payroll/types"), 1500);
    } catch (error: any) {
      console.error("Create Payroll Type Error:", error);
      let errorMsg = "Không thể tạo loại bảng lương";
      if (error.response?.data?.errors) {
        const errors = error.response.data.errors;
        const firstErrorKey = Object.keys(errors)[0];
        if (firstErrorKey) {
          errorMsg = Array.isArray(errors[firstErrorKey]) ? errors[firstErrorKey][0] : errors[firstErrorKey];
        }
      } else if (error.response?.data?.message) {
        errorMsg = error.response.data.message;
      } else if (error.message) {
        errorMsg = error.message;
      }
      showToast(errorMsg, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="relative flex h-[calc(100vh-64px)] w-full flex-col overflow-hidden bg-[#f8fafc]">
      {ToastComponent}
      
      <div className="bg-white border-b border-gray-200 px-8 pt-6 shadow-sm z-10">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate("/payroll/types")}
              className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 transition-all"
            >
              <span className="material-symbols-outlined">arrow_back</span>
            </button>
            <div>
              <h1 className="text-xl font-bold text-slate-900">Thiết lập loại bảng lương</h1>
              <div className="flex items-center gap-2 text-[12px] text-slate-400 font-medium mt-0.5 uppercase tracking-wider">
                <span>Cấu hình chuẩn</span>
                <span className="material-symbols-outlined text-[14px]">chevron_right</span>
                <span className="text-[#134BBA] font-bold">Tạo mới</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigate("/payroll/types")}
              className="h-10 px-6 rounded-lg border border-gray-200 text-slate-600 font-bold text-sm hover:bg-slate-50 transition-all"
            >
              Hủy bỏ
            </button>
            <button 
              disabled={isSubmitting}
              onClick={handleCreate}
              className="h-10 px-8 bg-emerald-600 text-white rounded-lg font-bold text-sm shadow-md hover:bg-emerald-700 active:scale-95 transition-all flex items-center gap-2 disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-[20px]">check_circle</span>
              Tạo mới
            </button>
          </div>
        </div>

        <div className="flex gap-8">
          {[
            { id: "info", label: "Thông tin bảng lương", icon: "info" },
            { id: "formula", label: "Công thức bảng lương", icon: "calculate" }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 pb-4 text-sm font-bold transition-all relative ${
                activeTab === tab.id 
                  ? "text-[#134BBA]" 
                  : "text-slate-400 hover:text-slate-600"
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">{tab.icon}</span>
              {tab.label}
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#134BBA] rounded-t-full shadow-[0_-2px_8px_rgba(19,75,186,0.3)]"></div>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-8 py-10 custom-scrollbar">
        {activeTab === "info" ? (
          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10">
            
            <div className="lg:col-span-7 space-y-8">
              <section className="bg-white rounded-3xl border border-gray-200 p-8 shadow-sm">
                <div className="flex items-center gap-4 mb-8 pb-4 border-b border-gray-50">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-[#134BBA]">
                    <span className="material-symbols-outlined text-[28px]">description</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 leading-none">Thông tin cơ bản</h3>
                    <p className="text-[12px] text-slate-400 font-medium mt-1.5">Định danh và hình thức chi trả chính</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-[13px] font-bold text-slate-700 mb-2">Tên bảng lương <span className="text-red-500">*</span></label>
                    <input 
                      type="text"
                      placeholder="VD: Bảng lương nhân viên khối sản xuất"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full h-11 px-4 rounded-xl border border-gray-200 focus:border-[#134BBA] focus:ring-4 focus:ring-blue-50 outline-none transition-all text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-[13px] font-bold text-slate-700 mb-2">Từ khóa đại diện <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <input 
                        type="text"
                        placeholder="VD: LUONG_SAN_XUAT"
                        value={formData.code}
                        onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                        className="w-full h-11 px-4 rounded-xl border border-gray-200 focus:border-[#134BBA] focus:ring-4 focus:ring-blue-50 outline-none transition-all text-sm font-mono"
                      />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded">AUTO</div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[13px] font-bold text-slate-700 mb-2">Hình thức chi trả <span className="text-red-500">*</span></label>
                    <select 
                      value={formData.paymentType}
                      onChange={(e) => setFormData(prev => ({ ...prev, paymentType: e.target.value }))}
                      className="w-full h-11 px-4 rounded-xl border border-gray-200 focus:border-[#134BBA] focus:ring-4 focus:ring-blue-50 outline-none transition-all text-sm bg-slate-50/50 appearance-none"
                    >
                      {PAYMENT_TYPES.map(type => (
                        <option key={type.id} value={type.id}>{type.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[13px] font-bold text-slate-700 mb-2">Mô tả bảng lương</label>
                    <textarea 
                      placeholder="Nhập mô tả chi tiết về loại bảng lương này..."
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full h-32 p-4 rounded-xl border border-gray-200 focus:border-[#134BBA] focus:ring-4 focus:ring-blue-50 outline-none transition-all text-sm resize-none"
                    ></textarea>
                  </div>
                </div>
              </section>

              <section className="bg-white rounded-3xl border border-gray-200 p-8 shadow-sm">
                <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-50">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-purple-50 flex items-center justify-center text-purple-600">
                      <span className="material-symbols-outlined text-[28px]">admin_panel_settings</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 leading-none">Phân quyền hiển thị</h3>
                      <p className="text-[12px] text-slate-400 font-medium mt-1.5">Giới hạn nhân sự có quyền truy xuất</p>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-[13px] font-bold text-slate-700 mb-2">Nhân viên có quyền xem bảng lương</label>
                  <div 
                    onClick={() => {
                      setEmployeeModalTarget("viewers");
                      setIsEmployeeModalOpen(true);
                    }}
                    className="w-full min-h-[44px] p-2 rounded-xl border border-gray-200 hover:border-[#134BBA] cursor-pointer transition-all bg-slate-50/50 flex flex-wrap gap-2 items-center"
                  >
                    {formData.viewerPermissions.length === 0 ? (
                      <span className="text-sm text-slate-400 px-2 italic">Chưa chỉ định nhân viên nào...</span>
                    ) : (
                      formData.viewerPermissions.map(emp => (
                        <div key={emp.id} className="flex items-center gap-1 bg-white border border-blue-100 px-2 py-1 rounded-lg shadow-sm">
                          <span className="text-[12px] font-bold text-[#134BBA]">{emp.name}</span>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              setFormData(prev => ({ ...prev, viewerPermissions: prev.viewerPermissions.filter(x => x.id !== emp.id) }));
                            }}
                            className="text-slate-400 hover:text-red-500 flex items-center"
                          >
                            <span className="material-symbols-outlined text-[16px]">close</span>
                          </button>
                        </div>
                      ))
                    )}
                    <div className="ml-auto pr-2">
                      <span className="material-symbols-outlined text-slate-300">person_add</span>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-2 ml-1 font-medium italic">* Những người này có quyền xem và truy xuất dữ liệu từ bảng lương này.</p>
                </div>
              </section>
            </div>

            <div className="lg:col-span-5 space-y-8">
              <section className="bg-white rounded-3xl border border-gray-200 p-8 shadow-sm h-full">
                <div className="flex items-center gap-4 mb-8 pb-4 border-b border-gray-50">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                    <span className="material-symbols-outlined text-[28px]">track_changes</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 leading-none">Đối tượng áp dụng</h3>
                    <p className="text-[12px] text-slate-400 font-medium mt-1.5">Xác định phạm vi bảng lương</p>
                  </div>
                </div>

                <div className="space-y-8">
                  <div>
                    <label className="block text-[13px] font-bold text-slate-700 mb-3">Chi nhánh áp dụng <span className="text-red-500">*</span></label>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {formData.applicableBranches.map(id => {
                        const branch = branches.find(b => b.id === id);
                        return (
                          <div key={id} className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-100 px-3 py-1.5 rounded-xl shadow-sm">
                            <span className="text-[12px] font-bold text-emerald-700">{branch?.name}</span>
                            <button 
                              onClick={() => setFormData(prev => ({ ...prev, applicableBranches: prev.applicableBranches.filter(x => x !== id) }))}
                              className="text-emerald-400 hover:text-red-500"
                            >
                              <span className="material-symbols-outlined text-[18px]">cancel</span>
                            </button>
                          </div>
                        );
                      })}
                    </div>
                    <select 
                      onChange={(e) => {
                        const val = parseInt(e.target.value);
                        if (val && !formData.applicableBranches.includes(val)) {
                          setFormData(prev => ({ ...prev, applicableBranches: [...prev.applicableBranches, val] }));
                        }
                        e.target.value = "";
                      }}
                      className="w-full h-11 px-4 rounded-xl border border-gray-200 focus:border-[#134BBA] outline-none text-sm bg-slate-50/50"
                    >
                      <option value="">+ Chọn chi nhánh...</option>
                      {branches.filter(b => !formData.applicableBranches.includes(b.id)).map(b => (
                        <option key={b.id} value={b.id}>{b.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[13px] font-bold text-slate-700 mb-4 flex items-center justify-between">
                      <span>Giới hạn theo Phòng ban</span>
                      <button 
                        onClick={() => {
                          if (formData.applicableDepartments.length === departments.length) setFormData(prev => ({ ...prev, applicableDepartments: [] }));
                          else setFormData(prev => ({ ...prev, applicableDepartments: departments.map(d => d.id) }));
                        }}
                        className="text-[11px] text-[#134BBA] hover:underline font-bold"
                      >
                        {formData.applicableDepartments.length === departments.length ? "Bỏ chọn hết" : "Chọn tất cả"}
                      </button>
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[200px] overflow-y-auto p-4 rounded-2xl border border-gray-100 bg-slate-50/30 custom-scrollbar">
                      {departments.map(d => (
                        <label key={d.id} className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer group ${
                          formData.applicableDepartments.includes(d.id) 
                            ? "bg-blue-50 border-blue-200" 
                            : "bg-white border-gray-100 hover:bg-slate-50"
                        }`}>
                          <input 
                            type="checkbox"
                            checked={formData.applicableDepartments.includes(d.id)}
                            onChange={() => {
                              setFormData(prev => ({
                                ...prev,
                                applicableDepartments: prev.applicableDepartments.includes(d.id)
                                  ? prev.applicableDepartments.filter(id => id !== d.id)
                                  : [...prev.applicableDepartments, d.id]
                              }));
                            }}
                            className="w-5 h-5 rounded-md border-2 border-slate-300 text-[#134BBA]"
                          />
                          <span className={`text-[13px] font-bold ${formData.applicableDepartments.includes(d.id) ? "text-[#134BBA]" : "text-slate-600"}`}>{d.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[13px] font-bold text-slate-700 mb-4 flex items-center justify-between">
                      <span>Giới hạn theo Vị trí công việc</span>
                      <button 
                        onClick={() => {
                          if (formData.applicableJobTitles.length === jobTitles.length) setFormData(prev => ({ ...prev, applicableJobTitles: [] }));
                          else setFormData(prev => ({ ...prev, applicableJobTitles: jobTitles.map(j => j.id) }));
                        }}
                        className="text-[11px] text-[#134BBA] hover:underline font-bold"
                      >
                        {formData.applicableJobTitles.length === jobTitles.length ? "Bỏ chọn hết" : "Chọn tất cả"}
                      </button>
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[200px] overflow-y-auto p-4 rounded-2xl border border-gray-100 bg-slate-50/30 custom-scrollbar">
                      {jobTitles.map(j => (
                        <label key={j.id} className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer group ${
                          formData.applicableJobTitles.includes(j.id) 
                            ? "bg-blue-50 border-blue-200" 
                            : "bg-white border-gray-100 hover:bg-slate-50"
                        }`}>
                          <input 
                            type="checkbox"
                            checked={formData.applicableJobTitles.includes(j.id)}
                            onChange={() => {
                              setFormData(prev => ({
                                ...prev,
                                applicableJobTitles: prev.applicableJobTitles.includes(j.id)
                                  ? prev.applicableJobTitles.filter(id => id !== j.id)
                                  : [...prev.applicableJobTitles, j.id]
                              }));
                            }}
                            className="w-5 h-5 rounded-md border-2 border-slate-300 text-[#134BBA]"
                          />
                          <span className={`text-[13px] font-bold ${formData.applicableJobTitles.includes(j.id) ? "text-[#134BBA]" : "text-slate-600"}`}>{j.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-100">
                    <label className="block text-[13px] font-bold text-slate-700 mb-2">Chỉ định theo Nhân viên cụ thể</label>
                    <div 
                      onClick={() => {
                        setEmployeeModalTarget("applicable");
                        setIsEmployeeModalOpen(true);
                      }}
                      className="w-full min-h-[44px] p-2 rounded-xl border border-gray-200 hover:border-[#134BBA] cursor-pointer transition-all bg-slate-50/50 flex flex-wrap gap-2 items-center"
                    >
                      {formData.applicableEmployees.length === 0 ? (
                        <span className="text-sm text-slate-400 px-2 italic">Click để chọn nhân viên...</span>
                      ) : (
                        formData.applicableEmployees.map(emp => (
                          <div key={emp.id} className="flex items-center gap-1 bg-white border border-gray-200 px-2 py-1 rounded-lg">
                            <span className="text-[12px] font-bold text-slate-700">{emp.name}</span>
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                setFormData(prev => ({ ...prev, applicableEmployees: prev.applicableEmployees.filter(x => x.id !== emp.id) }));
                              }}
                              className="text-slate-400 hover:text-red-500"
                            >
                              <span className="material-symbols-outlined text-[16px]">close</span>
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                    <button 
                      disabled={formData.applicableBranches.length === 0}
                      onClick={() => setIsBulkModalOpen(true)}
                      className="mt-3 text-[#134BBA] text-[13px] font-bold hover:underline underline-offset-4 flex items-center gap-1.5 disabled:opacity-30"
                    >
                      <span className="material-symbols-outlined text-[18px]">bolt</span>
                      Chọn nhanh Nhân viên (Bulk Paste)
                    </button>
                  </div>
                </div>
              </section>
            </div>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto h-[400px] flex flex-col items-center justify-center bg-white rounded-3xl border-2 border-dashed border-slate-200">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
              <span className="material-symbols-outlined text-4xl text-slate-300">construction</span>
            </div>
            <h3 className="text-xl font-bold text-slate-900">Tính năng đang phát triển</h3>
            <p className="text-slate-500 mt-2">Cấu hình công thức sẽ được cập nhật trong phiên bản tiếp theo.</p>
          </div>
        )}
      </div>

      {isBulkModalOpen && (
        <EmployeeBulkSelectModal 
          branchIds={formData.applicableBranches}
          onClose={() => setIsBulkModalOpen(false)}
          onSuccess={(employees) => {
            setFormData(prev => {
              const existingIds = prev.applicableEmployees.map(e => e.id);
              const newEmployees = employees.filter(e => !existingIds.includes(e.id));
              return { ...prev, applicableEmployees: [...prev.applicableEmployees, ...newEmployees] };
            });
            setIsBulkModalOpen(false);
          }}
        />
      )}

      {isEmployeeModalOpen && (
        <EmployeeSelectionModal 
          onClose={() => setIsEmployeeModalOpen(false)}
          onConfirm={(selected) => {
            if (employeeModalTarget === "applicable") {
              setFormData(prev => ({ ...prev, applicableEmployees: selected }));
            } else {
              setFormData(prev => ({ ...prev, viewerPermissions: selected }));
            }
            setIsEmployeeModalOpen(false);
          }}
          initialSelected={employeeModalTarget === "applicable" ? formData.applicableEmployees : formData.viewerPermissions}
        />
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
      `}} />
    </main>
  );
};

interface ModalProps {
  onClose: () => void;
}

const EmployeeBulkSelectModal: React.FC<ModalProps & { branchIds: number[], onSuccess: (emps: any[]) => void }> = ({ onClose, branchIds, onSuccess }) => {
  const [rawText, setRawText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  
  const handleProcess = async () => {
    if (!rawText.trim()) return;
    setIsProcessing(true);
    try {
      const results = await employeeService.bulkParseEmployees(rawText, branchIds);
      onSuccess(results.map(r => ({ id: r.id, name: r.fullName, code: r.employeeCode })));
    } catch (error) {
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
        <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-900">Nhập danh sách nhân viên</h3>
          <button onClick={onClose} className="w-10 h-10 rounded-full hover:bg-slate-50 flex items-center justify-center text-slate-400">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <div className="p-8">
          <textarea 
            className="w-full h-64 p-5 rounded-2xl border border-gray-200 focus:border-[#134BBA] outline-none text-sm font-mono"
            placeholder="Dán danh sách mã nhân viên hoặc tên nhân viên vào đây..."
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
          />
        </div>
        <div className="px-8 py-6 bg-slate-50 border-t border-gray-100 flex justify-end gap-3">
          <button onClick={onClose} className="px-6 py-2.5 rounded-xl font-bold text-slate-600 hover:bg-white transition-all">Hủy</button>
          <button 
            disabled={isProcessing || !rawText.trim()}
            onClick={handleProcess}
            className="px-10 py-2.5 bg-[#134BBA] text-white rounded-xl font-bold shadow-md hover:bg-[#0e378c] transition-all flex items-center gap-2"
          >
            {isProcessing ? "Đang xử lý..." : "Xác nhận"}
          </button>
        </div>
      </div>
    </div>
  );
};

const EmployeeSelectionModal: React.FC<ModalProps & { onConfirm: (selected: any[]) => void, initialSelected: any[] }> = ({ onClose, onConfirm, initialSelected }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [employees, setEmployees] = useState<any[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>(initialSelected.map(e => e.id));
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchEmps = async () => {
      setIsLoading(true);
      try {
        const results = await employeeService.getEmployees(1, 200, searchTerm);
        setEmployees(results.items);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    const timer = setTimeout(fetchEmps, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const toggleSelect = (emp: any) => {
    setSelectedIds(prev => prev.includes(emp.id) ? prev.filter(id => id !== emp.id) : [...prev, emp.id]);
  };

  const handleConfirm = () => {
    const allKnownEmps = [...employees, ...initialSelected];
    const uniqueSelected = selectedIds.map(id => {
      const found = allKnownEmps.find(e => e.id === id);
      return found ? { id: found.id, name: found.fullName || found.name, code: found.employeeCode || found.code } : null;
    }).filter(Boolean);
    onConfirm(uniqueSelected);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl flex flex-col max-h-[90vh] animate-in fade-in zoom-in duration-300">
        <div className="px-8 py-6 border-b border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-slate-900">Chọn nhân viên</h3>
            <button onClick={onClose} className="w-10 h-10 rounded-full hover:bg-slate-50 flex items-center justify-center text-slate-400">
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
          <input 
            type="text"
            className="w-full h-11 px-4 rounded-xl border border-gray-200 focus:border-[#134BBA] outline-none text-sm bg-slate-50/50"
            placeholder="Tìm kiếm theo tên hoặc mã nhân viên..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex-1 overflow-y-auto px-8 py-4 custom-scrollbar space-y-2">
          {isLoading ? (
            <div className="flex justify-center py-20 text-slate-400">Đang tải...</div>
          ) : employees.length === 0 ? (
            <div className="text-center py-20 text-slate-400 italic">Không tìm thấy nhân viên</div>
          ) : (
            employees.map(emp => (
              <div 
                key={emp.id}
                onClick={() => toggleSelect(emp)}
                className={`flex items-center justify-between p-3 rounded-2xl border transition-all cursor-pointer ${
                  selectedIds.includes(emp.id) ? "bg-blue-50 border-blue-200" : "bg-white border-gray-100 hover:border-blue-200"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600">
                    {emp.fullName?.charAt(0)}
                  </div>
                  <div>
                    <div className="text-[13px] font-bold text-slate-900">{emp.fullName}</div>
                    <div className="text-[11px] text-slate-400">{emp.employeeCode}</div>
                  </div>
                </div>
                <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
                  selectedIds.includes(emp.id) ? "bg-[#134BBA] border-[#134BBA]" : "border-slate-200"
                }`}>
                  {selectedIds.includes(emp.id) && <span className="material-symbols-outlined text-white text-[16px]">check</span>}
                </div>
              </div>
            ))
          )}
        </div>
        <div className="px-8 py-6 border-t border-gray-100 flex justify-between items-center bg-slate-50/50">
          <div className="text-[13px] font-bold text-slate-700">Đã chọn {selectedIds.length} người</div>
          <div className="flex gap-3">
            <button onClick={onClose} className="px-6 py-2.5 rounded-xl font-bold text-slate-600 hover:bg-white transition-all text-sm">Hủy</button>
            <button onClick={handleConfirm} className="px-10 py-2.5 bg-[#134BBA] text-white rounded-xl font-bold text-sm shadow-md hover:bg-[#0e378c] transition-all">Xác nhận</button>
          </div>
        </div>
      </div>
      <style dangerouslySetInnerHTML={{ __html: `@keyframes modalIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }` }} />
    </div>
  );
};

export default PayrollTypeCreatePage;
