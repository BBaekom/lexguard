"use client"

import { ContractUploader } from "@/components/contract-uploader"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { useRouter } from "next/navigation"

export default function UploadPage() {
  const [isCreatingSample, setIsCreatingSample] = useState(false)
  const router = useRouter()

  const createSampleData = async () => {
    setIsCreatingSample(true)
    try {
      const response = await fetch('/api/analysis/sample', {
        method: 'POST',
      })
      const data = await response.json()
      if (data.analysisId) {
        router.push(`/analysis/${data.analysisId}`)
      }
    } catch (error) {
      console.error('샘플 데이터 생성 실패:', error)
    } finally {
      setIsCreatingSample(false)
    }
  }

  return (
    <div className="container py-12 mx-auto">
      <div className="max-w-3xl mx-auto w-full">
        <h1 className="text-3xl font-bold mb-6">계약서 업로드</h1>
        <p className="text-muted-foreground mb-8">PDF 또는 이미지 형태의 계약서를 업로드하여 AI 분석을 시작하세요.</p>
        
        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border">
          <h3 className="font-semibold mb-2">테스트용 샘플 데이터</h3>
          <p className="text-sm text-muted-foreground mb-3">
            실제 계약서를 업로드하기 전에 샘플 NDA 계약서로 기능을 테스트해보세요.
          </p>
          <Button 
            onClick={createSampleData}
            disabled={isCreatingSample}
            variant="outline"
            size="sm"
          >
            {isCreatingSample ? '생성 중...' : '샘플 NDA 분석 시작'}
          </Button>
        </div>
        
        <ContractUploader />
      </div>
    </div>
  )
}
