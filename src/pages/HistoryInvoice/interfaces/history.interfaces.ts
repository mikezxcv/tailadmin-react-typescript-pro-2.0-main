export interface IUser {
    id: number;
    name: string;
    email: string;
}

export interface IReport {
    id: number;
    employeeId: number;
    expenseTypeId: number;
    liquidationTypeId: number;
    reportDate: string;
    statusId: number;
    status: {
        id: number;
        name: string;
    };
    invoices: IInvoice[];
    employee: IUser;
    liquidationType: ILiquidationType;
    expenseType: IExpenseType;
    approvals: IApproval[];
}

interface IApproval {
    id: number;
    reportId: number;
    supervisorId: number;
    registerDate: string;
    statusId: number;
    comments: string | null;
    supervisor: IUser
}

export interface IInvoice {
    id: number;
    reportId: number;
    invoiceDate: string;
    companyId?: number;
    amountLocal: number;
    currencyIdLocal: number;
    amountUsd: number;
    countryId: number;
    exchangeRate: number;
    companyName?: string ;
    countryName?: string;
}

export interface ILiquidationType {
    id: number,
    name: string
}

export interface IExpenseType {
    id: number,
    name: string
}

export enum UserRole {
    ADMIN = 'admin',
    EMPLOYEE = 'empleado',
    MANAGER = 'supervisor',
  }

