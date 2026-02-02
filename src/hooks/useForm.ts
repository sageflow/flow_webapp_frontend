import { useState, useCallback } from 'react';
import { validateRequired, isValidEmail, isValidPassword, isValidPhone } from '../utils';
import { VALIDATION_CONSTANTS } from '../constants';

interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: any) => string | null;
}

interface ValidationRules {
  [key: string]: ValidationRule;
}

interface FormErrors {
  [key: string]: string;
}

interface UseFormOptions<T> {
  initialValues: T;
  validationRules?: ValidationRules;
  onSubmit: (values: T) => Promise<void> | void;
}

export const useForm = <T extends Record<string, any>>({
  initialValues,
  validationRules = {},
  onSubmit,
}: UseFormOptions<T>) => {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const setValue = useCallback((name: keyof T, value: any) => {
    setValues(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name as string]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  }, [errors]);

  const setFieldError = useCallback((name: keyof T, error: string) => {
    setErrors(prev => ({ ...prev, [name]: error }));
  }, []);

  const setFieldTouched = useCallback((name: keyof T, isTouched: boolean = true) => {
    setTouched(prev => ({ ...prev, [name]: isTouched }));
  }, []);

  const validateField = useCallback((name: keyof T, value: any): string | null => {
    const rules = validationRules[name as string];
    if (!rules) return null;

    // Required validation
    if (rules.required && !validateRequired(value)) {
      return `${name} is required`;
    }

    // Length validation
    if (typeof value === 'string') {
      if (rules.minLength && value.length < rules.minLength) {
        return `${name} must be at least ${rules.minLength} characters`;
      }
      if (rules.maxLength && value.length > rules.maxLength) {
        return `${name} must be no more than ${rules.maxLength} characters`;
      }
    }

    // Pattern validation
    if (rules.pattern && typeof value === 'string' && !rules.pattern.test(value)) {
      return `${name} format is invalid`;
    }

    // Custom validation
    if (rules.custom) {
      return rules.custom(value);
    }

    return null;
  }, [validationRules]);

  const validateForm = useCallback((): boolean => {
    const newErrors: FormErrors = {};
    let isValid = true;

    Object.keys(validationRules).forEach(fieldName => {
      const fieldValue = values[fieldName as keyof T];
      const error = validateField(fieldName as keyof T, fieldValue);
      
      if (error) {
        newErrors[fieldName] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  }, [values, validationRules, validateField]);

  const handleInputChange = useCallback((
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setValue(name as keyof T, value);
    setFieldTouched(name as keyof T, true);
  }, [setValue, setFieldTouched]);

  const handleBlur = useCallback((name: keyof T) => {
    setFieldTouched(name, true);
    
    // Validate field on blur if it has been touched
    if (touched[name as string]) {
      const error = validateField(name, values[name]);
      if (error) {
        setFieldError(name, error);
      }
    }
  }, [touched, validateField, values, setFieldError]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(values);
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [validateForm, onSubmit, values]);

  const resetForm = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  }, [initialValues]);

  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  const getFieldProps = useCallback((name: keyof T) => ({
    name: name as string,
    value: values[name],
    onChange: handleInputChange,
    onBlur: () => handleBlur(name),
    error: errors[name as string],
    touched: touched[name as string],
  }), [name, values, handleInputChange, handleBlur, errors, touched]);

  return {
    values,
    errors,
    touched,
    isSubmitting,
    setValue,
    setFieldError,
    setFieldTouched,
    handleInputChange,
    handleBlur,
    handleSubmit,
    resetForm,
    clearErrors,
    getFieldProps,
    validateField,
    validateForm,
  };
};

// Predefined validation rules
export const validationRules = {
  required: { required: true },
  email: { 
    required: true, 
    custom: (value: string) => !isValidEmail(value) ? 'Invalid email format' : null 
  },
  password: { 
    required: true, 
    minLength: VALIDATION_CONSTANTS.MIN_PASSWORD_LENGTH,
    custom: (value: string) => !isValidPassword(value) ? 'Password must contain at least 8 characters, one uppercase letter, one lowercase letter, and one number' : null
  },
  username: { 
    required: true, 
    minLength: VALIDATION_CONSTANTS.MIN_USERNAME_LENGTH,
    maxLength: VALIDATION_CONSTANTS.MAX_USERNAME_LENGTH
  },
  phone: { 
    required: true, 
    custom: (value: string) => !isValidPhone(value) ? 'Invalid phone number format' : null 
  },
  name: { 
    required: true, 
    minLength: VALIDATION_CONSTANTS.MIN_NAME_LENGTH,
    maxLength: VALIDATION_CONSTANTS.MAX_NAME_LENGTH
  },
  description: { 
    maxLength: VALIDATION_CONSTANTS.MAX_DESCRIPTION_LENGTH 
  },
  notes: { 
    maxLength: VALIDATION_CONSTANTS.MAX_NOTES_LENGTH 
  },
};
