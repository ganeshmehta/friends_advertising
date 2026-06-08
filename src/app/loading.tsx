export default function Loading() {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Loading"
      className="flex min-h-[60vh] items-center justify-center"
    >
      <span className="inline-flex h-10 w-10 animate-spin rounded-full border-2 border-[var(--neon-blue)] border-t-transparent" />
      <span className="sr-only">Loading…</span>
    </div>
  );
}
