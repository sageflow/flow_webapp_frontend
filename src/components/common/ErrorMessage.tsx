import React from 'react';
import { AlertCircle, X } from 'lucide-react';

interface ErrorMessageProps {
  message: string;
  onClose?: () => void;
  variant?: 'error' | 'warning' | 'info';
  className?: string;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({
  message,
  onClose,
  variant = 'error',
  className = '',
}) => {
  const variantClasses = {
    error: 'bg-red-50 border-red-200 text-red-700',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-700',
    info: 'bg-blue-50 border-blue-200 text-blue-700',
  };

  const iconColors = {
    error: 'text-red-500',
    warning: 'text-yellow-500',
    info: 'text-blue-500',
  };

  return (
    <div className={`p-4 border rounded-input flex items-center space-x-3 ${variantClasses[variant]} ${className}`}>
      <AlertCircle className={`w-5 h-5 flex-shrink-0 ${iconColors[variant]}`} />
      <span className="text-sm flex-1">{message}</span>
      {onClose && (
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Close error message"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

export default ErrorMessage;
