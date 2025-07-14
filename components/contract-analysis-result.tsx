"use client"

import { useEffect, useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ContractViewer } from "./contract-viewer"
import { RiskAnalysis } from "./risk-analysis"
import { ImprovementSuggestions } from "./improvement-suggestions"
import { SummaryReport } from "./summary-report"
import { Doughnut, Bar } from 'react-chartjs-2';
import { Chart, ArcElement, Tooltip, Legend, BarElement, CategoryScale, LinearScale } from 'chart.js';
Chart.register(ArcElement, Tooltip, Legend, BarElement, CategoryScale, LinearScale);

interface ContractAnalysisResultProps {
  contractId: string
}

export function ContractAnalysisResult({ contractId }: ContractAnalysisResultProps) {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("document")

  useEffect(() => {
    fetch(`/api/analysis/result?id=${contractId}`)
      .then(res => res.json())
      .then(setData)
      .finally(() => setLoading(false))
  }, [contractId])

  if (loading) return <div>로딩 중...</div>
  if (!data) return <div>분석 결과를 찾을 수 없습니다.</div>

  // 전체 리스크 점수 도넛 차트 데이터
  const doughnutData = {
    labels: ['리스크 점수', '안전 점수'],
    datasets: [
      {
        data: [data.summary?.riskScore ?? 0, 100 - (data.summary?.riskScore ?? 0)],
        backgroundColor: ['#f59e42', '#e5e7eb'],
        borderWidth: 0,
      },
    ],
  };

  // 조항별 리스크 점수 막대 차트 데이터
  const barData = {
    labels: data.clauses?.map((clause: any) => `${clause.clause_number} ${clause.clause_title}`) ?? [],
    datasets: [
      {
        label: '조항별 리스크 점수',
        data: data.clauses?.map((clause: any) => clause.risk_score) ?? [],
        backgroundColor: '#f59e42',
      },
    ],
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2">
        <Tabs defaultValue="document" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="document">계약서</TabsTrigger>
            <TabsTrigger value="risks">리스크 분석</TabsTrigger>
            <TabsTrigger value="improvements">개선 제안</TabsTrigger>
            <TabsTrigger value="summary">요약 보고서</TabsTrigger>
          </TabsList>
          <TabsContent value="document">
            <Card>
              <CardContent className="p-6">
                <div className="mb-4 flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    텍스트 길이: {data.contractText?.length || 0}자
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      const blob = new Blob([data.contractText], { type: 'text/plain;charset=utf-8' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = 'contract_text.txt';
                      document.body.appendChild(a);
                      a.click();
                      document.body.removeChild(a);
                      URL.revokeObjectURL(url);
                    }}
                  >
                    전체 텍스트 다운로드
                  </Button>
                </div>
                <div className="bg-muted/50 rounded-lg p-4 max-h-[600px] overflow-y-auto">
                  <pre className="whitespace-pre-wrap text-sm leading-relaxed">{data.contractText}</pre>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="risks">
            <Card>
              <CardContent className="space-y-6 pt-6">
                {data.clauses.map((clause: any, idx: number) => {
                  let riskColor = '';
                  let riskBg = '';
                  let riskLabel = '';
                  if (clause.risk_level === '높음') {
                    riskColor = 'text-red-600';
                    riskBg = 'bg-red-50';
                    riskLabel = '위험';
                  } else if (clause.risk_level === '중간') {
                    riskColor = 'text-amber-600';
                    riskBg = 'bg-amber-50';
                    riskLabel = '주의';
                  } else {
                    riskColor = 'text-green-600';
                    riskBg = 'bg-green-50';
                    riskLabel = '안전';
                  }
                  return (
                    <div key={idx} className={`rounded-lg p-4 ${riskBg} border`}>
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`px-2 py-1 rounded text-xs font-bold ${riskColor} border ${riskColor} border-opacity-30`}>
                          {riskLabel}
                        </span>
                        <span className="font-bold">{clause.clause_number} {clause.clause_title}</span>
                      </div>
                      <div className="mb-2 text-sm text-gray-800">{clause.clause_content}</div>
                      <div className="mb-1 text-xs text-gray-500">리스크 점수: <b>{clause.risk_score}</b></div>
                      <div className="text-sm text-muted-foreground">{clause.risk_analysis}</div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="improvements">
            <Card>
              <CardContent className="space-y-6 pt-6">
                {data.clauses.map((clause: any, idx: number) => (
                  <div key={idx} className="rounded-lg border p-4 bg-gray-50">
                    <div className="font-bold mb-2">{clause.clause_number} {clause.clause_title}</div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
                      <div>
                        <div className="text-xs text-muted-foreground mb-1">기존 조항</div>
                        <div className="text-sm">{clause.improvement?.original}</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground mb-1">개선 조항</div>
                        <div className="text-sm font-medium text-emerald-700">{clause.improvement?.suggested}</div>
                      </div>
                    </div>
                    <hr className="my-2" />
                    <div className="text-xs text-muted-foreground mb-1">개선 설명</div>
                    <div className="text-sm">{clause.improvement?.explanation}</div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="summary">
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col md:flex-row gap-8 mb-6 items-center">
                  <div className="w-40 h-40 flex flex-col items-center justify-center relative">
                    <Doughnut
                      data={doughnutData}
                      options={{
                        cutout: '70%',
                        plugins: { legend: { display: false } }
                      }}
                    />
                    <div className="text-base font-semibold text-amber-600 mt-2 whitespace-nowrap">
                      전체 리스크 점수: {data.summary?.riskScore}
                    </div>
                  </div>
                  <div className="flex-1">
                    {barData.labels.length > 0 ? (
                      <>
                        <Bar
                          data={barData}
                          options={{
                            indexAxis: 'y',
                            plugins: { legend: { display: false } },
                            scales: { x: { max: 100, min: 0 } }
                          }}
                        />
                        <div className="text-xs text-center mt-2">조항별 리스크 점수</div>
                      </>
                    ) : (
                      <div className="text-sm text-muted-foreground text-center py-8">
                        리스크 조항이 없습니다.
                      </div>
                    )}
                  </div>
                </div>
                <div className="mb-4">
                  <div className="font-semibold mb-1">주요 리스크 조항</div>
                  <ul className="list-disc list-inside text-sm space-y-1">
                    {data.summary?.mainRiskClauses?.map((item: any, idx: number) => (
                      <li key={idx} className="font-medium">{item.title} <span className="text-amber-600">({item.score})</span></li>
                    ))}
                  </ul>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-700 border break-words whitespace-pre-line min-h-[60px]">
                  {data.summary?.comment}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <div>
        <Card className="sticky top-8">
          <CardContent className="p-6">
            <h3 className="text-lg font-medium mb-4">계약서 정보</h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">계약서 유형</p>
                <p className="font-medium">{data.contractType}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">분석 완료 시간</p>
                <p className="font-medium">{data.completedAt}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">전체 리스크 점수</p>
                <div className="flex items-center gap-2">
                  <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-500 rounded-full" style={{ width: `${data.riskScore}%` }}></div>
                  </div>
                  <span className="font-medium text-amber-500">{data.riskScore}/100</span>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">주요 리스크 요소</p>
                <ul className="list-disc list-inside text-sm mt-1 space-y-1">
                  {data.mainRisks?.map((risk: string, idx: number) => (
                    <li key={idx}>{risk}</li>
                  ))}
                </ul>
              </div>
              <div className="pt-4 border-t">
                <Button className="w-full bg-rose-600 hover:bg-rose-700">개선된 계약서 다운로드</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
