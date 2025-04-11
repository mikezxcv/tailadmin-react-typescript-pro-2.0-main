import ComponentCard from "../../components/common/ComponentCard";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import DropZoneSingleFile from "../../components/form/form-elements/DropZoneSingleFile";
import Button from "../../components/ui/button/Button";
import { Card } from "../../components/ui/card";
import { PaperPlaneIcon } from "../../icons";
import InvoiceForm from "./InvoiceForm";

export default function Upload() {
    return (
        <div>
            <PageMeta
                title="React.js Blank Dashboard | TailAdmin - Next.js Admin Dashboard Template"
                description="This is React.js Blank Dashboard page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template"
            />
            <PageBreadcrumb pageTitle="Documento" />
            {/* <div className="mb-6 sm:mb-8">
                <DropZoneSingleFile
                    title="Sube tu Factura"
                    description="Carga tu factura en formato PDF o Imagen. No se aceptan archivos de más de 2MB."
                    acceptedFileTypes={{
                        "application/pdf": [],
                        "image/*": [],
                    }}
                    maxFileSize={2 * 1024 * 1024} // 2MB
                />
            </div> */}
            <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">

                <div className="grid grid-cols-1 ">
                    <div className="">
                        <Card>
                            <DropZoneSingleFile
                                title="Sube tu Factura"
                                description="Carga tu factura en formato PDF o Imagen. No se aceptan archivos de más de 2MB."
                                acceptedFileTypes={{
                                    "application/pdf": [],
                                    "image/*": [],
                                }}
                                maxFileSize={2 * 1024 * 1024} // 2MB
                            />
                            <Button size="sm" className="w-full" variant="success">
                                Escanear
                                <PaperPlaneIcon className="size-5" />
                            </Button>
                        </Card>


                    </div>
                </div>
                <div className="space-y-6">
                    <InvoiceForm />
                </div>
            </div>
        </div>
    );
}