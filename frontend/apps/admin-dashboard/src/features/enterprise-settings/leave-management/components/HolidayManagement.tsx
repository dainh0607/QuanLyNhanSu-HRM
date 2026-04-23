import React, { useState, useEffect } from 'react';
import { leaveService, type Holiday, type HolidaySettings } from '../services/leaveService';
import { useToast } from '../../../../hooks/useToast';
import HolidayFormModal from './HolidayFormModal';

type SubTabKey = 'holiday-types' | 'holiday-settings';

const HolidayManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<SubTabKey>('holiday-types');
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [settings, setSettings] = useState<HolidaySettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedHoliday, setSelectedHoliday] = useState<Holiday | null>(null);
  const { showToast, ToastComponent } = useToast();

  const fetchHolidays = async () => {
    setIsLoading(true);
    try {
      const data = await leaveService.getHolidays();
      setHolidays(data);
    } catch (e) {
      showToast("Lỗi khi tải danh sách nghỉ lễ", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSettings = async () => {
    setIsLoading(true);
    try {
      const data = await leaveService.getHolidaySettings();
      setSettings(data);
    } catch (e) {
      showToast("Lỗi khi tải cấu hình", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'holiday-types') {
      fetchHolidays();
    } else {
      fetchSettings();
    }
  }, [activeTab]);

  const handleUpdateSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;

    setIsUpdating(true);
    try {
      await leaveService.updateHolidaySettings(settings);
      showToast("Cập nhật thiết lập nghỉ lễ thành công", "success");
    } catch (e) {
      showToast("Lỗi khi cập nhật", "error");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCreate = () => {
    setSelectedHoliday(null);
    setIsModalOpen(true);
  };

  const handleEdit = (holiday: Holiday) => {
    setSelectedHoliday(holiday);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa ngày nghỉ lễ này?")) {
      try {
        await leaveService.deleteHoliday(id);
        showToast("Xóa thành công", "success");
        fetchHolidays();
      } catch (e) {
        showToast("Lỗi khi xóa", "error");
      }
    }
  };

  return (
    <div className="h-full flex flex-col space-y-6 animate-in fade-in duration-500">
      {ToastComponent}

      {/* Sub-tabs Header (AC 1.1) */}
      <div className="flex items-center justify-between border-b border-slate-100 px-2">
        <div className="flex gap-8">
          <button 
            onClick={() => setActiveTab('holiday-types')}
            className={`py-3 text-[11px] font-black uppercase tracking-widest relative transition-all ${activeTab === 'holiday-types' ? 'text-[#192841]' : 'text-slate-400 hover:text-slate-600'}`}
          >
            Loại nghỉ lễ
            {activeTab === 'holiday-types' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#192841] rounded-full" />}
          </button>
          <button 
            onClick={() => setActiveTab('holiday-settings')}
            className={`py-3 text-[11px] font-black uppercase tracking-widest relative transition-all ${activeTab === 'holiday-settings' ? 'text-[#192841]' : 'text-slate-400 hover:text-slate-600'}`}
          >
            Thiết lập nghỉ lễ
            {activeTab === 'holiday-settings' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#192841] rounded-full" />}
          </button>
        </div>

        {activeTab === 'holiday-types' && (
          <button 
            onClick={handleCreate}
            className="flex items-center gap-2 bg-[#192841] text-white px-5 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest shadow-lg shadow-blue-100 hover:bg-[#111c2f] transition-all"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            Tạo mới
          </button>
        )}
      </div>

      <div className="flex-1 overflow-hidden">
        {activeTab === 'holiday-types' ? (
          <div className="h-full flex flex-col bg-white border border-slate-100 rounded-3xl shadow-sm overflow-hidden">
            {isLoading ? (
              <div className="flex-1 flex flex-col items-center justify-center py-20">
                <div className="w-10 h-10 border-4 border-[#192841] border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Đang tải dữ liệu...</p>
              </div>
            ) : holidays.length === 0 ? (
              /* AC 1.3: Empty State */
              <div className="flex-1 flex flex-col items-center justify-center py-20">
                <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center text-slate-200 mb-6">
                  <span className="material-symbols-outlined text-[40px]">calendar_today</span>
                </div>
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight">Không có dữ liệu</h3>
                <p className="text-xs font-bold text-slate-400 mt-2">Chưa có thông tin ngày nghỉ lễ nào được thiết lập.</p>
                <button 
                  onClick={handleCreate}
                  className="mt-6 px-8 py-2.5 bg-slate-100 text-slate-600 rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all"
                >
                  Thiết lập ngay
                </button>
              </div>
            ) : (
              /* AC 1.2: Data Table */
              <div className="flex-1 overflow-auto custom-scrollbar">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/50 border-b border-slate-100 sticky top-0 z-10 backdrop-blur-md">
                      <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest w-16">STT</th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Tiêu đề</th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Ngày bắt đầu</th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Ngày kết thúc</th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Phòng ban</th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Người sử dụng</th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Ca làm</th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest w-24">Số ngày</th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest w-32">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {holidays.map((h, idx) => (
                      <tr key={h.id} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="px-6 py-4 text-xs font-bold text-slate-400">{(idx + 1).toString().padStart(2, '0')}</td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-black text-[#192841]">{h.title}</div>
                        </td>
                        <td className="px-6 py-4 text-xs font-bold text-slate-600">{h.startDate.split('-').reverse().join('/')}</td>
                        <td className="px-6 py-4 text-xs font-bold text-slate-600">{h.endDate.split('-').reverse().join('/')}</td>
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-1">
                            {h.departments.length > 0 ? (
                              h.departments.map(d => (
                                <span key={d} className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded text-[9px] font-black uppercase border border-blue-100">PB {d}</span>
                              ))
                            ) : (
                              <span className="text-[10px] font-bold text-slate-400">Tất cả</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-xs font-bold text-slate-500">{h.employeeIds.length > 0 ? `${h.employeeIds.length} nhân viên` : 'Tất cả'}</td>
                        <td className="px-6 py-4">
                          <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-[10px] font-bold">{h.shiftName}</span>
                        </td>
                        <td className="px-6 py-4 text-sm font-black text-slate-700">{h.numDays}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
                            <button 
                              onClick={() => handleEdit(h)}
                              className="w-8 h-8 rounded-lg bg-slate-100 text-slate-400 hover:bg-emerald-50 hover:text-emerald-500 transition-all flex items-center justify-center"
                            >
                              <span className="material-symbols-outlined text-[18px]">edit</span>
                            </button>
                            <button 
                              onClick={() => handleDelete(h.id)}
                              className="w-8 h-8 rounded-lg bg-slate-100 text-slate-400 hover:bg-red-50 hover:text-red-500 transition-all flex items-center justify-center"
                            >
                              <span className="material-symbols-outlined text-[18px]">delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ) : (
          /* AC 1.1: Holiday Settings Form */
          <div className="h-full flex flex-col">
            <div className="w-full bg-white border border-slate-100 rounded-[32px] shadow-sm p-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="mb-8">
                <h3 className="text-sm font-black text-[#192841] uppercase tracking-tight">Cấu hình ghi nhận công</h3>
                <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">Thiết lập quy tắc mapping dữ liệu ngày nghỉ lễ sang bảng công</p>
              </div>

              {isLoading ? (
                <div className="py-10 flex flex-col items-center">
                  <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : (
                <form onSubmit={handleUpdateSettings} className="space-y-8">
                  {/* AC 2.1: Hình thức tính công */}
                  <div className="space-y-3">
                    <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Hình thức tính công nghỉ lễ *</label>
                    <div className="relative group">
                      <select 
                        value={settings?.attendanceType}
                        onChange={e => setSettings(prev => prev ? ({ ...prev, attendanceType: e.target.value as any }) : null)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-sm font-black text-slate-700 outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all appearance-none cursor-pointer"
                        required
                      >
                        <option value="workday">Công nghỉ lễ theo ngày công</option>
                        <option value="holiday">Công nghỉ lễ theo ngày lễ</option>
                      </select>
                      <span className="material-symbols-outlined absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none transition-transform group-hover:translate-y-[-40%]">expand_more</span>
                    </div>
                    <p className="text-[10px] font-bold text-slate-400 leading-relaxed">
                      * <span className="text-emerald-600">Ngày công</span>: Dữ liệu được ghi nhận vào cột công làm việc bình thường.<br/>
                      * <span className="text-blue-600">Ngày lễ</span>: Dữ liệu được tách thành cột riêng trong báo cáo chấm công.
                    </p>
                  </div>

                  {/* AC 3.1: Nút Cập nhật */}
                  <div className="pt-4 border-t border-slate-50 flex justify-end">
                    <button 
                      type="submit"
                      disabled={isUpdating}
                      className="px-10 py-3.5 bg-emerald-500 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-lg shadow-emerald-100 hover:bg-emerald-600 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:translate-y-0"
                    >
                      {isUpdating ? 'Đang cập nhật...' : 'Cập nhật thiết lập'}
                    </button>
                  </div>
                </form>
              )}
            </div>
            
            <div className="mt-8 flex items-center gap-3 text-slate-300">
              <span className="material-symbols-outlined text-[18px]">verified_user</span>
              <span className="text-[10px] font-black uppercase tracking-widest">Hệ thống bảo mật dữ liệu cấp Tenant</span>
            </div>
          </div>
        )}
      </div>

      <HolidayFormModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialData={selectedHoliday}
        onSuccess={fetchHolidays}
      />
    </div>
  );
};

export default HolidayManagement;
