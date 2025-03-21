"use client"

import { useState, useEffect, useRef, useMemo } from "react"
import Image from "next/image"
import { ChevronDown } from "lucide-react"
import Link from "next/link"
import { TransitionLink } from "@/components/page-transition"
import MainMenu from "@/components/main-menu"
import { motion, useAnimation, useSpring, useMotionValue, useTransform } from "framer-motion"
import FuturisticLights from "@/components/futuristic-lights"
import OpticalFiberAnimation from "@/components/optical-fiber-animation"
import CookieConsent from "@/components/cookie-consent"
import { PageTransitionWrapper } from "@/components/page-transition"
import PricingPlans from "@/components/pricing-plans";


// Physics-based gravity element component
const GravityElement = () => {
  const constraintsRef = useRef(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const [mounted, setMounted] = useState(false)
  
  // Create spring physics for the rope effect
  const springX = useSpring(x, { stiffness: 300, damping: 20 })
  const springY = useSpring(y, { stiffness: 300, damping: 20 })
  
  // Rope position, attached at the top
  const ropeStartX = useTransform(springX, (latest) => latest * 0.2)
  const ropeStartY = -100
  
  useEffect(() => {
    setMounted(true)
  }, [])
  
  return (
    <motion.div ref={constraintsRef} className="gravity-container">
      {mounted && (
        <>
          <svg className="w-full h-full absolute">
            <motion.line
              x1="50%"
              y1={ropeStartY}
              x2={springX}
              y2={springY}
              stroke="rgba(255, 255, 255, 0.2)"
              strokeWidth="2"
            />
          </svg>
          
          <motion.div 
            className="gravity-element flex items-center justify-center absolute pointer-events-auto cursor-grab"
            style={{ x: springX, y: springY, left: 'calc(50% - 5rem)', top: '50%' }}
            drag
            dragTransition={{ bounceStiffness: 300, bounceDamping: 20 }}
            dragElastic={0.2}
            whileDrag={{ cursor: "grabbing", scale: 1.05 }}
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
                field
              </motion.span>
            </motion.div>
          </motion.div>
          
          {/* Futuristic blinking lights - χρησιμοποιούμε το dedicated component */}
          <FuturisticLights />
        </>
      )}
    </motion.div>
  )
}



export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const controls = useAnimation()

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }

    window.addEventListener("scroll", handleScroll)
    controls.start({ opacity: 1, y: 0 })
    
    return () => window.removeEventListener("scroll", handleScroll)
  }, [controls])

  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  }

  return (
    <PageTransitionWrapper>
      <div className="min-h-screen bg-black text-white overflow-x-hidden">
        <CookieConsent />
        
        {/* Header */}
{/* Header */}
<motion.header
  className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
    scrolled ? "bg-white shadow-md" : "bg-white"
  }`}
  initial={{ y: -100 }}
  animate={{ y: 0 }}
  transition={{ type: "spring", stiffness: 100, damping: 20 }}
>
  <div className="container mx-auto px-4 md:px-6 py-4 flex justify-between items-center header-container">
    <Link href="/" className="z-10">
      <motion.div 
        whileHover={{ scale: 1.05 }}
        transition={{ type: "spring", stiffness: 400, damping: 10 }}
      >
        <Image 
          src="https://i.imgur.com/65Exsnt.png" 
          alt="FieldX Logo" 
          width={120} 
          height={40} 
          className="h-auto" 
          priority
        />
      </motion.div>
    </Link>

    <div className="hidden md:flex items-center space-x-6 lg:space-x-8">
      <motion.div whileHover={{ scale: 1.05 }}>
        <TransitionLink
          href="#"
          className="uppercase text-xs tracking-widest text-gray-800 hover:text-blue-600 transition-colors"
        >
          FieldX World
        </TransitionLink>
      </motion.div>
      
      <div className="flex items-center space-x-4 lg:space-x-6">
        <motion.div whileHover={{ scale: 1.05 }}>
          <TransitionLink href="#solutions" className="uppercase text-xs tracking-widest text-gray-800 hover:text-blue-600 transition-colors">
            Solutions
          </TransitionLink>
        </motion.div>
        <motion.div whileHover={{ scale: 1.05 }}>
          <TransitionLink href="#features" className="uppercase text-xs tracking-widest text-gray-800 hover:text-blue-600 transition-colors">
            Features
          </TransitionLink>
        </motion.div>
        <motion.div whileHover={{ scale: 1.05 }}>
          <TransitionLink href="#modules" className="uppercase text-xs tracking-widest text-gray-800 hover:text-blue-600 transition-colors">
            Modules
          </TransitionLink>
        </motion.div>
        <motion.div whileHover={{ scale: 1.05 }}>
          <TransitionLink href="#integrations" className="uppercase text-xs tracking-widest text-gray-800 hover:text-blue-600 transition-colors">
            Integrations
          </TransitionLink>
        </motion.div>
      </div>
      
      <motion.div className="flex items-center space-x-2" whileHover={{ scale: 1.05 }}>
        <TransitionLink href="#" className="uppercase text-xs tracking-widest text-gray-800 hover:text-blue-600 transition-colors">
          Login / Register
        </TransitionLink>
        <span className="text-xs text-gray-800">( 0 )</span>
      </motion.div>
      <motion.button 
        className="focus:outline-none" 
        aria-label="Search"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5 text-gray-800"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </motion.button>
      <motion.button 
        className="focus:outline-none" 
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

    <div className="md:hidden flex items-center">
      <motion.button 
        className="focus:outline-none" 
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
              y: menuOpen ? 4 : 0 
            }}
          ></motion.div>
          <motion.div 
            className="w-6 h-px bg-gray-800"
            animate={{ 
              rotateZ: menuOpen ? -45 : 0, 
              y: menuOpen ? -4 : 0 
            }}
          ></motion.div>
        </div>
      </motion.button>
    </div>
  </div>
</motion.header>

        {/* Full-screen menu */}
        <MainMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />

        {/* Hero Section */}
        <section className="relative h-screen">
          <div className="absolute inset-0 z-0">
            <motion.div 
              className="absolute inset-0 bg-gradient-to-r from-black to-black/70"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1.5 }}
            ></motion.div>
          </div>

          {/* Gravity Element */}
          <GravityElement />

          <div className="relative hero-content">
            <motion.div 
              className="flex-center-column"
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
                className="hero-title"
                variants={fadeInUp}
                transition={{ duration: 0.8 }}
              >
                A NEW ERA
              </motion.h1>
              
              <motion.p
                className="hero-subtitle"
                variants={fadeInUp}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                The complete FTTH management platform
              </motion.p>
            </motion.div>

            <motion.div 
              className="discover-button-container"
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 1, duration: 0.8 }}
            >
              <Link href="#discover" className="inline-block">
                <motion.div 
                  className="discover-button relative border border-white/30 rounded-full flex flex-col items-center justify-center group hover:border-blue-400 transition-colors duration-300"
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
                    <div>Discover</div>
                    <div>Our Products</div>
                  </motion.div>
                  <motion.div
                    animate={{ 
                      y: [0, 5, 0], 
                    }}
                    transition={{ 
                      repeat: Infinity, 
                      duration: 1.5,
                    }}
                  >
                    <ChevronDown className="absolute bottom-6 h-4 w-4 text-white/70 group-hover:text-blue-400 transition-colors duration-300" />
                  </motion.div>
                </motion.div>
              </Link>
            </motion.div>
          </div>
        </section>

        {/* Discover Section */}
        <section id="discover" className="py-24 bg-black">
          <div className="container-center">
            <motion.div 
              className="max-w-3xl mx-auto text-center mb-16"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="section-title">The Complete FTTH Management Platform</h2>
              <p className="section-subtitle text-gray-400">
                FieldX connects field and office engineers in real-time, optimizing fiber-to-the-home deployments with
                AI-powered tools and automation.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
              <motion.div 
                className="group"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.1 }}
                whileHover={{ y: -10 }}
              >
                <div className="relative overflow-hidden mb-6 aspect-square">
                  <Image
                    src="/images/data-sync.png"
                    alt="Real-time data synchronization"
                    width={600}
                    height={600}
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <motion.div 
                    className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-6"
                    initial={{ opacity: 0 }}
                    whileHover={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <span className="text-sm uppercase tracking-wider">Real-time Sync</span>
                  </motion.div>
                </div>
                <motion.h3 
                  className="text-xl font-light mb-2 text-center md:text-left"
                  whileHover={{ color: "#60A5FA" }}
                >
                  Real-time Data Synchronization
                </motion.h3>
                <p className="text-gray-400 text-sm text-center md:text-left">
                  Seamless communication between field and office teams with instant updates and notifications.
                </p>
              </motion.div>

              <motion.div 
                className="group"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.3 }}
                whileHover={{ y: -10 }}
              >
                <div className="relative overflow-hidden mb-6 aspect-square">
                  <Image
                    src="/images/ai-scheduler.png"
                    alt="AI appointment scheduler"
                    width={600}
                    height={600}
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <motion.div 
                    className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-6"
                    initial={{ opacity: 0 }}
                    whileHover={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <span className="text-sm uppercase tracking-wider">AI Powered</span>
                  </motion.div>
                </div>
                <motion.h3 
                  className="text-xl font-light mb-2 text-center md:text-left"
                  whileHover={{ color: "#60A5FA" }}
                >
                  AI Appointment Scheduler
                </motion.h3>
                <p className="text-gray-400 text-sm text-center md:text-left">
                  Intelligent scheduling for autopsies and constructions, optimizing your team's time and resources.
                </p>
              </motion.div>

              <motion.div 
                className="group"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.5 }}
                whileHover={{ y: -10 }}
              >
                <div className="relative overflow-hidden mb-6 aspect-square">
                  <Image
                    src="/images/automation.png"
                    alt="As-built automation"
                    width={600}
                    height={600}
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <motion.div 
                    className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-6"
                    initial={{ opacity: 0 }}
                    whileHover={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <span className="text-sm uppercase tracking-wider">Automation</span>
                  </motion.div>
                </div>
                <motion.h3 
                  className="text-xl font-light mb-2 text-center md:text-left"
                  whileHover={{ color: "#60A5FA" }}
                >
                  As-Built Automation
                </motion.h3>
                <p className="text-gray-400 text-sm text-center md:text-left">
                  Automatically generate complete documentation packages for billing and supervisor review.
                </p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-24 bg-gray-950">
          <div className="container-center">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 items-center">
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="text-center md:text-left"
              >
                <h2 className="section-title md:text-left">Designed for FTTH Excellence</h2>
                <p className="section-subtitle md:text-left text-gray-400 mb-8">
                  FieldX combines cutting-edge technology with industry-specific tools to streamline your fiber deployment
                  projects from planning to completion.
                </p>

                <div className="space-y-6">
                  <motion.div 
                    className="border-t border-white/20 pt-4 group"
                    whileHover={{ x: 10, borderColor: "rgba(96, 165, 250, 0.5)" }}
                  >
                    <h3 className="text-xl font-light mb-2 group-hover:text-blue-400 transition-colors">
                      Comprehensive Office Tools
                    </h3>
                    <p className="text-gray-400 text-sm">
                      All the tools office engineers need to manage projects efficiently from planning to completion.
                    </p>
                  </motion.div>

                  <motion.div 
                    className="border-t border-white/20 pt-4 group"
                    whileHover={{ x: 10, borderColor: "rgba(96, 165, 250, 0.5)" }}
                  >
                    <h3 className="text-xl font-light mb-2 group-hover:text-blue-400 transition-colors">
                      Advanced Analytics
                    </h3>
                    <p className="text-gray-400 text-sm">
                      Gain insights into project performance, team productivity, and resource allocation.
                    </p>
                  </motion.div>

                  <motion.div 
                    className="border-t border-white/20 pt-4 group"
                    whileHover={{ x: 10, borderColor: "rgba(96, 165, 250, 0.5)" }}
                  >
                    <h3 className="text-xl font-light mb-2 group-hover:text-blue-400 transition-colors">
                      Streamlined Workflows
                    </h3>
                    <p className="text-gray-400 text-sm">
                      Optimize your processes with customizable workflows designed for FTTH projects.
                    </p>
                  </motion.div>
                </div>
              </motion.div>

              <motion.div 
                className="relative flex justify-center"
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
              >
                <motion.div
                  className="h-[500px] md:h-[600px] w-full overflow-hidden rounded-lg shadow-2xl"
                  whileHover={{ scale: 1.03 }}
                  transition={{ type: "spring", stiffness: 300, damping: 15 }}
                >
                  <OpticalFiberAnimation />
                </motion.div>
                <motion.div 
                  className="absolute -inset-4 rounded-lg bg-blue-500/20 -z-10"
                  animate={{ 
                    boxShadow: ["0px 0px 0px rgba(59, 130, 246, 0)", "0px 0px 50px rgba(59, 130, 246, 0.3)", "0px 0px 0px rgba(59, 130, 246, 0)"],
                  }}
                  transition={{
                    boxShadow: {
                      repeat: Infinity,
                      duration: 3,
                    },
                  }}
                ></motion.div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 bg-black">
          <div className="container-center text-center">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="max-w-3xl mx-auto"
            >
              <h2 className="section-title">Experience the Future of FTTH Management</h2>
              <p className="section-subtitle text-gray-400 mb-12">
                Join the leading telecom companies in Greece that are already benefiting from FieldX's powerful platform.
              </p>

              <div className="flex justify-center">
                <TransitionLink href="/apply" className="inline-block">
                  <motion.div 
                    className="relative border border-white/30 rounded-full w-36 h-36 md:w-48 md:h-48 flex flex-col items-center justify-center group hover:border-blue-400 transition-colors duration-300"
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
                      <div>Request</div>
                      <div>A Demo</div>
                    </motion.div>
                    <motion.div
                      animate={{ 
                        y: [0, 5, 0], 
                      }}
                      transition={{ 
                        repeat: Infinity, 
                        duration: 1.5,
                      }}
                    >
                      <ChevronDown className="absolute bottom-8 h-4 w-4 text-white/70 group-hover:text-blue-400 transition-colors duration-300" />
                    </motion.div>
                  </motion.div>
                </TransitionLink>
              </div>
            </motion.div>
          </div>
        </section>
        
        {/* Pricing Plans Section */}
        <PricingPlans />

        {/* Footer */}
        <footer className="py-12 bg-black border-t border-white/10">
          <div className="container-center">
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <div className="text-center md:text-left">
                <motion.div 
                  className="text-2xl font-light tracking-wider mb-6 flex justify-center md:justify-start"
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  <span className="font-extralight">field</span>
                </motion.div>
                <p className="text-gray-400 text-sm">
                  The complete CRM/FSM platform for managing FTTH projects in Greece.
                </p>
              </div>

              <div className="text-center md:text-left">
                <h3 className="text-sm uppercase tracking-wider mb-6">Products</h3>
                <ul className="space-y-3 text-gray-400 text-sm">
                  <motion.li whileHover={{ x: 3 }} className="flex justify-center md:justify-start">
                    <Link href="#" className="hover:text-blue-400 transition-colors">
                      Field Management
                    </Link>
                  </motion.li>
                  <motion.li whileHover={{ x: 3 }} className="flex justify-center md:justify-start">
                    <Link href="#" className="hover:text-blue-400 transition-colors">
                      Office Tools
                    </Link>
                  </motion.li>
                  <motion.li whileHover={{ x: 3 }} className="flex justify-center md:justify-start">
                    <Link href="#" className="hover:text-blue-400 transition-colors">
                      AI Scheduler
                    </Link>
                  </motion.li>
                  <motion.li whileHover={{ x: 3 }} className="flex justify-center md:justify-start">
                    <Link href="#" className="hover:text-blue-400 transition-colors">
                      Documentation
                    </Link>
                  </motion.li>
                </ul>
              </div>

              <div className="text-center md:text-left">
                <h3 className="text-sm uppercase tracking-wider mb-6">Company</h3>
                <ul className="space-y-3 text-gray-400 text-sm">
                  <motion.li whileHover={{ x: 3 }} className="flex justify-center md:justify-start">
                    <Link href="#" className="hover:text-blue-400 transition-colors">
                      About Us
                    </Link>
                  </motion.li>
                  <motion.li whileHover={{ x: 3 }} className="flex justify-center md:justify-start">
                    <Link href="#" className="hover:text-blue-400 transition-colors">
                      Careers
                    </Link>
                  </motion.li>
                  <motion.li whileHover={{ x: 3 }} className="flex justify-center md:justify-start">
                    <Link href="#" className="hover:text-blue-400 transition-colors">
                      Contact
                    </Link>
                  </motion.li>
                  <motion.li whileHover={{ x: 3 }} className="flex justify-center md:justify-start">
                    <Link href="#" className="hover:text-blue-400 transition-colors">
                      Blog
                    </Link>
                  </motion.li>
                </ul>
              </div>

              <div className="text-center md:text-left">
                <h3 className="text-sm uppercase tracking-wider mb-6">Legal</h3>
                <ul className="space-y-3 text-gray-400 text-sm">
                  <motion.li whileHover={{ x: 3 }} className="flex justify-center md:justify-start">
                    <Link href="#" className="hover:text-blue-400 transition-colors">
                      Privacy Policy
                    </Link>
                  </motion.li>
                  <motion.li whileHover={{ x: 3 }} className="flex justify-center md:justify-start">
                    <Link href="#" className="hover:text-blue-400 transition-colors">
                      Terms of Service
                    </Link>
                  </motion.li>
                  <motion.li whileHover={{ x: 3 }} className="flex justify-center md:justify-start">
                    <Link href="#" className="hover:text-blue-400 transition-colors">
                      Cookie Policy
                    </Link>
                  </motion.li>
                </ul>
              </div>
            </motion.div>

            <div className="border-t border-white/10 mt-12 pt-8 text-center text-xs text-gray-500">
              <p>&copy; {new Date().getFullYear()} FieldX. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </div>
    </PageTransitionWrapper>
  )
}