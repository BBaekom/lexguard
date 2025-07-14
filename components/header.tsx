"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ModeToggle } from "./mode-toggle"
import { ScaleIcon } from "lucide-react"
import { createClient } from "../lib/supabase/client"
import type { User } from "@supabase/supabase-js"
import { useRouter } from "next/navigation"
import { Skeleton } from "./ui/skeleton"
import { useToast } from "@/components/ui/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export default function Header() {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showLogoutDialog, setShowLogoutDialog] = useState(false)
  const supabase = createClient()
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setUser(user)
      setIsLoading(false)
    }

    // 컴포넌트 마운트 시 사용자를 가져오고, 인증 상태 변경을 감지합니다.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      setIsLoading(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase.auth])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setShowLogoutDialog(true)
  }

  const handleLogoutConfirm = () => {
    setShowLogoutDialog(false)
    router.push('/')
  }

  const handleGoToUpload = (e: React.MouseEvent) => {
    if (!user) {
      e.preventDefault()
      alert("로그인 후 이용하세요")
      router.push("/login")
    }
  }

  return (
    <>
      <header className="border-b">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <ScaleIcon className="h-6 w-6 text-rose-600" />
            <Link href="/" className="text-xl font-bold">
              LexGuard
            </Link>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/" className="text-sm font-medium hover:underline">
              홈
            </Link>
            <Link href="/about" className="text-sm font-medium hover:underline">
              서비스 소개
            </Link>
            <Link href="/upload" onClick={handleGoToUpload} className="text-sm font-medium hover:underline">
              계약서 검토
            </Link>
            <Link href="/faq" className="text-sm font-medium hover:underline">
              자주 묻는 질문
            </Link>
          </nav>
          <div className="flex items-center gap-4">
            <ModeToggle />
            {isLoading ? (
              <div className="flex items-center gap-2">
                <Skeleton className="h-9 w-20" />
                <Skeleton className="h-9 w-24" />
              </div>
            ) : user ? (
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium">안녕하세요, {user.user_metadata.full_name || user.email}님!</span>
                <Button variant="outline" size="sm" onClick={handleLogout}>
                  로그아웃
                </Button>
              </div>
            ) : (
              <>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/login">로그인</Link>
                </Button>
                <Button size="sm" className="bg-rose-600 hover:bg-rose-700" asChild>
                  <Link href="/register">회원가입</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>로그아웃 완료</AlertDialogTitle>
            <AlertDialogDescription>
              로그아웃이 완료되었습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={handleLogoutConfirm}>
              확인
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
