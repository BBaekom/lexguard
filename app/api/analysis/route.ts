import { NextRequest, NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"
import { writeFile, mkdir } from "fs/promises"
import { join } from "path"
import { existsSync } from "fs"

// ✅ Edge에서 발생하는 크기/타임아웃/스트리밍 이슈 회피
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

declare global {
  // eslint-disable-next-line no-var
  var analysisStore: Record<string, any> | undefined;
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

const INDEX_UNIT = 'utf16' as const;

const getAnalysisPrompt = (contractText: string) => `
너는 계약서 분석을 전문으로 하는 변호사야. 아래 계약서 텍스트를 분석해서 다음과 같은 JSON 객체로만 결과를 반환해줘.

반드시 아래의 구조와 키를 지켜서 JSON으로만 응답해. 설명이나 인사말 없이 JSON만 반환해.

{
  "contractType": "계약서 유형(예: 근로계약서, 용역계약서 등)",
  "completedAt": "분석 완료 시각(YYYY-MM-DD HH:mm:ss)",
  "riskScore": 전체 리스크 점수(0~100, 숫자),
  "mainRisks": ["주요 리스크1", "주요 리스크2", ...],
  "clauses": [
    {
      "clause_number": "제1조",
      "clause_title": "조항 제목(없으면 빈 문자열)",
      "clause_content": "조항 전체 내용(최대 500자로 요약)",
      "risk_analysis": "이 조항의 리스크 상세 설명(최대 300자)",
      "risk_level": "높음|중간|낮음",
      "risk_score": 0~100(숫자),
      "improvement": {
        "original": "기존 조항 내용(최대 200자)",
        "suggested": "개선된 조항 내용(최대 200자)",
        "explanation": "개선 이유 및 설명(최대 500자)"
      }
    },
    ...
  ],
  "summary": {
    "riskScore": 전체 리스크 점수(0~100, 숫자),
    "mainRiskClauses": [
      { "title": "조항 제목", "score": 0~100(숫자) }
    ],
    "comment": "전체 요약 및 종합 의견(최대 500자)"
  }
}

주의사항:
- 긴 텍스트의 경우 주요 조항들만 분석해도 됨
- 각 필드의 길이 제한을 지켜서 응답해
- JSON 형식만 반환하고 다른 텍스트는 포함하지 마
- contractText 필드는 포함하지 마 (원본 텍스트는 별도로 처리됨)

분석할 계약서 텍스트:
---
${contractText}
---
`;

export async function POST(req: NextRequest) {
  try {
    console.log('계약서 분석 요청 받음');
    const { text, originalFile } = await req.json();
    
    if (!text) {
      return NextResponse.json({ error: '계약서 텍스트가 필요합니다.' }, { status: 400 });
    }

    // 원본 파일이 있으면 저장
    let contractFilePath = null;
    if (originalFile && originalFile.name && originalFile.content) {
      try {
        // uploads 디렉토리 생성
        const uploadsDir = join(process.cwd(), 'public', 'uploads');
        if (!existsSync(uploadsDir)) {
          await mkdir(uploadsDir, { recursive: true });
        }

        // 파일 저장
        const fileName = `contract_${Date.now()}_${originalFile.name}`;
        const filePath = join(uploadsDir, fileName);
        const fileContent = Buffer.from(originalFile.content, 'base64');
        
        await writeFile(filePath, fileContent);
        contractFilePath = `/uploads/${fileName}`;
        
        console.log('원본 파일 저장 완료:', contractFilePath);
      } catch (fileError) {
        console.error('파일 저장 중 오류:', fileError);
        // 파일 저장 실패해도 분석은 계속 진행
      }
    }

    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-pro',
      generationConfig: {
        responseMimeType: 'application/json',
      },
    });

    const prompt = getAnalysisPrompt(text);
    const result = await model.generateContent(prompt);
    const response = result.response;
    let analysisResult;
    try {
      analysisResult = JSON.parse(response.text());
      // 원본 텍스트와 파일 경로를 직접 추가
      analysisResult.contractText = text;
      if (contractFilePath) {
        analysisResult.contract_file_path = contractFilePath;
      }
    } catch (e) {
      return NextResponse.json({ error: 'Gemini 응답 파싱 실패', raw: response.text() }, { status: 500 });
    }

    // 임시로 메모리에 저장 (실제 서비스라면 DB에 저장)
    const analysisId = Math.random().toString(36).substring(2, 10);
    globalThis.analysisStore = globalThis.analysisStore || {};
    globalThis.analysisStore[analysisId] = analysisResult;

    return NextResponse.json({ analysisId });
  } catch (error) {
    console.error('계약서 분석 중 오류 발생:', error);
    return NextResponse.json({ error: '계약서 분석에 실패했습니다.' }, { status: 500 });
  }
}
