"use client"

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

// Generate a larger number of stars for full screen coverage
const generateStars = (count = 200) => {
  const stars = []
  for (let i = 0; i < count; i++) {
    stars.push({
      id: i,
      size: Math.random() * 3 + 0.5, // Size between 0.5 and 3.5px
      left: Math.random() * 100, // Position across the entire width
      top: Math.random() * 100, // Position across the entire height
      duration: Math.random() * 3 + 2, // Animation duration between 2 and 5 seconds
      delay: Math.random() * 5, // Random delay for more natural effect
      opacity: Math.random() * 0.7 + 0.3 // Random max opacity between 0.3 and 1.0
    })
  }
  return stars
}

const FullScreenStars = () => {
  const [mounted, setMounted] = useState(false)
  const [stars] = useState(() => generateStars())
  
  useEffect(() => {
    setMounted(true)
  }, [])
  
  if (!mounted) return null
  
  return (
    <div className="fixed inset-0 w-full h-full z-0 overflow-hidden pointer-events-none">
      {stars.map((star) => (
        <motion.div
          key={star.id}
          className="absolute rounded-full bg-white"
          style={{
            width: `${star.size}px`,
            height: `${star.size}px`,
            left: `${star.left}%`,
            top: `${star.top}%`,
          }}
          animate={{
            opacity: [0, star.opacity, 0],
            scale: [0.8, 1.2, 0.8],
          }}
          transition={{
            repeat: Infinity,
            duration: star.duration,
            delay: star.delay,
            ease: "easeInOut"
          }}
        />
      ))}
    </div>
  )
}

export default FullScreenStars