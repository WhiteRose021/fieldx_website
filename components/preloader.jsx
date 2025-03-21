"use client"

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const PreLoader = () => {
  const [loading, setLoading] = useState(true)
  const [progress, setProgress] = useState(0)
  const [showLogo, setShowLogo] = useState(false)
  
  // Simulate loading progress
  useEffect(() => {
    let interval
    
    // Start showing the logo after a short delay
    const logoTimer = setTimeout(() => {
      setShowLogo(true)
    }, 300)
    
    // Start progress simulation after initial delay
    const startTimer = setTimeout(() => {
      interval = setInterval(() => {
        setProgress(prev => {
          // Accelerate progress as it gets closer to 100
          const increment = 100 - prev < 10 ? 0.5 : 1.5
          const newProgress = prev + increment
          
          if (newProgress >= 100) {
            clearInterval(interval)
            
            // Give a little extra time to see the completed animation
            setTimeout(() => {
              setLoading(false)
            }, 600)
            
            return 100
          }
          return newProgress
        })
      }, 30)
    }, 500)
    
    return () => {
      clearTimeout(logoTimer)
      clearTimeout(startTimer)
      clearInterval(interval)
    }
  }, [])
  
  const letterVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (custom) => ({
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        delay: custom * 0.1
      }
    })
  }
  
  const fiber1 = Array.from({ length: 8 }, (_, i) => ({
    x: Math.sin(i / 3) * 600,
    y: i * 15,
    delay: i * 0.07
  }))
  
  const fiber2 = Array.from({ length: 8 }, (_, i) => ({
    x: Math.cos(i / 3) * 600,
    y: i * 15,
    delay: i * 0.07 + 0.2
  }))
  
  return (
    <AnimatePresence>
      {loading && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black"
          exit={{ 
            opacity: 0,
            transition: { 
              duration: 0.8,
              ease: [0.65, 0, 0.35, 1]
            }
          }}
        >
          <div className="relative flex flex-col items-center justify-center">
            {/* Background elements */}
            <div className="absolute w-full h-full overflow-hidden">
              {/* Fiber optic lines */}
              {fiber1.map((item, i) => (
                <motion.div
                  key={`line1-${i}`}
                  className="absolute left-1/2 h-px bg-gradient-to-r from-transparent via-blue-400 to-transparent"
                  initial={{ width: 0, x: -item.x / 2, y: item.y + 20, opacity: 0 }}
                  animate={{ 
                    width: [0, 120, 100, 40, 0],
                    x: [-item.x / 2, -item.x / 3, 0, item.x / 3, item.x / 2],
                    opacity: [0, 1, 1, 1, 0],
                    y: item.y
                  }}
                  transition={{
                    duration: 3,
                    delay: item.delay,
                    repeat: Infinity,
                    ease: "linear"
                  }}
                />
              ))}
              
              {fiber2.map((item, i) => (
                <motion.div
                  key={`line2-${i}`}
                  className="absolute left-1/2 h-px bg-gradient-to-r from-transparent via-blue-400 to-transparent"
                  initial={{ width: 0, x: -item.x / 2, y: -item.y - 20, opacity: 0 }}
                  animate={{ 
                    width: [0, 80, 120, 60, 0],
                    x: [-item.x / 2, -item.x / 3, 0, item.x / 3, item.x / 2],
                    opacity: [0, 1, 1, 1, 0],
                    y: -item.y
                  }}
                  transition={{
                    duration: 3,
                    delay: item.delay,
                    repeat: Infinity,
                    ease: "linear"
                  }}
                />
              ))}
              
              {/* Blinking dots */}
              {Array.from({ length: 20 }).map((_, i) => (
                <motion.div
                  key={`dot-${i}`}
                  className="absolute w-1 h-1 rounded-full bg-blue-400"
                  initial={{ 
                    x: Math.random() * window.innerWidth, 
                    y: Math.random() * window.innerHeight,
                    opacity: 0 
                  }}
                  animate={{ 
                    opacity: [0, 0.8, 0],
                    scale: [0.8, 1.2, 0.8]
                  }}
                  transition={{
                    duration: 1 + Math.random() * 2,
                    delay: Math.random() * 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
              ))}
              
              {/* Glowing center */}
              <motion.div 
                className="absolute left-1/2 top-1/2 w-40 h-40 rounded-full"
                initial={{ opacity: 0 }}
                animate={{ 
                  opacity: [0.1, 0.3, 0.1],
                  background: [
                    "radial-gradient(circle, rgba(37,99,235,0.2) 0%, rgba(0,0,0,0) 70%)",
                    "radial-gradient(circle, rgba(37,99,235,0.3) 0%, rgba(0,0,0,0) 70%)",
                    "radial-gradient(circle, rgba(37,99,235,0.2) 0%, rgba(0,0,0,0) 70%)"
                  ]
                }}
                style={{ 
                  x: "-50%", 
                  y: "-50%"
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
            </div>
            
            {/* Logo */}
            <div className="flex items-center justify-center mb-10 relative">
              <AnimatePresence>
                {showLogo && (
                  <div className="flex">
                    {/* field */}
                    {"field".split("").map((letter, index) => (
                      <motion.span
                        key={`letter-${index}`}
                        custom={index}
                        variants={letterVariants}
                        initial="hidden"
                        animate="visible"
                        className="text-6xl md:text-7xl font-light tracking-tight text-white"
                      >
                        {letter}
                      </motion.span>
                    ))}
                    
                    {/* X */}
                    <motion.span
                      initial={{ opacity: 0, scale: 0, rotateY: -180 }}
                      animate={{ 
                        opacity: 1, 
                        scale: 1, 
                        rotateY: 0 
                      }}
                      transition={{ 
                        duration: 0.8, 
                        delay: 0.7,
                        type: "spring",
                        stiffness: 200
                      }}
                      className="text-6xl md:text-7xl font-medium text-blue-400 relative"
                    >
                      X
                      <motion.div
                        className="absolute inset-0"
                        animate={{
                          textShadow: [
                            "0 0 5px rgba(96, 165, 250, 0.5)",
                            "0 0 20px rgba(96, 165, 250, 0.8)",
                            "0 0 5px rgba(96, 165, 250, 0.5)"
                          ]
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                      >
                        X
                      </motion.div>
                    </motion.span>
                  </div>
                )}
              </AnimatePresence>
            </div>
            
            {/* Progress bar */}
            <div className="w-48 h-1 bg-gray-800 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-blue-600 to-blue-400"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ ease: "easeOut" }}
              />
            </div>
            
            {/* Loading Text */}
            <motion.p 
              className="text-gray-400 text-sm mt-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              {progress < 100 ? "Loading..." : "Ready!"}
            </motion.p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default PreLoader