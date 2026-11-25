import ExcelJS from "exceljs";
import type { Institution } from "./types";

const HEADERS = [
  "수신그룹명",
  "수신그룹기호",
  "수신그룹등록교육청",
  "수신기관구분",
  "수신기관코드",
  "수신기관명",
  "수신그룹유형",
  "수신사용자ID",
  "수신사용자명",
] as const;

export async function createReceiverWorkbook(
  groupName: string,
  institutions: Institution[],
) {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("개인수신그룹관리");

  sheet.addRow([...HEADERS]);
  const header = sheet.getRow(1);
  header.eachCell((cell) => {
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF5F5F5F" },
    };
    cell.font = { color: { argb: "FFFFFFFF" }, bold: false };
    cell.alignment = { horizontal: "center", vertical: "middle" };
  });

  for (const institution of institutions) {
    const row = sheet.addRow([
      groupName,
      "",
      "",
      institution.receiverType,
      institution.niceCode,
      institution.name,
      "2",
      "",
      "",
    ]);
    row.getCell(5).numFmt = "@";
    row.eachCell((cell) => {
      cell.alignment = { horizontal: "center", vertical: "middle" };
    });
  }

  [22, 22, 22, 22, 22, 45, 22, 22, 22].forEach((width, index) => {
    sheet.getColumn(index + 1).width = width;
  });
  sheet.getColumn(5).numFmt = "@";
  sheet.views = [{ state: "frozen", ySplit: 1 }];

  return workbook.xlsx.writeBuffer();
}

export function receiverFileName(groupName: string) {
  const safe = groupName.replace(/[\\/:*?"<>|]/g, "_").trim() || "수신그룹";
  return `${safe}_수신처등록.xlsx`;
}
