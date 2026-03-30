import React from 'react';

interface ExportPageToolbarProps {
  onAddEmployee?: () => void;
  onOpenBasicInfoExport?: () => void;
}

const ExportPageToolbar: React.FC<ExportPageToolbarProps> = ({
  onAddEmployee,
  onOpenBasicInfoExport,
}) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 shrink-0">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Danh sách nhân viên</h1>
        <p className="text-sm text-gray-500 mt-1">
          Quản lý thông tin hồ sơ và trạng thái làm việc của đội ngũ nhân sự
        </p>
      </div>

      <div className="flex items-center space-x-3">
        <div className="relative inline-block text-left group">
          <button className="px-4 py-2 bg-white border border-[#192841] text-[#192841] text-sm font-semibold rounded-lg hover:bg-[#192841]/5 flex items-center transition-colors">
            <span className="material-symbols-outlined text-[18px] mr-2 text-[#192841]">download</span>
            Xuất file
            <svg
              className="w-4 h-4 ml-2 text-[#192841] group-hover:rotate-180 transition-transform duration-200"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          <div className="absolute right-0 top-full pt-1.5 z-50 hidden group-hover:block transition-all duration-200">
            <div className="w-48 bg-white border border-gray-200 rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.12)] py-2 overflow-hidden">
              <button
                type="button"
                onClick={onOpenBasicInfoExport}
                className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-[#192841]/5 hover:text-[#192841] transition-colors"
              >
                Thông tin cơ bản
              </button>
              <button
                type="button"
                className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-[#192841]/5 hover:text-[#192841] transition-colors"
              >
                Tiền lương/Trợ cấp
              </button>
              <button
                type="button"
                className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-[#192841]/5 hover:text-[#192841] transition-colors"
              >
                Lịch sử thăng tiến
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-center">
          <div className="flex items-center bg-[#134BBA] rounded-lg shadow-md hover:shadow-lg transition-all duration-200">
            <button
              onClick={onAddEmployee}
              className="px-4 py-2.5 text-white text-sm font-bold flex items-center border-r border-white/20 hover:bg-[#0e378c] transition-colors rounded-l-lg"
            >
              <span className="material-symbols-outlined text-[20px] mr-2 text-white">person_add</span>
              Tạo mới
            </button>

            <div className="relative h-full group/chevron">
              <button className="px-3 py-2.5 text-white text-sm font-medium flex items-center justify-center hover:bg-[#0e378c] transition-colors h-full rounded-r-lg">
                <span className="material-symbols-outlined text-[18px] text-white group-hover/chevron:rotate-180 transition-transform duration-200">
                  expand_more
                </span>
              </button>

              <div className="absolute right-0 top-full pt-1.5 z-50 hidden group-hover/chevron:block animate-[fadeSlideDown_0.2s_ease-out] z-[1000]">
                <div className="w-52 bg-white border border-gray-200 rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.12)] py-2 overflow-hidden">
                  <div className="px-4 py-2 border-b border-gray-50 mb-1">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                      Tùy chọn tạo
                    </span>
                  </div>
                  <button
                    type="button"
                    className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-[#192841]/5 hover:text-[#192841] transition-colors"
                  >
                    Thêm nhân viên mới
                  </button>
                  <button
                    type="button"
                    className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-[#192841]/5 hover:text-[#192841] transition-colors"
                  >
                    Nhập từ file Excel
                  </button>
                  <button
                    type="button"
                    className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-[#192841]/5 hover:text-[#192841] transition-colors"
                  >
                    Thêm hàng loạt
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExportPageToolbar;
