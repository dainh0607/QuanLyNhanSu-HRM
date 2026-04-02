import React, { useCallback, useEffect, useState } from 'react';
import { useRef } from 'react';
import { employeeService, type EmployeeCreatePayload } from '../../../services/employeeService';
import { useToast } from '../../../hooks/useToast';
import {
  DEFAULT_PHONE_COUNTRY_VALUE,
  PHONE_COUNTRY_OPTIONS,
  getDialCodeByPhoneCountryValue,
  getPhoneLengthDescriptionByCountryValue,
  getPhoneLengthRuleByCountryValue,
  getPhoneCountryOptionByValue,
  validatePhoneNumberByCountryValue,
} from '../data/phoneCountryOptions';

interface AddEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

interface AddEmployeeFormData {
  employeeCode: string;
  fullName: string;
  email: string;
  countryCode: string;
  phone: string;
  accessGroupId: string;
  password: string;
  regionId: string;
  branchId: string;
  departmentId: string;
  jobTitleId: string;
}

interface MetadataOption {
  id: number;
  name: string;
  code?: string;
  regionId: number | null;
  parentId: number | null;
}

interface ModalMetadata {
  regions: MetadataOption[];
  branches: MetadataOption[];
  departments: MetadataOption[];
  jobTitles: MetadataOption[];
  accessGroups: MetadataOption[];
}

interface MetadataLoadingState {
  regions: boolean;
  branches: boolean;
  departments: boolean;
  jobTitles: boolean;
  accessGroups: boolean;
}

const DEFAULT_ACCESS_GROUP_KEYS = ['nhan vien', 'nhân viên', 'employee', 'user', 'staff'] as const;
const ACCESS_GROUP_PRESETS = [
  {
    key: 'regionalManager',
    label: 'Quản lý vùng',
    order: 1,
    aliases: [
      'quan ly vung',
      'regional manager',
      'regionalmanager',
      'region manager',
      'regionmanager',
      'area manager',
      'manager region',
    ],
  },
  {
    key: 'branchManager',
    label: 'Quản lý chi nhánh',
    order: 2,
    aliases: ['quan ly chi nhanh', 'branch manager', 'branchmanager', 'manager branch'],
  },
  {
    key: 'manager',
    label: 'Quản lý',
    order: 0,
    aliases: ['quan ly', 'manager'],
  },
  {
    key: 'employee',
    label: 'Nhân viên',
    order: 3,
    aliases: [...DEFAULT_ACCESS_GROUP_KEYS],
  },
] as const;
const MIN_PASSWORD_LENGTH = 7;
const CONFIGURED_COMPANY_EMAIL_DOMAIN = (import.meta.env.VITE_COMPANY_EMAIL_DOMAIN ?? '')
  .trim()
  .toLowerCase()
  .replace(/^@/, '');
const PUBLIC_EMAIL_DOMAINS = ['gmail.com', 'outlook.com.vn'] as const;
const GENERIC_COMPANY_EMAIL_DOMAIN_PATTERN = '[A-Z0-9-]+(?:\\.[A-Z0-9-]+)+';
const EMAIL_REGEX = new RegExp(
  `^[A-Z0-9._%+-]+@(?:${
    [
      ...(CONFIGURED_COMPANY_EMAIL_DOMAIN
        ? [CONFIGURED_COMPANY_EMAIL_DOMAIN.replace(/\./g, '\\.')]
        : [GENERIC_COMPANY_EMAIL_DOMAIN_PATTERN]),
      ...PUBLIC_EMAIL_DOMAINS.map((domain) => domain.replace(/\./g, '\\.')),
    ].join('|')
  })$`,
  'i'
);
const EMAIL_ERROR_MESSAGE = CONFIGURED_COMPANY_EMAIL_DOMAIN
  ? `Email phải đúng định dạng và kết thúc bằng @${CONFIGURED_COMPANY_EMAIL_DOMAIN}, @gmail.com hoặc @outlook.com.vn`
  : 'Email phải đúng định dạng và dùng domain công ty hợp lệ, @gmail.com hoặc @outlook.com.vn';

const INVITE_LINK = 'https://nexa-hr.com/invite/69c62e9908f09CbYE...';

const INITIAL_METADATA: ModalMetadata = {
  regions: [],
  branches: [],
  departments: [],
  jobTitles: [],
  accessGroups: [],
};

const INITIAL_METADATA_LOADING_STATE: MetadataLoadingState = {
  regions: false,
  branches: false,
  departments: false,
  jobTitles: false,
  accessGroups: false,
};

const INITIAL_FORM_DATA: AddEmployeeFormData = {
  employeeCode: '',
  fullName: '',
  email: '',
  countryCode: DEFAULT_PHONE_COUNTRY_VALUE,
  phone: '',
  accessGroupId: '',
  password: '',
  regionId: '',
  branchId: '',
  departmentId: '',
  jobTitleId: '',
};

const parseOptionalId = (value: unknown): number | null => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string' && value.trim()) {
    const parsedValue = Number.parseInt(value, 10);
    return Number.isNaN(parsedValue) ? null : parsedValue;
  }

  return null;
};

const normalizeMetadataOptions = (items: unknown[]): MetadataOption[] =>
  items
    .map((item) => {
      const record = typeof item === 'object' && item !== null ? (item as Record<string, unknown>) : {};
      const id = parseOptionalId(record['id'] ?? record['Id']);
      const name = record['name'] ?? record['Name'];
      const code = record['code'] ?? record['Code'];

      return {
        id: id ?? -1,
        name: typeof name === 'string' ? name : '',
        code: typeof code === 'string' ? code : undefined,
        regionId: parseOptionalId(record['regionId'] ?? record['region_id'] ?? record['RegionId']),
        parentId: parseOptionalId(record['parentId'] ?? record['parent_id'] ?? record['ParentId']),
      };
    })
    .filter((item) => item.id > 0 && item.name.length > 0);

const getOptionalNumber = (value: string): number | null => {
  if (!value) {
    return null;
  }

  const parsedValue = Number.parseInt(value, 10);
  return Number.isNaN(parsedValue) ? null : parsedValue;
};

const normalizeSearchText = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase();

const resolveAccessGroupPreset = (
  accessGroupName: string,
): (typeof ACCESS_GROUP_PRESETS)[number] | undefined => {
  const normalizedName = normalizeSearchText(accessGroupName);

  return ACCESS_GROUP_PRESETS.find((preset) =>
    preset.aliases.some(
      (alias) => normalizedName === alias || normalizedName.includes(alias),
    ),
  );
};

const normalizeAccessGroupOptions = (items: unknown[]): MetadataOption[] => {
  const matchedGroups = new Map<
    (typeof ACCESS_GROUP_PRESETS)[number]['key'],
    MetadataOption & { sortOrder: number }
  >();

  normalizeMetadataOptions(items).forEach((item) => {
    const matchedPreset = resolveAccessGroupPreset(item.name);
    if (!matchedPreset || matchedGroups.has(matchedPreset.key)) {
      return;
    }

    matchedGroups.set(matchedPreset.key, {
      ...item,
      name: matchedPreset.label,
      sortOrder: matchedPreset.order,
    });
  });

  return Array.from(matchedGroups.values())
    .sort((left, right) => left.sortOrder - right.sortOrder)
    .map((entry) => {
      const { sortOrder, ...item } = entry;
      void sortOrder;
      return item;
    });
};

const resolveDefaultAccessGroupId = (accessGroups: MetadataOption[]): string =>
  accessGroups.find((group) => resolveAccessGroupPreset(group.name)?.key === 'employee')?.id?.toString() ??
  '';

const getPhoneMaxLength = (countryCode: string) =>
  getPhoneLengthRuleByCountryValue(countryCode).maxLength;

const normalizeBackendErrorKey = (key: string) =>
  key ? `${key.charAt(0).toLowerCase()}${key.slice(1)}` : key;

const getBackendErrorMessage = (value: unknown): string | null => {
  if (typeof value === 'string') {
    return value;
  }

  if (Array.isArray(value)) {
    const firstMessage = value.find((item): item is string => typeof item === 'string');
    return firstMessage ?? null;
  }

  return null;
};

const fallbackCopyToClipboard = (value: string): boolean => {
  if (typeof document === 'undefined') {
    return false;
  }

  const textArea = document.createElement('textarea');
  textArea.value = value;
  textArea.setAttribute('readonly', 'true');
  textArea.style.position = 'fixed';
  textArea.style.opacity = '0';
  textArea.style.pointerEvents = 'none';

  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();
  textArea.setSelectionRange(0, value.length);

  const isCopied = document.execCommand('copy');
  document.body.removeChild(textArea);

  return isCopied;
};

const copyToClipboard = async (value: string): Promise<void> => {
  if (navigator.clipboard?.writeText && window.isSecureContext) {
    await navigator.clipboard.writeText(value);
    return;
  }

  if (!fallbackCopyToClipboard(value)) {
    throw new Error('Copy to clipboard is not available.');
  }
};

const AddEmployeeModal: React.FC<AddEmployeeModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { showToast, ToastComponent } = useToast();
  const [isExpanded, setIsExpanded] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [hasLoadedOrganizationMetadata, setHasLoadedOrganizationMetadata] = useState(false);
  const hasUserEditedEmployeeCodeRef = useRef(false);

  // Form State
  const [formData, setFormData] = useState<AddEmployeeFormData>(INITIAL_FORM_DATA);

  // Error State
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Metadata State
  const [metadata, setMetadata] = useState<ModalMetadata>(INITIAL_METADATA);
  const [metadataLoading, setMetadataLoading] = useState<MetadataLoadingState>(
    INITIAL_METADATA_LOADING_STATE,
  );

  useEffect(() => {
    if (isOpen) {
      fetchInitialData();
    }
  }, [isOpen]);

  const fetchInitialData = async () => {
    setLoading(true);
    setErrors({});
    setIsExpanded(false);
    setShowPassword(false);
    setHasLoadedOrganizationMetadata(false);
    hasUserEditedEmployeeCodeRef.current = false;
    setFormData(INITIAL_FORM_DATA);
    setMetadata(INITIAL_METADATA);
    setMetadataLoading(INITIAL_METADATA_LOADING_STATE);
    try {
      setMetadataLoading((prev) => ({
        ...prev,
        accessGroups: true,
      }));

      const [code, accessGroupItems] = await Promise.all([
        employeeService.getNextEmployeeCode(),
        employeeService.getAccessGroupsMetadata(),
      ]);

      const accessGroups = normalizeAccessGroupOptions(accessGroupItems);
      const defaultAccessGroupId = resolveDefaultAccessGroupId(accessGroups);

      setFormData((prev) => ({
        ...prev,
        employeeCode: hasUserEditedEmployeeCodeRef.current ? prev.employeeCode : code,
        accessGroupId: prev.accessGroupId || defaultAccessGroupId,
      }));
      setMetadata((prev) => ({
        ...prev,
        accessGroups,
      }));
    } catch (error) {
      console.error('Fetch initial data error:', error);
    } finally {
      setMetadataLoading((prev) => ({
        ...prev,
        accessGroups: false,
      }));
      setLoading(false);
    }
  };

  const loadOrganizationMetadata = useCallback(async () => {
    if (hasLoadedOrganizationMetadata) {
      return;
    }

    setMetadataLoading((prev) => ({
      ...prev,
      regions: true,
      branches: true,
      departments: true,
      jobTitles: true,
    }));

    try {
      const [regionItems, branchItems, departmentItems, jobTitleItems] = await Promise.all([
        employeeService.getRegionsMetadata(),
        employeeService.getBranchesMetadata(),
        employeeService.getDepartmentsMetadata(),
        employeeService.getJobTitlesMetadata(),
      ]);

      setMetadata((prev) => ({
        ...prev,
        regions: normalizeMetadataOptions(regionItems),
        branches: normalizeMetadataOptions(branchItems),
        departments: normalizeMetadataOptions(departmentItems),
        jobTitles: normalizeMetadataOptions(jobTitleItems),
      }));
      setHasLoadedOrganizationMetadata(true);
    } catch (error) {
      console.error('Load organization metadata error:', error);
    } finally {
      setMetadataLoading((prev) => ({
        ...prev,
        regions: false,
        branches: false,
        departments: false,
        jobTitles: false,
      }));
    }
  }, [hasLoadedOrganizationMetadata]);

  useEffect(() => {
    if (!isOpen || !isExpanded) {
      return;
    }

    void loadOrganizationMetadata();
  }, [isExpanded, isOpen, loadOrganizationMetadata]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    const trimmedEmail = formData.email.trim();

    if (!formData.employeeCode.trim()) {
      newErrors.employeeCode = 'Mã nhân viên là bắt buộc';
    }
    
    // Họ tên
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Họ tên là bắt buộc';
    }
    
    // Email (nếu nhập thì phải đúng định dạng)
    if (!trimmedEmail) {
      newErrors.email = 'Email là bắt buộc';
    } else if (!EMAIL_REGEX.test(trimmedEmail)) {
      newErrors.email = EMAIL_ERROR_MESSAGE;
    }

    const phoneError = validatePhoneNumberByCountryValue(formData.countryCode, formData.phone);
    if (phoneError) {
      newErrors.phone = phoneError;
    }

    if (!formData.accessGroupId) {
      newErrors.accessGroupId = 'Vui lòng chọn nhóm truy cập';
    }

    if (!formData.password) {
      newErrors.password = 'Mật khẩu là bắt buộc';
    } else if (formData.password.length < MIN_PASSWORD_LENGTH) {
      newErrors.password = 'Mật khẩu phải dài hơn 6 ký tự';
    }

    if (newErrors.employeeCode) {
      setIsExpanded(true);
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof AddEmployeeFormData, value: string) => {
    if (field === 'employeeCode') {
      hasUserEditedEmployeeCodeRef.current = true;
    }

    setFormData((prev) => ({
      ...prev,
      [field]: value,
      ...(field === 'regionId' && prev.regionId !== value ? { branchId: '' } : {}),
    }));

    setErrors((prev) => {
      if (!prev[field] && !(field === 'regionId' && prev.branchId)) {
        return prev;
      }

      const next = { ...prev };
      delete next[field];
      if (field === 'regionId') {
        delete next.branchId;
      }
      return next;
    });
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, getPhoneMaxLength(formData.countryCode));
    handleInputChange('phone', value);
  };

  const handleCountryCodeChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      countryCode: value,
      phone: prev.phone.slice(0, getPhoneMaxLength(value)),
    }));

    setErrors((prev) => {
      if (!prev.phone) {
        return prev;
      }

      const next = { ...prev };
      delete next.phone;
      return next;
    });
  };

  const handleCopyInviteLink = async () => {
    try {
      await copyToClipboard(INVITE_LINK);
      showToast('Đã sao chép liên kết!', 'success');
    } catch (error) {
      console.error('Copy invite link error:', error);
      showToast('Không thể sao chép liên kết. Vui lòng thử lại.', 'error');
    }
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    const accessGroupId = getOptionalNumber(formData.accessGroupId);
    if (!accessGroupId) {
      setErrors((prev) => ({ ...prev, accessGroupId: 'Vui lòng chọn nhóm truy cập' }));
      return;
    }

    setSubmitting(true);
    try {
      const payload: EmployeeCreatePayload = {
        employeeCode: formData.employeeCode.trim(),
        fullName: formData.fullName.trim(),
        password: formData.password,
        accessGroupId,
        email: formData.email.trim() || null,
        phone: formData.phone
          ? `${getDialCodeByPhoneCountryValue(formData.countryCode)}${formData.phone}`
          : null,
        branchId: getOptionalNumber(formData.branchId),
        departmentId: getOptionalNumber(formData.departmentId),
        jobTitleId: getOptionalNumber(formData.jobTitleId),
      };

      await employeeService.createEmployee(payload);
      showToast('Thêm nhân viên thành công!', 'success');
      
      setTimeout(() => {
        onClose();
        if (onSuccess) onSuccess();
      }, 1000);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error('Submit error:', error);
      showToast(error.Message || 'Có lỗi xảy ra khi tạo nhân viên', 'error');
      
      if (error?.errors && typeof error.errors === 'object') {
        // Map backend validation errors if any
        const backendErrors: Record<string, string> = {};
        Object.entries(error.errors as Record<string, unknown>).forEach(([key, value]) => {
          const firstMessage = getBackendErrorMessage(value);
          if (firstMessage) {
            backendErrors[normalizeBackendErrorKey(key)] = firstMessage;
          }
        });
        if (backendErrors.employeeCode) {
          setIsExpanded(true);
        }
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
  const shouldFilterBranchesByRegion = metadata.branches.some((branch) => branch.regionId !== null);
  const filteredBranches = shouldFilterBranchesByRegion && formData.regionId
    ? metadata.branches.filter((branch) => branch.regionId === getOptionalNumber(formData.regionId))
    : metadata.branches;
  const selectedPhoneCountryOption = getPhoneCountryOptionByValue(formData.countryCode);
  const phoneLengthDescription = getPhoneLengthDescriptionByCountryValue(formData.countryCode);
  const phoneValidationHint = `Số điện thoại phải có ${phoneLengthDescription} cho mã ${getDialCodeByPhoneCountryValue(formData.countryCode)}.`;

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
                  {INVITE_LINK}
                </div>
                <button 
                  type="button"
                  onClick={handleCopyInviteLink}

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
              <label className="text-sm font-bold text-gray-700 pt-3">
                Số điện thoại <span className="text-red-500">*</span>
              </label>
              <div className="space-y-1.5">
                <div className="flex gap-2.5">
                  <div className="relative w-[135px] shrink-0 group">
                    <select 
                      value={formData.countryCode}
                      onChange={(e) => handleCountryCodeChange(e.target.value)}
                      className="w-full h-11 rounded-xl border border-gray-200 bg-white px-3 pr-8 text-sm text-transparent appearance-none focus:outline-none focus:border-[#192841] focus:ring-4 focus:ring-[#192841]/5 transition-all cursor-pointer"
                    >
                      {PHONE_COUNTRY_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value} style={{ color: '#0f172a' }}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <span className="pointer-events-none absolute inset-y-0 left-3 right-9 flex items-center truncate text-sm text-gray-700">
                      {selectedPhoneCountryOption?.selectedLabel ?? ''}
                    </span>
                    <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none group-focus-within:rotate-180 transition-transform text-[20px]">expand_more</span>
                  </div>
                  <input 
                    type="tel" 
                    placeholder="Nhập số điện thoại" 
                    value={formData.phone}
                    onChange={handlePhoneChange}
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={getPhoneMaxLength(formData.countryCode)}
                    className={`flex-1 h-11 px-4 border rounded-xl text-sm focus:outline-none focus:ring-4 transition-all ${errors.phone ? 'border-red-400 bg-red-50/30 ring-red-100' : 'border-gray-200 focus:border-[#192841] focus:ring-[#192841]/5'}`}
                  />
                </div>
                {errors.phone ? (
                  <p className="text-[11px] font-medium text-red-500 pl-1">{errors.phone}</p>
                ) : (
                  <p className="text-[11px] font-medium text-gray-400 pl-1">{phoneValidationHint}</p>
                )}
              </div>
            </div>

            {/* Nhóm truy cập */}
            <div className="grid grid-cols-[1fr_2.5fr] items-start gap-6">
              <label className="text-sm font-bold text-gray-700 pt-3">Nhóm truy cập <span className="text-red-500">*</span></label>
              <div className="space-y-1.5">
                <div className="relative group">
                  <select 
                    value={formData.accessGroupId}
                    onChange={(e) => handleInputChange('accessGroupId', e.target.value)}
                    disabled={metadataLoading.accessGroups}
                    className={`w-full h-11 px-4 border rounded-xl text-sm appearance-none bg-white focus:outline-none focus:ring-4 transition-all pr-10 cursor-pointer disabled:bg-gray-50/50 disabled:text-gray-400 disabled:cursor-not-allowed ${errors.accessGroupId ? 'border-red-400 bg-red-50/30 ring-red-100' : 'border-gray-200 focus:border-[#192841] focus:ring-[#192841]/5'}`}
                  >
                    <option value="">{loading || metadataLoading.accessGroups ? 'Đang tải...' : 'Chọn nhóm truy cập'}</option>
                    {metadata.accessGroups.map(g => (
                      <option key={g.id} value={String(g.id)}>{g.name}</option>
                    ))}
                  </select>
                  <span className="material-symbols-outlined absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none group-focus-within:rotate-180 transition-transform text-[20px]">expand_more</span>
                </div>
                {errors.accessGroupId && <p className="text-[11px] font-medium text-red-500 pl-1">{errors.accessGroupId}</p>}
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
                <div className="grid grid-cols-[1fr_2.5fr] items-start gap-6">
                  <label className="text-sm font-bold text-gray-700 flex items-center gap-1">
                    Vùng <span className="text-[11px] font-normal text-gray-400">(Tùy chọn)</span>
                  </label>
                  <div className="relative group">
                    <select 
                      value={formData.regionId}
                      onChange={(e) => handleInputChange('regionId', e.target.value)}
                      disabled={metadataLoading.regions}
                      className="w-full h-11 px-4 border border-gray-200 rounded-xl text-sm appearance-none bg-white focus:outline-none focus:border-[#192841] focus:ring-4 focus:ring-[#192841]/5 transition-all pr-10 cursor-pointer disabled:bg-gray-50/50 disabled:text-gray-400 disabled:cursor-not-allowed"
                    >
                      <option value="">{metadataLoading.regions ? 'Đang tải...' : 'Chọn vùng'}</option>
                      {metadata.regions.map(r => (
                        <option key={r.id} value={r.id}>{r.name}</option>
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
                      className="w-full h-11 px-4 border border-gray-200 rounded-xl text-sm appearance-none bg-white focus:outline-none focus:border-[#192841] focus:ring-4 focus:ring-[#192841]/5 transition-all pr-10 disabled:bg-gray-50/50 disabled:text-gray-400 cursor-pointer disabled:cursor-not-allowed"
                      disabled={metadataLoading.branches || (shouldFilterBranchesByRegion && !formData.regionId)}
                    >
                      <option value="">{metadataLoading.branches ? 'Đang tải...' : shouldFilterBranchesByRegion && !formData.regionId ? 'Chọn vùng trước' : 'Chọn chi nhánh'}</option>
                      {filteredBranches.map(b => (
                        <option key={b.id} value={b.id}>{b.name}</option>
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
                      disabled={metadataLoading.departments}
                      className="w-full h-11 px-4 border border-gray-200 rounded-xl text-sm appearance-none bg-white focus:outline-none focus:border-[#192841] focus:ring-4 focus:ring-[#192841]/5 transition-all pr-10 cursor-pointer disabled:bg-gray-50/50 disabled:text-gray-400 disabled:cursor-not-allowed"
                    >
                      <option value="">{metadataLoading.departments ? 'Đang tải...' : 'Chọn phòng ban'}</option>
                      {metadata.departments.map(d => (
                        <option key={d.id} value={d.id}>{d.name}</option>
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
                      disabled={metadataLoading.jobTitles}
                      className="w-full h-11 px-4 border border-gray-200 rounded-xl text-sm appearance-none bg-white focus:outline-none focus:border-[#192841] focus:ring-4 focus:ring-[#192841]/5 transition-all pr-10 cursor-pointer disabled:bg-gray-50/50 disabled:text-gray-400 disabled:cursor-not-allowed"
                    >
                      <option value="">{metadataLoading.jobTitles ? 'Đang tải...' : 'Chọn chức danh'}</option>
                      {metadata.jobTitles.map(j => (
                        <option key={j.id} value={j.id}>{j.name}</option>
                      ))}
                    </select>
                    <span className="material-symbols-outlined absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none group-focus-within:rotate-180 transition-transform text-[20px]">expand_more</span>
                  </div>
                </div>

                {/* Mã nhân viên */}
                <div className="grid grid-cols-[1fr_2.5fr] items-start gap-6">
                  <label className="text-sm font-bold text-gray-700 flex items-center gap-1">
                    Mã nhân viên <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input 
                      type="text" 
                      placeholder="Nhập mã nhân viên"
                      value={formData.employeeCode}
                      onChange={(e) => handleInputChange('employeeCode', e.target.value)}
                      className={`w-full h-11 px-4 border rounded-xl text-sm focus:outline-none focus:ring-4 transition-all ${errors.employeeCode ? 'border-red-400 bg-red-50/30 ring-red-100' : 'border-gray-200 focus:border-[#192841] focus:ring-[#192841]/5'} ${loading && !formData.employeeCode ? 'animate-pulse bg-gray-50' : ''}`}
                    />
                    {loading && !formData.employeeCode && (
                       <div className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-[#192841]/20 border-t-[#192841] rounded-full animate-spin"></div>
                    )}
                    {errors.employeeCode && <p className="mt-1 text-[11px] font-medium text-red-500 pl-1">{errors.employeeCode}</p>}
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

