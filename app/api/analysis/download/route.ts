import { NextRequest, NextResponse } from "next/server";
import { generateImprovedNDA, generateNDAReport, generateNDATemplate } from "@/lib/nda-generator";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  const type = searchParams.get("type") || "improved"; // improved, report, template

  if (!id || !globalThis.analysisStore || !globalThis.analysisStore[id]) {
    return NextResponse.json({ error: "분석 결과 없음" }, { status: 404 });
  }

  const analysisData = globalThis.analysisStore[id];
  let content = "";
  let filename = "";

  try {
    switch (type) {
      case "improved":
        content = generateImprovedNDA(analysisData);
        filename = `개선된_비밀유지계약서_${id}.txt`;
        break;
      case "report":
        content = generateNDAReport(analysisData);
        filename = `비밀유지계약서_분석보고서_${id}.txt`;
        break;
      case "template":
        content = generateNDATemplate(analysisData);
        filename = `표준비밀유지계약서_템플릿_${id}.txt`;
        break;
      default:
        content = generateImprovedNDA(analysisData);
        filename = `개선된_비밀유지계약서_${id}.txt`;
    }

    // UTF-8 BOM을 추가하여 한글이 올바르게 표시되도록 함
    const bom = new Uint8Array([0xEF, 0xBB, 0xBF]);
    const contentBytes = new TextEncoder().encode(content);
    const fileContent = new Uint8Array(bom.length + contentBytes.length);
    fileContent.set(bom);
    fileContent.set(contentBytes, bom.length);

    return new NextResponse(fileContent, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Content-Disposition': `attachment; filename="${encodeURIComponent(filename)}"`,
      },
    });
  } catch (error) {
    console.error('다운로드 파일 생성 중 오류:', error);
    return NextResponse.json({ error: "파일 생성에 실패했습니다." }, { status: 500 });
  }
} 