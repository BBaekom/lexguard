'use client'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html>
      <body>
        <div className="flex min-h-screen flex-col items-center justify-center p-4">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              심각한 오류가 발생했습니다
            </h2>
            <p className="text-gray-600 mb-6">
              애플리케이션에서 심각한 오류가 발생했습니다.
            </p>
            <button
              onClick={reset}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              다시 시도
            </button>
          </div>
        </div>
      </body>
    </html>
  )
}
