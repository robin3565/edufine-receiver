export type Institution = {
  id: number;
  niceCode: string;
  name: string;
  officeCode: string;
  officeName: string;
  schoolType: string;
  establishment: string;
  educationKedi: string;
  districtKedi: string;
  highschoolKedi: string;
  region: string;
  oldOrgCode: string;
  newOrgCode: string;
  receiverType: string;
};

export type AliasRow = {
  code: string;
  sigun: string;
  officialName: string;
  names: string[];
  duplicate: boolean;
  crossRegionDuplicate: boolean;
};

export type Catalog = {
  sourceFile: string;
  importedAt: string;
  version: string;
  institutions: Institution[];
  aliases: AliasRow[];
  missingInData: { code: string; officialName: string; sigun: string }[];
};

export type LookupStatus =
  | "SUCCESS"
  | "NOT_FOUND"
  | "DUPLICATE"
  | "CODE_MISSING";

export type LookupResult = {
  input: string;
  status: LookupStatus;
  message: string;
  institution: Institution | null;
  candidates: Institution[];
};
