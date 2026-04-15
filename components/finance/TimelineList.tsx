export default function TimelineList({ timeline }: any) {
  return (
    <div className="bg-white rounded-2xl shadow p-4">
      <h3 className="text-lg font-semibold mb-4">Movimientos financieros</h3>

      <div className="space-y-3">
        {timeline.map((item: any) => (
          <div
            key={item.id}
            className="flex justify-between items-center border-b pb-2"
          >
            <div>
              <p className="text-sm font-medium">{item.description}</p>
              <p className="text-xs text-gray-400">
                {new Date(item.date).toLocaleDateString()}
              </p>
            </div>

            <p
              className={`font-semibold ${
                item.type === "DEBT_CREATED" ? "text-red-500" : "text-green-600"
              }`}
            >
              € {item.amount}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
