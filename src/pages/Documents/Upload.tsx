import { useState } from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import DropZoneSingleFile from "../../components/form/form-elements/DropZoneSingleFile";
import Button from "../../components/ui/button/Button";
import { Card } from "../../components/ui/card";
import InvoiceForm from "./InvoiceForm";
import SpinnerFour from "../../components/ui/spinner/SpinnerFour";

export default function Upload() {
    const [isLoading, setIsLoading] = useState(false);
    const [showForm, setShowForm] = useState(false);

    const handleScanClick = () => {
        setIsLoading(true);
        setTimeout(() => {
            setIsLoading(false);
            setShowForm(true);
        }, 1000);
    };

    const handleRescan = () => {
        setShowForm(false);
        setIsLoading(false);
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
                        <Card>
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
                        </Card>
                    </div>
                )}

                {showForm && (
                    <div className="space-y-6 col-span-2">
                        <Card>
                            <InvoiceForm />
                            <Button
                                size="sm"
                                className="mt-6"
                                variant="primary"
                                onClick={handleRescan}
                            >
                                Volver a Escanear
                            </Button>
                        </Card>
                    </div>
                )}
            </div>
        </div>
    );
}
