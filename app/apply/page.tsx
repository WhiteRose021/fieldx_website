"use client"

import { useState, useEffect, FormEvent, ChangeEvent } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { Check, CheckCircle2, ArrowLeft, ArrowRight, Send, Building, User, Mail, Phone, FileText } from "lucide-react"
import { useRouter } from "next/navigation"
import FuturisticLights from "@/components/futuristic-lights"
import { PageTransitionWrapper } from "@/components/page-transition"

// Define the shape of a pricing plan
interface PricingPlan {
  id: string;
  name: string;
  description: string;
  monthlyPrice: number;
  yearlyPrice: number;
  color: string;
  popular?: boolean;
  features: string[];
}

const pricingPlans: PricingPlan[] = [
  {
    id: "basic",
    name: "Basic",
    description: "Ιδανικό για μικρές επιχειρήσεις",
    monthlyPrice: 49,
    yearlyPrice: 490,
    color: "blue-400",
    features: [
      "Έως 2 χρήστες",
      "Βασικά εργαλεία διαχείρισης FTTH",
      "Απεριόριστα έργα",
      "Βασικό dashboard",
      "Email υποστήριξη"
    ]
  },
  {
    id: "pro",
    name: "Pro",
    description: "Για επιχειρήσεις σε ανάπτυξη",
    monthlyPrice: 99,
    yearlyPrice: 990,
    color: "blue-500",
    popular: true,
    features: [
      "Έως 10 χρήστες",
      "Προηγμένα εργαλεία διαχείρισης",
      "Απεριόριστα έργα",
      "Προηγμένο dashboard",
      "Τηλεφωνική υποστήριξη",
      "AI προτάσεις",
      "API πρόσβαση",
      "Βασικά analytics"
    ]
  },
  {
    id: "enterprise",
    name: "Enterprise",
    description: "Για μεγάλες εταιρείες",
    monthlyPrice: 249,
    yearlyPrice: 2490,
    color: "blue-600",
    features: [
      "Απεριόριστοι χρήστες",
      "Πλήρη εργαλεία διαχείρισης",
      "Απεριόριστα έργα",
      "Custom dashboard",
      "Dedicated υποστήριξη 24/7",
      "AI προτάσεις & αυτοματισμοί",
      "Advanced API",
      "Προηγμένα analytics"
    ]
  }
]

// Define the shape of formData
interface FormData {
  fullName: string;
  companyName: string;
  email: string;
  phone: string;
  description: string;
  selectedPlan: string;
  billingCycle: "monthly" | "yearly";
}

export default function ApplyPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState<FormData>({
    fullName: "",
    companyName: "",
    email: "",
    phone: "",
    description: "",
    selectedPlan: "pro",
    billingCycle: "monthly"
  })
  const [errors, setErrors] = useState<Partial<FormData>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  // Validate form
  const validateForm = () => {
    const newErrors: Partial<FormData> = {}
    
    if (step === 1) {
      if (!formData.fullName.trim()) newErrors.fullName = "Το όνομα είναι υποχρεωτικό"
      if (!formData.companyName.trim()) newErrors.companyName = "Το όνομα εταιρείας είναι υποχρεωτικό"
      if (!formData.email.trim()) {
        newErrors.email = "Το email είναι υποχρεωτικό"
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = "Εισάγετε ένα έγκυρο email"
      }
      if (!formData.phone.trim()) {
        newErrors.phone = "Ο αριθμός τηλεφώνου είναι υποχρεωτικός"
      } else if (!/^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/.test(formData.phone)) {
        newErrors.phone = "Εισάγετε έναν έγκυρο αριθμό τηλεφώνου"
      }
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Handle form input change
  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }))
  }

  // Handle plan selection
  const handlePlanSelect = (planId: string) => {
    setFormData((prev) => ({
      ...prev,
      selectedPlan: planId
    }))
  }

  // Handle billing cycle change
  const handleBillingCycleChange = (cycle: "monthly" | "yearly") => {
    setFormData((prev) => ({
      ...prev,
      billingCycle: cycle
    }))
  }

  // Handle form submission (we'll update this in Step 2)
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    if (validateForm()) {
      setIsSubmitting(true)
      
      // Simulate API call with timeout (to be replaced with email sending)
      setTimeout(() => {
        setIsSubmitting(false)
        setSuccess(true)
        
        // Redirect to homepage after 3 seconds
        setTimeout(() => {
          router.push('/')
        }, 3000)
      }, 1500)
    }
  }

  // Handle next step
  const handleNextStep = () => {
    if (validateForm()) {
      setStep(2)
      window.scrollTo(0, 0)
    }
  }

  // Handle previous step
  const handlePrevStep = () => {
    setStep(1)
    window.scrollTo(0, 0)
  }

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const selectedPlan = pricingPlans.find(plan => plan.id === formData.selectedPlan) || pricingPlans[0] // Fallback to first plan if undefined

  // Rest of the JSX remains the same
  return (
    <PageTransitionWrapper>
      <div className="min-h-screen bg-black text-white overflow-x-hidden">
        {/* Header */}
        <motion.header
          className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-t border-white ${
            scrolled ? "bg-black/90 backdrop-blur-sm" : "bg-transparent"
          }`}
          initial={{ y: -100 }}
          animate={{ y: 0 }}
          transition={{ type: "spring", stiffness: 100, damping: 20 }}
        >
          <div className="container mx-auto px-6 py-4 flex justify-between items-center">
            <Link href="/" className="z-10">
              <motion.div 
                className="text-2xl font-light tracking-wider"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <span className="font-extralight">field</span>
              </motion.div>
            </Link>

            <Link href="/" className="inline-block">
              <motion.button
                className="group flex items-center text-sm text-gray-300 hover:text-white"
                whileHover={{ x: -5 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
              >
                <ArrowLeft className="mr-2 h-4 w-4 group-hover:mr-3 transition-all" />
                Επιστροφή
              </motion.button>
            </Link>
          </div>
        </motion.header>

        {/* Main content */}
        <main className="pt-32 pb-24 relative">
          {/* Background elements */}
          <div className="absolute inset-0 -z-10 opacity-25">
            <FuturisticLights />
          </div>
          <div className="absolute inset-0 -z-20">
            <div className="w-full h-full bg-gradient-to-b from-blue-950/20 to-black/50"></div>
          </div>

          <div className="container mx-auto px-6 max-w-5xl">
            {/* Page title */}
            <motion.div 
              className="text-center mb-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-4xl md:text-5xl font-light mb-4">Ξεκινήστε με το FieldX</h1>
              <p className="text-gray-400 max-w-2xl mx-auto">
                Συμπληρώστε τα στοιχεία σας και επιλέξτε το κατάλληλο πακέτο για τις ανάγκες σας για να ξεκινήσετε μια δωρεάν δοκιμή 14 ημερών.
              </p>
            </motion.div>

            {/* Progress bar */}
            <div className="mb-12">
              <div className="relative pt-1">
                <div className="flex mb-2 items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-blue-500 bg-blue-200/10">
                      Βήμα {step} από 2
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-semibold inline-block text-blue-500">
                      {step === 1 ? "50%" : "100%"}
                    </span>
                  </div>
                </div>
                <div className="overflow-hidden h-2 mb-4 text-xs flex rounded-full bg-blue-200/10">
                  <motion.div
                    className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-gradient-to-r from-blue-500 to-blue-400"
                    initial={{ width: step === 1 ? "0%" : "50%" }}
                    animate={{ width: step === 1 ? "50%" : "100%" }}
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                  ></motion.div>
                </div>
              </div>
            </div>

            {/* Form container with card effect */}
            <div className="relative">
              <motion.div 
                className="absolute inset-0 -z-10 bg-gradient-to-r from-blue-900/20 to-purple-900/20 rounded-2xl blur-xl"
                animate={{ 
                  boxShadow: [
                    "0 0 20px rgba(30, 64, 175, 0.3)", 
                    "0 0 40px rgba(30, 64, 175, 0.2)", 
                    "0 0 20px rgba(30, 64, 175, 0.3)"
                  ]
                }}
                transition={{ duration: 3, repeat: Infinity }}
              ></motion.div>

              <div className="bg-gray-900/70 border border-gray-800 backdrop-blur-md rounded-2xl p-8 md:p-12">
                {success ? (
                  <motion.div 
                    className="text-center py-16"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                  >
                    <motion.div 
                      className="inline-flex items-center justify-center mb-8"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.2, type: "spring" }}
                    >
                      <CheckCircle2 className="w-20 h-20 text-green-500" />
                    </motion.div>
                    <h2 className="text-3xl font-light mb-4">Η αίτησή σας υποβλήθηκε με επιτυχία!</h2>
                    <p className="text-gray-300 mb-8">
                      Ευχαριστούμε για το ενδιαφέρον σας. Η ομάδα μας θα επικοινωνήσει μαζί σας εντός 24 ωρών.
                    </p>
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5 }}
                    >
                      <p className="text-sm text-gray-400">Ανακατεύθυνση στην αρχική σελίδα σε λίγα δευτερόλεπτα...</p>
                    </motion.div>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit}>
                    <AnimatePresence mode="wait">
                      {step === 1 ? (
                        <motion.div
                          key="step1"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          transition={{ duration: 0.3 }}
                          className="space-y-6"
                        >
                          <h2 className="text-2xl font-light mb-6">Τα στοιχεία σας</h2>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                              <label htmlFor="fullName" className="block text-sm font-medium text-gray-300">
                                Ονοματεπώνυμο
                              </label>
                              <div className="relative rounded-md">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                  <User className="h-5 w-5 text-gray-500" />
                                </div>
                                <input
                                  type="text"
                                  name="fullName"
                                  id="fullName"
                                  value={formData.fullName}
                                  onChange={handleChange}
                                  className={`bg-gray-800/50 border ${
                                    errors.fullName ? "border-red-500" : "border-gray-700"
                                  } focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 pr-12 py-3 rounded-md text-gray-100 placeholder-gray-500`}
                                  placeholder="John Doe"
                                />
                                <AnimatePresence>
                                  {errors.fullName && (
                                    <motion.p
                                      initial={{ opacity: 0, y: -10 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      exit={{ opacity: 0, y: -10 }}
                                      className="mt-2 text-sm text-red-500"
                                    >
                                      {errors.fullName}
                                    </motion.p>
                                  )}
                                </AnimatePresence>
                              </div>
                            </div>

                            <div className="space-y-2">
                              <label htmlFor="companyName" className="block text-sm font-medium text-gray-300">
                                Επωνυμία Εταιρείας
                              </label>
                              <div className="relative rounded-md">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                  <Building className="h-5 w-5 text-gray-500" />
                                </div>
                                <input
                                  type="text"
                                  name="companyName"
                                  id="companyName"
                                  value={formData.companyName}
                                  onChange={handleChange}
                                  className={`bg-gray-800/50 border ${
                                    errors.companyName ? "border-red-500" : "border-gray-700"
                                  } focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 pr-12 py-3 rounded-md text-gray-100 placeholder-gray-500`}
                                  placeholder="Acme Inc."
                                />
                                <AnimatePresence>
                                  {errors.companyName && (
                                    <motion.p
                                      initial={{ opacity: 0, y: -10 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      exit={{ opacity: 0, y: -10 }}
                                      className="mt-2 text-sm text-red-500"
                                    >
                                      {errors.companyName}
                                    </motion.p>
                                  )}
                                </AnimatePresence>
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                              <label htmlFor="email" className="block text-sm font-medium text-gray-300">
                                Email
                              </label>
                              <div className="relative rounded-md">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                  <Mail className="h-5 w-5 text-gray-500" />
                                </div>
                                <input
                                  type="email"
                                  name="email"
                                  id="email"
                                  value={formData.email}
                                  onChange={handleChange}
                                  className={`bg-gray-800/50 border ${
                                    errors.email ? "border-red-500" : "border-gray-700"
                                  } focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 pr-12 py-3 rounded-md text-gray-100 placeholder-gray-500`}
                                  placeholder="example@company.com"
                                />
                                <AnimatePresence>
                                  {errors.email && (
                                    <motion.p
                                      initial={{ opacity: 0, y: -10 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      exit={{ opacity: 0, y: -10 }}
                                      className="mt-2 text-sm text-red-500"
                                    >
                                      {errors.email}
                                    </motion.p>
                                  )}
                                </AnimatePresence>
                              </div>
                            </div>

                            <div className="space-y-2">
                              <label htmlFor="phone" className="block text-sm font-medium text-gray-300">
                                Τηλέφωνο
                              </label>
                              <div className="relative rounded-md">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                  <Phone className="h-5 w-5 text-gray-500" />
                                </div>
                                <input
                                  type="tel"
                                  name="phone"
                                  id="phone"
                                  value={formData.phone}
                                  onChange={handleChange}
                                  className={`bg-gray-800/50 border ${
                                    errors.phone ? "border-red-500" : "border-gray-700"
                                  } focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 pr-12 py-3 rounded-md text-gray-100 placeholder-gray-500`}
                                  placeholder="+30 123 456 7890"
                                />
                                <AnimatePresence>
                                  {errors.phone && (
                                    <motion.p
                                      initial={{ opacity: 0, y: -10 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      exit={{ opacity: 0, y: -10 }}
                                      className="mt-2 text-sm text-red-500"
                                    >
                                      {errors.phone}
                                    </motion.p>
                                  )}
                                </AnimatePresence>
                              </div>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <label htmlFor="description" className="block text-sm font-medium text-gray-300">
                              Περιγραφή Αναγκών
                            </label>
                            <div className="relative rounded-md">
                              <div className="absolute top-3 left-3 flex items-start pointer-events-none">
                                <FileText className="h-5 w-5 text-gray-500" />
                              </div>
                              <textarea
                                name="description"
                                id="description"
                                rows={5}
                                value={formData.description}
                                onChange={handleChange}
                                className="bg-gray-800/50 border border-gray-700 focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 pr-12 py-3 rounded-md text-gray-100 placeholder-gray-500"
                                placeholder="Περιγράψτε τις ανάγκες της επιχείρησής σας..."
                              />
                            </div>
                          </div>

                          <div className="flex justify-end pt-4">
                            <motion.button
                              type="button"
                              onClick={handleNextStep}
                              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                            >
                              Επόμενο
                              <ArrowRight className="ml-2 -mr-1 h-5 w-5" />
                            </motion.button>
                          </div>
                        </motion.div>
                      ) : (
                        <motion.div
                          key="step2"
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          transition={{ duration: 0.3 }}
                        >
                          <h2 className="text-2xl font-light mb-6">Επιλέξτε πακέτο</h2>

                          {/* Billing toggle */}
                          <div className="flex justify-center mb-8">
                            <div className="relative flex items-center p-1 bg-gray-800 rounded-full">
                              <button
                                type="button"
                                onClick={() => handleBillingCycleChange("monthly")}
                                className={`relative px-4 py-2 text-sm font-medium rounded-full transition-all ${
                                  formData.billingCycle === "monthly" 
                                    ? "text-white" 
                                    : "text-gray-400 hover:text-gray-300"
                                }`}
                              >
                                Μηνιαία Χρέωση
                                {formData.billingCycle === "monthly" && (
                                  <motion.div
                                    className="absolute inset-0 bg-blue-600 rounded-full -z-10"
                                    layoutId="billingSelection"
                                    transition={{ type: "spring", duration: 0.5 }}
                                  />
                                )}
                              </button>
                              <button
                                type="button"
                                onClick={() => handleBillingCycleChange("yearly")}
                                className={`relative px-4 py-2 text-sm font-medium rounded-full transition-all ${
                                  formData.billingCycle === "yearly" 
                                    ? "text-white" 
                                    : "text-gray-400 hover:text-gray-300"
                                }`}
                              >
                                Ετήσια Χρέωση
                                <span className="ml-1 text-xs text-emerald-400">-17%</span>
                                {formData.billingCycle === "yearly" && (
                                  <motion.div
                                    className="absolute inset-0 bg-blue-600 rounded-full -z-10"
                                    layoutId="billingSelection"
                                    transition={{ type: "spring", duration: 0.5 }}
                                  />
                                )}
                              </button>
                            </div>
                          </div>

                          {/* Pricing Plans */}
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                            {pricingPlans.map((plan) => (
                              <motion.div
                                key={plan.id}
                                className={`relative rounded-xl overflow-hidden ${
                                  formData.selectedPlan === plan.id 
                                    ? "ring-2 ring-blue-500" 
                                    : "border border-gray-700"
                                } bg-gray-800/60 transition-all duration-300 h-full`}
                                whileHover={{ y: -5 }}
                                onClick={() => handlePlanSelect(plan.id)}
                              >
                                {plan.popular && (
                                  <div className="absolute top-0 left-0 right-0 bg-blue-500 text-xs font-medium py-1 text-center">
                                    Δημοφιλές Πλάνο
                                  </div>
                                )}
                                
                                <div className={`absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center ${
                                  formData.selectedPlan === plan.id 
                                    ? "bg-blue-500 text-white" 
                                    : "bg-gray-700 text-gray-400"
                                }`}>
                                  {formData.selectedPlan === plan.id && <Check className="w-4 h-4" />}
                                </div>
                                
                                <div className="p-6">
                                  <h3 className={`text-xl font-light mb-2 text-${plan.color}`}>{plan.name}</h3>
                                  <p className="text-gray-400 text-sm mb-4">{plan.description}</p>
                                  
                                  <div className="mb-6">
                                    <div className="text-3xl font-light">
                                      {formData.billingCycle === "monthly" ? (
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
                                  
                                  <ul className="space-y-2 mb-4">
                                    {plan.features.map((feature, index) => (
                                      <li key={index} className="flex items-start text-sm">
                                        <Check className="h-4 w-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                                        <span className="text-gray-300">{feature}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              </motion.div>
                            ))}
                          </div>

                          <div className="bg-blue-900/20 border border-blue-800/30 rounded-lg p-4 mb-8">
                            <div className="flex items-start">
                              <div className="flex-shrink-0 mt-0.5">
                                <CheckCircle2 className="h-5 w-5 text-blue-400" />
                              </div>
                              <div className="ml-3">
                                <h3 className="text-sm font-medium text-blue-300">Επιλέξατε το πακέτο {selectedPlan.name}</h3>
                                <p className="mt-1 text-sm text-gray-400">
                                  {formData.billingCycle === "monthly" 
                                    ? `${selectedPlan.monthlyPrice}€ / μήνα` 
                                    : `${selectedPlan.yearlyPrice}€ / έτος`}. 
                                  Η χρέωση θα ξεκινήσει μετά την περίοδο δοκιμής 14 ημερών.
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="flex justify-between pt-4">
                            <motion.button
                              type="button"
                              onClick={handlePrevStep}
                              className="inline-flex items-center px-6 py-3 border border-gray-300 shadow-sm text-base font-medium rounded-md text-gray-300 bg-transparent hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                            >
                              <ArrowLeft className="mr-2 -ml-1 h-5 w-5" />
                              Προηγούμενο
                            </motion.button>
                            
                            <motion.button
                              type="submit"
                              disabled={isSubmitting}
                              className={`inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                                isSubmitting ? "opacity-70 cursor-not-allowed" : ""
                              }`}
                              whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
                              whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
                            >
                              {isSubmitting ? (
                                <>
                                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                  </svg>
                                  Υποβολή...
                                </>
                              ) : (
                                <>
                                  Ολοκλήρωση αίτησης
                                  <Send className="ml-2 -mr-1 h-5 w-5" />
                                </>
                              )}
                            </motion.button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </form>
                )}
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="py-8 bg-black border-t border-gray-900">
          <div className="container mx-auto px-6">
            <div className="text-center text-xs text-gray-500">
              <p>© {new Date().getFullYear()} FieldX. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </div>
    </PageTransitionWrapper>
  )
}