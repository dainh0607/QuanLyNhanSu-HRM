import React, { useCallback, useEffect, useState } from 'react';
import { authService } from '../../../services/authService';
import { employeeService } from '../../../services/employeeService';
import { useToast } from '../../../hooks/useToast';

interface InviteEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

interface InviteFormData {
  fullName: string;
  email: string;
  departmentId: string;
  jobTitleId: string;
  expirationDays: number;
}

interface MetadataOption {
  id: number;
  name: string;
}

const INITIAL_FORM_DATA: InviteFormData = {
  fullName: '',
  email: '',
  departmentId: '',
  jobTitleId: '',
  expirationDays: 7,
};

const InviteEmployeeModal: React.FC<InviteEmployeeModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState<InviteFormData>(INITIAL_FORM_DATA);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [departments, setDepartments] = useState<MetadataOption[]>([]);
  const [jobTitles, setJobTitles] = useState<MetadataOption[]>([]);
  
  const [invitationResult, setInvitationResult] = useState<{
    link: string;
    token: string;
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
      const [deptItems, jobItems] = await Promise.all([
        employeeService.getDepartmentsMetadata(),
        employeeService.getJobTitlesMetadata(),
      ]);
      
      setDepartments(deptItems as MetadataOption[]);
      setJobTitles(jobItems as MetadataOption[]);
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
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      const result = await authService.invite({
        email: formData.email,
        fullName: formData.fullName,
        departmentId: formData.departmentId ? parseInt(formData.departmentId) : undefined,
        jobTitleId: formData.jobTitleId ? parseInt(formData.jobTitleId) : undefined,
        expirationDays: formData.expirationDays,
      });

      if (result.success && result.invitationLink) {
        setInvitationResult({
          link: result.invitationLink,
          token: result.token || '',
          expiresAt: result.expiresAt || '',
        });
        showToast('Tạo link mời thành công!', 'success');
      } else {
        showToast(result.message || 'Lỗi khi tạo link mời', 'error');
      }
    } catch (error) {
      showToast('Đã xảy ra lỗi. Vui lòng thử lại.', 'error');
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
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Mời nhân viên mới</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-400">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="p-8">
          {!invitationResult ? (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Họ và tên *</label>
                <input
                  type="text"
                  className={`w-full h-11 px-4 border rounded-xl text-sm focus:ring-4 focus:ring-blue-50 transition-all ${
                    errors.fullName ? 'border-red-400' : 'border-gray-200 focus:border-blue-500'
                  }`}
                  placeholder="Nguyễn Văn A"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                />
                {errors.fullName && <p className="mt-1 text-xs text-red-500 font-medium">{errors.fullName}</p>}
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Email nhận thư mời *</label>
                <input
                  type="email"
                  className={`w-full h-11 px-4 border rounded-xl text-sm focus:ring-4 focus:ring-blue-50 transition-all ${
                    errors.email ? 'border-red-400' : 'border-gray-200 focus:border-blue-500'
                  }`}
                  placeholder="example@company.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
                {errors.email && <p className="mt-1 text-xs text-red-500 font-medium">{errors.email}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">Phòng ban</label>
                  <select
                    className="w-full h-11 px-4 border border-gray-200 rounded-xl text-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-50 outline-none"
                    value={formData.departmentId}
                    onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                  >
                    <option value="">Chọn phòng ban</option>
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">Chức danh</label>
                  <select
                    className="w-full h-11 px-4 border border-gray-200 rounded-xl text-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-50 outline-none"
                    value={formData.jobTitleId}
                    onChange={(e) => setFormData({ ...formData, jobTitleId: e.target.value })}
                  >
                    <option value="">Chọn chức danh</option>
                    {jobTitles.map((j) => (
                      <option key={j.id} value={j.id}>{j.name}</option>
                    ))}
                  </select>
                </div>
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
                  {submitting ? 'Đang tạo...' : 'Tạo link mời'}
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-6 text-center animate-in fade-in slide-in-from-bottom-4">
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="material-symbols-outlined text-3xl">check_circle</span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Link mời đã sẵn sàng!</h3>
                <p className="text-sm text-gray-500">
                  Gửi link này cho <b>{formData.fullName}</b>. Link sẽ hết hạn vào <b>{new Date(invitationResult.expiresAt).toLocaleDateString('vi-VN')}</b>.
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
