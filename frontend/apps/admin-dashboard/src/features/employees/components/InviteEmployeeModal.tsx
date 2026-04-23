import React, { useEffect, useState } from 'react';
import { authService, type StaffInvitationPayload } from '../../../services/authService';
import { authorizationService } from '../../../services/authorizationService';
import { lookupsService } from '../../../services/lookupsService';
import { useToast } from '../../../hooks/useToast';

interface InviteEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const INITIAL_FORM_DATA: StaffInvitationPayload = {
  fullName: '',
  email: '',
  roleId: '',
  scopeLevel: 'BRANCH',
  message: '',
};

interface Option {
  id: string | number;
  name: string;
}

const selectChevronStyle = {
  backgroundImage: `url("data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="#6B7280"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>`
  )}")`,
  backgroundSize: '1.25rem 1.25rem',
  backgroundPosition: 'right 0.75rem center',
  backgroundRepeat: 'no-repeat',
} as const;

const InviteEmployeeModal: React.FC<InviteEmployeeModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState<StaffInvitationPayload>(INITIAL_FORM_DATA);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [roles, setRoles] = useState<Option[]>([]);
  const [branches, setBranches] = useState<Option[]>([]);
  const [departments, setDepartments] = useState<Option[]>([]);
  
  const [invitationResult, setInvitationResult] = useState<{
    link: string;
    expiresAt: string;
  } | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchMetadata();
      setFormData(INITIAL_FORM_DATA);
      setErrors({});
      setInvitationResult(null);
    }
  }, [isOpen]);

  const fetchMetadata = async () => {
    setLoading(true);
    try {
      const [roleItems, branchItems, deptItems] = await Promise.all([
        authorizationService.getRoles(),
        lookupsService.getBranches(),
        lookupsService.getDepartments(),
      ]);
      
      setRoles(roleItems as Option[]);
      setBranches(branchItems as Option[]);
      setDepartments(deptItems as Option[]);
    } catch (error) {
      console.error('Fetch metadata error:', error);
    } finally {
      setLoading(false);
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.fullName.trim()) newErrors.fullName = 'Họ tên là bắt buộc';
    if (!formData.email.trim()) {
      newErrors.email = 'Email là bắt buộc';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email không hợp lệ';
    }
    if (!formData.roleId) newErrors.roleId = 'Vui lòng chọn vai trò';
    
    if (formData.scopeLevel === 'BRANCH' && !formData.branchId) {
      newErrors.branchId = 'Vui lòng chọn chi nhánh';
    }
    if (formData.scopeLevel === 'DEPARTMENT' && !formData.departmentId) {
      newErrors.departmentId = 'Vui lòng chọn phòng ban';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      const result = await authService.invite(formData);

      if (result.success && result.inviteLink) {
        setInvitationResult({
          link: result.inviteLink,
          expiresAt: result.expiresAt || '',
        });
        onSuccess?.();
        showToast('Gửi lời mời thành công!', 'success');
      } else {
        showToast(result.message || 'Lỗi khi gửi lời mời', 'error');
      }
    } catch (error: any) {
      showToast(error.message || 'Đã xảy ra lỗi. Vui lòng thử lại.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    showToast('Đã sao chép vào bộ nhớ tạm!', 'success');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-blue-50/50 to-indigo-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
              <span className="material-symbols-outlined">person_add</span>
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Mời nhân viên mới</h2>
              <p className="text-xs text-gray-500">Cấp quyền truy cập hệ thống cho đồng nghiệp</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/80 rounded-full text-gray-400 hover:text-gray-600 transition-colors shadow-sm">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="p-8">
          {!invitationResult ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-gray-700 flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-base text-gray-400">person</span>
                    Họ và tên *
                  </label>
                  <input
                    type="text"
                    className={`w-full h-11 px-4 border rounded-xl text-sm transition-all focus:ring-4 focus:ring-blue-50 outline-none ${
                      errors.fullName ? 'border-red-300 bg-red-50/30' : 'border-gray-200 focus:border-blue-500'
                    }`}
                    placeholder="Nguyễn Văn A"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  />
                  {errors.fullName && <p className="text-[11px] text-red-500 font-medium pl-1">{errors.fullName}</p>}
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-gray-700 flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-base text-gray-400">mail</span>
                    Email *
                  </label>
                  <input
                    type="email"
                    className={`w-full h-11 px-4 border rounded-xl text-sm transition-all focus:ring-4 focus:ring-blue-50 outline-none ${
                      errors.email ? 'border-red-300 bg-red-50/30' : 'border-gray-200 focus:border-blue-500'
                    }`}
                    placeholder="example@company.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                  {errors.email && <p className="text-[11px] text-red-500 font-medium pl-1">{errors.email}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-gray-700 flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-base text-gray-400">badge</span>
                    Vai trò *
                  </label>
                  <select
                    className={`w-full h-11 px-4 border rounded-xl text-sm transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-50 outline-none appearance-none ${
                      errors.roleId ? 'border-red-300 bg-red-50/30' : 'border-gray-200'
                    }`}
                    style={selectChevronStyle}
                    value={formData.roleId}
                    onChange={(e) => setFormData({ ...formData, roleId: e.target.value })}
                  >
                    <option value="">Chọn vai trò</option>
                    {roles.map((r) => (
                      <option key={r.id} value={r.id}>{r.name}</option>
                    ))}
                  </select>
                  {errors.roleId && <p className="text-[11px] text-red-500 font-medium pl-1">{errors.roleId}</p>}
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-gray-700 flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-base text-gray-400">admin_panel_settings</span>
                    Phạm vi quản lý *
                  </label>
                  <select
                    className="w-full h-11 px-4 border border-gray-200 rounded-xl text-sm transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-50 outline-none appearance-none"
                    style={selectChevronStyle}
                    value={formData.scopeLevel}
                    onChange={(e) => setFormData({ ...formData, scopeLevel: e.target.value as any })}
                  >
                    <option value="TENANT">Toàn bộ workspace</option>
                    <option value="REGION">Vùng (Region)</option>
                    <option value="BRANCH">Chi nhánh (Branch)</option>
                    <option value="DEPARTMENT">Phòng ban (Dept)</option>
                  </select>
                </div>
              </div>

              {formData.scopeLevel === 'BRANCH' && (
                <div className="space-y-1.5 animate-in fade-in slide-in-from-top-2 duration-200">
                  <label className="text-sm font-bold text-gray-700 flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-base text-gray-400">store</span>
                    Chi nhánh cụ thể *
                  </label>
                  <select
                    className={`w-full h-11 px-4 border rounded-xl text-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-50 outline-none appearance-none ${
                      errors.branchId ? 'border-red-300 bg-red-50/30' : 'border-gray-200'
                    }`}
                    style={selectChevronStyle}
                    value={formData.branchId || ''}
                    onChange={(e) => setFormData({ ...formData, branchId: e.target.value })}
                  >
                    <option value="">Chọn chi nhánh</option>
                    {branches.map((b) => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                  {errors.branchId && <p className="text-[11px] text-red-500 font-medium pl-1">{errors.branchId}</p>}
                </div>
              )}

              {formData.scopeLevel === 'DEPARTMENT' && (
                <div className="space-y-1.5 animate-in fade-in slide-in-from-top-2 duration-200">
                  <label className="text-sm font-bold text-gray-700 flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-base text-gray-400">groups</span>
                    Phòng ban cụ thể *
                  </label>
                  <select
                    className={`w-full h-11 px-4 border rounded-xl text-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-50 outline-none appearance-none ${
                      errors.departmentId ? 'border-red-300 bg-red-50/30' : 'border-gray-200'
                    }`}
                    style={selectChevronStyle}
                    value={formData.departmentId || ''}
                    onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                  >
                    <option value="">Chọn phòng ban</option>
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                  {errors.departmentId && <p className="text-[11px] text-red-500 font-medium pl-1">{errors.departmentId}</p>}
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-sm font-bold text-gray-700 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-base text-gray-400">chat_bubble</span>
                  Lời nhắn (Tùy chọn)
                </label>
                <textarea
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-50 outline-none min-h-[100px] resize-none"
                  placeholder="Chào mừng bạn gia nhập đội ngũ NexaHR..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 h-12 text-sm font-bold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={submitting || loading}
                  className="flex-1 h-12 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl shadow-lg shadow-blue-200 transition-all active:scale-95 disabled:opacity-50"
                >
                  {submitting ? 'Đang gửi...' : 'Gửi lời mời'}
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-6 text-center animate-in fade-in slide-in-from-bottom-4">
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="material-symbols-outlined text-3xl">check_circle</span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Lời mời đã được gửi!</h3>
                <p className="text-sm text-gray-500">
                  Một email mời đã được gửi tới <b>{formData.email}</b>. Bạn cũng có thể sao chép link bên dưới để gửi trực tiếp.
                </p>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-2xl border border-dashed border-gray-300 break-all text-sm text-blue-600 font-medium">
                {invitationResult.link}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => copyToClipboard(invitationResult.link)}
                  className="flex-1 h-12 bg-gray-900 hover:bg-black text-white text-sm font-bold rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-sm">content_copy</span>
                  Sao chép link
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 h-12 border border-gray-200 hover:bg-gray-50 text-gray-700 text-sm font-bold rounded-xl transition-colors"
                >
                  Đóng
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InviteEmployeeModal;
