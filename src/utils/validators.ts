/* eslint-disable @typescript-eslint/no-explicit-any */
// Tipo para las funciones de validación
export type ValidationFunction = (value: any, fieldName?: string) => string | null;

// Interfaz para reglas de validación
export interface ValidationRule {
    validate: ValidationFunction;
    errorMessage?: string;
}

// Validadores comunes
export const validateRequired: ValidationFunction = (value, fieldName = 'Este campo') => {
    if (value === undefined || value === null || value === '') {
        return `${fieldName} es requerido`;
    }
    return null;
};

export const validateEmail: ValidationFunction = (value) => {
    if (!value) return null;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
        return 'Correo electrónico inválido';
    }
    return null;
};

export const validateUrl: ValidationFunction = (value) => {
    if (!value) return null;
    try {
        new URL(value);
        return null;
    } catch (e) {
        console.error(e);
        return 'URL inválida';
    }
};

export const validateMinLength: (minLength: number) => ValidationFunction = (minLength) =>
    (value, fieldName = 'Este campo') => {
        if (!value) return null;
        if (String(value).length < minLength) {
            return `${fieldName} debe tener al menos ${minLength} caracteres`;
        }
        return null;
    };

export const validateMaxLength: (maxLength: number) => ValidationFunction = (maxLength) =>
    (value, fieldName = 'Este campo') => {
        if (!value) return null;
        if (String(value).length > maxLength) {
            return `${fieldName} debe tener como máximo ${maxLength} caracteres`;
        }
        return null;
    };

// Validador compuesto que combina múltiples validaciones
export const composeValidators = (validators: ValidationFunction[], fieldName?: string) =>
    (value: any): string | null => {
        for (const validator of validators) {
            const error = validator(value, fieldName);
            if (error) return error;
        }
        return null;
    };

// Función específica para validar texto (como la usabas antes)
export const validateText = (value: string, fieldName: string): string | null => {
    if (!value || value.trim() === '') {
        return `${fieldName} es requerido`;
    }
    if (value.length < 3) {
        return `${fieldName} debe tener al menos 3 caracteres`;
    }
    return null;
};


// Vamos a definir algunas validaciones adicionales
export const validatePositiveNumber: ValidationFunction = (value, fieldName = 'Este campo') => {
    if (!value) return null;
    const num = parseFloat(value);
    if (isNaN(num) || num <= 0) {
        return `${fieldName} debe ser un número positivo`;
    }
    return null;
};

export const validateDate: ValidationFunction = (value, fieldName = 'La fecha') => {
    if (!value) return null;

    const selectedDate = new Date(value);
    const today = new Date();

    if (selectedDate > today) {
        return `${fieldName} no puede ser en el futuro`;
    }
    return null;
};

