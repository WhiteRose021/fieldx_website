"use client"

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, X, ChevronDown, Zap, Shield, Users, Download, Star, Gift, Lock } from 'lucide-react'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'

interface PlanFeature {
  name: string;
  included: boolean;
}

interface Plan {
  name: string;
  description: string;
  monthlyPrice: number;
  yearlyPrice: number;
  features: PlanFeature[];
  cta: string;
  popular: boolean;
  color: string;
  blurred?: boolean;
}

interface AuthContextType {
  user: {
    email?: string;
  } | null;
  logout: () => void;
}

// Predefined widths for feature bars to avoid Math.random() hydration issues
const featureBarWidths = [85, 78, 92, 81, 88]; 

const PricingPlans = () => {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly')
  const [mounted, setMounted] = useState(false)
  const { user } = useAuth() as AuthContextType;
  
  useEffect(() => {
    setMounted(true)
  }, [])
  
  const plans: Plan[] = [
    {
      name: "Basic",
      description: "Ideal for small businesses",
      monthlyPrice: 49,
      yearlyPrice: 490,
      features: [
        { name: "Up to 2 users", included: true },
        { name: "Basic FTTH management tools", included: true },
        { name: "Unlimited projects", included: true },
        { name: "Basic dashboard", included: true },
        { name: "Email support", included: true },
        { name: "AI recommendations", included: false },
        { name: "API access", included: false },
        { name: "Advanced analytics", included: false },
      ],
      cta: "Get Started",
      popular: false,
      color: "blue-400",
      blurred: true
    },
    {
      name: "Freemium",
      description: "For growing businesses",
      monthlyPrice: 400,
      yearlyPrice: 4000,
      features: [
        { name: "Up to 10 users", included: true },
        { name: "Advanced management tools", included: true },
        { name: "Unlimited projects", included: true },
        { name: "Advanced dashboard", included: true },
        { name: "Phone support", included: true },
        { name: "AI recommendations", included: true },
        { name: "API access", included: true },
        { name: "Basic analytics", included: true },
      ],
      cta: "Choose Freemium",
      popular: true,
      color: "blue-500"
    },
    {
      name: "Enterprise",
      description: "For large companies",
      monthlyPrice: 249,
      yearlyPrice: 2490,
      features: [
        { name: "Unlimited users", included: true },
        { name: "Complete management tools", included: true },
        { name: "Unlimited projects", included: true },
        { name: "Custom dashboard", included: true },
        { name: "Dedicated 24/7 support", included: true },
        { name: "AI recommendations & automation", included: true },
        { name: "Advanced API", included: true },
        { name: "Advanced analytics", included: true },
      ],
      cta: "Contact Us",
      popular: false,
      color: "blue-600",
      blurred: true
    }
  ]
  
  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  }

  const pulseGlow = {
    pulse: {
      boxShadow: [
        "0px 0px 0px rgba(59, 130, 246, 0)",
        "0px 0px 25px rgba(59, 130, 246, 0.5)",
        "0px 0px 0px rgba(59, 130, 246, 0)"
      ],
      transition: {
        repeat: Infinity,
        duration: 3,
      }
    }
  }

  // Client-side only star field component to avoid hydration issues
  const StarField = () => {
    // Only generate stars on the client side
    if (!mounted) return null;
    
    // Use a deterministic approach for the star positions to avoid hydration issues
    return (
      <div className="absolute inset-0 overflow-hidden">
        {Array.from({ length: 100 }).map((_, i) => {
          // Derive positions from index for deterministic rendering
          const topPosition = ((i * 7) % 100);
          const leftPosition = ((i * 13) % 100);
          const scale = 0.5 + ((i % 3) * 0.5);
          const duration = 3 + (i % 5);
          const delay = (i % 10) * 0.5;
          
          return (
            <motion.div
              key={i}
              className="absolute h-0.5 w-0.5 rounded-full bg-blue-100"
              style={{
                top: `${topPosition}%`,
                left: `${leftPosition}%`,
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
          );
        })}
      </div>
    );
  };
  
  return (
    <section id="pricing" className="py-24 bg-black relative overflow-hidden">
      {/* Background gradient effect */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-950 to-black opacity-80"></div>
      
      {/* Star field - only renders on client side */}
      <StarField />

      <div className="container mx-auto px-6 relative z-10">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-4xl md:text-5xl font-light mb-6 tracking-wide">
            Freemium <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600">Plan</span>
          </h2>
          <p className="text-lg text-gray-400 max-w-3xl mx-auto mb-6">
            Flexible freemium plan designed to meet the needs of every business, from small companies to large telecommunications providers.
          </p>
          
          <motion.div 
            className="inline-flex items-center p-1.5 bg-gray-900/50 rounded-full mb-6 relative backdrop-blur-sm border border-gray-800/50"
            whileHover={{ scale: 1.02, boxShadow: "0px 0px 20px rgba(59, 130, 246, 0.2)" }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <motion.div
              className="absolute top-1.5 bottom-1.5 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full"
              initial={false}
              animate={{
                left: billingPeriod === 'monthly' ? '0.375rem' : '50%',
                right: billingPeriod === 'monthly' ? '50%' : '0.375rem',
              }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            />
            <motion.button 
              className={`px-6 py-2.5 rounded-full text-sm uppercase tracking-wider transition-all duration-300 relative z-10 ${
                billingPeriod === 'monthly' ? 'text-white font-medium' : 'text-gray-400'
              }`}
              onClick={() => setBillingPeriod('monthly')}
              whileTap={{ scale: 0.95 }}
            >
              Monthly Billing
            </motion.button>
            <motion.button 
              className={`px-6 py-2.5 rounded-full text-sm uppercase tracking-wider transition-all duration-300 relative z-10 ${
                billingPeriod === 'yearly' ? 'text-white font-medium' : 'text-gray-400'
              }`}
              onClick={() => setBillingPeriod('yearly')}
              whileTap={{ scale: 0.95 }}
            >
              Annual Billing <span className="text-xs bg-emerald-500/20 text-emerald-400 ml-1 px-1.5 py-0.5 rounded-full">-17%</span>
            </motion.button>
          </motion.div>

          {/* Demo promotion banner */}
          <motion.div 
            className="bg-gradient-to-r from-blue-600/30 to-blue-400/30 p-4 rounded-xl backdrop-blur-sm border border-blue-500/30 max-w-xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            whileHover={{ scale: 1.02, boxShadow: "0px 0px 20px rgba(59, 130, 246, 0.3)" }}
          >
            <div className="flex items-center justify-center space-x-3">
              <Gift className="h-5 w-5 text-blue-300" />
              <p className="text-blue-100 font-medium">Gain 28 days of freemium access. This is a demo.</p>
            </div>
          </motion.div>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div 
              key={plan.name}
              className={`relative rounded-2xl overflow-hidden ${
                plan.popular ? 'border-2 border-blue-500/50 z-20' : 'border border-gray-800/50'
              } bg-gray-900/40 backdrop-blur-sm transition-all duration-300 ${
                plan.blurred ? 'opacity-30 blur-lg select-none' : 'z-10'
              }`}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: plan.blurred ? 0.4 : 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              whileHover={plan.blurred ? {} : { 
                y: -10,
                boxShadow: plan.popular 
                  ? `0 10px 40px -5px rgba(59, 130, 246, 0.5)` 
                  : `0 10px 30px -15px rgba(255, 255, 255, 0.1)`
              }}
              variants={plan.popular ? pulseGlow : {}}
              animate={plan.popular ? "pulse" : ""}
            >
              {plan.popular && (
                <motion.div 
                  className="absolute top-0 left-0 right-0 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xs font-medium py-2 text-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <div className="flex items-center justify-center">
                    <Star className="w-3.5 h-3.5 mr-1.5 fill-current" />
                    Freemium Plan
                    <Star className="w-3.5 h-3.5 ml-1.5 fill-current" />
                  </div>
                </motion.div>
              )}
              
              <div className={`p-8 ${plan.popular ? 'pt-12' : ''}`}>
                <motion.div 
                  className="flex items-center justify-between mb-3"
                  variants={fadeInUp}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                >
                  <h3 className={`text-2xl font-light text-${plan.color}`}>
                    {plan.name}
                  </h3>
                  {plan.popular && (
                    <motion.div
                      animate={{ 
                        scale: [1, 1.05, 1],
                        opacity: [0.8, 1, 0.8]
                      }}
                      transition={{ 
                        repeat: Infinity, 
                        duration: 2,
                      }}
                      className="bg-blue-500/20 rounded-full px-2 py-0.5 text-xs text-blue-300"
                    >
                      Recommended
                    </motion.div>
                  )}
                </motion.div>
                
                <motion.p 
                  className="text-gray-400 text-sm mb-8"
                  variants={fadeInUp}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 }}
                >
                  {plan.description}
                </motion.p>
                
                <motion.div 
                  className="mb-8"
                  variants={fadeInUp}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 }}
                >
                  <AnimatePresence mode="wait">
                    {!plan.blurred && (
                      <motion.div 
                        key={billingPeriod}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.3 }}
                        className="flex flex-col items-center"
                      >
                        {/* Blurred price section for the middle plan only */}
                        {plan.popular ? (
                          <motion.div
                            className="relative h-20 w-40 flex items-center justify-center"
                            whileHover={{ scale: 1.05 }}
                          >
                            <div className="absolute inset-0 bg-blue-500/10 backdrop-blur-md rounded-lg border border-blue-500/30 filter blur-sm"></div>
                            <div className="relative z-10 flex flex-col items-center">
                              <div className="flex items-center justify-center mb-1">
                                <Lock className="w-5 h-5 text-blue-400 mr-2" />
                                <span className="text-white font-medium"></span>
                              </div>
                              <span className="text-xs text-blue-300"></span>
                            </div>
                          </motion.div>
                        ) : (
                          <motion.div 
                            className="text-4xl font-light flex items-baseline"
                            animate={plan.popular ? {
                              textShadow: [
                                "0px 0px 0px rgba(255, 255, 255, 0)",
                                "0px 0px 10px rgba(59, 130, 246, 0.5)",
                                "0px 0px 0px rgba(255, 255, 255, 0)"
                              ]
                            } : {}}
                            transition={{ repeat: Infinity, duration: 2 }}
                          >
                            <span className="text-2xl mr-0.5">$</span>
                            <span className="text-white">{billingPeriod === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice}</span>
                            <span className="text-gray-500 text-lg ml-1">
                              {billingPeriod === 'monthly' ? '/ month' : '/ year'}
                            </span>
                          </motion.div>
                        )}

                        {billingPeriod === 'yearly' && !plan.popular && (
                          <motion.div 
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-xs text-emerald-400 mt-2"
                          >
                            Save ${plan.monthlyPrice * 12 - plan.yearlyPrice} per year
                          </motion.div>
                        )}
                      </motion.div>
                    )}
                    {plan.blurred && (
                      <motion.div className="h-20 w-32 bg-gray-800/30 rounded-lg mx-auto"></motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
                
                {/* Feature highlights with icon row */}
                <motion.div 
                  className="flex justify-center gap-8 mb-8"
                  variants={fadeInUp}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  transition={{ delay: 0.25 }}
                >
                  <motion.div 
                    className="text-center"
                    whileHover={plan.blurred ? {} : { y: -5, scale: 1.1 }}
                  >
                    <motion.div 
                      className={`w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center mx-auto mb-2 ${plan.popular ? 'border border-blue-500/30' : ''}`}
                      animate={{ 
                        boxShadow: plan.popular ? 
                          ["0px 0px 0px rgba(59, 130, 246, 0)", "0px 0px 15px rgba(59, 130, 246, 0.3)", "0px 0px 0px rgba(59, 130, 246, 0)"] :
                          "none"
                      }}
                      transition={{ repeat: Infinity, duration: 3 }}
                    >
                      <Users className="w-5 h-5 text-blue-400" />
                    </motion.div>
                    <span className="text-xs text-gray-400">{plan.name === "Basic" ? "2" : plan.name === "Freemium" ? "10" : "∞"}</span>
                  </motion.div>
                  
                  <motion.div 
                    className="text-center"
                    whileHover={plan.blurred ? {} : { y: -5, scale: 1.1 }}
                  >
                    <motion.div 
                      className={`w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center mx-auto mb-2 ${plan.popular ? 'border border-blue-500/30' : ''}`}
                      animate={{ 
                        boxShadow: plan.popular ? 
                          ["0px 0px 0px rgba(59, 130, 246, 0)", "0px 0px 15px rgba(59, 130, 246, 0.3)", "0px 0px 0px rgba(59, 130, 246, 0)"] :
                          "none"
                      }}
                      transition={{ repeat: Infinity, duration: 3, delay: 0.5 }}
                    >
                      <Zap className="w-5 h-5 text-blue-400" />
                    </motion.div>
                    <span className="text-xs text-gray-400">{plan.name === "Basic" ? "Basic" : plan.name === "Freemium" ? "Fast" : "Ultra"}</span>
                  </motion.div>
                  
                  <motion.div 
                    className="text-center"
                    whileHover={plan.blurred ? {} : { y: -5, scale: 1.1 }}
                  >
                    <motion.div 
                      className={`w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center mx-auto mb-2 ${plan.popular ? 'border border-blue-500/30' : ''}`}
                      animate={{ 
                        boxShadow: plan.popular ? 
                          ["0px 0px 0px rgba(59, 130, 246, 0)", "0px 0px 15px rgba(59, 130, 246, 0.3)", "0px 0px 0px rgba(59, 130, 246, 0)"] :
                          "none"
                      }}
                      transition={{ repeat: Infinity, duration: 3, delay: 1 }}
                    >
                      <Shield className="w-5 h-5 text-blue-400" />
                    </motion.div>
                    <span className="text-xs text-gray-400">{plan.name === "Basic" ? "Email" : plan.name === "Freemium" ? "Phone" : "24/7"}</span>
                  </motion.div>
                </motion.div>

                {/* Feature list */}
                <div className="space-y-3 mb-8">
                  {!plan.blurred && plan.features.map((feature, i) => (
                    <motion.div 
                      key={i} 
                      className="flex items-start group"
                      variants={fadeInUp}
                      initial="hidden"
                      whileInView="visible"
                      viewport={{ once: true }}
                      transition={{ delay: 0.3 + (i * 0.05) }}
                      whileHover={{ x: 3 }}
                    >
                      <div className={`flex-shrink-0 w-5 h-5 mr-3 mt-0.5 rounded-full flex items-center justify-center ${
                        feature.included 
                          ? 'bg-emerald-500/20 text-emerald-500' 
                          : 'bg-gray-800/50 text-gray-600'
                      }`}>
                        {feature.included ? (
                          <Check className="h-3 w-3" />
                        ) : (
                          <X className="h-3 w-3" />
                        )}
                      </div>
                      <span className={`${feature.included ? 'text-gray-300' : 'text-gray-500'} group-hover:text-white transition-colors duration-200`}>
                        {feature.name}
                      </span>
                    </motion.div>
                  ))}
                  {plan.blurred && (
                    <div className="space-y-3">
                      {featureBarWidths.map((width, i) => (
                        <motion.div 
                          key={i}
                          className="h-5 bg-gray-800/30 rounded-md" 
                          style={{width: `${width}%`}}
                        />
                      ))}
                    </div>
                  )}
                </div>
                
                {/* CTA Button */}
                {!plan.blurred && (
                  <Link href={user ? "/dashboard" : "/apply"}>
                    <motion.div 
                      className={`w-full py-3.5 px-6 rounded-lg font-medium transition-all duration-300 flex items-center justify-center ${
                        plan.popular 
                          ? 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white' 
                          : 'bg-gray-800 hover:bg-gray-700 text-white border border-gray-700/50'
                      }`}
                      whileHover={{ 
                        scale: 1.03,
                        boxShadow: plan.popular ? "0px 5px 15px rgba(59, 130, 246, 0.4)" : "none"
                      }}
                      whileTap={{ scale: 0.97 }}
                      transition={{ type: "spring", stiffness: 400, damping: 10 }}
                    >
                      <span>Choose Freemium</span>
                      <motion.div
                        animate={{ 
                          y: [0, 3, 0], 
                          opacity: [0.7, 1, 0.7] 
                        }}
                        transition={{ 
                          repeat: Infinity, 
                          duration: 1.5, 
                          ease: "easeInOut" 
                        }}
                        className="ml-2"
                      >
                        <Download className="h-4 w-4 text-white/70" />
                      </motion.div>
                    </motion.div>
                  </Link>
                )}
                
                {/* Freemium plan badges */}
                {plan.popular && (
                  <motion.div 
                    className="mt-4 flex flex-col items-center space-y-2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                  >
                    <span className="bg-gradient-to-r from-emerald-500/10 to-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full border border-emerald-500/20 text-xs">
                      28-Day Freemium Access
                    </span>
                    <span className="bg-gradient-to-r from-blue-500/10 to-blue-500/20 text-blue-400 px-3 py-1 rounded-full border border-blue-500/20 text-xs">
                      Demo Version
                    </span>
                  </motion.div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default PricingPlans