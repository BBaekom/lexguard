"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, Clock, CheckCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import { ContractCategorySelector } from "./contract-category-selector"
import { FileUploader } from "./file-uploader"

// ---------- (로컬 타입: 백엔드 응답과 최소 호환) ----------
type Trigger = { start:number; end:number; text:string }
type RiskAssessment = {
  risk_level: "LOW"|"MEDIUM"|"HIGH"|"CRITICAL"
  risk_score: number
  risk_factors: string[]
  recommendations: string[]
  explanation?: string
  why?: string[]
  triggers?: Trigger[]
}
type ClauseItem = {
  clause_id: string
  original_identifier?: string
  original_text: string
  risk_assessment: RiskAssessment
  revised_text?: string
}
type AnalysisResponse = {
  contract_id: string
  contract_name?: string | null
  analysis_timestamp: string
  overall_risk_assessment: RiskAssessment
  clause_analysis: ClauseItem[]
  summary: string
  normalized: {
    contract_id: string
    clauses: { original_identifier?: string; start_index:number; end_index:number; clause_type:string }[]
  }
  contract_file_path?: string // 추가된 필드
}
// --------------------------------------------------------

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:8080"

export function ContractUploader() {
  const [isUploading, setIsUploading] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [fileType, setFileType] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string>("nda") // 기본값을 NDA로 설정
  const router = useRouter()

  // 화면 표시용 상태
  const [ocrText, setOcrText] = useState("")
  const [originalOcrText, setOriginalOcrText] = useState("") // 원본 텍스트 저장
  const [analysis, setAnalysis] = useState<AnalysisResponse | null>(null)
  const [err, setErr] = useState<string>("")
  const [selectedClause, setSelectedClause] = useState<any>(null)
  
  // 분석 진행 모달 상태
  const [showAnalysisModal, setShowAnalysisModal] = useState(false)
  const [analysisProgress, setAnalysisProgress] = useState(0)
  const [analysisStep, setAnalysisStep] = useState("")
  
  // OCR 완료 후 AI 분석 단계 구분
  const [ocrCompleted, setOcrCompleted] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  const handleUploadComplete = async (file: File) => {
    setIsUploading(false)
    setIsProcessing(true)
    setErr("")
    setAnalysis(null)
    setOcrText("")
    setOcrCompleted(false)
    
    // 분석 진행 모달 표시
    setShowAnalysisModal(true)
    setAnalysisProgress(0)
    setAnalysisStep("파일 업로드 완료")

    try {
      // 1) OCR 텍스트 추출
      setAnalysisStep("OCR 텍스트 추출 중...")
      setAnalysisProgress(15)
      
      const formData = new FormData()
      formData.append("contract", file)

      const response = await fetch("/api/ocr", { method: "POST", body: formData })
      if (!response.ok) {
        const errorResult = await response.json().catch(() => null)
        if (errorResult && (errorResult.message?.includes("not supported") || errorResult.code === "1901" || errorResult.type === "invalid_file")) {
          throw new Error("pdf 형식이 아닙니다")
        }
        throw new Error(`OCR 처리 실패: ${response.status}`)
      }

      const result = await response.json()
      if (result?.error) {
        if (result.error.includes("not supported") || result.code === "1901" || result.type === "invalid_file") {
          throw new Error("pdf 형식이 아닙니다")
        }
        throw new Error(result.error)
      }

      // 2) 특수문자 처리
      setAnalysisStep("특수문자 처리 중...")
      setAnalysisProgress(45)

      const rawText: string = String(result.text || "").trim()
      
      // 원본 텍스트 저장 (API에서 반환된 originalText 사용)
      const originalText = String(result.originalText || result.text || "").trim()
      setOriginalOcrText(originalText)
      
      // API에서 이미 특수문자 처리가 완료된 텍스트 사용
      const normalizedText = rawText
      
      localStorage.setItem("ocrText", normalizedText)
      setOcrText(normalizedText)
      
      setAnalysisStep("OCR 및 특수문자 처리 완료!")
      setAnalysisProgress(80)
      
      // OCR 완료 상태로 변경
      setOcrCompleted(true)
      
      // 분석 진행 모달 닫기
      setShowAnalysisModal(false)
      
    } catch (error) {
      console.error("OCR 처리 중 오류:", error)
      setAnalysisStep("오류 발생")
      if (error instanceof Error && error.message === "pdf 형식이 아닙니다") {
        setErr("PDF 형식만 업로드할 수 있습니다.")
        alert("pdf 형식이 아닙니다. PDF 파일만 업로드할 수 있습니다.")
      } else {
        setErr("처리 중 오류가 발생했습니다. 다시 시도해주세요.")
        alert("처리 중 오류가 발생했습니다. 다시 시도해주세요.")
      }
      setShowAnalysisModal(false)
    } finally {
      setIsProcessing(false)
    }
  }

  // AI 분석 시작 함수
  const handleStartAnalysis = async () => {
    if (!ocrText || !originalOcrText) {
      setErr("OCR 텍스트가 없습니다. 파일을 다시 업로드해주세요.")
      return
    }

    setIsAnalyzing(true)
    setShowAnalysisModal(true)
    setAnalysisProgress(0)
    setAnalysisStep("AI 계약서 분석 준비 중...")

    try {
      setAnalysisStep("AI 계약서 분석 중...")
      setAnalysisProgress(60)

      // 2) FastAPI 분석(JSON)
      const body = {
        raw_text: originalOcrText,
        contract_type: selectedCategory ?? "NDA",
        jurisdiction: "KR",
        language: "ko",
        contract_name: "uploaded_contract.pdf", // 파일명은 OCR 단계에서 이미 처리됨
      }
      
      const resp = await fetch(`${API_BASE}/api/v1/contracts/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      
      if (!resp.ok) {
        throw new Error(await resp.text())
      }
      
      setAnalysisStep("분석 결과 정리 중...")
      setAnalysisProgress(90)
      
      const ar: AnalysisResponse = await resp.json()
      setAnalysis(ar)
      
      setAnalysisStep("분석 완료!")
      setAnalysisProgress(100)
      
      // 분석 완료 모달 즉시 닫기
      setShowAnalysisModal(false)
      
      // 즉시 결과 페이지로 이동
      const analysisId = ar.contract_id || Math.random().toString(36).substring(2, 10)
      console.log('분석 완료, 결과 페이지로 이동:', analysisId)
      console.log('분석 데이터:', ar)
      localStorage.setItem(`analysis_${analysisId}`, JSON.stringify(ar))
      router.push(`/analysis/${analysisId}`)
      
    } catch (error) {
      console.error("AI 분석 처리 중 오류:", error)
      setAnalysisStep("오류 발생")
      setErr("AI 분석 중 오류가 발생했습니다. 다시 시도해주세요.")
      alert("AI 분석 중 오류가 발생했습니다. 다시 시도해주세요.")
      setShowAnalysisModal(false)
    } finally {
      setIsAnalyzing(false)
    }
  }

  // 조항 하이라이트 렌더 (리스크 레벨별 색상)
  const highlight = (text: string, clauses: any[]) => {
    if (!text || !clauses?.length) return <pre className="whitespace-pre-wrap">{text}</pre>
    
    // start_index 기준으로 정렬
    const sortedClauses = [...clauses].sort((a, b) => a.start_index - b.start_index)
    
    const out: React.ReactNode[] = []
    let pos = 0
    
    sortedClauses.forEach((clause, i) => {
      // 조항 앞 텍스트 추가
      if (clause.start_index > pos) {
        out.push(<span key={`t${i}`}>{text.slice(pos, clause.start_index)}</span>)
      }
      
      // 조항 텍스트를 리스크 레벨별 색상으로 하이라이트
      // normalized.clauses에는 risk_level이 없으므로 clause_analysis에서 찾아야 함
      const correspondingClause = analysis?.clause_analysis.find(c => c.clause_id === clause.clause_id)
      const riskLevel = correspondingClause?.risk_assessment?.risk_level || 'LOW'
      const riskScore = correspondingClause?.risk_assessment?.risk_score || 0
      const highlightClass = getRiskHighlightClass(riskLevel)
      
      out.push(
        <mark 
          key={`m${i}`} 
          className={`${highlightClass} px-1 rounded cursor-pointer hover:opacity-80 transition-opacity`}
          title={`${clause.original_identifier || clause.clause_id} - ${riskLevel} (${riskScore}점)`}
          onClick={() => {
            // 클릭 시 해당 조항 상세 정보 표시
            if (correspondingClause) {
              setSelectedClause(correspondingClause)
            }
          }}
        >
          {text.slice(clause.start_index, clause.end_index)}
        </mark>
      )
      
      pos = clause.end_index
    })
    
    // 남은 텍스트 추가
    if (pos < text.length) {
      out.push(<span key="tail">{text.slice(pos)}</span>)
    }
    
    return <pre className="whitespace-pre-wrap">{out}</pre>
  }

  // 리스크 레벨별 하이라이트 색상 클래스
  const getRiskHighlightClass = (riskLevel: string) => {
    switch (riskLevel) {
      case 'CRITICAL':
        return 'bg-purple-200 text-purple-800 border border-purple-300'
      case 'HIGH':
        return 'bg-red-200 text-red-900 border border-red-300'
      case 'MEDIUM':
        return 'bg-yellow-200 text-yellow-900 border border-yellow-300'
      case 'LOW':
        return 'bg-green-200 text-green-900 border border-green-300'
      default:
        return 'bg-gray-200 text-gray-900 border border-gray-300'
    }
  }

  return (
    <>
      <Card className="w-full">
      <CardContent className="pt-6">
        {/* 1. 계약 유형 선택 (선택사항) */}
        <div className="mb-4">
          <ContractCategorySelector onCategorySelect={setSelectedCategory} />
          <p className="text-sm text-muted-foreground mt-2">
            💡 계약 유형을 선택하면 더 정확한 분석이 가능합니다. (선택하지 않아도 분석 가능)
          </p>
        </div>

        {/* 2. 업로드 */}
        <h3 className="text-lg font-medium mb-4 mt-4">2. 계약서 업로드</h3>
        <FileUploader
          onUploadStart={() => { setIsUploading(true); setErr(""); setAnalysis(null); }}
          onUploadComplete={handleUploadComplete}
          disabled={ocrCompleted} // OCR 완료 후 업로드 비활성화
        />
        
        {ocrCompleted && (
          <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-2 text-blue-800">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm font-medium">OCR 추출이 완료되었습니다. 아래 AI 분석을 시작하세요.</span>
            </div>
          </div>
        )}

        {(isUploading || isProcessing) && (
          <div className="mt-6 flex flex-col items-center justify-center p-4 border rounded-lg bg-muted/50 w-full">
            <div className="flex items-center gap-2 mb-2">
              <Loader2 className="h-5 w-5 animate-spin text-rose-600" />
              <p className="font-medium">{isUploading ? "계약서 업로드 중..." : "계약서 처리 중..."}</p>
            </div>
            <p className="text-sm text-muted-foreground text-center">
              {isUploading
                ? "계약서를 업로드하고 있습니다. 잠시만 기다려주세요."
                : "계약서를 처리하고 있습니다. 잠시만 기다려주세요."}
            </p>
          </div>
        )}

        {/* 3. OCR 원문 미리보기 및 AI 분석 버튼 */}
        {ocrText && !isProcessing && !isAnalyzing && !analysis && (
          <div className="mt-6 space-y-4">
            <div className="p-4 border rounded-lg bg-white">
              <h4 className="font-semibold mb-2">OCR 추출 텍스트 (일부)</h4>
              <pre className="whitespace-pre-wrap text-sm max-h-48 overflow-auto">{ocrText.slice(0, 4000)}</pre>
              {ocrText.length > 4000 && (
                <p className="text-xs text-muted-foreground mt-2">
                  ... 전체 {ocrText.length.toLocaleString()}자 중 일부만 표시됩니다
                </p>
              )}
            </div>
            
            {/* AI 분석하기 버튼 */}
            <div className="flex justify-center">
              <Button
                onClick={handleStartAnalysis}
                disabled={isAnalyzing}
                className="px-8 py-3 text-lg font-semibold bg-rose-600 hover:bg-rose-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 border-rose-500"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin mr-2" />
                    AI 분석 중...
                  </>
                ) : (
                  <>
                    AI 분석하기
                  </>
                )}
              </Button>
            </div>
            
            <div className="text-center text-sm text-muted-foreground">
              OCR 추출이 완료되었습니다. 위 버튼을 클릭하여 AI 분석을 시작하세요.
            </div>
          </div>
        )}
        
        
        {/* AI 분석 진행 중 표시 */}
        {isAnalyzing && (
          <div className="mt-6 p-4 border rounded-lg bg-rose-50 border-rose-200">
            <div className="flex items-center justify-center gap-3">
              <span className="font-medium text-rose-800">AI 계약서 분석이 진행 중입니다...</span>
            </div>
            <p className="text-sm text-rose-600 text-center mt-2">
              분석이 완료되면 결과 페이지로 자동 이동됩니다.
            </p>
          </div>
        )}
        
        {/* AI 분석 완료 후 대기 표시 */}
        {analysis && !isProcessing && !isAnalyzing && (
          <div className="mt-6 p-4 border rounded-lg bg-green-50 border-green-200">
            <div className="flex items-center justify-center gap-3">
              <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center">
                <svg className="w-3 h-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className="font-medium text-green-800">AI 분석이 완료되었습니다!</span>
            </div>
            <p className="text-sm text-green-600 text-center mt-2">
              결과 페이지로 이동 중입니다. 잠시만 기다려주세요...
            </p>
            <div className="flex justify-center mt-3">
              <div className="w-6 h-6 border-2 border-green-300 border-t-green-600 rounded-full animate-spin"></div>
            </div>
          </div>
        )}

        {/* 4. 분석 결과 표시 (AI 분석 완료 후) - 제거됨 */}
        {/* AI 분석이 완료되면 바로 결과 페이지로 이동하므로 이 섹션은 표시하지 않음 */}

        {/* 선택된 조항 상세 정보 */}
        {selectedClause && (
          <div className="mt-6 p-4 border rounded-lg bg-blue-50 border-blue-200">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-lg text-blue-900">
                {selectedClause.original_identifier || selectedClause.clause_id} 상세 분석
              </h4>
              <button 
                onClick={() => setSelectedClause(null)}
                className="text-blue-600 hover:text-blue-800 text-sm"
              >
                ✕ 닫기
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="text-sm font-medium text-blue-800 mb-2">리스크 평가</div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-800">
                      {selectedClause.risk_assessment.risk_level}
                    </span>
                    <span className="text-sm">점수: {selectedClause.risk_assessment.risk_score}</span>
                  </div>
                  <div className="text-sm text-gray-700">
                    {selectedClause.risk_assessment.explanation}
                  </div>
                </div>
              </div>
              <div>
                <div className="text-sm font-medium text-blue-800 mb-2">개선 권고</div>
                <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                  {selectedClause.risk_assessment.recommendations?.slice(0, 3).map((rec: string, idx: number) => (
                    <li key={idx} className="text-xs">{rec}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* 에러 메시지 */}
        {err && !isProcessing && (
          <div className="mt-3 text-sm text-red-600">{err}</div>
        )}
      </CardContent>
    </Card>

    {/* 분석 진행 모달 */}
    {showAnalysisModal && (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-8 max-w-md w-full mx-4 shadow-xl">
          <div className="text-center">
            {analysisProgress < 100 ? (
              <>
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-rose-100 flex items-center justify-center">
                  <Loader2 className="h-8 w-8 text-rose-600 animate-spin" />
                </div>
                <h3 className="text-xl font-semibold mb-2">
                  {ocrCompleted ? "AI 계약서 분석 진행 중" : "OCR 텍스트 추출 중"}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  {analysisStep}
                </p>
                
                {/* 예상 시간 안내 */}
                <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                  <Clock className="h-4 w-4" />
                  <span>
                    {ocrCompleted ? "예상 소요 시간: 약 5분" : "예상 소요 시간: 약 1분"}
                  </span>
                </div>
                
                <p className="text-xs text-gray-400 mt-4">
                  {ocrCompleted ? "AI 분석이 완료될 때까지 잠시만 기다려주세요." : "OCR 처리가 완료될 때까지 잠시만 기다려주세요."}
                </p>
              </>
            ) : (
              <>
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-green-600">
                  {ocrCompleted ? "AI 분석 완료!" : "OCR 완료!"}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  {ocrCompleted ? "결과 페이지로 이동합니다..." : "AI 분석을 시작할 수 있습니다."}
                </p>
                {ocrCompleted ? (
                  <div className="w-16 h-16 mx-auto rounded-full bg-green-100 flex items-center justify-center">
                    <Loader2 className="h-6 h-6 text-green-600 animate-spin" />
                  </div>
                ) : (
                  <div className="w-16 h-16 mx-auto rounded-full bg-blue-100 flex items-center justify-center">
                    <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    )}
    </>
  )
}
