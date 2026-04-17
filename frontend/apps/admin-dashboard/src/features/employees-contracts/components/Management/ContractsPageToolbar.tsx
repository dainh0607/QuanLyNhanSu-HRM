import React from 'react';

interface ContractsPageToolbarProps {
  onBack: () => void;
  onCreateNew?: () => void;
  onExport?: () => void;
}

const ContractsPageToolbar: React.FC<ContractsPageToolbarProps> = ({
  onBack,
  onCreateNew,
  onExport,
}) => {
  return (
    <div className="mb-6 flex flex-col justify-between gap-4 shrink-0 md:flex-row md:items-center">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-900"
          title="Quay lại danh sách nhân viên"
        >
          <span className="material-symbols-outlined text-[20px]">arrow_back</span>
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Quản lý hợp đồng lao động</h1>
      </div>

      <div className="flex items-center gap-3">
        {onExport && (
          <button
            type="button"
            onClick={onExport}
            className="inline-flex items-center rounded-lg border border-[#192841] bg-white px-4 py-2 text-sm font-semibold text-[#192841] transition-colors hover:bg-[#192841]/5"
          >
            <span className="material-symbols-outlined mr-2 text-[18px]">download</span>
            Xuất file
          </button>
        )}

        {onCreateNew && (
          <button
            type="button"
            onClick={onCreateNew}
            className="inline-flex items-center rounded-lg bg-[#134BBA] px-4 py-2.5 text-sm font-bold text-white shadow-md transition-colors hover:bg-[#0e378c]"
          >
            <span className="material-symbols-outlined mr-2 text-[20px]">add_circle</span>
            Tạo mới
          </button>
        )}
      </div>
    </div>
  );
};

export default ContractsPageToolbar;
