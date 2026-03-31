import React, { useState } from 'react';
import type { Employee } from '../employees/types';

interface EmployeeDetailProps {
  employee: Employee;
  onBack: () => void;
}

export const EmployeeDetail: React.FC<EmployeeDetailProps> = ({ employee, onBack }) => {
  const [activeTab, setActiveTab] = useState('Cá nhân');

  const tabs = [
    'Cá nhân',
    'Công việc',
    'Nghỉ phép',
    'Tài sản',
    'Tài liệu',
    'Chấm công',
    'Chữ ký số',
    'Phân quyền',
    'Lịch sử cập nhật',
    'Thêm',
  ];

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex flex-col font-inter overflow-y-auto">
      {/* 2.1. Header (Thanh tiêu đề trên cùng) */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center shrink-0">
        <button 
          onClick={onBack}
          className="p-1 hover:bg-gray-100 rounded-full transition-colors mr-3 text-gray-400 group"
          title="Quay lại"
        >
          <span className="material-symbols-outlined text-[24px] group-hover:text-gray-900">arrow_back</span>
        </button>
        <h1 className="text-xl font-bold text-gray-900">Thông tin cá nhân</h1>
      </div>

      {/* Main Content Scrollable Area */}
      <div className="flex-1 px-8 py-6 space-y-6 max-w-7xl mx-auto w-full">
        
        {/* 2.2. Profile Card (Khối thông tin tóm tắt) */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex gap-6 items-start">
          {/* Avatar (Hình vuông bo góc) */}
          <div className="w-24 h-24 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0 border border-gray-100">
             {employee.avatar ? (
                <img src={employee.avatar} alt={employee.fullName} className="w-full h-full object-cover" />
             ) : (
                <div className="w-full h-full flex items-center justify-center bg-[#134BBA]/10 text-[#134BBA] font-bold text-2xl uppercase">
                  {(employee.fullName?.charAt(0) || '??')}
                </div>
             )}
          </div>

          {/* Thông tin chính */}
          <div className="flex-1 min-w-0 pt-1">
            <div className="flex items-center gap-2 mb-3">
              <h2 className="text-2xl font-bold text-gray-900 truncate">{employee.fullName}</h2>
              {employee.accessGroup === 'Quản lý' && (
                 <span className="text-lg" title="Quản trị">👑</span>
              )}
            </div>

            {/* Badges (Thẻ thông tin nhỏ) */}
            <div className="flex flex-wrap gap-2">
              <div className="flex items-center px-3 py-1.5 bg-gray-50 rounded-lg text-xs font-medium text-gray-600 border border-gray-100">
                <span className="material-symbols-outlined text-[16px] mr-1.5 text-gray-400">call</span>
                {employee.phone || '-'}
              </div>
              <div className="flex items-center px-3 py-1.5 bg-gray-50 rounded-lg text-xs font-medium text-gray-600 border border-gray-100">
                <span className="material-symbols-outlined text-[16px] mr-1.5 text-gray-400">location_on</span>
                {employee.regionName || 'Việt Nam'}
              </div>
              <div className="flex items-center px-3 py-1.5 bg-[#E6FFFA] rounded-lg text-xs font-bold text-[#00A3BF] border border-[#B2F5EA]/50">
                <span className="material-symbols-outlined text-[16px] mr-1.5">link</span>
                hoso/{employee.fullName?.toLowerCase().replace(/\s+/g, '-')}
              </div>
            </div>
          </div>
        </div>

        {/* 2.3. Tab Navigation (Thanh điều hướng chức năng) */}
        <div className="border-b border-gray-200 flex items-center gap-8 overflow-x-auto scrollbar-hide">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-3 text-sm font-medium transition-all relative whitespace-nowrap ${
                activeTab === tab
                  ? 'text-gray-900 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[3px] after:bg-[#00A3BF] after:rounded-t-full'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* 2.4. Main Content Area (Khu vực nội dung tab "Cá nhân") */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Header của khối nội dung */}
          <div className="px-6 py-5 border-b border-gray-50 flex items-center justify-between">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">THÔNG TIN CÁ NHÂN</h3>
            <div className="flex items-center gap-3">
              <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors">
                Đổi mật khẩu
              </button>
              <button className="px-4 py-2 bg-[#192841] text-white rounded-lg text-sm font-bold flex items-center hover:bg-[#253a5c] transition-colors shadow-md shadow-[#192841]/20">
                <span className="material-symbols-outlined text-[18px] mr-2">edit</span>
                Sửa
              </button>
            </div>
          </div>

          {/* Section: Placeholder for data fields (to be expanded) */}
          <div className="p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-8 gap-x-12">
             <div className="space-y-1.5">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Mã nhân viên</p>
                <p className="text-sm font-semibold text-gray-900">{employee.employeeCode}</p>
             </div>
             <div className="space-y-1.5">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Họ và tên</p>
                <p className="text-sm font-semibold text-gray-900">{employee.fullName}</p>
             </div>
             <div className="space-y-1.5">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Email</p>
                <p className="text-sm font-semibold text-gray-900">{employee.email}</p>
             </div>
             <div className="space-y-1.5">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Số điện thoại</p>
                <p className="text-sm font-semibold text-gray-900">{employee.phone}</p>
             </div>
             <div className="space-y-1.5">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Phòng ban</p>
                <p className="text-sm font-semibold text-gray-900">{employee.departmentName}</p>
             </div>
             <div className="space-y-1.5">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Chức danh</p>
                <p className="text-sm font-semibold text-gray-900">{employee.jobTitleName}</p>
             </div>
             {/* ... and so on for other 18 columns */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDetail;
