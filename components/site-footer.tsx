import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-[#d5deea] bg-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-4 text-sm text-[#526277] sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p>에듀파인 수신처 일괄등록 · 전남·광주 통합</p>
          <Link href="/versions" className="text-[11px] leading-4 text-[#8a97a8] hover:underline">
            버전관리
          </Link>
        </div>
        <p>
          문의: 담당자(글로컬미래교육과 김유선{" "}
          <a href="tel:061-260-0309" className="underline">
            ☎061-260-0309
          </a>
          )
        </p>
      </div>
    </footer>
  );
}
