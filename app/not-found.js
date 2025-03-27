"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { ChevronDown, Home } from "lucide-react"
import MainMenu from "@/components/main-menu"
import { PageTransitionWrapper } from "@/components/page-transition"
import { useAuth } from "@/context/AuthContext"

// Client-only star particles component to prevent hydration errors
const StarParticles = ({ count = 50 }) => {
  const [isMounted, setIsMounted] = useState(false)
  const [particles, setParticles] = useState([])
  
  useEffect(() => {
    // Generate random positions only on client-side
    const newParticles = Array.from({ length: count }, () => ({
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      scale: Math.random() * 1.5,
      duration: Math.random() * 4 + 3,
      delay: Math.random() * 5
    }))
    
    setParticles(newParticles)
    setIsMounted(true)
  }, [count])
  
  if (!isMounted) {
    return null // Return nothing during SSR
  }
  
  return (
    <>
      {particles.map((particle, i) => (
        <motion.div
          key={i}
          className="absolute h-0.5 w-0.5 rounded-full bg-blue-400"
          style={{
            top: particle.top,
            left: particle.left,
            scale: particle.scale,
          }}
          animate={{
            opacity: [0, 0.7, 0],
            scale: [0, Math.random() * 2, 0],
          }}
          transition={{
            repeat: Infinity,
            duration: particle.duration,
            delay: particle.delay,
            ease: "easeInOut"
          }}
        />
      ))}
    </>
  )
}

export default function NotFound() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [mounted, setMounted] = useState(false)
  
  // Get auth context safely
  const auth = useAuth() || {}
  const user = auth.user || null
  const logout = auth.logout || (() => {})

  useEffect(() => {
    document.documentElement.style.scrollBehavior = "smooth"
    
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }

    window.addEventListener("scroll", handleScroll)
    setMounted(true)
    
    return () => {
      window.removeEventListener("scroll", handleScroll)
      document.documentElement.style.scrollBehavior = ""
    }
  }, [])

  return (
    <PageTransitionWrapper>
      <div className="min-h-screen bg-black text-white overflow-x-hidden">
        
        {/* White Taskbar Header */}
        <motion.header
          className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
            scrolled ? "bg-white shadow-md" : "bg-white"
          }`}
          initial={{ y: -100 }}
          animate={{ y: 0 }}
          transition={{ type: "spring", stiffness: 100, damping: 20 }}
        >
          <div className="container mx-auto px-4 py-4 flex justify-between items-center">
            <Link href="/" className="z-10">
              <motion.div 
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <div className="text-2xl font-bold text-gray-800">
                  <span className="font-light">Field</span><span>X</span>
                </div>
              </motion.div>
            </Link>

            <div className="hidden md:flex items-center space-x-8">
              <nav className="flex items-center space-x-8">
                <motion.div whileHover={{ scale: 1.05 }}>
                  <Link href="/#" className="uppercase text-xs tracking-widest text-gray-800 hover:text-blue-600 transition-colors">
                    FieldX World
                  </Link>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }}>
                  <Link href="/#discover" className="uppercase text-xs tracking-widest text-gray-800 hover:text-blue-600 transition-colors">
                    Solutions
                  </Link>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }}>
                  <Link href="/#features" className="uppercase text-xs tracking-widest text-gray-800 hover:text-blue-600 transition-colors">
                    Features
                  </Link>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }}>
                  <Link href="/#pricing" className="uppercase text-xs tracking-widest text-gray-800 hover:text-blue-600 transition-colors">
                    Pricing
                  </Link>
                </motion.div>
              </nav>
              
              {user ? (
                // Show user email if logged in
                <div className="flex items-center space-x-2 text-sm text-gray-800">
                  <span className="hidden md:inline-block">
                    {user.email ? user.email.split('@')[0] : 'User'}
                  </span>
                  <ChevronDown className="h-4 w-4" />
                </div>
              ) : (
                // Show login/register if not logged in
                <motion.div className="flex items-center space-x-6" whileHover={{ scale: 1.05 }}>
                  <Link href="/login" className="uppercase text-xs tracking-widest text-gray-800 hover:text-blue-600 transition-colors">
                    Login / Register
                  </Link>
                </motion.div>
              )}
            </div>

            <motion.button 
              className="md:hidden focus:outline-none" 
              aria-label="Menu" 
              onClick={() => setMenuOpen(!menuOpen)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="space-y-1.5">
                <motion.div 
                  className="w-6 h-px bg-gray-800"
                  animate={{ 
                    rotateZ: menuOpen ? 45 : 0,
                    y: menuOpen ? 4 : 0,
                  }}
                ></motion.div>
                <motion.div 
                  className="w-6 h-px bg-gray-800"
                  animate={{ 
                    rotateZ: menuOpen ? -45 : 0,
                    y: menuOpen ? -4 : 0,
                  }}
                ></motion.div>
              </div>
            </motion.button>
          </div>
        </motion.header>

        {/* Full-screen menu */}
        <MainMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />

        {/* 404 Content */}
        <section className="relative min-h-screen pt-32 pb-24 flex items-center justify-center">
          <div className="container mx-auto px-6">
            <motion.div 
              className="max-w-2xl mx-auto text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <motion.div 
                className="text-9xl font-light mb-6 bg-gradient-to-r from-blue-400 to-blue-600 text-transparent bg-clip-text"
                animate={{ 
                  textShadow: ["0px 0px 0px rgba(59, 130, 246, 0)", "0px 0px 20px rgba(59, 130, 246, 0.5)", "0px 0px 0px rgba(59, 130, 246, 0)"],
                }}
                transition={{
                  repeat: Infinity,
                  duration: 3,
                }}
              >
                404
              </motion.div>
              
              <h1 className="text-3xl md:text-4xl font-light mb-6">Page Not Found</h1>
              
              <p className="text-lg text-gray-400 mb-12">
                The page you're looking for doesn't exist or has been moved to another location.
              </p>

              <Link href="/">
                <motion.div 
                  className="inline-flex items-center gap-3 bg-blue-500/10 border border-blue-500/30 px-6 py-3 rounded-lg text-blue-400 hover:bg-blue-500/20 transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Home className="w-5 h-5" />
                  <span>Return to Homepage</span>
                </motion.div>
              </Link>
            </motion.div>
          </div>

          {/* Background elements - Only render after component is mounted */}
          <div className="absolute inset-0 -z-10 overflow-hidden">
            {mounted && <StarParticles count={50} />}
          </div>
        </section>
        
        {/* Footer */}
        <footer className="bg-black border-t border-gray-800 py-8">
          <div className="container mx-auto px-4">
            <div className="text-center mb-8">
              <motion.div 
                className="text-2xl font-light tracking-wider mb-6 inline-block"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <span className="font-extralight">Field</span><span className="font-light">X</span>
              </motion.div>
              <p className="text-gray-400 text-sm max-w-md mx-auto">
                The complete CRM/FSM platform for managing FTTH projects in Greece.
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto mb-12">
              <div className="text-center">
                <h3 className="text-sm uppercase tracking-wider mb-4">Products</h3>
                <ul className="space-y-2 text-gray-400 text-sm">
                  <motion.li whileHover={{ y: -2 }} className="flex justify-center">
                    <Link href="/products/field-management" className="hover:text-blue-400 transition-colors">
                      Field Management
                    </Link>
                  </motion.li>
                  <motion.li whileHover={{ y: -2 }} className="flex justify-center">
                    <Link href="/products/office-tools" className="hover:text-blue-400 transition-colors">
                      Office Tools
                    </Link>
                  </motion.li>
                  <motion.li whileHover={{ y: -2 }} className="flex justify-center">
                    <Link href="/products/ai-scheduler" className="hover:text-blue-400 transition-colors">
                      AI Scheduler
                    </Link>
                  </motion.li>
                </ul>
              </div>

              <div className="text-center">
                <h3 className="text-sm uppercase tracking-wider mb-4">Company</h3>
                <ul className="space-y-2 text-gray-400 text-sm">
                  <motion.li whileHover={{ y: -2 }} className="flex justify-center">
                    <Link href="/about" className="hover:text-blue-400 transition-colors">
                      About Us
                    </Link>
                  </motion.li>
                  <motion.li whileHover={{ y: -2 }} className="flex justify-center">
                    <Link href="/careers" className="hover:text-blue-400 transition-colors">
                      Careers
                    </Link>
                  </motion.li>
                  <motion.li whileHover={{ y: -2 }} className="flex justify-center">
                    <Link href="/contact" className="hover:text-blue-400 transition-colors">
                      Contact
                    </Link>
                  </motion.li>
                </ul>
              </div>

              <div className="text-center">
                <h3 className="text-sm uppercase tracking-wider mb-4">Support</h3>
                <ul className="space-y-2 text-gray-400 text-sm">
                  <motion.li whileHover={{ y: -2 }} className="flex justify-center">
                    <Link href="/docs" className="hover:text-blue-400 transition-colors">
                      Documentation
                    </Link>
                  </motion.li>
                  <motion.li whileHover={{ y: -2 }} className="flex justify-center">
                    <Link href="/faq" className="hover:text-blue-400 transition-colors">
                      FAQ
                    </Link>
                  </motion.li>
                  <motion.li whileHover={{ y: -2 }} className="flex justify-center">
                    <Link href="/help" className="hover:text-blue-400 transition-colors">
                      Help Center
                    </Link>
                  </motion.li>
                </ul>
              </div>

              <div className="text-center">
                <h3 className="text-sm uppercase tracking-wider mb-4">Legal</h3>
                <ul className="space-y-2 text-gray-400 text-sm">
                  <motion.li whileHover={{ y: -2 }} className="flex justify-center">
                    <Link href="/privacy-policy" className="hover:text-blue-400 transition-colors">
                      Privacy Policy
                    </Link>
                  </motion.li>
                  <motion.li whileHover={{ y: -2 }} className="flex justify-center">
                    <Link href="/terms-of-service" className="hover:text-blue-400 transition-colors">
                      Terms of Service
                    </Link>
                  </motion.li>
                </ul>
              </div>
            </div>

            <div className="border-t border-white/10 pt-8 text-center text-xs text-gray-500">
              <p>© {new Date().getFullYear()} FieldX. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </div>
    </PageTransitionWrapper>
  )
}