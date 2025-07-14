"use client"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ZoomIn, ZoomOut, RotateCw } from "lucide-react"

interface ImageViewerProps {
  imageUrl: string
  altText?: string
}

export function ImageViewer({ imageUrl, altText = "계약서 이미지" }: ImageViewerProps) {
  const [scale, setScale] = useState<number>(1.0)
  const [rotation, setRotation] = useState<number>(0)
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageError, setImageError] = useState(false)

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
          style={{
            transform: `scale(${scale}) rotate(${rotation}deg)`,
            transformOrigin: "center center",
            transition: "transform 0.3s ease",
            maxWidth: "100%",
            maxHeight: "100%",
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
