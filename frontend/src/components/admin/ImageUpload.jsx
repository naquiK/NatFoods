"use client"

import { useState, useRef } from "react"
import { api } from "../../utils/api"
import Button from "../ui/Button"
import LoadingSpinner from "../ui/LoadingSpinner"

const ImageUpload = ({ onUpload, multiple = false, accept = "image/*" }) => {
  const [uploading, setUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef(null)

  const handleFiles = async (files) => {
    if (!files || files.length === 0) return

    setUploading(true)
    try {
      const formData = new FormData()

      if (multiple) {
        Array.from(files).forEach((file) => {
          formData.append("images", file)
        })

        const response = await api.post("/api/upload/images", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        })

        if (response.data.success) {
          onUpload(response.data.files)
        }
      } else {
        formData.append("image", files[0])

        const response = await api.post("/api/upload/image", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        })

        if (response.data.success) {
          onUpload([{ url: response.data.url, public_id: response.data.public_id }])
        }
      }
    } catch (error) {
      console.error("Upload error:", error)
      alert("Upload failed. Please try again.")
    } finally {
      setUploading(false)
    }
  }

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files)
    }
  }

  const handleChange = (e) => {
    e.preventDefault()
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files)
    }
  }

  const openFileDialog = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="w-full">
      <div
        className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          dragActive ? "border-stone-400 bg-stone-50" : "border-stone-300 hover:border-stone-400"
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple={multiple}
          accept={accept}
          onChange={handleChange}
          className="hidden"
        />

        {uploading ? (
          <div className="flex flex-col items-center">
            <LoadingSpinner />
            <p className="mt-2 text-sm text-stone-600">Uploading...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <svg className="w-12 h-12 text-stone-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
            <p className="text-lg font-medium text-stone-900 mb-2">{multiple ? "Upload Images" : "Upload Image"}</p>
            <p className="text-sm text-stone-600 mb-4">
              Drag and drop {multiple ? "files" : "a file"} here, or click to select
            </p>
            <Button type="button" variant="outline" onClick={openFileDialog} className="px-6 bg-transparent">
              Choose {multiple ? "Files" : "File"}
            </Button>
            <p className="text-xs text-stone-500 mt-2">
              Supports: JPG, PNG, GIF, WebP {accept.includes("video") ? ", MP4, MOV" : ""}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default ImageUpload
