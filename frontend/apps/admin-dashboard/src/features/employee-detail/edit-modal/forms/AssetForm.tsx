import React, { useState } from 'react';
import type { AssetFormMap } from '../types';
import AssetIssueModal from '../components/AssetIssueModal';
import { type EmployeeEditAssetItemPayload } from '../../../../services/employeeService';

interface AssetFormProps {
  data: AssetFormMap['assets'];
  employeeName?: string;
  onUpdateAssets?: (newAssets: AssetFormMap['assets']) => Promise<void>;
}

const AssetForm: React.FC<AssetFormProps> = ({ data, employeeName = 'Nhân viên', onUpdateAssets }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const hasAssets = data && data.length > 0;

  const handleIssueAsset = async (newAsset: EmployeeEditAssetItemPayload) => {
    if (onUpdateAssets) {
      await onUpdateAssets([...data, newAsset]);
    }
  };

  return (
    <div className="mt-4 flex flex-col gap-6 pb-6">
      {/* Header Bar */}
      <div className="flex items-center justify-between">
        <h3 className="text-[18px] font-bold text-[#1c3563]">Tài sản</h3>
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-5 py-2.5 text-sm font-bold text-white shadow-[0_12px_24px_rgba(16,185,129,0.2)] transition-all hover:bg-emerald-600 hover:shadow-[0_12px_30px_rgba(16,185,129,0.3)] active:scale-95"
        >
          <span className="material-symbols-outlined text-[20px]">add_circle</span>
          Cấp tài sản
        </button>
      </div>

      {/* Assets Table Section */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white/80 backdrop-blur-sm shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[14px]">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/50">
                <th className="px-6 py-4 font-semibold text-slate-600">Tên tài sản</th>
                <th className="px-6 py-4 font-semibold text-slate-600">Mã tài sản</th>
                <th className="px-6 py-4 font-semibold text-slate-600">Mã cấp phát</th>
                <th className="px-6 py-4 text-center font-semibold text-slate-600">Số lượng</th>
                <th className="px-6 py-4 font-semibold text-slate-600">Mô tả</th>
                <th className="px-6 py-4 font-semibold text-slate-600">Ngày cấp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {hasAssets ? (
                data.map((item, index) => (
                  <tr key={index} className="hover:bg-slate-50/30 transition-colors">
                    <td className="px-6 py-4 text-slate-700 font-medium">{item.assetName}</td>
                    <td className="px-6 py-4 text-slate-600">{item.assetCode}</td>
                    <td className="px-6 py-4 text-slate-600 font-mono">{item.issueCode}</td>
                    <td className="px-6 py-4 text-center text-slate-700 font-semibold">{item.quantity}</td>
                    <td className="px-6 py-4 text-slate-500 max-w-[200px] truncate">{item.description}</td>
                    <td className="px-6 py-4 text-slate-600">{item.issueDate}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-24 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-slate-50 text-slate-200">
                        <span className="material-symbols-outlined text-[48px]">inventory_2</span>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[16px] font-bold text-slate-400">Trống</p>
                        <p className="text-[13px] text-slate-400/80">Chưa có tài sản nào được cấp phát cho nhân sự này.</p>
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Note Section */}
      <div className="rounded-2xl bg-orange-50/50 border border-orange-100 p-5 flex gap-4">
        <span className="material-symbols-outlined text-orange-500">info</span>
        <div className="text-[13px] text-orange-800 leading-relaxed">
          <p className="font-bold mb-1">Quy định về việc cấp phát tài sản:</p>
          <ul className="list-disc ml-4 space-y-1">
            <li>Nhân sự có trách nhiệm bảo quản và sử dụng tài sản đúng mục đích công việc.</li>
            <li>Khi nghỉ việc, nhân sự có nghĩa vụ hoàn trả đầy đủ tất cả tài sản đã được cấp phát.</li>
            <li>Trường hợp hư hỏng hoặc mất mát do lỗi cá nhân, nhân sự phải bồi thường theo quy định của công ty.</li>
          </ul>
        </div>
      </div>

      <AssetIssueModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onIssue={handleIssueAsset}
        employeeName={employeeName}
      />
    </div>
  );
};

export default AssetForm;
