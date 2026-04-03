import React from 'react';

interface ContractsPageToolbarProps {
  onCreateNew: () => void;
  onExport: () => void;
}

const ContractsPageToolbar: React.FC<ContractsPageToolbarProps> = ({ onCreateNew, onExport }) => {
  return (
    <div className="mb-6 flex flex-col justify-between gap-4 shrink-0 md:flex-row md:items-center">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Quản lý hợp đồng lao động</h1>
        <p className="mt-1 text-sm text-gray-500">
          Theo dõi tình trạng hợp đồng, chuẩn bị ký mới và quản lý dữ liệu tập trung trong module nhân sự.
        </p>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onExport}
          className="inline-flex items-center rounded-lg border border-[#192841] bg-white px-4 py-2 text-sm font-semibold text-[#192841] transition-colors hover:bg-[#192841]/5"
        >
          <span className="material-symbols-outlined mr-2 text-[18px]">download</span>
          Xuất file
        </button>

        <button
          type="button"
          onClick={onCreateNew}
          className="inline-flex items-center rounded-lg bg-[#134BBA] px-4 py-2.5 text-sm font-bold text-white shadow-md transition-colors hover:bg-[#0e378c]"
        >
          <span className="material-symbols-outlined mr-2 text-[20px]">add_circle</span>
          Tạo mới
        </button>
      </div>
    </div>
  );
};

export default ContractsPageToolbar;
