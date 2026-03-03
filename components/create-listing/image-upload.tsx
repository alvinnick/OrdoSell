"use client"

import { useCallback, useRef } from "react"
import { Upload, X, ImageIcon } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Props {
  images: string[]
  onChange: (images: string[]) => void
  max?: number
}

export function ImageUpload({ images, onChange, max = 12 }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (!files) return
      const remaining = max - images.length
      const toProcess = Array.from(files).slice(0, remaining)
      toProcess.forEach(file => {
        const reader = new FileReader()
        reader.onloadend = () => {
          onChange([...images, reader.result as string])
        }
        reader.readAsDataURL(file)
      })
    },
    [images, max, onChange]
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      handleFiles(e.dataTransfer.files)
    },
    [handleFiles]
  )

  const removeImage = (index: number) => {
    onChange(images.filter((_, i) => i !== index))
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Drop zone */}
      {images.length < max && (
        <div
          className="border-2 border-dashed border-border rounded-lg p-6 flex flex-col items-center gap-2 cursor-pointer hover:border-primary transition-colors"
          onDrop={handleDrop}
          onDragOver={e => e.preventDefault()}
          onClick={() => inputRef.current?.click()}
        >
          <Upload className="w-8 h-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground text-center">
            Drag & drop images here, or <span className="text-primary">click to browse</span>
          </p>
          <p className="text-xs text-muted-foreground">{images.length}/{max} images · JPEG, PNG, WEBP</p>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={e => handleFiles(e.target.files)}
          />
        </div>
      )}

      {/* Preview grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {images.map((src, i) => (
            <div key={i} className="relative group aspect-square rounded-md overflow-hidden bg-secondary">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt={`Listing image ${i + 1}`} className="w-full h-full object-cover" />
              {i === 0 && (
                <span className="absolute bottom-1 left-1 bg-primary text-primary-foreground text-xs px-1.5 py-0.5 rounded font-medium">
                  Main
                </span>
              )}
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute top-1 right-1 w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => removeImage(i)}
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
          ))}

          {/* Add more slot */}
          {images.length < max && (
            <div
              className="aspect-square rounded-md border-2 border-dashed border-border flex items-center justify-center cursor-pointer hover:border-primary transition-colors"
              onClick={() => inputRef.current?.click()}
            >
              <ImageIcon className="w-5 h-5 text-muted-foreground" />
            </div>
          )}
        </div>
      )}
    </div>
  )
}
