"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check, Copy, ThumbsUp, ThumbsDown } from "lucide-react"

interface ImprovementSuggestionsProps {
  contractId: string
}

export function ImprovementSuggestions({ contractId }: ImprovementSuggestionsProps) {
  // 실제 구현에서는 contractId를 사용하여 서버에서 데이터를 가져옵니다.
  const suggestions = [
    {
      id: 1,
      clause: "제7조 (계약 해지)",
      original: "임대인은 정당한 사유가 있는 경우 임차인에게 계약 해지를 통보할 수 있으며, 임차인은 이에 따라야 한다.",
      improved:
        "임대인은 임차인이 임대료를 2개월 이상 연체하거나, 임대 목적물을 훼손하는 등 계약의 중대한 위반이 있는 경우에 한하여 임차인에게 서면으로 계약 해지를 통보할 수 있다. 이 경우 임차인은 통보를 받은 날로부터 30일 이내에 이의를 제기할 수 있으며, 양 당사자는 분쟁 해결을 위해 성실히 협의해야 한다.",
      reason:
        "기존 조항은 '정당한 사유'가 무엇인지 명확하지 않아 임대인의 자의적 해석 가능성이 있습니다. 개선된 조항은 해지 사유를 구체적으로 명시하고, 임차인의 이의 제기 권리를 보장하여 양 당사자의 권리를 균형 있게 보호합니다.",
    },
    {
      id: 2,
      clause: "제9조 (위약금)",
      original: "임차인이 계약을 위반하는 경우 계약금의 3배에 해당하는 위약금을 임대인에게 지급해야 한다.",
      improved:
        "임차인이 본 계약을 중대하게 위반하여 계약이 해지되는 경우, 실제 발생한 손해를 기준으로 하되 계약금의 100%를 초과하지 않는 범위 내에서 위약금을 임대인에게 지급해야 한다. 단, 임차인이 불가항력적인 사유로 계약을 이행하지 못하는 경우에는 위약금이 감면될 수 있다.",
      reason:
        "기존 조항의 위약금은 계약금의 3배로 과도하게 설정되어 있어 약관규제법상 불공정 약관으로 간주될 수 있습니다. 개선된 조항은 위약금을 계약금 이내로 제한하고, 불가항력적 사유에 대한 예외를 두어 형평성을 높였습니다.",
    },
    {
      id: 3,
      clause: "제12조 (책임 한계)",
      original: "[조항 없음]",
      improved:
        "임대인은 자연재해, 화재, 도난 등 불가항력적 사유로 인한 임차인의 재산 손실에 대해 책임을 지지 않는다. 다만, 임대인의 고의 또는 중대한 과실로 인한 손해에 대해서는 임대인이 책임을 진다. 임차인은 임대 목적물 내 자신의 재산에 대한 보험 가입을 권장한다.",
      reason:
        "기존 계약서에는 책임 한계에 관한 조항이 누락되어 있어 분쟁 발생 시 책임 소재가 불분명할 수 있습니다. 추가된 조항은 임대인과 임차인의 책임 범위를 명확히 하여 향후 분쟁 가능성을 줄입니다.",
    },
  ]

  const [copiedId, setCopiedId] = useState<number | null>(null)
  const [feedback, setFeedback] = useState<Record<number, string>>({})

  const handleCopy = (text: string, id: number) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const handleFeedback = (id: number, type: string) => {
    setFeedback((prev) => ({ ...prev, [id]: type }))
  }

  return (
    <div>
      <h2 className="text-xl font-medium mb-6">개선 제안</h2>

      <div className="space-y-6">
        {suggestions.map((suggestion) => (
          <Card key={suggestion.id} className="overflow-hidden">
            <CardContent className="p-0">
              <div className="p-4 border-b bg-muted/30">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium">{suggestion.clause}</h3>
                  {suggestion.original === "[조항 없음]" ? (
                    <Badge
                      variant="outline"
                      className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border-blue-500"
                    >
                      조항 추가
                    </Badge>
                  ) : (
                    <Badge
                      variant="outline"
                      className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border-green-500"
                    >
                      조항 개선
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{suggestion.reason}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x">
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-medium">기존 조항</h4>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 px-2"
                      onClick={() => handleCopy(suggestion.original, -suggestion.id)}
                    >
                      {copiedId === -suggestion.id ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <p className="text-sm whitespace-pre-wrap">{suggestion.original}</p>
                </div>

                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-medium">개선된 조항</h4>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 px-2"
                      onClick={() => handleCopy(suggestion.improved, suggestion.id)}
                    >
                      {copiedId === suggestion.id ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <p className="text-sm whitespace-pre-wrap">{suggestion.improved}</p>
                </div>
              </div>

              <div className="p-3 border-t bg-muted/20 flex items-center justify-between">
                <span className="text-xs text-muted-foreground">이 제안이 도움이 되었나요?</span>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`h-8 px-3 ${feedback[suggestion.id] === "helpful" ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300" : ""}`}
                    onClick={() => handleFeedback(suggestion.id, "helpful")}
                  >
                    <ThumbsUp className="h-4 w-4 mr-1" />
                    <span className="text-xs">도움됨</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`h-8 px-3 ${feedback[suggestion.id] === "not-helpful" ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300" : ""}`}
                    onClick={() => handleFeedback(suggestion.id, "not-helpful")}
                  >
                    <ThumbsDown className="h-4 w-4 mr-1" />
                    <span className="text-xs">도움 안됨</span>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
