import { useState, useCallback } from "react";

const useConfirm = () => {
  const [confirmState, setConfirmState] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: null,
  });

  const confirm = useCallback((title, message) => {
    return new Promise((resolve) => {
      setConfirmState({
        isOpen: true,
        title,
        message,
        onConfirm: resolve,
      });
    });
  }, []);

  const handleConfirm = useCallback(() => {
    confirmState.onConfirm?.(true);
    setConfirmState((prev) => ({ ...prev, isOpen: false, onConfirm: null }));
  }, [confirmState]);

  const handleCancel = useCallback(() => {
    confirmState.onConfirm?.(false);
    setConfirmState((prev) => ({ ...prev, isOpen: false, onConfirm: null }));
  }, [confirmState]);

  return {
    confirm,
    confirmState,
    handleConfirm,
    handleCancel,
  };
};

export default useConfirm;
