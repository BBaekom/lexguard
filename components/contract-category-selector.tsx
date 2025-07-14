"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Check } from "lucide-react"

interface ContractCategory {
  id: string
  name: string
  examples: string
}

interface ContractCategorySelectorProps {
  onCategorySelect: (categoryId: string) => void
}

export function ContractCategorySelector({ onCategorySelect }: ContractCategorySelectorProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  const categories: ContractCategory[] = [
    { id: "employment", name: "고용/노무", examples: "근로계약서, 프리랜서 계약서" },
    { id: "realestate", name: "부동산", examples: "임대차 계약서, 부동산 매매계약서" },
    { id: "investment", name: "투자", examples: "투자유치 계약서, 주식양도 계약서" },
    { id: "service", name: "용역/도급", examples: "웹 개발 계약서, 디자인 외주 계약서" },
    { id: "nda", name: "NDA/비밀유지", examples: "NDA, 업무협약서(MOU)" },
    { id: "supply", name: "공급/매매", examples: "물품공급계약서, 유통 계약서" },
    { id: "license", name: "라이선스/지식재산권", examples: "저작권 계약, 소프트웨어 라이선스 계약" },
  ]

  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value)
    onCategorySelect(value)
  }

  return (
    <Card className="mb-6 w-full">
      <CardContent className="pt-6">
        <h3 className="text-lg font-medium mb-4">1. 계약 목적에 따른 분류</h3>
        <RadioGroup value={selectedCategory || ""} onValueChange={handleCategoryChange} className="w-full">
          <div className="grid grid-cols-1 gap-4 w-full">
            {categories.map((category) => (
              <div
                key={category.id}
                className={`relative flex items-center justify-between rounded-lg border p-4 cursor-pointer transition-colors w-full ${
                  selectedCategory === category.id
                    ? "border-rose-600 bg-rose-50 dark:bg-rose-950/20"
                    : "hover:bg-muted/50"
                }`}
                onClick={() => handleCategoryChange(category.id)}
              >
                <div className="flex items-center gap-4">
                  <RadioGroupItem value={category.id} id={category.id} className="sr-only" />
                  <div>
                    <Label htmlFor={category.id} className="text-base font-medium">
                      {category.name}
                    </Label>
                    <p className="text-sm text-muted-foreground">{category.examples}</p>
                  </div>
                </div>
                {selectedCategory === category.id && (
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-rose-600">
                    <Check className="h-4 w-4 text-white" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </RadioGroup>
      </CardContent>
    </Card>
  )
}
