"use client"
import { useAuth } from "../../context/AuthContext"
import { useSettings } from "../../context/SettingsContext"
import { motion } from "framer-motion"

// Animation variants for the main container
const loaderVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
}

// Animation variants for the barcode lines (staggered effect)
const barcodeVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1, // Each bar will appear 0.1s after the previous one
    },
  },
}

const barVariants = {
  hidden: { opacity: 0, y: -20 },
  visible: { opacity: 1, y: 0 },
}

const GlobalLoader = () => {
  const { loading: authLoading } = useAuth()
  const { loading: settingsLoading } = useSettings()
  const show = authLoading || settingsLoading

  // Note: For exit animations to work, this component must be wrapped in <AnimatePresence>
  if (!show) return null

  return (
    <motion.div
      key="global-loader" // A unique key is important for AnimatePresence
      className="fixed inset-0 z-[60] flex items-center justify-center bg-white/80 dark:bg-black/60 backdrop-blur-sm"
      variants={loaderVariants}
      initial="hidden"
      animate="visible"
      exit="hidden"
      transition={{ duration: 0.3 }}
    >
      <div className="relative w-16 h-16 overflow-hidden">
        {/* The glowing scanner line */}
        <motion.div
          className="absolute top-0 left-0 w-full h-1 bg-cyan-400"
          style={{
            boxShadow: "0 0 10px rgba(0, 255, 255, 0.7)",
          }}
          initial={{ y: 0 }}
          animate={{ y: "100%" }}
          transition={{
            duration: 1.2,
            repeat: Infinity,
            repeatType: "mirror",
            ease: "easeInOut",
          }}
        />

        {/* SVG container for the barcode lines */}
        <motion.svg
          width="64"
          height="64"
          viewBox="0 0 64 64"
          variants={barcodeVariants}
          initial="hidden"
          animate="visible"
          className="w-full h-full"
        >
          {/* Each rect is a bar in the barcode */}
          <motion.rect variants={barVariants} x="10" y="12" width="4" height="40" fill="currentColor" className="text-neutral-300 dark:text-neutral-700" />
          <motion.rect variants={barVariants} x="20" y="12" width="8" height="40" fill="currentColor" className="text-neutral-300 dark:text-neutral-700" />
          <motion.rect variants={barVariants} x="34" y="12" width="2" height="40" fill="currentColor" className="text-neutral-300 dark:text-neutral-700" />
          <motion.rect variants={barVariants} x="42" y="12" width="6" height="40" fill="currentColor" className="text-neutral-300 dark:text-neutral-700" />
          <motion.rect variants={barVariants} x="54" y="12" width="4" height="40" fill="currentColor" className="text-neutral-300 dark:text-neutral-700" />
        </motion.svg>
      </div>
    </motion.div>
  )
}

export default GlobalLoader