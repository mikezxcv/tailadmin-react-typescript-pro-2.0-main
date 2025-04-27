/* eslint-disable @typescript-eslint/no-explicit-any */
import { ChangeEvent, FocusEvent, useState, useEffect, useCallback, useMemo } from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import DropZoneSingleFile from "../../components/form/form-elements/DropZoneSingleFile";
import Button from "../../components/ui/button/Button";
import SpinnerFour from "../../components/ui/spinner/SpinnerFour";
import { PaperPlaneIcon } from "../../icons";
import Form from "../../components/form/Form";
import Label from "../../components/form/Label";
import Select from "../../components/form/Select";
import Input from "../../components/form/input/InputField";
import ComponentCard from "../../components/common/ComponentCard";
import { useFormValidation } from "../../utils/hooks";
import { validateRequired, validatePositiveNumber } from "../../utils/validators";
import { Modal } from "../../components/ui/modal";
import { useModal } from "../../hooks/useModal";
import { useExpenseReport, useCurrencyTypes, useExpenseTypes, useLiquidationTypes } from "./api/expense-report.api";
import { IExpenseReportRequest } from "./interfaces/expense-report.interfaces";
import { useAuth } from "../../context/AuthContext";

export default function Upload() {
    const [isLoading, setIsLoading] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const successModal = useModal();
    const { mutate: createExpenseReportApi, isPending } = useExpenseReport();
    const { data: currencyData } = useCurrencyTypes(true);
    const { data: expenseTypesData } = useExpenseTypes(true);
    const { data: liquidationTypesData } = useLiquidationTypes(true);
    const { userLoggued } = useAuth();

    // Array estático con dos facturas y valores iniciales
    const invoices = [
        {
            id: 1,
            expenseDate: "2025-04-01",
            countryName: "México",
            companyName: "Proveedor MX",
            localAmount: "1500.00",
            currency: 3, // MXN
            exchangeRate: "20.00",
            usdAmount: "75.00",
        },
        {
            id: 2,
            expenseDate: "2025-04-02",
            countryName: "Colombia",
            companyName: "Proveedor CO",
            localAmount: "200000.00",
            currency: 4, // COP
            exchangeRate: "4000.00",
            usdAmount: "50.00",
        },
    ];

    // Estado para invoiceData
    const [invoiceData, setInvoiceData] = useState<{
        [key: number]: { values: any; errors: any };
    }>({});

    // Opciones para los selectores (id: number, name: string)
    const currenciesOptions = currencyData || [];

    const expenseTypesOptions = expenseTypesData;

    const settlementTypesOptions = liquidationTypesData;

    // Validación para los campos globales
    const {
        values: globalValues,
        errors: globalErrors,
        handleChange: handleGlobalChange,
        handleBlur: handleGlobalBlur,
        validateForm: validateGlobalForm,
        registerField: registerGlobalField,
        isFieldInvalid: isGlobalFieldInvalid,
        getFieldError: getGlobalFieldError,
        resetForm: resetGlobalForm,
    } = useFormValidation({
        expenseType: "",
        settlementType: "",
    });

    // Instancias de useFormValidation para cada factura
    const invoiceForm1 = useFormValidation({
        expenseDate: invoices[0].expenseDate,
        countryName: invoices[0].countryName,
        companyName: invoices[0].companyName,
        localAmount: invoices[0].localAmount,
        currency: invoices[0].currency,
        exchangeRate: invoices[0].exchangeRate,
        usdAmount: invoices[0].usdAmount,
    });

    const invoiceForm2 = useFormValidation({
        expenseDate: invoices[1].expenseDate,
        countryName: invoices[1].countryName,
        companyName: invoices[1].companyName,
        localAmount: invoices[1].localAmount,
        currency: invoices[1].currency,
        exchangeRate: invoices[1].exchangeRate,
        usdAmount: invoices[1].usdAmount,
    });

    // Memoizar el objeto invoiceForms
    const invoiceForms = useMemo(
        () => ({
            [invoices[0].id]: invoiceForm1,
            [invoices[1].id]: invoiceForm2,
        }),
        [invoiceForm1, invoiceForm2]
    );

    // Registrar validadores para los campos globales
    useEffect(() => {
        registerGlobalField("expenseType", [validateRequired], "Tipo de Gasto");
        registerGlobalField("settlementType", [validateRequired], "Tipo de Liquidación");
    }, []);

    // Registrar validadores para los campos de cada factura
    useEffect(() => {
        invoices.forEach((invoice) => {
            const { registerField } = invoiceForms[invoice.id];
            registerField("expenseDate", [validateRequired], "Fecha del gasto");
            registerField("countryName", [validateRequired], "Nombre del País");
            registerField("companyName", [validateRequired], "Nombre de la Empresa");
            registerField("localAmount", [validateRequired, validatePositiveNumber], "Monto local");
            registerField("currency", [validateRequired], "Moneda");
            registerField("exchangeRate", [validateRequired, validatePositiveNumber], "Tipo de cambio");
            registerField("usdAmount", [validateRequired, validatePositiveNumber], "Monto en USD");
        });
    }, []);

    // Inicializar invoiceData solo una vez al montar el componente
    useEffect(() => {
        const initialData = invoices.reduce(
            (acc, invoice) => {
                const { values, errors } = invoiceForms[invoice.id];
                return {
                    ...acc,
                    [invoice.id]: { values, errors },
                };
            },
            {} as { [key: number]: { values: any; errors: any } }
        );
        setInvoiceData(initialData);
    }, []); // Array de dependencias vacío para ejecutar solo una vez

    // Actualizar datos y errores de las facturas
    const handleInvoiceFormChange = useCallback(
        (invoiceId: number, field: string, value: string | number) => {
            const { handleChange, values, errors } = invoiceForms[invoiceId];
            handleChange({ target: { name: field, value } } as ChangeEvent<HTMLInputElement>);
            setInvoiceData((prev) =>
                prev[invoiceId]?.values[field] !== value
                    ? {
                        ...prev,
                        [invoiceId]: { values: { ...values, [field]: value }, errors },
                    }
                    : prev
            );
        },
        [invoiceForms]
    );

    const handleInvoiceFormBlur = useCallback(
        (invoiceId: number, e: FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
            const { handleBlur, values, errors } = invoiceForms[invoiceId];
            handleBlur(e);
            setInvoiceData((prev) => ({
                ...prev,
                [invoiceId]: { values, errors },
            }));
        },
        [invoiceForms]
    );

    // Determinar si hay errores para habilitar/deshabilitar el botón
    const [hasErrors, setHasErrors] = useState(true);

    // Verificación de errores
    useEffect(() => {
        const globalFormValid =
            Object.keys(globalErrors).length === 0 || Object.values(globalErrors).every((error) => !error);

        const allInvoicesValid = invoices.every((invoice) => {
            const invoiceEntry = invoiceData[invoice.id];
            if (!invoiceEntry) return false;
            return !Object.values(invoiceEntry.errors).some((error) => error !== undefined && error !== null);
        });

        setHasErrors(!globalFormValid || !allInvoicesValid);
    }, [globalErrors, invoiceData]);

    const handleScanClick = () => {
        setIsLoading(true);
        setTimeout(() => {
            setIsLoading(false);
            setShowForm(true);
        }, 1000);
    };

    const resetForm = () => {
        setShowForm(false);
        setIsLoading(false);
        setInvoiceData({});
        resetGlobalForm();
        invoices.forEach((invoice) => {
            invoiceForms[invoice.id].resetForm();
        });
    };

    const handleClickSuccessModal = () => {
        successModal.closeModal();
        resetForm();
        window.location.reload();
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const globalFormValid = validateGlobalForm();

        const allInvoicesValid = invoices.every((invoice) => {
            const { validateForm, errors } = invoiceForms[invoice.id];
            validateForm();
            return !Object.values(errors).some((error) => error !== undefined && error !== null);
        });

        if (globalFormValid && allInvoicesValid) {
            const createExpenseReportRequest: IExpenseReportRequest = {
                employee_id: Number(userLoggued?.id), // Hardcoded por ahora; reemplazar con valor dinámico si es necesario
                expense_type_id: Number(globalValues.expenseType),
                liquidation_type_id: Number(globalValues.settlementType),
                invoices: invoices.map((invoice) => {
                    const values = invoiceData[invoice.id].values;
                    return {
                        invoice_date: values.expenseDate,
                        amount_local: Number(values.localAmount),
                        currency_id_local: Number(values.currency),
                        amount_usd: Number(values.usdAmount),
                        exchange_rate: Number(values.exchangeRate),
                        company_name: values.companyName,
                        country_name: values.countryName,
                    };
                }),
            };

            createExpenseReportApi(createExpenseReportRequest, {
                onSuccess: (data: any) => {
                    console.log("Factura registrada:", data);
                    successModal.openModal();
                    resetForm();
                }
            });
        } else {
            console.log("Errores en el formulario:", {
                globalErrors,
                invoiceErrors: invoiceData,
            });
        }
    };

    return (
        <div>
            <PageMeta
                title="React.js Blank Dashboard | TailAdmin - Next.js Admin Dashboard Template"
                description="This is React.js Blank Dashboard page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template"
            />
            <PageBreadcrumb pageTitle="Documento" />
            <div className="grid grid-cols-1 gap-6 xl:grid-cols-1">
                {!showForm && (
                    <div className="">
                        <DropZoneSingleFile
                            title="Sube tu Factura"
                            description="Carga tu factura en formato PDF o Imagen. No se aceptan archivos de más de 2MB."
                            acceptedFileTypes={{
                                "application/pdf": [],
                                "image/*": [],
                            }}
                            maxFileSize={2 * 1024 * 1024}
                        />
                        <Button
                            size="sm"
                            className="w-full mt-4"
                            variant="success"
                            disabled={isLoading}
                            onClick={handleScanClick}
                        >
                            {isLoading && <SpinnerFour color="white" />}
                            {isLoading ? "Cargando..." : "Escanear"}
                        </Button>
                    </div>
                )}
                {showForm && (
                    <div className="space-y-6 col-span-2">
                        <Form onSubmit={handleSubmit}>
                            <div className="p-6 border border-gray-200 rounded-xl dark:border-gray-800">
                                <h3 className="text-lg font-semibold mb-4">Detalles del Reporte</h3>
                                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                    <div>
                                        <Label htmlFor="expenseType">
                                            Tipo de Gasto <span className="text-red-500">*</span>
                                        </Label>
                                        <Select
                                            options={(expenseTypesOptions || []).map(option => ({
                                                value: option.id.toString(),
                                                label: option.name,
                                            }))}
                                            placeholder="Seleccionar tipo de gasto"
                                            name="expenseType"
                                            value={globalValues.expenseType}
                                            onChange={handleGlobalChange}
                                            onBlur={handleGlobalBlur}
                                            error={isGlobalFieldInvalid("expenseType")}
                                            errorMessage={getGlobalFieldError("expenseType") ?? undefined}
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="settlementType">
                                            Tipo de Liquidación <span className="text-red-500">*</span>
                                        </Label>
                                        <Select
                                            options={(settlementTypesOptions ?? []).map(option => ({
                                                value: option.id.toString(),
                                                label: option.name,
                                            }))}
                                            placeholder="Seleccionar tipo de liquidación"
                                            name="settlementType"
                                            value={globalValues.settlementType}
                                            onChange={handleGlobalChange}
                                            onBlur={handleGlobalBlur}
                                            error={isGlobalFieldInvalid("settlementType")}
                                            errorMessage={getGlobalFieldError("settlementType") ?? undefined}
                                        />
                                    </div>
                                </div>
                                <h3 className="text-lg font-semibold mt-6 mb-4">Facturas</h3>
                                <div className="space-y-6">
                                    {invoices.map((invoice) => {
                                        const { values, isFieldInvalid, getFieldError } = invoiceForms[invoice.id];
                                        return (
                                            <ComponentCard
                                                key={invoice.id}
                                                title={`Factura ${invoice.id}`}
                                                desc="Verifica los datos escaneados y completa el formulario para registrar la factura."
                                            >
                                                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                                    <div>
                                                        <Label htmlFor={`expenseDate-${invoice.id}`}>
                                                            Fecha del gasto <span className="text-red-500">*</span>
                                                        </Label>
                                                        <Input
                                                            type="date"
                                                            placeholder="Seleccione"
                                                            name="expenseDate"
                                                            id={`expenseDate-${invoice.id}`}
                                                            value={values.expenseDate}
                                                            onChange={(e) => handleInvoiceFormChange(invoice.id, "expenseDate", e.target.value)}
                                                            onBlur={(e) => handleInvoiceFormBlur(invoice.id, e)}
                                                            error={isFieldInvalid("expenseDate")}
                                                            errorMessage={getFieldError("expenseDate") ?? undefined}
                                                        />
                                                    </div>
                                                    <div className="col-span-2 sm:col-span-1">
                                                        <Label htmlFor={`countryName-${invoice.id}`}>
                                                            Nombre del País <span className="text-red-500">*</span>
                                                        </Label>
                                                        <Input
                                                            type="text"
                                                            placeholder="Nombre del país"
                                                            name="countryName"
                                                            id={`countryName-${invoice.id}`}
                                                            value={values.countryName}
                                                            onChange={(e) => handleInvoiceFormChange(invoice.id, "countryName", e.target.value)}
                                                            onBlur={(e) => handleInvoiceFormBlur(invoice.id, e)}
                                                            error={isFieldInvalid("countryName")}
                                                            errorMessage={getFieldError("countryName") ?? undefined}
                                                        />
                                                    </div>
                                                    <div className="col-span-2 sm:col-span-1">
                                                        <Label htmlFor={`companyName-${invoice.id}`}>
                                                            Nombre de la Empresa <span className="text-red-500">*</span>
                                                        </Label>
                                                        <Input
                                                            type="text"
                                                            placeholder="Nombre de la empresa"
                                                            name="companyName"
                                                            id={`companyName-${invoice.id}`}
                                                            value={values.companyName}
                                                            onChange={(e) => handleInvoiceFormChange(invoice.id, "companyName", e.target.value)}
                                                            onBlur={(e) => handleInvoiceFormBlur(invoice.id, e)}
                                                            error={isFieldInvalid("companyName")}
                                                            errorMessage={getFieldError("companyName") ?? undefined}
                                                        />
                                                    </div>
                                                    <div className="col-span-2 sm:col-span-1">
                                                        <Label htmlFor={`localAmount-${invoice.id}`}>
                                                            Monto local <span className="text-red-500">*</span>
                                                        </Label>
                                                        <Input
                                                            type="number"
                                                            placeholder="0.00"
                                                            name="localAmount"
                                                            id={`localAmount-${invoice.id}`}
                                                            value={values.localAmount}
                                                            onChange={(e) => handleInvoiceFormChange(invoice.id, "localAmount", e.target.value)}
                                                            onBlur={(e) => handleInvoiceFormBlur(invoice.id, e)}
                                                            error={isFieldInvalid("localAmount")}
                                                            errorMessage={getFieldError("localAmount") ?? undefined}
                                                            step={0.01}
                                                            min="0.01"
                                                        />
                                                    </div>
                                                    <div className="col-span-2 sm:col-span-1">
                                                        <Label htmlFor={`currency-${invoice.id}`}>
                                                            Moneda <span className="text-red-500">*</span>
                                                        </Label>
                                                        <Select
                                                            options={currenciesOptions.map(option => ({
                                                                value: option.id.toString(),
                                                                label: option.description,
                                                            }))}
                                                            placeholder="Seleccionar moneda"
                                                            name="currency"
                                                            value={values.currency.toString()}
                                                            onChange={(e) => handleInvoiceFormChange(invoice.id, "currency", Number(e.target.value))}
                                                            onBlur={(e) => handleInvoiceFormBlur(invoice.id, e)}
                                                            error={isFieldInvalid("currency")}
                                                            errorMessage={getFieldError("currency") ?? undefined}
                                                        />
                                                    </div>
                                                    <div className="col-span-2 sm:col-span-1">
                                                        <Label htmlFor={`exchangeRate-${invoice.id}`}>
                                                            Tipo de cambio <span className="text-red-500">*</span>
                                                        </Label>
                                                        <Input
                                                            type="number"
                                                            placeholder="1.00"
                                                            name="exchangeRate"
                                                            id={`exchangeRate-${invoice.id}`}
                                                            value={values.exchangeRate}
                                                            onChange={(e) => handleInvoiceFormChange(invoice.id, "exchangeRate", e.target.value)}
                                                            onBlur={(e) => handleInvoiceFormBlur(invoice.id, e)}
                                                            error={isFieldInvalid("exchangeRate")}
                                                            errorMessage={getFieldError("exchangeRate") ?? undefined}
                                                            step={0.01}
                                                            min="0.01"
                                                        />
                                                    </div>
                                                    <div className="col-span-2 sm:col-span-1">
                                                        <Label htmlFor={`usdAmount-${invoice.id}`}>
                                                            Monto en USD <span className="text-red-500">*</span>
                                                        </Label>
                                                        <Input
                                                            type="number"
                                                            placeholder="0.00"
                                                            name="usdAmount"
                                                            id={`usdAmount-${invoice.id}`}
                                                            value={values.usdAmount}
                                                            onChange={(e) => handleInvoiceFormChange(invoice.id, "usdAmount", e.target.value)}
                                                            onBlur={(e) => handleInvoiceFormBlur(invoice.id, e)}
                                                            error={isFieldInvalid("usdAmount")}
                                                            errorMessage={getFieldError("usdAmount") ?? undefined}
                                                            step={0.01}
                                                            min="0.00"
                                                        />
                                                    </div>
                                                </div>
                                            </ComponentCard>
                                        );
                                    })}
                                </div>
                            </div>
                            <div className="flex gap-4 p-6">
                                <Button
                                    size="sm"
                                    className="w-full"
                                    variant="primary"
                                    type="submit"
                                    disabled={hasErrors || isPending}
                                >
                                    Registrar Gasto
                                    <PaperPlaneIcon className="size-5" />
                                </Button>
                                <Button
                                    size="sm"
                                    className="w-full"
                                    variant="secondary"
                                    onClick={resetForm}
                                    type="button"
                                >
                                    Volver a Escanear
                                </Button>
                            </div>
                        </Form>
                    </div>
                )}
            </div>
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
                                    d="M5.9375 19.0004C5.9375 11.7854 11.7864 5.93652 19.0014 5.93652C26.2164 5.93652 32.0653 11.7854 32.0653 19.0004C32.0653 26.2154 26.2164 32.0643 19.0014 32.0643C11.7864 32.0643 5.9375 26.2154 5.9375 19.0004ZM19.0014 2.93652C10.1296 2.93652 2.9375 10.1286 2.9375 19.0004C2.9375 27.8723 10.1296 35.0643 19.0014 35.0643C27.8733 35.0643 35.0653 27.8723 35.0653 19.0004C35.0653 10.1286 27.8733 2.93652 19.0014 2.93652ZM24.7855 17.0575C25.3713 16.4717 25.3713 15.522 24.7855 14.9362C24.1997 14.3504 23.250 14.3504 22.6642 14.9362L17.7177 19.8827L15.3387 17.5037C14.7529 16.9179 13.8031 16.9179 13.2173 17.5037C12.6316 18.0894 12.6316 19.0392 13.2173 19.625L16.657 23.0647C16.9383 23.346 17.3199 23.504 17.7177 23.504C18.1155 23.504 18.4971 23.346 18.7784 23.0647L24.7855 17.0575Z"
                                    fill=""
                                />
                            </svg>
                        </span>
                    </div>
                    <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90 sm:text-title-sm">
                        Factura Registrada!
                    </h4>
                    <p className="text-sm leading-6 text-gray-500 dark:text-gray-400">
                        Tu factura ha sido registrada. Puede seguir su estado desde el historial mientras espera
                        la validación y aprobación del documento.
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
        </div>
    );
}