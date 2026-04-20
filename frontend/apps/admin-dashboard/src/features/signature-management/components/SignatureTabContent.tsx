import { useState, useEffect, useCallback, useImperativeHandle, forwardRef } from 'react';
import { type SampleSignature } from '../types';
import { signatureService } from '../../../services/signatureService';
import SignatureTable from './SignatureTable';
import SignatureEditorModal from './SignatureEditorModal';

export interface SignatureTabContentRef {
  openCreateModal: () => void;
}

interface SignatureTabContentProps {
  employeeId: number;
}

const SignatureTabContent = forwardRef<SignatureTabContentRef, SignatureTabContentProps>(({
  employeeId
}, ref) => {
  const [signatures, setSignatures] = useState<SampleSignature[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useImperativeHandle(ref, () => ({
    openCreateModal: () => setIsModalOpen(true)
  }));

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
});

export default SignatureTabContent;
