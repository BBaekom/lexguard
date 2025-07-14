"use client"

import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { AlertTriangle, AlertCircle, AlertOctagon } from "lucide-react"

interface RiskAnalysisProps {
  contractId: string
}

export function RiskAnalysis({ contractId }: RiskAnalysisProps) {
  // 실제 구현에서는 contractId를 사용하여 서버에서 데이터를 가져옵니다.
  const riskItems = [
    {
      id: 1,
      clause: "제7조 (계약 해지)",
      riskLevel: "high",
      score: 85,
      description:
        "계약 해지 조항이 불명확하게 작성되어 있어 분쟁 발생 시 해석의 여지가 있습니다. 특히 '정당한 사유'에 대한 명확한 정의가 없어 임차인에게 불리하게 작용할 수 있습니다.",
      legalReference: "민법 제635조, 대법원 2019다12345 판결",
    },
    {
      id: 2,
      clause: "제9조 (위약금)",
      riskLevel: "medium",
      score: 65,
      description:
        "위약금 조항이 과도하게 설정되어 있어 불공정 약관으로 간주될 수 있습니다. 계약금의 3배에 해당하는 위약금은 일반적인 거래 관행에 비해 높은 수준입니다.",
      legalReference: "약관규제법 제8조, 대법원 2018다54321 판결",
    },
    {
      id: 3,
      clause: "제12조 (책임 한계)",
      riskLevel: "low",
      score: 35,
      description:
        "책임 한계 조항이 누락되어 있어 분쟁 발생 시 책임 소재가 불분명할 수 있습니다. 임대인과 임차인의 책임 범위를 명확히 하는 조항 추가가 필요합니다.",
      legalReference: "민법 제390조, 제393조",
    },
    {
      id: 4,
      clause: "제5조 (임대료 인상)",
      riskLevel: "medium",
      score: 60,
      description:
        "임대료 인상 조항이 임대인에게 일방적으로 유리하게 작성되어 있습니다. '필요한 경우'라는 모호한 표현으로 인상 사유를 제한하지 않고 있어 임차인에게 불리합니다.",
      legalReference: "주택임대차보호법 제7조",
    },
    {
      id: 5,
      clause: "제3조 (계약기간)",
      riskLevel: "low",
      score: 25,
      description:
        "계약기간 조항은 명확하게 작성되어 있으나, 갱신 조건에 대한 내용이 부족합니다. 계약 만료 후 갱신 절차와 조건을 추가하는 것이 좋습니다.",
      legalReference: "주택임대차보호법 제6조",
    },
  ]

  const getRiskIcon = (level: string) => {
    switch (level) {
      case "high":
        return <AlertOctagon className="h-5 w-5 text-red-500" />
      case "medium":
        return <AlertTriangle className="h-5 w-5 text-amber-500" />
      case "low":
        return <AlertCircle className="h-5 w-5 text-yellow-500" />
      default:
        return null
    }
  }

  const getRiskBadge = (level: string) => {
    switch (level) {
      case "high":
        return (
          <Badge
            variant="outline"
            className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 border-red-500"
          >
            높음
          </Badge>
        )
      case "medium":
        return (
          <Badge
            variant="outline"
            className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 border-amber-500"
          >
            중간
          </Badge>
        )
      case "low":
        return (
          <Badge
            variant="outline"
            className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 border-yellow-500"
          >
            낮음
          </Badge>
        )
      default:
        return null
    }
  }

  const getProgressColor = (score: number) => {
    if (score >= 70) return "bg-red-500"
    if (score >= 40) return "bg-amber-500"
    return "bg-yellow-500"
  }

  return (
    <div>
      <h2 className="text-xl font-medium mb-6">리스크 분석</h2>

      <Accordion type="single" collapsible className="w-full">
        {riskItems.map((item) => (
          <AccordionItem key={item.id} value={`item-${item.id}`}>
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center justify-between w-full pr-4">
                <div className="flex items-center gap-3">
                  {getRiskIcon(item.riskLevel)}
                  <span>{item.clause}</span>
                </div>
                <div className="flex items-center gap-3">
                  {getRiskBadge(item.riskLevel)}
                  <div className="flex items-center gap-2 min-w-[120px]">
                    <Progress value={item.score} className={`h-2 ${getProgressColor(item.score)}`} />
                    <span className="text-sm font-medium">{item.score}</span>
                  </div>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="pl-8 pr-4 pb-2">
                <p className="text-muted-foreground mb-3">{item.description}</p>
                <div className="bg-muted p-3 rounded-md">
                  <p className="text-sm font-medium">법적 근거:</p>
                  <p className="text-sm text-muted-foreground">{item.legalReference}</p>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  )
}
