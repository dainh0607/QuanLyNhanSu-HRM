import React, { useState, useEffect } from 'react';
import type { EmployeeEditInsuranceItemPayload } from '../../../../../services/employeeService';
import type { EmployeeFullProfile } from '../../../../../services/employee/types';
import { DatePickerInput } from '../../components/FormPrimitives';
import { employeeService } from '../../../../../services/employeeService';

interface InsuranceCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (item: EmployeeEditInsuranceItemPayload) => void;
  profile?: EmployeeFullProfile | null;
  employeeName?: string;
}

interface AddressState {
  country: string;
  city: string;
  district: string;
  ward: string;
  addressLine: string;
}

const INITIAL_ADDRESS: AddressState = {
  country: '',
  city: '',
  district: '',
  ward: '',
  addressLine: '',
};

const InsuranceCreateModal: React.FC<InsuranceCreateModalProps> = ({
  isOpen,
  onClose,
  onAdd,
  profile,
  employeeName = '',
}) => {
  const [formData, setFormData] = useState({
    gender: 'Nam',
    birthDate: '',
    joinDate: '',
    idNumber: '',
    jobTitle: '',
    socialInsuranceNumber: '',
    healthInsuranceNumber: '',
    insuranceStatus: 'Chưa nộp',
    hospitalRegister: '',
    salaryAmount: '',
    unionFee: '',
    // Addresses
    birthPlace: { ...INITIAL_ADDRESS },
    residencePlace: { ...INITIAL_ADDRESS },
    contactPlace: { ...INITIAL_ADDRESS },
    // Contributions
    company: { health: '0', social: '0', unemployment: '0' },
    employee: { health: '0', social: '0', unemployment: '0' },
    note: '',
  });

  const [addressOptions, setAddressOptions] = useState({
    countries: [] as string[],
    birthCities: [] as string[],
    birthDistricts: [] as string[],
    residenceCities: [] as string[],
    residenceDistricts: [] as string[],
    contactCities: [] as string[],
    contactDistricts: [] as string[]
  });

  useEffect(() => {
    if (isOpen) {
      void loadCountries();
      if (profile) {
        setFormData(prev => ({
          ...prev,
          gender: profile.basicInfo?.gender || 'Nam',
          birthDate: profile.basicInfo?.birthDate || '',
          idNumber: profile.basicInfo?.identityNumber || '',
          jobTitle: '', // Job title needs to be fetched or mapped from history
          salaryAmount: String(profile.salaryInfo?.baseSalary || ''),
        }));
      }
    }
  }, [isOpen, profile]);

  const loadCountries = async () => {
    const countries = await employeeService.getAddressCountryOptions();
    setAddressOptions(prev => ({ ...prev, countries }));
  };

  const handleCountryChange = async (type: 'birth' | 'residence' | 'contact', country: string) => {
    const cities = await employeeService.getAddressCityOptions(country);
    const key = `${type}Place` as const;
    setFormData(prev => ({
      ...prev,
      [key]: { ...(prev[key as keyof typeof prev] as AddressState), country, city: '', district: '' }
    }));
    setAddressOptions(prev => ({ ...prev, [`${type}Cities`]: cities, [`${type}Districts`]: [] }));
  };

  const handleCityChange = async (type: 'birth' | 'residence' | 'contact', city: string) => {
    const key = `${type}Place` as const;
    const country = (formData[key as keyof typeof formData] as AddressState).country;
    const districts = await employeeService.getAddressDistrictOptions(country, city);
    setFormData(prev => ({
      ...prev,
      [key]: { ...(prev[key as keyof typeof prev] as AddressState), city, district: '' }
    }));
    setAddressOptions(prev => ({ ...prev, [`${type}Districts`]: districts }));
  };

  const handleDistrictChange = (type: 'birth' | 'residence' | 'contact', district: string) => {
    const key = `${type}Place` as const;
    setFormData(prev => ({
      ...prev,
      [key]: { ...(prev[key as keyof typeof prev] as AddressState), district }
    }));
  };

  const handleAddressFieldChange = (type: 'birth' | 'residence' | 'contact', field: 'ward' | 'addressLine', value: string) => {
    const key = `${type}Place` as const;
    setFormData(prev => ({
      ...prev,
      [key]: { ...(prev[key as keyof typeof prev] as AddressState), [field]: value }
    }));
  };

  const handleSubmit = () => {
    if (!formData.socialInsuranceNumber) return;
    onAdd({
      id: undefined,
      employeeName: employeeName,
      socialInsuranceNumber: formData.socialInsuranceNumber,
      healthInsuranceNumber: formData.healthInsuranceNumber,
      // Note: Full payload would be merged here for actual C&B logic
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-slate-50 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex h-20 items-center justify-between border-b border-slate-200 bg-white px-10">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500 text-white shadow-lg shadow-emerald-500/20">
            <span className="material-symbols-outlined text-[24px]">health_and_safety</span>
          </div>
          <div>
            <h3 className="text-xl font-black text-slate-900 tracking-tight">Thiết lập hồ sơ Bảo hiểm</h3>
            <p className="text-sm font-bold text-slate-400">Thiết lập các mức đóng và địa chỉ tham gia bảo hiểm xã hội</p>
          </div>
        </div>
        <button onClick={onClose} className="flex h-12 w-12 items-center justify-center rounded-full hover:bg-slate-100 text-slate-400">
          <span className="material-symbols-outlined text-[28px]">close</span>
        </button>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto px-10 py-12 scroll-smooth">
        <div className="mx-auto max-w-6xl space-y-12 pb-20">
          
          {/* Section 1: Thông tin chung */}
          <section className="rounded-[40px] border border-slate-100 bg-white p-10 shadow-sm transition-all hover:shadow-lg hover:shadow-slate-200/50">
            <div className="mb-10 flex items-center gap-4">
              <div className="h-8 w-1.5 rounded-full bg-emerald-500"></div>
              <h4 className="text-lg font-black text-slate-900 uppercase tracking-wider">Thông tin chung</h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
               <div className="space-y-2">
                  <label className="text-[13px] font-black uppercase text-slate-400 ml-1">Nhân viên <span className="text-rose-500">*</span></label>
                  <input readOnly value={employeeName} className="h-14 w-full rounded-2xl bg-slate-50 border-none px-6 text-sm font-black text-slate-500" />
               </div>
               <div className="space-y-2">
                  <label className="text-[13px] font-black uppercase text-slate-400 ml-1">Mã nhân viên</label>
                  <input readOnly value={profile?.basicInfo?.employeeCode || ''} className="h-14 w-full rounded-2xl bg-slate-50 border-none px-6 text-sm font-black text-slate-500" />
               </div>
               <div className="space-y-2">
                  <label className="text-[13px] font-black uppercase text-slate-400 ml-1">Giới tính</label>
                  <div className="flex h-14 items-center gap-6 px-4">
                     {['Nam', 'Nữ'].map(g => (
                       <label key={g} className="flex items-center gap-2 cursor-pointer group">
                          <input type="radio" checked={formData.gender === g} onChange={() => setFormData({...formData, gender: g})} className="h-5 w-5 accent-emerald-500" />
                          <span className="text-sm font-bold text-slate-600 group-hover:text-emerald-600">{g}</span>
                       </label>
                     ))}
                  </div>
               </div>
               <div className="space-y-2">
                  <label className="text-[13px] font-black uppercase text-slate-400 ml-1">Ngày sinh</label>
                  <DatePickerInput value={formData.birthDate} onChange={(v: string) => setFormData({...formData, birthDate: v})} />
               </div>
               <div className="space-y-2">
                  <label className="text-[13px] font-black uppercase text-slate-400 ml-1">Mã số BHXH</label>
                  <input value={formData.socialInsuranceNumber} onChange={(e) => setFormData({...formData, socialInsuranceNumber: e.target.value})} className="h-14 w-full rounded-2xl border-2 border-slate-50 bg-slate-50/50 px-6 text-sm font-black" />
               </div>
               <div className="space-y-2">
                  <label className="text-[13px] font-black uppercase text-slate-400 ml-1">Số thẻ BHYT</label>
                  <input value={formData.healthInsuranceNumber} onChange={(e) => setFormData({...formData, healthInsuranceNumber: e.target.value})} className="h-14 w-full rounded-2xl border-2 border-slate-50 bg-slate-50/50 px-6 text-sm font-black" />
               </div>
            </div>
          </section>

          {/* Section 2: Địa chỉ */}
          <section className="space-y-6">
            <div className="mb-10 flex items-center gap-4">
              <div className="h-8 w-1.5 rounded-full bg-blue-500"></div>
              <h4 className="text-lg font-black text-slate-900 uppercase tracking-wider">Khối Địa chỉ</h4>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-left">
               {[
                 { key: 'birthPlace', label: 'Nơi cấp giấy khai sinh' },
                 { key: 'residencePlace', label: 'Địa chỉ cư trú' },
                 { key: 'contactPlace', label: 'Địa chỉ liên hệ' }
               ].map(block => (
                 <div key={block.key} className="rounded-3xl border border-slate-100 bg-white p-8 shadow-sm">
                    <h5 className="mb-6 text-[13px] font-black uppercase text-slate-800 flex items-center gap-2">
                       <span className="material-symbols-outlined text-[18px] text-blue-400">location_on</span>
                       {block.label}
                    </h5>
                    <div className="space-y-4">
                       <select 
                         value={(formData[block.key as keyof typeof formData] as AddressState).country} 
                         onChange={(e) => handleCountryChange(block.key.replace('Place', '') as any, e.target.value)}
                         className="h-12 w-full rounded-xl border border-slate-100 bg-slate-50 px-4 text-xs font-bold"
                       >
                          <option value="">Chọn quốc gia</option>
                          {addressOptions.countries.map(c => <option key={c} value={c}>{c}</option>)}
                       </select>
                       <select 
                         value={(formData[block.key as keyof typeof formData] as AddressState).city} 
                         onChange={(e) => handleCityChange(block.key.replace('Place', '') as any, e.target.value)}
                         className="h-12 w-full rounded-xl border border-slate-100 bg-slate-50 px-4 text-xs font-bold"
                       >
                          <option value="">Chọn Tỉnh/Thành</option>
                          {addressOptions[`${block.key.replace('Place', '')}Cities` as keyof typeof addressOptions].map(c => <option key={c as string} value={c as string}>{c as string}</option>)}
                       </select>
                       <select 
                         value={(formData[block.key as keyof typeof formData] as AddressState).district} 
                         onChange={(e) => handleDistrictChange(block.key.replace('Place', '') as any, e.target.value)}
                         className="h-12 w-full rounded-xl border border-slate-100 bg-slate-50 px-4 text-xs font-bold"
                       >
                          <option value="">Chọn Quận/Huyện</option>
                          {addressOptions[`${block.key.replace('Place', '')}Districts` as keyof typeof addressOptions].map(d => <option key={d as string} value={d as string}>{d as string}</option>)}
                       </select>
                       <input 
                         placeholder="Phường/Xã" 
                         value={(formData[block.key as keyof typeof formData] as AddressState).ward} 
                         onChange={(e) => handleAddressFieldChange(block.key.replace('Place', '') as any, 'ward', e.target.value)}
                         className="h-12 w-full rounded-xl border border-slate-100 bg-slate-50 px-4 text-xs font-bold" 
                       />
                       <input 
                         placeholder="Địa chỉ chi tiết" 
                         value={(formData[block.key as keyof typeof formData] as AddressState).addressLine} 
                         onChange={(e) => handleAddressFieldChange(block.key.replace('Place', '') as any, 'addressLine', e.target.value)}
                         className="h-12 w-full rounded-xl border border-slate-100 bg-slate-50 px-4 text-xs font-bold" 
                       />
                    </div>
                 </div>
               ))}
            </div>
          </section>

          {/* Section 3: Mức đóng */}
          <section className="space-y-6">
            <div className="mb-10 flex items-center gap-4">
              <div className="h-8 w-1.5 rounded-full bg-rose-500"></div>
              <h4 className="text-lg font-black text-slate-900 uppercase tracking-wider">Mức đóng bảo hiểm</h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div className="rounded-[32px] border border-slate-100 bg-rose-50/20 p-10">
                  <h5 className="mb-8 text-sm font-black text-rose-600 uppercase italic">/ Công ty đóng</h5>
                  <div className="space-y-6">
                     {['health', 'social', 'unemployment'].map(k => (
                       <div key={k} className="flex items-center justify-between">
                          <span className="text-[13px] font-bold text-slate-500">{k === 'health' ? 'Bảo hiểm Y tế' : k === 'social' ? 'Bảo hiểm Xã hội' : 'Thất nghiệp'}</span>
                          <input 
                            value={formData.company[k as keyof typeof formData.company]} 
                            onChange={(e) => setFormData({...formData, company: {...formData.company, [k]: e.target.value}})}
                            className="h-12 w-40 rounded-xl bg-white border border-slate-100 px-4 text-right font-black text-rose-500" 
                          />
                       </div>
                     ))}
                  </div>
               </div>
               <div className="rounded-[32px] border border-slate-100 bg-indigo-50/20 p-10">
                  <h5 className="mb-8 text-sm font-black text-indigo-600 uppercase italic">/ Người lao động đóng</h5>
                  <div className="space-y-6">
                     {['health', 'social', 'unemployment'].map(k => (
                       <div key={k} className="flex items-center justify-between">
                          <span className="text-[13px] font-bold text-slate-500">{k === 'health' ? 'Bảo hiểm Y tế' : k === 'social' ? 'Bảo hiểm Xã hội' : 'Thất nghiệp'}</span>
                          <input 
                            value={formData.employee[k as keyof typeof formData.employee]} 
                            onChange={(e) => setFormData({...formData, employee: {...formData.employee, [k]: e.target.value}})}
                            className="h-12 w-40 rounded-xl bg-white border border-slate-100 px-4 text-right font-black text-indigo-500" 
                          />
                       </div>
                     ))}
                  </div>
               </div>
            </div>
          </section>

          {/* Section 4: Ghi chú */}
          <section className="rounded-[40px] border border-slate-100 bg-white p-10 shadow-sm">
             <label className="text-[13px] font-black uppercase text-slate-400 ml-1 block mb-4">Ghi chú bổ sung</label>
             <textarea 
               value={formData.note}
               onChange={(e) => setFormData({...formData, note: e.target.value})}
               className="w-full min-h-[160px] rounded-3xl bg-slate-50/50 p-6 text-sm font-bold border-none outline-none focus:bg-white focus:ring-4 focus:ring-slate-100 transition-all placeholder:text-slate-300" 
               placeholder="Nhập ghi chú chi tiết về hồ sơ bảo hiểm..."
             />
          </section>

        </div>
      </div>

      {/* Footer Actions */}
      <div className="flex h-24 items-center justify-end gap-4 border-t border-slate-200 bg-white px-10">
         <button onClick={onClose} className="h-14 px-8 rounded-2xl text-sm font-black text-slate-400 hover:bg-slate-50 transition-all">Hủy bỏ</button>
         <button onClick={handleSubmit} className="h-14 px-10 rounded-2xl bg-emerald-500 text-sm font-black text-white shadow-lg shadow-emerald-500/20 hover:bg-emerald-600 transition-all active:scale-95">Tạo mới hồ sơ</button>
      </div>
    </div>
  );
};

export default InsuranceCreateModal;
