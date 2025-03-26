"use client"

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { PageTransitionWrapper } from '@/components/page-transition';
import { ChevronLeft } from 'lucide-react';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    
    setIsLoading(true);
    const result = await register(email, password);
    
    if (result.error) {
      setError(result.error);
      setIsLoading(false);
    }
  };

  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <PageTransitionWrapper>
      <div className="min-h-screen bg-black text-white flex justify-center items-center p-4">
        {/* White Header */}
        <motion.header
          className="fixed top-0 left-0 right-0 z-50 bg-white shadow-md"
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
              
              <motion.div className="flex items-center space-x-6" whileHover={{ scale: 1.05 }}>
                <Link href="/login" className="uppercase text-xs tracking-widest text-gray-800 hover:text-blue-600 transition-colors">
                  Login / Register
                </Link>
              </motion.div>
            </div>
          </div>
        </motion.header>

        <motion.div 
          className="max-w-md w-full bg-gray-900 rounded-lg overflow-hidden shadow-xl mt-20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="py-6 px-8">
            <Link href="/" className="inline-block mb-6">
              <motion.div 
                className="flex items-center text-blue-400 hover:text-blue-300 transition-colors"
                whileHover={{ x: -5 }}
              >
                <ChevronLeft size={18} />
                <span className="ml-1 text-sm">Back to Home</span>
              </motion.div>
            </Link>
            
            <motion.div
              className="text-center mb-8"
              variants={fadeInUp}
              initial="hidden"
              animate="visible"
            >
              <h1 className="text-3xl font-light tracking-wide mb-2">Create Account</h1>
              <p className="text-gray-400 text-sm">Join FieldX and start managing your FTTH projects</p>
            </motion.div>
            
            {error && (
              <motion.div 
                className="mb-6 p-3 bg-red-500/10 border border-red-500/30 rounded-md text-red-400 text-sm"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {error}
              </motion.div>
            )}
            
            <form onSubmit={handleSubmit}>
              <motion.div 
                className="mb-6"
                variants={fadeInUp}
                initial="hidden"
                animate="visible"
                transition={{ delay: 0.1 }}
              >
                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  placeholder="your@email.com"
                  required
                />
              </motion.div>
              
              <motion.div 
                className="mb-6"
                variants={fadeInUp}
                initial="hidden"
                animate="visible"
                transition={{ delay: 0.2 }}
              >
                <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  placeholder="••••••••"
                  required
                />
              </motion.div>
              
              <motion.div 
                className="mb-8"
                variants={fadeInUp}
                initial="hidden"
                animate="visible"
                transition={{ delay: 0.3 }}
              >
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-2">
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  placeholder="••••••••"
                  required
                />
              </motion.div>
              
              <motion.div
                variants={fadeInUp}
                initial="hidden"
                animate="visible"
                transition={{ delay: 0.4 }}
              >
                <motion.button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-md font-medium transition-colors duration-300"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Creating account...
                    </span>
                  ) : (
                    'Create Account'
                  )}
                </motion.button>
              </motion.div>
              
              <motion.div 
                className="mt-6 text-xs text-gray-500 text-center"
                variants={fadeInUp}
                initial="hidden"
                animate="visible"
                transition={{ delay: 0.5 }}
              >
                By creating an account, you agree to FieldX's{' '}
                <Link href="/terms" className="text-blue-400 hover:text-blue-300 transition-colors">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link href="/privacy" className="text-blue-400 hover:text-blue-300 transition-colors">
                  Privacy Policy
                </Link>
              </motion.div>
            </form>
            
            <motion.div 
              className="mt-8 text-center text-sm text-gray-400"
              variants={fadeInUp}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.6 }}
            >
              Already have an account?{' '}
              <Link href="/login" className="text-blue-400 hover:text-blue-300 transition-colors">
                Log in
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </PageTransitionWrapper>
  );
}