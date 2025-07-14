import Link from "next/link"
import { Button } from "@/components/ui/button"
import { CheckCircle, FileText, ShieldCheck, Zap } from "lucide-react"
import Image from "next/image"

export default function Home() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-white to-gray-50 dark:from-gray-950 dark:to-gray-900 py-16 md:py-24">
        <div className="container flex flex-col items-center text-center">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
            계약서 검토, 이제 <span className="text-rose-600">LexGuard</span>와 함께
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-3xl">
            LexGuard는 LLM 기반 계약서 자동 검토 서비스로, 법률 지식이 부족한 개인 및 기업이 계약서를 안전하게 검토하고
            법적 리스크를 최소화할 수 있도록 도와줍니다.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button size="lg" className="bg-rose-600 hover:bg-rose-700" asChild>
              <Link href="/upload">계약서 검토하기</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/about">서비스 소개</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">LexGuard의 주요 기능</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              최신 AI 기술을 활용하여 계약서를 분석하고 법적 리스크를 평가합니다.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="flex flex-col items-center text-center p-6 rounded-lg border bg-card">
              <div className="w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-900 flex items-center justify-center mb-4">
                <FileText className="h-6 w-6 text-rose-600" />
              </div>
              <h3 className="text-xl font-medium mb-2">계약서 자동 분석</h3>
              <p className="text-muted-foreground">
                PDF 또는 이미지 형태의 계약서를 업로드하면 OCR을 통해 텍스트를 추출하고 LLM이 내용을 분석합니다.
              </p>
            </div>
            <div className="flex flex-col items-center text-center p-6 rounded-lg border bg-card">
              <div className="w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-900 flex items-center justify-center mb-4">
                <ShieldCheck className="h-6 w-6 text-rose-600" />
              </div>
              <h3 className="text-xl font-medium mb-2">조항 중요도 분석</h3>
              <p className="text-muted-foreground">
                계약서를 조항별로 분리하여 각 조항의 중요도와 위험도를 분석하고 법적 리스크 점수를 부여합니다.
              </p>
            </div>
            <div className="flex flex-col items-center text-center p-6 rounded-lg border bg-card">
              <div className="w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-900 flex items-center justify-center mb-4">
                <Zap className="h-6 w-6 text-rose-600" />
              </div>
              <h3 className="text-xl font-medium mb-2">최신 법률 정보 활용</h3>
              <p className="text-muted-foreground">
                RAG 기술을 활용해 최신 법률 조항, 판례, 표준계약 데이터베이스를 참조하여 법적 리스크를 탐지합니다.
              </p>
            </div>
            <div className="flex flex-col items-center text-center p-6 rounded-lg border bg-card">
              <div className="w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-900 flex items-center justify-center mb-4">
                <CheckCircle className="h-6 w-6 text-rose-600" />
              </div>
              <h3 className="text-xl font-medium mb-2">맞춤형 개선 제안</h3>
              <p className="text-muted-foreground">
                계약서 유형에 따라 표준 계약서와 비교하여 수정이 필요한 조항을 식별하고 개선된 대체 문구를 추천합니다.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 md:py-24 bg-gray-50 dark:bg-gray-900">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">이용 방법</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              간단한 3단계로 계약서를 안전하게 검토하세요.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-rose-100 dark:bg-rose-900 flex items-center justify-center mb-4 text-2xl font-bold text-rose-600">
                1
              </div>
              <h3 className="text-xl font-medium mb-2">계약서 업로드</h3>
              <p className="text-muted-foreground">PDF 또는 이미지 형태의 계약서를 업로드합니다.</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-rose-100 dark:bg-rose-900 flex items-center justify-center mb-4 text-2xl font-bold text-rose-600">
                2
              </div>
              <h3 className="text-xl font-medium mb-2">AI 분석</h3>
              <p className="text-muted-foreground">LLM이 계약서 내용을 분석하고 법적 리스크를 평가합니다.</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-rose-100 dark:bg-rose-900 flex items-center justify-center mb-4 text-2xl font-bold text-rose-600">
                3
              </div>
              <h3 className="text-xl font-medium mb-2">결과 확인</h3>
              <p className="text-muted-foreground">분석 결과를 확인하고 개선 제안을 적용하여 계약서를 수정합니다.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="bg-rose-50 dark:bg-rose-950 rounded-lg p-8 md:p-12 flex flex-col items-center text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">지금 바로 계약서를 검토해보세요</h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl">
              LexGuard와 함께 법적 리스크를 최소화하고 안전한 계약을 체결하세요.
            </p>
            <Button size="lg" className="bg-rose-600 hover:bg-rose-700" asChild>
              <Link href="/login">시작하기</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
