export function DeviceFrame({ path, children }: { path: string; children: React.ReactNode }) {
  return (
    <div className="w-full max-w-md rounded-2xl border border-border bg-card p-4 shadow-2xl">
      <div className="mb-3 flex items-center gap-1.5">
        <span className="h-2.5 w-2.5 rounded-full bg-danger/60" />
        <span className="h-2.5 w-2.5 rounded-full bg-warning/60" />
        <span className="h-2.5 w-2.5 rounded-full bg-success/60" />
        <span className="ml-2 text-[10px] font-medium text-ink-muted">{path}</span>
      </div>
      {children}
    </div>
  );
}
