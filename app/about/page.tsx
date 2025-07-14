import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle, FileText, ShieldCheck, Zap } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

export default function AboutPage() {
  return (
    <div className="container py-12">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">서비스 소개</h1>
        <p className="text-lg text-muted-foreground mb-8">
          LexGuard는 인공지능 기반의 계약서 분석 서비스로, 복잡한 법률 문서를 쉽고 빠르게 이해하고 잠재적인 위험을
          식별하여 안전한 계약 체결을 돕습니다.
        </p>
        <div className="space-y-12">
          <section>
            <h2 className="text-2xl font-semibold mb-4">LexGuard란?</h2>
            <p className="text-muted-foreground mb-6">
              LexGuard는 LLM 기반 계약서 자동 검토 및 리스크 관리 서비스로, 법률 지식이 부족한 개인 및 기업이 계약서를
              안전하게 검토하고 법적 리스크를 최소화할 수 있도록 도와줍니다.
            </p>
            <div className="rounded-lg overflow-hidden border mb-6">
              <Image
                src="/contract-document.png"
                alt="LexGuard 계약서 분석 대시보드"
                width={800}
                height={400}
                className="w-full"
              />
            </div>
            <p className="text-muted-foreground">
              최신 AI 기술을 활용하여 계약서를 분석하고 법적 리스크를 평가하며, 개선 제안을 제공합니다. 이를 통해 법률
              전문가의 도움 없이도 안전한 계약을 체결할 수 있습니다.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">주요 기능</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-rose-100 dark:bg-rose-900 flex items-center justify-center flex-shrink-0">
                      <FileText className="h-5 w-5 text-rose-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-medium mb-2">계약서 자동 분석</h3>
                      <p className="text-sm text-muted-foreground">
                        PDF 또는 이미지 형태의 계약서를 업로드하면 OCR을 통해 텍스트를 추출하고 LLM이 내용을 분석합니다.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-rose-100 dark:bg-rose-900 flex items-center justify-center flex-shrink-0">
                      <ShieldCheck className="h-5 w-5 text-rose-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-medium mb-2">조항 중요도 분석</h3>
                      <p className="text-sm text-muted-foreground">
                        계약서를 조항별로 분리하여 각 조항의 중요도와 위험도를 분석하고 법적 리스크 점수를 부여합니다.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-rose-100 dark:bg-rose-900 flex items-center justify-center flex-shrink-0">
                      <Zap className="h-5 w-5 text-rose-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-medium mb-2">최신 법률 정보 활용</h3>
                      <p className="text-sm text-muted-foreground">
                        RAG 기술을 활용해 최신 법률 조항, 판례, 표준계약 데이터베이스를 참조하여 법적 리스크를
                        탐지합니다.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-rose-100 dark:bg-rose-900 flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="h-5 w-5 text-rose-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-medium mb-2">맞춤형 개선 제안</h3>
                      <p className="text-sm text-muted-foreground">
                        계약서 유형에 따라 표준 계약서와 비교하여 수정이 필요한 조항을 식별하고 개선된 대체 문구를
                        추천합니다.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">기술 스택</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium mb-2">OCR (문자 인식)</h3>
                <p className="text-muted-foreground">
                  PDF 및 이미지에서 텍스트를 추출하여 디지털화하는 작업을 수행합니다.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-2">LLM (대규모 언어 모델)</h3>
                <p className="text-muted-foreground">
                  DeepSeek R1과 Claude 3.7을 활용하여 계약서 내용을 분석하고 법적 리스크를 평가합니다.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-2">RAG (검색 증강 생성)</h3>
                <p className="text-muted-foreground">
                  최신 법률 조항, 판례, 표준계약 데이터베이스를 구축하고 이를 참조하여 누락된 조항이나 법적 리스크
                  요소를 탐지합니다.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-2">PDF/이미지 처리</h3>
                <p className="text-muted-foreground">
                  PyMuPDF, PDF.js 등을 활용하여 PDF나 이미지 위에 분석 결과를 시각적으로 표시합니다.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">이용 대상</h2>
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <div className="w-2 h-2 rounded-full bg-rose-600 mt-2"></div>
                <p className="text-muted-foreground">법률 지식이 부족한 개인</p>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-2 h-2 rounded-full bg-rose-600 mt-2"></div>
                <p className="text-muted-foreground">법무팀이 없는 스타트업 및 중소기업</p>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-2 h-2 rounded-full bg-rose-600 mt-2"></div>
                <p className="text-muted-foreground">계약 검토 비용을 절감하고자 하는 기업</p>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-2 h-2 rounded-full bg-rose-600 mt-2"></div>
                <p className="text-muted-foreground">안전한 계약 체결을 원하는 모든 사용자</p>
              </li>
            </ul>
          </section>

          <div className="flex justify-center">
            <Button size="lg" className="bg-rose-600 hover:bg-rose-700" asChild>
              <Link href="/upload">지금 바로 시작하기</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}