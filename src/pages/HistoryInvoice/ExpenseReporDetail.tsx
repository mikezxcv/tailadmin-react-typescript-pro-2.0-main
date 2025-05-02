/* eslint-disable @typescript-eslint/no-explicit-any */
import { ChangeEvent, FocusEvent, useState, useMemo } from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import Button from "../../components/ui/button/Button";
import SpinnerFour from "../../components/ui/spinner/SpinnerFour";
import { PaperPlaneIcon } from "../../icons";
import Form from "../../components/form/Form";
import Label from "../../components/form/Label";
import Select from "../../components/form/Select";
import Input from "../../components/form/input/InputField";
import ComponentCard from "../../components/common/ComponentCard";
import { Modal } from "../../components/ui/modal";
import { useModal } from "../../hooks/useModal";
import { useCurrencyTypes, useExpenseTypes, useLiquidationTypes, useExpenseReportById, useApproveExpenseReport, useRejectExpenseReport } from "../Documents/api/expense-report.api";
import { useParams } from "react-router";
import Alert from "../../components/ui/alert/Alert";
import { useAuth } from "../../context/AuthContext";
import { IApproveRejectRequest } from "../Documents/interfaces/expense-report.interfaces";
import { useNavigate } from "react-router"
import Badge from "../../components/ui/badge/Badge";
import ExpenseReportFiles from "./ExpenseReportFiles";

export default function ExpenseReportDetail() {
    const { id } = useParams<{ id: string }>();
    const expenseReportId = Number(id);
    const [isLoading, setIsLoading] = useState(false);
    const successModal = useModal();
    const approveModal = useModal();
    const rejectModal = useModal();
    const { data: currencyData } = useCurrencyTypes(true);
    const { data: expenseTypesData } = useExpenseTypes(true);
    const { data: liquidationTypesData } = useLiquidationTypes(true);
    const { data: expenseReportDetail } = useExpenseReportById(Number(expenseReportId), true);
    const { mutate: approveExpenseReportApi, isPending: isPendingApprove } = useApproveExpenseReport();
    const { mutate: rejectExpenseReportApi, isPending: ispendingReject } = useRejectExpenseReport();
    const { userLoggued } = useAuth();
    const navigate = useNavigate();

    // status id 2 = approved status id 3 = rejected
    const isApprobalDetail = expenseReportDetail?.approvals.find((approval) => approval.statusId === 2);
    const isRejectDetail = expenseReportDetail?.approvals.find((approval) => approval.statusId === 3);
    // State for observations in modals
    const [approveObservations, setApproveObservations] = useState("");
    const [rejectObservations, setRejectObservations] = useState("");

    // Initialize invoice forms dynamically from API data
    interface InvoiceForm {
        values: {
            expenseDate: string;
            countryName: string;
            companyName: string;
            localAmount: string;
            currency: string;
            exchangeRate: string;
            usdAmount: string;
        };
        errors: Record<string, any>;
        handleChange: (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
        handleBlur: (e: FocusEvent<HTMLInputElement | HTMLSelectElement>) => void;
        validateForm: () => boolean;
        registerField: () => void;
        isFieldInvalid: () => boolean;
        getFieldError: () => string | undefined;
        resetForm: () => void;
    }

    const invoiceForms: Record<number, InvoiceForm> = useMemo(() => {
        if (!expenseReportDetail?.invoices) return {};
        return expenseReportDetail.invoices.reduce((acc, invoice) => {
            const form = {
                values: {
                    expenseDate: new Date(invoice.invoiceDate).toISOString().split("T")[0],
                    countryName: invoice.countryName || "",
                    companyName: invoice.companyName || "",
                    localAmount: invoice.amountLocal.toString(),
                    currency: invoice.currencyIdLocal.toString(),
                    exchangeRate: invoice.exchangeRate.toString(),
                    usdAmount: invoice.amountUsd.toString(),
                },
                errors: {},
                handleChange: (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
                    form.values[e.target.name as keyof typeof form.values] = e.target.value;
                },
                handleBlur: (_e: FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
                    console.log(_e);
                },
                validateForm: () => true,
                registerField: () => { },
                isFieldInvalid: () => false,
                getFieldError: () => undefined,
                resetForm: () => { },
            };
            return { ...acc, [invoice.id]: form };
        }, {});
    }, [expenseReportDetail]);

    // Global form values
    const globalValues = useMemo(() => ({
        expenseType: expenseReportDetail?.expenseTypeId.toString() || "",
        settlementType: expenseReportDetail?.liquidationTypeId.toString() || "",
    }), [expenseReportDetail]);

    const getBadgeColor = (status: string) => {
        switch (status) {
            case "Aprobado":
                return "success";
            case "Rechazado":
                return "error";
            default:
                return "warning";
        }
    }

    // Handle approve submission
    const handleApproveSubmit = async () => {
        setIsLoading(true);
        try {
            const request: IApproveRejectRequest = {
                comments: approveObservations,
                report_id: Number(expenseReportId),
                supervisor_id: Number(userLoggued?.id),
            }
            approveExpenseReportApi(request, {
                onSuccess: () => {
                    successModal.openModal();
                    approveModal.closeModal();
                },
                onError: (error) => {
                    console.error("Error approving report:", error);
                },
            });
        } catch (error) {
            console.error("Error approving report:", error);
        }
        setIsLoading(false);
    };

    // Handle reject submission
    const handleRejectSubmit = async () => {
        setIsLoading(true);
        try {
            const request: IApproveRejectRequest = {
                comments: rejectObservations,
                report_id: Number(expenseReportId),
                supervisor_id: Number(userLoggued?.id),
            }
            rejectExpenseReportApi(request, {
                onSuccess: () => {
                    successModal.openModal();
                    rejectModal.closeModal();
                    setRejectObservations("");
                },
                onError: (error) => {
                    console.error("Error approving report:", error);
                },
            });
        } catch (error) {
            console.error("Error rejecting report:", error);
        }
        setIsLoading(false);
    };

    // Handle success modal close
    const handleClickSuccessModal = () => {
        successModal.closeModal();
        navigate("/history-invoice");
    };

    return (
        <div>
            <PageMeta
                title="Expense Report Detail | TailAdmin"
                description="View and manage expense report details"
            />
            <PageBreadcrumb pageTitle="Aprobar" />
            <div className="mb-6">
                {expenseReportDetail?.files && expenseReportDetail?.files.length > 0 && (
                    <ExpenseReportFiles expenseReport={expenseReportDetail} />
                )}
            </div>
            <div className="grid grid-cols-1 gap-6 xl:grid-cols-1">
                <div className="space-y-6">
                    <Form onSubmit={() => { }} className="space-y-6">
                        <div className="p-6 border border-gray-200 rounded-xl dark:border-gray-800">
                            {isApprobalDetail && (
                                <Alert
                                    variant="success"
                                    title={"Solicitud Aprobada por " + isApprobalDetail?.supervisor.name}
                                    message={isApprobalDetail.comments || ""}
                                    showLink={false}
                                />
                            )}

                            {isRejectDetail && (
                                <Alert
                                    variant="error"
                                    title={"Solicitud Rechazada por " + isRejectDetail?.supervisor.name}
                                    message={isRejectDetail.comments || ""}
                                    showLink={false}
                                />
                            )}
                            {/* <Alert
                                variant="info"
                                title="Solicitud Pendiente"
                                message="El reporte de gastos está pendiente de aprobación. Puede ver el estado del reporte en el historial."
                                showLink={false}
                            <Alert
                                variant="success"
                                title="Solicitud Aprobada por John Smith"
                                message="Todo el proceso de aprobación se ha completado con éxito. Puede ver el estado del reporte en el historial."
                                showLink={false}
                            />
                            {/* <Alert
                                variant="error"
                                title="Solicitud Rechazada por John Smith"
                                message="El reporte de gastos ha sido rechazado. Puede ver el estado del reporte en el historial."
                                showLink={false}
                            /> */}
                            <h3 className="text-lg font-semibold dark:text-white/90 mb-4 text-center">
                                {"Detalles del Reporte - Solicitante " + expenseReportDetail?.employee.name}
                                <Badge variant="solid" color={getBadgeColor(expenseReportDetail?.status.name || "")}>
                                    {expenseReportDetail?.status.name}
                                </Badge></h3>
                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                <div>
                                    <Label htmlFor="expenseType">
                                        Tipo de Gasto
                                    </Label>
                                    <Select
                                        options={expenseTypesData?.map(option => ({
                                            value: option.id.toString(),
                                            label: option.name,
                                        })) || []}
                                        placeholder="Seleccionar tipo de gasto"
                                        name="expenseType"
                                        value={globalValues.expenseType}
                                        disabled
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="settlementType">
                                        Tipo de Liquidación
                                    </Label>
                                    <Select
                                        options={liquidationTypesData?.map(option => ({
                                            value: option.id.toString(),
                                            label: option.name,
                                        })) || []}
                                        placeholder="Seleccionar tipo de liquidación"
                                        name="settlementType"
                                        value={globalValues.settlementType}
                                        disabled
                                    />
                                </div>
                            </div>
                            <h3 className="text-lg font-semibold mt-6 mb-4 dark:text-white/90">Facturas</h3>
                            <div className="space-y-6">
                                {expenseReportDetail?.invoices?.map((invoice) => {
                                    const { values } = invoiceForms[invoice.id] || {};
                                    if (!values) return null;
                                    return (
                                        <ComponentCard
                                            key={invoice.id}
                                            title={`Factura ${invoice.id}`}
                                            desc="Detalles de la factura asociada al reporte."
                                        >
                                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                                <div>
                                                    <Label htmlFor={`expenseDate-${invoice.id}`}>
                                                        Fecha del gasto
                                                    </Label>
                                                    <Input
                                                        type="date"
                                                        name="expenseDate"
                                                        id={`expenseDate-${invoice.id}`}
                                                        value={values.expenseDate}
                                                        disabled
                                                    />
                                                </div>
                                                <div className="col-span-2 sm:col-span-1">
                                                    <Label htmlFor={`countryName-${invoice.id}`}>
                                                        Nombre del País
                                                    </Label>
                                                    <Input
                                                        type="text"
                                                        name="countryName"
                                                        id={`countryName-${invoice.id}`}
                                                        value={values.countryName}
                                                        disabled
                                                    />
                                                </div>
                                                <div className="col-span-2 sm:col-span-1">
                                                    <Label htmlFor={`companyName-${invoice.id}`}>
                                                        Nombre de la Empresa
                                                    </Label>
                                                    <Input
                                                        type="text"
                                                        name="companyName"
                                                        id={`companyName-${invoice.id}`}
                                                        value={values.companyName}
                                                        disabled
                                                    />
                                                </div>
                                                <div className="col-span-2 sm:col-span-1">
                                                    <Label htmlFor={`localAmount-${invoice.id}`}>
                                                        Monto local
                                                    </Label>
                                                    <Input
                                                        type="number"
                                                        name="localAmount"
                                                        id={`localAmount-${invoice.id}`}
                                                        value={values.localAmount}
                                                        disabled
                                                        step={0.01}
                                                    />
                                                </div>
                                                <div className="col-span-2 sm:col-span-1">
                                                    <Label htmlFor={`currency-${invoice.id}`}>
                                                        Moneda
                                                    </Label>
                                                    <Select
                                                        options={currencyData?.map(option => ({
                                                            value: option.id.toString(),
                                                            label: option.description,
                                                        })) || []}
                                                        name="currency"
                                                        value={values.currency}
                                                        disabled
                                                    />
                                                </div>
                                                <div className="col-span-2 sm:col-span-1">
                                                    <Label htmlFor={`exchangeRate-${invoice.id}`}>
                                                        Tipo de cambio
                                                    </Label>
                                                    <Input
                                                        type="number"
                                                        name="exchangeRate"
                                                        id={`exchangeRate-${invoice.id}`}
                                                        value={values.exchangeRate}
                                                        disabled
                                                        step={0.01}
                                                    />
                                                </div>
                                                <div className="col-span-2 sm:col-span-1">
                                                    <Label htmlFor={`usdAmount-${invoice.id}`}>
                                                        Monto en USD
                                                    </Label>
                                                    <Input
                                                        type="number"
                                                        name="usdAmount"
                                                        id={`usdAmount-${invoice.id}`}
                                                        value={values.usdAmount}
                                                        disabled
                                                        step={0.01}
                                                    />
                                                </div>
                                            </div>
                                        </ComponentCard>
                                    );
                                })}
                            </div>
                        </div>
                        {expenseReportDetail?.status.name === "Pendiente" && !userLoggued?.profiles.includes('empleado') && (
                            <div className="flex gap-4 p-6">
                                <Button
                                    size="sm"
                                    className="w-full flex items-center justify-center gap-2"
                                    variant="success"
                                    onClick={approveModal.openModal}
                                    disabled={isLoading}
                                >
                                    <PaperPlaneIcon className="size-5" />
                                    Aprobar Solicitud
                                </Button>
                                <Button
                                    size="sm"
                                    className="w-full flex items-center justify-center gap-2"
                                    variant="danger"
                                    onClick={rejectModal.openModal}
                                    disabled={isLoading}
                                >
                                    <PaperPlaneIcon className="size-5" />
                                    Rechazar Solicitud
                                </Button>
                            </div>
                        )}
                    </Form>
                </div>
            </div>

            {/* Approve Modal (Info Modal) */}
            <Modal
                isOpen={approveModal.isOpen}
                onClose={() => {
                    approveModal.closeModal();
                }}
                className="max-w-[600px] p-5 lg:p-10"
            >
                <div className="text-center">
                    <div className="relative flex items-center justify-center z-1 mb-7">
                        <svg
                            className="fill-blue-light-50 dark:fill-blue-light-500/15"
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
                                className="fill-blue-light-500 dark:fill-blue-light-500"
                                width="38"
                                height="38"
                                viewBox="0 0 38 38"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    fillRule="evenodd"
                                    clipRule="evenodd"
                                    d="M5.85547 18.9998C5.85547 11.7396 11.7411 5.854 19.0013 5.854C26.2615 5.854 32.1471 11.7396 32.1471 18.9998C32.1471 26.2601 26.2615 32.1457 19.0013 32.1457C11.7411 32.1457 5.85547 26.2601 5.85547 18.9998ZM19.0013 2.854C10.0842 2.854 2.85547 10.0827 2.85547 18.9998C2.85547 27.9169 10.0842 35.1457 19.0013 35.1457C27.9184 35.1457 35.1471 27.9169 35.1471 18.9998C35.1471 10.0827 27.9184 2.854 19.0013 2.854ZM16.9999 11.9145C16.9999 13.0191 17.8953 13.9145 18.9999 13.9145H19.0015C20.106 13.9145 21.0015 13.0191 21.0015 11.9145C21.0015 10.81 20.106 9.91454 19.0015 9.91454H18.9999C17.8953 9.91454 16.9999 10.81 16.9999 11.9145ZM19.0014 27.8171C18.173 27.8171 17.5014 27.1455 17.5014 26.3171V17.3293C17.5014 16.5008 18.173 15.8293 19.0014 15.8293C19.8299 15.8293 20.5014 16.5008 20.5014 17.3293L20.5014 26.3171C20.5014 27.1455 19.8299 27.8171 19.0014 27.8171Z"
                                    fill=""
                                />
                            </svg>
                        </span>
                    </div>
                    <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90 sm:text-title-sm">
                        Aprobar Reporte de Gastos
                    </h4>
                    <p className="text-sm leading-6 text-gray-500 dark:text-gray-400 mb-4">
                        ¿Está seguro de que desea aprobar este reporte de gastos? Puede agregar observaciones opcionales.
                    </p>
                    <div className="mb-4">
                        <Label htmlFor="approveObservations">Observaciones (Opcional)</Label>
                        <textarea
                            id="approveObservations"
                            className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white"
                            rows={4}
                            value={approveObservations}
                            onChange={(e) => setApproveObservations(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center justify-center w-full gap-3 mt-7">
                        <Button
                            variant="success"
                            onClick={handleApproveSubmit}
                            disabled={isPendingApprove}
                            className="px-4 py-3 text-sm font-medium text-white rounded-lg bg-blue-light-500 hover:bg-blue-light-600"
                        >
                            {isPendingApprove ? <SpinnerFour color="white" /> : "Confirmar Aprobación"}
                        </Button>
                        <Button
                            variant="secondary"
                            onClick={() => {
                                approveModal.closeModal();
                                setApproveObservations("");
                            }}
                            className="px-4 py-3 text-sm font-medium rounded-lg"
                        >
                            Cancelar
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* Reject Modal (Error Modal) */}
            <Modal
                isOpen={rejectModal.isOpen}
                onClose={() => {
                    rejectModal.closeModal();
                    setRejectObservations("");
                }}
                className="max-w-[600px] p-5 lg:p-10"
            >
                <div className="text-center">
                    <div className="relative flex items-center justify-center z-1 mb-7">
                        <svg
                            className="fill-error-50 dark:fill-error-500/15"
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
                                className="fill-error-600 dark:fill-error-500"
                                width="38"
                                height="38"
                                viewBox="0 0 38 38"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    fillRule="evenodd"
                                    clipRule="evenodd"
                                    d="M9.62684 11.7496C9.04105 11.1638 9.04105 10.2141 9.62684 9.6283C10.2126 9.04252 11.1624 9.04252 11.7482 9.6283L18.9985 16.8786L26.2485 9.62851C26.8343 9.04273 27.7841 9.04273 28.3699 9.62851C28.9556 10.2143 28.9556 11.164 28.3699 11.7498L21.1198 18.9999L28.3699 26.25C28.9556 26.8358 28.9556 27.7855 28.3699 28.3713C27.7841 28.9571 26.8343 28.9571 26.2485 28.3713L18.9985 21.1212L11.7482 28.3715C11.1624 28.9573 10.2126 28.9573 9.62684 28.3715C9.04105 27.7857 9.04105 26.836 9.62684 26.2502L16.8771 18.9999L9.62684 11.7496Z"
                                    fill=""
                                />
                            </svg>
                        </span>
                    </div>
                    <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90 sm:text-title-sm">
                        Rechazar Reporte de Gastos
                    </h4>
                    <p className="text-sm leading-6 text-gray-500 dark:text-gray-400 mb-4">
                        ¿Está seguro de que desea rechazar este reporte de gastos? Puede agregar observaciones opcionales.
                    </p>
                    <div className="mb-4">
                        <Label htmlFor="rejectObservations">Observaciones (Opcional)</Label>
                        <textarea
                            id="rejectObservations"
                            className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white"
                            rows={4}
                            value={rejectObservations}
                            onChange={(e) => setRejectObservations(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center justify-center w-full gap-3 mt-7">
                        <Button
                            variant="danger"
                            onClick={handleRejectSubmit}
                            disabled={ispendingReject}
                            className="px-4 py-3 text-sm font-medium text-white rounded-lg bg-error-500 hover:bg-error-600"
                        >
                            {ispendingReject ? <SpinnerFour color="white" /> : "Confirmar Rechazo"}
                        </Button>
                        <Button
                            variant="secondary"
                            onClick={() => {
                                rejectModal.closeModal();
                                setRejectObservations("");
                            }}
                            className="px-4 py-3 text-sm font-medium rounded-lg"
                        >
                            Cancelar
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* Success Modal */}
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
                        Acción Completada
                    </h4>
                    <p className="text-sm leading-6 text-gray-500 dark:text-gray-400">
                        La acción se ha completado exitosamente. Puede seguir el estado del reporte desde el historial.
                    </p>
                    <div className="flex items-center justify-center w-full gap-3 mt-7">
                        <button
                            onClick={handleClickSuccessModal}
                            type="button"
                            className="flex justify-center w-full px-4 py-3 text-sm font-medium text-white rounded-lg bg-success-500 shadow Bradbury
                            -theme-xs hover:bg-success-600 sm:w-auto"
                        >
                            Aceptar
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}