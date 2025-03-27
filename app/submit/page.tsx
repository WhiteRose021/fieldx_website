"use client"

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { PageTransitionWrapper } from '@/components/page-transition';
import Header from '@/components/header';
import { ChevronLeft, Check, ArrowRight } from 'lucide-react';

// Type definitions
interface UserType {
  email?: string;
  // Add other user properties as needed
}

interface PlanType {
  id: string;
  name: string;
  description: string;
  price: string;
  period: string;
  popular: boolean;
  features: string[];
  limitations: string[];
}

interface AuthContextType {
  user: UserType | null;
  loading: boolean;
  updateUserPlan: (planId: string) => Promise<{ success: boolean }>;
}

export default function Apply() {
  const { user, loading, updateUserPlan } = useAuth() as AuthContextType;
  const router = useRouter();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Redirect if not logged in
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login?redirect=apply');
    }
  }, [user, loading, router]);

  const handleApply = async () => {
    if (!selectedPlan) return;
    
    setIsProcessing(true);
    
    try {
      const result = await updateUserPlan(selectedPlan);
      
      if (result.success) {
        setTimeout(() => {
          router.push('/dashboard');
        }, 1000);
      } else {
        setIsProcessing(false);
        alert('Failed to apply for the plan. Please try again.');
      }
    } catch (error) {
      console.error("Error applying for plan:", error);
      setIsProcessing(false);
      alert('An error occurred. Please try again.');
    }
  };

  // Plan data
  const plans: PlanType[] = [
    {
      id: 'basic',
      name: 'Basic',
      description: 'Ideal for small businesses',
      price: '49€',
      period: '/ month',
      popular: false,
      features: [
        'Up to 2 users',
        'Basic FTTH management tools',
        'Unlimited projects',
        'Basic dashboard',
        'Email support',
      ],
      limitations: [
        'No AI suggestions',
        'No API access',
        'No advanced analytics',
      ]
    },
    {
      id: 'pro',
      name: 'Pro',
      description: 'For businesses in development',
      price: '99€',
      period: '/ month',
      popular: true,
      features: [
        'Up to 10 users',
        'Advanced management tools',
        'Unlimited projects',
        'Advanced dashboard',
        'Phone support',
        'AI suggestions',
        'API access',
        'Basic analytics',
      ],
      limitations: []
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      description: 'For large companies',
      price: '249€',
      period: '/ month',
      popular: false,
      features: [
        'Unlimited users',
        'Complete management tools',
        'Unlimited projects',
        'Custom dashboard',
        '24/7 dedicated support',
        'AI suggestions & automation',
        'Advanced API',
        'Advanced analytics',
      ],
      limitations: []
    }
  ];

  // Animation variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <PageTransitionWrapper>
      <div className="min-h-screen bg-black text-white">
        {/* Header with white background */}
        <Header />

        <div className="pt-24 pb-16 px-4">
          <div className="container mx-auto">
            <div className="flex flex-col items-center justify-center mb-12">
              <Link href="/" className="self-start inline-block mb-8">
                <motion.div 
                  className="flex items-center text-blue-400 hover:text-blue-300 transition-colors"
                  whileHover={{ x: -5 }}
                >
                  <ChevronLeft size={18} />
                  <span className="ml-1 text-sm">Back to Home</span>
                </motion.div>
              </Link>
              
              <motion.h1 
                className="text-4xl md:text-5xl font-light text-center mb-4"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                Choose Your Plan
              </motion.h1>
              
              <motion.p 
                className="text-gray-400 text-center max-w-2xl mb-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                Select the plan that best fits your FTTH management needs.
                All plans include our core platform features.
              </motion.p>
            </div>
            
            {/* Plans Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-16">
              {plans.map((plan, index) => (
                <motion.div 
                  key={plan.id}
                  className={`bg-gray-900 rounded-lg overflow-hidden border-2 transition-all ${
                    selectedPlan === plan.id 
                      ? 'border-blue-500 shadow-lg shadow-blue-500/20' 
                      : 'border-gray-800 hover:border-gray-700'
                  } ${plan.popular ? 'md:-mt-4 md:mb-4' : ''}`}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  onClick={() => setSelectedPlan(plan.id)}
                  whileHover={{ y: -10 }}
                >
                  {plan.popular && (
                    <div className="bg-blue-600 text-center py-2 text-xs uppercase tracking-wider font-medium">
                      Most Popular
                    </div>
                  )}
                  
                  <div className="p-6">
                    <h3 className="text-xl font-medium mb-2">{plan.name}</h3>
                    <p className="text-gray-400 text-sm mb-4">{plan.description}</p>
                    
                    <div className="mb-6">
                      <span className="text-3xl font-light">{plan.price}</span>
                      <span className="text-gray-400 text-sm">{plan.period}</span>
                    </div>
                    
                    <button 
                      className={`w-full py-3 rounded-md mb-6 font-medium transition-colors ${
                        selectedPlan === plan.id
                          ? 'bg-blue-600 hover:bg-blue-500'
                          : 'bg-gray-800 hover:bg-gray-700'
                      }`}
                      onClick={() => setSelectedPlan(plan.id)}
                    >
                      {selectedPlan === plan.id ? (
                        <span className="flex items-center justify-center">
                          <Check size={16} className="mr-2" />
                          Selected
                        </span>
                      ) : (
                        'Select Plan'
                      )}
                    </button>
                    
                    <div className="space-y-3">
                      <p className="text-sm font-medium text-gray-300">Includes:</p>
                      {plan.features.map((feature, idx) => (
                        <div key={idx} className="flex items-start">
                          <Check size={16} className="text-green-400 mt-0.5 mr-2 flex-shrink-0" />
                          <span className="text-sm text-gray-300">{feature}</span>
                        </div>
                      ))}
                      
                      {plan.limitations.length > 0 && (
                        <>
                          <p className="text-sm font-medium text-gray-300 mt-4">Not included:</p>
                          {plan.limitations.map((limitation, idx) => (
                            <div key={idx} className="flex items-start">
                              <div className="w-4 h-px bg-red-400 mt-3 mr-2 flex-shrink-0"></div>
                              <span className="text-sm text-gray-400">{limitation}</span>
                            </div>
                          ))}
                        </>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
            
            {/* Apply Button */}
            <motion.div 
              className="flex justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <motion.button
                onClick={handleApply}
                disabled={!selectedPlan || isProcessing}
                className={`flex items-center justify-center py-4 px-8 rounded-md font-medium text-lg transition-colors ${
                  selectedPlan && !isProcessing
                    ? 'bg-blue-600 hover:bg-blue-500 text-white'
                    : 'bg-gray-800 text-gray-400 cursor-not-allowed'
                }`}
                whileHover={selectedPlan && !isProcessing ? { scale: 1.05 } : {}}
                whileTap={selectedPlan && !isProcessing ? { scale: 0.95 } : {}}
              >
                {isProcessing ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </span>
                ) : (
                  <>
                    Continue to Dashboard
                    <ArrowRight size={18} className="ml-2" />
                  </>
                )}
              </motion.button>
            </motion.div>
          </div>
        </div>
        
        {/* Footer */}
        <footer className="bg-black border-t border-gray-800 py-8">
          <div className="container mx-auto px-4 text-center">
            <p className="text-gray-500 text-sm">&copy; {new Date().getFullYear()} Arvanitis G. All rights reserved.</p>
          </div>
        </footer>
      </div>
    </PageTransitionWrapper>
  );
}