"use client"

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Check, X } from 'lucide-react'
import { TransitionLink } from './page-transition'
import Link from 'next/link'

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
}

const PricingPlans = () => {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly')
  
  const plans: Plan[] = [
    {
      name: "Basic",
      description: "Ιδανικό για μικρές επιχειρήσεις",
      monthlyPrice: 49,
      yearlyPrice: 490,
      features: [
        { name: "Έως 2 χρήστες", included: true },
        { name: "Βασικά εργαλεία διαχείρισης FTTH", included: true },
        { name: "Απεριόριστα έργα", included: true },
        { name: "Βασικό dashboard", included: true },
        { name: "Email υποστήριξη", included: true },
        { name: "AI προτάσεις", included: false },
        { name: "API πρόσβαση", included: false },
        { name: "Προηγμένα analytics", included: false },
      ],
      cta: "Ξεκινήστε τώρα",
      popular: false,
      color: "blue-400"
    },
    {
      name: "Pro",
      description: "Για επιχειρήσεις σε ανάπτυξη",
      monthlyPrice: 99,
      yearlyPrice: 990,
      features: [
        { name: "Έως 10 χρήστες", included: true },
        { name: "Προηγμένα εργαλεία διαχείρισης", included: true },
        { name: "Απεριόριστα έργα", included: true },
        { name: "Προηγμένο dashboard", included: true },
        { name: "Τηλεφωνική υποστήριξη", included: true },
        { name: "AI προτάσεις", included: true },
        { name: "API πρόσβαση", included: true },
        { name: "Βασικά analytics", included: true },
      ],
      cta: "Επιλέξτε Pro",
      popular: true,
      color: "blue-500"
    },
    {
      name: "Enterprise",
      description: "Για μεγάλες εταιρείες",
      monthlyPrice: 249,
      yearlyPrice: 2490,
      features: [
        { name: "Απεριόριστοι χρήστες", included: true },
        { name: "Πλήρη εργαλεία διαχείρισης", included: true },
        { name: "Απεριόριστα έργα", included: true },
        { name: "Custom dashboard", included: true },
        { name: "Dedicated υποστήριξη 24/7", included: true },
        { name: "AI προτάσεις & αυτοματισμοί", included: true },
        { name: "Advanced API", included: true },
        { name: "Προηγμένα analytics", included: true },
      ],
      cta: "Επικοινωνήστε μαζί μας",
      popular: false,
      color: "blue-600"
    }
  ]
  
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  }
  
  return (
    <section id="pricing" className="py-24 bg-black">
      <div className="container mx-auto px-6">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-4xl font-light mb-4">Επιλέξτε το Πλάνο που Ταιριάζει στις Ανάγκες σας</h2>
          <p className="text-gray-400 max-w-3xl mx-auto mb-8">
            Ευέλικτα πλάνα σχεδιασμένα για να καλύψουν τις ανάγκες κάθε επιχείρησης, από μικρές εταιρείες έως μεγάλους παρόχους τηλεπικοινωνιών.
          </p>
          
          <div className="inline-flex items-center p-1 bg-gray-900 rounded-full mb-8 relative">
            <motion.div
              className="absolute top-1 bottom-1 bg-blue-500 rounded-full"
              initial={false}
              animate={{
                left: billingPeriod === 'monthly' ? '0.25rem' : '50%',
                right: billingPeriod === 'monthly' ? '50%' : '0.25rem',
              }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            />
            <button 
              className={`px-4 py-2 rounded-full text-sm transition-all duration-300 relative z-10 ${
                billingPeriod === 'monthly' ? 'text-white' : 'text-gray-400'
              }`}
              onClick={() => setBillingPeriod('monthly')}
            >
              Μηνιαία Χρέωση
            </button>
            <button 
              className={`px-4 py-2 rounded-full text-sm transition-all duration-300 relative z-10 ${
                billingPeriod === 'yearly' ? 'text-white' : 'text-gray-400'
              }`}
              onClick={() => setBillingPeriod('yearly')}
            >
              Ετήσια Χρέωση <span className="text-xs text-emerald-400 ml-1">-17%</span>
            </button>
          </div>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <motion.div 
              key={plan.name}
              className={`relative rounded-2xl overflow-hidden border ${plan.popular ? 'border-blue-500' : 'border-gray-800'} bg-gray-900/50 backdrop-blur-sm transition-all duration-300`}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              whileHover={{ 
                y: -10,
                boxShadow: plan.popular ? `0 10px 30px -5px rgba(59, 130, 246, 0.5)` : `0 10px 30px -15px rgba(255, 255, 255, 0.1)`
              }}
            >
              {plan.popular && (
                <div className="absolute top-0 left-0 right-0 bg-blue-500 text-white text-xs font-medium py-1 text-center">
                  Δημοφιλές Πλάνο
                </div>
              )}
              
              <div className="p-8">
                <h3 className={`text-2xl font-light mb-2 text-${plan.color}`}>{plan.name}</h3>
                <p className="text-gray-400 text-sm mb-6">{plan.description}</p>
                
                <div className="mb-6">
                  <div className="text-3xl font-light">
                    {billingPeriod === 'monthly' ? (
                      <>
                        <span className="text-white">{plan.monthlyPrice}€</span>
                        <span className="text-gray-500 text-lg"> / μήνα</span>
                      </>
                    ) : (
                      <>
                        <span className="text-white">{plan.yearlyPrice}€</span>
                        <span className="text-gray-500 text-lg"> / έτος</span>
                      </>
                    )}
                  </div>
                </div>
                
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, i) => (
                    <motion.li 
                      key={i} 
                      className="flex items-start"
                      variants={fadeIn}
                      initial="hidden"
                      whileInView="visible"
                      viewport={{ once: true }}
                      transition={{ delay: 0.1 + (i * 0.05) }}
                    >
                      {feature.included ? (
                        <Check className="h-5 w-5 text-emerald-500 mt-0.5 mr-2 flex-shrink-0" />
                      ) : (
                        <X className="h-5 w-5 text-gray-600 mt-0.5 mr-2 flex-shrink-0" />
                      )}
                      <span className={feature.included ? "text-gray-300" : "text-gray-500"}>
                        {feature.name}
                      </span>
                    </motion.li>
                  ))}
                </ul>
                
                <TransitionLink href="/apply" className="block">
                  <motion.button
                    className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-300 ${
                      plan.popular 
                        ? 'bg-blue-500 hover:bg-blue-600 text-white' 
                        : 'bg-gray-800 hover:bg-gray-700 text-white'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {plan.cta}
                  </motion.button>
                </TransitionLink>
              </div>
            </motion.div>
          ))}
        </div>
        
        <motion.div 
          className="mt-16 text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
        >
          {/* Αντικατάσταση του <p> με <div> για να αποφύγουμε το πρόβλημα nesting */}
          <div className="text-gray-400">
            Χρειάζεστε ένα προσαρμοσμένο πλάνο για συγκεκριμένες ανάγκες;{" "}
            {/* Αντικατάσταση του custom TransitionLink με απλό <a> */}
            <a href="/contact" className="text-blue-400 hover:text-blue-300 underline">
              Επικοινωνήστε μαζί μας
            </a>.
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default PricingPlans