"use client"

// components/client-layout.tsx
import { useState, useEffect } from 'react'
import PreLoader from '@/components/preloader'

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isFirstLoad, setIsFirstLoad] = useState(true)

  // After first render, mark the site as loaded
  useEffect(() => {
    // Check if this is actually the first load of the site
    if (typeof window !== 'undefined') {
      const hasVisited = localStorage.getItem('hasVisitedFieldX')
      
      if (hasVisited) {
        setIsFirstLoad(false)
      } else {
        // Set the flag for future visits
        localStorage.setItem('hasVisitedFieldX', 'false')
        
        // Even on first visit, hide the preloader after some maximum time
        // In case something goes wrong with the loader itself
        const safetyTimeout = setTimeout(() => {
          setIsFirstLoad(false)
        }, 8000) // 8 seconds max
        
        return () => clearTimeout(safetyTimeout)
      }
    }
  }, [])

  return (
    <>
      {isFirstLoad && <PreLoader />}
      {children}
    </>
  )
}