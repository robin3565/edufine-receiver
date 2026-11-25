import { lookupNames } from "@/lib/lookup";

export async function POST(request: Request) {
  const body = (await request.json()) as { names?: unknown };
  if (!Array.isArray(body.names) || body.names.some((name) => typeof name !== "string")) {
    return Response.json({ message: "기관명 목록이 필요합니다." }, { status: 400 });
  }
  if (body.names.length > 5000) {
    return Response.json({ message: "한 번에 5,000건까지 조회할 수 있습니다." }, { status: 400 });
  }

  return Response.json({ results: lookupNames(body.names) });
}
