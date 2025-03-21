"use client"

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

const OpticalFiberAnimation = () => {
  const [mounted, setMounted] = useState(false)
  const [activeDots, setActiveDots] = useState([false, false, false, false, false, false])
  
  useEffect(() => {
    setMounted(true)
    
    const interval = setInterval(() => {
      setActiveDots(prev => {
        const newDots = [...prev]
        for (let i = 0; i < newDots.length; i++) {
          if (Math.random() > 0.7) {
            newDots[i] = !newDots[i]
          }
        }
        return newDots
      })
    }, 500)
    
    return () => clearInterval(interval)
  }, [])
  
  if (!mounted) {
    return (
      <div className="relative w-full h-[600px] bg-black rounded-lg flex items-center justify-center">
        <div className="text-white text-sm">Loading network visualization...</div>
      </div>
    )
  }
  
  return (
    <div className="relative w-full h-[600px] bg-black rounded-lg overflow-hidden">
      {/* Dark grid background */}
      <div 
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: 'linear-gradient(to right, #333 1px, transparent 1px), linear-gradient(to bottom, #333 1px, transparent 1px)',
          backgroundSize: '20px 20px'
        }}
      />
      
      {/* Fiber optic cables */}
      <div className="absolute inset-0 flex items-center justify-center p-8">
        <div className="relative w-full h-full max-w-3xl mx-auto">
          {/* Central node */}
          <motion.div 
            className="absolute top-1/2 left-1/2 w-20 h-20 rounded-full bg-blue-900 border border-blue-400 z-10"
            style={{
              transform: 'translate(-50%, -50%)'
            }}
            animate={{
              boxShadow: [
                '0 0 10px rgba(59, 130, 246, 0.5), 0 0 20px rgba(59, 130, 246, 0.3)',
                '0 0 20px rgba(59, 130, 246, 0.8), 0 0 40px rgba(59, 130, 246, 0.5)',
                '0 0 10px rgba(59, 130, 246, 0.5), 0 0 20px rgba(59, 130, 246, 0.3)'
              ]
            }}
            transition={{
              repeat: Infinity,
              duration: 2,
              ease: 'easeInOut'
            }}
          >
            <div className="flex h-full items-center justify-center text-white text-xs font-mono">OLT</div>
          </motion.div>
          
          {/* Fiber lines */}
          {[...Array(6)].map((_, i) => {
            const angle = i * Math.PI / 3
            
            return (
              <div 
                className="absolute top-1/2 left-1/2 w-full h-0"
                style={{
                  transform: `translate(-50%, -50%) rotate(${i * 60}deg)`
                }}
                key={i}
              >
                {/* Fiber line */}
                <motion.div 
                  className="absolute left-1/2 top-0 w-[230px] h-1 bg-gradient-to-r from-blue-600 to-blue-400 origin-left rounded-full"
                  style={{
                    transform: 'translateX(0)'
                  }}
                  animate={{
                    opacity: [0.7, 0.9, 0.7]
                  }}
                  transition={{
                    repeat: Infinity,
                    duration: 2 + (i * 0.3),
                    ease: 'easeInOut'
                  }}
                />
                
                {/* Terminal endpoint */}
                <div
                  className="absolute"
                  style={{
                    left: 'calc(50% + 230px)',
                    top: '0px',
                    transform: 'translate(-50%, -50%)',
                    width: '60px',
                    height: '30px'
                  }}
                >
                  <motion.div
                    className="w-full h-full rounded-lg bg-gray-800 border border-blue-400 flex items-center justify-center"
                    animate={{
                      boxShadow: activeDots[i] 
                        ? [
                            '0 0 5px rgba(59, 130, 246, 0.5)', 
                            '0 0 10px rgba(59, 130, 246, 0.7)',
                            '0 0 5px rgba(59, 130, 246, 0.5)'
                          ] 
                        : 'none'
                    }}
                    transition={{
                      repeat: Infinity,
                      duration: 1,
                      ease: 'easeInOut'
                    }}
                  >
                    <div className="text-white text-[8px] font-mono"></div>
                  </motion.div>
                </div>
                
                {/* Blinking data packets */}
                {activeDots[i] && (
                  <motion.div
                    className="absolute left-1/2 top-0 w-2 h-2 rounded-full bg-white"
                    style={{
                      transform: `translateX(${80 + (Math.random() * 120)}px)`,
                      marginTop: '-4px',
                    }}
                    animate={{
                      opacity: [1, 0.7, 1],
                      boxShadow: [
                        '0 0 8px rgba(255, 255, 255, 0.8)',
                        '0 0 12px rgba(255, 255, 255, 1)',
                        '0 0 8px rgba(255, 255, 255, 0.8)'
                      ]
                    }}
                    transition={{
                      repeat: Infinity,
                      duration: 1,
                      ease: 'easeInOut'
                    }}
                  />
                )}
              </div>
            )
          })}
          
          {/* Pulse waves from center */}
          <motion.div
            className="absolute top-1/2 left-1/2 rounded-full border border-blue-400 z-0"
            style={{
              transform: 'translate(-50%, -50%)'
            }}
            animate={{
              width: ['40px', '400px'],
              height: ['40px', '400px'],
              opacity: [0.7, 0],
            }}
            transition={{
              repeat: Infinity,
              duration: 3,
              ease: 'easeOut'
            }}
          />
          
          <motion.div
            className="absolute top-1/2 left-1/2 rounded-full border border-blue-400 z-0"
            style={{
              transform: 'translate(-50%, -50%)'
            }}
            animate={{
              width: ['40px', '400px'],
              height: ['40px', '400px'],
              opacity: [0.7, 0],
            }}
            transition={{
              repeat: Infinity,
              duration: 3,
              delay: 1.5,
              ease: 'easeOut'
            }}
          />
        </div>
      </div>
      
      {/* Status indicators */}
      <div className="absolute bottom-4 left-4 flex space-x-2">
        <motion.div
          className="w-2 h-2 rounded-full bg-green-500"
          animate={{
            opacity: [1, 0.5, 1]
          }}
          transition={{
            repeat: Infinity,
            duration: 2,
            ease: 'easeInOut'
          }}
        />
        <div className="text-white text-[10px] font-mono">SYSTEM ONLINE</div>
      </div>
      
      <div className="absolute top-4 right-4 text-white text-xs font-mono">
        FTTH NETWORK MONITORING
      </div>
    </div>
  )
}

export default OpticalFiberAnimation