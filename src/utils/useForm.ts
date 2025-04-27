/* eslint-disable @typescript-eslint/no-explicit-any */
// Expansión de nuestro hook useForm para soportar múltiples tipos de inputs
// hooks/useForm.ts (modificación)
import { useState, ChangeEvent, FormEvent, useCallback } from 'react';
import { ValidationFunction } from './validators';

type FormErrors<T> = Partial<Record<keyof T, string | null>>;
type FieldValidators<T> = Partial<Record<keyof T, ValidationFunction>>;

export interface UseFormProps<T> {
  initialValues: T;
  validators?: FieldValidators<T>;
  onSubmit: (values: T) => void;
}

export function useForm<T extends Record<string, any>>({
  initialValues,
  validators = {},
  onSubmit,
}: UseFormProps<T>) {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<FormErrors<T>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validar un campo específico
  const validateField = useCallback(
    (name: keyof T, value: any): string | null => {
      const validator = validators[name];
      return validator ? validator(value, String(name)) : null;
    },
    [validators]
  );

  // Validar todos los campos
  const validateForm = useCallback((): boolean => {
    const newErrors: FormErrors<T> = {};
    let isValid = true;

    Object.keys(values).forEach((key) => {
      const fieldName = key as keyof T;
      const error = validateField(fieldName, values[fieldName]);
      
      if (error) {
        newErrors[fieldName] = error;
        isValid = false;
      } else {
        newErrors[fieldName] = null;
      }
    });

    setErrors(newErrors);
    return isValid;
  }, [values, validateField]);

  // Manejar cambios en los inputs (extendido para manejar todos los tipos)
  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      const { name, value, type } = e.target;
      let fieldValue: string | boolean = value;
      
      // Manejar el tipo checkbox de manera especial
      if (type === 'checkbox') {
        fieldValue = (e.target as HTMLInputElement).checked;
      }
      
      setValues((prev) => ({
        ...prev,
        [name]: fieldValue,
      }));

      // Si el campo ya ha sido tocado, validar al cambiar
      if (touched[name as keyof T]) {
        const error = validateField(name as keyof T, fieldValue);
        setErrors((prev) => ({
          ...prev,
          [name]: error,
        }));
      }
    },
    [touched, validateField]
  );

  // Método específico para manejar cambios de valor directamente (útil para componentes custom)
  const setFieldValue = useCallback(
    (fieldName: keyof T, value: any) => {
      setValues((prev) => ({
        ...prev,
        [fieldName]: value,
      }));

      if (touched[fieldName]) {
        const error = validateField(fieldName, value);
        setErrors((prev) => ({
          ...prev,
          [fieldName]: error,
        }));
      }
    },
    [touched, validateField]
  );

  // Manejar el evento de blur (cuando el campo pierde el foco)
  const handleBlur = useCallback(
    (fieldName: keyof T) => {
      setTouched((prev) => ({
        ...prev,
        [fieldName]: true,
      }));

      const error = validateField(fieldName, values[fieldName]);
      setErrors((prev) => ({
        ...prev,
        [fieldName]: error,
      }));
    },
    [values, validateField]
  );

  // Manejar el envío del formulario
  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      
      // Marcar todos los campos como tocados
      const allTouched = Object.keys(values).reduce((acc, key) => {
        acc[key as keyof T] = true;
        return acc;
      }, {} as Record<keyof T, boolean>);
      
      setTouched(allTouched);
      
      // Validar el formulario
      const isValid = validateForm();
      
      if (isValid) {
        setIsSubmitting(true);
        try {
          await onSubmit(values);
        } catch (error) {
          console.error('Form submission error:', error);
        } finally {
          setIsSubmitting(false);
        }
      }
    },
    [values, validateForm, onSubmit]
  );

  // Restablecer el formulario
  const resetForm = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
  }, [initialValues]);

  return {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    resetForm,
    setValues,
    setFieldValue
  };
}