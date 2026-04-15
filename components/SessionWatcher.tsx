"use client";

import { useEffect } from "react";

export default function SessionWatcher() {
  useEffect(() => {
    let timeout: any;

    function resetTimer() {
      clearTimeout(timeout);

      timeout = setTimeout(
        () => {
          alert("Sesión expirada por inactividad");
          window.location.href = "/login";
        },
        30 * 60 * 1000,
      ); // 30 min
    }

    window.addEventListener("mousemove", resetTimer);
    window.addEventListener("keydown", resetTimer);

    resetTimer();

    return () => {
      clearTimeout(timeout);
    };
  }, []);

  return null;
}
