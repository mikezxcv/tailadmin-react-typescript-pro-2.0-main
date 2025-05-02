"use client";

import { Table } from "../../components/ui/table";
import { useState, useMemo } from "react";
import PaginationWithIcon from "../../components/tables/DataTables/TableOne/PaginationWithIcon";
import { TableHeader, TableRow, TableCell, TableBody } from "../../components/ui/table";
import Badge from "../../components/ui/badge/Badge";
import { TrashBinIcon, DocsIcon } from "../../icons";
import { useExpenseReports } from "./api/history.api";
import { useNavigate } from "react-router";
import { Modal } from "../../components/ui/modal";
import { useModal } from "../../hooks/useModal";
import { useDeleteExpenseReport } from "../Documents/api/expense-report.api";
import SpinnerFour from "../../components/ui/spinner/SpinnerFour";
import { useAuth } from "../../context/AuthContext";
import { UserRole } from "./interfaces/history.interfaces";
import AvatarText from "../../components/ui/avatar/AvatarText";

type SortKey = "liquidationType" | "expenseType" | "status" | "invoiceCount" | "name" | "reportDate" | "id";
type SortOrder = "asc" | "desc";

export default function History() {
    const { userLoggued } = useAuth();
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [sortKey, setSortKey] = useState<SortKey>("id");
    const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
    const [searchTerm, setSearchTerm] = useState("");

    // Determinar el rol del usuario
    const userRole = useMemo(() => {
        if (userLoggued?.profiles.includes('admin')) return UserRole.ADMIN;
        if (userLoggued?.profiles.includes('supervisor')) return UserRole.MANAGER;
        if (userLoggued?.profiles.includes('empleado')) return UserRole.EMPLOYEE;
        return UserRole.ADMIN; // Rol por defecto
    }, [userLoggued]);
    console.log("userRole", userRole);

    // Llamada a la API usando el hook unificado
    const { data: expenseReportsData = [] } = useExpenseReports({
        enabled: true,
        role: userRole,
        userId: userRole !== UserRole.ADMIN ? userLoggued?.id : undefined,
    });
    const { mutate: deleteExpenseReport, isPending: isPendingDelete } = useDeleteExpenseReport();
    const [selectedExpenseReport, setSelectedExpenseReport] = useState<number | null>(null);
    const navigate = useNavigate();



    const filteredAndSortedData = useMemo(() => {
        return expenseReportsData
            .map(report => ({
                id: report.id,
                liquidationType: report.liquidationType.name,
                expenseType: report.expenseType.name,
                status: report.status.name,
                invoiceCount: report.invoices.length,
                employee: report.employee,

                reportDate: report.reportDate
            }))
            .filter(item =>
                Object.values(item).some(
                    value =>
                        typeof value === "string" &&
                        value.toLowerCase().includes(searchTerm.toLowerCase())
                )
            )
            .sort((a, b) => {
                // Ordenamiento primario según sortKey
                if (sortKey === "liquidationType") {
                    const compare = a.liquidationType.localeCompare(b.liquidationType);
                    return sortOrder === "asc" ? compare : -compare;
                }
                if (sortKey === "expenseType") {
                    const compare = a.expenseType.localeCompare(b.expenseType);
                    return sortOrder === "asc" ? compare : -compare;
                }
                if (sortKey === "status") {
                    const compare = a.status.localeCompare(b.status);
                    return sortOrder === "asc" ? compare : -compare;
                }
                if (sortKey === "invoiceCount") {
                    const compare = a.invoiceCount - b.invoiceCount;
                    return sortOrder === "asc" ? compare : -compare;
                }

                if (sortKey === "name") {
                    const compare = a.employee.name.localeCompare(b.employee.name);
                    return sortOrder === "asc" ? compare : -compare;
                }
                if (sortKey === "reportDate") {
                    const dateA = new Date(a.reportDate).getTime();
                    const dateB = new Date(b.reportDate).getTime();
                    return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
                }
                // Ordenamiento predeterminado por id descendente
                return b.id - a.id; // Descendente: mayor id primero
            });
    }, [sortKey, sortOrder, searchTerm, expenseReportsData]);

    const totalItems = filteredAndSortedData.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const handleSort = (key: SortKey) => {
        console.log("key", key);
        console.log("sortKey", sortKey);
        console.log("sortOrder", sortOrder);
        if (sortKey === key) {
            setSortOrder(sortOrder === "asc" ? "desc" : "asc");
        } else {
            setSortKey(key);
            setSortOrder("asc");
        }
    };

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
    const currentData = filteredAndSortedData.slice(startIndex, endIndex);
    console.log("currentData", currentData);
    const errorModal = useModal();


    const handleExpenseReportDetail = (id: number) => {
        // naviagete to path="/expense-report-detail/:id" 

        navigate(`/expense-report-detail/${id}`);
    }

    const handleDeleteExpenseReportModal = (id: number) => {
        errorModal.openModal();
        setSelectedExpenseReport(id);
    };

    const confirmDeleteExpenseReport = () => {
        if (selectedExpenseReport) {
            deleteExpenseReport(selectedExpenseReport, {
                onSuccess: () => {
                    console.log("Expense Report deleted successfully");
                    errorModal.closeModal();
                },
                onError: (error) => {
                    console.error("Error deleting Expense Report:", error);
                    errorModal.closeModal();
                },

            });
        }
    }




    return (
        <div className="overflow-hidden bg-white dark:bg-white/[0.03] rounded-xl">
            <div className="flex flex-col gap-2 px-4 py-4 border border-b-0 border-gray-100 dark:border-white/[0.05] rounded-t-xl sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                    <span className="text-gray-500 dark:text-gray-400"> Mostrar </span>
                    <div className="relative z-20 bg-transparent">
                        <select
                            className="w-full py-2 pl-3 pr-8 text-sm text-gray-800 bg-transparent border border-gray-300 rounded-lg appearance-none dark:bg-dark-900 h-9 bg-none shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                            value={itemsPerPage}
                            onChange={(e) => setItemsPerPage(Number(e.target.value))}
                        >
                            {[5, 8, 10].map((value) => (
                                <option
                                    key={value}
                                    value={value}
                                    className="text-gray-500 dark:bg-gray-900 dark:text-gray-400"
                                >
                                    {value}
                                </option>
                            ))}
                        </select>
                        <span className="absolute z-30 text-gray-500 -translate-y-1/2 right-2 top-1/2 dark:text-gray-400">
                            <svg
                                className="stroke-current"
                                width="16"
                                height="16"
                                viewBox="0 0 16 16"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    d="M3.8335 5.9165L8.00016 10.0832L12.1668 5.9165"
                                    stroke=""
                                    strokeWidth="1.2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            </svg>
                        </span>
                    </div>
                    <span className="text-gray-500 dark:text-gray-400"> registros </span>
                </div>

                <div className="relative">
                    <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none left-4 top-1/2 dark:text-gray-400">
                        <svg
                            className="fill-current"
                            width="20"
                            height="20"
                            viewBox="0 0 20 20"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                fillRule="evenodd"
                                clipRule="evenodd"
                                d="M3.04199 9.37363C3.04199 5.87693 5.87735 3.04199 9.37533 3.04199C12.8733 3.04199 15.7087 5.87693 15.7087 9.37363C15.7087 12.8703 12.8733 15.7053 9.37533 15.7053C5.87735 15.7053 3.04199 12.8703 3.04199 9.37363ZM9.37533 1.54199C5.04926 1.54199 1.54199 5.04817 1.54199 9.37363C1.54199 13.6991 5.04926 17.2053 9.37533 17.2053C11.2676 17.2053 13.0032 16.5344 14.3572 15.4176L17.1773 18.238C17.4702 18.5309 17.945 18.5309 18.2379 18.238C18.5308 17.9451 18.5309 17.4703 18.238 17.1773L15.4182 14.3573C16.5367 13.0033 17.2087 11.2669 17.2087 9.37363C17.2087 5.04817 13.7014 1.54199 9.37533 1.54199Z"
                                fill=""
                            />
                        </svg>
                    </span>
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search..."
                        className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent py-2.5 pl-11 pr-4 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 xl:w-[300px]"
                    />
                </div>
            </div>

            <div className="max-w-full overflow-x-auto custom-scrollbar">
                <div>
                    <Table>
                        <TableHeader className="border-t border-gray-100 dark:border-white/[0.05]">
                            <TableRow>
                                {[
                                    { key: "liquidationType", label: "Liquidación" },
                                    { key: "expenseType", label: "Tipo de Gasto" },
                                    { key: "status", label: "Estado" },
                                    { key: "invoiceCount", label: "Num Facturas" },
                                    { key: "employee.name", label: "Solicitante" },
                                    { key: "reportDate", label: "Fecha Solicitud" },

                                ].map(({ key, label }) => (
                                    <TableCell
                                        key={key}
                                        isHeader
                                        className="px-4 py-3 border border-gray-100 dark:border-white/[0.05]"
                                    >
                                        <div
                                            className="flex items-center justify-between cursor-pointer"
                                            onClick={() => handleSort(key as SortKey)}
                                        >
                                            <p className="font-medium text-gray-700 text-theme-xs dark:text-gray-400">
                                                {label}
                                            </p>
                                            <button className="flex flex-col gap-0.5">
                                                <svg
                                                    className={`text-gray-300 dark:text-gray-700 ${sortKey === key && sortOrder === "asc"
                                                        ? "text-brand-500"
                                                        : ""
                                                        }`}
                                                    width="8"
                                                    height="5"
                                                    viewBox="0 0 8 5"
                                                    fill="none"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                >
                                                    <path
                                                        d="M4.40962 0.585167C4.21057 0.300808 3.78943 0.300807 3.59038 0.585166L1.05071 4.21327C0.81874 4.54466 1.05582 5 1.46033 5H6.53967C6.94418 5 7.18126 4.54466 6.94929 4.21327L4.40962 0.585167Z"
                                                        fill="currentColor"
                                                    />
                                                </svg>
                                                <svg
                                                    className={`text-gray-300 dark:text-gray-700 ${sortKey === key && sortOrder === "desc"
                                                        ? "text-brand-500"
                                                        : ""
                                                        }`}
                                                    width="8"
                                                    height="5"
                                                    viewBox="0 0 8 5"
                                                    fill="none"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                >
                                                    <path
                                                        d="M4.40962 4.41483C4.21057 4.69919 3.78943 4.69919 3.59038 4.41483L1.05071 0.786732C0.81874 0.455343 1.05582 0 1.46033 0H6.53967C6.94418 0 7.18126 0.455342 6.94929 0.786731L4.40962 4.41483Z"
                                                        fill="currentColor"
                                                    />
                                                </svg>
                                            </button>
                                        </div>
                                    </TableCell>
                                ))}
                                <TableCell
                                    isHeader
                                    className="px-4 py-3 border border-gray-100 dark:border-white/[0.05]"
                                >
                                    <p className="font-medium text-gray-700 text-theme-xs dark:text-gray-400">
                                        Acciones
                                    </p>
                                </TableCell>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {currentData.map((item, i) => (
                                <TableRow key={`${item.id}-${i}`}>
                                    <TableCell className="px-4 py-3 font-normal dark:text-gray-400/90 text-gray-800 border border-gray-100 dark:border-white/[0.05] text-theme-sm whitespace-nowrap">
                                        {item.liquidationType}
                                    </TableCell>
                                    <TableCell className="px-4 py-3 font-normal dark:text-gray-400/90 text-gray-800 border border-gray-100 dark:border-white/[0.05] text-theme-sm whitespace-nowrap">
                                        {item.expenseType}
                                    </TableCell>
                                    <TableCell className="px-4 py-3 font-normal dark:text-gray-400/90 text-gray-800 border border-gray-100 dark:border-white/[0.05] text-theme-sm whitespace-nowrap">
                                        <Badge
                                            size="sm"
                                            color={
                                                item.status === "Aprobado"
                                                    ? "success"
                                                    : item.status === "Pendiente"
                                                        ? "warning"
                                                        : "error"
                                            }
                                            variant="light"
                                        >
                                            {item.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="px-4 py-3 font-normal dark:text-gray-400/90 text-gray-800 border border-gray-100 dark:border-white/[0.05] text-theme-sm whitespace-nowrap">
                                        {item.invoiceCount}
                                    </TableCell>
                                    <TableCell className="px-4 sm:px-6 py-3.5">
                                        <div className="flex items-center gap-3">
                                            <AvatarText name={item.employee.name} className="w-10 h-10" />
                                            <div>
                                                <span className="mb-0.5 block text-theme-sm font-medium text-gray-700 dark:text-gray-400">
                                                    {item.employee.name}
                                                </span>
                                                <span className="text-gray-500 text-theme-sm dark:text-gray-400">
                                                    {item.employee.email}
                                                </span>
                                            </div>
                                        </div>
                                    </TableCell>
                                    {/* <TableCell className="px-4 py-3 font-normal dark:text-gray-400/90 text-gray-800 border border-gray-100 dark:border-white/[0.05] text-theme-sm whitespace-nowrap">
                                        {item.employeeName}
                                    </TableCell> */}
                                    <TableCell className="px-4 py-3 font-normal dark:text-gray-400/90 text-gray-800 border border-gray-100 dark:border-white/[0.05] text-theme-sm whitespace-nowrap">
                                        {item.reportDate}
                                    </TableCell>
                                    <TableCell className="px-4 py-4 font-normal text-gray-800 border border-gray-100 dark:border-white/[0.05] text-theme-sm dark:text-white/90 whitespace-nowrap">
                                        <div className="flex items-center w-full gap-2">
                                            {item.status === "Pendiente" && (
                                                <button className="text-gray-500 hover:text-error-500 dark:text-gray-400 dark:hover:text-error-500">
                                                    <TrashBinIcon className="size-5" onClick={() => handleDeleteExpenseReportModal(item.id)} />
                                                </button>
                                            )}
                                            {/* <button className="text-gray-500 hover:text-blue-800 dark:text-gray-400 dark:hover:text-blue-900">
                                                <PencilIcon className="size-5" />
                                            </button> */}
                                            <button className="text-gray-500 hover:text-blue-800 dark:text-gray-400 dark:hover:text-blue-900" onClick={() => handleExpenseReportDetail(item.id)}>
                                                <DocsIcon className="size-5" />
                                            </button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </div>

            {/* Error Modal */}
            <Modal
                isOpen={errorModal.isOpen}
                onClose={errorModal.closeModal}
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
                        Eliminar Solicitud!
                    </h4>
                    <p className="text-sm leading-6 text-gray-500 dark:text-gray-400">
                        ¿Está seguro de que desea eliminar esta solicitud de reporte de gastos? Esta acción no se puede deshacer.
                    </p>

                    <div className="flex items-center justify-center w-full gap-3 mt-7">
                        <button onClick={confirmDeleteExpenseReport}
                            type="button"
                            className="flex justify-center w-full px-4 py-3 text-sm font-medium text-white rounded-lg bg-error-500 shadow-theme-xs hover:bg-error-600 sm:w-auto"
                            disabled={isPendingDelete}
                        >
                            {isPendingDelete ? <SpinnerFour color="white" /> : "Confirmar"}

                        </button>
                    </div>
                </div>
            </Modal>

            <div className="border border-t-0 rounded-b-xl border-gray-100 py-4 pl-[18px] pr-4 dark:border-white/[0.05]">
                <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between">
                    <div className="pb-3 xl:pb-0">
                        <p className="pb-3 text-sm font-medium text-center text-gray-500 border-b border-gray-100 dark:border-gray-800 dark:text-gray-400 xl:border-b-0 xl:pb-0 xl:text-left">
                            Mostrando {startIndex + 1} a {endIndex} de {totalItems} registros
                        </p>
                    </div>
                    <PaginationWithIcon
                        totalPages={totalPages}
                        initialPage={currentPage}
                        onPageChange={handlePageChange}
                    />
                </div>
            </div>
        </div>
    );
}