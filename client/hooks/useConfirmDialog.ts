import { useState, useCallback } from 'react';

interface ConfirmDialogState {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void | Promise<void>;
  variant?: 'danger' | 'warning' | 'info';
  confirmText?: string;
  cancelText?: string;
}

export function useConfirmDialog() {
  const [state, setState] = useState<ConfirmDialogState>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });
  const [isLoading, setIsLoading] = useState(false);

  const confirm = useCallback(
    (options: Omit<ConfirmDialogState, 'isOpen'>) => {
      setState({
        isOpen: true,
        ...options,
      });
    },
    []
  );

  const handleConfirm = useCallback(async () => {
    setIsLoading(true);
    try {
      await state.onConfirm();
      setState((prev) => ({ ...prev, isOpen: false }));
    } catch (error) {
      console.error('Confirmation action failed:', error);
    } finally {
      setIsLoading(false);
    }
  }, [state.onConfirm]);

  const handleClose = useCallback(() => {
    if (!isLoading) {
      setState((prev) => ({ ...prev, isOpen: false }));
    }
  }, [isLoading]);

  return {
    ...state,
    isLoading,
    confirm,
    handleConfirm,
    handleClose,
  };
}
