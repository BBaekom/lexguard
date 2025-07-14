import { ContractUploader } from "@/components/contract-uploader"

export default function UploadPage() {
  return (
    <div className="container py-12 mx-auto">
      <div className="max-w-3xl mx-auto w-full">
        <h1 className="text-3xl font-bold mb-6">계약서 업로드</h1>
        <p className="text-muted-foreground mb-8">PDF 또는 이미지 형태의 계약서를 업로드하여 AI 분석을 시작하세요.</p>
        <ContractUploader />
      </div>
    </div>
  )
}
