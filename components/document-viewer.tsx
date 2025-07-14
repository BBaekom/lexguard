"use client"

import { useState, useEffect } from "react"
import { PDFViewer } from "./pdf-viewer"
import { ImageViewer } from "./image-viewer"
import { Loader2 } from "lucide-react"

interface DocumentViewerProps {
  fileUrl: string
  fileType: string
}

export function DocumentViewer({ fileUrl, fileType }: DocumentViewerProps) {
  const [isLoading, setIsLoading] = useState(true)

  // 기본 파일 URL 설정
  const defaultPdfUrl = "/sample-contract.pdf"
  const defaultImageUrl = "/sample-contract.jpg"

  // 파일 유형에 따라 기본 URL 설정
  const validFileUrl =
    fileUrl && fileUrl !== "" ? fileUrl : fileType.toLowerCase() === "pdf" ? defaultPdfUrl : defaultImageUrl

  useEffect(() => {
    // 파일 URL이 변경되면 로딩 상태 초기화
    setIsLoading(true)

    // 실제 이미지나 PDF가 존재하는지 확인
    const checkFileExists = async () => {
      try {
        const response = await fetch(validFileUrl, { method: "HEAD" })
        if (!response.ok) {
          console.error("파일을 찾을 수 없습니다:", validFileUrl)
        }
      } catch (error) {
        console.error("파일 확인 중 오류 발생:", error)
      } finally {
        // 로딩 상태 업데이트
        setTimeout(() => {
          setIsLoading(false)
        }, 1000)
      }
    }

    checkFileExists()

    return () => {}
  }, [validFileUrl])

  const isPDF = fileType.toLowerCase() === "pdf"
  const isImage = /^(jpg|jpeg|png|gif|webp)$/i.test(fileType.toLowerCase())

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[600px] border rounded-lg bg-muted/30">
        <Loader2 className="h-8 w-8 animate-spin text-rose-600 mb-2" />
        <p className="text-muted-foreground">문서 로딩 중...</p>
      </div>
    )
  }

  if (isPDF) {
    return <PDFViewer pdfUrl={validFileUrl} />
  }

  if (isImage) {
    return <ImageViewer imageUrl={validFileUrl} />
  }

  return (
    <div className="flex flex-col items-center justify-center h-[600px] border rounded-lg bg-muted/30">
      <p className="text-muted-foreground">지원되지 않는 파일 형식입니다. PDF, JPG, PNG 파일만 지원합니다.</p>
    </div>
  )
}
