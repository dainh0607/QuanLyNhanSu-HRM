import React from 'react';
import type { EmployeeFullProfile } from '../../../services/employeeService';
import type { Employee } from '../../employees/types';
import {
  displayValue,
  formatDate,
  formatCurrency,
} from '../utils';
import type { WorkTabKey } from '../edit-modal/types';
import DetailBlock from './DetailBlock';
import DetailField from './DetailField';

const PROMOTION_COLUMNS = [
  { id: 'effectiveDate', label: 'Ngày có hiệu lực' },
  { id: 'decisionType', label: 'Loại quyết định' },
  { id: 'contractType', label: 'Loại HĐ/PLHĐ' },
  { id: 'documentNumber', label: 'Số QĐ/HĐ' },
  { id: 'jobStatus', label: 'Tình trạng công việc' },
  { id: 'city', label: 'Tỉnh/Thành phố' },
  { id: 'district', label: 'Quận/Huyện' },
  { id: 'branch', label: 'Chi nhánh' },
  { id: 'department', label: 'Phòng ban' },
  { id: 'jobTitle', label: 'Chức danh' },
  { id: 'paymentMethod', label: 'Hình thức chi trả' },
  { id: 'salaryLevelName', label: 'Tên bậc lương' },
  { id: 'salaryAmount', label: 'Mức lương' },
  { id: 'allowance', label: 'Phụ cấp' },
  { id: 'otherIncome', label: 'Thu nhập khác' },
  { id: 'note', label: 'Ghi chú' },
];

interface WorkTabContentProps {
  employee: Employee;
  isLoading: boolean;
  loadError: string | null;
  profile: EmployeeFullProfile | null;
  onOpenEditTab: (tab: WorkTabKey) => void;
}

const WorkTabContent: React.FC<WorkTabContentProps> = ({
  isLoading,
  loadError,
  profile,
  onOpenEditTab,
}) => {
  const [isSettingsOpen, setIsSettingsOpen] = React.useState(false);
  const [visibleColumns, setVisibleColumns] = React.useState<string[]>(PROMOTION_COLUMNS.map(c => c.id));
  const [paginationEnabled, setPaginationEnabled] = React.useState(false);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-emerald-500"></div>
          <p className="text-sm font-medium text-slate-500">Đang tải thông tin công việc...</p>
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="rounded-2xl border border-red-100 bg-red-50/50 p-6 text-center">
        <p className="text-sm font-medium text-red-600">{loadError}</p>
      </div>
    );
  }

  const basicInfo = profile?.basicInfo;
  const promotionHistory = profile?.promotionHistory ?? [];
  const workHistory = profile?.workHistory ?? [];
  const salaryInfo = profile?.salaryInfo;
  const contracts = profile?.contracts ?? [];
  const insurances = profile?.insurances ?? [];

  const toggleColumn = (id: string) => {
    setVisibleColumns(prev => 
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  return (
    <div className="relative space-y-10 pb-20">
      {/* SIDEBAR TÙY CHỈNH */}
      {isSettingsOpen && (
        <>
          <div 
            className="fixed inset-0 z-40 bg-slate-900/10 backdrop-blur-[2px]" 
            onClick={() => setIsSettingsOpen(false)}
          />
          <div className="fixed right-0 top-0 z-50 h-full w-[360px] animate-in slide-in-from-right duration-300 border-l border-slate-200 bg-white shadow-2xl">
            <div className="flex h-full flex-col">
              <div className="flex items-center justify-between border-b border-slate-100 p-6">
                <h3 className="text-lg font-black text-slate-900">Tùy chỉnh</h3>
                <button 
                  onClick={() => setIsSettingsOpen(false)}
                  className="rounded-full p-2 text-slate-400 hover:bg-slate-50 hover:text-slate-600"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6">
                <div className="mb-8 flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Cột</h4>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold text-slate-400 uppercase">Phân trang</span>
                    <button 
                      onClick={() => setPaginationEnabled(!paginationEnabled)}
                      className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer items-center rounded-full transition-colors ${paginationEnabled ? 'bg-emerald-500' : 'bg-slate-200'}`}
                    >
                      <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${paginationEnabled ? 'translate-x-5.5' : 'translate-x-1'}`} />
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  {PROMOTION_COLUMNS.map((col) => (
                    <div 
                      key={col.id}
                      className="flex items-center justify-between rounded-xl bg-slate-50/50 p-4 transition-colors hover:bg-slate-50"
                    >
                      <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-[18px] text-slate-300">drag_indicator</span>
                        <span className="text-sm font-medium text-slate-700">{col.label}</span>
                      </div>
                      <button 
                        onClick={() => toggleColumn(col.id)}
                        className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer items-center rounded-full transition-colors ${visibleColumns.includes(col.id) ? 'bg-emerald-500' : 'bg-slate-200'}`}
                      >
                        <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${visibleColumns.includes(col.id) ? 'translate-x-5.5' : 'translate-x-1'}`} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* TRẠNG THÁI */}
      <DetailBlock 
        title="Trạng thái" 
        headerAction="Sửa" 
        onActionClick={() => onOpenEditTab('jobStatus')}
      >
        <div className="grid grid-cols-1 gap-x-12 gap-y-8 rounded-2xl bg-slate-50/50 p-8 md:grid-cols-2 lg:grid-cols-4">
          <DetailField label="Ngày vào làm" value={formatDate(basicInfo?.startDate)} />
          <DetailField label="Ngày ký hợp đồng lao động (Ngày làm việc chính thức)" value={formatDate(basicInfo?.contractSignDate)} />
          <DetailField label="Ngày hết hạn" value={formatDate(basicInfo?.contractExpiryDate)} />
          <DetailField label="Hình thức làm việc" value={displayValue(basicInfo?.workType)} />
          <DetailField label="Tháng thâm niên" value={displayValue(basicInfo?.seniorityMonths?.toString())} />
          <DetailField label="Ghi chú" value={displayValue(basicInfo?.note)} className="lg:col-span-2" />
        </div>
      </DetailBlock>

      {/* THÔNG TIN CÔNG VIỆC */}
      <DetailBlock 
        title="Thông tin công việc" 
        headerAction="Sửa"
        onActionClick={() => onOpenEditTab('jobInfo')}
      >
        <div className="grid grid-cols-1 gap-x-12 gap-y-8 rounded-2xl bg-slate-50/50 p-8 md:grid-cols-2 lg:grid-cols-4">
          <DetailField label="Vùng" value={displayValue(basicInfo?.regionName)} />
          <DetailField label="Chi nhánh" value={displayValue(basicInfo?.branchName)} />
          <DetailField label="Chi nhánh kiêm nhiệm" value="-" />
          <DetailField label="Phòng ban" value={displayValue(basicInfo?.departmentName)} />
          <DetailField label="Phòng ban kiêm nhiệm" value="-" />
          <DetailField label="Chức danh" value={displayValue(basicInfo?.jobTitleName)} />
          <DetailField label="Chức danh kiêm nhiệm" value="-" />
          <DetailField label="Nhóm truy cập" value={displayValue(basicInfo?.accessGroup)} />
          <DetailField label="Quản lý trực tiếp" value={displayValue(basicInfo?.managerName)} />
        </div>
      </DetailBlock>

      {/* LỊCH SỬ THĂNG TIẾN */}
      <DetailBlock 
        title="Lịch sử thăng tiến" 
        headerAction="Sửa"
        onActionClick={() => onOpenEditTab('promotionHistory')}
      >
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
             <span className="text-xs font-bold text-slate-400">Đang hiển thị {promotionHistory.length}/7</span>
             <div className="relative">
                <select className="h-8 rounded-lg bg-slate-50 px-3 text-[11px] font-bold text-slate-500 outline-none hover:bg-slate-100 border-none cursor-pointer">
                  <option>Lọc trường thay đổi</option>
                </select>
             </div>
          </div>
          <div className="flex items-center gap-3">
             <button 
                onClick={() => setIsSettingsOpen(true)}
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-50 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
             >
                <span className="material-symbols-outlined text-[20px]">menu</span>
             </button>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-slate-50/80">
                  <th className="px-4 py-4 first:pl-8">
                     <div className="h-4 w-4 border-2 border-slate-200 rounded-md"></div>
                  </th>
                  {PROMOTION_COLUMNS.filter(c => visibleColumns.includes(c.id)).map((col) => (
                    <th key={col.id} className="whitespace-nowrap px-4 py-4 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500 last:pr-8">
                      {col.label}
                    </th>
                  ))}
                  <th className="px-4 py-4 last:pr-8"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {promotionHistory.length === 0 ? (
                  <tr>
                    <td colSpan={visibleColumns.length + 2} className="py-20 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="rounded-full bg-slate-50 p-4">
                          <svg className="h-6 w-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                          </svg>
                        </div>
                        <span className="text-sm font-medium text-slate-400">Trống</span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  promotionHistory.map((p, idx) => (
                    <tr key={idx} className="group transition-colors hover:bg-slate-50/50">
                      <td className="px-4 py-4 first:pl-8">
                         <div className="h-4 w-4 border-2 border-slate-200 rounded-md"></div>
                      </td>
                      {visibleColumns.includes('effectiveDate') && (
                        <td className="whitespace-nowrap px-4 py-4 text-sm font-medium text-slate-600">{formatDate(p.effectiveDate)}</td>
                      )}
                      {visibleColumns.includes('decisionType') && (
                        <td className="whitespace-nowrap px-4 py-4 text-sm text-slate-600">{displayValue(p.decisionType)}</td>
                      )}
                      {visibleColumns.includes('contractType') && (
                        <td className="whitespace-nowrap px-4 py-4 text-sm text-slate-600">{displayValue(p.contractType)}</td>
                      )}
                      {visibleColumns.includes('documentNumber') && (
                        <td className="whitespace-nowrap px-4 py-4 text-sm font-mono font-medium text-slate-900">{displayValue(p.decisionNumber)}</td>
                      )}
                      {visibleColumns.includes('jobStatus') && (
                        <td className="whitespace-nowrap px-4 py-4 text-sm text-slate-600">{displayValue(p.workStatus)}</td>
                      )}
                      {visibleColumns.includes('city') && (
                        <td className="whitespace-nowrap px-4 py-4 text-sm text-slate-400">-</td>
                      )}
                      {visibleColumns.includes('district') && (
                        <td className="whitespace-nowrap px-4 py-4 text-sm text-slate-400">-</td>
                      )}
                      {visibleColumns.includes('branch') && (
                        <td className="whitespace-nowrap px-4 py-4 text-sm text-slate-600">{displayValue(p.branchName)}</td>
                      )}
                      {visibleColumns.includes('department') && (
                        <td className="whitespace-nowrap px-4 py-4 text-sm text-slate-600">{displayValue(p.departmentName)}</td>
                      )}
                      {visibleColumns.includes('jobTitle') && (
                        <td className="whitespace-nowrap px-4 py-4 text-sm font-semibold text-slate-900">{displayValue(p.jobTitleName)}</td>
                      )}
                      {visibleColumns.includes('paymentMethod') && (
                        <td className="whitespace-nowrap px-4 py-4 text-sm text-slate-600">{displayValue(p.paymentMethod)}</td>
                      )}
                      {visibleColumns.includes('salaryLevelName') && (
                        <td className="whitespace-nowrap px-4 py-4 text-sm text-slate-600">{displayValue(p.salaryGrade)}</td>
                      )}
                      {visibleColumns.includes('salaryAmount') && (
                        <td className="whitespace-nowrap px-4 py-4 text-sm font-bold text-emerald-600">{formatCurrency(p.salaryAmount)}</td>
                      )}
                      {visibleColumns.includes('allowance') && (
                        <td className="whitespace-nowrap px-4 py-4 text-sm text-emerald-600">
                          {p.allowance ? (
                            <button className="rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-[11px] font-bold text-emerald-600 hover:bg-emerald-100 transition-colors">Xem chi tiết</button>
                          ) : '-'}
                        </td>
                      )}
                      {visibleColumns.includes('otherIncome') && (
                        <td className="whitespace-nowrap px-4 py-4 text-sm text-emerald-600">
                           <button className="rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-[11px] font-bold text-emerald-600 hover:bg-emerald-100 transition-colors">Xem chi tiết</button>
                        </td>
                      )}
                      {visibleColumns.includes('note') && (
                        <td className="whitespace-nowrap px-4 py-4 text-sm text-slate-500">{displayValue(p.note)}</td>
                      )}
                      <td className="whitespace-nowrap px-4 py-4 text-right last:pr-8">
                         <button className="text-slate-300 hover:text-emerald-500">
                            <span className="material-symbols-outlined">more_horiz</span>
                         </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </DetailBlock>

      {/* LỊCH SỬ CÔNG TÁC */}
      <DetailBlock 
        title="Lịch sử công tác" 
        headerAction="Sửa"
        onActionClick={() => onOpenEditTab('workHistory')}
      >
        <div className="rounded-2xl bg-slate-50/50 p-8">
          {workHistory.length === 0 ? (
            <p className="text-sm font-medium text-slate-400">Chưa có thông tin lịch sử công tác.</p>
          ) : (
            <div className="grid grid-cols-1 gap-x-12 gap-y-10 md:grid-cols-2 lg:grid-cols-4">
              {workHistory.map((w, idx) => (
                <React.Fragment key={idx}>
                  <DetailField label="Nơi làm việc" value={displayValue(w.companyName)} />
                  <DetailField label="Chức danh" value={displayValue(w.jobTitle)} />
                  <DetailField label="Thời gian làm việc" value={displayValue(w.workDuration)} />
                  <DetailField label="Ngày bắt đầu" value={formatDate(w.startDate)} />
                  <DetailField label="Ngày kết thúc" value={w.isCurrent ? 'Hiện tại' : formatDate(w.endDate)} />
                </React.Fragment>
              ))}
            </div>
          )}
        </div>
      </DetailBlock>

      {/* TIỀN LƯƠNG/TRỢ CẤP */}
      <DetailBlock 
        title="Tiền lương/Trợ cấp" 
        headerAction="Sửa"
        onActionClick={() => onOpenEditTab('salaryAllowance')}
      >
        <div className="space-y-12">
          {/* Lương chính */}
          <div className="grid grid-cols-1 gap-8 rounded-2xl bg-slate-50/50 p-8 md:grid-cols-3">
            <DetailField label="Hình thức chi trả" value={displayValue(salaryInfo?.paymentMethod)} />
            <DetailField label="Tên bậc lương" value={displayValue(salaryInfo?.salaryGrade)} />
            <DetailField label="Mức lương" value={formatCurrency(salaryInfo?.baseSalary)} className="text-emerald-600" />
          </div>

          {/* Tiền lương thay đổi */}
          <div>
            <h4 className="mb-6 text-[11px] font-black uppercase tracking-[2px] text-slate-900 border-b border-slate-200 pb-2">Tiền lương thay đổi</h4>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
              <DetailField label="Hình thức chi trả" value="-" />
              <DetailField label="Số tiền (VNĐ)" value="-" />
              <DetailField label="Tên bậc lương" value="-" />
              <DetailField label="Khoảng thời gian" value="-" />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
            {/* Phụ cấp */}
            <div>
              <h4 className="mb-6 text-[11px] font-black uppercase tracking-[2px] text-slate-900 border-b border-slate-200 pb-2">Phụ cấp</h4>
              <div className="grid grid-cols-2 gap-8">
                {salaryInfo?.allowances && salaryInfo.allowances.length > 0 ? (
                  salaryInfo.allowances.map((a, idx) => (
                    <React.Fragment key={idx}>
                      <DetailField label="Tên phụ cấp" value={a.name} />
                      <DetailField label="Số tiền (VNĐ)" value={formatCurrency(a.amount)} className="text-emerald-600" />
                    </React.Fragment>
                  ))
                ) : (
                  <>
                    <DetailField label="Tên phụ cấp" value="-" />
                    <DetailField label="Số tiền (VNĐ)" value="-" />
                  </>
                )}
              </div>
            </div>

            {/* Thu nhập khác */}
            <div>
              <h4 className="mb-6 text-[11px] font-black uppercase tracking-[2px] text-slate-900 border-b border-slate-200 pb-2">Thu nhập khác</h4>
              <div className="grid grid-cols-2 gap-8">
                {salaryInfo?.otherIncomes && salaryInfo.otherIncomes.length > 0 ? (
                  salaryInfo.otherIncomes.map((o, idx) => (
                    <React.Fragment key={idx}>
                      <DetailField label="Tên thu nhập" value={o.name} />
                      <DetailField label="Số tiền (VNĐ)" value={formatCurrency(o.amount)} className="text-emerald-600" />
                    </React.Fragment>
                  ))
                ) : (
                  <>
                    <DetailField label="Tên thu nhập" value="-" />
                    <DetailField label="Số tiền (VNĐ)" value="-" />
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </DetailBlock>

      {/* HỢP ĐỒNG */}
      <DetailBlock 
        title="Hợp đồng" 
        headerAction="Tạo mới" 
        actionClassName="bg-emerald-500 text-white hover:bg-emerald-600"
        onActionClick={() => onOpenEditTab('contract')}
      >
        <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
          <div className="bg-slate-50/50 px-8 py-3 border-b border-slate-100">
            <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">Danh sách hợp đồng</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-white border-b border-slate-100">
                  <th className="px-6 py-4 text-left text-[11px] font-bold uppercase text-slate-400">STT</th>
                  <th className="px-6 py-4 text-left text-[11px] font-bold uppercase text-slate-400">Họ và tên</th>
                  <th className="px-6 py-4 text-left text-[11px] font-bold uppercase text-slate-400">Số</th>
                  <th className="px-6 py-4 text-left text-[11px] font-bold uppercase text-slate-400">Loại hợp đồng</th>
                  <th className="px-6 py-4 text-left text-[11px] font-bold uppercase text-slate-400">Ngày ký</th>
                  <th className="px-6 py-4 text-left text-[11px] font-bold uppercase text-slate-400">Ngày hết hạn</th>
                  <th className="px-6 py-4 text-left text-[11px] font-bold uppercase text-slate-400">Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {contracts.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-16 text-center">
                      <div className="flex flex-col items-center gap-2">
                         <div className="h-10 w-10 flex items-center justify-center rounded-full bg-slate-50">
                           <svg className="h-5 w-5 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                         </div>
                         <span className="text-sm text-slate-400">Trống</span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  contracts.map((c, idx) => (
                    <tr key={c.id} className="hover:bg-slate-50/50 transition-colors border-b border-slate-50 last:border-0">
                      <td className="px-6 py-4 text-sm text-slate-600">{idx + 1}</td>
                      <td className="px-6 py-4 text-sm font-medium text-slate-900">{displayValue(profile?.basicInfo.fullName)}</td>
                      <td className="px-6 py-4 text-sm font-mono text-slate-900">{displayValue(c.contractNumber)}</td>
                      <td className="px-6 py-4 text-sm text-slate-600 font-medium">{displayValue(c.contractType)}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">{formatDate(c.signDate)}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">{formatDate(c.expiryDate)}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold ${
                          c.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {c.status === 'Active' ? 'Đang hiệu lực' : displayValue(c.status)}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </DetailBlock>

      {/* BẢO HIỂM */}
      <DetailBlock 
        title="Bảo hiểm" 
        headerAction="Tạo mới" 
        actionClassName="bg-emerald-500 text-white hover:bg-emerald-600"
        onActionClick={() => onOpenEditTab('insurance')}
      >
        <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
          <div className="bg-slate-50/50 px-8 py-3 border-b border-slate-100">
            <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">Bảo hiểm</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-white border-b border-slate-100">
                  <th className="px-6 py-4 text-left text-[11px] font-bold uppercase text-slate-400">STT</th>
                  <th className="px-6 py-4 text-left text-[11px] font-bold uppercase text-slate-400">Tên nhân viên</th>
                  <th className="px-6 py-4 text-left text-[11px] font-bold uppercase text-slate-400">Mã số BHXH</th>
                  <th className="px-6 py-4 text-left text-[11px] font-bold uppercase text-slate-400">Số thẻ bảo hiểm y tế</th>
                </tr>
              </thead>
              <tbody>
                {insurances.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-20 text-center">
                      <div className="flex flex-col items-center gap-4">
                        <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-slate-50 text-slate-300">
                          <span className="material-symbols-outlined text-[32px]">health_and_safety</span>
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm font-bold text-slate-400">Trống</p>
                          <p className="text-[11px] font-medium text-slate-300">Nhân viên chưa có thông tin bảo hiểm.</p>
                        </div>
                      </div>
                    </td>
                  </tr>
                ) : (
                  insurances.map((i, idx) => (
                    <tr key={i.id} className="hover:bg-slate-50/50 transition-colors border-b border-slate-50 last:border-0">
                      <td className="px-6 py-4 text-sm text-slate-600">{idx + 1}</td>
                      <td className="px-6 py-4 text-sm font-semibold text-slate-900">{displayValue(profile?.basicInfo.fullName)}</td>
                      <td className="px-6 py-4 text-sm font-mono text-slate-900">{displayValue(i.socialInsuranceNumber)}</td>
                      <td className="px-6 py-4 text-sm font-mono text-slate-900">{displayValue(i.healthInsuranceNumber)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </DetailBlock>
    </div>
  );
};

export default WorkTabContent;
