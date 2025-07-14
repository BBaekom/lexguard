"use client"

import { useState, useRef } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { ZoomIn, ZoomOut, RotateCw } from "lucide-react"

interface RiskHighlight {
  id: number
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

interface EnhancedImageViewerProps {
  imageUrl: string
  altText?: string
  riskHighlights?: RiskHighlight[]
  onHighlightClick?: (highlight: RiskHighlight) => void
}

export function EnhancedImageViewer({
  imageUrl,
  altText = "계약서 이미지",
  riskHighlights = [],
  onHighlightClick,
}: EnhancedImageViewerProps) {
  const [scale, setScale] = useState<number>(1.0)
  const [rotation, setRotation] = useState<number>(0)
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageError, setImageError] = useState(false)
  const imageContainerRef = useRef<HTMLDivElement>(null)

  // 기본 이미지 URL 설정
  const defaultImageUrl = "/contract-document.png"
  const validImageUrl = imageUrl && imageUrl !== "" ? imageUrl : defaultImageUrl

  function zoomIn() {
    setScale((prevScale) => Math.min(prevScale + 0.2, 3))
  }

  function zoomOut() {
    setScale((prevScale) => Math.max(prevScale - 0.2, 0.5))
  }

  function rotate() {
    setRotation((prevRotation) => (prevRotation + 90) % 360)
  }

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

  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-end mb-4 space-x-2">
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

      <div className="border rounded-lg overflow-auto bg-white dark:bg-gray-800 p-4 min-h-[600px] flex justify-center items-center">
        <div
          ref={imageContainerRef}
          style={{
            transform: `scale(${scale}) rotate(${rotation}deg)`,
            transformOrigin: "center center",
            transition: "transform 0.3s ease",
            maxWidth: "100%",
            maxHeight: "100%",
            position: "relative",
          }}
        >
          <div className="relative">
            <Image
              src={validImageUrl || "/placeholder.svg"}
              alt={altText}
              width={800}
              height={1000}
              className="max-w-full h-auto object-contain"
              style={{ maxHeight: "calc(600px - 2rem)" }}
              onLoad={() => setImageLoaded(true)}
              onError={() => {
                console.error("이미지 로딩 실패:", validImageUrl)
                setImageError(true)
              }}
            />

            {/* 리스크 하이라이트 오버레이 */}
            {imageLoaded && !imageError && (
              <TooltipProvider>
                {riskHighlights.map((highlight) => (
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
            )}
          </div>
        </div>

        {imageError && (
          <div className="flex flex-col items-center justify-center p-4 text-center">
            <p className="text-muted-foreground mb-2">이미지를 불러올 수 없습니다.</p>
            <p className="text-sm text-muted-foreground">
              로컬 환경에서 실행하면 이미지가 정상적으로 표시될 수 있습니다.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
