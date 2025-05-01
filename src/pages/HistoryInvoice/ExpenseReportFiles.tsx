import Button from "../../components/ui/button/Button";
import {
    Table,
    TableHeader,
    TableRow,
    TableCell,
    TableBody,
} from "../../components/ui/table";
import { DownloadIcon, FileIcon } from "../../icons";
import { IReport } from "./interfaces/history.interfaces";
import { useDownloadFile } from "../Documents/api/mongo.api";

export interface ExpenseReportFilesProps {
    expenseReport: IReport;
}

export default function ExpenseReportFiles({ expenseReport }: ExpenseReportFilesProps) {
    const { mutate: downloadFile, isPending } = useDownloadFile(); // Use mutation hook

    const handleDownloadFile = (fileId: string, fileName: string) => {
        console.log("Downloading file with fileName:", fileName);
        downloadFile(fileId, {
            onSuccess: ({ blob, filename }) => {
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = filename; // Use the filename from the response
                document.body.appendChild(a);
                a.click();
                a.remove();
                window.URL.revokeObjectURL(url);
            },
            onError: (error) => {
                console.error("Error downloading file:", error);
                alert("Error al descargar el archivo. Por favor, intenta de nuevo.");
            },
        });
    };

    return (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
            <div className="flex flex-col gap-4 px-6 mb-4 sm:flex-row sm:items-center sm:justify-between">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">Archivos</h3>
            </div>
            <div className="max-w-full overflow-x-auto">
                <Table>
                    {/* Table Header */}
                    <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                        <TableRow>
                            <TableCell
                                isHeader
                                className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                            >
                                Nombre
                            </TableCell>
                            <TableCell
                                isHeader
                                className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                            >
                                Acciones
                            </TableCell>
                        </TableRow>
                    </TableHeader>

                    {/* Table Body */}
                    <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                        {expenseReport.files.map((file) => (
                            <TableRow key={file.id}>
                                <TableCell className="px-5 py-4 sm:px-6 text-start">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 overflow-hidden rounded-full">
                                            {file.fileMongoName.includes(".pdf") ? (
                                                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                                                    <FileIcon className="w-6 h-6 text-gray-500" />
                                                </div>
                                            ) : (
                                                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                                                    <img
                                                        width={40}
                                                        height={40}
                                                        src={file.publicFileUrl}
                                                        alt={file.fileMongoName}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <span className="block text-gray-500 text-theme-xs dark:text-gray-400">
                                                {file.fileMongoName}
                                            </span>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell className="px-3 py-3 font-normal text-gray-800 dark:border-white/[0.05] text-theme-sm dark:text-white/90 whitespace-nowrap">
                                    <div>
                                        <Button
                                            size="xs"
                                            variant="info"
                                            startIcon={<DownloadIcon />}
                                            onClick={() => handleDownloadFile(file.fileMongoId, file.fileMongoName)}
                                            disabled={isPending}
                                        >
                                            {isPending ? "Descargando..." : "Descargar"}
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}