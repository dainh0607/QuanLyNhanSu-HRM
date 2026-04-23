import React from 'react';

interface TemplateGalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (content: string) => void;
}

const SYSTEM_TEMPLATES = [
  {
    id: 'blank',
    name: '+ Thêm mới',
    description: 'Bắt đầu từ một trang trắng và tự thiết kế biểu mẫu theo ý muốn.',
    icon: 'add_circle',
    content: ''
  },
  {
    id: 'fb',
    name: 'Hợp đồng thử việc F&B',
    description: 'Dành cho nhân viên phục vụ, bar, bếp. Bao gồm các điều khoản về vệ sinh ATTP.',
    icon: 'restaurant',
    content: '<h1>HỢP ĐỒNG THỬ VIỆC</h1><p>Vị trí: Nhân viên Nhà hàng</p><p>Họ tên: [[employee_name]]</p><p>Mức lương: [[salary_amount]]</p>'
  },
  {
    id: 'it',
    name: 'Hợp đồng XĐTH Công nghệ',
    description: 'Dành cho nhân viên văn phòng, IT. Bao gồm điều khoản bảo mật thông tin (NDA).',
    icon: 'terminal',
    content: '<h1>HỢP ĐỒNG LAO ĐỘNG XÁC ĐỊNH THỜI HẠN</h1><p>Vị trí: Kỹ sư Phần mềm</p><p>Mã nhân viên: [[employee_code]]</p><p>Bản cam kết bảo mật đi kèm...</p>'
  }
];

const TemplateGalleryModal: React.FC<TemplateGalleryModalProps> = ({ isOpen, onClose, onSelect }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-4xl bg-white rounded-[32px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="px-10 py-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">Chọn bản mẫu hợp đồng</h3>
            <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">Khởi tạo nhanh từ thư viện mẫu chuẩn</p>
          </div>
          <button onClick={onClose} className="w-12 h-12 rounded-full flex items-center justify-center text-slate-400 hover:bg-white hover:text-slate-600 transition-all shadow-sm">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Gallery Content */}
        <div className="p-10 grid grid-cols-3 gap-6">
          {SYSTEM_TEMPLATES.map(tpl => (
            <div 
              key={tpl.id}
              onClick={() => onSelect(tpl.content)}
              className={`group relative flex flex-col p-8 rounded-[32px] border-2 transition-all cursor-pointer ${
                tpl.id === 'blank' 
                  ? 'border-dashed border-slate-200 hover:border-blue-500 hover:bg-blue-50/30' 
                  : 'border-slate-100 hover:border-blue-500 hover:shadow-xl hover:shadow-blue-900/5 hover:-translate-y-1'
              }`}
            >
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-all ${
                tpl.id === 'blank' 
                  ? 'bg-slate-100 text-slate-400 group-hover:bg-blue-500 group-hover:text-white' 
                  : 'bg-blue-50 text-blue-600 group-hover:bg-blue-500 group-hover:text-white'
              }`}>
                <span className="material-symbols-outlined text-[32px]">{tpl.icon}</span>
              </div>
              
              <h4 className="text-sm font-black text-slate-800 uppercase tracking-tight mb-3 group-hover:text-blue-600 transition-colors">
                {tpl.name}
              </h4>
              <p className="text-xs font-medium text-slate-400 leading-relaxed line-clamp-3">
                {tpl.description}
              </p>

              {/* Preview Hint */}
              {tpl.id !== 'blank' && (
                <div className="mt-auto pt-6 flex items-center text-[10px] font-black text-blue-600 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">
                  Dùng mẫu này <span className="material-symbols-outlined text-[14px] ml-1">arrow_forward</span>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Footer Info */}
        <div className="px-10 py-6 bg-slate-50 border-t border-slate-100">
          <div className="flex items-center gap-2 text-slate-400">
            <span className="material-symbols-outlined text-sm">info</span>
            <p className="text-[10px] font-black uppercase tracking-widest leading-none">Bạn có thể thay đổi toàn bộ nội dung trong trình soạn thảo sau khi chọn mẫu.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TemplateGalleryModal;
