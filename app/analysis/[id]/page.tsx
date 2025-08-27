"use client"

import { ContractAnalysisResult } from "@/components/contract-analysis-result"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Download, Share } from "lucide-react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { use } from "react"

interface AnalysisPageProps {
  params: Promise<{
    id: string
  }>
}

export default function AnalysisPage({ params }: AnalysisPageProps) {
  const resolvedParams = use(params)
  const searchParams = useSearchParams()
  const dataParam = searchParams.get('data')
  
  // 데이터 소스 확인: localStorage에서 분석 데이터 로드
  let analysisData = null
  
  console.log('결과 페이지 로드 - ID:', resolvedParams.id)
  
  // 1. localStorage에서 분석 데이터 확인
  try {
    const analysisKey = `analysis_${resolvedParams.id}`
    console.log('localStorage 키:', analysisKey)
    const storedData = localStorage.getItem(analysisKey)
    console.log('저장된 데이터:', storedData ? '있음' : '없음')
    if (storedData) {
      analysisData = JSON.parse(storedData)
      console.log('파싱된 분석 데이터:', analysisData)
    }
  } catch (error) {
    console.error('localStorage 파싱 오류:', error)
  }
  
  // 2. 미리보기 데이터 확인 (preview-sample인 경우)
  if (!analysisData && resolvedParams.id === 'preview-sample') {
    try {
      const previewData = localStorage.getItem("previewAnalysisData")
      console.log('미리보기 데이터:', previewData ? '있음' : '없음')
      if (previewData) {
        analysisData = JSON.parse(previewData)
        console.log('파싱된 미리보기 데이터:', analysisData)
      }
    } catch (error) {
      console.error('localStorage 파싱 오류:', error)
    }
  }
  
  console.log('최종 분석 데이터:', analysisData)

  return (
    <div className="container py-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link href="/upload">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">
            분석 결과
          </h1>
        </div>

      </div>

        {analysisData ? (
          <ContractAnalysisResult 
            contractId={resolvedParams.id} 
            analysisData={analysisData}
            defaultTab="summary"
          />
        ) : (
          <div className="text-center py-12">
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">분석 데이터를 찾을 수 없습니다</h3>
              <p className="text-muted-foreground mb-4">
                {resolvedParams.id === 'preview-sample' 
                  ? '미리보기 데이터가 로드되지 않았습니다. 다시 시도해주세요.'
                  : '요청하신 분석 결과를 찾을 수 없습니다. 분석이 완료되지 않았거나 세션이 만료되었을 수 있습니다.'
                }
              </p>
              <div className="space-y-2">
                <Button asChild className="w-full">
                  <Link href="/upload">새로운 분석 시작</Link>
                </Button>
                <Button variant="outline" asChild className="w-full">
                  <Link href="/">홈으로 돌아가기</Link>
                </Button>
              </div>
            </div>
          </div>
        )}
    </div>
  )
}
