"use client";

type Props = {
  comments: any[];
  history: any[];
  getUserName: (id: string) => string;
};

export default function IncidentTimeline({
  comments,
  history,
  getUserName,
}: Props) {
  // 🔥 NORMALIZAR COMMENTS
  const normalizedComments = comments.map((c) => ({
    id: c.id,
    type: "comment",
    content: c.comment,
    user: c.user_id,
    date: new Date(c.created_at),
  }));

  // 🔥 NORMALIZAR HISTORY (SIN DUPLICADOS)
  const normalizedHistory = history
    .filter((h) => h.action !== "COMMENTED")
    .map((h) => ({
      id: h.id,
      type: "history",
      action: h.action,
      to: h.to_value,
      user: h.performed_by,
      date: new Date(h.created_at),
    }));

  // 🔥 UNIFICAR
  const timeline = [...normalizedComments, ...normalizedHistory].sort(
    (a, b) => a.date.getTime() - b.date.getTime(),
  );

  if (!timeline.length) {
    return (
      <div className="text-sm text-gray-400 p-4">No hay actividad aún</div>
    );
  }

  return (
    <div className="space-y-4">
      {timeline.map((item) => {
        // 🟢 COMMENT (tipo chat)
        if (item.type === "comment") {
          return (
            <div key={item.id} className="flex flex-col">
              <div className="bg-white border rounded-xl p-3 shadow-sm max-w-md">
                <p className="text-sm text-gray-800">
                  {"content" in item
                    ? item.content
                    : `${item.action} → ${item.to}`}
                </p>
              </div>

              <div className="text-xs text-gray-400 mt-1">
                <span className="font-medium text-gray-600">
                  {getUserName(item.user)}
                </span>
                {" · "}
                {item.date.toLocaleString()}
              </div>
            </div>
          );
        }

        // 🔵 HISTORY HUMANIZADO
        let text = "";

        if ("action" in item) {
          switch (item.action) {
            case "STATUS_CHANGED":
              text = `Estado cambiado a ${item.to?.status || "desconocido"}`;
              break;

            default:
              text = "Acción desconocida";
          }
        } else if ("content" in item) {
          text = item.content;
        }

        return (
          <div
            key={item.id}
            className="flex items-center gap-2 text-xs text-gray-500"
          >
            <div className="bg-gray-100 px-3 py-2 rounded-lg">
              <span className="font-medium">{getUserName(item.user)}</span>
              {" · "}
              {text}
            </div>

            <span className="text-gray-400">
              {item.date.toLocaleTimeString()}
            </span>
          </div>
        );
      })}
    </div>
  );
}
