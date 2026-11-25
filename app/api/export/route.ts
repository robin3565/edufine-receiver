import { getInstitutionMap } from "@/lib/catalog";
import { createReceiverWorkbook, receiverFileName } from "@/lib/excel";
import { isReceiverType } from "@/lib/lookup";
import type { Institution } from "@/lib/types";

export async function POST(request: Request) {
  const body = (await request.json()) as {
    groupName?: unknown;
    niceCodes?: unknown;
  };
  const groupName = typeof body.groupName === "string" ? body.groupName.trim() : "";
  if (!groupName) {
    return Response.json({ message: "수신그룹명을 입력하세요." }, { status: 400 });
  }
  if (!Array.isArray(body.niceCodes) || body.niceCodes.some((code) => typeof code !== "string")) {
    return Response.json({ message: "등록할 기관이 없습니다." }, { status: 400 });
  }
  if (body.niceCodes.length === 0) {
    return Response.json({ message: "등록할 수신기관이 없습니다." }, { status: 400 });
  }

  const institutions = getInstitutionMap();
  const selected: Institution[] = [];
  for (const code of body.niceCodes) {
    const institution = institutions.get(code);
    if (!institution || !isReceiverType(institution.receiverType)) {
      return Response.json(
        { message: `${code} 기관의 수신기관구분을 확인하세요.` },
        { status: 400 },
      );
    }
    selected.push(institution);
  }

  const buffer = await createReceiverWorkbook(groupName, selected);
  const fileName = receiverFileName(groupName);

  return new Response(buffer, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(fileName)}`,
    },
  });
}
