'use client'

import { useRef } from 'react'
import { Button } from '@/shared/components/Button/Button'
import { appConfig } from '@/config/app.config'

export interface UploadButtonProps {
  onUpload: (file: File) => void
  isLoading?: boolean
  disabled?: boolean
}

export function UploadButton({ onUpload, isLoading, disabled }: UploadButtonProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  const handleClick = () => {
    inputRef.current?.click()
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // ファイルサイズチェック
    if (file.size > appConfig.maxUploadSize) {
      alert(`ファイルサイズが大きすぎます（最大${appConfig.maxUploadSize / 1024 / 1024}MB）`)
      return
    }

    // ファイルタイプチェック
    if (!appConfig.supportedFileTypes.includes(file.type)) {
      alert('PDFファイルのみアップロード可能です')
      return
    }

    onUpload(file)

    // ファイル選択をリセット
    if (inputRef.current) {
      inputRef.current.value = ''
    }
  }

  return (
    <>
      <Button
        onClick={handleClick}
        isLoading={isLoading}
        disabled={disabled || isLoading}
        variant="primary"
        size="lg"
      >
        📄 PDFをアップロード
      </Button>
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,application/pdf"
        className="hidden"
        onChange={handleChange}
        disabled={disabled || isLoading}
      />
    </>
  )
}
