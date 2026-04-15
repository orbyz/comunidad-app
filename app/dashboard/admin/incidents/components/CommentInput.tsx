"use client";

import { useState } from "react";

export default function CommentInput({
  incidentId,
  onComment,
}: {
  incidentId: string;
  onComment: () => void;
}) {
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!comment.trim()) return;

    setLoading(true);

    try {
      await fetch(`/api/incidents/${incidentId}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ comment }),
      });

      setComment("");

      // 🔥 refresca timeline + detalle
      onComment();
    } catch (err) {
      console.error("Error creando comentario:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="border-t pt-3 mt-3">
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        className="w-full border p-2 rounded"
        placeholder="Escribe un comentario..."
      />

      <button
        onClick={handleSubmit}
        disabled={loading}
        className="mt-2 bg-black text-white px-4 py-2 rounded disabled:opacity-50"
      >
        {loading ? "Enviando..." : "Enviar"}
      </button>
    </div>
  );
}
