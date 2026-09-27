"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

function Icon({ active, children }: { active: boolean; children: React.ReactNode }) {
  return (
    <span className={active ? "text-brand-700" : "text-ink-subtle"}>{children}</span>
  );
}

export function Nav() {
  const pathname = usePathname();
  const item = (href: string, active: boolean) =>
    `flex flex-1 flex-col items-center justify-center gap-0.5 py-2 ${active ? "text-brand-700" : "text-ink-subtle"}`;

  return (
    <nav className="safe-bottom fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface">
      <div className="mx-auto flex max-w-md items-end">
        <Link href="/" className={item("/", pathname === "/")}>
          <Icon active={pathname === "/"}>
            <svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth={1.8}>
              <path d="M3 10.5 12 3l9 7.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M5 9.5V21h14V9.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Icon>
          <span className="text-[11px] font-medium">Home</span>
        </Link>

        <Link href="/notes" className={item("/notes", pathname.startsWith("/notes"))}>
          <Icon active={pathname.startsWith("/notes")}>
            <svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth={1.8}>
              <path d="M9 18V5l12-2v13" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="6" cy="18" r="3" />
              <circle cx="18" cy="16" r="3" />
            </svg>
          </Icon>
          <span className="text-[11px] font-medium">Notes</span>
        </Link>

        <Link href="/voice" className={item("/voice", pathname.startsWith("/voice"))}>
          <Icon active={pathname.startsWith("/voice")}>
            <svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth={1.8}>
              <rect x="9" y="2" width="6" height="12" rx="3" />
              <path d="M5 10a7 7 0 0 0 14 0" strokeLinecap="round" />
              <path d="M12 19v3" strokeLinecap="round" />
            </svg>
          </Icon>
          <span className="text-[11px] font-medium">Voice</span>
        </Link>

        <Link href="/calls" className={item("/calls", pathname.startsWith("/calls"))}>
          <Icon active={pathname.startsWith("/calls")}>
            <svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth={1.8}>
              <path d="M23 7l-7 5 7 5V7z" />
              <rect x="1" y="5" width="15" height="14" rx="2" />
            </svg>
          </Icon>
          <span className="text-[11px] font-medium">Calls</span>
        </Link>
      </div>
    </nav>
  );
}
