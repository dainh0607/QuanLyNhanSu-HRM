
import React, { useState, useEffect, useCallback } from 'react';
import { type SampleSignature } from '../types';
import { signatureService } from '../../../services/signatureService';
import SignatureTable from './SignatureTable';
import SignatureEditorModal from './SignatureEditorModal';

interface SignatureTabContentProps {
  employeeId: number;
  employeeName: string;
}

const SignatureTabContent: React.FC<SignatureTabContentProps> = ({
  employeeId,
  employeeName
}) => {
  const [signatures, setSignatures] = useState<SampleSignature[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const loadSignatures = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await signatureService.getSignatures(employeeId);
      setSignatures(data);
    } catch (error) {
      console.error('Failed to load signatures:', error);
    } finally {
      setIsLoading(false);
    }
  }, [employeeId]);

  useEffect(() => {
    loadSignatures();
  }, [loadSignatures]);

  const handleDelete = async (id: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa chữ ký này không?')) {
      await signatureService.deleteSignature(id);
      loadSignatures();
    }
  };

  const handleSetDefault = async (id: string) => {
    await signatureService.setDefault(employeeId, id);
    loadSignatures();
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Header logic within tab */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-[24px] border border-slate-100 shadow-sm">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <span className="material-symbols-outlined text-emerald-500 text-[24px] font-variation-fill">draw</span>
            <h3 className="text-xl font-bold text-slate-900 tracking-tight">Danh sách chữ ký</h3>
          </div>
          <p className="text-slate-400 text-sm font-medium">Quản lý các mẫu chữ ký điện tử cho {employeeName}</p>
        </div>
        
        <button 
          onClick={() => setIsModalOpen(true)}
          className="h-11 px-6 rounded-xl bg-emerald-500 text-white font-bold text-sm flex items-center gap-2 hover:bg-emerald-600 active:scale-95 transition-all shadow-lg shadow-emerald-500/20"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          Tạo mới
        </button>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <SignatureTable 
          signatures={signatures} 
          onDelete={handleDelete}
          onSetDefault={handleSetDefault}
        />
      )}

      <SignatureEditorModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        onSuccess={loadSignatures}
        employeeId={employeeId}
      />
    </div>
  );
};

export default SignatureTabContent;
