import React from 'react';
import type { EmployeeEditAssetPayload } from '../../../services/employee/types';
import DetailBlock from './DetailBlock';

interface AssetsTabContentProps {
  assets?: EmployeeEditAssetPayload;
  isLoading: boolean;
  loadError: string | null;
  onOpenEditTab: (tab: string) => void;
}

const AssetsTabContent: React.FC<AssetsTabContentProps> = ({
  assets = [],
  isLoading,
  loadError,
  onOpenEditTab,
}) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-20">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-emerald-500"></div>
          <p className="text-sm font-bold text-slate-400">Đang truy xuất danh mục tài sản...</p>
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="rounded-3xl border border-red-100 bg-red-50/30 p-8 text-center">
        <span className="material-symbols-outlined text-red-400 text-[40px] mb-2">inventory</span>
        <p className="text-sm font-bold text-red-600">{loadError}</p>
      </div>
    );
  }

  const hasAssets = assets && assets.length > 0;

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-10">
      {/* HEADER WITH STATS */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Quản lý Tài sản & Thiết bị</h2>
          <p className="text-sm font-medium text-slate-400">Danh sách các thiết bị hiện đang được nhân sự sử dụng và chịu trách nhiệm bảo quản.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="bg-white border-2 border-slate-100 rounded-3xl px-6 py-3 flex items-center gap-3 shadow-sm">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-sm font-black text-slate-900 uppercase tracking-tighter">{hasAssets ? assets.length : 0} Thiết bị</span>
          </div>
          <button 
            onClick={() => onOpenEditTab('assets')}
            className="h-12 px-6 rounded-2xl bg-slate-900 text-white text-[13px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-slate-200"
          >
            Cấp mới
          </button>
        </div>
      </div>

      {/* TABLE SECTION */}
      <DetailBlock title="Danh sách chi tiết">
        <div className="overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-sm transition-all hover:shadow-md">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[14px]">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/30">
                  <th className="px-8 py-5 text-[11px] font-black uppercase tracking-widest text-slate-400">Thông tin thiết bị</th>
                  <th className="px-6 py-5 text-[11px] font-black uppercase tracking-widest text-slate-400">Mã định danh</th>
                  <th className="px-6 py-5 text-center text-[11px] font-black uppercase tracking-widest text-slate-400">Số lượng</th>
                  <th className="px-6 py-5 text-[11px] font-black uppercase tracking-widest text-slate-400">Ngày cấp phát</th>
                  <th className="px-8 py-5 text-center text-[11px] font-black uppercase tracking-widest text-slate-400">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {hasAssets ? (
                  assets.map((item, index) => (
                    <tr key={index} className="group hover:bg-slate-50/50 transition-colors">
                      <td className="px-8 py-6">
                        <div className="flex flex-col">
                          <span className="font-black text-slate-900 text-base">{item.assetName}</span>
                          <span className="text-[12px] font-medium text-slate-400 italic">{item.description}</span>
                        </div>
                      </td>
                      <td className="px-6 py-6">
                        <div className="flex flex-col gap-1">
                          <span className="text-[11px] font-black text-slate-400 uppercase">Tài sản: <span className="text-slate-900 font-mono">{item.assetCode}</span></span>
                          <span className="text-[11px] font-black text-slate-400 uppercase">Cấp phát: <span className="text-slate-900 font-mono">{item.issueCode}</span></span>
                        </div>
                      </td>
                      <td className="px-6 py-6 text-center">
                        <span className="h-8 w-8 inline-flex items-center justify-center rounded-xl bg-slate-100 font-black text-slate-900">
                          {item.quantity}
                        </span>
                      </td>
                      <td className="px-6 py-6">
                        <div className="flex items-center gap-2 text-slate-600 font-bold">
                          <span className="material-symbols-outlined text-[18px] text-slate-300">calendar_today</span>
                          {item.issueDate}
                        </div>
                      </td>
                      <td className="px-8 py-6 text-center">
                        <span className="inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-[11px] font-black bg-emerald-50 text-emerald-600 border border-emerald-100">
                          ĐANG SỬ DỤNG
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-8 py-32 text-center border-none">
                      <div className="flex flex-col items-center gap-6">
                        <div className="relative group">
                          <div className="absolute -inset-4 rounded-[40px] bg-slate-100 blur-xl opacity-50 group-hover:opacity-100 transition-opacity"></div>
                          <div className="relative h-24 w-24 rounded-[36px] bg-white border-2 border-slate-100 flex items-center justify-center text-slate-200">
                            <span className="material-symbols-outlined text-[48px]">inventory_2</span>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <p className="text-xl font-black text-slate-900 uppercase tracking-tighter">Kho tài sản trống</p>
                          <p className="max-w-[320px] mx-auto text-sm font-medium text-slate-400 leading-relaxed">Hiện tại nhân sự này chưa được bàn giao bất kỳ thiết bị hay tài sản công ty nào.</p>
                        </div>
                        <button 
                          onClick={() => onOpenEditTab('assets')}
                          className="mt-4 flex items-center gap-2 px-8 py-3 rounded-2xl bg-slate-50 text-slate-600 text-xs font-black uppercase tracking-widest border border-slate-200 hover:bg-slate-100 transition-all active:scale-95"
                        >
                          <span className="material-symbols-outlined text-[18px]">add</span>
                          Bàn giao ngay
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </DetailBlock>

    </div>
  );
};

export default AssetsTabContent;
