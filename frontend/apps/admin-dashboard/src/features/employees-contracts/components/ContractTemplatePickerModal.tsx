import React from 'react';
import { CONTRACT_TEMPLATE_OPTIONS } from '../constants';
import ModalShell from './ModalShell';

interface ContractTemplatePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (templateId: string, templateName: string) => void;
}

const ContractTemplatePickerModal: React.FC<ContractTemplatePickerModalProps> = ({
  isOpen,
  onClose,
  onSelect,
}) => {
  return (
    <ModalShell
      isOpen={isOpen}
      onClose={onClose}
      title="Chọn mẫu hợp đồng"
      description="Chọn nhanh một mẫu có sẵn để gán vào bước 1 của hợp đồng điện tử."
      maxWidthClassName="max-w-6xl"
    >
      <div className="grid gap-4 p-6 lg:grid-cols-2 xl:grid-cols-3 lg:p-8">
        {CONTRACT_TEMPLATE_OPTIONS.map((template) => (
          <button
            key={template.id}
            type="button"
            onClick={() => onSelect(template.id, template.title)}
            className="rounded-[26px] border border-slate-200 bg-white p-5 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-[#134BBA] hover:shadow-[0_18px_45px_rgba(19,75,186,0.12)]"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#134BBA]/10 text-[#134BBA]">
              <span className="material-symbols-outlined text-[24px]">article</span>
            </div>
            <h3 className="mt-4 text-base font-bold text-slate-900">{template.title}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-500">{template.subtitle}</p>
          </button>
        ))}
      </div>
    </ModalShell>
  );
};

export default ContractTemplatePickerModal;
