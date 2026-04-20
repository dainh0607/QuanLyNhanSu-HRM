import React from 'react';
import type {
  EmployeeEditWorkHistoryItemPayload,
  EmployeeEditWorkHistoryPayload,
} from '../../../../services/employeeService';
import { DatePickerInput, FormHeading, FormRow } from '../components/FormPrimitives';
import { getFieldClassName } from '../formStyles';
import EmptyState from '../../components/EmptyState';

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
  workDuration: '',
  isCurrent: false,
  note: '',
});

const WorkHistoryForm: React.FC<WorkHistoryFormProps> = ({ data, errors, onChange }) => {
  const workItems = data;

  const updateItem = (index: number, patch: Partial<EmployeeEditWorkHistoryItemPayload>) => {
    const next = [...workItems];
    const currentItem = next[index];
    
    // AC 2.1: Nếu bật switch "Hiện tại", xóa rỗng dữ liệu ngày kết thúc
    if (patch.isCurrent === true) {
      patch.endDate = '';
    }

    next[index] = { ...currentItem, ...patch };
    onChange(next);
  };

  const handleCreateNew = () => {
    onChange([...workItems, createEmptyWorkItem()]);
  };

  const handleRemove = (index: number) => {
    onChange(workItems.filter((_, itemIndex) => itemIndex !== index));
  };

  const getItemError = (index: number, field: keyof EmployeeEditWorkHistoryItemPayload): string | undefined =>
    errors[`workHistory.${index}.${field}`];

  // AC 4.1: Validation ngày tháng đơn giản (UI level)
  const isDateInvalid = (item: EmployeeEditWorkHistoryItemPayload) => {
    if (!item.isCurrent && item.startDate && item.endDate) {
      return new Date(item.endDate) < new Date(item.startDate);
    }
    return false;
  };

  return (
    <>
      <div className="flex items-center justify-between mb-8">
        <FormHeading
          title="Lịch sử công tác"
          description="Ghi nhận hồ sơ kinh nghiệm làm việc trong quá khứ và hiện tại của nhân viên."
        />
        <button
          type="button"
          onClick={handleCreateNew}
          className="flex items-center gap-2 rounded-xl bg-emerald-500 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-emerald-500/20 transition-all hover:bg-emerald-600 active:scale-95 translate-y-[-10px]"
        >
          <span className="material-symbols-outlined text-[20px]">add</span>
          Tạo mới
        </button>
      </div>

      <div className="space-y-6">
        {workItems.length === 0 ? (
          <div className="py-20 bg-slate-50/50 rounded-[32px] border-2 border-dashed border-slate-200">
            <EmptyState 
              message="Chưa có hồ sơ công tác nào"
              icon="history"
              onAdd={handleCreateNew}
            />
          </div>
        ) : (
          workItems.map((item, index) => (
            <section
              key={item.id || `work-${index}`}
              className="relative rounded-[32px] border border-slate-200 bg-white p-8 shadow-[0_8px_30px_rgb(0,0,0,0.02)] transition-all hover:shadow-[0_20px_40px_rgba(0,0,0,0.04)] animate-in fade-in slide-in-from-top-4 duration-500"
            >
              {/* AC 1.1: Icon X xóa khối ở góc trên bên phải */}
              <button
                type="button"
                onClick={() => handleRemove(index)}
                className="absolute right-6 top-6 flex h-10 w-10 items-center justify-center rounded-full bg-slate-50 text-slate-400 transition-all hover:bg-rose-50 hover:text-rose-500"
                aria-label="Xóa hồ sơ"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>

              <div className="mb-8">
                <span className="text-[11px] font-black uppercase tracking-widest text-emerald-500 bg-emerald-50 px-3 py-1 rounded-full">Hồ sơ {index + 1}</span>
              </div>

              <div className="space-y-6">
                {/* AC 1.2: Các trường dữ liệu */}
                <FormRow label="Nơi làm việc">
                  <input
                    type="text"
                    value={item.company}
                    onChange={(e) => updateItem(index, { company: e.target.value })}
                    className={getFieldClassName(Boolean(getItemError(index, 'company')))}
                    placeholder="Tên công ty / Nơi làm việc"
                  />
                </FormRow>

                <FormRow label="Chức danh">
                  <input
                    type="text"
                    value={item.position}
                    onChange={(e) => updateItem(index, { position: e.target.value })}
                    className={getFieldClassName(Boolean(getItemError(index, 'position')))}
                    placeholder="Vị trí đảm nhiệm"
                  />
                </FormRow>

                <FormRow label="Thời gian làm việc" description="Nhập text tự do như '2 năm', '6 tháng'...">
                  <input
                    type="text"
                    value={item.workDuration}
                    onChange={(e) => updateItem(index, { workDuration: e.target.value })}
                    className={getFieldClassName(Boolean(getItemError(index, 'workDuration')))}
                    placeholder="Ví dụ: 2 năm"
                  />
                </FormRow>

               

                <FormRow label="Ngày bắt đầu">
                  <DatePickerInput
                    value={item.startDate}
                    onChange={(val) => updateItem(index, { startDate: val })}
                    hasError={Boolean(getItemError(index, 'startDate'))}
                  />
                </FormRow>

                {/* AC 2.1 & 2.2: Ẩn/hiện trường Ngày kết thúc */}
                {!item.isCurrent && (
                  <FormRow label="Ngày kết thúc">
                    <div className="space-y-2">
                      <DatePickerInput
                        value={item.endDate}
                        onChange={(val) => updateItem(index, { endDate: val })}
                        hasError={Boolean(getItemError(index, 'endDate')) || isDateInvalid(item)}
                      />
                      {isDateInvalid(item) && (
                        <p className="text-[11px] font-bold text-rose-500 mt-1 ml-1">Ngày kết thúc phải lớn hơn ngày bắt đầu</p>
                      )}
                    </div>
                  </FormRow>
                )}
                 <FormRow label="Hiện tại">
                  <div className="flex items-center gap-4">
                    {/* AC 2.1: Toggle Switch Currently Working */}
                    <button 
                      type="button"
                      onClick={() => updateItem(index, { isCurrent: !item.isCurrent })}
                      className={`relative flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${item.isCurrent ? 'bg-emerald-500' : 'bg-slate-200'}`}
                    >
                      <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ${item.isCurrent ? 'translate-x-5' : 'translate-x-0'}`} />
                    </button>
                    
                  </div>
                </FormRow>
              </div>
            </section>
          ))
        )}
      </div>
    </>
  );
};

export default WorkHistoryForm;
