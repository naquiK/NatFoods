// components/EntryLoader.jsx
"use client"
import { useEffect } from "react"
import { motion } from "framer-motion"

// --- Configuration ---
const LOADER_DURATION = 3000 // A slightly longer duration for a more graceful feel
const TAGLINE = "Discover your style."

// --- Animation Variants ---

// Parent container for the flower SVG to orchestrate the petal animations
const flowerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      delay: 0.2,
      staggerChildren: 0.15, // Each petal will animate after the previous one
    },
  },
}

// Animation for each individual petal
const petalVariants = {
  hidden: { pathLength: 0, opacity: 0, scale: 0.8 },
  visible: {
    pathLength: 1,
    opacity: 1,
    scale: 1,
    transition: {
      duration: 1.2,
      ease: "easeInOut",
    },
  },
}

// Variants for the typewriter text effect
const sentenceVariants = {
  hidden: { opacity: 1 },
  visible: {
    opacity: 1,
    transition: {
      delay: 1.2, // Delay the text until the flower has started blooming
      staggerChildren: 0.05,
    },
  },
}

const letterVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
}

const EntryLoader = ({ onDone }) => {
  useEffect(() => {
    const timer = setTimeout(() => onDone?.(), LOADER_DURATION)
    return () => clearTimeout(timer)
  }, [onDone])

  return (
    <motion.div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-[#FDF8F5]" // A soft, warm off-white
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.5 } }}
    >
      <div className="flex flex-col items-center">
        <motion.svg
          width="120"
          height="120"
          viewBox="0 0 100 100"
          variants={flowerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* We define 6 petals as SVG paths, rotated around the center */}
          {[0, 60, 120, 180, 240, 300].map((rotation) => (
            <motion.path
              key={rotation}
              variants={petalVariants}
              d="M50 5 C 65 15, 65 35, 50 50 C 35 35, 35 15, 50 5 Z" // Teardrop/petal shape
              fill="none"
              stroke="#D946EF" // A vibrant fuchsia color
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              transform-origin="center"
              style={{ rotate: rotation }}
            />
          ))}
          {/* The center of the flower that gently scales in */}
          <motion.circle
            cx="50"
            cy="50"
            r="8"
            fill="#FBBF24" // A warm gold color
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.8, ease: "easeOut" }}
          />
        </motion.svg>

        {/* The updated tagline with the typewriter effect */}
        <motion.h2
          className="mt-8 text-2xl text-neutral-600 font-light tracking-wide"
          variants={sentenceVariants}
          initial="hidden"
          animate="visible"
        >
          {TAGLINE.split("").map((char, index) => (
            <motion.span key={index} variants={letterVariants}>
              {char}
            </motion.span>
          ))}
        </motion.h2>
      </div>
    </motion.div>
  )
}

export default EntryLoader