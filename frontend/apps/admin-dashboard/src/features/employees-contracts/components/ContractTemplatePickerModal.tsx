import React, { useEffect, useState } from 'react';
import { contractsService } from '../service';
import type { ContractTemplateOption } from '../types';
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
  const [templates, setTemplates] = useState<ContractTemplateOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    setIsLoading(true);

    const loadTemplates = async () => {
      try {
        const data = await contractsService.getTemplates();
        if (isMounted) {
          setTemplates(data);
        }
      } catch (error) {
        console.error('Failed to load contract templates:', error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void loadTemplates();

    return () => { isMounted = false; };
  }, [isOpen]);
  return (
    <ModalShell
      isOpen={isOpen}
      onClose={onClose}
      title="Chọn mẫu hợp đồng"
      description="Chọn nhanh một mẫu có sẵn để gán vào bước 1 của hợp đồng điện tử."
      maxWidthClassName="max-w-6xl"
    >
      <div className="grid gap-4 p-6 lg:grid-cols-2 xl:grid-cols-3 lg:p-8">
        {isLoading ? (
          <div className="col-span-full flex h-40 flex-col items-center justify-center gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#134BBA] border-t-transparent" />
            <p className="text-sm font-medium text-slate-500">Đang tải danh sách mẫu...</p>
          </div>
        ) : templates.length === 0 ? (
          <div className="col-span-full flex h-40 flex-col items-center justify-center p-8 text-center bg-slate-50 rounded-3xl border border-dashed border-slate-200">
            <span className="material-symbols-outlined text-4xl text-slate-300">receipt_long</span>
            <p className="mt-3 text-sm font-medium text-slate-500">Không tìm thấy mẫu hợp đồng nào trên hệ thống.</p>
          </div>
        ) : (
          templates.map((template) => (
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
          ))
        )}
      </div>
    </ModalShell>
  );
};

export default ContractTemplatePickerModal;
