import { useCallback, useState } from 'react';

type PendingAction = (() => void) | null;

export const useUnsavedChangesGuard = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);

  const requestAction = useCallback((shouldGuard: boolean, action: () => void) => {
    if (!shouldGuard) {
      action();
      return;
    }

    setPendingAction(() => action);
    setIsDialogOpen(true);
  }, []);

  const confirmAction = useCallback(() => {
    setIsDialogOpen(false);
    const action = pendingAction;
    setPendingAction(null);
    action?.();
  }, [pendingAction]);

  const cancelAction = useCallback(() => {
    setIsDialogOpen(false);
    setPendingAction(null);
  }, []);

  return {
    isDialogOpen,
    requestAction,
    confirmAction,
    cancelAction,
  };
};

export default useUnsavedChangesGuard;
