import { NextRequest, NextResponse } from "next/server";
import { generateImprovedNDA, generateNDAReport, generateNDATemplate } from "@/lib/nda-generator";

// 탭별 다운로드를 위한 새로운 생성 함수들
function generateSummaryReport(analysisData: any): string {
  let content = "=== 요약 보고서 ===\n\n";
  
  if (analysisData.overall_risk_assessment) {
    content += `전체 리스크 점수: ${analysisData.overall_risk_assessment.risk_score}/100\n`;
    content += `리스크 레벨: ${analysisData.overall_risk_assessment.risk_level}\n\n`;
  }
  
  if (analysisData.summary) {
    content += `요약: ${analysisData.summary}\n\n`;
  }
  
  if (analysisData.clause_analysis) {
    content += "=== 주요 조항 분석 ===\n";
    analysisData.clause_analysis.forEach((clause: any, idx: number) => {
      content += `${idx + 1}. ${clause.original_identifier || clause.clause_id}\n`;
      content += `   리스크 레벨: ${clause.risk_assessment.risk_level}\n`;
      content += `   리스크 점수: ${clause.risk_assessment.risk_score}\n`;
      content += `   설명: ${clause.risk_assessment.explanation}\n\n`;
    });
  }
  
  return content;
}

function generateRiskAnalysis(analysisData: any): string {
  let content = "=== 리스크 분석 ===\n\n";
  
  if (analysisData.clause_analysis) {
    analysisData.clause_analysis.forEach((clause: any, idx: number) => {
      content += `${idx + 1}. ${clause.original_identifier || clause.clause_id}\n`;
      content += `   원본 텍스트: ${clause.original_text}\n`;
      content += `   리스크 레벨: ${clause.risk_assessment.risk_level}\n`;
      content += `   리스크 점수: ${clause.risk_assessment.risk_score}\n`;
      content += `   리스크 분석: ${clause.risk_assessment.explanation.replace(/;/g, '\n')}\n\n`;
    });
  }
  
  return content;
}

function generateImprovementSuggestions(analysisData: any): string {
  let content = "=== 개선 제안 ===\n\n";
  
  if (analysisData.clause_analysis) {
    analysisData.clause_analysis.forEach((clause: any, idx: number) => {
      content += `${idx + 1}. ${clause.original_identifier || clause.clause_id}\n`;
      content += `   원본 텍스트: ${clause.original_text}\n`;
      if (clause.risk_assessment.recommendations && clause.risk_assessment.recommendations.length > 0) {
        content += `   개선 제안: ${clause.risk_assessment.recommendations[0]}\n`;
      }
      content += '\n';
    });
  }
  
  return content;
}

function generateContractDocument(analysisData: any): string {
  let content = "=== 분석 계약서 ===\n\n";
  
  if (analysisData.ocr_text) {
    content += analysisData.ocr_text;
  }
  
  if (analysisData.clause_analysis) {
    content += "\n\n=== 리스크 분석 요약 ===\n";
    analysisData.clause_analysis.forEach((clause: any, idx: number) => {
      const colors = getRiskLevelColor(clause.risk_assessment.risk_level);
      content += `${idx + 1}. [${clause.risk_assessment.risk_level}] ${clause.original_identifier || clause.clause_id}\n`;
      content += `   점수: ${clause.risk_assessment.risk_score}/100\n`;
      content += `   분석: ${clause.risk_assessment.explanation.replace(/;/g, '\n')}\n\n`;
    });
  }
  
  return content;
}

function getRiskLevelColor(riskLevel: string): string {
  switch (riskLevel?.toUpperCase()) {
    case 'HIGH': return '🔴';
    case 'MEDIUM': return '🟡';
    case 'LOW': return '🟢';
    default: return '⚪';
  }
}

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
      case "summary":
        content = generateSummaryReport(analysisData);
        filename = `요약_보고서_${id}.txt`;
        break;
      case "risk":
        content = generateRiskAnalysis(analysisData);
        filename = `리스크_분석_${id}.txt`;
        break;
      case "improvements":
        content = generateImprovementSuggestions(analysisData);
        filename = `개선_제안_${id}.txt`;
        break;
      case "contract":
        content = generateContractDocument(analysisData);
        filename = `분석_계약서_${id}.txt`;
        break;
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
        content = generateSummaryReport(analysisData);
        filename = `요약_보고서_${id}.txt`;
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