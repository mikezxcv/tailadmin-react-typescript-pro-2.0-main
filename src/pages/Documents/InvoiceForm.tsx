import Form from "../../components/form/Form";
import Input from "../../components/form/input/InputField";
import ComponentCard from "../../components/common/ComponentCard";
import Label from "../../components/form/Label";
import Select from "../../components/form/Select";
import Button from "../../components/ui/button/Button";
import { PaperPlaneIcon } from "../../icons";
import { useFormValidation } from "../../utils/hooks";
import {
    validateRequired,
    validateMinLength,
    validatePositiveNumber,
} from "../../utils/validators";
import React from "react";
import { Modal } from "../../components/ui/modal";
import { useModal } from "../../hooks/useModal";
// import DatePicker from "../../components/form/date-picker";



export default function ExpenseRegistrationForm() {

    const successModal = useModal();

    // Opciones para los selectores
    const countriesOptions = [
        { value: "us", label: "Estados Unidos" },
        { value: "mx", label: "México" },
        { value: "co", label: "Colombia" },
        { value: "pe", label: "Perú" },
        { value: "ar", label: "Argentina" },
        { value: "cl", label: "Chile" },
        { value: "br", label: "Brasil" },
        // Añade más países según sea necesario
    ];

    const companiesOptions = [
        { value: "company1", label: "Empresa A" },
        { value: "company2", label: "Empresa B" },
        { value: "company3", label: "Empresa C" },
        // Añade más empresas según sea necesario
    ];

    const expenseTypesOptions = [
        { value: "food", label: "Comida" },
        { value: "transport", label: "Transporte" },
        { value: "hotel", label: "Hotel" },
        { value: "office", label: "Material de Oficina" },
        { value: "other", label: "Otros" },
        // Añade más tipos según sea necesario
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
        // Añade más monedas según sea necesario
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
        resetForm
    } = useFormValidation({
        expenseDate: "", // Fecha del gasto
        employee: "", // Empleado que registra
        country: "", // País donde se generó
        company: "", // Empresa asociada
        expenseType: "", // Tipo de gasto
        localAmount: "", // Monto en moneda local
        currency: "", // Moneda
        exchangeRate: "", // Tipo de cambio
        usdAmount: "", // Monto en USD
        provider: "", // Proveedor

    });

    // Estado para manejar el archivo
    // const [file, setFile] = useState<File | null>(null);




    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Validar todos los campos antes de enviar
        const isValid = validateForm();

        if (isValid) {
            console.log("Formulario de gastos válido, enviando valores:", values);

            // Aquí realizarías la llamada API para crear el registro de gasto
            // Por ejemplo:
            // createExpense(values)
            //   .then(response => {
            //     console.log("Gasto registrado exitosamente", response);
            //     resetForm();
            //   })
            //   .catch(error => {
            //     console.error("Error al registrar el gasto", error);
            //   });

            // Resetear el formulario después de enviar (en producción, haz esto después de recibir respuesta exitosa)
            successModal.openModal();
            resetForm();
            // setFile(null);
        } else {
            console.log("El formulario tiene errores:", errors);
        }
    };

    const handleClickSuccessModal = () => {
        successModal.closeModal();
        resetForm(); // Reiniciar el formulario al cerrar el modal
        // redirigiar a la ruta http://localhost:5173/document
        // window.location.href = "http://localhost:5173/documents";
        window.location.reload(); // Recargar la página para ver los cambios
    };

    return (
        <>
            <ComponentCard title="Registro de Gastos" desc=" Verifica los datos escaneados y completa el formulario para registrar el gasto.">
                <Form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                        {/* Fecha del gasto */}

                        <div>
                            <Label htmlFor="expenseDate">
                                Fecha del gasto <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                type="date"
                                placeholder="Seleccione"
                                name="expenseDate"
                                id="expenseDate"
                                value={values.expenseDate}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                error={isFieldInvalid('expenseDate')}
                                errorMessage={getFieldError('expenseDate') ?? undefined}
                                validators={[validateRequired]}
                                fieldName="Fecha del gasto"
                                registerField={registerField}
                            />
                        </div>

                        {/* Empleado */}
                        <div className="col-span-2 sm:col-span-1">
                            <Label htmlFor="employee">
                                Empleado <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                type="text"
                                placeholder="Nombre del empleado"
                                name="employee"
                                id="employee"
                                value={values.employee}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                error={isFieldInvalid('employee')}
                                errorMessage={getFieldError('employee') ?? undefined}
                                validators={[validateRequired, validateMinLength(3)]}
                                fieldName="Empleado"
                                registerField={registerField}
                            />
                        </div>

                        {/* País */}
                        <div className="col-span-2 sm:col-span-1">
                            <Label htmlFor="country">
                                País <span className="text-red-500">*</span>
                            </Label>
                            <Select
                                options={countriesOptions}
                                placeholder="Seleccionar país"
                                name="country"
                                value={values.country}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                error={isFieldInvalid('country')}
                                errorMessage={getFieldError('country') ?? undefined}
                                validators={[validateRequired]}
                                fieldName="País"
                                registerField={registerField}
                            />
                        </div>

                        {/* Empresa */}
                        <div className="col-span-2 sm:col-span-1">
                            <Label htmlFor="company">
                                Empresa <span className="text-red-500">*</span>
                            </Label>
                            <Select
                                options={companiesOptions}
                                placeholder="Seleccionar empresa"
                                name="company"
                                value={values.company}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                error={isFieldInvalid('company')}
                                errorMessage={getFieldError('company') ?? undefined}
                                validators={[validateRequired]}
                                fieldName="Empresa"
                                registerField={registerField}
                            />
                        </div>

                        {/* Tipo de gasto */}
                        <div className="col-span-2">
                            <Label htmlFor="expenseType">
                                Tipo de gasto <span className="text-red-500">*</span>
                            </Label>
                            <Select
                                options={expenseTypesOptions}
                                placeholder="Seleccionar tipo de gasto"
                                name="expenseType"
                                value={values.expenseType}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                error={isFieldInvalid('expenseType')}
                                errorMessage={getFieldError('expenseType') ?? undefined}
                                validators={[validateRequired]}
                                fieldName="Tipo de gasto"
                                registerField={registerField}
                            />
                        </div>

                        {/* Monto local */}
                        <div className="col-span-2 sm:col-span-1">
                            <Label htmlFor="localAmount">
                                Monto local <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                type="number"
                                placeholder="0.00"
                                name="localAmount"
                                id="localAmount"
                                value={values.localAmount}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                error={isFieldInvalid('localAmount')}
                                errorMessage={getFieldError('localAmount') ?? undefined}
                                validators={[validateRequired, validatePositiveNumber]}
                                fieldName="Monto local"
                                registerField={registerField}
                                step={0.01}
                                min="0.01"
                            />
                        </div>

                        {/* Moneda */}
                        <div className="col-span-2 sm:col-span-1">
                            <Label htmlFor="currency">
                                Moneda <span className="text-red-500">*</span>
                            </Label>
                            <Select
                                options={currenciesOptions}
                                placeholder="Seleccionar moneda"
                                name="currency"
                                value={values.currency}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                error={isFieldInvalid('currency')}
                                errorMessage={getFieldError('currency') ?? undefined}
                                validators={[validateRequired]}
                                fieldName="Moneda"
                                registerField={registerField}
                            />
                        </div>

                        {/* Tipo de cambio */}
                        <div className="col-span-2 sm:col-span-1">
                            <Label htmlFor="exchangeRate">
                                Tipo de cambio <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                type="number"
                                placeholder="1.00"
                                name="exchangeRate"
                                id="exchangeRate"
                                value={values.exchangeRate}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                error={isFieldInvalid('exchangeRate')}
                                errorMessage={getFieldError('exchangeRate') ?? undefined}
                                validators={[validateRequired, validatePositiveNumber]}
                                fieldName="Tipo de cambio"
                                registerField={registerField}
                                step={0.01}
                                min="0.01"
                            />
                        </div>

                        {/* Monto USD (calculado automáticamente) */}
                        <div className="col-span-2 sm:col-span-1">
                            <Label htmlFor="usdAmount">
                                Monto en USD
                            </Label>
                            <Input
                                type="number"
                                placeholder="0.00"
                                name="usdAmount"
                                id="usdAmount"
                                value={values.usdAmount}
                                disabled={false} // Este campo es calculado automáticamente
                                className="text-gray-500 bg-gray-100"
                                onChange={handleChange}
                                onBlur={handleBlur}
                                error={isFieldInvalid('usdAmount')}
                                errorMessage={getFieldError('usdAmount') ?? undefined}
                                validators={[validateRequired, validatePositiveNumber]}
                                fieldName="Monto en USD"
                                registerField={registerField}
                                step={0.01}
                                min="0.00"
                            />
                        </div>

                        {/* Proveedor */}
                        <div className="col-span-2">
                            <Label htmlFor="provider">
                                Proveedor <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                type="text"
                                placeholder="Nombre del proveedor"
                                name="provider"
                                id="provider"
                                value={values.provider}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                error={isFieldInvalid('provider')}
                                errorMessage={getFieldError('provider') ?? undefined}
                                validators={[validateRequired, validateMinLength(3)]}
                                fieldName="Proveedor"
                                registerField={registerField}
                            />
                        </div>
                        {/* Botón de envío */}
                        <div className="col-span-2">
                            <Button
                                size="md"
                                className="w-full"
                                type="submit"
                            >
                                Registrar Gasto
                                <PaperPlaneIcon className="size-5" />
                            </Button>
                        </div>
                    </div>
                </Form>
            </ComponentCard>
            <Modal
                showCloseButton={false}
                isOpen={successModal.isOpen}
                onClose={handleClickSuccessModal}
                className="max-w-[600px] p-5 lg:p-10"
            >
                <div className="text-center">
                    <div className="relative flex items-center justify-center z-1 mb-7">
                        <svg
                            className="fill-success-50 dark:fill-success-500/15"
                            width="90"
                            height="90"
                            viewBox="0 0 90 90"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                d="M34.364 6.85053C38.6205 -2.28351 51.3795 -2.28351 55.636 6.85053C58.0129 11.951 63.5594 14.6722 68.9556 13.3853C78.6192 11.0807 86.5743 21.2433 82.2185 30.3287C79.7862 35.402 81.1561 41.5165 85.5082 45.0122C93.3019 51.2725 90.4628 63.9451 80.7747 66.1403C75.3648 67.3661 71.5265 72.2695 71.5572 77.9156C71.6123 88.0265 60.1169 93.6664 52.3918 87.3184C48.0781 83.7737 41.9219 83.7737 37.6082 87.3184C29.8831 93.6664 18.3877 88.0266 18.4428 77.9156C18.4735 72.2695 14.6352 67.3661 9.22531 66.1403C-0.462787 63.9451 -3.30193 51.2725 4.49185 45.0122C8.84391 41.5165 10.2138 35.402 7.78151 30.3287C3.42572 21.2433 11.3808 11.0807 21.0444 13.3853C26.4406 14.6722 31.9871 11.951 34.364 6.85053Z"
                                fill=""
                                fillOpacity=""
                            />
                        </svg>

                        <span className="absolute -translate-x-1/2 -translate-y-1/2 left-1/2 top-1/2">
                            <svg
                                className="fill-success-600 dark:fill-success-500"
                                width="38"
                                height="38"
                                viewBox="0 0 38 38"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    fillRule="evenodd"
                                    clipRule="evenodd"
                                    d="M5.9375 19.0004C5.9375 11.7854 11.7864 5.93652 19.0014 5.93652C26.2164 5.93652 32.0653 11.7854 32.0653 19.0004C32.0653 26.2154 26.2164 32.0643 19.0014 32.0643C11.7864 32.0643 5.9375 26.2154 5.9375 19.0004ZM19.0014 2.93652C10.1296 2.93652 2.9375 10.1286 2.9375 19.0004C2.9375 27.8723 10.1296 35.0643 19.0014 35.0643C27.8733 35.0643 35.0653 27.8723 35.0653 19.0004C35.0653 10.1286 27.8733 2.93652 19.0014 2.93652ZM24.7855 17.0575C25.3713 16.4717 25.3713 15.522 24.7855 14.9362C24.1997 14.3504 23.25 14.3504 22.6642 14.9362L17.7177 19.8827L15.3387 17.5037C14.7529 16.9179 13.8031 16.9179 13.2173 17.5037C12.6316 18.0894 12.6316 19.0392 13.2173 19.625L16.657 23.0647C16.9383 23.346 17.3199 23.504 17.7177 23.504C18.1155 23.504 18.4971 23.346 18.7784 23.0647L24.7855 17.0575Z"
                                    fill=""
                                />
                            </svg>
                        </span>
                    </div>
                    <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90 sm:text-title-sm">
                        Factura Registrada!
                    </h4>
                    <p className="text-sm leading-6 text-gray-500 dark:text-gray-400">
                        Tu factura ha sido registrada. Puede seguir su estado desde el historial
                        mientras espera la validación y aprobación del documento.
                    </p>

                    <div className="flex items-center justify-center w-full gap-3 mt-7">
                        <button
                            onClick={handleClickSuccessModal}
                            type="button"
                            className="flex justify-center w-full px-4 py-3 text-sm font-medium text-white rounded-lg bg-success-500 shadow-theme-xs hover:bg-success-600 sm:w-auto"
                        >
                            Aceptar
                        </button>
                    </div>
                </div>
            </Modal>
        </>
    );
}