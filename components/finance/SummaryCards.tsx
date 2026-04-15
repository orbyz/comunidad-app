export default function SummaryCards({ ledger }: any) {
  const totalDebt = ledger.debts.reduce(
    (sum: number, d: any) => sum + d.amount,
    0,
  );

  const totalPaid = ledger.debts.reduce(
    (sum: number, d: any) => sum + d.paidAmount,
    0,
  );

  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="p-4 bg-white rounded-xl shadow">
        <p className="text-sm text-gray-500">Total deuda</p>
        <p className="text-xl font-semibold">€ {totalDebt}</p>
      </div>

      <div className="p-4 bg-white rounded-xl shadow">
        <p className="text-sm text-gray-500">Total pagado</p>
        <p className="text-xl font-semibold text-green-600">€ {totalPaid}</p>
      </div>
    </div>
  );
}
