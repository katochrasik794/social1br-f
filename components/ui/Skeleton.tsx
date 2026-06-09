export default function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-lg bg-[var(--app-surface-muted)] ${className}`}
      aria-hidden
    />
  );
}
