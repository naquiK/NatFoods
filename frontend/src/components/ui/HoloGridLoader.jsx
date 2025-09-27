"use client"
import { motion } from "framer-motion"

const Tile = () => (
  <motion.div
    className="relative rounded-none border border-neutral-200 dark:border-neutral-800 bg-white/70 dark:bg-neutral-900/70 overflow-hidden"
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
  >
    <div className="aspect-product holo-shimmer" />
    <div className="p-4">
      <div className="h-3 w-20 bg-neutral-200 dark:bg-neutral-800 mb-3 holo-shimmer" />
      <div className="h-4 w-3/4 bg-neutral-200 dark:bg-neutral-800 mb-2 holo-shimmer" />
      <div className="h-5 w-24 bg-neutral-200 dark:bg-neutral-800 holo-shimmer" />
    </div>
  </motion.div>
)

const HoloGridLoader = () => {
  return (
    <div className="min-h-[60vh]">
      
    </div>
  )
}

export default HoloGridLoader
