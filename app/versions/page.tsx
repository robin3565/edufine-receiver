import { getCatalog } from "@/lib/catalog";
import { DATA_VERSIONS } from "@/lib/versions";

export default function VersionsPage() {
  const catalog = getCatalog();

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-6">
      <h2 className="text-lg font-semibold text-[#193653]">버전관리</h2>
      {/* <p className="mt-2 text-sm text-[#526277]">
        현재 데이터는 {catalog.version}입니다. {catalog.sourceFile}에서 가져왔고, 기관{" "}
        {catalog.institutions.length.toLocaleString("ko-KR")}곳, 별칭{" "}
        {catalog.aliases.length.toLocaleString("ko-KR")}건입니다.
      </p> */}
      <table className="mt-4 w-full border-collapse overflow-hidden rounded-lg bg-white text-sm">
        <thead>
          <tr className="bg-[#e8eef5] text-left text-[#193653]">
            <th className="px-3 py-2 font-medium">버전</th>
            <th className="px-3 py-2 font-medium">배포일</th>
            <th className="px-3 py-2 font-medium">변경사항</th>
          </tr>
        </thead>
        <tbody>
          {DATA_VERSIONS.map((item) => (
            <tr key={item.version} className="border-t border-[#e6edf4]">
              <td className="px-3 py-2">{item.version}</td>
              <td className="px-3 py-2">{item.date}</td>
              <td className="px-3 py-2">{item.note}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
