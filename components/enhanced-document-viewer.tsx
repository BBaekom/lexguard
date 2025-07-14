"use client"

import { useState, useEffect } from "react"
import { EnhancedPDFViewer } from "./enhanced-pdf-viewer"
import { EnhancedImageViewer } from "./enhanced-image-viewer"
import { Loader2 } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

interface RiskHighlight {
  id: number
  page?: number
  position: {
    top: number
    left: number
    width: number
    height: number
  }
  riskLevel: "high" | "medium" | "low"
  message: string
  suggestion?: string
  clause?: string
}

interface EnhancedDocumentViewerProps {
  fileUrl: string
  fileType: string
  riskHighlights?: RiskHighlight[]
}

export function EnhancedDocumentViewer({ fileUrl, fileType, riskHighlights = [] }: EnhancedDocumentViewerProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [selectedHighlight, setSelectedHighlight] = useState<RiskHighlight | null>(null)

  // 기본 파일 URL 설정
  const defaultPdfUrl = "/sample-contract.pdf"
  const defaultImageUrl = "/sample-contract.jpg"

  // 파일 유형에 따라 기본 URL 설정
  const validFileUrl =
    fileUrl && fileUrl !== "" ? fileUrl : fileType.toLowerCase() === "pdf" ? defaultPdfUrl : defaultImageUrl

  const handleHighlightClick = (highlight: RiskHighlight) => {
    setSelectedHighlight(highlight)
  }

  const isPDF = fileType.toLowerCase() === "pdf"
  const isImage = /^(jpg|jpeg|png|gif|webp)$/i.test(fileType.toLowerCase())

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1000)
    return () => clearTimeout(timer)
  }, [])

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[600px] border rounded-lg bg-muted/30">
        <Loader2 className="h-8 w-8 animate-spin text-rose-600 mb-2" />
        <p className="text-muted-foreground">문서 로딩 중...</p>
      </div>
    )
  }

  return (
    <>
      {isPDF && (
        <EnhancedPDFViewer
          pdfUrl={validFileUrl}
          riskHighlights={riskHighlights}
          onHighlightClick={handleHighlightClick}
        />
      )}

      {isImage && (
        <EnhancedImageViewer
          imageUrl={validFileUrl}
          riskHighlights={riskHighlights}
          onHighlightClick={handleHighlightClick}
        />
      )}

      {!isPDF && !isImage && (
        <div className="flex flex-col items-center justify-center h-[600px] border rounded-lg bg-muted/30">
          <p className="text-muted-foreground">지원되지 않는 파일 형식입니다. PDF, JPG, PNG 파일만 지원합니다.</p>
        </div>
      )}

      {/* 리스크 상세 정보 다이얼로그 */}
      <Dialog open={!!selectedHighlight} onOpenChange={(open) => !open && setSelectedHighlight(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{selectedHighlight?.clause || "리스크 상세 정보"}</DialogTitle>
            <DialogDescription>
              <span
                className={`inline-block px-2 py-1 rounded-full text-xs font-medium mt-2 
                ${
                  selectedHighlight?.riskLevel === "high"
                    ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                    : selectedHighlight?.riskLevel === "medium"
                      ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300"
                      : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
                }`}
              >
                {selectedHighlight?.riskLevel === "high"
                  ? "높음"
                  : selectedHighlight?.riskLevel === "medium"
                    ? "중간"
                    : "낮음"}
              </span>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium mb-1">문제점</h4>
              <p className="text-sm text-muted-foreground">{selectedHighlight?.message}</p>
            </div>

            {selectedHighlight?.suggestion && (
              <div>
                <h4 className="text-sm font-medium mb-1">개선 제안</h4>
                <p className="text-sm text-muted-foreground">{selectedHighlight.suggestion}</p>
              </div>
            )}

            <div className="flex justify-end">
              <Button className="bg-rose-600 hover:bg-rose-700" onClick={() => setSelectedHighlight(null)}>
                확인
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
