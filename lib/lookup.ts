import { getCatalog, getInstitutionMap } from "./catalog";
import type { Institution, LookupResult } from "./types";

let hitsByName: Map<string, string[]> | null = null;

function aliasIndex() {
  if (hitsByName) return hitsByName;
  const index = new Map<string, string[]>();
  for (const row of getCatalog().aliases) {
    for (const name of row.names) {
      if (!name) continue;
      const hits = index.get(name) ?? [];
      hits.push(row.code);
      index.set(name, hits);
    }
  }
  hitsByName = index;
  return index;
}

function uniqueInstitutions(codes: string[], institutions: Map<string, Institution>) {
  const seen = new Set<string>();
  const result: Institution[] = [];
  for (const code of codes) {
    if (seen.has(code)) continue;
    seen.add(code);
    const institution = institutions.get(code);
    if (institution) result.push(institution);
  }
  return result;
}

export function lookupName(rawInput: string): LookupResult {
  const input = rawInput.trim();
  if (!input) {
    return {
      input,
      status: "NOT_FOUND",
      message: "데이터 없음",
      institution: null,
      candidates: [],
    };
  }

  const hits = aliasIndex().get(input) ?? [];
  if (hits.length === 0) {
    return {
      input,
      status: "NOT_FOUND",
      message: "데이터 없음",
      institution: null,
      candidates: [],
    };
  }

  const matches = uniqueInstitutions(
    hits,
    getInstitutionMap(),
  );
  if (matches.length === 0) {
    return {
      input,
      status: "CODE_MISSING",
      message: "기관코드를 확인하세요.",
      institution: null,
      candidates: [],
    };
  }

  // 같은 문자열이 기관 하나만 가리키면 지역이 포함된 이름으로 본다.
  // 나주이화유치원은 정식명칭 칸에 있어도 나주 기관 하나이므로 정상이다.
  // 이화유치원처럼 여러 기관의 짧은 이름이면 중복이다.
  if (matches.length === 1) {
    return {
      input,
      status: "SUCCESS",
      message: "",
      institution: matches[0],
      candidates: [],
    };
  }

  return {
    input,
    status: "DUPLICATE",
    message: "지역을 선택해주세요.",
    institution: null,
    candidates: matches,
  };
}

export function lookupNames(names: string[]) {
  return names.map((name) => lookupName(name));
}

export function isReceiverType(value: string) {
  return value === "NS" || value === "MG";
}
