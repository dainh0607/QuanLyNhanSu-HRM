import React from 'react';

const PageToolbar: React.FC = () => {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 shrink-0">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Danh sách nhân viên</h1>
        <p className="text-sm text-gray-500 mt-1">
          Quản lý thông tin hồ sơ và trạng thái làm việc của đội ngũ nhân sự
        </p>
      </div>
      <div className="flex items-center space-x-3">
        {/* Export Button */}
        <div className="relative inline-block text-left group">
          <button
            className="px-4 py-2 bg-white border border-gray-300 text-sm font-medium rounded-lg hover:bg-gray-50 flex items-center transition-colors"
          >
            <span className="material-symbols-outlined text-[18px] mr-2 text-gray-500">download</span>
            Xuất file
            <svg className="w-4 h-4 ml-2 text-gray-400 group-hover:rotate-180 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {/* Dropdown Container with Hover Support */}
          <div className="absolute right-0 top-full pt-1.5 z-50 hidden group-hover:block transition-all duration-200">
            <div className="w-48 bg-white border border-gray-200 rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.12)] py-2 overflow-hidden">
              <a className="block px-4 py-2 text-sm text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 transition-colors" href="#">Thông tin cơ bản</a>
              <a className="block px-4 py-2 text-sm text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 transition-colors" href="#">Tiền lương/Trợ cấp</a>
              <a className="block px-4 py-2 text-sm text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 transition-colors" href="#">Lịch sử thăng tiến</a>
            </div>
          </div>
        </div>

        {/* Split Button: "Tạo mới" (Click) | Chevron (Hover) */}
        <div className="flex items-center">
          <div className="flex items-center bg-[#134BBA] rounded-lg shadow-md hover:shadow-lg transition-all duration-200">
            {/* Primary Action (Left side) - Only clickable */}
            <button 
              onClick={() => console.log('Tạo mới nhân viên clicked')}
              className="px-4 py-2.5 text-white text-sm font-bold flex items-center border-r border-white/20 hover:bg-[#0e378c] transition-colors rounded-l-lg"
            >
              <span className="material-symbols-outlined text-[20px] mr-2 text-white">person_add</span>
              Tạo mới
            </button>
            
            {/* Dropdown Trigger (Right side) - Hover only */}
            <div className="relative h-full group/chevron">
              <button 
                className="px-3 py-2.5 text-white text-sm font-medium flex items-center justify-center hover:bg-[#0e378c] transition-colors h-full rounded-r-lg"
              >
                <span className="material-symbols-outlined text-[18px] text-white group-hover/chevron:rotate-180 transition-transform duration-200">expand_more</span>
              </button>
              
              {/* Dropdown Card - Bridges gap with pt-1.5 ensuring hover continuity */}
              <div className="absolute right-0 top-full pt-1.5 z-50 hidden group-hover/chevron:block animate-[fadeSlideDown_0.2s_ease-out]">
                <div className="w-52 bg-white border border-gray-200 rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.12)] py-2 overflow-hidden">
                  <div className="px-4 py-2 border-b border-gray-50 mb-1">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Tùy chọn tạo</span>
                  </div>
                  <a className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#1F2937] hover:bg-gray-50 hover:text-[#171635] transition-colors" href="#">
                    Thêm nhân viên mới
                  </a>
                  <a className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#1F2937] hover:bg-gray-50 hover:text-[#171635] transition-colors" href="#">
                    Nhập từ file Excel
                  </a>
                  <a className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#1F2937] hover:bg-gray-50 hover:text-[#171635] transition-colors" href="#">
                    Thêm hàng loạt
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PageToolbar;
