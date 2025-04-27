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

export interface IReportResponse {
    id: number;
    employeeId: number;
    expenseTypeId: number;
    liquidationTypeId: number;
    reportDate: string;
    statusId: number;
    invoices: IInvoiceResponse[];
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

export interface IInvoiceResponse {
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


export interface InvoiceRequest {
    invoice_date: string;
    amount_local: number;
    currency_id_local: number;
    amount_usd: number;
    exchange_rate: number;
    company_name: string;
    country_name: string;
}

export interface IExpenseReportRequest {
    employee_id: number;
    expense_type_id: number;
    liquidation_type_id: number;
    invoices: InvoiceRequest[];
}

export interface IApproveRejectRequest {
    report_id: number;
    comments: string;
    supervisor_id: number;
}
