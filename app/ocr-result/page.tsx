"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, FileText, Download, Copy } from "lucide-react"
import Link from "next/link"
import { useSearchParams, useRouter } from "next/navigation"

export default function OCRResultPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [ocrText, setOcrText] = useState<string>("")
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string>("")
  const [fileName, setFileName] = useState<string>("")

  useEffect(() => {
    const text = localStorage.getItem("ocrText") || ""
    setOcrText(text)
    setIsLoading(false)
  }, [])

  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(ocrText)
      // 복사 성공 알림을 추가할 수 있습니다
    } catch (err) {
      console.error("텍스트 복사 실패:", err)
    }
  }

  const handleDownloadText = () => {
          const blob = new Blob([ocrText], { type: "text/plain;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${fileName.replace(/\.[^/.]+$/, "")}_ocr.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleStartAnalysis = async () => {
    setIsLoading(true)
    const text = localStorage.getItem("ocrText") || ""
    try {
      const res = await fetch("/api/analysis", {
        method: "POST",
        body: JSON.stringify({ text }),
        headers: { "Content-Type": "application/json" }
      })
      if (!res.ok) throw new Error("분석 요청 실패")
      const { analysisId } = await res.json()
      router.push(`/analysis/${analysisId}`)
    } catch (e) {
      alert("분석 중 오류가 발생했습니다. 다시 시도해주세요.")
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-600 mx-auto mb-4"></div>
            <p className="text-muted-foreground">계약서 분석 중...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-2 mb-6">
            <Button variant="outline" size="sm" asChild>
              <Link href="/upload">
                <ArrowLeft className="h-4 w-4 mr-2" />
                돌아가기
              </Link>
            </Button>
          </div>
          <Card>
            <CardContent className="p-6">
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">오류 발생</h3>
                <p className="text-muted-foreground">{error}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link href="/upload">
                <ArrowLeft className="h-4 w-4 mr-2" />
                돌아가기
              </Link>
            </Button>
            <h1 className="text-2xl font-bold">OCR 처리 결과</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleCopyText}>
              <Copy className="h-4 w-4 mr-2" />
              텍스트 복사
            </Button>
            <Button variant="outline" size="sm" onClick={handleDownloadText}>
              <Download className="h-4 w-4 mr-2" />
              다운로드
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  추출된 텍스트
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-muted/50 rounded-lg p-4 max-h-[600px] overflow-y-auto">
                  <pre className="whitespace-pre-wrap text-sm leading-relaxed font-mono">
                    {ocrText}
                  </pre>
                </div>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card>
              <CardHeader>
                <CardTitle>파일 정보</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">파일명</p>
                    <p className="text-sm">{fileName}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">텍스트 길이</p>
                    <p className="text-sm">{ocrText.length}자</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">줄 수</p>
                    <p className="text-sm">{ocrText.split('\n').length}줄</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="mt-4">
              <CardHeader>
                <CardTitle>다음 단계</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button
                    className="w-full bg-rose-600 hover:bg-rose-700"
                    onClick={handleStartAnalysis}
                    disabled={isLoading}
                  >
                    {isLoading ? "분석 중..." : "계약서 분석 시작"}
                  </Button>
                  <Button variant="outline" className="w-full" asChild>
                    <Link href="/upload">
                      새 파일 업로드
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
} 