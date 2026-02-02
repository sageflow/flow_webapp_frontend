import React from 'react';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';

interface FormFieldProps {
  label: string;
  name: string;
  type?: 'text' | 'email' | 'password' | 'tel' | 'date' | 'select' | 'textarea';
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  options?: Array<{ value: string; label: string }>;
  rows?: number;
  maxLength?: number;
  autoComplete?: string;
  className?: string;
}

const FormField: React.FC<FormFieldProps> = ({
  label,
  name,
  type = 'text',
  value,
  onChange,
  placeholder,
  required = false,
  disabled = false,
  error,
  options = [],
  rows = 3,
  maxLength,
  autoComplete,
  className = '',
}) => {
  const [showPassword, setShowPassword] = React.useState(false);
  const isPassword = type === 'password';

  const renderField = () => {
    const commonProps = {
      name,
      value,
      onChange,
      placeholder,
      required,
      disabled,
      maxLength,
      autoComplete,
      className: `input-field ${error ? 'border-red-500' : ''} ${className}`,
    };

    switch (type) {
      case 'select':
        return (
          <select {...commonProps}>
            <option value="">Select {label}</option>
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );

      case 'textarea':
        return (
          <textarea
            {...commonProps}
            rows={rows}
            className={`textarea-field ${error ? 'border-red-500' : ''} ${className}`}
          />
        );

      case 'password':
        return (
          <div className="relative">
            <input
              {...commonProps}
              type={showPassword ? 'text' : 'password'}
              className={`input-field pr-12 ${error ? 'border-red-500' : ''} ${className}`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 disabled:opacity-50"
              disabled={disabled}
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        );

      default:
        return <input {...commonProps} type={type} />;
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-label text-label">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      
      {renderField()}
      
      {error && (
        <div className="flex items-center space-x-2 text-sm text-red-600">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};

export default FormField;
