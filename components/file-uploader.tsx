"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Upload, File, X } from "lucide-react"

interface FileUploaderProps {
  onUploadStart: () => void
  onUploadComplete: (file: File) => void
  disabled?: boolean
}

export function FileUploader({ onUploadStart, onUploadComplete, disabled }: FileUploaderProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [dragMessage, setDragMessage] = useState("계약서 파일을 업로드하세요")

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    if (file) {
      setSelectedFile(file)
    }
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(true)
    setDragMessage("여기에 파일을 놓으세요")
  }

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
    setDragMessage("계약서 파일을 업로드하세요")
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
    setDragMessage("계약서 파일을 업로드하세요")

    const file = e.dataTransfer.files?.[0] || null
    if (file) {
      setSelectedFile(file)
    }
  }

  const handleUpload = () => {
    if (selectedFile) {
      onUploadStart()
      onUploadComplete(selectedFile)
    }
  }

  const removeFile = () => {
    setSelectedFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <div className="w-full">
      {!selectedFile && (
        <div
          className={`border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center cursor-pointer transition-colors w-full ${
            isDragging ? "border-rose-500 bg-rose-50 dark:bg-rose-950/20" : "border-muted-foreground/20"
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".pdf,.jpg,.jpeg,.png"
            className="hidden"
          />
          <Upload className="h-10 w-10 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">{dragMessage}</h3>
          <p className="text-sm text-muted-foreground text-center mb-4">
            PDF 파일을 드래그 앤 드롭하거나 클릭하여 업로드하세요.
          </p>
          <Button
            variant="outline"
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              fileInputRef.current?.click()
            }}
          >
            파일 선택
          </Button>
        </div>
      )}

      {selectedFile && (
        <div className="mt-4 p-4 border rounded-lg flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            <File className="h-5 w-5 text-rose-600" />
            <div>
              <p className="font-medium">{selectedFile.name}</p>
              <p className="text-xs text-muted-foreground">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={(e) => {
                e.stopPropagation()
                removeFile()
              }}
            >
              <X className="h-4 w-4" />
            </Button>
            <Button
              className="bg-rose-600 hover:bg-rose-700"
              onClick={(e) => {
                e.stopPropagation()
                handleUpload()
              }}
              disabled={disabled}
            >
              분석 시작
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
