export default function BalanceCard({ balance }: { balance: number }) {
  const isPositive = balance > 0;

  return (
    <div className="rounded-2xl p-6 shadow bg-white">
      <h2 className="text-sm text-gray-500">Balance actual</h2>

      <p
        className={`text-3xl font-bold ${
          isPositive ? "text-red-500" : "text-green-600"
        }`}
      >
        € {balance.toFixed(2)}
      </p>

      <p className="text-sm text-gray-400 mt-1">
        {isPositive ? "Pendiente por pagar" : "Saldo al día"}
      </p>
    </div>
  );
}
