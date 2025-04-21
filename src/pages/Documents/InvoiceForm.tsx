import { ChangeEvent, FocusEvent, forwardRef, useEffect, useImperativeHandle, useState } from "react";
import Form from "../../components/form/Form";
import Input from "../../components/form/input/InputField";
import ComponentCard from "../../components/common/ComponentCard";
import Label from "../../components/form/Label";
import Select from "../../components/form/Select";
import { useFormValidation } from "../../utils/hooks";
import { validateRequired, validateMinLength, validatePositiveNumber } from "../../utils/validators";

interface InvoiceFormProps {
    invoiceNumber: number;
    onFormChange: (values: any, errors: any) => void;
}

const InvoiceForm = forwardRef(({ invoiceNumber, onFormChange }: InvoiceFormProps, ref) => {
    // Track if initial setup is complete
    const [isInitialized, setIsInitialized] = useState(false);

    // Opciones para los selectores
    const countriesOptions = [
        { value: "us", label: "Estados Unidos" },
        { value: "mx", label: "México" },
        { value: "co", label: "Colombia" },
        { value: "pe", label: "Perú" },
        { value: "ar", label: "Argentina" },
        { value: "cl", label: "Chile" },
        { value: "br", label: "Brasil" },
    ];

    const companiesOptions = [
        { value: "company1", label: "Empresa A" },
        { value: "company2", label: "Empresa B" },
        { value: "company3", label: "Empresa C" },
    ];

    const currenciesOptions = [
        { value: "USD", label: "Dólar Estadounidense (USD)" },
        { value: "EUR", label: "Euro (EUR)" },
        { value: "MXN", label: "Peso Mexicano (MXN)" },
        { value: "COP", label: "Peso Colombiano (COP)" },
        { value: "PEN", label: "Sol Peruano (PEN)" },
        { value: "ARS", label: "Peso Argentino (ARS)" },
        { value: "CLP", label: "Peso Chileno (CLP)" },
        { value: "BRL", label: "Real Brasileño (BRL)" },
    ];

    // Inicializar el estado del formulario
    const {
        values,
        errors,
        handleChange,
        handleBlur,
        validateForm,
        registerField,
        isFieldInvalid,
        getFieldError,
    } = useFormValidation({
        expenseDate: "",
        employee: "",
        country: "",
        company: "",
        localAmount: "",
        currency: "",
        exchangeRate: "",
        usdAmount: "",
        provider: "",
    });

    // Exponer el método validateForm al componente padre
    useImperativeHandle(ref, () => ({
        validateForm: () => {
            validateForm();
            onFormChange(values, errors);
        },
    }));

    // Registrar validadores para cada campo y validar al montar
    useEffect(() => {
        if (!isInitialized) {
            registerField("expenseDate", [validateRequired], "Fecha del gasto");
            registerField("employee", [validateRequired, validateMinLength(3)], "Empleado");
            registerField("country", [validateRequired], "País");
            registerField("company", [validateRequired], "Empresa");
            registerField("localAmount", [validateRequired, validatePositiveNumber], "Monto local");
            registerField("currency", [validateRequired], "Moneda");
            registerField("exchangeRate", [validateRequired, validatePositiveNumber], "Tipo de cambio");
            registerField("usdAmount", [validatePositiveNumber], "Monto en USD");
            registerField("provider", [validateRequired, validateMinLength(3)], "Proveedor");

            // Validar todos los campos al inicializar
            validateForm();
            setIsInitialized(true);

            // Notificar al padre del estado inicial
            onFormChange(values, errors);
        }
    }, [registerField, validateForm, onFormChange, values, errors, isInitialized]);

    // Actualizar el padre cada vez que cambian los errores
    useEffect(() => {
        if (isInitialized) {
            onFormChange(values, errors);
        }
    }, [errors, values, onFormChange, isInitialized]);

    // Custom change handler to update both local state and notify parent
    const handleLocalChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        handleChange(e);
        const updatedValues = {
            ...values,
            [e.target.name]: e.target.value,
        };
        onFormChange(updatedValues, errors);
    };

    // Custom blur handler
    const handleLocalBlur = (e: FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        handleBlur(e);
        setTimeout(() => {
            onFormChange(values, errors);
        }, 0);
    };

    return (
        <ComponentCard title={`Factura ${invoiceNumber}`} desc="Verifica los datos escaneados y completa el formulario para registrar la factura.">
            <Form onSubmit={(e) => { e.preventDefault(); }}>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div>
                        <Label htmlFor={`expenseDate-${invoiceNumber}`}>
                            Fecha del gasto <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            type="date"
                            placeholder="Seleccione"
                            name="expenseDate"
                            id={`expenseDate-${invoiceNumber}`}
                            value={values.expenseDate}
                            onChange={handleLocalChange}
                            onBlur={handleLocalBlur}
                            error={isFieldInvalid("expenseDate")}
                            errorMessage={getFieldError("expenseDate") ?? undefined}
                        />
                    </div>

                    <div className="col-span-2 sm:col-span-1">
                        <Label htmlFor={`employee-${invoiceNumber}`}>
                            Empleado <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            type="text"
                            placeholder="Nombre del empleado"
                            name="employee"
                            id={`employee-${invoiceNumber}`}
                            value={values.employee}
                            onChange={handleLocalChange}
                            onBlur={handleLocalBlur}
                            error={isFieldInvalid("employee")}
                            errorMessage={getFieldError("employee") ?? undefined}
                        />
                    </div>

                    <div className="col-span-2 sm:col-span-1">
                        <Label htmlFor={`country-${invoiceNumber}`}>
                            País <span className="text-red-500">*</span>
                        </Label>
                        <Select
                            options={countriesOptions}
                            placeholder="Seleccionar país"
                            name="country"
                            value={values.country}
                            onChange={handleLocalChange}
                            onBlur={handleLocalBlur}
                            error={isFieldInvalid("country")}
                            errorMessage={getFieldError("country") ?? undefined}
                        />
                    </div>

                    <div className="col-span-2 sm:col-span-1">
                        <Label htmlFor={`company-${invoiceNumber}`}>
                            Empresa <span className="text-red-500">*</span>
                        </Label>
                        <Select
                            options={companiesOptions}
                            placeholder="Seleccionar empresa"
                            name="company"
                            value={values.company}
                            onChange={handleLocalChange}
                            onBlur={handleLocalBlur}
                            error={isFieldInvalid("company")}
                            errorMessage={getFieldError("company") ?? undefined}
                        />
                    </div>

                    <div className="col-span-2 sm:col-span-1">
                        <Label htmlFor={`localAmount-${invoiceNumber}`}>
                            Monto local <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            type="number"
                            placeholder="0.00"
                            name="localAmount"
                            id={`localAmount-${invoiceNumber}`}
                            value={values.localAmount}
                            onChange={handleLocalChange}
                            onBlur={handleLocalBlur}
                            error={isFieldInvalid("localAmount")}
                            errorMessage={getFieldError("localAmount") ?? undefined}
                            step={0.01}
                            min="0.01"
                        />
                    </div>

                    <div className="col-span-2 sm:col-span-1">
                        <Label htmlFor={`currency-${invoiceNumber}`}>
                            Moneda <span className="text-red-500">*</span>
                        </Label>
                        <Select
                            options={currenciesOptions}
                            placeholder="Seleccionar moneda"
                            name="currency"
                            value={values.currency}
                            onChange={handleLocalChange}
                            onBlur={handleLocalBlur}
                            error={isFieldInvalid("currency")}
                            errorMessage={getFieldError("currency") ?? undefined}
                        />
                    </div>

                    <div className="col-span-2 sm:col-span-1">
                        <Label htmlFor={`exchangeRate-${invoiceNumber}`}>
                            Tipo de cambio <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            type="number"
                            placeholder="1.00"
                            name="exchangeRate"
                            id={`exchangeRate-${invoiceNumber}`}
                            value={values.exchangeRate}
                            onChange={handleLocalChange}
                            onBlur={handleLocalBlur}
                            error={isFieldInvalid("exchangeRate")}
                            errorMessage={getFieldError("exchangeRate") ?? undefined}
                            step={0.01}
                            min="0.01"
                        />
                    </div>

                    <div className="col-span-2 sm:col-span-1">
                        <Label htmlFor={`usdAmount-${invoiceNumber}`}>
                            Monto en USD
                        </Label>
                        <Input
                            type="number"
                            placeholder="0.00"
                            name="usdAmount"
                            id={`usdAmount-${invoiceNumber}`}
                            value={values.usdAmount}
                            disabled={true}
                            className="text-gray-500 bg-gray-100"
                            onChange={handleLocalChange}
                            onBlur={handleLocalBlur}
                            error={isFieldInvalid("usdAmount")}
                            errorMessage={getFieldError("usdAmount") ?? undefined}
                            step={0.01}
                            min="0.00"
                        />
                    </div>

                    <div className="col-span-2">
                        <Label htmlFor={`provider-${invoiceNumber}`}>
                            Proveedor <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            type="text"
                            placeholder="Nombre del proveedor"
                            name="provider"
                            id={`provider-${invoiceNumber}`}
                            value={values.provider}
                            onChange={handleLocalChange}
                            onBlur={handleLocalBlur}
                            error={isFieldInvalid("provider")}
                            errorMessage={getFieldError("provider") ?? undefined}
                        />
                    </div>
                </div>
            </Form>
        </ComponentCard>
    );
});

export default InvoiceForm;