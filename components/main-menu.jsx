"use client"

import { useEffect, useRef } from "react"
import Link from "next/link"
import { X } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

const MainMenu = ({ isOpen, onClose }) => {
  const menuRef = useRef(null)

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") {
        onClose()
      }
    }

    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener("keydown", handleEscape)
      document.addEventListener("mousedown", handleClickOutside)
      document.body.style.overflow = "hidden"
    }

    return () => {
      document.removeEventListener("keydown", handleEscape)
      document.removeEventListener("mousedown", handleClickOutside)
      document.body.style.overflow = ""
    }
  }, [isOpen, onClose])

  const menuVariants = {
    closed: {
      y: "-100%",
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 40,
        when: "afterChildren",
        staggerChildren: 0.05,
        staggerDirection: -1
      }
    },
    open: {
      y: "0%",
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30,
        when: "beforeChildren",
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  }

  const itemVariants = {
    closed: { 
      opacity: 0, 
      y: 20,
      transition: { duration: 0.2 } 
    },
    open: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.4 } 
    }
  }

  const staggeredLinks = [
    { href: "/", label: "Home" },
    { href: "/services", label: "Services" },
    { href: "/modules", label: "Modules" },
    { href: "/features", label: "Features" },
    { href: "/integrations", label: "Integrations" },
    { href: "/about", label: "About Us" },
    { href: "/contact", label: "Contact" },
  ]

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 overflow-hidden"
        >
          <motion.div
            className="absolute inset-0 bg-black/90 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          
          <motion.div
            ref={menuRef}
            className="absolute inset-0 z-10 bg-gradient-to-b from-blue-900/20 to-black/90 overflow-auto"
            variants={menuVariants}
            initial="closed"
            animate="open"
            exit="closed"
          >
            <div className="container mx-auto px-6 py-20 h-full flex flex-col">
              <div className="flex justify-end mb-10">
                <motion.button
                  className="text-white p-2 focus:outline-none"
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={onClose}
                >
                  <X size={24} />
                </motion.button>
              </div>
              
              <div className="flex-1 flex flex-col justify-center">
                <motion.div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-8">
                  <div className="space-y-6">
                    <motion.h3 
                      className="text-xl font-light mb-6 text-blue-400"
                      variants={itemVariants}
                    >
                      Navigation
                    </motion.h3>
                    <nav className="space-y-4">
                      {staggeredLinks.map((link, index) => (
                        <motion.div
                          key={index}
                          variants={itemVariants}
                          custom={index}
                          whileHover={{ x: 10 }}
                        >
                          <Link 
                            href={link.href}
                            className="text-3xl font-extralight tracking-wider hover:text-blue-400 transition-colors"
                            onClick={onClose}
                          >
                            {link.label}
                          </Link>
                        </motion.div>
                      ))}
                    </nav>
                  </div>
                  
                  <div>
                    <motion.h3 
                      className="text-xl font-light mb-6 text-blue-400"
                      variants={itemVariants}
                    >
                      Contact
                    </motion.h3>
                    <div className="space-y-4">
                      <motion.div variants={itemVariants}>
                        <p className="text-gray-400">Email</p>
                        <a 
                          href="mailto:info@fieldx.com"
                          className="text-xl font-light hover:text-blue-400 transition-colors"
                        >
                          info@fieldx.com
                        </a>
                      </motion.div>
                      
                      <motion.div variants={itemVariants}>
                        <p className="text-gray-400">Phone</p>
                        <a 
                          href="tel:+302100000000"
                          className="text-xl font-light hover:text-blue-400 transition-colors"
                        >
                          +30 210 000 0000
                        </a>
                      </motion.div>
                      
                      <motion.div variants={itemVariants} className="pt-6">
                        <div className="flex space-x-4">
                          <motion.a 
                            href="#" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="w-10 h-10 rounded-full border border-white/30 flex items-center justify-center hover:border-blue-400 hover:text-blue-400 transition-colors"
                            whileHover={{ scale: 1.1, borderColor: "#3B82F6" }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                              <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                            </svg>
                          </motion.a>
                          
                          <motion.a 
                            href="#" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="w-10 h-10 rounded-full border border-white/30 flex items-center justify-center hover:border-blue-400 hover:text-blue-400 transition-colors"
                            whileHover={{ scale: 1.1, borderColor: "#3B82F6" }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                              <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                              <rect x="2" y="9" width="4" height="12"></rect>
                              <circle cx="4" cy="4" r="2"></circle>
                            </svg>
                          </motion.a>
                          
                          <motion.a 
                            href="#" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="w-10 h-10 rounded-full border border-white/30 flex items-center justify-center hover:border-blue-400 hover:text-blue-400 transition-colors"
                            whileHover={{ scale: 1.1, borderColor: "#3B82F6" }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                              <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                              <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                            </svg>
                          </motion.a>
                        </div>
                      </motion.div>
                    </div>
                  </div>
                </motion.div>
              </div>
              
              <motion.div 
                className="mt-10 text-center text-gray-500 text-sm"
                variants={itemVariants}
              >
                <p>&copy; {new Date().getFullYear()} Arvanitis G. All rights reserved.</p>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default MainMenu