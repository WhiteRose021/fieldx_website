"use client"

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

// Σταθερός πίνακας θέσεων για αποφυγή hydration errors
const staticLightPositions = [
  { size: 2.3, left: 15.7, top: 22.4, duration: 2.5, delay: 0.1 },
  { size: 1.8, left: 30.2, top: 45.8, duration: 3.1, delay: 0.5 },
  { size: 3.0, left: 55.9, top: 12.3, duration: 2.2, delay: 1.0 },
  { size: 2.2, left: 78.3, top: 34.7, duration: 3.8, delay: 0.3 },
  { size: 1.5, left: 42.1, top: 67.9, duration: 2.7, delay: 0.8 },
  { size: 2.7, left: 90.5, top: 23.6, duration: 3.4, delay: 1.2 },
  { size: 1.9, left: 25.8, top: 79.2, duration: 3.0, delay: 0.2 },
  { size: 2.5, left: 65.4, top: 56.1, duration: 2.9, delay: 0.6 },
  { size: 1.6, left: 10.3, top: 39.5, duration: 2.3, delay: 1.5 },
  { size: 2.8, left: 82.7, top: 86.4, duration: 3.2, delay: 0.4 },
  { size: 2.1, left: 37.6, top: 28.9, duration: 2.6, delay: 0.9 },
  { size: 1.7, left: 70.2, top: 63.5, duration: 3.5, delay: 1.3 },
  { size: 2.9, left: 48.1, top: 91.7, duration: 2.8, delay: 0.7 },
  { size: 2.4, left: 18.9, top: 52.3, duration: 3.7, delay: 1.1 },
  { size: 1.4, left: 62.8, top: 33.1, duration: 2.4, delay: 1.4 },
  { size: 2.6, left: 85.9, top: 72.6, duration: 3.3, delay: 0.2 },
  { size: 2.0, left: 33.7, top: 18.4, duration: 2.7, delay: 1.0 },
  { size: 1.8, left: 57.5, top: 47.2, duration: 3.6, delay: 0.6 },
  { size: 3.1, left: 22.6, top: 82.8, duration: 2.3, delay: 1.2 },
  { size: 2.2, left: 75.4, top: 25.9, duration: 3.1, delay: 0.8 }
]

const FuturisticLights = () => {
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => {
    setMounted(true)
  }, [])
  
  // Αν δεν έχει γίνει το mounting, δεν εμφανίζουμε τα φώτα
  if (!mounted) return null
  
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {staticLightPositions.map((light, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full bg-white"
          style={{
            width: `${light.size}px`,
            height: `${light.size}px`,
            left: `${light.left}%`,
            top: `${light.top}%`,
          }}
          animate={{
            opacity: [0, 0.8, 0],
            scale: [0.8, 1.2, 0.8],
          }}
          transition={{
            repeat: Infinity,
            duration: light.duration,
            delay: light.delay,
            ease: "easeInOut"
          }}
        />
      ))}
    </div>
  )
}

export default FuturisticLights