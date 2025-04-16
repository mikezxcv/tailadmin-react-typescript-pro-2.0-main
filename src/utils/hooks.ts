
//////// VALIDACION HOOKS /////////////
// src/hooks/useFormValidation.ts
import { useState, useCallback } from 'react';
import { ValidationFunction } from './validators';

interface FieldConfig {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    value: any;
    validators?: ValidationFunction[];
    touched: boolean;
    error: string | null;
    fieldName?: string;
}

interface FormConfig {
    [key: string]: FieldConfig;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useFormValidation<T extends Record<string, any>>(initialValues: T) {
    const [formState, setFormState] = useState<{ values: T, errors: Record<string, string | null>, touched: Record<string, boolean> }>({
        values: initialValues,
        errors: Object.keys(initialValues).reduce((acc, key) => ({ ...acc, [key]: null }), {}),
        touched: Object.keys(initialValues).reduce((acc, key) => ({ ...acc, [key]: false }), {})
    });

    const [fieldConfigs, setFieldConfigs] = useState<FormConfig>({});

    // Registrar un campo con sus validadores
    const registerField = useCallback((
        name: string,
        validators: ValidationFunction[] = [],
        fieldName?: string
    ) => {
        setFieldConfigs(prev => ({
            ...prev,
            [name]: {
                value: formState.values[name],
                validators,
                touched: formState.touched[name] || false,
                error: formState.errors[name],
                fieldName
            }
        }));
    }, [formState.values, formState.touched, formState.errors]);

    // Validar un campo específico
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const validateField = useCallback((name: string, value: any): string | null => {
        const field = fieldConfigs[name];
        if (!field || !field.validators || field.validators.length === 0) return null;

        for (const validator of field.validators) {
            const error = validator(value, field.fieldName);
            if (error) return error;
        }
        return null;
    }, [fieldConfigs]);

    // Manejar cambio de valor en un campo
    const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        const error = validateField(name, value);

        setFormState(prev => ({
            ...prev,
            values: { ...prev.values, [name]: value },
            errors: { ...prev.errors, [name]: error },
        }));
    }, [validateField]);

    // Marcar un campo como tocado
    const handleBlur = useCallback((e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name } = e.target;
        setFormState(prev => ({
            ...prev,
            touched: { ...prev.touched, [name]: true }
        }));
    }, []);

    // Validar todo el formulario
    const validateForm = useCallback(() => {
        const newErrors: Record<string, string | null> = {};
        let isValid = true;

        Object.keys(fieldConfigs).forEach(fieldName => {
            const value = formState.values[fieldName];
            const error = validateField(fieldName, value);
            newErrors[fieldName] = error;
            if (error) isValid = false;
        });

        setFormState(prev => ({
            ...prev,
            errors: newErrors,
            // Marcar todos los campos como tocados al validar el formulario
            touched: Object.keys(prev.touched).reduce((acc, key) => ({ ...acc, [key]: true }), {})
        }));

        return isValid;
    }, [fieldConfigs, formState.values, validateField]);

    const resetForm = useCallback(() => {
        setFormState({
            values: initialValues,
            errors: Object.keys(initialValues).reduce((acc, key) => ({ ...acc, [key]: null }), {}),
            touched: Object.keys(initialValues).reduce((acc, key) => ({ ...acc, [key]: false }), {})
        });
    }, [initialValues]);

    return {
        values: formState.values,
        errors: formState.errors,
        touched: formState.touched,
        handleChange,
        handleBlur,
        validateForm,
        resetForm,
        registerField,
        isFieldInvalid: (name: string) => formState.touched[name] && formState.errors[name] !== null,
        getFieldError: (name: string) => formState.touched[name] ? formState.errors[name] : null
    };
}