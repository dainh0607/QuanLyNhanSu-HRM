import React from 'react';
import type {
  EmployeeEditWorkHistoryItemPayload,
  EmployeeEditWorkHistoryPayload,
} from '../../../../services/employeeService';
import { DatePickerInput } from '../components/FormPrimitives';

interface WorkHistoryFormProps {
  data: EmployeeEditWorkHistoryPayload;
  errors: Record<string, string>;
  onChange: (value: EmployeeEditWorkHistoryPayload) => void;
}

const createEmptyWorkItem = (): EmployeeEditWorkHistoryItemPayload => ({
  id: Math.random().toString(36).substr(2, 9),
  startDate: '',
  endDate: '',
  company: '',
  position: '',
  workDuration: '0',
  isCurrent: false,
  note: '',
});

const WorkHistoryForm: React.FC<WorkHistoryFormProps> = ({ data, onChange }) => {
  const items = data.length > 0 ? data : [createEmptyWorkItem()];

  const updateItem = (index: number, patch: Partial<EmployeeEditWorkHistoryItemPayload>) => {
    onChange(
      items.map((item, itemIndex) =>
        itemIndex === index
          ? {
              ...item,
              ...patch,
            }
          : item,
      ),
    );
  };

  const handleCreateNew = () => {
    onChange([...items, createEmptyWorkItem()]);
  };

  const handleRemove = (index: number) => {
    onChange(items.filter((_, itemIndex) => itemIndex !== index));
  };

  return (
    <div className="mx-auto max-w-5xl lg:px-4">
      {/* Header section with add button */}
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-6 w-1 rounded-full bg-emerald-500"></div>
          <h3 className="text-[17px] font-bold text-slate-800">Lịch sử công tác</h3>
        </div>
        <button 
          onClick={handleCreateNew}
          className="flex items-center gap-1 text-emerald-500 text-[14px] font-bold hover:text-emerald-600 transition-colors"
        >
          <span className="material-symbols-outlined text-[20px]">add</span>
          Thêm
        </button>
      </div>

      <div className="space-y-6">
        {items.map((item, index) => (
          <div
            key={item.id || `work-history-${index}`}
            className="relative rounded-[24px] border border-slate-100 bg-white p-6 pt-12 shadow-sm animate-in fade-in slide-in-from-top-2 duration-300"
          >
            {/* Remove button at top right */}
            <button 
              onClick={() => handleRemove(index)}
              className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-white text-slate-300 shadow-sm transition-all hover:bg-rose-50 hover:text-rose-500"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>

            <div className="space-y-5">
              {/* Nơi làm việc */}
              <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] items-center gap-4">
                <label className="text-sm font-bold text-slate-800">Nơi làm việc</label>
                <input
                  type="text"
                  value={item.company}
                  onChange={(e) => updateItem(index, { company: e.target.value })}
                  className="h-11 w-full rounded-xl border-none bg-[#F8FAFC] px-4 text-sm font-medium text-slate-700 outline-none focus:ring-2 focus:ring-emerald-500/10"
                  placeholder="Nơi làm việc"
                />
              </div>

              {/* Chức danh */}
              <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] items-center gap-4">
                <label className="text-sm font-bold text-slate-800">Chức danh</label>
                <input
                  type="text"
                  value={item.position}
                  onChange={(e) => updateItem(index, { position: e.target.value })}
                  className="h-11 w-full rounded-xl border-none bg-[#F8FAFC] px-4 text-sm font-medium text-slate-700 outline-none focus:ring-2 focus:ring-emerald-500/10"
                  placeholder="Chức danh"
                />
              </div>

              {/* Thời gian làm việc */}
              <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] items-center gap-4">
                <label className="text-sm font-bold text-slate-800">Thời gian làm việc</label>
                <input
                  type="text"
                  value={item.workDuration}
                  onChange={(e) => updateItem(index, { workDuration: e.target.value.replace(/\D/g, '') })}
                  className="h-11 w-full rounded-xl border-none bg-[#F8FAFC] px-4 text-sm font-medium text-slate-700 outline-none focus:ring-2 focus:ring-emerald-500/10"
                  placeholder="0"
                />
              </div>

              {/* Ngày bắt đầu */}
              <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] items-center gap-4">
                <label className="text-sm font-bold text-slate-800">Ngày bắt đầu</label>
                <DatePickerInput
                  value={item.startDate}
                  onChange={(val) => updateItem(index, { startDate: val })}
                  className="h-11 !rounded-xl !border-none !bg-[#F8FAFC] !px-4 !text-sm !outline-none"
                />
              </div>

              {/* Ngày kết thúc */}
              {!item.isCurrent && (
                <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] items-center gap-4 animate-in fade-in slide-in-from-top-1 duration-200">
                  <label className="text-sm font-bold text-slate-800">Ngày kết thúc</label>
                  <DatePickerInput
                    value={item.endDate}
                    onChange={(val) => updateItem(index, { endDate: val })}
                    className="h-11 !rounded-xl !border-none !bg-[#F8FAFC] !px-4 !text-sm !outline-none"
                  />
                </div>
              )}

              {/* Hiện tại */}
              <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] items-center gap-4">
                <label className="text-sm font-bold text-slate-800">Hiện tại</label>
                <button 
                  type="button"
                  onClick={() => updateItem(index, { isCurrent: !item.isCurrent })}
                  className={`relative flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${item.isCurrent ? 'bg-emerald-500' : 'bg-slate-200'}`}
                >
                  <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${item.isCurrent ? 'translate-x-5' : 'translate-x-0'}`}></span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WorkHistoryForm;
