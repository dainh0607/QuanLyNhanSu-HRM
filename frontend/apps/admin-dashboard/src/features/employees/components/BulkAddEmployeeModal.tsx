import QuickAddEmployeesModal from "../../shift-scheduling/quick-add-employees/QuickAddEmployeesModal";

interface BulkAddEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultBranchId?: number;
  onSuccess?: (createdCount: number) => void;
}

const BulkAddEmployeeModal = ({
  isOpen,
  onClose,
  defaultBranchId,
  onSuccess,
}: BulkAddEmployeeModalProps) => (
  <QuickAddEmployeesModal
    isOpen={isOpen}
    preferredBranchId={defaultBranchId ? String(defaultBranchId) : undefined}
    onClose={onClose}
    onSuccess={(createdCount) => {
      onSuccess?.(createdCount);
    }}
  />
);

export default BulkAddEmployeeModal;