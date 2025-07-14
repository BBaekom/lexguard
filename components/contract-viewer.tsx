"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { ZoomIn, ZoomOut, RotateCw } from "lucide-react"

interface ContractViewerProps {
  contractId: string
  activeTab: string
}

export function ContractViewer({ contractId, activeTab }: ContractViewerProps) {
  const [zoom, setZoom] = useState(100)
  const [rotation, setRotation] = useState(0)
  const [highlights, setHighlights] = useState<any[]>([
    {
      id: 1,
      top: 25,
      left: 10,
      width: 80,
      height: 5,
      risk: "high",
      message: "계약 해지 조항이 불명확하여 분쟁 가능성이 높습니다.",
    },
    {
      id: 2,
      top: 45,
      left: 15,
      width: 70,
      height: 5,
      risk: "medium",
      message: "위약금 조항이 과도하게 설정되어 있습니다.",
    },
    {
      id: 3,
      top: 65,
      left: 20,
      width: 75,
      height: 5,
      risk: "low",
      message: "책임 한계 조항이 누락되어 있습니다.",
    },
  ])

  // 탭이 변경될 때 하이라이트 표시 여부 결정
  useEffect(() => {
    // 실제 구현에서는 탭에 따라 다른 하이라이트를 표시할 수 있습니다.
  }, [activeTab])

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 10, 200))
  }

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 10, 50))
  }

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360)
  }

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "high":
        return "bg-red-500/30 border-red-500"
      case "medium":
        return "bg-amber-500/30 border-amber-500"
      case "low":
        return "bg-yellow-500/30 border-yellow-500"
      default:
        return "bg-gray-500/30 border-gray-500"
    }
  }

  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-medium">계약서 문서</h2>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={handleZoomOut}>
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="text-sm">{zoom}%</span>
          <Button variant="outline" size="icon" onClick={handleZoomIn}>
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={handleRotate}>
            <RotateCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="relative border rounded-lg overflow-hidden bg-white dark:bg-gray-800">
        <div
          className="relative min-h-[600px] w-full"
          style={{
            transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
            transformOrigin: "center center",
            transition: "transform 0.3s ease",
          }}
        >
          <Image
            src="/placeholder-v5lts.png"
            alt="계약서 문서"
            width={600}
            height={800}
            className="w-full h-auto"
          />

          <TooltipProvider>
            {highlights.map((highlight) => (
              <Tooltip key={highlight.id}>
                <TooltipTrigger asChild>
                  <div
                    className={`absolute border-2 ${getRiskColor(highlight.risk)} rounded cursor-pointer`}
                    style={{
                      top: `${highlight.top}%`,
                      left: `${highlight.left}%`,
                      width: `${highlight.width}%`,
                      height: `${highlight.height}%`,
                    }}
                  ></div>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p className="max-w-xs">{highlight.message}</p>
                </TooltipContent>
              </Tooltip>
            ))}
          </TooltipProvider>
        </div>
      </div>
    </div>
  )
}
