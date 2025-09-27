"use client"
const ProductSkeleton = () => {
  return (
    <div className="card overflow-hidden">
      <div className="bg-neutral-100 dark:bg-neutral-800 aspect-product animate-pulse" />
      <div className="p-6 space-y-3">
        <div className="h-3 w-20 bg-neutral-200 dark:bg-neutral-700 animate-pulse" />
        <div className="h-4 w-3/4 bg-neutral-200 dark:bg-neutral-700 animate-pulse" />
        <div className="h-4 w-1/2 bg-neutral-200 dark:bg-neutral-700 animate-pulse" />
        <div className="h-6 w-24 bg-neutral-200 dark:bg-neutral-700 animate-pulse" />
      </div>
    </div>
  )
}
export default ProductSkeleton
