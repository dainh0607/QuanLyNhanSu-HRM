import React, { useState } from 'react';

interface CreateSalaryLevelPopupProps {
  onClose: () => void;
  onCreated: (level: { label: string; value: string; amount: string }) => void;
}

const CreateSalaryLevelPopup: React.FC<CreateSalaryLevelPopupProps> = ({ onClose, onCreated }) => {
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');

  const formatCurrency = (val: string) => {
    return Number(val.replace(/\D/g, '')).toLocaleString('vi-VN');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !amount) return;
    
    // Giả lập gọi API tạo mới
    onCreated({
      label: name,
      value: name.toLowerCase(),
      amount: amount.replace(/\D/g, ''),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="w-full max-w-md scale-100 rounded-[32px] bg-white p-8 shadow-2xl animate-in zoom-in-95 duration-300">
        <div className="mb-6 flex items-center justify-between">
          <h3 className="text-xl font-black text-slate-900">Tạo mới Bậc lương</h3>
          <button 
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-50 text-slate-400 hover:bg-slate-100"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[13px] font-black uppercase tracking-wider text-slate-400 ml-1">Tên bậc lương</label>
            <input
              type="text"
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-14 w-full rounded-[20px] border-2 border-slate-50 bg-slate-50/50 px-6 text-[15px] font-bold text-slate-700 outline-none transition-all focus:border-emerald-500 focus:bg-white"
              placeholder="Ví dụ: Bậc 1"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-[13px] font-black uppercase tracking-wider text-slate-400 ml-1">Số tiền (VND)</label>
            <div className="relative">
              <input
                type="text"
                value={formatCurrency(amount)}
                onChange={(e) => setAmount(e.target.value.replace(/\D/g, ''))}
                className="h-14 w-full rounded-[20px] border-2 border-slate-50 bg-slate-50/50 px-6 pr-16 text-[15px] font-black text-emerald-600 outline-none transition-all focus:border-emerald-500 focus:bg-white"
                placeholder="0"
                required
              />
              <span className="absolute right-6 top-1/2 -translate-y-1/2 text-[11px] font-black text-emerald-400">VND</span>
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 h-14 rounded-[20px] border-2 border-slate-50 bg-white text-[15px] font-bold text-slate-400 transition-all hover:bg-slate-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="flex-1 h-14 rounded-[20px] bg-emerald-500 text-[15px] font-bold text-white shadow-lg shadow-emerald-500/20 transition-all hover:bg-emerald-600 active:scale-95"
            >
              Tạo mới
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateSalaryLevelPopup;
