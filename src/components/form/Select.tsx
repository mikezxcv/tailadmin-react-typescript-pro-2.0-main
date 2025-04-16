import { useEffect, useRef } from "react";
import { ValidationFunction } from "../../utils/validators";

interface Option {
  value: string;
  label: string;
}

interface SelectProps {
  options: Option[];
  placeholder?: string;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLSelectElement>) => void;
  className?: string;
  defaultValue?: string;
  value?: string;
  name?: string; // Requerido para la validación
  error?: boolean;
  errorMessage?: string;
  hint?: string;
  validators?: ValidationFunction[];
  fieldName?: string;
  registerField?: (name: string, validators?: ValidationFunction[], fieldName?: string) => void;
  disabled?: boolean;
}

const Select: React.FC<SelectProps> = ({
  options,
  placeholder = "Select an option",
  onChange,
  onBlur,
  className = "",
  defaultValue = "",
  value,
  name = "",
  error = false,
  errorMessage,
  hint,
  validators = [],
  fieldName,
  registerField,
  disabled = false,
}) => {
  // Usamos un ref para rastrear si ya hemos registrado este campo
  const isRegistered = useRef(false);

  useEffect(() => {
    // Solo registramos el campo una vez
    if (registerField && validators.length > 0 && !isRegistered.current) {
      registerField(name, validators, fieldName || name);
      isRegistered.current = true;
    }
  }, [registerField, name, validators, fieldName]);

  // Controlamos el valor directamente a través de props en lugar de estado interno
  const selectValue = value !== undefined ? value : defaultValue;

  // Clases para estilos
  let selectClasses = `h-11 w-full appearance-none rounded-lg border px-4 py-2.5 pr-11 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-3 ${className}`;

  if (disabled) {
    selectClasses += ` text-gray-500 border-gray-300 opacity-40 bg-gray-100 cursor-not-allowed dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700`;
  } else if (error) {
    selectClasses += ` border-error-500 focus:border-error-300 focus:ring-error-500/20 dark:text-error-400 dark:border-error-500 dark:focus:border-error-800`;
  } else {
    selectClasses += ` bg-transparent text-gray-800 border-gray-300 focus:border-brand-300 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800`;
  }

  // Añadir clase adicional basada en si hay un valor seleccionado
  selectClasses += selectValue
    ? " text-gray-800 dark:text-white/90"
    : " text-gray-400 dark:text-gray-400";

  const displayMessage = errorMessage || hint;

  return (
    <div className="relative">
      <select
        className={selectClasses}
        value={selectValue}
        onChange={onChange}
        onBlur={onBlur}
        name={name}
        id={name}
        disabled={disabled}
      >
        {/* Placeholder option */}
        <option
          value=""
          disabled
          className="text-gray-700 dark:bg-gray-900 dark:text-gray-400"
        >
          {placeholder}
        </option>
        {/* Map over options */}
        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
            className="text-gray-700 dark:bg-gray-900 dark:text-gray-400"
          >
            {option.label}
          </option>
        ))}
      </select>

      {/* Flecha personalizada para el select */}
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 dark:text-gray-400">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </div>

      {displayMessage && (
        <p
          className={`mt-1.5 text-xs ${error
            ? "text-error-500"
            : "text-gray-500"
            }`}
        >
          {displayMessage}
        </p>
      )}
    </div>
  );
};

export default Select;