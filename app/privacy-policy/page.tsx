"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { ChevronDown } from "lucide-react"
import MainMenu from "@/components/main-menu"
import { PageTransitionWrapper } from "@/components/page-transition"
import { useAuth } from "@/context/AuthContext"

// Type definitions
interface UserType {
  email?: string;
}

interface AuthContextType {
  user: UserType | null;
  logout: () => void;
}

export default function PrivacyPolicy() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { user, logout } = useAuth() as AuthContextType

  useEffect(() => {
    document.documentElement.style.scrollBehavior = "smooth"
    
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }

    window.addEventListener("scroll", handleScroll)
    
    return () => {
      window.removeEventListener("scroll", handleScroll)
      document.documentElement.style.scrollBehavior = ""
    }
  }, [])

  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  }

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
                  <span className="hidden md:inline-block">{user?.email?.split('@')[0] || 'User'}</span>
                  <ChevronDown className="h-4 w-4" />
                </div>
              ) : (
                // Show login/register if not logged in
                <motion.div className="flex items-center space-x-6" whileHover={{ scale: 1.05 }}>
                  {/* <Link href="/login" className="uppercase text-xs tracking-widest text-gray-800 hover:text-blue-600 transition-colors">
                    Login / Register
                  </Link> */}
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

        {/* Privacy Policy Content */}
        <section className="pt-32 pb-24 bg-black">
          <div className="container mx-auto px-6">
            <motion.div 
              className="max-w-4xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-4xl md:text-5xl font-light mb-8 text-center text-white">Privacy Policy</h1>
              
              <motion.div 
                className="space-y-8 text-gray-300"
                variants={{
                  hidden: { opacity: 0 },
                  visible: { opacity: 1 }
                }}
                initial="hidden"
                animate="visible"
                transition={{ 
                  staggerChildren: 0.1,
                  delayChildren: 0.3
                }}
              >
                <motion.div variants={fadeInUp} className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-6 hover:border-blue-500/30 transition-colors duration-300">
                  <p className="mb-4">Last Updated: March 27, 2025</p>
                  <p>Your privacy is important to us. This Privacy Policy explains how FieldX ("we", "our", or "us") collects, uses, and protects the information you provide when you use our website (www.fieldx.gr).</p>
                </motion.div>

                <motion.div variants={fadeInUp} className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-6 hover:border-blue-500/30 transition-colors duration-300">
                  <h2 className="text-2xl font-light mb-4 text-white">1. What We Collect</h2>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Name, email address, phone number (if submitted)</li>
                    <li>Technical data like IP address, browser type</li>
                    <li>Usage data from analytics tools (e.g. Google Analytics)</li>
                  </ul>
                </motion.div>

                <motion.div variants={fadeInUp} className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-6 hover:border-blue-500/30 transition-colors duration-300">
                  <h2 className="text-2xl font-light mb-4 text-white">2. How We Use Data</h2>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>To respond to contact requests</li>
                    <li>To improve our services and website</li>
                    <li>To analyze website traffic and user behavior</li>
                  </ul>
                </motion.div>

                <motion.div variants={fadeInUp} className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-6 hover:border-blue-500/30 transition-colors duration-300">
                  <h2 className="text-2xl font-light mb-4 text-white">3. Your Rights</h2>
                  <p>You have the right to access, correct, or delete your data. Email us at privacy@fieldx.gr to request changes.</p>
                </motion.div>

                <motion.div variants={fadeInUp} className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-6 hover:border-blue-500/30 transition-colors duration-300">
                  <h2 className="text-2xl font-light mb-4 text-white">4. Cookies</h2>
                  <p>We use cookies to improve your experience. You can disable cookies in your browser settings.</p>
                </motion.div>
                
                <motion.div variants={fadeInUp} className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-6 hover:border-blue-500/30 transition-colors duration-300">
                  <h2 className="text-2xl font-light mb-4 text-white">5. Contact</h2>
                  <p>If you have any questions, contact us at <strong>privacy@fieldx.gr</strong>.</p>
                </motion.div>

              </motion.div>
            </motion.div>
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