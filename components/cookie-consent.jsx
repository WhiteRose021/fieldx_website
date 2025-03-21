"use client"

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const CookieConsent = () => {
  const [isVisible, setIsVisible] = useState(false)
  
  useEffect(() => {
    // Check if user has already consented
    const hasConsented = localStorage.getItem('cookieConsent')
    
    if (!hasConsented) {
      // Delay showing the popup by 2 seconds
      const timer = setTimeout(() => {
        setIsVisible(true)
      }, 2000)
      
      return () => clearTimeout(timer)
    }
  }, [])
  
  const handleAccept = () => {
    localStorage.setItem('cookieConsent', 'true')
    setIsVisible(false)
  }
  
  const handleDecline = () => {
    localStorage.setItem('cookieConsent', 'false')
    setIsVisible(false)
  }
  
  const handleCustomize = () => {
    // Could open a more detailed modal here
    localStorage.setItem('cookieConsent', 'custom')
    setIsVisible(false)
  }
  
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div 
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="fixed bottom-0 left-0 right-0 z-50 p-4"
        >
          <div className="max-w-5xl mx-auto bg-gray-900/90 backdrop-blur-md border border-blue-900/50 rounded-lg shadow-xl overflow-hidden">
            <div className="flex flex-col md:flex-row p-4 md:p-6 gap-6">
              <div className="flex-1">
                <h2 className="text-xl font-medium text-white mb-2">Πολιτική Cookies</h2>
                <p className="text-gray-300 mb-4">
                  Χρησιμοποιούμε cookies για να βελτιώσουμε την εμπειρία περιήγησής σας, να προσφέρουμε εξατομικευμένο περιεχόμενο και να αναλύσουμε την επισκεψιμότητα. Επιλέγοντας "Αποδοχή όλων", συναινείτε στη χρήση cookies όπως περιγράφεται στην Πολιτική Cookies.
                </p>
                <div className="flex flex-wrap gap-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-md transition-colors"
                    onClick={handleAccept}
                  >
                    Αποδοχή όλων
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="bg-transparent hover:bg-gray-800 text-white font-medium py-2 px-4 rounded-md border border-gray-500 transition-colors"
                    onClick={handleCustomize}
                  >
                    Προσαρμογή
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="bg-transparent hover:bg-gray-800 text-gray-400 font-medium py-2 px-4 rounded-md transition-colors"
                    onClick={handleDecline}
                  >
                    Απόρριψη μη απαραίτητων
                  </motion.button>
                </div>
              </div>
              <div className="flex-shrink-0 flex items-start">
                <motion.div 
                  className="w-16 h-16 rounded-full border border-blue-400 flex items-center justify-center"
                  animate={{
                    boxShadow: [
                      '0 0 5px rgba(59, 130, 246, 0.3)',
                      '0 0 15px rgba(59, 130, 246, 0.6)',
                      '0 0 5px rgba(59, 130, 246, 0.3)'
                    ]
                  }}
                  transition={{
                    repeat: Infinity,
                    duration: 3
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                  </svg>
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default CookieConsent