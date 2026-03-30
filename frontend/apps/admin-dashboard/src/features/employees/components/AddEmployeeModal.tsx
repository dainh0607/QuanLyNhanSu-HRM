import React, { useState, useEffect } from 'react';
import { employeeService } from '../../../services/employeeService';
import { useToast } from '../../../components/common/Toast';

interface AddEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const AddEmployeeModal: React.FC<AddEmployeeModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { showToast, ToastComponent } = useToast();
  const [isExpanded, setIsExpanded] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    employeeCode: '',
    fullName: '',
    email: '',
    countryCode: '+84',
    phone: '',
    accessGroup: 'Nhân viên',
    password: '',
    regionId: '',
    branchId: '',
    departmentId: '',
    jobTitleId: '',
  });

  // Error State
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Metadata State
  const [metadata, setMetadata] = useState({
    regions: [] as any[],
    branches: [] as any[],
    departments: [] as any[],
    jobTitles: [] as any[],
    accessGroups: [] as any[],
  });

  useEffect(() => {
    if (isOpen) {
      fetchInitialData();
    }
  }, [isOpen]);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [code, regions, branches, departments, jobTitles, accessGroups] = await Promise.all([
        employeeService.getNextEmployeeCode(),
        employeeService.getMetadata('regions'),
        employeeService.getMetadata('branches'),
        employeeService.getMetadata('departments'),
        employeeService.getMetadata('job-titles'),
        employeeService.getMetadata('access-groups'),
      ]);

      setFormData(prev => ({ ...prev, employeeCode: code }));
      setMetadata({ regions, branches, departments, jobTitles, accessGroups });
    } catch (error) {
      console.error('Fetch initial data error:', error);
    } finally {
      setLoading(false);
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    // Họ tên
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Họ tên là bắt buộc';
    }
    
    // Email (nếu nhập thì phải đúng định dạng)
    if (formData.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        newErrors.email = 'Định dạng email không hợp lệ (VD: example@mail.com)';
      }
    }

    // Số điện thoại (nếu nhập thì phải từ 9-11 số)
    if (formData.phone) {
      if (formData.phone.length < 9 || formData.phone.length > 11) {
        newErrors.phone = 'Số điện thoại phải từ 9 đến 11 chữ số';
      }
    }

    // Nhóm truy cập
    if (!formData.accessGroup || formData.accessGroup === 'Chọn nhóm') {
      newErrors.accessGroup = 'Vui lòng chọn nhóm truy cập';
    }

    // Mật khẩu
    if (!formData.password) {
      newErrors.password = 'Mật khẩu là bắt buộc';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, ''); // Numeric only
    handleInputChange('phone', value);
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setSubmitting(true);
    try {
      const payload = {
        employeeCode: formData.employeeCode,
        fullName: formData.fullName,
        email: formData.email || null,
        phone: formData.phone ? `${formData.countryCode}${formData.phone}` : null,
        accessGroup: formData.accessGroup,
        // password: formData.password, // Frontend placeholder for now as DTO doesn't have it
        regionId: formData.regionId ? parseInt(formData.regionId) : null,
        branchId: formData.branchId ? parseInt(formData.branchId) : null,
        departmentId: formData.departmentId ? parseInt(formData.departmentId) : null,
        jobTitleId: formData.jobTitleId ? parseInt(formData.jobTitleId) : null,
      };

      await employeeService.createEmployee(payload);
      showToast('Thêm nhân viên thành công!', 'success');
      
      setTimeout(() => {
        onClose();
        if (onSuccess) onSuccess();
      }, 1000);
    } catch (error: any) {
      console.error('Submit error:', error);
      showToast(error.Message || 'Có lỗi xảy ra khi tạo nhân viên', 'error');
      
      if (error.errors) {
        // Map backend validation errors if any
        const backendErrors: Record<string, string> = {};
        Object.keys(error.errors).forEach(key => {
          backendErrors[key.toLowerCase()] = error.errors[key][0];
        });
        setErrors(prev => ({ ...prev, ...backendErrors }));
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  // Filtering dependent data
  const filteredBranches = formData.regionId 
    ? metadata.branches.filter(b => b.region_id === parseInt(formData.regionId))
    : metadata.branches;

  return (
    <div 
      className="fixed inset-0 z-[1000] flex items-start justify-center bg-black/40 backdrop-blur-sm transition-all duration-300 animate-in fade-in overflow-y-auto py-10"
      onClick={handleBackdropClick}
    >
      <div className="bg-white w-full max-w-[720px] rounded-[28px] shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4 duration-300 my-auto">
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Thêm nhân viên</h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-colors"
          >
            <span className="material-symbols-outlined text-[24px]">close</span>
          </button>
        </div>

        <div className="px-8 py-6">
          {/* Banner */}
          <div className="bg-[#f8f9fa] rounded-[20px] p-6 flex gap-6 mb-8 border border-gray-100 items-center">
            <div className="w-20 h-20 flex-shrink-0 bg-white rounded-2xl p-2 shadow-sm">
               <img 
                src="/invite_banner_illustration_1774843436821.png" 
                alt="Invite illustration" 
                className="w-full h-full object-contain"
               />
            </div>
            <div className="flex-1">
              <h3 className="text-base font-bold text-gray-900 mb-1">Mời tham gia qua liên kết</h3>
              <p className="text-[13px] text-gray-500 mb-3 leading-relaxed">
                Nhân viên có thể tự hoàn thành hồ sơ cá nhân qua link.
              </p>
              <div className="flex gap-2">
                <div className="flex-1 px-3 py-2 bg-white border border-gray-200 rounded-xl text-[13px] text-gray-400 truncate flex items-center h-10">
                  https://nexa-hr.com/invite/69c62e9908f09CbYE...
                </div>
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText('https://nexa-hr.com/invite/69c62e9908f09CbYE...');
                    showToast('Đã sao chép liên kết!', 'success');
                  }}
                  className="px-4 h-10 bg-[#192841] text-white text-xs font-bold rounded-xl hover:bg-[#253a5c] transition-all shadow-sm active:scale-95"
                >
                  Sao chép link
                </button>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="space-y-6">
            {/* Họ và tên */}
            <div className="grid grid-cols-[1fr_2.5fr] items-start gap-6">
              <label className="text-sm font-bold text-gray-700 pt-3">Họ và tên <span className="text-red-500">*</span></label>
              <div className="space-y-1.5">
                <input 
                  type="text" 
                  placeholder="Nhập họ và tên" 
                  value={formData.fullName}
                  onChange={(e) => handleInputChange('fullName', e.target.value)}
                  className={`w-full h-11 px-4 border rounded-xl text-sm focus:outline-none focus:ring-4 transition-all ${errors.fullName ? 'border-red-400 bg-red-50/30 ring-red-100' : 'border-gray-200 focus:border-[#192841] focus:ring-[#192841]/5'}`}
                />
                {errors.fullName && <p className="text-[11px] font-medium text-red-500 pl-1">{errors.fullName}</p>}
              </div>
            </div>

            {/* Email */}
            <div className="grid grid-cols-[1fr_2.5fr] items-start gap-6">
              <label className="text-sm font-bold text-gray-700 pt-3">Email</label>
              <div className="space-y-1.5">
                <input 
                  type="email" 
                  placeholder="Nhập địa chỉ email" 
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className={`w-full h-11 px-4 border rounded-xl text-sm focus:outline-none focus:ring-4 transition-all ${errors.email ? 'border-red-400 bg-red-50/30 ring-red-100' : 'border-gray-200 focus:border-[#192841] focus:ring-[#192841]/5'}`}
                />
                {errors.email && <p className="text-[11px] font-medium text-red-500 pl-1">{errors.email}</p>}
              </div>
            </div>

            {/* Số điện thoại */}
            <div className="grid grid-cols-[1fr_2.5fr] items-start gap-6">
              <label className="text-sm font-bold text-gray-700 pt-3">Số điện thoại</label>
              <div className="space-y-1.5">
                <div className="flex gap-2.5">
                  <div className="relative w-28 group">
                    <select 
                      value={formData.countryCode}
                      onChange={(e) => handleInputChange('countryCode', e.target.value)}
                      className="w-full h-11 px-3 border border-gray-200 rounded-xl text-sm appearance-none bg-white focus:outline-none focus:border-[#192841] focus:ring-4 focus:ring-[#192841]/5 transition-all pr-8 cursor-pointer"
                    >
                      <option value="+84">+84</option>
                      <option value="+1">+1</option>
                      <option value="+44">+44</option>
                    </select>
                    <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none group-focus-within:rotate-180 transition-transform text-[20px]">expand_more</span>
                  </div>
                  <input 
                    type="tel" 
                    placeholder="Nhập số điện thoại" 
                    value={formData.phone}
                    onChange={handlePhoneChange}
                    className={`flex-1 h-11 px-4 border rounded-xl text-sm focus:outline-none focus:ring-4 transition-all ${errors.phone ? 'border-red-400 bg-red-50/30 ring-red-100' : 'border-gray-200 focus:border-[#192841] focus:ring-[#192841]/5'}`}
                  />
                </div>
                {errors.phone && <p className="text-[11px] font-medium text-red-500 pl-1">{errors.phone}</p>}
              </div>
            </div>

            {/* Nhóm truy cập */}
            <div className="grid grid-cols-[1fr_2.5fr] items-start gap-6">
              <label className="text-sm font-bold text-gray-700 pt-3">Nhóm truy cập <span className="text-red-500">*</span></label>
              <div className="space-y-1.5">
                <div className="relative group">
                  <select 
                    value={formData.accessGroup}
                    onChange={(e) => handleInputChange('accessGroup', e.target.value)}
                    className={`w-full h-11 px-4 border rounded-xl text-sm appearance-none bg-white focus:outline-none focus:ring-4 transition-all pr-10 cursor-pointer ${errors.accessGroup ? 'border-red-400 bg-red-50/30 ring-red-100' : 'border-gray-200 focus:border-[#192841] focus:ring-[#192841]/5'}`}
                  >
                    <option value="Chọn nhóm">Chọn nhóm truy cập</option>
                    {metadata.accessGroups.map(g => (
                      <option key={g.Id} value={g.name}>{g.name}</option>
                    ))}
                  </select>
                  <span className="material-symbols-outlined absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none group-focus-within:rotate-180 transition-transform text-[20px]">expand_more</span>
                </div>
                {errors.accessGroup && <p className="text-[11px] font-medium text-red-500 pl-1">{errors.accessGroup}</p>}
              </div>
            </div>

            {/* Mật khẩu */}
            <div className="grid grid-cols-[1fr_2.5fr] items-start gap-6">
              <label className="text-sm font-bold text-gray-700 pt-3">Mật khẩu <span className="text-red-500">*</span></label>
              <div className="space-y-1.5">
                <div className="relative">
                  <input 
                    type={showPassword ? "text" : "password"} 
                    placeholder="Nhập mật khẩu" 
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className={`w-full h-11 px-4 border rounded-xl text-sm focus:outline-none focus:ring-4 transition-all pr-12 ${errors.password ? 'border-red-400 bg-red-50/30 ring-red-100' : 'border-gray-200 focus:border-[#192841] focus:ring-[#192841]/5'}`}
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#192841] transition-colors"
                  >
                    <span className="material-symbols-outlined text-[20px]">{showPassword ? 'visibility_off' : 'visibility'}</span>
                  </button>
                </div>
                {errors.password && <p className="text-[11px] font-medium text-red-500 pl-1">{errors.password}</p>}
              </div>
            </div>

            {/* Link Mở rộng */}
            <div className="pt-2">
              <button 
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-sm font-bold text-[#192841] hover:opacity-80 flex items-center gap-0.5 transition-all"
              >
                <span>{isExpanded ? 'Thu gọn' : 'Mở rộng'}</span>
                <span className={`material-symbols-outlined text-[20px] transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>keyboard_arrow_down</span>
              </button>
            </div>

            {/* Các trường bổ sung (Expandable) */}
            {isExpanded && (
              <div className="space-y-6 pt-4 animate-in fade-in slide-in-from-top-3 duration-300">
                {/* Vùng */}
                <div className="grid grid-cols-[1fr_2.5fr] items-center gap-6">
                  <label className="text-sm font-bold text-gray-700 flex items-center gap-1">
                    Vùng <span className="text-[11px] font-normal text-gray-400">(Tùy chọn)</span>
                  </label>
                  <div className="relative group">
                    <select 
                      value={formData.regionId}
                      onChange={(e) => handleInputChange('regionId', e.target.value)}
                      className="w-full h-11 px-4 border border-gray-200 rounded-xl text-sm appearance-none bg-white focus:outline-none focus:border-[#192841] focus:ring-4 focus:ring-[#192841]/5 transition-all pr-10 cursor-pointer"
                    >
                      <option value="">{loading ? 'Đang tải...' : 'Chọn vùng'}</option>
                      {metadata.regions.map(r => (
                        <option key={r.Id} value={r.Id}>{r.name}</option>
                      ))}
                    </select>
                    <span className="material-symbols-outlined absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none group-focus-within:rotate-180 transition-transform text-[20px]">expand_more</span>
                  </div>
                </div>

                {/* Chi nhánh */}
                <div className="grid grid-cols-[1fr_2.5fr] items-center gap-6">
                  <label className="text-sm font-bold text-gray-700 flex items-center gap-1">
                    Chi nhánh <span className="text-[11px] font-normal text-gray-400">(Tùy chọn)</span>
                  </label>
                  <div className="relative group">
                    <select 
                      value={formData.branchId}
                      onChange={(e) => handleInputChange('branchId', e.target.value)}
                      className="w-full h-11 px-4 border border-gray-200 rounded-xl text-sm appearance-none bg-white focus:outline-none focus:border-[#192841] focus:ring-4 focus:ring-[#192841]/5 transition-all pr-10 disabled:bg-gray-50/50 cursor-pointer disabled:cursor-not-allowed"
                      disabled={!formData.regionId && !loading}
                    >
                      <option value="">{loading ? 'Đang tải...' : 'Chọn chi nhánh'}</option>
                      {filteredBranches.map(b => (
                        <option key={b.Id} value={b.Id}>{b.name}</option>
                      ))}
                    </select>
                    <span className="material-symbols-outlined absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none group-focus-within:rotate-180 transition-transform text-[20px]">expand_more</span>
                  </div>
                </div>

                {/* Phòng ban */}
                <div className="grid grid-cols-[1fr_2.5fr] items-center gap-6">
                  <label className="text-sm font-bold text-gray-700 flex items-center gap-1">
                    Phòng ban <span className="text-[11px] font-normal text-gray-400">(Tùy chọn)</span>
                  </label>
                  <div className="relative group">
                    <select 
                      value={formData.departmentId}
                      onChange={(e) => handleInputChange('departmentId', e.target.value)}
                      className="w-full h-11 px-4 border border-gray-200 rounded-xl text-sm appearance-none bg-white focus:outline-none focus:border-[#192841] focus:ring-4 focus:ring-[#192841]/5 transition-all pr-10 cursor-pointer"
                    >
                      <option value="">{loading ? 'Đang tải...' : 'Chọn phòng ban'}</option>
                      {metadata.departments.map(d => (
                        <option key={d.Id} value={d.Id}>{d.name}</option>
                      ))}
                    </select>
                    <span className="material-symbols-outlined absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none group-focus-within:rotate-180 transition-transform text-[20px]">expand_more</span>
                  </div>
                </div>

                {/* Chức danh */}
                <div className="grid grid-cols-[1fr_2.5fr] items-center gap-6">
                  <label className="text-sm font-bold text-gray-700 flex items-center gap-1">
                    Chức danh <span className="text-[11px] font-normal text-gray-400">(Tùy chọn)</span>
                  </label>
                  <div className="relative group">
                    <select 
                      value={formData.jobTitleId}
                      onChange={(e) => handleInputChange('jobTitleId', e.target.value)}
                      className="w-full h-11 px-4 border border-gray-200 rounded-xl text-sm appearance-none bg-white focus:outline-none focus:border-[#192841] focus:ring-4 focus:ring-[#192841]/5 transition-all pr-10 cursor-pointer"
                    >
                      <option value="">{loading ? 'Đang tải...' : 'Chọn chức danh'}</option>
                      {metadata.jobTitles.map(j => (
                        <option key={j.Id} value={j.Id}>{j.name}</option>
                      ))}
                    </select>
                    <span className="material-symbols-outlined absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none group-focus-within:rotate-180 transition-transform text-[20px]">expand_more</span>
                  </div>
                </div>

                {/* Mã nhân viên */}
                <div className="grid grid-cols-[1fr_2.5fr] items-center gap-6">
                  <label className="text-sm font-bold text-gray-700 flex items-center gap-1">
                    Mã nhân viên <span className="text-[11px] font-normal text-gray-400">(Tùy chọn)</span>
                  </label>
                  <div className="relative">
                    <input 
                      type="text" 
                      placeholder="Nhập mã nhân viên"
                      value={formData.employeeCode}
                      onChange={(e) => handleInputChange('employeeCode', e.target.value)}
                      className={`w-full h-11 px-4 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-[#192841]/5 focus:border-[#192841] transition-all ${loading && !formData.employeeCode ? 'animate-pulse bg-gray-50' : ''}`}
                    />
                    {loading && !formData.employeeCode && (
                       <div className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-[#192841]/20 border-t-[#192841] rounded-full animate-spin"></div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-8 py-5 border-t border-gray-100 flex justify-end gap-3 bg-gray-50/50">
          <button 
            onClick={onClose}
            disabled={submitting}
            className="px-6 py-2.5 border border-gray-200 rounded-lg text-sm font-bold text-gray-600 hover:bg-white hover:border-gray-300 transition-all shadow-sm disabled:opacity-50"
          >
            Hủy
          </button>
          <button 
            onClick={handleSubmit}
            disabled={submitting}
            className="px-8 py-2.5 bg-[#192841] text-white text-sm font-bold rounded-lg hover:bg-[#253a5c] transition-all shadow-md shadow-[#192841]/20 flex items-center gap-2 disabled:opacity-70"
          >
            {submitting && <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>}
            Tạo mới
          </button>
        </div>
      </div>
      {ToastComponent}
    </div>
  );
};

export default AddEmployeeModal;
