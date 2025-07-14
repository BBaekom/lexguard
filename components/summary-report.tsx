"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts"

interface SummaryReportProps {
  contractId: string
}

export function SummaryReport({ contractId }: SummaryReportProps) {
  // 실제 구현에서는 contractId를 사용하여 서버에서 데이터를 가져옵니다.

  const overallScore = 65

  const pieData = [
    { name: "높은 리스크", value: 2 },
    { name: "중간 리스크", value: 3 },
    { name: "낮은 리스크", value: 5 },
    { name: "안전", value: 10 },
  ]

  const COLORS = ["#ef4444", "#f59e0b", "#eab308", "#22c55e"]

  const barData = [
    { name: "계약 해지", score: 85 },
    { name: "위약금", score: 65 },
    { name: "책임 한계", score: 35 },
    { name: "임대료 인상", score: 60 },
    { name: "계약기간", score: 25 },
  ]

  const missingClauses = ["불가항력 조항", "분쟁 해결 절차", "개인정보 처리 방침"]

  const getScoreColor = (score: number) => {
    if (score >= 70) return "text-red-500"
    if (score >= 40) return "text-amber-500"
    return "text-green-500"
  }

  const getProgressColor = (score: number) => {
    if (score >= 70) return "bg-red-500"
    if (score >= 40) return "bg-amber-500"
    return "bg-green-500"
  }

  return (
    <div>
      <h2 className="text-xl font-medium mb-6">요약 보고서</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-medium mb-4">전체 리스크 점수</h3>
            <div className="flex items-center gap-4">
              <div className="w-full">
                <Progress value={overallScore} className={`h-3 ${getProgressColor(overallScore)}`} />
              </div>
              <span className={`text-2xl font-bold ${getScoreColor(overallScore)}`}>{overallScore}</span>
            </div>
            <p className="text-sm text-muted-foreground mt-4">
              이 계약서는 중간 수준의 리스크를 가지고 있습니다. 주요 리스크 요소를 개선하여 안전한 계약을 체결하세요.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-medium mb-4">조항 분포</h3>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent||0 * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-6">
        <CardContent className="p-6">
          <h3 className="text-lg font-medium mb-4">주요 리스크 조항</h3>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} layout="vertical" margin={{ top: 5, right: 30, left: 100, bottom: 5 }}>
                <XAxis type="number" domain={[0, 100]} />
                <YAxis type="category" dataKey="name" width={100} />
                <Tooltip />
                <Bar dataKey="score" radius={[0, 4, 4, 0]}>
                  {barData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.score >= 70 ? "#ef4444" : entry.score >= 40 ? "#f59e0b" : "#22c55e"}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-medium mb-4">누락된 조항</h3>
          {missingClauses.length > 0 ? (
            <ul className="space-y-3">
              {missingClauses.map((clause, index) => (
                <li key={index} className="flex items-start gap-2">
                  <div className="w-2 h-2 rounded-full bg-red-500 mt-2"></div>
                  <div>
                    <p className="font-medium">{clause}</p>
                    <p className="text-sm text-muted-foreground">
                      이 조항이 계약서에 포함되어야 합니다. 표준 계약서에는 일반적으로 포함되는 조항입니다.
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground">누락된 조항이 없습니다.</p>
          )}

          <Separator className="my-6" />

          <h3 className="text-lg font-medium mb-4">개선 권장사항</h3>
          <ul className="space-y-2">
            <li className="text-sm">
              <span className="font-medium">계약 해지 조항:</span> 해지 사유를 구체적으로 명시하고, 임차인의 이의 제기
              권리를 보장하세요.
            </li>
            <li className="text-sm">
              <span className="font-medium">위약금 조항:</span> 위약금을 계약금 이내로 제한하고, 불가항력적 사유에 대한
              예외를 두세요.
            </li>
            <li className="text-sm">
              <span className="font-medium">책임 한계 조항:</span> 임대인과 임차인의 책임 범위를 명확히 하는 조항을
              추가하세요.
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
