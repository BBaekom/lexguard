"use client"

import { ContractAnalysisResult } from "@/components/contract-analysis-result"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Download, Share } from "lucide-react"
import Link from "next/link"

interface AnalysisPageProps {
  params: {
    id: string
  }
}

export default function AnalysisPage({ params }: AnalysisPageProps) {
  return (
    <div className="container py-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link href="/upload">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">계약서 분석 결과</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Share className="h-4 w-4 mr-2" />
            공유
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => {
              window.open(`/api/analysis/download?id=${params.id}&type=improved`, '_blank');
            }}
          >
            <Download className="h-4 w-4 mr-2" />
            개선된 계약서
          </Button>
        </div>
      </div>

      <ContractAnalysisResult contractId={params.id} />
    </div>
  )
}
