"use client"

import * as React from "react"
import { cn } from "@/lib/utils" 
import { Button } from "@/components/ui/button" 
import { X } from "lucide-react"
import { toast } from "sonner"

type UploadDropzoneProps = {
  accept?: string
  onChange?: (file: File | null) => void
  value?: File | null
  className?: string
  disabled?: boolean
}

export function UploadDropzone({
  accept = "image/jpeg, image/png, image/gif, image/webp",
  onChange,
  value,
  className,
  disabled,
}: UploadDropzoneProps) {
  const [isDragging, setIsDragging] = React.useState(false)
  const inputRef = React.useRef<HTMLInputElement>(null)

  const onBrowse = () => {
    if (disabled) return
    inputRef.current?.click()
  }

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return
    const file = files[0]
const isImage = file.type.startsWith("image/") ||
  /\.(jpe?g|png|gif|webp|svg)$/i.test(file.name);    if (!isImage) {
      onChange?.(null)
      return
    }
    onChange?.(file)
  }

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    if (disabled) return
    handleFiles(e.dataTransfer.files)
  }

  return (
    <div className="w-full">
      <div
        role="button"
        tabIndex={0}
        aria-label="Upload Image"
        onClick={onBrowse}
        onDrop={onDrop}
        onDragOver={(e) => {
          e.preventDefault()
          if (!disabled) setIsDragging(true)
        }}
        onDragLeave={(e) => {
          e.preventDefault()
          setIsDragging(false)
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") onBrowse()
        }}
        className={cn(
          "relative rounded-xl border-2 border-dashed p-8 transition-all",
          isDragging ? "border-primary bg-accent/40" : "border-muted-foreground/30 bg-card",
          disabled ? "opacity-60 pointer-events-none" : "cursor-pointer hover:bg-accent/20",
          "flex flex-col items-center justify-center text-center gap-2",
          className,
        )}
      >
        {value ? (
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-foreground">{value.name}</span>
            <button
              type="button"
              className="rounded-full p-1 hover:bg-muted transition-colors"
              onClick={(e) => {
                e.stopPropagation()
                onChange?.(null)
              }}
            >
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>
        ) : (
          <>
            <span className="text-sm text-muted-foreground">
              Drag & drop your image file here or click below
            </span>
            <Button type="button" variant="secondary" className="mt-2">
              Browse files
            </Button>
          </>
        )}
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="sr-only"
          onChange={(e) => handleFiles(e.target.files)}
          disabled={disabled}
        />
      </div>
    </div>
  )
}
