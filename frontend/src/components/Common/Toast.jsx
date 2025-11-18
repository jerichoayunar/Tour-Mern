import { useEffect } from 'react';
import './Toast.css';

/**
 * TOAST COMPONENT
 * 
 * WHAT THIS DOES:
 * - Displays temporary notification messages
 * - Auto-hides after specified time
 * - Different types: success, error, warning, info
 * - Smooth animations for appearing/disappearing
 * 
 * USAGE:
 * <Toast message="Operation successful!" type="success" onClose={handleClose} />
 */

function Toast({ message, type = 'info', onClose, duration = 5000 }) {
  useEffect(() => {
    // Auto-close the toast after duration
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    // Cleanup timer on unmount
    return () => clearTimeout(timer);
  }, [onClose, duration]);

  // Get appropriate icon and styles for each type
  const getToastConfig = () => {
    const config = {
      success: {
        icon: '✅',
        className: 'toast-success',
        title: 'Success'
      },
      error: {
        icon: '❌',
        className: 'toast-error', 
        title: 'Error'
      },
      warning: {
        icon: '⚠️',
        className: 'toast-warning',
        title: 'Warning'
      },
      info: {
        icon: 'ℹ️',
        className: 'toast-info',
        title: 'Info'
      },
      loading: {
        icon: '⏳',
        className: 'toast-loading',
        title: 'Loading'
      }
    };
    return config[type] || config.info;
  };

  const { icon, className, title } = getToastConfig();

  return (
    <div className={`toast ${className}`}>
      <div className="toast-content">
        <span className="toast-icon">{icon}</span>
        <div className="toast-message">
          <div className="toast-title">{title}</div>
          <div className="toast-text">{message}</div>
        </div>
        <button 
          className="toast-close" 
          onClick={onClose}
          aria-label="Close notification"
        >
          ×
        </button>
      </div>
    </div>
  );
}

export default Toast;