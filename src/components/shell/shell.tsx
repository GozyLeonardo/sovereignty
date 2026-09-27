"use client";

import { Nav } from "@/components/shell/nav";

export function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col bg-[var(--background)]">
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-line bg-surface px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="flex size-8 items-center justify-center rounded-lg bg-brand-600 text-sm font-bold text-white">
            S
          </span>
          <span className="text-sm font-semibold text-ink">Sovereignty</span>
        </div>
        <span className="text-xs font-medium text-ink-subtle">self-hosted voice</span>
      </header>
      <main className="flex-1 pb-24">{children}</main>
      <Nav />
    </div>
  );
}
