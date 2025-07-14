"use client"

import { useState, useEffect, useRef } from "react"
import { Document, Page, pdfjs } from "react-pdf"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Loader2, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, RotateCw } from "lucide-react"
import "react-pdf/dist/Page/AnnotationLayer.css"
import "react-pdf/dist/Page/TextLayer.css"

// PDF.js 워커 설정
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`

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
}

interface EnhancedPDFViewerProps {
  pdfUrl: string
  riskHighlights?: RiskHighlight[]
  onHighlightClick?: (highlight: RiskHighlight) => void
}

export function EnhancedPDFViewer({ pdfUrl, riskHighlights = [], onHighlightClick }: EnhancedPDFViewerProps) {
  const [numPages, setNumPages] = useState<number | null>(null)
  const [pageNumber, setPageNumber] = useState<number>(1)
  const [scale, setScale] = useState<number>(1.0)
  const [rotation, setRotation] = useState<number>(0)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [pageWidth, setPageWidth] = useState<number>(0)
  const [pageHeight, setPageHeight] = useState<number>(0)
  const pageRef = useRef<HTMLDivElement>(null)

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages)
    setIsLoading(false)
  }

  function changePage(offset: number) {
    setPageNumber((prevPageNumber) => {
      const newPageNumber = prevPageNumber + offset
      return newPageNumber >= 1 && newPageNumber <= (numPages || 1) ? newPageNumber : prevPageNumber
    })
  }

  function previousPage() {
    changePage(-1)
  }

  function nextPage() {
    changePage(1)
  }

  function zoomIn() {
    setScale((prevScale) => Math.min(prevScale + 0.2, 3))
  }

  function zoomOut() {
    setScale((prevScale) => Math.max(prevScale - 0.2, 0.5))
  }

  function rotate() {
    setRotation((prevRotation) => (prevRotation + 90) % 360)
  }

  // 페이지 크기 업데이트
  useEffect(() => {
    if (pageRef.current) {
      const updatePageSize = () => {
        if (pageRef.current) {
          setPageWidth(pageRef.current.clientWidth)
          setPageHeight(pageRef.current.clientHeight)
        }
      }

      updatePageSize()
      window.addEventListener("resize", updatePageSize)

      return () => {
        window.removeEventListener("resize", updatePageSize)
      }
    }
  }, [pageNumber, scale, rotation, isLoading])

  // 리스크 레벨에 따른 스타일 설정
  const getRiskStyle = (riskLevel: string) => {
    switch (riskLevel) {
      case "high":
        return "border-red-500 bg-red-500/30"
      case "medium":
        return "border-amber-500 bg-amber-500/30"
      case "low":
        return "border-yellow-500 bg-yellow-500/30"
      default:
        return "border-gray-500 bg-gray-500/30"
    }
  }

  // 현재 페이지에 표시할 하이라이트 필터링
  const currentPageHighlights = riskHighlights.filter((highlight) => highlight.page === pageNumber)

  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={previousPage} disabled={pageNumber <= 1}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center">
            <Input
              type="number"
              min={1}
              max={numPages || 1}
              value={pageNumber}
              onChange={(e) => setPageNumber(Number.parseInt(e.target.value) || 1)}
              className="w-16 text-center"
            />
            <span className="mx-2 text-sm text-muted-foreground">/ {numPages || "-"}</span>
          </div>
          <Button variant="outline" size="sm" onClick={nextPage} disabled={pageNumber >= (numPages || 1)}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={zoomOut}>
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="text-sm">{Math.round(scale * 100)}%</span>
          <Button variant="outline" size="sm" onClick={zoomIn}>
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={rotate}>
            <RotateCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="border rounded-lg overflow-auto bg-white dark:bg-gray-800 p-4 min-h-[600px] flex justify-center">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-full">
            <Loader2 className="h-8 w-8 animate-spin text-rose-600 mb-2" />
            <p className="text-muted-foreground">PDF 로딩 중...</p>
          </div>
        ) : (
          <div
            style={{
              transform: `scale(${scale}) rotate(${rotation}deg)`,
              transformOrigin: "center center",
              transition: "transform 0.3s ease",
              position: "relative",
            }}
          >
            <div ref={pageRef} className="relative">
              <Document
                file={pdfUrl}
                onLoadSuccess={onDocumentLoadSuccess}
                loading={<Loader2 className="h-8 w-8 animate-spin text-rose-600" />}
              >
                <Page
                  pageNumber={pageNumber}
                  renderTextLayer={true}
                  renderAnnotationLayer={true}
                  onLoadSuccess={(page) => {
                    setPageWidth(page.width * scale)
                    setPageHeight(page.height * scale)
                  }}
                />
              </Document>

              {/* 리스크 하이라이트 오버레이 */}
              <TooltipProvider>
                {currentPageHighlights.map((highlight) => (
                  <Tooltip key={highlight.id}>
                    <TooltipTrigger asChild>
                      <div
                        className={`absolute border-2 ${getRiskStyle(highlight.riskLevel)} rounded cursor-pointer transition-opacity hover:opacity-80`}
                        style={{
                          top: `${highlight.position.top}%`,
                          left: `${highlight.position.left}%`,
                          width: `${highlight.position.width}%`,
                          height: `${highlight.position.height}%`,
                        }}
                        onClick={() => onHighlightClick && onHighlightClick(highlight)}
                      ></div>
                    </TooltipTrigger>
                    <TooltipContent side="right" className="max-w-xs">
                      <div className="space-y-2">
                        <p className="font-medium">{highlight.message}</p>
                        {highlight.suggestion && (
                          <p className="text-sm text-muted-foreground">
                            <span className="font-medium">제안:</span> {highlight.suggestion}
                          </p>
                        )}
                      </div>
                    </TooltipContent>
                  </Tooltip>
                ))}
              </TooltipProvider>
            </div>
          </div>
        )}
      </div>

      <div className="mt-4 text-center text-sm text-muted-foreground">
        <p>
          페이지 {pageNumber} / {numPages || "-"}
        </p>
      </div>
    </div>
  )
}
