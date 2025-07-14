import { NextRequest, NextResponse } from "next/server";
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id || !globalThis.analysisStore || !globalThis.analysisStore[id]) {
    return NextResponse.json({ error: "분석 결과 없음" }, { status: 404 });
  }
  return NextResponse.json(globalThis.analysisStore[id]);
}
