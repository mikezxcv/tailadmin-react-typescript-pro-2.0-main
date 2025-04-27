import { useQuery } from "@tanstack/react-query";
import appService from "../../../services/app.service";
import { IReport, UserRole } from "../interfaces/history.interfaces";

// export const useExpenseReports = (enabled: boolean) => {
//   return useQuery({
//     queryKey: ["expense-reports"],
//     queryFn: (): Promise<IReport[]> =>
//       appService.get("/invoice/expense-reports").then((res) => res.data),
//     enabled,
//   });
// };

// export const useExpenseReportsToManager = (enabled: boolean, managerId: number) => {
//   return useQuery({
//     queryKey: ["expense-reports-to-manager"],
//     queryFn: (): Promise<IReport[]> =>
//       appService
//         .get(`/invoice/expense-reports-to-manager/${managerId}`)
//         .then((res) => res.data),
//     enabled,
//   });
// }

// export const useExpenseReportsToEmployee = (enabled: boolean, employeeId: number) => {
//   return useQuery({
//     queryKey: ["expense-reports-to-employee"],
//     queryFn: (): Promise<IReport[]> =>
//       appService
//         .get(`/invoice/expense-reports-to-employee/${employeeId}`)
//         .then((res) => res.data),
//     enabled,
//   });
// }

interface UseExpenseReportsParams {
  enabled: boolean;
  role: UserRole;
  userId?: number;
}

export const useExpenseReports = ({ enabled, role, userId }: UseExpenseReportsParams) => {
  const getEndpoint = () => {
    switch (role) {
      case UserRole.ADMIN:
        return '/invoice/expense-reports';
      case UserRole.EMPLOYEE:
        return `/invoice/expense-reports-to-employee/${userId}`;
      case UserRole.MANAGER:
        return `/invoice/expense-reports-to-manager/${userId}`;
      default:
        throw new Error(`Unsupported role: ${role}`);
    }
  };

  return useQuery({
    queryKey: ['expense-reports', role, userId],
    queryFn: (): Promise<IReport[]> =>
      appService.get(getEndpoint()).then((res) => res.data),
    enabled: enabled && (role === UserRole.ADMIN || !!userId), // Solo habilita si userId está presente para roles no admin
  });
};


