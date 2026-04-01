import React from 'react';
import type {
  EmployeeEditEducationItemPayload,
  EmployeeEditEducationPayload,
} from '../../../../services/employeeService';
import { FormHeading, FormRow } from '../components/FormPrimitives';
import { getFieldClassName } from '../formStyles';

interface EducationListFormProps {
  data: EmployeeEditEducationPayload;
  onChange: (value: EmployeeEditEducationPayload) => void;
}

const EDUCATION_LEVEL_OPTIONS = [
  'Trung cấp',
  'Cao đẳng',
  'Cử nhân',
  'Kỹ sư',
  'Thạc sĩ',
  'Tiến sĩ',
  'Khác',
] as const;

const EDUCATION_MAJOR_OPTIONS = [
  'Công nghệ thông tin',
  'Kế toán',
  'Tài chính - Ngân hàng',
  'Quản trị kinh doanh',
  'Quản trị nhân sự',
  'Marketing',
  'Luật',
  'Ngôn ngữ Anh',
  'Xây dựng',
  'Kiến trúc',
  'Điện - Điện tử',
  'Cơ khí',
  'Logistics',
  'Thiết kế đồ họa',
  'Truyền thông',
  'Khác',
] as const;

const createEmptyEducationItem = (): EmployeeEditEducationItemPayload => ({
  id: undefined,
  institution: '',
  major: '',
  level: '',
  issueDate: '',
  note: '',
});

const mergeOptions = (
  defaults: readonly string[],
  dynamicValues: Array<string | undefined>,
): string[] => {
  const values = new Set<string>(defaults);

  dynamicValues.forEach((value) => {
    const normalizedValue = value?.trim() ?? '';
    if (normalizedValue) {
      values.add(normalizedValue);
    }
  });

  return Array.from(values);
};

const selectClassName = `${getFieldClassName(false)} appearance-none pr-12`;

const EducationListForm: React.FC<EducationListFormProps> = ({ data, onChange }) => {
  const educationItems = data.length > 0 ? data : [createEmptyEducationItem()];
  const levelOptions = mergeOptions(
    EDUCATION_LEVEL_OPTIONS,
    educationItems.map((item) => item.level),
  );
  const majorOptions = mergeOptions(
    EDUCATION_MAJOR_OPTIONS,
    educationItems.map((item) => item.major),
  );

  const updateItem = (
    index: number,
    patch: Partial<EmployeeEditEducationItemPayload>,
  ) => {
    onChange(
      educationItems.map((item, itemIndex) =>
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
    onChange([...educationItems, createEmptyEducationItem()]);
  };

  const handleRemove = (index: number) => {
    if (educationItems.length <= 1) {
      return;
    }

    onChange(educationItems.filter((_, itemIndex) => itemIndex !== index));
  };

  return (
    <>
      <FormHeading
        title="Trình độ học vấn"
        description="Quản lý nhiều bằng cấp hoặc quá trình đào tạo của nhân viên dưới dạng danh sách động."
      />

      <div className="space-y-5">
        {educationItems.map((item, index) => (
          <section
            key={`education-${item.id ?? 'new'}-${index}`}
            className="rounded-[28px] border border-slate-200 bg-slate-50/60 p-5 shadow-[0_10px_24px_rgba(15,23,42,0.05)]"
          >
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-slate-500">Bằng cấp {index + 1}</p>
                <p className="text-base font-bold text-slate-900">
                  {item.level.trim() || item.major.trim() || 'Thông tin học vấn'}
                </p>
              </div>

              {educationItems.length > 1 ? (
                <button
                  type="button"
                  onClick={() => handleRemove(index)}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-400 transition-colors hover:border-rose-200 hover:text-rose-500"
                  aria-label={`Xóa bằng cấp ${index + 1}`}
                >
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
              ) : (
                <div className="h-10 w-10" aria-hidden="true" />
              )}
            </div>

            <div className="space-y-5">
              <FormRow label="Trình độ">
                <div className="relative">
                  <select
                    value={item.level}
                    onChange={(event) => updateItem(index, { level: event.target.value })}
                    className={selectClassName}
                  >
                    <option value="">Chọn trình độ</option>
                    {levelOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                  <span className="material-symbols-outlined pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                    expand_more
                  </span>
                </div>
              </FormRow>

              <FormRow label="Chuyên ngành">
                <div className="relative">
                  <select
                    value={item.major}
                    onChange={(event) => updateItem(index, { major: event.target.value })}
                    className={selectClassName}
                  >
                    <option value="">Chọn chuyên ngành</option>
                    {majorOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                  <span className="material-symbols-outlined pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                    expand_more
                  </span>
                </div>
              </FormRow>

              <FormRow label="Nơi đào tạo">
                <input
                  type="text"
                  value={item.institution}
                  onChange={(event) => updateItem(index, { institution: event.target.value })}
                  className={getFieldClassName(false)}
                  placeholder="Nhập nơi đào tạo"
                />
              </FormRow>

              <FormRow label="Ngày cấp">
                <input
                  type="date"
                  value={item.issueDate}
                  onChange={(event) => updateItem(index, { issueDate: event.target.value })}
                  className={getFieldClassName(false)}
                />
              </FormRow>

              <FormRow label="Ghi chú">
                <textarea
                  value={item.note}
                  onChange={(event) => updateItem(index, { note: event.target.value })}
                  className={`${getFieldClassName(false)} min-h-[112px] py-3`}
                  placeholder="Nhập ghi chú"
                />
              </FormRow>
            </div>
          </section>
        ))}

        <button
          type="button"
          onClick={handleCreateNew}
          className="inline-flex items-center text-sm font-bold text-[#2563eb] transition-colors hover:text-[#1d4ed8]"
        >
          + Tạo mới
        </button>
      </div>
    </>
  );
};

export default EducationListForm;
