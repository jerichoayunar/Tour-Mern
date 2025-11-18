import React from 'react';
import { useToast } from '../../context/ToastContext';
import Toast from './Toast';

/**
 * TOAST CONTAINER
 * 
 * WHAT THIS DOES:
 * - Renders all active toasts in a container
 * - Manages toast positioning and stacking
 * - Should be placed in your main App component
 * 
 * USAGE:
 * <ToastContainer />
 */

function ToastContainer() {
  const { toasts, removeToast } = useToast();

  if (toasts.length === 0) {
    return null;
  }

  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          duration={toast.duration}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>
  );
}

export default ToastContainer;