import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import appService from "../../../services/app.service";
import {
  IApproveRejectRequest,
  IExpenseReportRequest,
  IReportResponse,
} from "../interfaces/expense-report.interfaces";
import { IReport } from "../../HistoryInvoice/interfaces/history.interfaces";

// Interfaces para los tipos de datos
interface ILiquidationType {
  id: number;
  name: string;
}

interface IExpenseType {
  id: number;
  name: string;
}

interface ICurrency {
  id: number;
  code: string;
  description: string;
}

export const useExpenseReport = () => {
  return useMutation<IReportResponse, Error, IExpenseReportRequest>({
    mutationFn: async (
      request: IExpenseReportRequest
    ): Promise<IReportResponse> => {
      const res = await appService.post("/invoice/expense-report", request);
      return res.data;
    },
    onSuccess: (data: IReportResponse) => {
      toast.success("Reporte de gasto guardado correctamente");
      console.log("Invoice Created", data);
      // queryClient.invalidateQueries({ queryKey: ["user"] });
    },
    onError: (error: Error) => {
      console.log("Error", error);
      toast.error("Error al guardar el reporte de gasto ");
    },
  });
};

export const useLiquidationTypes = (enabled: boolean) => {
  return useQuery({
    queryKey: ["liquidation-types"],
    queryFn: (): Promise<ILiquidationType[]> =>
      appService.get("/invoice/liquidation-types").then((res) => res.data),
    enabled,
  });
};

export const useExpenseTypes = (enabled: boolean) => {
  return useQuery({
    queryKey: ["expense-types"],
    queryFn: (): Promise<IExpenseType[]> =>
      appService.get("/invoice/expense-types").then((res) => res.data),
    enabled,
  });
};

export const useCurrencyTypes = (enabled: boolean) => {
  return useQuery({
    queryKey: ["currencies"],
    queryFn: (): Promise<ICurrency[]> =>
      appService.get("/invoice/currencies").then((res) => res.data),
    enabled,
  });
};

export const useExpenseReportById = (id: number, enabled: boolean) => {
  return useQuery({
    queryKey: ["expense-report", id],
    queryFn: (): Promise<IReport> =>
      appService.get(`/invoice/expense-report/${id}`).then((res) => res.data),
    enabled,
  });
};

// approve expense report
export const useApproveExpenseReport = () => {
  return useMutation<IReportResponse, Error, IApproveRejectRequest>({
    mutationFn: async (
      request: IApproveRejectRequest
    ): Promise<IReportResponse> => {
      const res = await appService.post(
        `/invoice/expense-report/approve`,
        request
      );
      return res.data;
    },
    onSuccess: (data: IReportResponse) => {
      toast.success("Reporte de gasto aprobado correctamente");
      console.log("Invoice Created", data);
    },
    onError: (error: Error) => {
      console.log("Error", error);
      toast.error("Error al aprobar el reporte de gasto ");
    },
  });
};

// reject expense report
export const useRejectExpenseReport = () => {
  return useMutation<IReportResponse, Error, IApproveRejectRequest>({
    mutationFn: async (
      request: IApproveRejectRequest
    ): Promise<IReportResponse> => {
      const res = await appService.post(
        `/invoice/expense-report/reject`,
        request
      );
      return res.data;
    },
    onSuccess: (data: IReportResponse) => {
      toast.success("Reporte de gasto rechazado correctamente");
      console.log("Invoice Created", data);
    },
    onError: (error: Error) => {
      console.log("Error", error);
      toast.error("Error al rechazar el reporte de gasto ");
    },
  });
}

// delete expense report
export const useDeleteExpenseReport = () => {
  const queryClient = useQueryClient();
  return useMutation<IReportResponse, Error, number>({
    mutationFn: async (
      id: number
    ): Promise<IReportResponse> => {
      const res = await appService.delete(
        `/invoice/expense-report/${id}`
      );
      return res.data;
    },
    onSuccess: (data: IReportResponse) => {
      toast.success("Solicitud de Reporte de gasto eliminado correctamente");
      queryClient.invalidateQueries({ queryKey: ["expense-reports"] });
      console.log("Invoice Created", data);
    },
    onError: (error: Error) => {
      console.log("Error", error);
      toast.error("Error al eliminar solicitud del reporte de gasto ");
    },
  });
}
