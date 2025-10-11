"use client"

import { useEffect, useState, useRef } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Badge } from "@/components/ui/badge"
import { ContractViewer } from "./contract-viewer"
import { RiskAnalysis } from "./risk-analysis"
import { ImprovementSuggestions } from "./improvement-suggestions"
import { SummaryReport } from "./summary-report"
import { Doughnut, Bar } from 'react-chartjs-2';
import { Chart, ArcElement, Tooltip as ChartTooltip, Legend, BarElement, CategoryScale, LinearScale } from 'chart.js';
import { Download } from "lucide-react"
import { normalizeContractText, normalizeContractTextSafe, detectSpecialCharacters, getNormalizationSummary } from "@/lib/normalize"
import { useReactToPrint } from 'react-to-print'
import { toast } from "@/components/ui/use-toast"
Chart.register(ArcElement, ChartTooltip, Legend, BarElement, CategoryScale, LinearScale);

// 인쇄용 CSS 스타일
const PAGE_STYLE = `
  @page { size: A4; margin: 16mm; }
  @media print {
    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .avoid-break, tr, img, pre, blockquote { break-inside: avoid; }
    thead { display: table-header-group; }
  }
`

interface ContractAnalysisResultProps {
  contractId: string
  analysisData?: any
  defaultTab?: string
}

export function ContractAnalysisResult({ contractId, analysisData, defaultTab = "summary" }: ContractAnalysisResultProps) {
  const [data, setData] = useState<any>(analysisData || null)
  const [loading, setLoading] = useState(!analysisData)
  const [activeTab, setActiveTab] = useState(defaultTab)
  const [highlightedClause, setHighlightedClause] = useState<string | null>(null)
  const [selectedClause, setSelectedClause] = useState<any>(null)
  const [isClient, setIsClient] = useState(false)

  // 각 탭에 대한 ref 생성
  const summaryRef = useRef<HTMLDivElement>(null)
  const riskRef = useRef<HTMLDivElement>(null)
  const improvementsRef = useRef<HTMLDivElement>(null)
  const amendmentRef = useRef<HTMLDivElement>(null)

  const refs = { 
    summary: summaryRef, 
    risks: riskRef, 
    improvements: improvementsRef,
    amendment: amendmentRef
  }

  // // react-to-print 설정
  // const handlePrint = useReactToPrint({
  //   content: () => refs[activeTab as keyof typeof refs]?.current,
  //   documentTitle: `계약서분석_${activeTab}_${contractId}_${new Date().toISOString().slice(0,10)}`,
  //   pageStyle: PAGE_STYLE,
  // })

  // 탭 변경 핸들러
  const handleTabChange = (value: string) => {
    setActiveTab(value)
  }

  useEffect(() => {
    // 클라이언트 사이드에서만 실행
    if (typeof window !== 'undefined') {
      setIsClient(true)
    }
  }, [])

  useEffect(() => {
    if (analysisData) {
      console.log('🔍 Props로 받은 분석 데이터:', {
        hasData: !!analysisData,
        dataType: typeof analysisData,
        keys: Object.keys(analysisData || {}),
        clauseCount: analysisData?.clause_analysis?.length,
        sampleText: analysisData?.clause_analysis?.[0]?.risk_assessment?.explanation?.substring(0, 100)
      })
      
      // 백엔드 데이터에 전처리 적용
      const processedData = preprocessAnalysisData(analysisData)
      setData(processedData)
      setLoading(false)
    } else {
      console.log('🔍 API에서 분석 데이터 가져오기:', contractId)
      fetch(`/api/analysis/result?id=${contractId}`)
        .then(res => res.json())
        .then((rawData) => {
          console.log('🔍 API 응답 데이터:', {
            hasData: !!rawData,
            dataType: typeof rawData,
            keys: Object.keys(rawData || {}),
            clauseCount: rawData?.clause_analysis?.length,
            sampleText: rawData?.clause_analysis?.[0]?.risk_assessment?.explanation?.substring(0, 100)
          })
          
          // 백엔드 데이터에 전처리 적용
          const processedData = preprocessAnalysisData(rawData)
          setData(processedData)
        })
        .finally(() => setLoading(false))
    }
  }, [contractId, analysisData])

  // PDF 다운로드 함수들 - 클라이언트 사이드 전용
  const downloadAsPDF = async (type: string) => {
    try {
      const targetRef = refs[type as keyof typeof refs];
      if (!targetRef?.current) return;

      // 동적으로 html2canvas와 jsPDF import
      const [html2canvasModule, jsPDFModule] = await Promise.all([
        import('html2canvas'),
        import('jspdf')
      ]);
      const html2canvas = html2canvasModule.default;
      const jsPDF = jsPDFModule.default;

      const targetElement = targetRef.current;
      
      console.log('🎯 PDF 다운로드 시작:', type);
      console.log('📏 타겟 요소 크기:', {
        offsetWidth: targetElement.offsetWidth,
        offsetHeight: targetElement.offsetHeight,
        scrollWidth: targetElement.scrollWidth,
        scrollHeight: targetElement.scrollHeight,
        clientWidth: targetElement.clientWidth,
        clientHeight: targetElement.clientHeight
      });

      // 간단한 캡처 - 기본 옵션만 사용
      const canvas = await html2canvas(targetElement, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: true
      });

      console.log('📸 캡처 완료:', {
        canvasWidth: canvas.width,
        canvasHeight: canvas.height
      });

      // PDF 생성
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      const imgWidth = 210; // A4 너비 (mm)
      const pageHeight = 295; // A4 높이 (mm)
      
      // 이미지 크기 계산 (비율 유지)
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      console.log('📄 PDF 크기:', {
        imgWidth,
        imgHeight,
        pageHeight,
        pagesNeeded: Math.ceil(imgHeight / pageHeight)
      });

      // 페이지 분할
      let heightLeft = imgHeight;
      let position = 0;

      // 첫 페이지
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      // 추가 페이지가 필요한 경우
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      // 파일 저장
      const filename = `${getTabTitle(type)}_${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(filename);
      
      console.log('✅ PDF 다운로드 완료:', filename);
      
      toast({
        title: "성공",
        description: "PDF 다운로드가 완료되었습니다.",
      });

    } catch (error) {
      console.error('❌ PDF 다운로드 오류:', error);
      toast({
        title: "오류",
        description: "PDF 다운로드 중 문제가 발생했습니다.",
        variant: "destructive",
      });
    }
  };
  
  // 탭 제목 반환 함수
  const getTabTitle = (type: string) => {
    switch (type) {
      case 'summary': return '요약 보고서';
      case 'risks': return '리스크 분석';
      case 'improvements': return '개선 제안';
      case 'amendment': return '계약서 개정안';
      default: return '계약서 분석';
    }
  };

    // 백엔드 데이터 전처리 함수 - 화면 표시 텍스트만 전처리
  const preprocessAnalysisData = (rawData: any) => {
    if (!rawData) return rawData
    
    console.log('🔍 백엔드 원본 데이터:', rawData)
    console.log('🔍 clause_analysis 개수:', rawData.clause_analysis?.length)
    
    const processedData = { ...rawData }
    
    // clause_analysis의 화면 표시 텍스트들만 전처리
    if (processedData.clause_analysis) {
      console.log('🔍 clause_analysis 전처리 전:', processedData.clause_analysis.map((c: any) => ({
        id: c.original_identifier || c.clause_id,
        text_length: c.original_text?.length,
        explanation_length: c.risk_assessment?.explanation?.length
      })))
      
            processedData.clause_analysis = processedData.clause_analysis.map((clause: any) => {
        const originalText = clause.original_text || ''
        const explanation = clause.risk_assessment?.explanation || ''
        
        const normalizedOriginal = normalizeContractTextSafe(originalText, {
          typography: 'safe',
          legalSymbols: true,
          listFormatting: false
        })
        
        const normalizedExplanation = normalizeContractTextSafe(explanation, {
          typography: 'safe',
          legalSymbols: true,
          listFormatting: true
        })
        
        // 데이터 무결성 확인
        if (explanation && explanation.length > 0) {
          console.log('🔍 리스크 분석 텍스트 상세 정보:', {
            clauseId: clause.original_identifier || clause.clause_id,
            originalLength: explanation.length,
            normalizedLength: normalizedExplanation.length,
            originalPreview: explanation.substring(0, 200) + '...',
            normalizedPreview: normalizedExplanation.substring(0, 200) + '...',
            hasDataLoss: normalizedExplanation.length < explanation.length,
            dataLossPercentage: explanation.length > 0 ? ((explanation.length - normalizedExplanation.length) / explanation.length * 100).toFixed(2) + '%' : '0%'
          })
        }
        
        // 디버깅 로그
        if (originalText !== normalizedOriginal) {
          console.log('🔍 원본 텍스트 변환:', {
            before: originalText.substring(0, 100),
            after: normalizedOriginal.substring(0, 100)
          })
        }
        
        if (explanation !== normalizedExplanation) {
          console.log('🔍 설명 텍스트 변환:', {
            before: explanation.substring(0, 100),
            after: normalizedExplanation.substring(0, 100),
            beforeLength: explanation.length,
            afterLength: normalizedExplanation.length
          })
        }
        
        return {
          ...clause,
          // 리스크 분석 탭에 표시되는 원본 조항 텍스트
          original_text: normalizedOriginal,
          risk_assessment: {
            ...clause.risk_assessment,
            // 리스크 분석 설명 텍스트 - 체크리스트 시작 부분 '·' 변환 및 ';' 개행 처리
            explanation: normalizedExplanation
          }
        }
      })
      
      console.log('🔍 clause_analysis 전처리 후:', processedData.clause_analysis.map((c: any) => ({
        id: c.original_identifier || c.clause_id,
        text_length: c.original_text?.length,
        explanation_length: c.risk_assessment?.explanation?.length
      })))
    }
    
    // summary 전처리 (요약 보고서 탭에 표시)
    if (processedData.summary) {
      console.log('📋 Summary 전처리 전:', processedData.summary.substring(0, 100) + '...')
      processedData.summary = normalizeContractTextSafe(processedData.summary, {
        typography: 'safe', // 안전한 변환을 위해 safe 사용
        legalSymbols: true,
        listFormatting: false
      })
      console.log('📋 Summary 전처리 후:', processedData.summary.substring(0, 100) + '...')
    }
    
    console.log('✅ 전처리 완료된 데이터:', processedData)
    return processedData
  }

  if (loading) return <div>로딩 중...</div>
  if (!data) return <div>분석 결과를 찾을 수 없습니다.</div>

  // 전체 리스크 점수 도넛 차트 데이터
  const doughnutData = {
    labels: ['리스크 점수', '안전 점수'],
    datasets: [
      {
        data: [
          // "지금으로도 충분합니다."인 조항들을 제외한 실제 리스크 점수 계산
          (() => {
            if (data.clause_analysis && data.clause_analysis.length > 0) {
              const validClauses = data.clause_analysis.filter((clause: any) => 
                !(
                  !clause.revised_spans || 
                  clause.revised_spans === null || 
                  clause.revised_spans.length === 0 ||
                  clause.revised_text?.trim() === "지금으로도 충분합니다." ||
                  clause.revised_text?.trim() === "지금으로도 충분합니다" ||
                  clause.risk_assessment?.recommendations?.some((rec: string) => 
                    rec.trim() === "지금으로도 충분합니다." || 
                    rec.trim() === "지금으로도 충분합니다"
                  )
                )
              );
              
              if (validClauses.length > 0) {
                const totalRiskScore = validClauses.reduce((sum: number, clause: any) => 
                  sum + (clause.risk_assessment?.risk_score || 0), 0
                );
                return Math.round(totalRiskScore / validClauses.length);
              }
            }
            return data.overall_risk_assessment?.risk_score ?? data.summary?.riskScore ?? 0;
          })(),
          100 - (() => {
            if (data.clause_analysis && data.clause_analysis.length > 0) {
              const validClauses = data.clause_analysis.filter((clause: any) => 
                !(
                  !clause.revised_spans || 
                  clause.revised_spans === null || 
                  clause.revised_spans.length === 0 ||
                  clause.revised_text?.trim() === "지금으로도 충분합니다." ||
                  clause.revised_text?.trim() === "지금으로도 충분합니다" ||
                  clause.risk_assessment?.recommendations?.some((rec: string) => 
                    rec.trim() === "지금으로도 충분합니다." || 
                    rec.trim() === "지금으로도 충분합니다"
                  )
                )
              );
              
              if (validClauses.length > 0) {
                const totalRiskScore = validClauses.reduce((sum: number, clause: any) => 
                  sum + (clause.risk_assessment?.risk_score || 0), 0
                );
                return Math.round(totalRiskScore / validClauses.length);
              }
            }
            return data.overall_risk_assessment?.risk_score ?? data.summary?.riskScore ?? 0;
          })()
        ],
        backgroundColor: ['rgb(245, 158, 11)', '#e5e7eb'], // rgb(245, 158, 11) = bg-amber-500 (계약서 정보 탭 그래프 색상과 동일)
        borderWidth: 0,
      },
    ],
  };

  // 조항별 리스크 점수 막대 차트 데이터
  const barData = {
    labels: data.clause_analysis?.map((clause: any) => clause.original_identifier || clause.clause_id) ?? 
            data.clauses?.map((clause: any) => `${clause.clause_number} ${clause.clause_title}`) ?? [],
    datasets: [
      {
        label: '조항별 리스크 점수',
        data: data.clause_analysis?.map((clause: any) => {
          // revised_spans이 null이거나, revised_text가 "지금으로도 충분합니다."인 경우,
          // 또는 recommendations가 "지금으로도 충분합니다."인 경우 리스크 점수를 0으로 처리
          if (
            !clause.revised_spans || 
            clause.revised_spans === null || 
            clause.revised_spans.length === 0 ||
            clause.revised_text?.trim() === "지금으로도 충분합니다." ||
            clause.revised_text?.trim() === "지금으로도 충분합니다" ||
            clause.risk_assessment?.recommendations?.some((rec: string) => 
              rec.trim() === "지금으로도 충분합니다." || 
              rec.trim() === "지금으로도 충분합니다"
            )
          ) {
            return 0;
          }
          return clause.risk_assessment?.risk_score ?? 0;
        }) ?? 
        data.clauses?.map((clause: any) => clause.risk_score) ?? [],
        backgroundColor: (data.clause_analysis?.map(() => 'rgb(245, 158, 11)') ?? data.clauses?.map(() => 'rgb(245, 158, 11)') ?? []), // rgb(245, 158, 11) = bg-amber-500 (계약서 정보 탭 그래프 색상과 동일)
      },
    ],
  };

  // 텍스트에서 조항 강조 처리
  const highlightText = (text: string, clause: any) => {
    if (!clause || !clause.clause_content) return text;
    
    const clauseContent = clause.clause_content.trim();
    const regex = new RegExp(`(${clauseContent.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    
    return text.replace(regex, (match) => {
      return `<mark class="bg-yellow-200 dark:bg-yellow-800 px-1 rounded cursor-pointer" data-clause-id="${clause.clause_number}">${match}</mark>`;
    });
  };

  // 텍스트 완성도 체크 및 완성된 부분만 반환
  const getCompleteText = (text: string) => {
    if (!text) return text
    
    const trimmedText = text.trim()
    
    // 온점, 느낌표, 물음표로 끝나는 경우 완성된 텍스트
    if (/[.!?]$/.test(trimmedText)) {
      return text
    }
    
    // 마지막 개행을 찾아서 그 이전까지의 텍스트 반환
    const lines = text.split('\n')
    if (lines.length > 1) {
      // 마지막 줄이 완성되지 않았으면 제거
      const completeLines = lines.slice(0, -1)
      return completeLines.join('\n').trim()
    }
    
    // 개행이 없으면 원본 텍스트 반환
    return text
  }

  // 온점 뒤에 개행 추가하여 가독성 향상
  const formatRiskAnalysisText = (text: string) => {
    if (!text) return text
    
    // 온점 뒤에 공백과 문자가 오는 경우 개행 추가
    return text.replace(/\.\s+(?=[가-힣a-zA-Z0-9·\-])/g, '.\n')
  }



  // 리스크 레벨에 따른 색상 반환 (LOW, MEDIUM, HIGH, CRITICAL 기준)
  const getRiskColors = (riskLevel: string) => {
    switch (riskLevel?.toUpperCase()) {
      case 'CRITICAL':
        return {
          bg: 'bg-red-50 dark:bg-red-950',
          border: 'border-red-200 dark:border-red-800',
          text: 'text-red-700 dark:text-red-300',
          badge: 'bg-red-500 text-white dark:bg-red-600 dark:text-white',
          label: '높음',
          highlight: 'bg-red-100/50 dark:bg-red-700/50'
        };
      case 'HIGH':
        return {
          bg: 'bg-yellow-50 dark:bg-yellow-950',
          border: 'border-yellow-200 dark:border-yellow-800',
          text: 'text-yellow-700 dark:text-yellow-300',
          badge: 'bg-yellow-500 text-white dark:bg-yellow-600 dark:text-white',
          label: '보통',
          highlight: 'bg-yellow-100/50 dark:bg-yellow-700/50'
        };
      case 'MEDIUM':
        return {
          bg: 'bg-green-50 dark:bg-green-950',
          border: 'border-green-200 dark:border-green-800',
          text: 'text-green-700 dark:text-green-300',
          badge: 'bg-green-500 text-white dark:bg-green-600 dark:text-white',
          label: '낮음',
          highlight: 'bg-green-100/50 dark:bg-green-700/50'
        };
      case 'LOW':
        return {
          bg: 'bg-green-50 dark:bg-green-950',
          border: 'border-green-200 dark:border-green-800',
          text: 'text-green-700 dark:text-green-300',
          badge: 'bg-green-500 text-white dark:bg-green-600 dark:text-white',
          label: '낮음',
          highlight: 'bg-green-100/50 dark:bg-green-700/50'
        };
      default:
        return {
          bg: 'bg-sky-50 dark:bg-sky-950',
          border: 'border-sky-200 dark:border-sky-800',
          text: 'text-sky-700 dark:text-sky-300',
          badge: 'bg-sky-500 text-white dark:bg-sky-600 dark:text-white',
          label: '안전',
          highlight: 'bg-sky-100/50 dark:bg-sky-700/50'
        };
    }
  };



  // revised_spans를 활용하여 변동사항을 강조 표시 (PDF 최적화)
  const renderHighlightedText = (text: string, spans: any[], riskLevel: string) => {
    if (!text || !spans || spans.length === 0) {
      return <span>{text}</span>;
    }

    const colors = getRiskColors(riskLevel);
    const result = [];
    let lastIndex = 0;

    // spans를 start 위치 기준으로 정렬
    const sortedSpans = [...spans].sort((a, b) => a.start - b.start);

    sortedSpans.forEach((span, index) => {
      // span 이전의 일반 텍스트 추가
      if (span.start > lastIndex) {
        result.push(
          <span key={`text-${index}`}>
            {text.slice(lastIndex, span.start)}
          </span>
        );
      }

      // span에 해당하는 텍스트를 변동사항으로 강조 표시
      const spanText = text.slice(span.start, span.end);
      
      // 위험도에 따른 스타일 (PDF에서 잘 보이도록)
      const getRiskStyle = (level: string) => {
        switch (level) {
          case 'CRITICAL':
            return {
              backgroundColor: '#fef2f2',
              padding: '2px 6px',
              fontWeight: '600',
              color: '#991b1b',
              borderRadius: '4px'
            };
          case 'HIGH':
            return {
              backgroundColor: '#fef3c7',
              padding: '2px 6px',
              fontWeight: '600',
              color: '#92400e',
              borderRadius: '4px'
            };
          case 'MEDIUM':
            return {
              backgroundColor: '#f0fdf4',
              padding: '2px 6px',
              fontWeight: '600',
              color: '#065f46',
              borderRadius: '4px'
            };
          case 'LOW':
            return {
              backgroundColor: '#f0fdf4',
              padding: '2px 6px',
              fontWeight: '600',
              color: '#065f46',
              borderRadius: '4px'
            };
          default:
            return {
              backgroundColor: '#f0f9ff',
              padding: '2px 6px',
              fontWeight: '600',
              color: '#1e40af',
              borderRadius: '4px'
            };
        }
      };

      const spanStyle = getRiskStyle(riskLevel);
      
      result.push(
        <span 
          key={`span-${index}`} 
          className="inline-block rounded"
          style={spanStyle}
        >
          {spanText}
        </span>
      );

      lastIndex = span.end;
    });

    // 마지막 span 이후의 텍스트 추가
    if (lastIndex < text.length) {
      result.push(
        <span key="text-end">
          {text.slice(lastIndex)}
        </span>
      );
    }

    return <>{result}</>;
  };

  // 원본 계약서에서 개정이 필요한 조항을 하이라이트하여 표시
  const renderOriginalContractWithHighlights = (originalText: string, clauses: any[]) => {
    if (!originalText || !clauses || clauses.length === 0) {
      return <span>{originalText}</span>;
    }

    const result = [];
    let lastIndex = 0;
    let clauseIndex = 0;

    // 각 조항을 원본 텍스트에서 찾아서 하이라이트
    clauses.forEach((clause, idx) => {
      const clauseText = clause.original_text || '';
      if (!clauseText) return;

      // 원본 텍스트에서 해당 조항 찾기
      const textIndex = originalText.indexOf(clauseText, lastIndex);
      if (textIndex === -1) return;

      // 조항 이전의 일반 텍스트 추가
      if (textIndex > lastIndex) {
        result.push(
          <span key={`text-${idx}`}>
            {originalText.slice(lastIndex, textIndex)}
          </span>
        );
      }

      // 조항을 리스크 레벨에 따른 색상으로 하이라이트
      const colors = getRiskColors(clause.risk_assessment?.risk_level);
      const highlightClass = `px-1 rounded font-medium ${colors.highlight} cursor-pointer hover:shadow-sm transition-shadow`;
      
      result.push(
        <TooltipProvider key={`clause-${idx}`}>
          <Tooltip>
            <TooltipTrigger asChild>
              <span 
                className={highlightClass}
                onClick={() => {
                  // 해당 조항으로 스크롤 (필요시)
                  console.log('클릭된 조항:', clause);
                }}
              >
                {clauseText}
              </span>
            </TooltipTrigger>
            <TooltipContent>
              <div className="text-sm">
                <p className="font-medium">{clause.original_identifier || clause.clause_id}</p>
                <p className="text-muted-foreground">리스크: {clause.risk_assessment?.risk_level}</p>
                <p className="text-muted-foreground">점수: {clause.risk_assessment?.risk_score}</p>
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );

      lastIndex = textIndex + clauseText.length;
    });

    // 마지막 조항 이후의 텍스트 추가
    if (lastIndex < originalText.length) {
      result.push(
        <span key="text-end">
          {originalText.slice(lastIndex)}
        </span>
      );
    }

    return <>{result}</>;
  };

  // revised_text와 revised_spans를 사용하여 변동사항만 형광펜 효과로 표시
  const renderIntegratedContract = (originalText: string, clauses: any[]) => {
    if (!clauses || clauses.length === 0) {
      return <span>{originalText}</span>;
    }

    // 모든 조항을 표시하되, revised_text가 있으면 그것을 사용하고 없으면 original_text 사용
    const allClauses = clauses || [];
    
    if (allClauses.length === 0) {
      return <span>{originalText}</span>;
    }

    // revised_text들을 인라인으로 연결하고 변동사항만 형광펜 효과
    const result: React.ReactElement[] = [];
    
    allClauses.forEach((clause, idx) => {
      const revisedClauseText = clause.revised_text || '';
      const originalClauseText = clause.original_text || '';
      const revisedSpans = clause.revised_spans || [];
      
      // revised_text가 없으면 original_text 사용
      const displayClauseText = revisedClauseText || originalClauseText;
      if (!displayClauseText) return;

      // revised_spans이 null이거나, revised_text가 "지금으로도 충분합니다."인 경우, 
      // 또는 recommendations가 "지금으로도 충분합니다."인 경우 리스크 점수를 0으로, 등급을 UNKNOWN으로 처리
      let riskLevel = clause.risk_assessment?.risk_level || 'UNKNOWN';
      let riskScore = clause.risk_assessment?.risk_score || 0;
      
      if (
        !clause.revised_spans || 
        clause.revised_spans === null || 
        clause.revised_spans.length === 0 ||
        clause.revised_text?.trim() === "지금으로도 충분합니다." ||
        clause.revised_text?.trim() === "지금으로도 충분합니다" ||
        clause.risk_assessment?.recommendations?.some((rec: string) => 
          rec.trim() === "지금으로도 충분합니다." || 
          rec.trim() === "지금으로도 충분합니다"
        )
      ) {
        riskLevel = 'UNKNOWN';
        riskScore = 0;
      }

      // UNKNOWN 등급인 경우 원문 텍스트 사용, 그 외에는 revised_text 사용 (없으면 original_text)
      const displayText = riskLevel === 'UNKNOWN' ? originalClauseText : (revisedClauseText || originalClauseText);

      // revised_spans가 있으면 변동사항만 형광펜 효과
      if (revisedSpans.length > 0 && riskLevel !== 'UNKNOWN') {
        result.push(
          <div key={`clause-${idx}`} className="mb-4">
            <div className="text-sm font-medium text-gray-600 mb-2">
              {clause.original_identifier || clause.clause_id}
            </div>
            {renderHighlightedText(revisedClauseText, revisedSpans, riskLevel)}
          </div>
        );
      } else {
        // revised_spans가 없거나 UNKNOWN 등급인 경우
        if (riskLevel === 'UNKNOWN') {
          // UNKNOWN 등급인 경우 형광펜 효과 없이 원문 텍스트만 표시
          result.push(
            <div key={`clause-${idx}`} className="mb-4">
              <div className="text-sm font-medium text-gray-600 mb-2">
                {clause.original_identifier || clause.clause_id}
              </div>
              <span className="text-gray-800">
                {displayText}
              </span>
            </div>
          );
        } else {
          // 다른 등급인 경우 변동사항 강조 표시
          const getRiskStyle = (level: string) => {
            switch (level) {
              case 'CRITICAL':
                return {
                  backgroundColor: '#fef2f2',
                  padding: '8px 12px',
                  fontWeight: '600',
                  color: '#991b1b',
                  borderRadius: '4px'
                };
              case 'HIGH':
                return {
                  backgroundColor: '#fef3c7',
                  padding: '8px 12px',
                  fontWeight: '500',
                  color: '#92400e',
                  borderRadius: '4px'
                };
              case 'MEDIUM':
                return {
                  backgroundColor: '#f0fdf4',
                  padding: '8px 12px',
                  fontWeight: '500',
                  color: '#065f46',
                  borderRadius: '4px'
                };
              case 'LOW':
                return {
                  backgroundColor: '#f0fdf4',
                  padding: '8px 12px',
                  fontWeight: '500',
                  color: '#065f46',
                  borderRadius: '4px'
                };
              default:
                return {
                  backgroundColor: '#f0f9ff',
                  padding: '8px 12px',
                  fontWeight: '500',
                  color: '#1e40af',
                  borderRadius: '4px'
                };
            }
          };

          const clauseStyle = getRiskStyle(riskLevel);
          
          // 디버깅 로그
          console.log('계약서 개정안 - 조항:', {
            clause_id: clause.clause_id,
            risk_level: riskLevel,
            style: clauseStyle
          });
          
          result.push(
            <div key={`clause-${idx}`} className="mb-4">
              <div className="text-sm font-medium text-gray-600 mb-2">
                {clause.original_identifier || clause.clause_id} ({riskLevel})
              </div>
              <div 
                className="rounded"
                style={clauseStyle}
              >
                {displayText}
              </div>
            </div>
          );
        }
      }
    });

    return <>{result}</>;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2">
        <Tabs defaultValue={defaultTab} className="w-full" onValueChange={handleTabChange}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="summary">요약 보고서</TabsTrigger>
            <TabsTrigger value="risks">리스크 분석</TabsTrigger>
            <TabsTrigger value="improvements">개선 제안</TabsTrigger>
            <TabsTrigger value="amendment">계약서 개정안</TabsTrigger>
          </TabsList>
          <TabsContent value="summary">
            <div id="summary-tab-content" data-tab="summary" ref={summaryRef}>
              <Card>
                <CardContent className="pt-6">
                <div className="flex flex-col md:flex-row gap-8 mb-6 items-center chart-section">
                  <div className="w-40 h-40 flex flex-col items-center justify-center relative">
                    <Doughnut
                      data={doughnutData}
                      options={{
                        cutout: '70%',
                        plugins: { legend: { display: false } }
                      }}
                    />
                    <div className="text-base font-semibold text-amber-500 mt-2 whitespace-nowrap">
                      전체 리스크 점수: {data.overall_risk_assessment?.risk_score || data.summary?.riskScore}
                    </div>
                  </div>
                  <div className="flex-1">
                    {data.clause_analysis?.length > 0 ? (
                      <>
                        <Bar
                          data={{
                            labels: data.clause_analysis.map((clause: any) => clause.original_identifier || clause.clause_id),
                            datasets: [{
                              label: '조항별 리스크 점수',
                              data:                 data.clause_analysis.map((clause: any) => {
                  // revised_spans이 null이거나, revised_text가 "지금으로도 충분합니다."인 경우,
                  // 또는 recommendations가 "지금으로도 충분합니다."인 경우 리스크 점수를 0으로 처리
                  if (
                    !clause.revised_spans || 
                    clause.revised_spans === null || 
                    clause.revised_spans.length === 0 ||
                    clause.revised_text?.trim() === "지금으로도 충분합니다." ||
                    clause.revised_text?.trim() === "지금으로도 충분합니다" ||
                    clause.risk_assessment?.recommendations?.some((rec: string) => 
                      rec.trim() === "지금으로도 충분합니다." || 
                      rec.trim() === "지금으로도 충분합니다"
                    )
                  ) {
                    return 0;
                  }
                  return clause.risk_assessment?.risk_score ?? 0;
                }),
                              backgroundColor: '#d97706' // amber-600 색상으로 고정 (전체 리스크 점수 글자 색상과 동일)
                            }]
                          }}
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
                  <div className="font-semibold mb-1">주요 개선 사항</div>
                  <ul className="list-disc list-inside text-sm space-y-1">
                    {data.overall_risk_assessment?.recommendations
                      ?.filter((rec: string) => 
                        rec.trim() !== "지금으로도 충분합니다." && 
                        rec.trim() !== "지금으로도 충분합니다" &&
                        rec.trim() !== "지금으로도 충분합니다."
                      )
                      ?.slice(0, 5)
                      ?.map((rec: string, idx: number) => (
                        <li key={idx} className="text-gray-700">{rec}</li>
                      ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
            </div>
          </TabsContent>
          <TabsContent value="risks">
            <div id="risk-tab-content" data-tab="risk" ref={riskRef}>
              <Card>
                <CardContent className="space-y-6 pt-6">
                {data.clause_analysis
                  ?.map((clause: any, idx: number) => {
                    // 리스크 분석 설명에서 '근거 부족'과 'Sufficient as-is.' 항목 제거
                    let filteredExplanation = clause.risk_assessment?.explanation || '';
                    
                    // '근거 부족'과 'Sufficient as-is.'로 시작하는 항목들을 제거
                    if (filteredExplanation) {
                      // 줄바꿈이나 세미콜론으로 구분된 항목들을 분리
                      const items = filteredExplanation.split(/[\n;]/).filter((item: string) => item.trim());
                      
                      // '근거 부족'과 'Sufficient as-is.'로 시작하지 않는 항목들만 유지
                      const filteredItems = items.filter((item: string) => {
                        const trimmedItem = item.trim();
                        return !trimmedItem.startsWith('근거 부족') && 
                               !trimmedItem.startsWith('·근거 부족') &&
                               !trimmedItem.startsWith('-근거 부족') &&
                               !trimmedItem.startsWith('Sufficient as-is.') &&
                               !trimmedItem.startsWith('Sufficient as-is') &&
                               trimmedItem !== 'Sufficient as-is.' &&
                               trimmedItem !== 'Sufficient as-is';
                      });
                      
                      // 필터링된 항목들을 다시 조합
                      filteredExplanation = filteredItems.join('\n');
                    }
                    
                    // revised_spans이 null이거나, revised_text가 "지금으로도 충분합니다."인 경우,
                    // 또는 recommendations가 "지금으로도 충분합니다."인 경우 리스크 점수를 0으로, 등급을 UNKNOWN으로 처리
                    let riskLevel = clause.risk_assessment?.risk_level || 'UNKNOWN';
                    let riskScore = clause.risk_assessment?.risk_score || 0;
                    
                    if (
                      !clause.revised_spans || 
                      clause.revised_spans === null || 
                      clause.revised_spans.length === 0 ||
                      clause.revised_text?.trim() === "지금으로도 충분합니다." ||
                      clause.revised_text?.trim() === "지금으로도 충분합니다" ||
                      clause.risk_assessment?.recommendations?.some((rec: string) => 
                        rec.trim() === "지금으로도 충분합니다." || 
                        rec.trim() === "지금으로도 충분합니다"
                      )
                    ) {
                      riskLevel = 'UNKNOWN';
                      riskScore = 0;
                    }
                    
                    const colors = getRiskColors(riskLevel);
                    return (
                      <div key={idx} className={`rounded-lg p-6 ${colors.bg} border ${colors.border} clause-analysis-block`}>
                        {/* 조항 헤더 - 더 넓은 여백과 명확한 구분 */}
                        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200">
                          <Badge className={`${colors.badge} font-bold text-sm px-3 py-1`}>
                            {colors.label}
                          </Badge>
                          <span className="font-bold text-lg">{clause.original_identifier || clause.clause_id}</span>
                          <span className="text-sm text-gray-600">점수: {riskScore}</span>
                        </div>
                        
                        {/* 조항 본문 - 더 넓은 여백과 가독성 향상 */}
                        <div className="mb-6 text-sm text-gray-800 bg-white p-4 rounded border shadow-sm">
                          <div className="leading-relaxed">
                            {clause.original_text}
                          </div>
                        </div>
                        
                        {/* 리스크 분석 - 충분한 하단 여백 확보 */}
                        <div className="text-sm text-muted-foreground mb-4">
                          <strong className="text-base">리스크 분석:</strong> 
                          <div className="whitespace-pre-line mt-3 max-h-none overflow-visible">
                            {riskLevel === 'UNKNOWN' ? (
                              <div className="text-sm text-sky-600 font-medium p-3 bg-sky-50 rounded border border-sky-200">
                                고려할만한 리스크가 검출되지 않았습니다.
                              </div>
                            ) : (
                              <pre className="text-sm whitespace-pre-wrap break-words font-sans leading-relaxed p-3 bg-gray-50 rounded border">
                                {formatRiskAnalysisText(getCompleteText(filteredExplanation))}
                              </pre>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  }) || data.clauses?.map((clause: any, idx: number) => {
                    const colors = getRiskColors(clause.risk_level);
                    return (
                      <div key={idx} className={`rounded-lg p-6 ${colors.bg} border ${colors.border} clause-analysis-block`}>
                        {/* 조항 헤더 - 더 넓은 여백과 명확한 구분 */}
                        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200">
                          <Badge className={`${colors.badge} font-bold text-sm px-3 py-1`}>
                            {clause.risk_level === '높음' ? '위험' : clause.risk_level === '중간' ? '주의' : '안전'}
                          </Badge>
                          <span className="font-bold text-lg">{clause.clause_number} {clause.clause_title}</span>
                        </div>
                        
                        {/* 조항 본문 - 더 넓은 여백과 가독성 향상 */}
                        <div className="mb-6 text-sm text-gray-800 bg-white p-4 rounded border shadow-sm">
                          <div className="leading-relaxed">
                            {clause.clause_content}
                          </div>
                        </div>
                        
                        {/* 리스크 정보 - 충분한 하단 여백 확보 */}
                        <div className="mb-4 text-sm text-gray-600 bg-gray-50 p-3 rounded border">
                          <strong>리스크 점수:</strong> <span className="font-bold text-lg">{clause.risk_score}</span>
                        </div>
                        
                        <div className="text-sm text-muted-foreground">
                          <strong className="text-base">리스크 분석:</strong>
                          <div className="mt-3 p-3 bg-white rounded border leading-relaxed">
                            {clause.risk_analysis}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          <TabsContent value="improvements">
            <div id="improvements-tab-content" data-tab="improvements" ref={improvementsRef}>
              <Card>
                <CardContent className="space-y-6 pt-6">
                {data.clause_analysis?.map((clause: any, idx: number) => {
                  const ra = clause?.risk_assessment;
                  let level = String(ra?.risk_level ?? '').toUpperCase().trim();
                  
                  // revised_spans이 null이거나, revised_text가 "지금으로도 충분합니다."인 경우,
                  // 또는 recommendations가 "지금으로도 충분합니다."인 경우 UNKNOWN으로 처리
                  if (
                    !clause.revised_spans || 
                    clause.revised_spans === null || 
                    clause.revised_spans.length === 0 ||
                    clause.revised_text?.trim() === "지금으로도 충분합니다." ||
                    clause.revised_text?.trim() === "지금으로도 충분합니다" ||
                    ra?.recommendations?.some((rec: string) => 
                      rec.includes("지금으로도 충분합니다") || 
                      rec.includes("고려할만한 리스크가 검출되지 않았습니다")
                    )
                  ) {
                    level = 'UNKNOWN';
                  }
                  
                  // UNKNOWN 등급이면 "지금으로도 충분합니다." 강제
                  const firstReco = level === 'UNKNOWN' 
                    ? '지금으로도 충분합니다.' 
                    : (Array.isArray(ra?.recommendations) ? ra.recommendations[0] : undefined);
                  
                  return (
                    <div key={idx} className="rounded-lg border p-4 bg-gray-50 improvement-item">
                      <div className="font-bold mb-2">
                        {clause.original_identifier || clause.clause_id}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
                        <div>
                          <div className="text-xs text-muted-foreground mb-1">기존 조항</div>
                          <div className="text-sm">{clause.original_text}</div>
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground mb-1">제안 내용</div>
                          <div className="text-sm font-medium text-emerald-700">
                            {firstReco || '개선 제안이 없습니다.'}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                }) || (
                  <div className="text-center py-8 text-muted-foreground">
                    개선 제안 데이터가 없습니다.
                  </div>
                )}
              </CardContent>
            </Card>
            </div>
          </TabsContent>
          <TabsContent value="amendment">
            <div id="amendment-tab-content" data-tab="amendment" ref={amendmentRef}>
              <Card>
                <CardContent className="pt-6">
                  {/* 통합된 계약서 형태로 표시 */}
                  <div className="bg-white border rounded-lg shadow-sm">
                    {/* 계약서 헤더 */}
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 border-b">
                      <h2 className="text-2xl font-bold text-center text-gray-800 mb-2">
                        계약서 개정안
                      </h2>
                      <div className="flex justify-center gap-4 mt-4 text-xs text-gray-500">
                        <span>📅 생성일: {new Date().toLocaleDateString('ko-KR')}</span>
                        <span>📊 리스크 점수: {data.overall_risk_assessment?.risk_score || 0}/100</span>
                      </div>
                    </div>
                    
                    {/* 계약서 본문 */}
                    <div className="p-8">
                      {data.clause_analysis && data.clause_analysis.length > 0 ? (
                        <div className="prose prose-lg max-w-none leading-relaxed">
                          {renderIntegratedContract(
                            data.original_contract_text || '', 
                            data.clause_analysis
                          )}
                        </div>
                      ) : (
                        <div className="text-center py-12 text-muted-foreground">
                          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-100 flex items-center justify-center">
                            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </div>
                          <h4 className="text-lg font-semibold mb-2">개정이 필요한 조항이 없습니다</h4>
                          <p>현재 분석된 계약서에서 개정이 필요한 조항이 없습니다.</p>
                        </div>
                      )}
                    </div>
                    

                  </div>
                  

                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <div>
        <Card className="sticky top-8">
          <CardContent className="p-6">
            <h3 className="text-lg font-medium mb-4">계약서 정보</h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">전체 리스크 점수</p>
                <div className="flex items-center gap-2">
                  <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-500 rounded-full" style={{ width: `${data.overall_risk_assessment?.risk_score ?? data.riskScore ?? 0}%` }}></div>
                  </div>
                  <span className="font-medium text-amber-500">{data.overall_risk_assessment?.risk_score ?? data.riskScore ?? 0}/100</span>
                </div>
              </div>

              
                            {/* 각 탭별 PDF 다운로드 */}
              {isClient && (
                <div className="pt-4 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full bg-rose-600 hover:bg-rose-700 text-white border-rose-500 hover:border-rose-600"
                    onClick={() => downloadAsPDF(activeTab)}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    현재 보고 있는 자료 다운로드
                  </Button>
                  <p className="text-xs text-muted-foreground mt-2 text-center">
                    현재 활성화된 탭의 내용을 PDF로 저장합니다
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

