import React, { useState } from 'react';
import { useToast } from '../../../../hooks/useToast';
import DatePickerInput from '../../../../components/common/DatePickerInput';
import FilterSidebar, { type EmployeeFilterState } from '../../../employees/components/FilterSidebar';
import { leaveService, type EmployeeLeaveGroup } from '../services/leaveService';




const EmployeeLeaveTracker: React.FC = () => {
  const [startDate, setStartDate] = useState(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const monthStr = String(month).padStart(2, '0');
    return `${year}-${monthStr}-01`;
  });
  const [endDate, setEndDate] = useState(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const monthStr = String(month).padStart(2, '0');
    const lastDay = new Date(year, month, 0).getDate();
    const dayStr = String(lastDay).padStart(2, '0');
    return `${year}-${monthStr}-${dayStr}`;
  });

  const [data, setData] = useState<EmployeeLeaveGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState<EmployeeFilterState>({});
  const { showToast } = useToast();

  const fetchData = React.useCallback(async () => {
    setLoading(true);
    try {
      const result = await leaveService.getLeaveTrackerData(startDate, endDate, filters);
      setData(result);
    } catch (e) {
      showToast("Không thể tải dữ liệu", "error");
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate, filters, showToast]);

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleExport = () => {
    setIsExporting(true);
    // Mock API Call
    setTimeout(() => {
      setIsExporting(false);
      showToast("Xuất dữ liệu thành công. File đang được tải xuống.", "success");
    }, 1500);
  };



  return (
    <div className="h-full flex flex-col space-y-6 animate-in fade-in duration-300">
      
      {/* AC 1.1, 1.2, 1.3: Filters & Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsFilterOpen(true)}
            className={`h-[42px] w-[42px] flex items-center justify-center rounded-full border transition-all ${isFilterOpen ? 'bg-[#192841] text-white border-[#192841]' : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'} mr-2`}
          >
            <span className="material-symbols-outlined text-[20px]">filter_alt</span>
          </button>
          <DatePickerInput
            value={startDate}
            onChange={setStartDate}
            placeholder="Ngày bắt đầu"
            className="w-36"
          />
          <span className="text-sm font-medium text-slate-600">-</span>
          <DatePickerInput
            value={endDate}
            onChange={setEndDate}
            placeholder="Ngày kết thúc"
            className="w-36"
          />
        </div>

        <button 
          onClick={handleExport}
          disabled={isExporting}
          className="h-[42px] px-6 bg-emerald-500 text-white rounded-xl flex items-center gap-2 hover:bg-emerald-600 shadow-lg shadow-emerald-100 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:hover:translate-y-0"
        >
          {isExporting ? (
            <span className="material-symbols-outlined text-[18px] animate-spin">refresh</span>
          ) : (
            <span className="material-symbols-outlined text-[18px]">download</span>
          )}
          <span className="text-sm font-black uppercase tracking-widest">{isExporting ? 'Đang xuất...' : 'Xuất file'}</span>
        </button>
      </div>

      {/* AC 2.1 & 2.2: Grouped Data Table & Sidebar Container */}
      <div className="flex-1 flex flex-row gap-6 overflow-hidden min-h-[500px]">
        <FilterSidebar 
          isOpen={isFilterOpen}
          onClose={() => setIsFilterOpen(false)}
          initialFilters={filters}
          onApply={(nextFilters) => {
            setFilters(nextFilters);
            setIsFilterOpen(false);
            showToast("Đã áp dụng bộ lọc mới", "info");
          }}
        />

        <div className="flex-1 bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden flex flex-col">
          {/* BẮT BUỘC: Tiêu đề cột luôn hiển thị */}
          <div className="grid grid-cols-[1fr_120px_150px_120px_120px_1fr_150px] gap-4 px-6 py-4 bg-slate-50 border-b border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-400">
            <div>Tên</div>
            <div>Loại</div>
            <div>Ngày nghỉ</div>
            <div>Ngày yêu cầu</div>
            <div>Ngày khóa</div>
            <div>Ghi chú</div>
            <div className="text-right">Thời gian nghỉ phép</div>
          </div>
          
          <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Đang tải dữ liệu...</p>
              </div>
            ) : data.length === 0 ? (
               <div className="flex flex-col items-center justify-center py-20 bg-slate-50/30 rounded-3xl border border-dashed border-slate-200">
                 <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-slate-200 shadow-sm mb-4">
                   <span className="material-symbols-outlined text-[32px]">inventory_2</span>
                 </div>
                 <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Không có dữ liệu trong khoảng thời gian này</p>
               </div>
            ) : (
              data.map((group) => {
                const totalDays = group.records.reduce((acc, curr) => acc + curr.durationDays, 0);
                
                return (
                  <div key={group.employeeId} className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                    {/* Group Header */}
                    <div className="bg-slate-50/80 px-4 py-3 border-b border-slate-200 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 font-black flex items-center justify-center text-xs border border-emerald-200">
                        {group.avatar}
                      </div>
                      <div>
                        <h4 className="text-sm font-black text-slate-800">{group.employeeName}</h4>
                        <p className="text-[10px] font-bold text-slate-400 uppercase">Mã NV: {group.employeeId}</p>
                      </div>
                    </div>

                    {/* Group Records */}
                    <div className="divide-y divide-slate-50">
                      {group.records.map(record => (
                        <div key={record.id} className="grid grid-cols-[1fr_120px_150px_120px_120px_1fr_150px] gap-4 px-4 py-3 items-center hover:bg-slate-50/50 transition-colors">
                          <div className="text-sm font-bold text-slate-700">{record.leaveTypeName}</div>
                          <div>
                            <span className={`px-2 py-1 rounded text-[10px] font-black uppercase tracking-wider ${record.leaveTypeCategory === 'paid' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-orange-50 text-orange-600 border border-orange-100'}`}>
                              {record.leaveTypeCategory === 'paid' ? 'Có lương' : 'Không lương'}
                            </span>
                          </div>
                          <div className="text-xs font-bold text-slate-600">
                          {record.dateRange.split('-').reverse().join('/')}
                        </div>
                          <div className="text-[11px] font-medium text-slate-500">{record.requestedAt}</div>
                          <div className="text-[11px] font-medium text-slate-500">{record.lockedAt}</div>
                          <div className="text-xs text-slate-500 truncate" title={record.notes}>{record.notes}</div>
                          <div className="text-right text-sm font-black text-slate-700">{record.durationDays} Ngày</div>
                        </div>
                      ))}
                    </div>

                    {/* Subtotal */}
                    <div className="bg-slate-50/50 px-6 py-3 flex justify-end items-center border-t border-slate-100">
                      <div className="text-sm font-bold text-slate-600 uppercase tracking-widest">
                        Tổng ngày nghỉ: <span className="text-emerald-600 font-black ml-2">{totalDays} Ngày</span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>


    </div>
  );
};

export default EmployeeLeaveTracker;
