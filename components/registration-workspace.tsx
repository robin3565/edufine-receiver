"use client";

import { useMemo, useRef, useState } from "react";
import type { Institution, LookupResult } from "@/lib/types";

type DraftRow = {
  key: string;
  input: string;
  queried: string | null;
  result: LookupResult | null;
  selectedCode: string;
};

const EMPTY_FILTER = {
  region: "",
  officeName: "",
  schoolType: "",
  establishment: "",
};

function newKey() {
  return crypto.randomUUID();
}

function resolvedInstitution(row: DraftRow): Institution | null {
  if (!row.result) return null;
  if (row.result.status === "SUCCESS") return row.result.institution;
  if (row.result.status === "DUPLICATE" && row.selectedCode) {
    return (
      row.result.candidates.find((item) => item.niceCode === row.selectedCode) ?? null
    );
  }
  return null;
}

export function RegistrationWorkspace() {
  const [groupName, setGroupName] = useState("");
  const [draft, setDraft] = useState("");
  const [rows, setRows] = useState<DraftRow[]>([]);
  const [filters, setFilters] = useState(EMPTY_FILTER);
  const [busy, setBusy] = useState<"lookup" | "export" | null>(null);
  const [notice, setNotice] = useState("");
  const [confirmingClear, setConfirmingClear] = useState(false);
  const [missingGroupName, setMissingGroupName] = useState(false);
  const queriedRef = useRef(new Map<string, string>());

  const summary = useMemo(() => {
    let success = 0;
    let errors = 0;
    const codeCount = new Map<string, number>();
    for (const row of rows) {
      const institution = resolvedInstitution(row);
      if (institution) {
        success += 1;
        codeCount.set(institution.niceCode, (codeCount.get(institution.niceCode) ?? 0) + 1);
      } else if (row.result) {
        errors += 1;
      }
    }
    const duplicated = [...codeCount.values()].filter((count) => count > 1).length;
    return { success, errors, duplicated, total: rows.length };
  }, [rows]);

  const visibleRows = rows.filter((row) => {
    const institution = resolvedInstitution(row);
    if (!institution) return true;
    if (filters.region && institution.region !== filters.region) return false;
    if (filters.officeName && institution.officeName !== filters.officeName) return false;
    if (filters.schoolType && institution.schoolType !== filters.schoolType) return false;
    if (filters.establishment && institution.establishment !== filters.establishment) return false;
    return true;
  });

  const filterOptions = useMemo(() => {
    const values = {
      region: new Set<string>(),
      officeName: new Set<string>(),
      schoolType: new Set<string>(),
      establishment: new Set<string>(),
    };
    for (const row of rows) {
      const institution = resolvedInstitution(row);
      if (!institution) continue;
      values.region.add(institution.region);
      values.officeName.add(institution.officeName);
      values.schoolType.add(institution.schoolType);
      values.establishment.add(institution.establishment);
    }
    return {
      region: [...values.region].sort(),
      officeName: [...values.officeName].sort(),
      schoolType: [...values.schoolType].sort(),
      establishment: [...values.establishment].sort(),
    };
  }, [rows]);

  async function lookupInputs(inputs: { key: string; input: string }[]) {
    const response = await fetch("/api/lookup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ names: inputs.map((item) => item.input) }),
    });
    const payload = (await response.json()) as { results?: LookupResult[]; message?: string };
    if (!response.ok || !payload.results) {
      throw new Error(payload.message ?? "조회에 실패했습니다.");
    }
    return payload.results;
  }

  async function runLookup() {
    const names = draft
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);
    if (names.length === 0) {
      setNotice("입력된 내용이 없습니다");
      return;
    }
    setBusy("lookup");
    setNotice("");
    try {
      const seeded = names.map((input) => ({ key: newKey(), input }));
      const results = await lookupInputs(seeded);
      queriedRef.current = new Map(seeded.map((row) => [row.key, row.input]));
      setRows(
        seeded.map((row, index) => ({
          ...row,
          queried: row.input,
          result: results[index] ?? null,
          selectedCode: "",
        })),
      );
      setFilters(EMPTY_FILTER);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "조회에 실패했습니다.");
    } finally {
      setBusy(null);
    }
  }

  async function requery(key: string, rawInput: string) {
    const input = rawInput.trim();
    if (!input) {
      queriedRef.current.delete(key);
      const nextRows = rows.filter((item) => item.key !== key);
      setRows(nextRows);
      setDraft(nextRows.map((item) => item.input).join("\n"));
      return;
    }
    if (queriedRef.current.get(key) === input) return;
    setBusy("lookup");
    setNotice("");
    try {
      const [result] = await lookupInputs([{ key, input }]);
      queriedRef.current.set(key, input);
      const nextRows = rows.map((item) =>
        item.key === key ? { ...item, input, queried: input, result, selectedCode: "" } : item,
      );
      setRows(nextRows);
      setDraft(nextRows.map((item) => item.input).join("\n"));
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "조회에 실패했습니다.");
    } finally {
      setBusy(null);
    }
  }

  async function exportFile() {
    const group = groupName.trim();
    if (!group) {
      setMissingGroupName(true);
      return;
    }
    const unresolved = rows.filter((row) => !resolvedInstitution(row)).length;
    if (unresolved > 0) {
      setNotice(`오류 데이터가 ${unresolved}건 있습니다. 수정 후 저장 가능합니다.`);
      return;
    }
    const niceCodes = rows
      .map((row) => resolvedInstitution(row)?.niceCode)
      .filter((code): code is string => Boolean(code));
    if (niceCodes.length === 0) {
      setNotice("등록할 수신기관이 없습니다.");
      return;
    }

    setBusy("export");
    setNotice("");
    try {
      const response = await fetch("/api/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ groupName: group, niceCodes }),
      });
      if (!response.ok) {
        const payload = (await response.json()) as { message?: string };
        throw new Error(payload.message ?? "파일을 만들지 못했습니다.");
      }
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      const encoded = response.headers
        .get("Content-Disposition")
        ?.match(/filename\*=UTF-8''([^;]+)/)?.[1];
      anchor.href = url;
      anchor.download = encoded ? decodeURIComponent(encoded) : "수신처등록.xlsx";
      anchor.click();
      URL.revokeObjectURL(url);
      setNotice(`총 ${niceCodes.length}개 수신기관의 등록 파일을 생성했습니다.`);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "파일을 만들지 못했습니다.");
    } finally {
      setBusy(null);
    }
  }

  function clearAll() {
    setDraft("");
    queriedRef.current = new Map();
    setRows([]);
    setFilters(EMPTY_FILTER);
    setNotice("");
    setConfirmingClear(false);
  }

  return (
    <div className="space-y-5">
      <section className="rounded-lg border border-[#d5deea] bg-white p-4">
        <label className="block text-sm font-medium text-[#193653]" htmlFor="group-name">
          수신그룹명
        </label>
        <input
          id="group-name"
          value={groupName}
          onChange={(event) => setGroupName(event.target.value)}
          placeholder="예) 2026년 OO 대상 학교"
          className="mt-2 w-full rounded border border-[#c5d0de] px-3 py-2"
        />
      </section>

      <section className="rounded-lg border border-[#d5deea] bg-white p-4">
        <label className="block text-sm font-medium text-[#193653]" htmlFor="names">
          학교(기관)명
        </label>
        <p className="mt-1 text-sm text-[#526277]">
          한 줄에 하나씩 붙여넣으세요. 정식 명칭과 약칭을 그대로 조회합니다.
        </p>
        <textarea
          id="names"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          rows={8}
          placeholder={"예)\n미래시민교육과\n글로컬미래교육과\n나주교육지원청\n광주동신여자고등학교\n순천팔마고등학교\n수완초\n창평중"}
          className="mt-2 w-full rounded border border-[#c5d0de] px-3 py-2 font-mono text-sm"
        />
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={runLookup}
            disabled={busy !== null}
            className="rounded bg-[#193653] px-4 py-2 text-sm text-white disabled:opacity-60"
          >
            {busy === "lookup" ? "조회 중" : "조회"}
          </button>
          <button
            type="button"
            onClick={() => setConfirmingClear(true)}
            disabled={!draft.trim() && rows.length === 0}
            className="rounded border border-[#c5d0de] px-4 py-2 text-sm disabled:opacity-60"
          >
            내용 삭제
          </button>
          <button
            type="button"
            onClick={exportFile}
            disabled={busy !== null || summary.success === 0}
            className="rounded bg-[#1f6b4a] px-4 py-2 text-sm text-white disabled:opacity-60"
          >
            {busy === "export" ? "만드는 중" : "등록 파일 만들기"}
          </button>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-4">
        {(
          [
            ["입력", summary.total],
            ["정상", summary.success],
            ["오류", summary.errors],
            ["중복", summary.duplicated],
          ] as const
        ).map(([label, value]) => (
          <div key={label} className="rounded-lg border border-[#d5deea] bg-white px-4 py-3">
            <p className="text-sm text-[#526277]">{label}</p>
            <p
              className={`text-2xl font-semibold ${
                label === "오류" && value > 0
                  ? "text-[#c62828]"
                  : label === "중복" && value > 0
                    ? "text-[#8a5a00]"
                    : "text-[#193653]"
              }`}
            >
              {value}
            </p>
          </div>
        ))}
      </section>

      {notice ? (
        <p className="rounded border border-[#d5deea] bg-white px-4 py-3 text-sm" role="status">
          {notice}
        </p>
      ) : null}

      {rows.length > 0 ? (
        <section className="rounded-lg border border-[#d5deea] bg-white p-4">
          <div className="grid gap-3 md:grid-cols-4">
            <FilterSelect
              label="지역"
              value={filters.region}
              options={filterOptions.region}
              onChange={(region) => setFilters((current) => ({ ...current, region }))}
            />
            <FilterSelect
              label="설립구분"
              value={filters.establishment}
              options={filterOptions.establishment}
              onChange={(establishment) =>
                setFilters((current) => ({ ...current, establishment }))
              }
            />
            <FilterSelect
              label="학교급"
              value={filters.schoolType}
              options={filterOptions.schoolType}
              onChange={(schoolType) => setFilters((current) => ({ ...current, schoolType }))}
            />
            <FilterSelect
              label="교육지원청"
              value={filters.officeName}
              options={filterOptions.officeName}
              onChange={(officeName) => setFilters((current) => ({ ...current, officeName }))}
            />
          </div>
          {/* <p className="mt-3 text-sm text-[#526277]">
            화면 {visibleRows.length}건 / 등록 대상 {summary.success}건. 필터는 화면에서만 적용되고,
            파일에는 조회에 성공한 기관이 모두 들어갑니다.
          </p> */}
          <div className="mt-3 overflow-x-auto">
            <table className="min-w-[880px] w-full border-collapse text-sm">
              <thead>
                <tr className="bg-[#e8eef5] text-left text-[#193653]">
                  {[
                    "입력 학교(기관)명",
                    "학교(기관명)",
                    "설립",
                    "학교/기관",
                    "나이스코드",
                    "지원청",
                    "비고",
                  ].map((heading) => (
                    <th key={heading} className="border-b border-[#d5deea] px-2 py-2 font-medium">
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {visibleRows.map((row) => {
                  const institution = resolvedInstitution(row);
                  const repeated =
                    institution !== null &&
                    rows.filter((item) => resolvedInstitution(item)?.niceCode === institution.niceCode)
                      .length > 1;
                  return (
                    <tr key={row.key} className="align-top">
                      <td className="border-b border-[#e6edf4] px-2 py-2">
                        <input
                          aria-label="입력 학교(기관)명"
                          value={row.input}
                          onChange={(event) => {
                            queriedRef.current.delete(row.key);
                            const value = event.target.value;
                            const nextRows = rows.map((item) =>
                              item.key === row.key
                                ? {
                                    ...item,
                                    input: value,
                                    queried: null,
                                    result: null,
                                    selectedCode: "",
                                  }
                                : item,
                            );
                            setRows(nextRows);
                            setDraft(nextRows.map((item) => item.input).join("\n"));
                          }}
                          onBlur={(event) => requery(row.key, event.currentTarget.value)}
                          className="w-40 rounded border border-[#c5d0de] px-2 py-1"
                        />
                      </td>
                      <td className="border-b border-[#e6edf4] px-2 py-2">
                        {row.result?.status === "DUPLICATE" ? (
                          <select
                            aria-label={`${row.input} 기관 선택`}
                            value={row.selectedCode}
                            onChange={(event) =>
                              setRows((current) =>
                                current.map((item) =>
                                  item.key === row.key
                                    ? { ...item, selectedCode: event.target.value }
                                    : item,
                                ),
                              )
                            }
                            className="w-64 rounded border border-[#c5d0de] px-2 py-1"
                          >
                            <option value="">학교(기관)을 선택하세요</option>
                            {row.result.candidates.map((candidate) => (
                              <option key={candidate.niceCode} value={candidate.niceCode}>
                                {(candidate.districtKedi || candidate.region) + " · " + candidate.name}
                              </option>
                            ))}
                          </select>
                        ) : (
                          institution?.name ?? ""
                        )}
                      </td>
                      <td className="border-b border-[#e6edf4] px-2 py-2">{institution?.establishment ?? ""}</td>
                      <td className="border-b border-[#e6edf4] px-2 py-2">{institution?.schoolType ?? ""}</td>
                      <td className="border-b border-[#e6edf4] px-2 py-2">{institution?.niceCode ?? ""}</td>
                      <td className="border-b border-[#e6edf4] px-2 py-2">{institution?.officeName ?? ""}</td>
                      <td
                        className={`border-b border-[#e6edf4] px-2 py-2 ${
                          institution ? "text-[#8a5a00]" : "text-[#9b2c2c]"
                        }`}
                      >
                        {institution
                          ? repeated
                            ? "동일 기관이 목록에 두 번 이상 있습니다."
                            : ""
                          : row.result?.message ?? (row.queried === null ? "다시 조회됩니다." : "")}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      {missingGroupName ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
          role="presentation"
        >
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="group-name-alert"
            className="w-full max-w-sm rounded-lg bg-white p-5 shadow-lg"
          >
            <p id="group-name-alert" className="text-base font-medium text-[#193653]">
              수신그룹명을 입력하세요.
            </p>
            <div className="mt-4 flex justify-end">
              <button
                type="button"
                onClick={() => {
                  setMissingGroupName(false);
                  document.getElementById("group-name")?.focus();
                }}
                className="rounded bg-[#193653] px-4 py-2 text-sm text-white"
              >
                확인
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {confirmingClear ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
          role="presentation"
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="clear-confirm-title"
            className="w-full max-w-sm rounded-lg bg-white p-5 shadow-lg"
          >
            <p id="clear-confirm-title" className="text-base font-medium text-[#193653]">
              삭제하시겠습니까
            </p>
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setConfirmingClear(false)}
                className="rounded border border-[#c5d0de] px-4 py-2 text-sm"
              >
                취소
              </button>
              <button
                type="button"
                onClick={clearAll}
                className="rounded bg-[#193653] px-4 py-2 text-sm text-white"
              >
                삭제
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function FilterSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <label className="block text-sm">
      <span className="text-[#526277]">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1 w-full rounded border border-[#c5d0de] px-2 py-1.5"
      >
        <option value="">전체</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}
