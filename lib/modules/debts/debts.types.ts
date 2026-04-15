export interface Debt {
  id: string;
  property_id: string;
  amount: number;
  due_date: string;
  status: "PENDING" | "PAID";
  created_at: string;
}
