import React, { useState } from "react";

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  targetName: string;
  title?: string;
  description?: string;
}

const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  targetName,
  title = "Xác nhận xóa vĩnh viễn",
  description = "Hành động này sẽ xóa vĩnh viễn dữ liệu của trường này trên toàn bộ hồ sơ nhân viên hiện tại. Bạn có chắc chắn không?",
}) => {
  const [confirmText, setConfirmText] = useState("");

  if (!isOpen) return null;

  const isMatched = confirmText === targetName;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-[32px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-rose-100">
        <div className="p-8">
          <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center mb-6 mx-auto">
            <span className="material-symbols-outlined text-3xl text-rose-500">warning</span>
          </div>

          <div className="text-center mb-8">
            <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight mb-3">
              {title}
            </h3>
            <p className="text-sm font-medium text-slate-500 leading-relaxed">
              {description}
            </p>
          </div>

          <div className="space-y-4">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-center">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Vui lòng nhập lại tên trường để xác nhận</p>
              <p className="text-sm font-black text-slate-800 tracking-tight">{targetName}</p>
            </div>

            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="Nhập chính xác tên trường..."
              className="w-full px-5 py-4 bg-white border border-rose-100 rounded-2xl text-sm font-bold text-slate-700 focus:outline-none focus:ring-4 focus:ring-rose-500/10 focus:border-rose-500 transition-all placeholder:text-slate-200 text-center"
              autoFocus
            />

            <div className="flex gap-3 pt-2">
              <button
                onClick={onClose}
                className="flex-1 px-6 py-4 bg-slate-50 text-slate-400 rounded-2xl text-sm font-black uppercase tracking-widest hover:bg-slate-100 transition-all"
              >
                Hủy bỏ
              </button>
              <button
                onClick={() => {
                  if (isMatched) {
                    onConfirm();
                    setConfirmText("");
                  }
                }}
                disabled={!isMatched}
                className={`flex-[2] px-6 py-4 rounded-2xl text-sm font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
                  isMatched 
                  ? "bg-rose-500 text-white shadow-lg shadow-rose-500/20 hover:bg-rose-600" 
                  : "bg-slate-100 text-slate-300 cursor-not-allowed"
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">delete_forever</span>
                Xóa vĩnh viễn
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmModal;
