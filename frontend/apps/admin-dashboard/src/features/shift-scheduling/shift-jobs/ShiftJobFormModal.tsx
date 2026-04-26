import React, { useEffect, useState } from "react";
import {
  shiftJobsService,
  type ShiftJob,
  type MatchedEmployee,
} from "../services/shiftJobsService";
import {
  metadataService,
  type Branch,
  type Department,
} from "../../../services/metadataService";
import { employeeService } from "../../../services/employeeService";
import { useToast } from "../../../hooks/useToast";
import EmployeeBulkSelectionWizard from "./EmployeeBulkSelectionWizard.tsx";
import SearchableMultiSelect from "../shift-template/SearchableMultiSelect.tsx";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialData?: ShiftJob | null;
}

const ShiftJobFormModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onSuccess,
  initialData,
}) => {
  const [formData, setFormData] = useState<Omit<ShiftJob, "id">>({
    name: "",
    code: "",
    branch_id: 0,
    color_code: "#134BBA",
    is_active: true,
    description: "",
    department_ids: [],
    employee_ids: [],
  });

  const [branches, setBranches] = useState<Branch[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const { showToast, ToastComponent } = useToast();

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name,
        code: initialData.code,
        branch_id: initialData.branch_id,
        color_code: initialData.color_code || "#134BBA",
        is_active: initialData.is_active,
        description: initialData.description || "",
        department_ids: initialData.department_ids || [],
        employee_ids: initialData.employee_ids || [],
      });
      fetchDepartmentsAndEmployees(initialData.branch_id);
    }
    fetchMetadata();
  }, [initialData]);

  const fetchMetadata = async () => {
    try {
      const b = await metadataService.getBranches();
      setBranches(b);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchDepartmentsAndEmployees = async (branchId: number) => {
    try {
      const [depts, emps] = await Promise.all([
        metadataService.getDepartments(branchId),
        employeeService.getEmployees(1, 1000, "", "active", { branchId }),
      ]);
      setDepartments(depts);
      setEmployees(emps.items);
    } catch (e) {
      console.error(e);
    }
  };

  const handleBranchChange = (branchId: number) => {
    setFormData((prev) => ({
      ...prev,
      branch_id: branchId,
      department_ids: [],
      employee_ids: [],
    }));
    if (branchId > 0) {
      fetchDepartmentsAndEmployees(branchId);
    } else {
      setDepartments([]);
      setEmployees([]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.code || !formData.branch_id) {
      showToast("Vui lòng điền đầy đủ các thông tin bắt buộc", "warning");
      return;
    }

    setLoading(true);
    try {
      if (initialData) {
        await shiftJobsService.update(initialData.id, formData);
        showToast("Cập nhật công việc thành công", "success");
      } else {
        await shiftJobsService.create(formData);
        showToast("Tạo mới công việc thành công", "success");
      }
      onSuccess();
    } catch (err) {
      showToast("Lỗi khi lưu dữ liệu", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleWizardComplete = (matched: MatchedEmployee[]) => {
    const newIds = matched.map((m) => m.id);
    const combined = Array.from(new Set([...formData.employee_ids, ...newIds]));
    setFormData((prev) => ({ ...prev, employee_ids: combined }));
    showToast(`Đã thêm ${matched.length} nhân viên vào danh sách`, "success");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center p-4 sm:p-8 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300 overflow-y-auto">
      <div className="bg-white w-full max-w-3xl rounded-[32px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 my-auto flex flex-col shrink-0">
        <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/50 shrink-0">
          <div>
            <h3 className="text-2xl font-black text-slate-900">
              {initialData ? "Cập nhật" : "Tạo mới"} Công việc
            </h3>
            <p className="text-slate-500 text-sm font-medium">
              Thiết lập thông tin cơ bản và phạm vi phân công.
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-12 h-12 rounded-full hover:bg-white flex items-center justify-center transition-colors shadow-sm border border-slate-100"
          >
            <span className="material-symbols-outlined text-slate-400">
              close
            </span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="overflow-y-auto p-8 space-y-8">
          <div className="grid grid-cols-2 gap-8">
            {/* Column 1: Basic Info */}
            <div className="space-y-6">
              <h4 className="text-[11px] font-black uppercase tracking-widest text-[#134BBA] flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#134BBA]"></span>
                Thông tin cơ bản
              </h4>

              <div className="space-y-2">
                <label className="text-sm font-black text-slate-700">
                  Tên công việc <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  placeholder="VD: Thu ngân, Pha chế..."
                  className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 text-slate-800 font-bold placeholder:text-slate-300 focus:ring-2 focus:ring-[#134BBA]/20 transition-all outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-black text-slate-700">
                    Mã <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        code: e.target.value.toUpperCase(),
                      }))
                    }
                    placeholder="VD: TN"
                    className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 text-slate-800 font-bold placeholder:text-slate-300 focus:ring-2 focus:ring-[#134BBA]/20 transition-all outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-black text-slate-700">
                    Màu sắc
                  </label>
                  <div className="flex gap-2 p-1 bg-slate-50 rounded-2xl items-center h-[56px] px-3">
                    <input
                      type="color"
                      value={formData.color_code}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          color_code: e.target.value,
                        }))
                      }
                      className="w-10 h-10 rounded-xl border-none p-0 overflow-hidden cursor-pointer bg-transparent"
                    />
                    <span className="text-sm font-bold text-slate-500 uppercase">
                      {formData.color_code}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-black text-slate-700">
                  Chi nhánh áp dụng <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formData.branch_id}
                  onChange={(e) => handleBranchChange(Number(e.target.value))}
                  className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 text-slate-800 font-bold focus:ring-2 focus:ring-[#134BBA]/20 transition-all outline-none appearance-none"
                >
                  <option value={0}>Chọn chi nhánh</option>
                  {branches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-between p-5 bg-slate-50 rounded-2xl">
                <div>
                  <p className="text-sm font-black text-slate-800">
                    Trạng thái hoạt động
                  </p>
                  <p className="text-[11px] font-bold text-slate-400">
                    Cho phép gán công việc này khi xếp ca
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        is_active: e.target.checked,
                      }))
                    }
                    className="sr-only peer"
                  />
                  <div className="w-12 h-7 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-[20px] after:w-[20px] after:transition-all peer-checked:bg-[#134BBA]"></div>
                </label>
              </div>
            </div>

            {/* Column 2: Assignment Scope */}
            <div className="space-y-6">
              <h4 className="text-[11px] font-black uppercase tracking-widest text-emerald-600 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                Giới hạn phân công
              </h4>

              <div className="space-y-2">
                <SearchableMultiSelect
                  label="Theo Phòng ban"
                  placeholder="Chọn phòng ban..."
                  options={departments.map(d => ({ value: d.id.toString(), label: d.name }))}
                  selectedValues={formData.department_ids.map(id => id.toString())}
                  onChange={(values) => setFormData(prev => ({ 
                    ...prev, 
                    department_ids: values.map(v => parseInt(v)) 
                  }))}
                  disabled={!formData.branch_id}
                  helperText={!formData.branch_id ? "Chọn chi nhánh để xem danh sách phòng ban" : ""}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-sm font-semibold text-slate-700">
                    Cụ thể Nhân viên
                  </label>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        const allIds = employees.map(e => e.id);
                        setFormData(prev => ({ ...prev, employee_ids: allIds }));
                        showToast(`Đã chọn tất cả ${allIds.length} nhân viên`, "info");
                      }}
                      disabled={!formData.branch_id || employees.length === 0}
                      className="text-[11px] font-black text-emerald-600 hover:underline flex items-center gap-1 disabled:opacity-30 disabled:no-underline"
                    >
                      <span className="material-symbols-outlined text-[14px]">done_all</span>
                      Chọn tất cả
                    </button>
                    <div className="w-px h-3 bg-slate-200"></div>
                    <button
                      type="button"
                      onClick={() => setIsWizardOpen(true)}
                      className="text-[11px] font-black text-[#134BBA] hover:underline flex items-center gap-1"
                    >
                      <span className="material-symbols-outlined text-[14px]">auto_fix</span>
                      Chọn nhanh
                    </button>
                  </div>
                </div>
                <SearchableMultiSelect
                  label=""
                  placeholder="Chọn nhân viên..."
                  options={employees.map(e => ({ 
                    value: e.id.toString(), 
                    label: `${e.fullName} (${e.employeeCode})` 
                  }))}
                  selectedValues={formData.employee_ids.map(id => id.toString())}
                  onChange={(values) => setFormData(prev => ({ 
                    ...prev, 
                    employee_ids: values.map(v => parseInt(v)) 
                  }))}
                  disabled={!formData.branch_id}
                  helperText={!formData.branch_id ? "Chọn chi nhánh để xem danh sách nhân viên" : ""}
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-black text-slate-700">
              Mô tả chi tiết
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              placeholder="Ghi chú thêm về vai trò này..."
              className="w-full bg-slate-50 border-none rounded-2xl p-5 text-slate-800 font-bold placeholder:text-slate-300 focus:ring-2 focus:ring-[#134BBA]/20 transition-all resize-none outline-none min-h-24"
            />
          </div>
        </form>

        <div className="p-8 border-t border-slate-50 flex gap-4 bg-slate-50/30 shrink-0">
          <button
            onClick={onClose}
            className="flex-1 px-8 py-4 rounded-[24px] font-black text-slate-500 bg-white border border-slate-200 hover:bg-slate-50 transition-all active:scale-95"
          >
            Hủy bỏ
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-[2] bg-[#134BBA] hover:bg-[#134BBA]/90 text-white px-8 py-4 rounded-[24px] font-black transition-all shadow-xl shadow-blue-200 disabled:opacity-50 disabled:shadow-none flex items-center justify-center gap-2 active:scale-95"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <span className="material-symbols-outlined text-[20px]">
                  save
                </span>
                <span>
                  {initialData ? "Cập nhật thay đổi" : "Lưu Công việc"}
                </span>
              </>
            )}
          </button>
        </div>
      </div>

      {isWizardOpen && (
        <EmployeeBulkSelectionWizard
          isOpen={isWizardOpen}
          onClose={() => setIsWizardOpen(false)}
          onSelectionComplete={handleWizardComplete}
        />
      )}
      {ToastComponent}
    </div>
  );
};

export default ShiftJobFormModal;
