"use client";

import { useEffect } from "react";

/**
 * Top-level error boundary that wraps the entire <html> document. Triggered
 * when the root layout itself throws — so we render a minimal, dependency-free
 * page that does not assume any styles or providers exist.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Root-level error:", error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "system-ui, sans-serif",
          background: "#fff",
          color: "#0a0a0c",
          padding: "2rem",
          textAlign: "center",
        }}
      >
        <h1 style={{ fontSize: "2rem", margin: 0 }}>
          Something went very wrong.
        </h1>
        <p style={{ marginTop: "0.75rem", color: "#475569" }}>
          The site failed to render. Please refresh, or come back in a moment.
        </p>
        <button
          type="button"
          onClick={reset}
          style={{
            marginTop: "1.5rem",
            padding: "0.75rem 1.5rem",
            borderRadius: "9999px",
            background: "#0a0a0c",
            color: "#fff",
            border: "none",
            fontWeight: 700,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            cursor: "pointer",
          }}
        >
          Try again
        </button>
      </body>
    </html>
  );
}
