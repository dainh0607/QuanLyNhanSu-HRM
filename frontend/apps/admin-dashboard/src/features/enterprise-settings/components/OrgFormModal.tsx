import React, { useState, useEffect } from "react";
import { type Region, type Branch } from "../../../services/orgService";
import AddressCascader from "./AddressCascader";

interface OrgFormModalProps {
  type: "region" | "branch" | "department" | "jobTitle";
  initialData?: any;
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  regions?: Region[];
  branches?: Branch[];
  departments?: any[];
  jobTitles?: any[];
}

const OrgFormModal: React.FC<OrgFormModalProps> = ({
  type,
  initialData,
  isOpen,
  onClose,
  onSave,
  regions = [],
  branches = [],
  departments = [],
  jobTitles = []
}) => {
  const [formData, setFormData] = useState<any>({
    code: "",
    name: "",
    note: "",
    regionId: undefined,
    parentId: undefined,
    branchId: undefined,
    isTopLevel: false,
    address: "",
    countryCode: "VN",
    provinceCode: "",
    districtCode: "",
    phone: "",
    color: "#134BBA",
    displayOrder: 0
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        displayOrder: initialData.displayOrder ?? 0,
        color: initialData.color ?? "#134BBA",
        countryCode: initialData.countryCode ?? "VN",
        isTopLevel: initialData.isTopLevel ?? false,
        qualification: initialData.qualification ?? "Đại học"
      });
    } else {
      setFormData({
        code: "",
        name: "",
        note: "",
        regionId: regions.length > 0 ? regions[0].id : undefined,
        parentId: undefined,
        branchId: branches.length > 0 ? branches[0].id : undefined,
        departmentId: undefined,
        qualification: "Đại học",
        experience: "",
        isTopLevel: false,
        address: "",
        countryCode: "VN",
        provinceCode: "",
        districtCode: "",
        phone: "",
        color: "#134BBA",
        displayOrder: 0
      });
    }
    setErrors({});
  }, [initialData, isOpen, regions, branches]);

  if (!isOpen) return null;

  // Logic: Prevent Circular Reference
  const getForbiddenIds = (targetId: number, allBranches: Branch[]): number[] => {
    const ids: number[] = [targetId];
    const findChildren = (pid: number) => {
      const children = allBranches.filter(b => b.parentId === pid);
      children.forEach(c => {
        ids.push(c.id);
        findChildren(c.id);
      });
    };
    findChildren(targetId);
    return ids;
  };

  const availableParentBranches = type === "branch" && initialData
    ? branches.filter(b => !getForbiddenIds(initialData.id, branches).includes(b.id))
    : branches;

  const getDeptForbiddenIds = (targetId: number, allDepts: any[]): number[] => {
    const ids: number[] = [targetId];
    const findChildren = (pid: number) => {
      const children = allDepts.filter(d => d.parentId === pid);
      children.forEach(c => {
        ids.push(c.id);
        findChildren(c.id);
      });
    };
    findChildren(targetId);
    return ids;
  };

  const availableParentDepts = type === "department" && initialData
    ? departments.filter(d => !getDeptForbiddenIds(initialData.id, departments).includes(d.id))
    : departments;

  const getJobTitleForbiddenIds = (targetId: number, allJobTitles: any[]): number[] => {
    const ids: number[] = [targetId];
    const findChildren = (pid: number) => {
      const children = allJobTitles.filter(j => j.parentId === pid);
      children.forEach(c => {
        ids.push(c.id);
        findChildren(c.id);
      });
    };
    findChildren(targetId);
    return ids;
  };

  const availableParentJobTitles = type === "jobTitle" && initialData
    ? jobTitles.filter(jt => !getJobTitleForbiddenIds(initialData.id, jobTitles).includes(jt.id))
    : jobTitles;

  const filteredDepts = formData.branchId 
    ? departments.filter(d => d.branchId === formData.branchId)
    : departments;

  const QUALIFICATIONS = ["Không yêu cầu", "Tốt nghiệp cấp PTCS", "Tốt nghiệp cấp PTTH", "Trung cấp", "Cao đẳng", "Đại học", "Thạc sĩ", "Tiến sĩ"];

  const handleInputChange = (field: string, value: any) => {
    if (field === "isTopLevel" && value === true) {
      setFormData({ ...formData, [field]: value, parentId: undefined });
    } else {
      setFormData({ ...formData, [field]: value });
    }
    if (errors[field]) {
      setErrors({ ...errors, [field]: "" });
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name) newErrors.name = "Tên là bắt buộc";
    if (!formData.code) newErrors.code = "Mã là bắt buộc";
    
    if (type === "branch" && !formData.regionId) newErrors.regionId = "Vùng là bắt buộc";
    if (type === "department" && !formData.branchId) newErrors.branchId = "Chi nhánh là bắt buộc";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSave(formData);
    }
  };

  const SectionTitle = ({ icon, title }: { icon: string, title: string }) => (
    <div className="flex items-center gap-2 mb-4 mt-2">
      <span className="material-symbols-outlined text-[20px] text-emerald-600">{icon}</span>
      <h4 className="text-[11px] font-black uppercase tracking-widest text-slate-400">{title}</h4>
      <div className="h-px flex-1 bg-slate-100 ml-2" />
    </div>
  );

  const labelClassName = "block text-[13px] font-bold text-slate-600 mb-1.5 ml-1";
  const inputClassName = "w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition-all focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-50 placeholder:text-slate-300 disabled:bg-slate-50";
  const selectClassName = "w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 transition-all focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-50 appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D'http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg'%20viewBox%3D'0%200%2020%2020'%20fill%3D'none'%3E%3Cpath%20d%3D'M5%207l5%205%205-5'%20stroke%3D'%2394a3b8'%20stroke-width%3D'2'%20stroke-linecap%3D'round'%20stroke-linejoin%3D'round'%2F%3E%3C%2Fsvg%3E')] bg-[length:1.25rem_1.25rem] bg-[right_1rem_center] bg-no-repeat";

  return (
    <div className="fixed inset-0 z-[2000] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className={`bg-white w-full ${type === 'branch' ? 'max-w-2xl' : 'max-w-lg'} rounded-[32px] shadow-2xl overflow-hidden animate-[modalSlideUp_0.3s_ease-out] flex flex-col max-h-[90vh]`}>
        {/* Modal Header */}
        <header className="h-16 border-b border-slate-50 flex items-center justify-between px-8 bg-white shrink-0">
          <h3 className="text-lg font-black text-slate-800 tracking-tight uppercase">
            {initialData ? 'Chỉnh sửa' : 'Tạo mới'} {type === 'region' ? 'vùng' : type === 'branch' ? 'chi nhánh' : type === 'department' ? 'phòng ban' : 'chức danh'}
          </h3>
          <button onClick={onClose} className="w-10 h-10 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-100 transition-all">
            <span className="material-symbols-outlined text-[24px]">close</span>
          </button>
        </header>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
          {/* Section 1: Core Info */}
          <div>
            <SectionTitle icon="corporate_fare" title="Thông tin cơ cấu" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className={labelClassName}>
                  {type === 'jobTitle' ? 'Tên chức danh' : type === 'department' ? 'Tên phòng ban' : type === 'branch' ? 'Tên chi nhánh' : 'Tên vùng'} 
                  <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  className={`${inputClassName} ${errors.name ? 'border-rose-300 bg-rose-50' : ''}`}
                  placeholder="Nhập tên chính thức..."
                />
                {errors.name && <p className="text-[11px] font-bold text-rose-500 ml-1">{errors.name}</p>}
              </div>

              <div className="space-y-1">
                <label className={labelClassName}>
                  {type === 'jobTitle' ? 'Mã chức danh' : type === 'department' ? 'Mã phòng ban' : type === 'branch' ? 'Mã chi nhánh' : 'Mã vùng'} 
                  <span className="text-rose-500">*</span>
                </label>
                <div className="relative group">
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => handleInputChange("code", e.target.value.toUpperCase())}
                    className={`${inputClassName} font-mono ${errors.code ? 'border-rose-300 bg-rose-50' : ''}`}
                    placeholder="MÃ DUY NHẤT..."
                  />
                  <div className="absolute right-3 top-3.5 flex items-center gap-1">
                    <span className="material-symbols-outlined text-slate-300 text-[18px] cursor-help peer">info</span>
                    <div className="absolute bottom-full right-0 mb-2 w-48 p-2 bg-slate-800 text-white text-[10px] rounded-lg opacity-0 peer-hover:opacity-100 transition-opacity pointer-events-none z-10 shadow-xl">
                      Mã định danh duy nhất dùng để gán dữ liệu chấm công, tính lương và phân quyền.
                    </div>
                  </div>
                </div>
                {errors.code && <p className="text-[11px] font-bold text-rose-500 ml-1">{errors.code}</p>}
              </div>

              {type === "branch" && (
                <>
                  <div className="space-y-1">
                    <label className={labelClassName}>Vùng trực thuộc <span className="text-rose-500">*</span></label>
                    <select
                      value={formData.regionId}
                      onChange={(e) => handleInputChange("regionId", Number(e.target.value))}
                      className={`${selectClassName} ${errors.regionId ? 'border-rose-300' : ''}`}
                    >
                      <option value="">-- Chọn vùng --</option>
                      {regions.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className={labelClassName}>Trực thuộc chi nhánh</label>
                    <select
                      value={formData.parentId}
                      onChange={(e) => handleInputChange("parentId", e.target.value ? Number(e.target.value) : undefined)}
                      className={selectClassName}
                    >
                      <option value="">Cấp cao nhất (Gốc)</option>
                      {availableParentBranches.map(b => (
                        <option key={b.id} value={b.id}>{b.name}</option>
                      ))}
                    </select>
                  </div>
                </>
              )}

              {type === "department" && (
                <div className="md:col-span-2 space-y-6">
                  <div className="space-y-1">
                    <label className={labelClassName}>Chi nhánh trực thuộc <span className="text-rose-500">*</span></label>
                    <select
                      value={formData.branchId}
                      onChange={(e) => handleInputChange("branchId", Number(e.target.value))}
                      className={`${selectClassName} ${errors.branchId ? 'border-rose-300' : ''}`}
                    >
                      <option value="">-- Chọn chi nhánh --</option>
                      {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                    </select>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-emerald-600">vertical_align_top</span>
                      <div>
                        <p className="text-[13px] font-bold text-slate-700">Phòng ban đứng đầu (Root)</p>
                        <p className="text-[11px] text-slate-400 font-medium">Bật nếu đây là bộ phận cao nhất của công ty</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleInputChange("isTopLevel", !formData.isTopLevel)}
                      className={`w-12 h-6 rounded-full p-1 transition-all duration-300 ${formData.isTopLevel ? 'bg-emerald-500' : 'bg-slate-300'}`}
                    >
                      <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-all duration-300 ${formData.isTopLevel ? 'translate-x-6' : 'translate-x-0'}`} />
                    </button>
                  </div>

                  {!formData.isTopLevel && (
                    <div className="space-y-1">
                      <label className={labelClassName}>Phòng ban trực thuộc</label>
                      <select
                        value={formData.parentId}
                        onChange={(e) => handleInputChange("parentId", e.target.value ? Number(e.target.value) : undefined)}
                        className={selectClassName}
                        disabled={formData.isTopLevel}
                      >
                        <option value="">-- Chọn phòng ban cha --</option>
                        {availableParentDepts.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                      </select>
                    </div>
                  )}

                  <div className="space-y-1">
                    <label className={labelClassName}>Thứ tự hiển thị</label>
                    <input
                      type="number"
                      value={formData.displayOrder}
                      onChange={(e) => handleInputChange("displayOrder", Number(e.target.value))}
                      className={inputClassName}
                      placeholder="0"
                    />
                  </div>
                </div>
              )}

              {type === "jobTitle" && (
                <div className="md:col-span-2 space-y-8">
                  {/* Context Group */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-slate-50 rounded-3xl border border-slate-100">
                    <div className="md:col-span-2">
                       <SectionTitle icon="account_tree" title="Cơ cấu & Tuyến báo cáo" />
                    </div>
                    
                    <div className="space-y-1">
                      <label className={labelClassName}>Chi nhánh</label>
                      <select
                        value={formData.branchId}
                        onChange={(e) => {
                           const bId = e.target.value ? Number(e.target.value) : undefined;
                           setFormData({ ...formData, branchId: bId, departmentId: undefined });
                        }}
                        className={selectClassName}
                      >
                        <option value="">-- Toàn công ty --</option>
                        {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className={labelClassName}>Phòng ban</label>
                      <select
                        value={formData.departmentId}
                        onChange={(e) => handleInputChange("departmentId", e.target.value ? Number(e.target.value) : undefined)}
                        className={selectClassName}
                      >
                        <option value="">-- Chọn phòng ban --</option>
                        {filteredDepts.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                      </select>
                    </div>

                    <div className="md:col-span-2 space-y-1">
                      <label className={labelClassName}>Trực thuộc (Báo cáo cho)</label>
                      <select
                        value={formData.parentId}
                        onChange={(e) => handleInputChange("parentId", e.target.value ? Number(e.target.value) : undefined)}
                        className={selectClassName}
                      >
                        <option value="">-- Cấp cao nhất --</option>
                        {availableParentJobTitles.map(jt => <option key={jt.id} value={jt.id}>{jt.name}</option>)}
                      </select>
                    </div>
                  </div>

                  {/* Qualification Group */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                      <SectionTitle icon="school" title="Tiêu chuẩn năng lực" />
                    </div>

                    <div className="space-y-1">
                      <label className={labelClassName}>Trình độ học vấn</label>
                      <select
                        value={formData.qualification}
                        onChange={(e) => handleInputChange("qualification", e.target.value)}
                        className={selectClassName}
                      >
                        {QUALIFICATIONS.map(q => <option key={q} value={q}>{q}</option>)}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className={labelClassName}>Kinh nghiệm yêu cầu</label>
                      <input
                        type="text"
                        value={formData.experience}
                        onChange={(e) => handleInputChange("experience", e.target.value)}
                        className={inputClassName}
                        placeholder="VD: 3 năm kinh nghiệm..."
                      />
                    </div>

                    <div className="space-y-1 md:col-span-2">
                      <label className={labelClassName}>Thứ tự hiển thị</label>
                      <input
                        type="number"
                        value={formData.displayOrder}
                        onChange={(e) => handleInputChange("displayOrder", Number(e.target.value))}
                        className={inputClassName}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Section 2: Contact & Additional Info (Branch only) */}
          {type === "branch" && (
            <div>
              <SectionTitle icon="contact_support" title="Thông tin liên hệ & Bổ sung" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-emerald-50/30 rounded-3xl border border-emerald-100/50">
                <div className="space-y-1">
                  <label className={labelClassName}>Số điện thoại liên lạc</label>
                  <div className="flex gap-2">
                    <div className="w-32 shrink-0">
                      <select 
                        className={`${selectClassName} h-[46px] text-[12px] px-3`}
                        value={formData.phoneCountryCode || "VN (+84)"}
                        onChange={(e) => handleInputChange("phoneCountryCode", e.target.value)}
                      >
                        <option value="VN (+84)">VN (+84)</option>
                        <option value="US (+1)">US (+1)</option>
                        <option value="JP (+81)">JP (+81)</option>
                      </select>
                    </div>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                      className={inputClassName}
                      placeholder="012 345 6789"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className={labelClassName}>Thứ tự hiển thị</label>
                  <input
                    type="number"
                    value={formData.displayOrder}
                    onChange={(e) => handleInputChange("displayOrder", Number(e.target.value))}
                    className={inputClassName}
                    placeholder="Mặc định = 0"
                  />
                </div>


              </div>
            </div>
          )}

          {/* Section 3: Address (Branch only) */}
          {type === "branch" && (
            <div>
              <SectionTitle icon="location_on" title="Vị trí hoạt động" />
              <AddressCascader 
                countryCode={formData.countryCode}
                provinceCode={formData.provinceCode}
                districtCode={formData.districtCode}
                onChange={(codes) => setFormData({ ...formData, ...codes })}
              />
              <div className="mt-4 space-y-1">
                <label className={labelClassName}>Địa chỉ chi tiết</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => handleInputChange("address", e.target.value)}
                  className={inputClassName}
                  placeholder="Số nhà, tên đường, tòa nhà..."
                />
              </div>
            </div>
          )}

          {/* Section 4: Notes */}
          <div>
            <SectionTitle icon="notes" title="Thông tin bổ sung" />
            <textarea
              value={formData.note}
              onChange={(e) => handleInputChange("note", e.target.value)}
              className={`${inputClassName} min-h-[80px] resize-none`}
              placeholder="Ghi chú nội bộ..."
            />
          </div>
        </form>

        {/* Footer */}
        <footer className="h-20 border-t border-slate-50 flex items-center justify-end px-8 gap-3 bg-slate-50/30 shrink-0">
          <button onClick={onClose} className="px-6 py-2.5 rounded-xl text-sm font-bold text-slate-500 hover:bg-slate-100 transition-all">Hủy bỏ</button>
          <button onClick={handleSubmit} className="px-10 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-black shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 hover:-translate-y-0.5 transition-all active:translate-y-0">Lưu thay đổi</button>
        </footer>
      </div>
    </div>
  );
};

export default OrgFormModal;
