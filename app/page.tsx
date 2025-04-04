"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import { ChevronDown, User, LogOut, Zap, Clock, Database, Calendar, FileCode } from "lucide-react"
import Link from "next/link"
import MainMenu from "@/components/main-menu"
import { motion, useAnimation, useSpring, useMotionValue, useTransform } from "framer-motion"
import FuturisticLights from "@/components/futuristic-lights"
// Removed OpticalFiberAnimation import
import CookieConsent from "@/components/cookie-consent"
import { PageTransitionWrapper } from "@/components/page-transition"
import PricingPlans from "@/components/pricing-plans"
import { useAuth } from "@/context/AuthContext"
import SEO from "@/components/SEO"




// Type definitions
interface UserType {
  email?: string;
  // Add other user properties as needed
}

interface AuthContextType {
  user: UserType | null;
  logout: () => void;
}

interface UserMenuProps {
  user: UserType | null;
  logout: () => void;
}

interface FeatureCardProps {
  icon: React.ElementType;
  title: string;
  description: string;
  delay?: number;
}

// FIXED GravityElement component
const GravityElement = () => {
  const constraintsRef = useRef(null)
  const [mounted, setMounted] = useState(false)
  
  // Initialize motion values at the top level of the component
  // This is the correct way according to React's Rules of Hooks
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const springX = useSpring(x, { stiffness: 300, damping: 20 })
  const springY = useSpring(y, { stiffness: 300, damping: 20 })
  
  useEffect(() => {
    // Safe to manipulate motion values here, but no NEW hooks
    setMounted(true)
    
    // Use stable values instead of random for the subtle animation
    const interval = setInterval(() => {
      // Use sine/cosine for deterministic movement instead of random
      const time = Date.now() / 1000
      x.set(Math.sin(time) * 5)
      y.set(Math.cos(time) * 5)
    }, 3000)
    
    return () => clearInterval(interval)
  }, [x, y]) // Include x and y in the dependency array
  
  // Return skeleton/placeholder when not mounted (server-side)
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
        {/* Starry FieldX Animation */}
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
            
            {/* Fix star particles to use consistent seeds instead of random */}
            <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
              {Array.from({ length: 50 }).map((_, i) => {
                // Use index to create deterministic but varied positions
                const xPos = (i % 10) * 10
                const yPos = Math.floor(i / 10) * 10
                const scale = 0.5 + (i % 3) * 0.5
                const duration = 3 + (i % 5)
                const delay = (i % 10) * 0.5
                
                return (
                  <motion.div
                    key={i}
                    className="absolute h-0.5 w-0.5 rounded-full bg-blue-100"
                    style={{
                      top: `${yPos}%`,
                      left: `${xPos}%`,
                      scale: scale,
                    }}
                    animate={{
                      opacity: [0, 0.7, 0],
                      scale: [0, scale * 2, 0],
                    }}
                    transition={{
                      repeat: Infinity,
                      duration: duration,
                      delay: delay,
                      ease: "easeInOut"
                    }}
                  />
                )
              })}
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
              animate={{
                filter: [
                  "drop-shadow(0 0 5px rgba(255, 255, 255, 0.3))",
                  "drop-shadow(0 0 15px rgba(255, 255, 255, 0.7))",
                  "drop-shadow(0 0 5px rgba(255, 255, 255, 0.3))"
                ]
              }}
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
      </div>
    </motion.div>
  )
}

// User Menu Dropdown Component
const UserMenu = ({ user, logout }: UserMenuProps) => {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <div className="relative">
      <motion.button 
        className="flex items-center space-x-2 text-sm text-gray-800"
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.05 }}
        transition={{ type: "spring", stiffness: 400, damping: 10 }}
      >
        <span className="hidden md:inline-block">{user?.email?.split('@')[0] || 'User'}</span>
        <ChevronDown className="h-4 w-4" />
      </motion.button>
      
      {isOpen && (
        <motion.div 
          className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 text-gray-800"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          <Link href="/dashboard">
            <motion.div 
              className="block px-4 py-2 text-sm hover:bg-gray-100 flex items-center"
              whileHover={{ x: 5 }}
            >
              <User size={16} className="mr-2" />
              Dashboard
            </motion.div>
          </Link>
          <motion.div 
            className="block px-4 py-2 text-sm hover:bg-gray-100 cursor-pointer flex items-center"
            onClick={logout}
            whileHover={{ x: 5 }}
          >
            <LogOut size={16} className="mr-2" />
            Log Out
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

// Feature Card Component
const FeatureCard = ({ icon: Icon, title, description, delay = 0 }: FeatureCardProps) => {
  return (
    <motion.div
      className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-6 flex flex-col items-center"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay }}
      whileHover={{ y: -10, boxShadow: "0 10px 30px -15px rgba(59, 130, 246, 0.3)" }}
    >
      <motion.div 
        className="w-16 h-16 mb-6 rounded-full bg-blue-500/10 flex items-center justify-center"
        whileHover={{ scale: 1.1, backgroundColor: "rgba(59, 130, 246, 0.2)" }}
        animate={{ 
          boxShadow: ["0px 0px 0px rgba(59, 130, 246, 0)", "0px 0px 20px rgba(59, 130, 246, 0.3)", "0px 0px 0px rgba(59, 130, 246, 0)"],
        }}
        transition={{
          boxShadow: {
            repeat: Infinity,
            duration: 3,
          },
        }}
      >
        <Icon className="w-8 h-8 text-blue-400" />
      </motion.div>
      <h3 className="text-xl font-light mb-3">{title}</h3>
      <p className="text-gray-400 text-center">{description}</p>
    </motion.div>
  );
};

// Add a client-side only footer component for date handling
const FooterWithYear = () => {
  const [year, setYear] = useState("2025");
  
  useEffect(() => {
    setYear(new Date().getFullYear().toString());
  }, []);
  
  return (
    <div className="border-t border-white/10 pt-8 text-center text-xs text-gray-500">
      <p>© {year} Arvanitis G. All rights reserved.</p>
    </div>
  );
};

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const controls = useAnimation();
  const { user, logout } = useAuth() as AuthContextType;

  useEffect(() => {
    // Add smooth scrolling behavior
    document.documentElement.style.scrollBehavior = "smooth";
    
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }

    window.addEventListener("scroll", handleScroll)
    controls.start({ opacity: 1, y: 0 })
    
    return () => {
      window.removeEventListener("scroll", handleScroll)
      document.documentElement.style.scrollBehavior = "";
    }
  }, [controls])

  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  }

  return (
    
    <PageTransitionWrapper>
      
      <div className="min-h-screen bg-black text-white overflow-x-hidden">
      <FuturisticLights />
        <CookieConsent />
        
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
                  <Link href="#" className="uppercase text-xs tracking-widest text-gray-800 hover:text-blue-600 transition-colors">
                    FieldX World
                  </Link>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }}>
                  <Link href="#discover" className="uppercase text-xs tracking-widest text-gray-800 hover:text-blue-600 transition-colors">
                    Solutions
                  </Link>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }}>
                  <Link href="#features" className="uppercase text-xs tracking-widest text-gray-800 hover:text-blue-600 transition-colors">
                    Features
                  </Link>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }}>
                  <Link href="#pricing" className="uppercase text-xs tracking-widest text-gray-800 hover:text-blue-600 transition-colors">
                    Pricing
                  </Link>
                </motion.div>
              </nav>
              
              {user ? (
                // Show user menu if logged in
                <UserMenu user={user} logout={logout} />
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

        {/* Hero Section - Centered */}
        <section className="relative h-screen flex items-center justify-center">
          <div className="absolute inset-0 z-0">
            <motion.div 
              className="absolute inset-0 bg-gradient-to-r from-black to-black/70"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1.5 }}
            ></motion.div>
          </div>

          <div className="relative z-10 text-center flex flex-col items-center justify-center w-full">
            {/* Gravity Element */}
            <GravityElement />

            <motion.div 
              className="mt-8 flex flex-col items-center"
              initial="hidden"
              animate="visible"
              variants={{
                visible: {
                  transition: {
                    staggerChildren: 0.1
                  }
                }
              }}
            >
              <motion.h1 
                className="text-6xl md:text-7xl font-light tracking-wide mb-4"
                variants={fadeInUp}
                transition={{ duration: 0.8 }}
              >
                A NEW ERA
              </motion.h1>
              
              <motion.p
                className="text-xl md:text-2xl font-light tracking-wide text-gray-300"
                variants={fadeInUp}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                The complete FTTH management platform
              </motion.p>
            </motion.div>

            <motion.div 
              className="mt-12"
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 1, duration: 0.8 }}
            >
              <Link href={user ? "/dashboard" : "/apply"} className="inline-block">
                <motion.div 
                  className="flex flex-col items-center justify-center group"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className="relative border-2 border-white/50 rounded-full w-36 h-36 flex flex-col items-center justify-center group hover:border-blue-500 transition-colors duration-300">
                    <motion.div className="text-sm uppercase tracking-widest text-center">
                      <div>{user ? "Dashboard" : "Apply"}</div>
                      <div>{user ? "Access" : "Now"}</div>
                    </motion.div>
                    <motion.div
                      animate={{ 
                        y: [0, 5, 0], 
                      }}
                      transition={{ 
                        repeat: Infinity, 
                        duration: 1.5,
                      }}
                      className="absolute bottom-6"
                    >
                      <ChevronDown className="h-4 w-4 text-white/70 group-hover:text-blue-400 transition-colors duration-300" />
                    </motion.div>
                  </div>
                </motion.div>
              </Link>
            </motion.div>
          </div>
        </section>

        {/* Discover Section with Feature Icons */}
        <section id="discover" className="py-24 bg-black">
          <div className="container mx-auto px-6">
            <motion.div 
              className="text-center mb-16"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-4xl font-light mb-6">Powerful FTTH Solutions</h2>
              <p className="text-lg text-gray-400 max-w-3xl mx-auto">
                Streamline your telecommunications operations and fiber deployments with AI-powered tools and automation.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <FeatureCard 
                icon={Database} 
                title="Real-time Data Synchronization" 
                description="Seamless communication between field and office teams with instant updates and notifications."
                delay={0.1} 
              />
              <FeatureCard 
                icon={Calendar} 
                title="AI Appointment Scheduler" 
                description="Intelligent scheduling for autopsies and constructions, optimizing your team's time and resources."
                delay={0.2} 
              />
              <FeatureCard 
                icon={FileCode} 
                title="As-Built Automation" 
                description="Automatically generate complete documentation packages for billing and supervisor review."
                delay={0.3} 
              />
            </div>

            <motion.div 
              className="mt-16 text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5, duration: 0.8 }}
            >
              <Link href="#features">
                <motion.div 
                  className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300"
                  whileHover={{ y: -5 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  <span>Explore All Features</span>
                  <motion.div
                    animate={{ y: [0, 3, 0] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                  >
                    <ChevronDown className="h-4 w-4" />
                  </motion.div>
                </motion.div>
              </Link>
            </motion.div>
          </div>
        </section>

        {/* Added Key Benefits Section */}
        <section className="py-24 bg-gray-950">
          <div className="container mx-auto px-6">
            <motion.div 
              className="text-center mb-16"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-4xl font-light mb-6">Key Benefits</h2>
              <p className="text-lg text-gray-400 max-w-3xl mx-auto">
                See how FieldX transforms your FTTH operations
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <motion.div
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1, duration: 0.6 }}
                whileHover={{ y: -10 }}
              >
                <motion.div 
                  className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center mx-auto mb-4"
                  whileHover={{ scale: 1.1, backgroundColor: "rgba(59, 130, 246, 0.2)" }}
                >
                  <Clock className="w-6 h-6 text-blue-400" />
                </motion.div>
                <h3 className="text-xl font-light mb-2">30% Time Savings</h3>
                <p className="text-gray-400 text-sm">
                  Reduce administrative work and focus on deployment
                </p>
              </motion.div>

              <motion.div
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2, duration: 0.6 }}
                whileHover={{ y: -10 }}
              >
                <motion.div 
                  className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center mx-auto mb-4"
                  whileHover={{ scale: 1.1, backgroundColor: "rgba(59, 130, 246, 0.2)" }}
                >
                  <Zap className="w-6 h-6 text-blue-400" />
                </motion.div>
                <h3 className="text-xl font-light mb-2">40% Faster Billing</h3>
                <p className="text-gray-400 text-sm">
                  Automated documentation speeds up the billing process
                </p>
              </motion.div>

              <motion.div
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3, duration: 0.6 }}
                whileHover={{ y: -10 }}
              >
                <motion.div 
                  className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center mx-auto mb-4"
                  whileHover={{ scale: 1.1, backgroundColor: "rgba(59, 130, 246, 0.2)" }}
                >
                  <motion.div
                    animate={{ 
                      boxShadow: ["0px 0px 0px rgba(59, 130, 246, 0)", "0px 0px 15px rgba(59, 130, 246, 0.3)", "0px 0px 0px rgba(59, 130, 246, 0)"],
                    }}
                    transition={{ repeat: Infinity, duration: 3 }}
                    className="rounded-full"
                  >
                    <Calendar className="w-6 h-6 text-blue-400" />
                  </motion.div>
                </motion.div>
                <h3 className="text-xl font-light mb-2">20% More Jobs</h3>
                <p className="text-gray-400 text-sm">
                  Complete more projects with optimized scheduling
                </p>
              </motion.div>

              <motion.div
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4, duration: 0.6 }}
                whileHover={{ y: -10 }}
              >
                <motion.div 
                  className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center mx-auto mb-4"
                  whileHover={{ scale: 1.1, backgroundColor: "rgba(59, 130, 246, 0.2)" }}
                >
                  <Database className="w-6 h-6 text-blue-400" />
                </motion.div>
                <h3 className="text-xl font-light mb-2">0% Data Loss</h3>
                <p className="text-gray-400 text-sm">
                  Secure, real-time synchronization prevents critical data loss
                </p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Features Section - Centered (Modified to remove optical animation) */}
        <section id="features" className="py-24 bg-black">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="text-center max-w-3xl mx-auto mb-10"
            >
              <h2 className="text-4xl font-light mb-6">Designed for FTTH Excellence</h2>
              <p className="text-lg text-gray-400 mb-8">
                FieldX combines cutting-edge technology with industry-specific tools to streamline your fiber deployment
                projects from planning to completion.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <motion.div 
                className="border-t border-white/20 pt-4 group"
                whileHover={{ y: -10, borderColor: "rgba(96, 165, 250, 0.5)" }}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1, duration: 0.6 }}
              >
                <h3 className="text-xl font-light mb-2 group-hover:text-blue-400 transition-colors text-center">
                  Comprehensive Office Tools
                </h3>
                <p className="text-gray-400 text-sm text-center">
                  All the tools office engineers need to manage projects efficiently from planning to completion.
                </p>
              </motion.div>

              <motion.div 
                className="border-t border-white/20 pt-4 group"
                whileHover={{ y: -10, borderColor: "rgba(96, 165, 250, 0.5)" }}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2, duration: 0.6 }}
              >
                <h3 className="text-xl font-light mb-2 group-hover:text-blue-400 transition-colors text-center">
                  Advanced Analytics
                </h3>
                <p className="text-gray-400 text-sm text-center">
                  Gain insights into project performance, team productivity, and resource allocation.
                </p>
              </motion.div>

              <motion.div 
                className="border-t border-white/20 pt-4 group"
                whileHover={{ y: -10, borderColor: "rgba(96, 165, 250, 0.5)" }}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3, duration: 0.6 }}
              >
                <h3 className="text-xl font-light mb-2 group-hover:text-blue-400 transition-colors text-center">
                  Streamlined Workflows
                </h3>
                <p className="text-gray-400 text-sm text-center">
                  Optimize your processes with customizable workflows designed for FTTH projects.
                </p>
              </motion.div>
            </div>
            
            {/* Added a decorative element to fill the gap left by OpticalFiberAnimation */}
            <motion.div 
              className="relative flex justify-center mt-16"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <div className="w-full max-w-3xl py-12">
                <motion.div 
                  className="border border-blue-500/20 rounded-2xl p-8 bg-blue-500/5 backdrop-blur-sm text-center relative overflow-hidden"
                  whileHover={{ boxShadow: "0px 0px 30px rgba(59, 130, 246, 0.2)" }}
                >
                  <motion.div 
                    className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/10 to-blue-600/10 rounded-2xl blur-md -z-10"
                    animate={{ 
                      opacity: [0.5, 0.8, 0.5],
                    }}
                    transition={{ repeat: Infinity, duration: 3 }}
                  />
                  
                  <motion.h3 
                    className="text-2xl md:text-3xl font-light mb-4 text-blue-50"
                    animate={{ 
                      textShadow: ["0px 0px 0px rgba(59, 130, 246, 0)", "0px 0px 10px rgba(59, 130, 246, 0.5)", "0px 0px 0px rgba(59, 130, 246, 0)"]
                    }}
                    transition={{ repeat: Infinity, duration: 3 }}
                  >
                    Ready to Transform Your FTTH Operations?
                  </motion.h3>
                  
                  <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
                    FieldX provides telecommunications companies with powerful tools to streamline deployment, 
                    reduce administrative overhead, and improve team coordination.
                  </p>
                  
                  <Link href={user ? "/dashboard" : "/apply"}>
                    <motion.button 
                      className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-3 rounded-lg font-medium"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {user ? "Go to Dashboard" : "Start Free Trial"}
                    </motion.button>
                  </Link>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </section>
        
        {/* Pricing Plans Section */}
        <section id="pricing">
          <PricingPlans />
        </section>

        {/* CTA Section */}
        <section className="py-24 bg-black">
          <div className="container mx-auto px-4 text-center">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="max-w-3xl mx-auto"
            >
              <h2 className="text-4xl font-light mb-6">Experience the Future of FTTH Management</h2>
              <p className="text-lg text-gray-400 mb-12">
                Join the leading telecom companies in Greece that are already benefiting from FieldX's powerful platform.
              </p>

              <div className="flex justify-center">
                <Link href={user ? "/dashboard" : "/apply"} className="inline-block">
                  <motion.div 
                    className="relative border-2 border-white/50 rounded-full w-48 h-48 flex flex-col items-center justify-center group hover:border-blue-500 transition-colors duration-300"
                    whileHover={{ scale: 1.05, borderColor: "#3B82F6" }}
                    whileTap={{ scale: 0.95 }}
                    animate={{ 
                      boxShadow: ["0px 0px 0px rgba(59, 130, 246, 0)", "0px 0px 30px rgba(59, 130, 246, 0.3)", "0px 0px 0px rgba(59, 130, 246, 0)"],
                    }}
                    transition={{
                      boxShadow: {
                        repeat: Infinity,
                        duration: 3,
                      },
                    }}
                  >
                    <motion.div className="text-sm uppercase tracking-widest text-center">
                      <div>{user ? "Dashboard" : "Apply"}</div>
                      <div>{user ? "Access" : "Now"}</div>
                    </motion.div>
                    <motion.div
                      animate={{ 
                        y: [0, 5, 0], 
                      }}
                      transition={{ 
                        repeat: Infinity, 
                        duration: 1.5,
                      }}
                      className="absolute bottom-8"
                    >
                      <ChevronDown className="h-4 w-4 text-white/70 group-hover:text-blue-400 transition-colors duration-300" />
                    </motion.div>
                  </motion.div>
                </Link>
              </div>
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
                    <Link href="#" className="hover:text-blue-400 transition-colors">
                      Field Management
                    </Link>
                  </motion.li>
                  <motion.li whileHover={{ y: -2 }} className="flex justify-center">
                    <Link href="#" className="hover:text-blue-400 transition-colors">
                      Office Tools
                    </Link>
                  </motion.li>
                  <motion.li whileHover={{ y: -2 }} className="flex justify-center">
                    <Link href="#" className="hover:text-blue-400 transition-colors">
                      AI Scheduler
                    </Link>
                  </motion.li>
                </ul>
              </div>

              <div className="text-center">
                <h3 className="text-sm uppercase tracking-wider mb-4">Company</h3>
                <ul className="space-y-2 text-gray-400 text-sm">
                  <motion.li whileHover={{ y: -2 }} className="flex justify-center">
                    <Link href="#" className="hover:text-blue-400 transition-colors">
                      About Us
                    </Link>
                  </motion.li>
                  <motion.li whileHover={{ y: -2 }} className="flex justify-center">
                    <Link href="#" className="hover:text-blue-400 transition-colors">
                      Careers
                    </Link>
                  </motion.li>
                  <motion.li whileHover={{ y: -2 }} className="flex justify-center">
                    <Link href="#" className="hover:text-blue-400 transition-colors">
                      Contact
                    </Link>
                  </motion.li>
                </ul>
              </div>

              <div className="text-center">
                <h3 className="text-sm uppercase tracking-wider mb-4">Support</h3>
                <ul className="space-y-2 text-gray-400 text-sm">
                  <motion.li whileHover={{ y: -2 }} className="flex justify-center">
                    <Link href="#" className="hover:text-blue-400 transition-colors">
                      Documentation
                    </Link>
                  </motion.li>
                  <motion.li whileHover={{ y: -2 }} className="flex justify-center">
                    <Link href="#" className="hover:text-blue-400 transition-colors">
                      FAQ
                    </Link>
                  </motion.li>
                  <motion.li whileHover={{ y: -2 }} className="flex justify-center">
                    <Link href="#" className="hover:text-blue-400 transition-colors">
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

            {/* Use client-side only footer to avoid date hydration issues */}
            <FooterWithYear />
          </div>
        </footer>
      </div>
    </PageTransitionWrapper>
  )
}