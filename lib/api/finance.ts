export async function createDebt(data: {
  unitId: string;
  amount: number;
  concept: string;
  dueDate: string;
}) {
  const res = await fetch("/api/finance/debts", {
    method: "POST",
    body: JSON.stringify(data),
  });

  if (!res.ok) throw new Error("Error creating debt");

  return res.json();
}

export async function createPayment(data: {
  unitId: string;
  amount: number;
  method: string;
  reference?: string;
}) {
  const res = await fetch("/api/finance/payments", {
    method: "POST",
    body: JSON.stringify(data),
  });

  if (!res.ok) throw new Error("Error creating payment");

  return res.json();
}
