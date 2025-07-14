import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function FAQPage() {
  const faqs = [
    {
      question: "LexGuard는 어떤 서비스인가요?",
      answer:
        "LexGuard는 LLM 기반 계약서 자동 검토 및 리스크 관리 서비스입니다. 법률 지식이 부족한 개인 및 기업이 계약서를 안전하게 검토하고 법적 리스크를 최소화할 수 있도록 도와줍니다.",
    },
    {
      question: "어떤 형식의 계약서를 업로드할 수 있나요?",
      answer:
        "PDF, JPG, PNG 형식의 계약서를 업로드할 수 있습니다. OCR 기술을 통해 이미지 형태의 계약서도 텍스트로 변환하여 분석합니다.",
    },
    {
      question: "계약서 분석에 얼마나 시간이 소요되나요?",
      answer: "계약서의 길이와 복잡성에 따라 다르지만, 일반적으로 1-2분 내외로 분석이 완료됩니다.",
    },
    {
      question: "어떤 종류의 계약서를 분석할 수 있나요?",
      answer:
        "임대차 계약서, 고용 계약서, 용역 계약서, NDA(비밀유지계약), 프리랜서 계약서 등 다양한 종류의 계약서를 분석할 수 있습니다.",
    },
    {
      question: "LexGuard의 분석 결과는 얼마나 정확한가요?",
      answer:
        "LexGuard는 최신 AI 기술과 법률 데이터베이스를 활용하여 높은 정확도의 분석 결과를 제공합니다. 다만, AI의 분석 결과는 참고용으로만 사용하시고, 중요한 계약의 경우 법률 전문가의 검토를 받으시는 것을 권장합니다.",
    },
    {
      question: "개인정보 보호는 어떻게 되나요?",
      answer:
        "업로드된 계약서는 분석 목적으로만 사용되며, 분석이 완료된 후 안전하게 보관됩니다. 사용자의 동의 없이 제3자에게 공유되지 않으며, 개인정보 보호법을 준수합니다.",
    },
    {
      question: "무료로 이용할 수 있나요?",
      answer:
        "기본적인 계약서 분석 기능은 무료로 제공됩니다. 다만, 고급 분석 기능이나 대량의 계약서 분석은 유료 플랜을 통해 이용할 수 있습니다.",
    },
    {
      question: "분석 결과를 어떻게 활용할 수 있나요?",
      answer:
        "분석 결과를 통해 계약서의 법적 리스크를 파악하고, 개선 제안을 적용하여 계약서를 수정할 수 있습니다. 또한, 분석 결과를 PDF로 다운로드하거나 공유할 수 있습니다.",
    },
    {
      question: "LexGuard는 법률 자문을 제공하나요?",
      answer:
        "LexGuard는 법률 자문 서비스가 아닌 AI 기반 계약서 분석 도구입니다. 따라서 법적 조언이나 자문을 대체할 수 없으며, 중요한 법적 결정은 반드시 법률 전문가와 상담하시기 바랍니다.",
    },
    {
      question: "어떤 언어의 계약서를 지원하나요?",
      answer:
        "현재는 한국어 계약서를 주로 지원하고 있으며, 향후 영어, 중국어 등 다양한 언어의 계약서도 지원할 예정입니다.",
    },
  ]

  return (
    <div className="container py-12">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">자주 묻는 질문</h1>

        <Accordion type="single" collapsible className="w-full mb-8">
          {faqs.map((faq, index) => (
            <AccordionItem key={index} value={`item-${index}`}>
              <AccordionTrigger className="text-left">{faq.question}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">{faq.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        <div className="bg-muted p-6 rounded-lg">
          <h2 className="text-xl font-medium mb-4">더 궁금한 점이 있으신가요?</h2>
          <p className="text-muted-foreground mb-4">
            문의사항이 있으시면 언제든지 문의해주세요. 최대한 빠르게 답변 드리겠습니다.
          </p>
          <Button className="bg-rose-600 hover:bg-rose-700" asChild>
            <Link href="/contact">문의하기</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
