'use client'

import { useState } from 'react'
import { normalizeLegalText, normalizeContractText, normalizeContractTextSafe, detectSpecialCharacters, getNormalizationSummary } from '@/lib/normalize'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default function TestNormalizePage() {
  const [inputText, setInputText] = useState(`제2조(기술자료의 정의)
(1) 이 계약에서 '기술자료'라 함은 수탁기업에 의해 비밀로 관리되고 있는 것으로서 다음 각 목의 어느 하나에 해당하는 정보 - 자료를 말한다.
가. 제조 $\\cdot$ 수리 $\\cdot$ 시공 또는 용역수행 방법에 관한 정보 $\\cdot$ 자료
나. 특허권, 실용신안권, 디자인권, 저작권 등의 지식재산권과 관련된 기술정보 - 자료로서 수탁기업의 기술개발(R\\&D) $\\cdot$ 생산 $\\cdot$ 영업활동에 기술적으로 유용하고 독립된 경제적 가치가 있는 것
다. 시공프로세스 매뉴얼, 장비 제원, 설계도면, 연구자료, 연구개발보고서 등 가목 또는 나목에 포함되지 않는 기타 사업자의 정보 - 자료로서 수탁기업의 기술개발(R\\&D) $\\cdot$ 생산 $\\cdot$ 영업활동에 기술적으로 유용하고 독립된 경제적 가치가 있는 것

체크리스트: 계약서 검토 시 확인사항; 계약 기간; 계약 금액; 위험 요소; 개선 사항; 최종 검토

체크리스트: 총한도(Fees x N)/간접손해 제외 여부' 위배; 손해배상 책임 한도 언급 부재로 인한 과도한 배상 책임 발생 가능성

체크리스트: 예외항목 명시 위배; 구체적인 예외 사항이 명시되지 않아 계약 이행 시 불이익 발생 가능성

체크리스트: IP침해 면책 범위와 방어권/통제권 위배; 지적재산권 침해 시 면책 범위가 불명확하여 분쟁 발생 가능성

제2조(기술자료의 정의) (1) 이 계약에서 '기술자료'라 함은 수탁기업에 의해 비밀로 관리되고 있는 것으로서 다음 각 목의 어느 하나에 해당하는 정보 - 자료를 말한다. 가. 제조 $·$ 수리 $·$ 시공 또는 용역수행 방법에 관한 정보 $·$ 자료 나. 특허권, 실용신안권, 디자인권, 저작권 등의 지식재산권과 관련된 기술정보 - 자료로서 수탁기업의 기술개발(R\&D) $·$ 생산 $·$ 영업활동에 기술적으로 유용하고 독립된 경제적 가치가 있는 것 다. 시공프로세스 매뉴얼, 장비 제원, 설계도면, 연구자료, 연구개발보고서 등 가목 또는 나목에 포함되지 않는 기타 사업자의 정보 - 자료로서 수탁기업의 기술개발(R\&D) $·$ 생산 $·$ 영업활동에 기술적으로 유용하고 독립된 경제적 가치가 있는 것

추가 LaTeX 패턴들: $\\cdot$, $\\cdots$, $\\ldots$, $\\vdots$, $\\square$, $\\&$, $\\R$, $\\D$

체크리스트: 총한도(Fees x N)/간접손해 제외 여부' 위배; 손해배상 책임 한도 언급 부재로 인한 과도한 배상 책임 발생 가능성

체크리스트: 예외항목 명시 위배; 구체적인 예외 사항이 명시되지 않아 계약 이행 시 불이익 발생 가능성

체크리스트: IP침해 면책 범위와 방어권/통제권 위배; 지적재산권 침해 시 면책 범위가 불명확하여 분쟁 발생 가능성

체크리스트: 합의권 제한 및 비용 처리 위배; 분쟁 발생 시 합의 권한이 제한되어 불리한 조건으로 합의할 위험

체크리스트: 준거법/재판관할 명확성 위배; 계약 해석 및 분쟁 해결 시 법적 불확실성 발생

체크리스트: 중재/소송 선택과 장소 위배; 분쟁 해결 방법이 불명확하여 절차적 지연 및 비용 증가 가능성

체크리스트: 계약서 검토 시 확인사항; 계약 기간; 계약 금액; 위험 요소; 개선 사항; 최종 검토

체크리스트: 추가 확인사항; 보안 요구사항; 데이터 보호 정책; 법적 준수사항; 분쟁 해결 절차

체크리스트: 계약 해지 조건; 보상 조항; 책임 한도; 면책 조항; 지적재산권 보호

(tm) (c) (r) <= >= ... --`)

  const [normalizedText, setNormalizedText] = useState('')
  const [detectionResult, setDetectionResult] = useState<any>(null)
  const [summary, setSummary] = useState<any>(null)

  const handleNormalize = (type: 'legal' | 'contract' | 'safe', level: 'off' | 'conservative' | 'aggressive' | 'safe') => {
    let result = ''
    
    if (type === 'legal') {
      result = normalizeLegalText(inputText, { typography: level })
    } else if (type === 'safe') {
      result = normalizeContractTextSafe(inputText, { 
        typography: 'safe',
        legalSymbols: true,
        listFormatting: true
      })
    } else {
      result = normalizeContractText(inputText, { 
        typography: level,
        legalSymbols: true,
        listFormatting: true
      })
    }
    
    setNormalizedText(result)
    
    // 특수문자 탐지
    const detected = detectSpecialCharacters(inputText)
    setDetectionResult(detected)
    
    // 정규화 요약
    const normSummary = getNormalizationSummary(inputText, result)
    setSummary(normSummary)
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <h1 className="text-3xl font-bold mb-6">특수문자 정규화 테스트</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 입력 영역 */}
        <Card>
          <CardHeader>
            <CardTitle>입력 텍스트</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="테스트할 텍스트를 입력하세요..."
              className="min-h-[400px] font-mono text-sm"
            />
            
                    <div className="mt-4 space-y-2">
          <div className="flex gap-2">
            <Button 
              onClick={() => handleNormalize('legal', 'conservative')}
              variant="outline"
              size="sm"
            >
              법률 텍스트 정규화 (보수적)
            </Button>
            <Button 
              onClick={() => handleNormalize('legal', 'aggressive')}
              variant="outline"
              size="sm"
            >
              법률 텍스트 정규화 (공격적)
            </Button>
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={() => handleNormalize('contract', 'conservative')}
              variant="outline"
              size="sm"
            >
              계약서 정규화 (보수적)
            </Button>
            <Button 
              onClick={() => handleNormalize('contract', 'aggressive')}
              variant="outline"
              size="sm"
            >
              계약서 정규화 (공격적)
            </Button>
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={() => handleNormalize('safe', 'safe')}
              variant="default"
              size="sm"
              className="bg-green-600 hover:bg-green-700"
            >
              🛡️ 안전한 계약서 정규화 (권장)
            </Button>
            <Button 
              onClick={() => handleNormalize('contract', 'aggressive')}
              variant="outline"
              size="sm"
              className="border-blue-600 text-blue-600 hover:bg-blue-50"
            >
              🚀 강력한 계약서 정규화
            </Button>
          </div>
        </div>
          </CardContent>
        </Card>

        {/* 결과 영역 */}
        <Card>
          <CardHeader>
            <CardTitle>정규화 결과</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="result" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="result">결과</TabsTrigger>
                <TabsTrigger value="detection">탐지</TabsTrigger>
                <TabsTrigger value="summary">요약</TabsTrigger>
              </TabsList>
              
              <TabsContent value="result" className="mt-4">
                <div className="border rounded p-3 bg-gray-50 min-h-[400px]">
                  <pre className="whitespace-pre-wrap font-mono text-sm">{normalizedText || '정규화 버튼을 클릭하세요...'}</pre>
                </div>
              </TabsContent>
              
              <TabsContent value="detection" className="mt-4">
                <div className="space-y-3">
                  {detectionResult ? (
                    Object.entries(detectionResult).map(([key, values]) => (
                      <div key={key} className="border rounded p-3">
                        <h4 className="font-semibold mb-2 capitalize">{key}</h4>
                        {Array.isArray(values) && values.length > 0 ? (
                          <div className="space-y-1">
                            {values.slice(0, 5).map((value, idx) => (
                              <div key={idx} className="text-sm bg-gray-100 p-1 rounded">
                                {String(value)}
                              </div>
                            ))}
                            {values.length > 5 && (
                              <div className="text-xs text-gray-500">
                                ... 및 {values.length - 5}개 더
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="text-sm text-gray-500">발견되지 않음</div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="text-gray-500">정규화 버튼을 클릭하세요...</div>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="summary" className="mt-4">
                {summary ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="border rounded p-3">
                        <div className="text-sm font-medium">원본 길이</div>
                        <div className="text-lg font-bold">{summary.originalLength}</div>
                      </div>
                      <div className="border rounded p-3">
                        <div className="text-sm font-medium">정규화 후 길이</div>
                        <div className="text-lg font-bold">{summary.normalizedLength}</div>
                      </div>
                    </div>
                    
                    <div className="border rounded p-3">
                      <div className="text-sm font-medium">변경 여부</div>
                      <div className={`text-lg font-bold ${summary.changes ? 'text-blue-600' : 'text-gray-600'}`}>
                        {summary.changes ? '변경됨' : '변경되지 않음'}
                      </div>
                    </div>
                    
                    <div className="border rounded p-3">
                      <div className="text-sm font-medium">특수문자 총 개수</div>
                      <div className="text-lg font-bold">{summary.totalSpecialChars}</div>
                    </div>
                    
                    <div className="border rounded p-3">
                      <div className="text-sm font-medium">효율성</div>
                      <div className="text-lg font-bold">{summary.efficiency}%</div>
                    </div>
                  </div>
                ) : (
                  <div className="text-gray-500">정규화 버튼을 클릭하세요...</div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
