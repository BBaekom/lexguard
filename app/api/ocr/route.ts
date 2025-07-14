import { NextRequest, NextResponse } from "next/server"
import { Mistral } from "@mistralai/mistralai"

const apiKey = process.env.MISTRAL_API_KEY

export async function POST(req: NextRequest) {
  if (!apiKey) {
    console.error("MISTRAL_API_KEY is not set")
    return NextResponse.json({ error: "Server configuration error: MISTRAL_API_KEY is not set." }, { status: 500 })
  }

  const client = new Mistral({ apiKey })

  try {
    const formData = await req.formData()
    const file = formData.get("contract")

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "No file uploaded or invalid file format." }, { status: 400 })
    }

    // 1. Upload the file to Mistral AI
    const uploadedFile = await client.files.upload({
      file: {
        fileName: file.name,
        content: Buffer.from(await file.arrayBuffer()),
      },
      purpose: "ocr",
    })

    // 2. Get a signed URL for the uploaded file
    const signedUrl = await client.files.getSignedUrl({
      fileId: uploadedFile.id,
    })

    // 3. Process the document using the signed URL
    const ocrResponse = await client.ocr.process({
      model: "mistral-ocr-latest",
      document: {
        type: "document_url",
        documentUrl: signedUrl.url,
      },
      includeImageBase64: false,
    })

    console.log("Mistral OCR 응답:", ocrResponse)

    // 모든 페이지의 텍스트를 합쳐서 반환
    const allText = (ocrResponse.pages ?? [])
      .map((page: any) => page.markdown)
      .join('\n\n')

    return NextResponse.json({ text: allText })
  } catch (error) {
    console.error("OCR processing failed:", error)
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred"
    return NextResponse.json({ error: "Failed to process the document.", details: errorMessage }, { status: 500 })
  }
}