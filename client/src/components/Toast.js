import React from 'react';

const Toast = ({ message, type = 'info', onClose, duration = 5000 }) => {
  React.useEffect(() => {
    if (duration && onClose) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const typeStyles = {
    success: {
      bg: 'bg-green-100 border-green-500',
      text: 'text-green-800',
      icon: (
        <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
      )
    },
    error: {
      bg: 'bg-red-100 border-red-500',
      text: 'text-red-800',
      icon: (
        <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
        </svg>
      )
    },
    warning: {
      bg: 'bg-yellow-100 border-yellow-500',
      text: 'text-yellow-800',
      icon: (
        <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
      )
    },
    info: {
      bg: 'bg-blue-100 border-blue-500',
      text: 'text-blue-800',
      icon: (
        <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
        </svg>
      )
    }
  };

  const style = typeStyles[type];

  return (
    <div className={`fixed top-4 right-4 z-50 flex items-center p-4 border-l-4 rounded-lg shadow-lg ${style.bg} animate-slide-in-right`}>
      <div className="flex-shrink-0">{style.icon}</div>
      <div className={`ml-3 mr-8 text-sm font-medium ${style.text}`}>{message}</div>
      {onClose && (
        <button
          onClick={onClose}
          className="ml-auto -mx-1.5 -my-1.5 p-1.5 rounded-lg hover:bg-gray-200 focus:ring-2 focus:ring-gray-300"
        >
          <svg className="w-4 h-4 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      )}
    </div>
  );
};

// Toast container for multiple toasts
export const ToastContainer = ({ toasts, removeToast }) => {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => removeToast(toast.id)}
          duration={toast.duration}
        />
      ))}
    </div>
  );
};

// Custom hook for toast management
export const useToast = () => {
  const [toasts, setToasts] = React.useState([]);

  const addToast = React.useCallback((message, type = 'info', duration = 5000) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type, duration }]);
    return id;
  }, []);

  const removeToast = React.useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const success = React.useCallback((message, duration) => addToast(message, 'success', duration), [addToast]);
  const error = React.useCallback((message, duration) => addToast(message, 'error', duration), [addToast]);
  const warning = React.useCallback((message, duration) => addToast(message, 'warning', duration), [addToast]);
  const info = React.useCallback((message, duration) => addToast(message, 'info', duration), [addToast]);

  return {
    toasts,
    addToast,
    removeToast,
    success,
    error,
    warning,
    info
  };
};

export default Toast;
