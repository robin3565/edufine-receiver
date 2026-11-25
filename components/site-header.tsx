"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/", label: "수신처 일괄등록" },
  { href: "/guide", label: "이용방법" },
  { href: "/registration", label: "에듀파인 등록방법" },
];

export function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="bg-[#193653] text-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="shrink-0">
            <img
              src="/symbol2_01.png"
              alt="전남광주통합특별시교육청"
              width={44}
              height={44}
              className="h-11 w-11"
            />
          </Link>
          <div>
            <p className="text-xs tracking-wide text-blue-100">전남·광주 통합</p>
            <h1 className="text-xl font-semibold">
              <Link href="/">에듀파인 수신처 일괄등록</Link>
            </h1>
          </div>
        </div>
        <nav className="flex flex-wrap gap-2" aria-label="주요 메뉴">
          {LINKS.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded px-3 py-1.5 text-sm ${
                  active ? "bg-white text-[#193653]" : "text-blue-50 hover:bg-white/10"
                }`}
                aria-current={active ? "page" : undefined}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
