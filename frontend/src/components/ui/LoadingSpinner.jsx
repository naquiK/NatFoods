"use client"
import { motion } from "framer-motion"

const LoadingSpinner = ({ size = "default", className = "" }) => {
  const sizeClasses = {
    small: "w-6 h-6",
    default: "w-10 h-10",
    large: "w-14 h-14",
  }

  // Animation properties for the orbiting motion
  const orbOrbitTransition = {
    duration: 3,
    ease: "linear",
    repeat: Infinity,
  }

  // Animation properties for the subtle pulse of each orb
  const orbPulseTransition = {
    duration: 1.8, // Slightly longer pulse duration
    ease: "easeInOut",
    repeat: Infinity,
  }

  return (
    <div
      className={`flex items-center justify-center ${className}`}
      role="status"
      aria-live="polite"
      aria-label="Loading"
    >
      {/* Container for the gooey effect: contrast filter */}
      <div className={`relative ${sizeClasses[size]} [filter:contrast(25)]`}>
        {/* Inner container for blurring the shapes, causing the merge effect */}
        <div className="w-full h-full bg-white/0 [filter:blur(10px)]">
          
          {/* Main rotating container for the orbs */}
          <motion.div
            className="absolute inset-0"
            animate={{ rotate: 360 }}
            transition={orbOrbitTransition}
          >
            {/* Orb 1: Larger, central-ish */}
            <motion.div
              className="absolute top-1/2 left-1/2 w-[55%] h-[55%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-purple-500 via-fuchsia-500 to-pink-400 opacity-90"
              animate={{ scale: [1, 1.05, 1] }}
              transition={orbPulseTransition}
            />

            {/* Orb 2: Orbits slightly wider */}
            <motion.div
              className="absolute top-1/4 left-1/4 w-[35%] h-[35%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 opacity-90"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ ...orbPulseTransition, delay: 0.3 }}
            />

            {/* Orb 3: Orbits opposite direction relative to parent container */}
            <motion.div
              className="absolute bottom-1/4 right-1/4 w-[30%] h-[30%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 opacity-90"
              animate={{ scale: [1, 1.08, 1] }}
              transition={{ ...orbPulseTransition, delay: 0.6 }}
            />

            {/* Orb 4: Smaller, faster orbit (within its own rotating parent) */}
            <motion.div
              className="absolute inset-0"
              animate={{ rotate: -360 }} // Counter-rotation for added complexity
              transition={{ ...orbOrbitTransition, duration: 2.5 }} 
            >
              <motion.div
                className="absolute top-[10%] left-[60%] w-[25%] h-[25%] rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 opacity-90"
                animate={{ scale: [1, 1.03, 1] }}
                transition={{ ...orbPulseTransition, delay: 0.9 }}
              />
            </motion.div>

          </motion.div>
        </div>
        <span className="sr-only">Loading...</span>
      </div>
    </div>
  )
}

export default LoadingSpinner