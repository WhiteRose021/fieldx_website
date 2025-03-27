"use client"

import { useState, useEffect, useRef } from "react"
import { motion, useSpring, useMotionValue } from "framer-motion"

// Client-only star particle animation component
export const StarParticles = ({ count = 50, className = "" }) => {
  const [isMounted, setIsMounted] = useState(false)
  const [starPositions, setStarPositions] = useState([])
  
  useEffect(() => {
    // Generate random positions only on the client side
    const positions = Array.from({ length: count }, () => ({
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      scale: Math.random() * 1.5,
      duration: Math.random() * 4 + 3,
      delay: Math.random() * 5,
      animate: {
        opacity: [0, 0.7, 0],
        scale: [0, Math.random() * 2, 0],
      }
    }))
    
    setStarPositions(positions)
    setIsMounted(true)
  }, [count])
  
  if (!isMounted) {
    // Return an empty container during SSR
    return <div className={`absolute inset-0 -z-10 overflow-hidden ${className}`}></div>
  }
  
  return (
    <div className={`absolute inset-0 -z-10 overflow-hidden ${className}`}>
      {starPositions.map((star, i) => (
        <motion.div
          key={i}
          className="absolute h-0.5 w-0.5 rounded-full bg-blue-400"
          style={{
            top: star.top,
            left: star.left,
            scale: star.scale,
          }}
          animate={star.animate}
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

// Fixed FuturisticLights component
export const FuturisticLights = () => {
  const [isMounted, setIsMounted] = useState(false)
  
  useEffect(() => {
    setIsMounted(true)
  }, [])
  
  if (!isMounted) {
    return <div className="absolute inset-0 pointer-events-none z-0"></div>
  }
  
  return (
    <div className="absolute inset-0 pointer-events-none z-0">
      {/* Light effects */}
      <div className="absolute w-full h-full">
        <div className="absolute inset-0 overflow-hidden">
          {/* Animated light glow */}
          <motion.div
            className="absolute inset-0 bg-blue-500/5 rounded-full blur-3xl"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ 
              scale: [0.5, 1.2, 0.5],
              opacity: [0, 0.3, 0]
            }}
            transition={{
              repeat: Infinity,
              duration: 5,
              ease: "easeInOut"
            }}
          />
        </div>
        
        {/* Star particles */}
        <StarParticles count={150} />
      </div>
    </div>
  )
}

// Fixed OpticalFiberAnimation component
export const OpticalFiberAnimation = () => {
  const [isMounted, setIsMounted] = useState(false)
  const [fibers, setFibers] = useState([])
  
  useEffect(() => {
    // Generate random fiber lines only on client
    const generatedFibers = Array.from({ length: 20 }, () => ({
      startX: Math.random() * 100,
      startY: 0,
      endX: 50 + (Math.random() * 50 - 25),
      endY: 100,
      width: Math.random() * 1 + 0.5,
      delay: Math.random() * 2,
      duration: Math.random() * 3 + 2,
      opacity: Math.random() * 0.5 + 0.3,
      hue: Math.floor(Math.random() * 40) + 200, // blue to purple hues
    }))
    
    setFibers(generatedFibers)
    setIsMounted(true)
  }, [])
  
  if (!isMounted) {
    // Return a placeholder during SSR
    return <div className="h-full w-full bg-gray-900"></div>
  }
  
  return (
    <div className="relative h-full w-full bg-gray-900 overflow-hidden">
      {/* Base layer with gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-blue-900/30 to-purple-900/20"></div>
      
      {/* Animated stars in background */}
      <StarParticles count={70} className="opacity-50" />
      
      {/* Fiber optic lines */}
      {fibers.map((fiber, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            left: `${fiber.startX}%`,
            top: '0%',
            width: `${fiber.width}px`,
            height: '100%',
            background: `linear-gradient(to bottom, transparent, hsl(${fiber.hue}, 100%, 70%), transparent)`,
            opacity: fiber.opacity,
          }}
          initial={{ scaleY: 0, originY: 0 }}
          animate={{ 
            scaleY: [0, 1, 0],
            opacity: [0, fiber.opacity, 0],
            left: [`${fiber.startX}%`, `${fiber.endX}%`, `${fiber.endX}%`]
          }}
          transition={{
            repeat: Infinity,
            duration: fiber.duration,
            delay: fiber.delay,
            ease: "easeInOut"
          }}
        />
      ))}
      
      {/* Light glow overlay */}
      <div className="absolute inset-0 bg-blue-500/5 pointer-events-none"></div>
      
      {/* Center glow */}
      <motion.div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-blue-400/20 rounded-full blur-3xl"
        animate={{ 
          scale: [1, 1.5, 1],
          opacity: [0.2, 0.5, 0.2]
        }}
        transition={{
          repeat: Infinity,
          duration: 4,
          ease: "easeInOut"
        }}
      />
    </div>
  )
}

// Fixed GravityElement component
export const GravityElement = () => {
  const constraintsRef = useRef(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const [mounted, setMounted] = useState(false)
  
  // Create spring physics for the element
  const springX = useSpring(x, { stiffness: 300, damping: 20 })
  const springY = useSpring(y, { stiffness: 300, damping: 20 })
  
  // Fixed animation timing for server/client consistency
  const pulseAnimation = {
    filter: [
      "drop-shadow(0 0 5px rgba(255, 255, 255, 0.3))",
      "drop-shadow(0 0 15px rgba(255, 255, 255, 0.7))",
      "drop-shadow(0 0 5px rgba(255, 255, 255, 0.3))"
    ]
  }
  
  // Fixed subtle animation values
  const subtleMovement = () => {
    if (mounted) {
      x.set(Math.random() * 10 - 5)
      y.set(Math.random() * 10 - 5)
    }
  }
  
  useEffect(() => {
    setMounted(true)
    
    // Add a subtle animation to make the element more noticeable
    const interval = setInterval(subtleMovement, 3000)
    
    return () => clearInterval(interval)
  }, [])
  
  if (!mounted) {
    return (
      <div className="gravity-container w-full flex items-center justify-center">
        <div className="relative flex items-center justify-center">
          <div className="text-7xl font-light tracking-wide select-none bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent">
            <span className="relative inline-block">
              Field<span className="font-normal">X</span>
            </span>
          </div>
        </div>
      </div>
    )
  }
  
  return (
    <motion.div ref={constraintsRef} className="gravity-container w-full flex items-center justify-center">
      <div className="relative flex items-center justify-center">
        {/* Starry FieldX Animation - only rendered on client */}
        <motion.div
          className="absolute"
          initial={{ opacity: 0 }}
          animate={{ 
            opacity: [0, 0.7, 0.4, 0.7, 0],
          }}
          transition={{ 
            repeat: Infinity,
            duration: 10,
            ease: "easeInOut",
            times: [0, 0.3, 0.5, 0.7, 1]
          }}
        >
          <div className="relative">
            <div className="text-9xl md:text-[10rem] font-light tracking-wide select-none text-transparent bg-clip-text bg-gradient-to-r from-blue-100/20 to-blue-300/20 opacity-30 relative z-10">
              Field<span className="font-normal">X</span>
            </div>
            
            {/* Star particles effect - only rendered on client */}
            <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
              <StarParticles count={150} />
            </div>
          </div>
        </motion.div>

        {/* Original draggable FieldX logo */}
        <motion.div 
          className="gravity-element flex items-center justify-center pointer-events-auto cursor-grab relative"
          style={{ x: springX, y: springY }}
          drag
          dragTransition={{ bounceStiffness: 300, bounceDamping: 20 }}
          dragElastic={0.2}
          whileDrag={{ cursor: "grabbing", scale: 1.05 }}
          whileHover={{ scale: 1.1 }}
        >
          <motion.div
            className="text-7xl font-light tracking-wide select-none bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent"
            style={{
              filter: "drop-shadow(0 0 15px rgba(255, 255, 255, 0.5))"
            }}
          >
            <motion.span 
              className="relative inline-block"
              animate={pulseAnimation}
              transition={{ 
                repeat: Infinity, 
                duration: 3,
                ease: "easeInOut"
              }}
            >
              Field<span className="font-normal">X</span>
            </motion.span>
          </motion.div>
        </motion.div>
        
        <motion.div 
          className="absolute inset-0 -z-10"
          animate={{ 
            boxShadow: ["0px 0px 0px rgba(59, 130, 246, 0)", "0px 0px 30px rgba(59, 130, 246, 0.2)", "0px 0px 0px rgba(59, 130, 246, 0)"],
          }}
          transition={{
            repeat: Infinity,
            duration: 3,
          }}
        ></motion.div>
        
        <FuturisticLights />
      </div>
    </motion.div>
  )
}