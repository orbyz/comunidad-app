export type Debt = {
  id: string;
  tenantId: string;
  unitId: string;
  amount: number;
  paidAmount: number;
  status: string;
  dueDate: Date;
};
