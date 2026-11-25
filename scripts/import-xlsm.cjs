const fs = require("fs");
const path = require("path");
const XLSX = require("xlsx");

const defaultFile = path.resolve(
  __dirname,
  "../../2. 에듀파인 수신처 일괄등록 프로그램(개발_통합버전).xlsm",
);
const sourcePath = process.argv[2] ? path.resolve(process.argv[2]) : defaultFile;

function text(value) {
  if (value === null || value === undefined) return "";
  return String(value).trim();
}

const workbook = XLSX.readFile(sourcePath, { cellDates: false });
const dataRows = XLSX.utils.sheet_to_json(workbook.Sheets.DATA, { defval: "" });
const aliasRows = XLSX.utils.sheet_to_json(workbook.Sheets.ALIAS, { defval: "" });

const institutions = dataRows.map((row, index) => ({
  id: index + 1,
  niceCode: text(row["나이스코드"]),
  name: text(row["기관명"]),
  officeCode: text(row["(구)교육지원청코드"]),
  officeName: text(row["교육지원청"]),
  schoolType: text(row["학교급"]),
  establishment: text(row["설립구분"]),
  educationKedi: text(row["교육청KEDI"]),
  districtKedi: text(row["시군KEDI"]),
  highschoolKedi: text(row["고등학교유형KEDI"]),
  region: text(row["지역"]),
  oldOrgCode: text(row["(구)기관코드"]),
  newOrgCode: text(row["(신)기관코드"]),
  receiverType: text(row["수신기관구분"]),
}));

const aliases = aliasRows.map((row) => ({
  code: text(row["학교코드"]),
  sigun: text(row["시군"]),
  officialName: text(row["학교(정식명칭)"]),
  names: [
    text(row["학교(정식명칭)"]),
    text(row["학교명1(지역O)"]),
    text(row["학교명2(지역O,~학교생략)"]),
    text(row["학교명3(~학교생략)"]),
    text(row["학교명4(최대간소화)"]),
  ],
  duplicate: text(row["중복여부"]) === "O",
  crossRegionDuplicate: text(row["광주전남중복"]) === "O",
}));

const codes = new Set(institutions.map((item) => item.niceCode));
const missingInData = aliases
  .filter((row) => row.code && !codes.has(row.code))
  .map((row) => ({
    code: row.code,
    officialName: row.officialName,
    sigun: row.sigun,
  }));

const catalog = {
  sourceFile: path.basename(sourcePath),
  importedAt: new Date().toISOString(),
  version: "통합 Ver. 2.0",
  institutions,
  aliases,
  missingInData,
};

const outDir = path.resolve(__dirname, "../data");
fs.mkdirSync(outDir, { recursive: true });
const outFile = path.join(outDir, "catalog.json");
fs.writeFileSync(outFile, JSON.stringify(catalog));

console.log(
  JSON.stringify(
    {
      institutions: institutions.length,
      aliases: aliases.length,
      missingInData: missingInData.length,
      bytes: fs.statSync(outFile).size,
    },
    null,
    2,
  ),
);
