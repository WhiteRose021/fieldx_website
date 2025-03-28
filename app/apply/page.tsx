"use client"

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { PageTransitionWrapper } from '@/components/page-transition';
import Header from '@/components/header';
import { ChevronLeft, Check, ArrowRight, Mail, User, Building, Phone, MessageSquare, Package } from 'lucide-react';

// Type definitions
interface FormData {
  email: string;
  name: string;
  surname: string;
  company: string;
  phone: string;
  description: string;
  pricingPlan: string;
}

interface SubmitResponse {
  success: boolean;
  message: string;
}

export default function ContactFormPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Set Freemium as default plan and check if a plan was passed in URL
  const defaultPlan = searchParams.get('plan') || 'freemium';
  
  const [formData, setFormData] = useState<FormData>({
    email: '',
    name: '',
    surname: '',
    company: '',
    phone: '',
    description: '',
    pricingPlan: defaultPlan
  });
  
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user types
    if (errors[name as keyof FormData]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };
  
  // Validate form
  const validateForm = (): boolean => {
    const newErrors: Partial<FormData> = {};
    
    // Required fields
    if (!formData.email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
    
    if (!formData.name) newErrors.name = 'Name is required';
    if (!formData.surname) newErrors.surname = 'Surname is required';
    if (!formData.company) newErrors.company = 'Company name is required';
    if (!formData.phone) newErrors.phone = 'Phone number is required';
    if (!formData.pricingPlan) newErrors.pricingPlan = 'Pricing plan is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      // API call to submit form
      const response = await fetch('/api/submit-inquiry', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      const result: SubmitResponse = await response.json();
      
      if (result.success) {
        setIsSuccess(true);
        // Redirect after delay
        setTimeout(() => {
          router.push('/');
        }, 3000);
      } else {
        alert('Error submitting form: ' + result.message);
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageTransitionWrapper>
      <div className="min-h-screen bg-black text-white">
        {/* Header */}
        <Header />
        
        <div className="pt-24 pb-16 px-4">
          <div className="container mx-auto max-w-3xl">
            <Link href="/" className="inline-block mb-8">
              <motion.div 
                className="flex items-center text-blue-400 hover:text-blue-300 transition-colors"
                whileHover={{ x: -5 }}
              >
                <ChevronLeft size={18} />
                <span className="ml-1 text-sm">Back to Home</span>
              </motion.div>
            </Link>
            
            {!isSuccess ? (
              <>
                <motion.div 
                  className="text-center mb-10"
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                >
                  <h1 className="text-4xl font-light mb-4">Apply for FieldX</h1>
                  <p className="text-gray-400 max-w-lg mx-auto">
                    Fill out the form below to apply for FieldX's Freemium Plan. Our team will get in touch with you shortly.
                  </p>
                </motion.div>
                
                <motion.div
                  className="bg-gray-900 rounded-lg border border-gray-800 p-8"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                >
                  {/* Freemium Plan Banner */}
                  <div className="mb-8 bg-blue-600/20 border border-blue-500/30 rounded-lg p-4 text-center">
                    <h3 className="text-xl font-light mb-2 text-blue-300">Freemium Plan</h3>
                    <p className="text-gray-300 text-sm">
                      You are applying for our 28-day Freemium access. Get started with FieldX at no cost!
                    </p>
                  </div>
                  
                  <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      {/* Name */}
                      <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
                          First Name <span className="text-red-400">*</span>
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <User size={16} className="text-gray-500" />
                          </div>
                          <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className={`bg-gray-800 border ${errors.name ? 'border-red-400' : 'border-gray-700'} rounded-md pl-10 py-3 pr-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-500`}
                            placeholder="John"
                          />
                        </div>
                        {errors.name && <p className="mt-1 text-sm text-red-400">{errors.name}</p>}
                      </div>
                      
                      {/* Surname */}
                      <div>
                        <label htmlFor="surname" className="block text-sm font-medium text-gray-300 mb-2">
                          Last Name <span className="text-red-400">*</span>
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <User size={16} className="text-gray-500" />
                          </div>
                          <input
                            type="text"
                            id="surname"
                            name="surname"
                            value={formData.surname}
                            onChange={handleChange}
                            className={`bg-gray-800 border ${errors.surname ? 'border-red-400' : 'border-gray-700'} rounded-md pl-10 py-3 pr-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-500`}
                            placeholder="Doe"
                          />
                        </div>
                        {errors.surname && <p className="mt-1 text-sm text-red-400">{errors.surname}</p>}
                      </div>
                    </div>
                    
                    {/* Email */}
                    <div className="mb-6">
                      <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                        Email Address <span className="text-red-400">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Mail size={16} className="text-gray-500" />
                        </div>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          className={`bg-gray-800 border ${errors.email ? 'border-red-400' : 'border-gray-700'} rounded-md pl-10 py-3 pr-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-500`}
                          placeholder="johndoe@example.com"
                        />
                      </div>
                      {errors.email && <p className="mt-1 text-sm text-red-400">{errors.email}</p>}
                    </div>
                    
                    {/* Company */}
                    <div className="mb-6">
                      <label htmlFor="company" className="block text-sm font-medium text-gray-300 mb-2">
                        Company Name <span className="text-red-400">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Building size={16} className="text-gray-500" />
                        </div>
                        <input
                          type="text"
                          id="company"
                          name="company"
                          value={formData.company}
                          onChange={handleChange}
                          className={`bg-gray-800 border ${errors.company ? 'border-red-400' : 'border-gray-700'} rounded-md pl-10 py-3 pr-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-500`}
                          placeholder="Acme Inc."
                        />
                      </div>
                      {errors.company && <p className="mt-1 text-sm text-red-400">{errors.company}</p>}
                    </div>
                    
                    {/* Phone */}
                    <div className="mb-6">
                      <label htmlFor="phone" className="block text-sm font-medium text-gray-300 mb-2">
                        Phone Number <span className="text-red-400">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Phone size={16} className="text-gray-500" />
                        </div>
                        <input
                          type="tel"
                          id="phone"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          className={`bg-gray-800 border ${errors.phone ? 'border-red-400' : 'border-gray-700'} rounded-md pl-10 py-3 pr-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-500`}
                          placeholder="+1 (555) 123-4567"
                        />
                      </div>
                      {errors.phone && <p className="mt-1 text-sm text-red-400">{errors.phone}</p>}
                    </div>
                    
                    {/* Hidden Pricing Plan Field - Always set to Freemium */}
                    <input 
                      type="hidden" 
                      name="pricingPlan" 
                      id="pricingPlan" 
                      value="freemium" 
                    />
                    
                    {/* Description */}
                    <div className="mb-6">
                      <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-2">
                        Additional Information (Optional)
                      </label>
                      <div className="relative">
                        <div className="absolute top-3 left-3 flex items-start pointer-events-none">
                          <MessageSquare size={16} className="text-gray-500" />
                        </div>
                        <textarea
                          id="description"
                          name="description"
                          value={formData.description}
                          onChange={handleChange}
                          rows={4}
                          className="bg-gray-800 border border-gray-700 rounded-md pl-10 py-3 pr-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Tell us about your specific needs or questions..."
                        ></textarea>
                      </div>
                    </div>
                    
                    {/* Submit Button */}
                    <div>
                      <motion.button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-blue-600 hover:bg-blue-500 text-white py-3 px-4 rounded-md font-medium transition-colors flex items-center justify-center"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        {isSubmitting ? (
                          <span className="flex items-center">
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Processing...
                          </span>
                        ) : (
                          <>
                            Apply for Freemium Access
                            <ArrowRight size={18} className="ml-2" />
                          </>
                        )}
                      </motion.button>
                    </div>
                  </form>
                </motion.div>
              </>
            ) : (
              <motion.div 
                className="bg-gray-900 rounded-lg border border-gray-800 p-8 text-center"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6 }}
              >
                <div className="flex justify-center mb-6">
                  <div className="h-16 w-16 bg-green-500/20 rounded-full flex items-center justify-center">
                    <Check size={32} className="text-green-400" />
                  </div>
                </div>
                <h2 className="text-2xl font-light mb-4">Application Submitted!</h2>
                <p className="text-gray-400 mb-6">
                  Thank you for applying for the FieldX Freemium Plan. Our team will review your application and contact you shortly with your access details.
                </p>
                <p className="text-gray-400 mb-6">
                  You will be redirected to the homepage in a few seconds.
                </p>
                <Link href="/">
                  <motion.button
                    className="bg-blue-600 hover:bg-blue-500 text-white py-2 px-4 rounded-md font-medium transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Return to Home
                  </motion.button>
                </Link>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </PageTransitionWrapper>
  );
}