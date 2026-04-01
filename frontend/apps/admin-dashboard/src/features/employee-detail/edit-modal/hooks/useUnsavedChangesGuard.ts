import { useCallback, useRef, useState } from 'react';

type PendingAction = () => void;

export const useUnsavedChangesGuard = () => {
  const pendingActionRef = useRef<PendingAction | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const requestAction = useCallback((shouldBlock: boolean, action: PendingAction) => {
    if (!shouldBlock) {
      action();
      return;
    }

    pendingActionRef.current = action;
    setIsDialogOpen(true);
  }, []);

  const confirmAction = useCallback(() => {
    const nextAction = pendingActionRef.current;
    pendingActionRef.current = null;
    setIsDialogOpen(false);
    nextAction?.();
  }, []);

  const cancelAction = useCallback(() => {
    pendingActionRef.current = null;
    setIsDialogOpen(false);
  }, []);

  return {
    isDialogOpen,
    requestAction,
    confirmAction,
    cancelAction,
  };
};

export default useUnsavedChangesGuard;
