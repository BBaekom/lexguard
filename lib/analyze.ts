import type { AnalysisResponse } from "@/types/analysis";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:8080";

/** OCR 텍스트를 FastAPI JSON 엔드포인트로 전송 */
export async function analyzeTextJSON(
  rawText: string,
  opts: { contract_type?: string; jurisdiction?: string; language?: string; contract_name?: string } = {}
): Promise<AnalysisResponse> {
  const body = {
    raw_text: rawText,
    contract_type: opts.contract_type ?? "NDA",
    jurisdiction:  opts.jurisdiction  ?? "KR",
    language:      opts.language      ?? "ko",
    contract_name: opts.contract_name ?? "",
  };
  const resp = await fetch(`${API_BASE}/api/v1/contracts/analyze`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!resp.ok) throw new Error(await resp.text());
  return await resp.json();
}
