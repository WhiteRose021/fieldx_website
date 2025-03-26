"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { useAuth } from '@/context/AuthContext'

export default function Header({ scrolled = false }) {
  const { user, logout } = useAuth()
  
  return (
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
              <Link href="/" className="uppercase text-xs tracking-widest text-gray-800 hover:text-blue-600 transition-colors">
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
          
          <div className="flex items-center space-x-6">
            {user ? (
              <>
                <motion.div whileHover={{ scale: 1.05 }}>
                  <Link href="/dashboard" className="uppercase text-xs tracking-widest text-gray-800 hover:text-blue-600 transition-colors">
                    Dashboard
                  </Link>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }}>
                  <button 
                    onClick={logout}
                    className="uppercase text-xs tracking-widest text-gray-800 hover:text-blue-600 transition-colors"
                  >
                    Logout
                  </button>
                </motion.div>
              </>
            ) : (
              <motion.div whileHover={{ scale: 1.05 }}>
                <Link href="/login" className="uppercase text-xs tracking-widest text-gray-800 hover:text-blue-600 transition-colors">
                  Login / Register
                </Link>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </motion.header>
  )
}