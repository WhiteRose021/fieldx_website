"use client"

import { useState, useEffect, useRef, JSX } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { PageTransitionWrapper } from '@/components/page-transition';
import Header from '@/components/header';
import { ChevronLeft, Check, ArrowRight, ArrowLeft, Save, ChevronDown, X } from 'lucide-react';
import ReCAPTCHA from "react-google-recaptcha";

// Type definitions
interface UserType {
  email?: string;
}

interface AuthContextType {
  user: UserType | null;
  loading: boolean;
}

interface TextFieldProps {
  label: string;
  name: string;
  value: string | undefined | null;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  placeholder?: string;
  multiline?: boolean;
}

interface NumberFieldProps {
  label: string;
  name: string;
  value: string | number | undefined | null;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
}

interface SelectFieldProps {
  label: string;
  name: string;
  value: string | string[] | undefined | null;
  onChange: (e: React.ChangeEvent<HTMLSelectElement> | { target: { name: string; value: any } }) => void;
  options: string[];
  multiple?: boolean;
}

interface CheckboxGroupProps {
  label: string;
  name: string;
  value: string[] | undefined | null;
  onChange: (e: { target: { name: string; value: any } }) => void;
  options: string[];
}

interface FormSectionProps {
  title: string;
  description: string;
  children: React.ReactNode;
  current: number;
  index: number;
}

interface MultiSelectDropdownProps {
  label: string;
  name: string;
  value: string[];
  onChange: (e: { target: { name: string; value: any } }) => void;
  options: string[];
}

interface FormData extends Record<string, any> {
  recaptchaToken?: string;
}

// FormSection Component
const FormSection: React.FC<FormSectionProps> = ({ title, description, children, current, index }) => {
  const isActive = current === index;
  return (
    <div className={`transition-all duration-500 ${isActive ? 'opacity-100' : 'opacity-0 hidden'}`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <h2 className="text-2xl font-light mb-3">{title}</h2>
        <p className="text-gray-400 mb-6">{description}</p>
        <div className="space-y-6">{children}</div>
      </motion.div>
    </div>
  );
};

// Form Field Components
const TextField: React.FC<TextFieldProps> = ({ label, name, value, onChange, placeholder = '', multiline = false }) => (
  <div>
    <label htmlFor={name} className="block text-sm text-gray-300 mb-2">{label}</label>
    {multiline ? (
      <textarea
        id={name}
        name={name}
        value={value || ''}
        onChange={onChange}
        placeholder={placeholder}
        rows={4}
        className="w-full p-3 bg-gray-800 border border-gray-700 rounded-md text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
      />
    ) : (
      <input
        type="text"
        id={name}
        name={name}
        value={value || ''}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full p-3 bg-gray-800 border border-gray-700 rounded-md text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
      />
    )}
  </div>
);

const NumberField: React.FC<NumberFieldProps> = ({ label, name, value, onChange, placeholder = '' }) => (
  <div>
    <label htmlFor={name} className="block text-sm text-gray-300 mb-2">{label}</label>
    <input
      type="number"
      id={name}
      name={name}
      value={value || ''}
      onChange={onChange}
      placeholder={placeholder}
      className="w-full p-3 bg-gray-800 border border-gray-700 rounded-md text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
    />
  </div>
);

const SelectField: React.FC<SelectFieldProps> = ({ label, name, value, onChange, options, multiple = false }) => {
  if (multiple) {
    return <MultiSelectDropdown 
      label={label} 
      name={name} 
      value={Array.isArray(value) ? value : []} 
      onChange={onChange} 
      options={options} 
    />;
  }
  
  return (
    <div>
      <label htmlFor={name} className="block text-sm text-gray-300 mb-2">{label}</label>
      <select
        id={name}
        name={name}
        value={value as string || ''}
        onChange={onChange as React.ChangeEventHandler<HTMLSelectElement>}
        className="w-full p-3 bg-gray-800 border border-gray-700 rounded-md text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
      >
        <option value="" disabled>Επιλέξτε...</option>
        {options.map((option, index) => (
          <option key={index} value={option}>{option}</option>
        ))}
      </select>
    </div>
  );
};

const MultiSelectDropdown: React.FC<MultiSelectDropdownProps> = ({ label, name, value = [], onChange, options }) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [dropdownRef]);
  
  const handleToggleOption = (option: string) => {
    let newValue = [...(value || [])];
    if (newValue.includes(option)) {
      newValue = newValue.filter(item => item !== option);
    } else {
      newValue.push(option);
    }
    onChange({ target: { name, value: newValue } });
  };
  
  return (
    <div>
      <label htmlFor={name} className="block text-sm text-gray-300 mb-2">{label}</label>
      <div className="relative" ref={dropdownRef}>
        <div
          className="w-full p-3 bg-gray-800 border border-gray-700 rounded-md text-white flex justify-between items-center cursor-pointer"
          onClick={() => setIsOpen(!isOpen)}
        >
          <div className="flex flex-wrap gap-1">
            {value.length > 0 ? (
              value.map((selected, index) => (
                <span key={index} className="bg-blue-600 text-white text-xs px-2 py-1 rounded-md flex items-center">
                  {selected}
                  <button 
                    type="button" 
                    className="ml-1" 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleOption(selected);
                    }}
                  >
                    <X size={12} />
                  </button>
                </span>
              ))
            ) : (
              <span className="text-gray-500">Επιλέξτε...</span>
            )}
          </div>
          <ChevronDown size={18} />
        </div>
        {isOpen && (
          <div className="absolute z-10 mt-1 w-full bg-gray-800 border border-gray-700 rounded-md shadow-lg max-h-60 overflow-auto">
            {options.map((option, index) => (
              <div
                key={index}
                className={`p-3 hover:bg-gray-700 cursor-pointer flex items-center ${value.includes(option) ? 'bg-gray-700' : ''}`}
                onClick={() => handleToggleOption(option)}
              >
                <div className={`w-4 h-4 mr-2 border ${value.includes(option) ? 'bg-blue-600 border-blue-600' : 'border-gray-500'} rounded flex items-center justify-center`}>
                  {value.includes(option) && <Check size={12} />}
                </div>
                {option}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const CheckboxGroup: React.FC<CheckboxGroupProps> = ({ label, name, value, onChange, options }) => (
  <div>
    <p className="block text-sm text-gray-300 mb-2">{label}</p>
    <div className="space-y-2">
      {options.map((option, index) => (
        <div key={index} className="flex items-center">
          <input
            type="checkbox"
            id={`${name}-${index}`}
            name={name}
            value={option}
            checked={value ? value.includes(option) : false}
            onChange={(e) => {
              const newValue = [...(value || [])];
              if (e.target.checked) {
                newValue.push(option);
              } else {
                const idx = newValue.indexOf(option);
                if (idx !== -1) newValue.splice(idx, 1);
              }
              onChange({ target: { name, value: newValue } });
            }}
            className="mr-2 w-4 h-4 bg-gray-800 border-gray-700 text-blue-500 focus:ring-blue-500"
          />
          <label htmlFor={`${name}-${index}`} className="text-sm text-gray-300">{option}</label>
        </div>
      ))}
    </div>
  </div>
);

export default function CustomerEvaluationForm(): JSX.Element {
  const { user, loading } = useAuth() as AuthContextType;
  const router = useRouter();
  const [currentSection, setCurrentSection] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitSuccess, setSubmitSuccess] = useState<boolean>(false);
  const [recaptchaError, setRecaptchaError] = useState<string | null>(null);
  const recaptchaRef = useRef<ReCAPTCHA>(null);
  
  const [formData, setFormData] = useState<FormData>({
    companyName: '',
    industry: [],
    employeeCount: '',
    companyAddress: '',
    fieldTechnicians: '',
    officeStaff: '',
    managers: '',
    currentSystem: '',
    taskAssignmentProcess: '',
    monthlyTaskCount: '',
    averageTaskCompletion: '',
    technicianSchedulingMethod: [],
    customerRequestHandling: '',
    documentManagementSystem: '',
    billingProcess: '',
    topChallenges: '',
    administrativeHours: '',
    supportOfficeChallenges: '',
    customerCommunicationProblems: '',
    reportingLimitations: '',
    schedulingDeficiencies: '',
    averageTravelTime: '',
    averageTaskTime: '',
    customerSatisfaction: '',
    revisitPercentage: '',
    documentCompletionTime: '',
    firstVisitSuccessRate: '',
    mobileTechnicians: '',
    officeWebUsers: '',
    managementUsers: '',
    integrationRequirements: '',
    mobilePreferences: [],
    dataMigrationRequirements: '',
    dataHistoryYears: '',
    securityRequirements: '',
    desiredTimeline: '',
    trainingRequirements: '',
    customFunctionRequirements: '',
    roiFocus: [],
    growthPlans: '',
    geographicExpansion: '',
    plannedServices: '',
    howHeard: '',
    decisionFactors: '',
    specificRequirements: '',
    uniqueCustomerCode: '',
    recaptchaToken: '',
  });

  // Execute reCAPTCHA when the component mounts
  useEffect(() => {
    const executeRecaptcha = async () => {
      try {
        if (recaptchaRef.current) {
          console.log("[DEBUG] Executing reCAPTCHA on component mount");
          const token = await recaptchaRef.current.executeAsync();
          console.log("[DEBUG] reCAPTCHA token generated:", !!token);
          setFormData(prev => ({ ...prev, recaptchaToken: token || '' }));
        }
      } catch (error) {
        console.error("[ERROR] Error executing reCAPTCHA:", error);
        setRecaptchaError("Failed to load reCAPTCHA. Please refresh the page.");
      }
    };

    if (!formData.recaptchaToken) {
      executeRecaptcha();
    }
  }, [formData.recaptchaToken]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement> | { target: { name: string; value: any } }): void => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRecaptchaChange = (token: string | null) => {
    setRecaptchaError(null); // Clear any previous errors
    console.log("[DEBUG] reCAPTCHA onChange handler called, token received:", !!token);
    setFormData(prev => ({ ...prev, recaptchaToken: token || '' }));
  };

  const handleSubmit = async (): Promise<void> => {
    console.log("[DEBUG] Starting form submission process");
    setIsSubmitting(true);
    
    try {
      // Step 1: Ensure reCAPTCHA token is available
      console.log("[DEBUG] Checking if reCAPTCHA token exists:", !!formData.recaptchaToken);
      
      if (!formData.recaptchaToken && recaptchaRef.current) {
        console.log("[DEBUG] No token found, executing reCAPTCHA");
        try {
          const token = await recaptchaRef.current.executeAsync();
          console.log("[DEBUG] reCAPTCHA executed successfully, token received:", !!token);
          console.log("[DEBUG] Token first 10 chars:", token ? token.substring(0, 10) + "..." : "No token");
          
          // Update form data with token
          setFormData(prev => ({
            ...prev,
            recaptchaToken: token || ''
          }));
          
          // Since state updates are asynchronous, use the token directly in the next step
          await verifyAndSubmit(token);
        } catch (recaptchaError) {
          console.error("[ERROR] Error executing reCAPTCHA:", recaptchaError);
          setRecaptchaError("Failed to verify reCAPTCHA. Please refresh and try again.");
          setIsSubmitting(false);
          return;
        }
      } else {
        // Use existing token in form data
        await verifyAndSubmit(formData.recaptchaToken);
      }
    } catch (error) {
      console.error("[ERROR] Error in form submission:", error);
      alert(`An error occurred: ${error instanceof Error ? error.message : 'Unknown error'}`);
      
      // Reset reCAPTCHA if there was an error
      if (recaptchaRef.current) {
        console.log("[DEBUG] Resetting reCAPTCHA after error");
        recaptchaRef.current.reset();
      }
    } finally {
      console.log("[DEBUG] Form submission process completed");
      setIsSubmitting(false);
    }
  };

  // Helper function for verification and submission
  const verifyAndSubmit = async (token: string): Promise<void> => {
    // Step 2: Verify reCAPTCHA token
    console.log("[DEBUG] Sending reCAPTCHA verification request to /api/verify-recaptcha");
    console.log("[DEBUG] Token length:", token ? token.length : 0);
    
    let verifyResponse;
    try {
      verifyResponse = await fetch('/api/verify-recaptcha', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      });
      
      console.log("[DEBUG] reCAPTCHA verification response status:", verifyResponse.status);
      console.log("[DEBUG] reCAPTCHA verification response OK:", verifyResponse.ok);
      
      // Log the full response for debugging
      const responseClone = verifyResponse.clone();
      const responseText = await responseClone.text();
      console.log("[DEBUG] reCAPTCHA verification raw response:", responseText);
      
      if (!verifyResponse.ok) {
        let errorMessage = `reCAPTCHA verification failed: ${verifyResponse.status}`;
        try {
          const errorData = JSON.parse(responseText);
          console.error("[ERROR] reCAPTCHA verification error data:", errorData);
          errorMessage = errorData.message || errorMessage;
        } catch (e) {
          console.error("[ERROR] Could not parse error response as JSON:", e);
        }
        throw new Error(errorMessage);
      }
    } catch (fetchError) {
      console.error("[ERROR] Error during reCAPTCHA verification:", fetchError);
      throw new Error(`Error during reCAPTCHA verification: ${fetchError.message}`);
    }
    
    console.log("[DEBUG] reCAPTCHA verification successful");

    // Step 3: Submit form data to Firebase
    console.log("[DEBUG] Sending form data to /api/submit-evaluation");
    
    try {
      const submitResponse = await fetch('/api/submit-evaluation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          recaptchaToken: token
        }),
      });
      
      console.log("[DEBUG] Form submission response status:", submitResponse.status);
      
      if (!submitResponse.ok) {
        const responseText = await submitResponse.text();
        console.error("[ERROR] Form submission failed:", responseText);
        try {
          const errorData = JSON.parse(responseText);
          throw new Error(errorData.message || `Form submission failed: ${submitResponse.status}`);
        } catch (e) {
          throw new Error(`Form submission failed: ${submitResponse.status}`);
        }
      }
      
      const result = await submitResponse.json();
      console.log("[DEBUG] Form submission successful:", result);
      
      // Success
      setSubmitSuccess(true);
      setTimeout(() => {
        console.log("[DEBUG] Redirecting to dashboard");
        router.push('/dashboard');
      }, 2000);
    } catch (submitError) {
      console.error("[ERROR] Error submitting form:", submitError);
      throw new Error(`Error submitting form: ${submitError.message}`);
    }
  };

  const sectionCount = 10;
  const goToNextSection = (): void => {
    if (currentSection < sectionCount - 1) {
      setCurrentSection(currentSection + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const goToPreviousSection = (): void => {
    if (currentSection > 0) {
      setCurrentSection(currentSection - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
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
        <Header />
        <div className="pt-24 pb-16 px-4">
          <div className="container mx-auto">
            <div className="flex flex-col items-center justify-center mb-8">
              <Link href="/" className="self-start inline-block mb-8">
                <motion.div 
                  className="flex items-center text-blue-400 hover:text-blue-300 transition-colors"
                  whileHover={{ x: -5 }}
                >
                  <ChevronLeft size={18} />
                  <span className="ml-1 text-sm">Πίσω στην Αρχική</span>
                </motion.div>
              </Link>
              
              <motion.h1 
                className="text-4xl md:text-5xl font-light text-center mb-4"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                Φόρμα Αξιολόγησης Πελατών
              </motion.h1>
              
              <motion.p 
                className="text-gray-400 text-center max-w-2xl mb-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                Συμπληρώστε τη φόρμα για να βοηθήσετε στην καλύτερη αξιολόγηση των αναγκών FTTH της εταιρείας σας.
              </motion.p>

              <div className="w-full max-w-3xl mb-8">
                <div className="bg-gray-800 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-blue-500 h-full transition-all duration-300"
                    style={{ width: `${(currentSection + 1) / sectionCount * 100}%` }}
                  ></div>
                </div>
                <div className="flex justify-between mt-2 text-xs text-gray-500">
                  <span>Ενότητα {currentSection + 1}</span>
                  <span>από {sectionCount}</span>
                </div>
              </div>
            </div>
            
            <div className="max-w-3xl mx-auto bg-gray-900 rounded-lg p-8 border border-gray-800 mb-8">
              <FormSection 
                title="1. Πληροφορίες Εταιρείας" 
                description="Συμπληρώστε τα βασικά στοιχεία της εταιρείας σας."
                current={currentSection}
                index={0}
              >
                <TextField label="Επωνυμία Εταιρείας" name="companyName" value={formData.companyName} onChange={handleChange} placeholder="Συμπληρώστε την επωνυμία της εταιρείας" />
                <SelectField label="Κλάδος/Εξειδίκευση" name="industry" value={formData.industry} onChange={handleChange} options={['Εγκατάσταση FTTH Α\' Φαση', 'Εγκατάσταση FTTH Β\' Φαση', 'Εγκατάσταση FTTH Γ\' Φαση', 'Συντήρηση Δικτύου FTTH (Βλάβες)', 'Τηλεπικοινωνίες', 'Άλλο']} multiple={true} />
                <NumberField label="Αριθμός Εργαζομένων" name="employeeCount" value={formData.employeeCount} onChange={handleChange} placeholder="πχ. 25" />
                <TextField label="Διεύθυνση Εταιρείας" name="companyAddress" value={formData.companyAddress} onChange={handleChange} multiline={true} placeholder="Συμπληρώστε τη διεύθυνση της εταιρείας" />
              </FormSection>
              
              {/* Other form sections remain the same */}
              {/* ... */}
              
              <FormSection title="10. Πρόσθετες Πληροφορίες" description="Παρέχετε επιπλέον πληροφορίες που μπορεί να είναι χρήσιμες." current={currentSection} index={9}>
                <SelectField label="Πώς μάθατε για τη λύση μας;" name="howHeard" value={formData.howHeard} onChange={handleChange} options={['Διαδίκτυο', 'Σύσταση', 'Εκδήλωση', 'LinkedIn', 'Άλλο']} />
                <TextField label="Ποιοι παράγοντες είναι σημαντικότεροι στη διαδικασία λήψης αποφάσεων;" name="decisionFactors" value={formData.decisionFactors} onChange={handleChange} multiline={true} placeholder="Περιγράψτε τους παράγοντες που επηρεάζουν τη λήψη αποφάσεων" />
                <TextField label="Υπάρχουν συγκεκριμένες λειτουργίες ή απαιτήσεις;" name="specificRequirements" value={formData.specificRequirements} onChange={handleChange} multiline={true} placeholder="Περιγράψτε τυχόν συγκεκριμένες λειτουργίες ή απαιτήσεις" />
                <TextField 
                  label="Μοναδικός Κωδικός Πελάτη" 
                  name="uniqueCustomerCode" 
                  value={formData.uniqueCustomerCode} 
                  onChange={handleChange} 
                  placeholder="Εισάγετε τον μοναδικό κωδικό πελάτη" 
                />
              </FormSection>
            </div>
            
            <div className="flex justify-between max-w-3xl mx-auto mb-8">
              <motion.button
                onClick={goToPreviousSection}
                disabled={currentSection === 0}
                className={`flex items-center justify-center py-3 px-6 rounded-md font-medium transition-colors ${currentSection > 0 ? 'bg-gray-800 hover:bg-gray-700 text-white' : 'bg-gray-900 text-gray-700 cursor-not-allowed'}`}
                whileHover={currentSection > 0 ? { scale: 1.05 } : {}}
                whileTap={currentSection > 0 ? { scale: 0.95 } : {}}
              >
                <ArrowLeft size={18} className="mr-2" />
                Προηγούμενο
              </motion.button>
              
              {currentSection < sectionCount - 1 ? (
                <motion.button
                  onClick={goToNextSection}
                  className="flex items-center justify-center py-3 px-6 rounded-md font-medium bg-blue-600 hover:bg-blue-500 text-white transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Επόμενο
                  <ArrowRight size={18} className="ml-2" />
                </motion.button>
              ) : (
                <motion.button
                  onClick={handleSubmit}
                  disabled={isSubmitting || recaptchaError !== null}
                  className={`flex items-center justify-center py-3 px-6 rounded-md font-medium transition-colors ${
                    !isSubmitting && recaptchaError === null 
                      ? 'bg-blue-600 hover:bg-blue-500 text-white' 
                      : 'bg-gray-700 text-gray-300 cursor-not-allowed'
                  }`}
                  whileHover={!isSubmitting && recaptchaError === null ? { scale: 1.05 } : {}}
                  whileTap={!isSubmitting && recaptchaError === null ? { scale: 0.95 } : {}}
                >
                  {isSubmitting ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Υποβολή...
                    </span>
                  ) : (
                    <>
                      <Save size={18} className="mr-2" />
                      Υποβολή Φόρμας
                    </>
                  )}
                </motion.button>
              )}
            </div>
            
            <div className="max-w-3xl mx-auto mb-8">
              <ReCAPTCHA
                ref={recaptchaRef}
                size="invisible"
                sitekey="6LfMVAcrAAAAACIdc9gO2_w8GrfX-6onRnMFyTlP"
                onChange={handleRecaptchaChange}
              />
            </div>
            
            {recaptchaError && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-3xl mx-auto p-4 mb-8 bg-red-500 bg-opacity-20 border border-red-500 rounded-md text-red-500 text-center"
              >
                <span>{recaptchaError}</span>
              </motion.div>
            )}
            
            {submitSuccess && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-3xl mx-auto p-4 mb-8 bg-green-500 bg-opacity-20 border border-green-500 rounded-md text-green-500 text-center"
              >
                <div className="flex items-center justify-center mb-2">
                  <Check size={24} className="mr-2" />
                  <span className="font-medium">Η φόρμα υποβλήθηκε επιτυχώς!</span>
                </div>
                <p>Ευχαριστούμε για την υποβολή. Θα επικοινωνήσουμε σύντομα μαζί σας.</p>
              </motion.div>
            )}
          </div>
        </div>
      </div>
      
      <footer className="bg-black border-t border-gray-800 py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-500 text-sm">© {new Date().getFullYear()} Arvanitis G. All rights reserved.</p>
        </div>
      </footer>
    </PageTransitionWrapper>
  );
}