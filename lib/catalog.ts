import "server-only";
import catalogData from "@/data/catalog.json";
import type { Catalog, Institution } from "./types";

const catalog = catalogData as Catalog;

export function getCatalog(): Catalog {
  return catalog;
}

export function getInstitutionMap(): Map<string, Institution> {
  return new Map(
    getCatalog().institutions.map((institution) => [
      institution.niceCode,
      institution,
    ]),
  );
}
