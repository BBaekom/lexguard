"use client"

import { Button } from "@/components/ui/button"
import { FcGoogle } from "react-icons/fc"
import { RiKakaoTalkFill } from "react-icons/ri"

interface SocialLoginButtonsProps {
  onGoogleLogin: () => void
  onKakaoLogin: () => void
}

export function SocialLoginButtons({ onGoogleLogin, onKakaoLogin }: SocialLoginButtonsProps) {
  return (
    <div className="flex flex-col space-y-3 w-full">
      <Button variant="outline" className="w-full flex items-center justify-center gap-2" onClick={onGoogleLogin}>
        <FcGoogle className="h-5 w-5" />
        <span>Google로 계속하기</span>
      </Button>
      <Button
        className="w-full flex items-center justify-center gap-2 bg-[#FEE500] hover:bg-[#FDD800] text-black"
        onClick={onKakaoLogin}
      >
        <RiKakaoTalkFill className="h-5 w-5 text-black" />
        <span>카카오톡으로 계속하기</span>
      </Button>
    </div>
  )
}
