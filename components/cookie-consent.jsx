"use client"

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'

// Cookie categories and descriptions
const cookieCategories = [
  {
    id: 'essential',
    name: 'Απαραίτητα',
    description: 'Αυτά τα cookies είναι απαραίτητα για τη λειτουργία του ιστότοπου και δεν μπορούν να απενεργοποιηθούν.',
    required: true
  },
  {
    id: 'functional',
    name: 'Λειτουργικά',
    description: 'Αυτά τα cookies επιτρέπουν εξατομικευμένες λειτουργίες και προτιμήσεις.',
    required: false
  },
  {
    id: 'analytics',
    name: 'Αναλυτικά',
    description: 'Βοηθούν στην κατανόηση της χρήσης του ιστότοπου και τη βελτίωση της εμπειρίας.',
    required: false
  },
  {
    id: 'marketing',
    name: 'Μάρκετινγκ',
    description: 'Χρησιμοποιούνται για την παροχή σχετικών διαφημίσεων με βάση τα ενδιαφέροντά σας.',
    required: false
  }
]

const CookieConsent = () => {
  const [isVisible, setIsVisible] = useState(false)
  const [showCustomize, setShowCustomize] = useState(false)
  const [preferences, setPreferences] = useState(() => {
    // Default all categories to false except required ones
    return cookieCategories.reduce((acc, category) => {
      acc[category.id] = category.required
      return acc
    }, {})
  })
  
  useEffect(() => {
    // Don't run during SSR
    if (typeof window === 'undefined') return
    
    // Check if user has already set cookie preferences
    const savedPreferences = localStorage.getItem('cookiePreferences')
    const hasConsented = localStorage.getItem('cookieConsent')
    
    if (savedPreferences) {
      try {
        setPreferences(JSON.parse(savedPreferences))
      } catch (e) {
        console.error('Error parsing saved cookie preferences', e)
      }
    }
    
    if (!hasConsented) {
      // Delay showing the popup by 2 seconds
      const timer = setTimeout(() => {
        setIsVisible(true)
      }, 2000)
      
      return () => clearTimeout(timer)
    }
  }, [])

  // Actually apply the cookie preferences
  useEffect(() => {
    if (localStorage.getItem('cookieConsent')) {
      applyCookiePreferences()
    }
  }, [preferences])
  
  const applyCookiePreferences = () => {
    // Enable/disable cookies based on preferences
    
    // Essential cookies are always enabled
    
    // FUNCTIONAL COOKIES
    if (preferences.functional) {
      // Enable functional cookies
      // This is where you'd initialize functional cookies or scripts
      console.log('Functional cookies enabled')
    } else {
      // Disable functional cookies
      console.log('Functional cookies disabled')
    }
    
    // ANALYTICS COOKIES
    if (preferences.analytics) {
      // Enable analytics (like Google Analytics)
      // Example for enabling GA
      window.enableAnalytics = true
      if (typeof window.initializeAnalytics === 'function') {
        window.initializeAnalytics()
      }
      console.log('Analytics cookies enabled')
    } else {
      // Disable analytics
      window.enableAnalytics = false
      console.log('Analytics cookies disabled')
    }
    
    // MARKETING COOKIES
    if (preferences.marketing) {
      // Enable marketing cookies
      window.enableMarketing = true
      console.log('Marketing cookies enabled')
    } else {
      // Disable marketing cookies
      window.enableMarketing = false
      console.log('Marketing cookies disabled')
    }
  }

  const savePreferences = () => {
    localStorage.setItem('cookieConsent', 'custom')
    localStorage.setItem('cookiePreferences', JSON.stringify(preferences))
    applyCookiePreferences()
    setShowCustomize(false)
    setIsVisible(false)
  }
  
  const handleAcceptAll = () => {
    const allEnabled = cookieCategories.reduce((acc, category) => {
      acc[category.id] = true
      return acc
    }, {})
    
    setPreferences(allEnabled)
    localStorage.setItem('cookieConsent', 'true')
    localStorage.setItem('cookiePreferences', JSON.stringify(allEnabled))
    applyCookiePreferences()
    setIsVisible(false)
  }
  
  const handleRejectNonEssential = () => {
    const essentialOnly = cookieCategories.reduce((acc, category) => {
      acc[category.id] = category.required
      return acc
    }, {})
    
    setPreferences(essentialOnly)
    localStorage.setItem('cookieConsent', 'minimal')
    localStorage.setItem('cookiePreferences', JSON.stringify(essentialOnly))
    applyCookiePreferences()
    setIsVisible(false)
  }
  
  const handleCustomize = () => {
    setShowCustomize(true)
  }

  const handleToggleCategory = (categoryId) => {
    // Don't allow toggling required categories
    const category = cookieCategories.find(c => c.id === categoryId)
    if (category?.required) return
    
    setPreferences(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }))
  }
  
  // Function to reset cookie consent (useful for testing)
  const resetConsent = () => {
    localStorage.removeItem('cookieConsent')
    localStorage.removeItem('cookiePreferences')
    window.location.reload()
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div 
          key="cookie-consent"
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
                  Χρησιμοποιούμε cookies για να βελτιώσουμε την εμπειρία περιήγησής σας, να προσφέρουμε εξατομικευμένο περιεχόμενο και να αναλύσουμε την επισκεψιμότητα. Επιλέγοντας "Αποδοχή όλων", συναινείτε στη χρήση cookies όπως περιγράφεται στην <Link href="/privacy-policy" className="text-blue-400 hover:text-blue-300 underline">Πολιτική Απορρήτου</Link> και <Link href="/terms" className="text-blue-400 hover:text-blue-300 underline">Όρους Χρήσης</Link>.
                </p>
                <div className="flex flex-wrap gap-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-md transition-colors"
                    onClick={handleAcceptAll}
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
                    onClick={handleRejectNonEssential}
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

      {/* Customization Modal */}
      <AnimatePresence>
        {showCustomize && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={(e) => {
              // Close modal when clicking outside
              if (e.target === e.currentTarget) {
                setShowCustomize(false)
              }
            }}
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gray-900 border border-gray-800 rounded-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto"
            >
              <div className="p-6">
                <h2 className="text-2xl font-light text-white mb-6">Ρυθμίσεις Cookies</h2>
                
                <div className="space-y-6 mb-8">
                  {cookieCategories.map((category) => (
                    <div key={category.id} className="border-b border-gray-800 pb-4 last:border-0">
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center">
                          <h3 className="text-lg font-medium text-white">{category.name}</h3>
                          {category.required && (
                            <span className="ml-2 text-xs bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded">
                              Απαραίτητο
                            </span>
                          )}
                        </div>
                        
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input 
                            type="checkbox" 
                            className="sr-only peer"
                            checked={preferences[category.id]}
                            disabled={category.required}
                            onChange={() => handleToggleCategory(category.id)}
                          />
                          <div className={`w-11 h-6 bg-gray-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 ${category.required ? 'opacity-60' : ''}`}></div>
                        </label>
                      </div>
                      <p className="text-gray-400 text-sm">{category.description}</p>
                    </div>
                  ))}
                </div>
                
                <div className="flex justify-between">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowCustomize(false)}
                    className="bg-transparent hover:bg-gray-800 text-gray-400 font-medium py-2 px-4 rounded-md transition-colors"
                  >
                    Ακύρωση
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={savePreferences}
                    className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-md transition-colors"
                  >
                    Αποθήκευση Προτιμήσεων
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </AnimatePresence>
  )
}

export default CookieConsent