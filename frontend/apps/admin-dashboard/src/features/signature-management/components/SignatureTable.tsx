
import React from 'react';
import { type SampleSignature } from '../types';

interface SignatureTableProps {
  signatures: SampleSignature[];
  onDelete: (id: string) => void;
  onSetDefault: (id: string) => void;
}

const SignatureTable: React.FC<SignatureTableProps> = ({
  signatures,
  onDelete,
  onSetDefault
}) => {
  if (signatures.length === 0) {
    return (
      <div className="bg-white rounded-[32px] border border-slate-100 p-20 flex flex-col items-center justify-center text-center">
        <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6">
          <span className="material-symbols-outlined text-[48px] text-slate-200">draw</span>
        </div>
        <h3 className="text-xl font-bold text-slate-800">Chưa có chữ ký mẫu</h3>
        <p className="text-slate-400 max-w-sm mt-2 font-medium">Bạn chưa tạo chữ ký mẫu nào. Hãy nhấn nút "Tạo mới" để bắt đầu thiết lập chữ ký điện tử của mình.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-[32px] border border-slate-100 overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50 border-b border-slate-100">
              <th className="px-8 py-5 text-[13px] font-black text-slate-400 uppercase tracking-wider">Tên chữ ký</th>
              <th className="px-8 py-5 text-[13px] font-black text-slate-400 uppercase tracking-wider">Chữ ký chính</th>
              <th className="px-8 py-5 text-[13px] font-black text-slate-400 uppercase tracking-wider">Ngày tạo</th>
              <th className="px-8 py-5 text-[13px] font-black text-slate-400 uppercase tracking-wider">Ngày cập nhật</th>
              <th className="px-8 py-5 text-[13px] font-black text-slate-400 uppercase tracking-wider">Mặc định</th>
              <th className="px-8 py-5 text-[13px] font-black text-slate-400 uppercase tracking-wider text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {signatures.map((sig) => (
              <tr key={sig.id} className="hover:bg-slate-50/30 transition-colors group">
                <td className="px-8 py-5">
                  <span className="text-[15px] font-bold text-slate-700">{sig.name}</span>
                </td>
                <td className="px-8 py-5">
                  <div className="w-32 h-16 bg-slate-50 rounded-xl border border-slate-100 overflow-hidden flex items-center justify-center p-2 group-hover:bg-white transition-colors">
                    <img src={sig.imageUrl} alt={sig.name} className="max-w-full max-h-full object-contain" />
                  </div>
                </td>
                <td className="px-8 py-5">
                  <span className="text-[14px] font-medium text-slate-500">{new Date(sig.createdAt).toLocaleDateString('vi-VN')}</span>
                </td>
                <td className="px-8 py-5">
                  <span className="text-[14px] font-medium text-slate-500">
                    {new Date(sig.updatedAt || sig.createdAt).toLocaleDateString('vi-VN')}
                  </span>
                </td>
                <td className="px-8 py-5">
                  {sig.isDefault ? (
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full">
                      <span className="material-symbols-outlined text-[16px] font-bold">check_circle</span>
                      <span className="text-[12px] font-bold uppercase tracking-wider">Mặc định</span>
                    </div>
                  ) : (
                    <button 
                      onClick={() => onSetDefault(sig.id)}
                      className="text-[12px] font-bold text-slate-400 hover:text-emerald-500 transition-colors uppercase tracking-wider underline underline-offset-4"
                    >
                      Đặt mặc định
                    </button>
                  )}
                </td>
                <td className="px-8 py-5 text-right">
                  <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => onDelete(sig.id)}
                      className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:bg-red-50 hover:text-red-500 transition-all"
                      title="Xóa chữ ký"
                    >
                      <span className="material-symbols-outlined text-[18px]">delete</span>
                    </button>
                    <button 
                      className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-all"
                    >
                      <span className="material-symbols-outlined text-[18px]">more_horiz</span>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SignatureTable;
