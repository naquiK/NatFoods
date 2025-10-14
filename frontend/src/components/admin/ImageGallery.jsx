"use client"
import { api } from "../../utils/api"
import Button from "../ui/Button"

const ImageGallery = ({ images, onRemove, editable = true }) => {
  const handleDelete = async (image, index) => {
    if (window.confirm("Are you sure you want to delete this image?")) {
      try {
        const publicId = image.public_id || image.publicId || image.filename || image
        if (publicId) {
          // encode so slashes and special chars don't break the URL path
          await api.delete(`/api/upload/image/${encodeURIComponent(publicId)}`)
        } else {
          throw new Error('No public_id available for this image')
        }
        onRemove(index)
      } catch (error) {
        console.error("Delete error:", error)
        const msg = error?.response?.data?.message || error.message || "Failed to delete image. Please try again."
        alert(msg)
      }
    }
  }

  if (!images || images.length === 0) {
    return <div className="text-center py-8 text-stone-500">No images uploaded yet</div>
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {images.map((image, index) => (
        <div key={index} className="relative group">
          <div className="aspect-square bg-stone-100 rounded-lg overflow-hidden">
            <img src={image.url || image} alt={`Upload ${index + 1}`} className="w-full h-full object-cover" />
          </div>
          {editable && (
            <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                <Button
                  onClick={() => handleDelete(image, index)}
                  variant="outline"
                  size="sm"
                  className="bg-white text-red-600 border-red-200 hover:bg-red-50"
                >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </Button>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

export default ImageGallery
