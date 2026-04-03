import React from 'react';
import ModalShell from './ModalShell';

interface CreateContractMethodModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectRegular: () => void;
  onSelectElectronic: () => void;
}

const CreateContractMethodModal: React.FC<CreateContractMethodModalProps> = ({
  isOpen,
  onClose,
  onSelectRegular,
  onSelectElectronic,
}) => {
  return (
    <ModalShell
      isOpen={isOpen}
      onClose={onClose}
      title="Tạo mới hợp đồng"
      description="Chọn cách khởi tạo phù hợp với quy trình xử lý hiện tại của doanh nghiệp."
      maxWidthClassName="max-w-4xl"
    >
      <div className="grid gap-4 p-6 lg:grid-cols-2 lg:p-8">
        <button
          type="button"
          onClick={onSelectRegular}
          className="rounded-[28px] border border-slate-200 bg-white p-6 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-[#134BBA] hover:shadow-[0_18px_45px_rgba(19,75,186,0.12)]"
        >
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#134BBA]/10 text-[#134BBA]">
            <span className="material-symbols-outlined text-[28px]">description</span>
          </div>
          <h3 className="mt-6 text-xl font-bold text-slate-900">Hợp đồng thông thường</h3>
          <p className="mt-3 text-sm leading-6 text-slate-500">
            Dành cho hợp đồng giấy hoặc tài liệu đã được ký tay bên ngoài, sau đó lưu trữ và quản lý trên hệ thống.
          </p>
        </button>

        <button
          type="button"
          onClick={onSelectElectronic}
          className="rounded-[28px] border border-slate-200 bg-white p-6 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-[#134BBA] hover:shadow-[0_18px_45px_rgba(19,75,186,0.12)]"
        >
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#0f766e]/10 text-[#0f766e]">
            <span className="material-symbols-outlined text-[28px]">draw</span>
          </div>
          <h3 className="mt-6 text-xl font-bold text-slate-900">Hợp đồng điện tử</h3>
          <p className="mt-3 text-sm leading-6 text-slate-500">
            Chuẩn bị bộ thông tin và mẫu văn bản để tiến tới luồng xem lại, trình ký và ký số theo từng bước.
          </p>
        </button>
      </div>
    </ModalShell>
  );
};

export default CreateContractMethodModal;
