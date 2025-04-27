
// FormField.tsx - Versión expandida para soportar múltiples tipos de campos
import React from 'react';
import Label from '../form/Label';
import Input from '../form/input/InputField';
import Select from '../form/Select'; // Asumimos que existe este componente
import Checkbox from '../form/input/Checkbox';
import TextArea from '../form/input/TextArea';

interface BaseFieldProps {
    name: string;
    label: string;
    required?: boolean;
    error?: string | null;
    icon?: React.ReactNode;
}

interface InputFieldProps extends BaseFieldProps {
    type: 'text' | 'email' | 'password' | 'number' | 'date' | 'tel' | 'url';
    placeholder?: string;
    value: string | number;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onBlur: () => void;
    rightElement?: React.ReactNode;
    min?: number | string;
    max?: number | string;
}

interface SelectFieldProps extends BaseFieldProps {
    type: 'select';
    options: Array<{ value: string; label: string }>;
    value: string;
    placeholder?: string;
    onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    onBlur: () => void;
}

interface CheckboxFieldProps extends BaseFieldProps {
    type: 'checkbox';
    checked: boolean;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onBlur: () => void;
    description?: string;
}

interface TextAreaFieldProps extends BaseFieldProps {
    type: 'textarea';
    placeholder?: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
    onBlur: () => void;
    rows?: number;
}

interface RadioGroupFieldProps extends BaseFieldProps {
    type: 'radio';
    options: Array<{ value: string; label: string }>;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onBlur: () => void;
}

type FormFieldProps =
    | InputFieldProps
    | SelectFieldProps
    | CheckboxFieldProps
    | TextAreaFieldProps
    | RadioGroupFieldProps;

export const FormField: React.FC<FormFieldProps> = (props) => {
    const { name, label, required, error } = props;

    const renderField = () => {
        switch (props.type) {
            case 'text':
            case 'email':
            case 'password':
            case 'number':
            case 'date':
            case 'tel':
            case 'url':
                return renderInputField(props);
            case 'select':
                return renderSelectField(props);
            case 'checkbox':
                return renderCheckboxField(props);
            case 'textarea':
                return renderTextAreaField(props);
            case 'radio':
                return renderRadioGroupField(props);
            default:
                return null;
        }
    };

    const renderInputField = (props: InputFieldProps) => {
        const { type, placeholder, value, onChange, onBlur, icon, rightElement, min, max } = props;
        return (
            <>
                <div className="relative">
                    {icon && (
                        <div className="absolute left-3 top-1/2 -translate-y-1/2">
                            {icon}
                        </div>
                    )}
                    <Input
                        id={name}
                        name={name}
                        type={type}
                        placeholder={placeholder}
                        value={value as string}
                        onChange={onChange}
                        onBlur={onBlur}
                        error={!!error}
                        className={icon ? 'pl-10' : ''}
                        min={min !== undefined ? String(min) : undefined}
                        max={max !== undefined ? String(max) : undefined}
                    />
                    {rightElement && (
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 z-30">
                            {rightElement}
                        </div>
                    )}
                </div>
            </>
        );
    };

    const renderSelectField = (props: SelectFieldProps) => {
        const { options, value, onChange, onBlur, placeholder } = props;
        return (
            <Select
                name={name}
                value={value}
                onChange={onChange}
                onBlur={onBlur}
                error={!!error}
                placeholder={placeholder}
                options={options}
            >
            </Select>
        );
    };

    const renderCheckboxField = (props: CheckboxFieldProps) => {
        const { checked, onChange, onBlur, description } = props;
        return (
            <div className="flex items-start">
                <Checkbox
                    id={name}
                    name={name}
                    checked={checked}
                    onChange={onChange}
                    onBlur={onBlur}
                    error={!!error}
                />
                <div className="ml-2">
                    <label htmlFor={name} className="text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
                        {label}
                    </label>
                    {description && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {description}
                        </p>
                    )}
                </div>
            </div>
        );
    };

    const renderTextAreaField = (props: TextAreaFieldProps) => {
        const { placeholder, value, onChange, onBlur, rows = 3 } = props;
        return (
            <TextArea
                // id={name}
                name={name}
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                onBlur={onBlur}
                rows={rows}
                error={!!error}
            />
        );
    };

    const renderRadioGroupField = (props: RadioGroupFieldProps) => {
        const { options, value, onChange, onBlur } = props;
        return (
            <div className="space-y-2">
                {options.map((option) => (
                    <div key={option.value} className="flex items-center">
                        <input
                            type="radio"
                            id={`${name}-${option.value}`}
                            name={name}
                            value={option.value}
                            checked={value === option.value}
                            onChange={onChange}
                            onBlur={onBlur}
                            className="h-4 w-4 text-primary-600 focus:ring-primary-500"
                        />
                        <label
                            htmlFor={`${name}-${option.value}`}
                            className="ml-2 text-sm text-gray-700 dark:text-gray-300"
                        >
                            {option.label}
                        </label>
                    </div>
                ))}
            </div>
        );
    };

    // Para el caso especial del checkbox, mostramos el label de manera diferente
    if (props.type === 'checkbox') {
        return (
            <div className="space-y-1">
                {renderField()}
                {error && <p className="text-sm text-error-500 mt-1">{error}</p>}
            </div>
        );
    }

    return (
        <div className="space-y-1">
            <Label htmlFor={name}>
                {label} {required && <span className="text-error-500">*</span>}
            </Label>
            {renderField()}
            {error && <p className="text-sm text-error-500">{error}</p>}
        </div>
    );
};