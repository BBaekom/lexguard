"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { FileUploader } from "./file-uploader"
import { Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { ContractCategorySelector } from "./contract-category-selector"

export function ContractUploader() {
  const [isUploading, setIsUploading] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [fileType, setFileType] = useState<string | null>(null)
  const router = useRouter()
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  const handleUploadComplete = async (file: File) => {
    setIsUploading(false)
    setIsProcessing(true)

    try {
      // FormData 생성
      const formData = new FormData()
      formData.append("contract", file)

      // OCR API 호출
      const response = await fetch("/api/ocr", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const errorResult = await response.json().catch(() => null)
        if (errorResult && (errorResult.message?.includes('not supported') || errorResult.code === '1901' || errorResult.type === 'invalid_file')) {
          throw new Error('pdf 형식이 아닙니다')
        }
        throw new Error(`OCR 처리 실패: ${response.status}`)
      }

      const result = await response.json()
      
      if (result.error) {
        if (result.error.includes('not supported') || result.code === '1901' || result.type === 'invalid_file') {
          throw new Error('pdf 형식이 아닙니다')
        }
        throw new Error(result.error)
      }

      // OCR 결과를 localStorage에 저장
      localStorage.setItem("ocrText", result.text)

      // OCR 결과 페이지로 이동
      const encodedFileName = encodeURIComponent(file.name)
      router.push(`/ocr-result?fileName=${encodedFileName}`)
      
    } catch (error) {
      console.error("OCR 처리 중 오류:", error)
      setIsProcessing(false)
      // 에러 처리 - 사용자에게 알림을 표시하거나 에러 페이지로 이동
      if (error instanceof Error && error.message === 'pdf 형식이 아닙니다') {
        alert('pdf 형식이 아닙니다. PDF 파일만 업로드할 수 있습니다.')
      } else {
        alert("OCR 처리 중 오류가 발생했습니다. 다시 시도해주세요.")
      }
    }
  }

  return (
    <Card className="w-full">
      <CardContent className="pt-6">
        <ContractCategorySelector onCategorySelect={setSelectedCategory} />

        <h3 className="text-lg font-medium mb-4">2. 계약서 업로드</h3>
        <FileUploader
          onUploadStart={() => setIsUploading(true)}
          onUploadComplete={handleUploadComplete}
          disabled={!selectedCategory}
        />

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
      </CardContent>
    </Card>
  )
}
