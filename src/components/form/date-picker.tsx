import { useEffect, useRef } from "react";
import flatpickr from "flatpickr";
import "flatpickr/dist/flatpickr.css";
import Label from "./Label";
import { CalenderIcon } from "../../icons";
import Hook = flatpickr.Options.Hook;
import DateOption = flatpickr.Options.DateOption;
import { ValidationFunction } from "../../utils/validators";

type PropsType = {
  id: string;
  mode?: "single" | "multiple" | "range" | "time";
  onChange?: Hook | Hook[];
  defaultDate?: DateOption;
  label?: string;
  placeholder?: string;
  name?: string
  onChangeInput?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlurInput?: (e: React.FocusEvent<HTMLInputElement>) => void;
  value?: string;
  validators?: ValidationFunction[];
  registerField?: (name: string, validators?: ValidationFunction[], fieldName?: string) => void;
  fieldName?: string;
  error?: boolean;
  hint?: string;
  errorMessage?: string;
  success?: boolean;

};

export default function DatePicker({
  id,
  mode,
  onChange,
  label,
  defaultDate,
  placeholder,
  name,
  validators = [],
  fieldName,
  error = false,
  success = false,
  hint,
  errorMessage,
  registerField,
}: PropsType) {

  // Usamos un ref para rastrear si ya hemos registrado este campo
  const isRegistered = useRef(false);

  useEffect(() => {
    // Solo registramos el campo una vez
    if (registerField && validators.length > 0 && !isRegistered.current) {
      registerField(name || "", validators, fieldName || name || "");
      isRegistered.current = true;
    }
  }, [registerField, name, validators, fieldName]);

  useEffect(() => {
    const flatPickr = flatpickr(`#${id}`, {
      mode: mode || "single",
      static: true,
      monthSelectorType: "static",
      dateFormat: "Y-m-d",
      defaultDate,
      onChange,
    });

    return () => {
      if (!Array.isArray(flatPickr)) {
        flatPickr.destroy();
      }
    };
  }, [mode, onChange, id, defaultDate]);

  const displayMessage = errorMessage || hint;

  return (
    <div>
      {label && <Label htmlFor={id}>{label}</Label>}

      <div className="relative">
        <input
          id={id}
          placeholder={placeholder}
          className="h-11 w-full rounded-lg border appearance-none px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-3  dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30  bg-transparent text-gray-800 border-gray-300 focus:border-brand-300 focus:ring-brand-500/20 dark:border-gray-700  dark:focus:border-brand-800"
          // onChange={onChangeInput}
          // onBlur={onBlurInput}
          // value={value}
        />
        {displayMessage && (
          <p
            className={`mt-1.5 text-xs ${error
              ? "text-error-500"
              : success
                ? "text-success-500"
                : "text-gray-500"
              }`}
          >
            {displayMessage}
          </p>
        )}

        <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
          <CalenderIcon className="size-6" />
        </span>
      </div>
    </div>
  );
}
