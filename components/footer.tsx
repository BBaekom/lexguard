import Link from "next/link"
import { ScaleIcon } from "lucide-react"

export default function Footer() {
  return (
    <footer className="border-t py-6 md:py-8">
      <div className="container flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <ScaleIcon className="h-5 w-5 text-rose-600" />
            <span className="text-lg font-bold">LexGuard</span>
          </div>
          <p className="text-sm text-muted-foreground">LLM 기반 계약서 자동 검토 및 리스크 관리 서비스</p>
        </div>
        <div className="flex flex-col gap-2 md:flex-row md:gap-8">
          <div className="flex flex-col gap-2">
            <h3 className="text-sm font-medium">서비스</h3>
            <nav className="flex flex-col gap-2">
              <Link href="/about" className="text-xs text-muted-foreground hover:underline">
                서비스 소개
              </Link>
              <Link href="/upload" className="text-xs text-muted-foreground hover:underline">
                계약서 검토
              </Link>
              <Link href="/pricing" className="text-xs text-muted-foreground hover:underline">
                요금제
              </Link>
            </nav>
          </div>
          <div className="flex flex-col gap-2">
            <h3 className="text-sm font-medium">지원</h3>
            <nav className="flex flex-col gap-2">
              <Link href="/faq" className="text-xs text-muted-foreground hover:underline">
                자주 묻는 질문
              </Link>
              <Link href="/contact" className="text-xs text-muted-foreground hover:underline">
                문의하기
              </Link>
              <Link href="/terms" className="text-xs text-muted-foreground hover:underline">
                이용약관
              </Link>
            </nav>
          </div>
        </div>
      </div>
      <div className="container mt-6 border-t pt-6">
        <p className="text-xs text-muted-foreground text-center">© 2025 LexGuard. All rights reserved.</p>
      </div>
    </footer>
  )
}
