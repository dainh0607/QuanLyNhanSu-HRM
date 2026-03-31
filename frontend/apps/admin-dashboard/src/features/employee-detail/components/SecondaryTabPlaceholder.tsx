import React from 'react';

interface SecondaryTabPlaceholderProps {
  activeTab: string;
}

const SecondaryTabPlaceholder: React.FC<SecondaryTabPlaceholderProps> = ({ activeTab }) => (
  <div className="overflow-hidden rounded-[32px] border border-[#192841]/10 bg-white shadow-[0_18px_60px_rgba(25,40,65,0.08)]">
    <div className="border-b border-slate-100 bg-[linear-gradient(135deg,rgba(25,40,65,0.05),rgba(255,255,255,1))] px-8 py-8">
      <span className="inline-flex items-center rounded-full border border-[#192841]/10 bg-white px-3 py-1 text-xs font-bold uppercase tracking-[0.24em] text-[#192841]">
        {activeTab}
      </span>
      <h3 className="mt-4 text-2xl font-bold text-slate-900">{activeTab}</h3>
      <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-500">
        Khung nội dung của tab này đã được chừa sẵn để mở rộng các module nghiệp vụ tiếp theo mà không phá vỡ bố cục tổng thể.
      </p>
    </div>
    <div className="px-8 py-12">
      <div className="rounded-[28px] border border-dashed border-slate-200 bg-slate-50 px-6 py-14 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-[#192841] shadow-sm">
          <span className="material-symbols-outlined text-[30px]">dashboard_customize</span>
        </div>
        <p className="mt-5 text-lg font-bold text-slate-900">Nội dung của tab này đang được hoàn thiện.</p>
        <p className="mt-2 text-sm text-slate-500">
          Tab "Cá nhân" đã được ưu tiên thiết kế lại theo cấu trúc block dữ liệu chi tiết trước.
        </p>
      </div>
    </div>
  </div>
);

export default SecondaryTabPlaceholder;
