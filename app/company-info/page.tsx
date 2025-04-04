"use client"

import { useState, useEffect, useRef, JSX } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { PageTransitionWrapper } from '@/components/page-transition';
import Header from '@/components/header';
import { ChevronLeft, Check, ArrowRight, ArrowLeft, Save, ChevronDown, X } from 'lucide-react';

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

interface FormData extends Record<string, any> {}

// FormSection Component - Fixed to properly show/hide sections
const FormSection: React.FC<FormSectionProps> = ({ title, description, children, current, index }) => {
  const isActive = current === index;
  
  // Return null instead of hiding with CSS to prevent rendering issues
  if (!isActive) return null;
  
  return (
    <div className="transition-all duration-500 opacity-100">
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
    uniqueCustomerCode: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement> | { target: { name: string; value: any } }): void => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Simplified submission process without reCAPTCHA
  const handleSubmit = async (): Promise<void> => {
    console.log("Starting form submission");
    setIsSubmitting(true);
    
    try {
      const submitResponse = await fetch('/api/submit-evaluation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      if (!submitResponse.ok) {
        const responseText = await submitResponse.text();
        console.error("Form submission failed:", responseText);
        throw new Error(`Form submission failed: ${submitResponse.status}`);
      }
      
      const result = await submitResponse.json();
      console.log("Form submission successful:", result);
      
      // Success
      setSubmitSuccess(true);
      setTimeout(() => {
        console.log("Redirecting to dashboard");
        router.push('/dashboard');
      }, 2000);
    } catch (error) {
      console.error("Error submitting form:", error);
      alert(`Προέκυψε σφάλμα κατά την υποβολή της φόρμας: ${error instanceof Error ? error.message : 'Άγνωστο σφάλμα'}`);
    } finally {
      setIsSubmitting(false);
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
              
              <FormSection 
                title="2. Πληροφορίες Προσωπικού" 
                description="Συμπληρώστε στοιχεία σχετικά με το προσωπικό της εταιρείας."
                current={currentSection}
                index={1}
              >
                <NumberField label="Αριθμός Τεχνικών Πεδίου" name="fieldTechnicians" value={formData.fieldTechnicians} onChange={handleChange} placeholder="πχ. 15" />
                <NumberField label="Αριθμός Προσωπικού Γραφείου" name="officeStaff" value={formData.officeStaff} onChange={handleChange} placeholder="πχ. 5" />
                <NumberField label="Αριθμός Διευθυντών" name="managers" value={formData.managers} onChange={handleChange} placeholder="πχ. 2" />
              </FormSection>
              
              <FormSection 
                title="3. Τρέχον Σύστημα" 
                description="Περιγράψτε το τρέχον σύστημα διαχείρισης εργασιών σας."
                current={currentSection}
                index={2}
              >
                <TextField label="Τρέχον Σύστημα Διαχείρισης" name="currentSystem" value={formData.currentSystem} onChange={handleChange} placeholder="Περιγράψτε το τρέχον σύστημα που χρησιμοποιείτε" />
                <TextField label="Διαδικασία Ανάθεσης Εργασιών" name="taskAssignmentProcess" value={formData.taskAssignmentProcess} onChange={handleChange} multiline={true} placeholder="Περιγράψτε πώς αναθέτετε εργασίες στους τεχνικούς" />
                <NumberField label="Μηνιαίος Αριθμός Εργασιών" name="monthlyTaskCount" value={formData.monthlyTaskCount} onChange={handleChange} placeholder="πχ. 500" />
                <TextField label="Μέσος Χρόνος Ολοκλήρωσης Εργασίας" name="averageTaskCompletion" value={formData.averageTaskCompletion} onChange={handleChange} placeholder="πχ. 2 ώρες" />
              </FormSection>
              
              <FormSection 
                title="4. Διαδικασίες" 
                description="Περιγράψτε τις βασικές διαδικασίες λειτουργίας."
                current={currentSection}
                index={3}
              >
                <CheckboxGroup label="Μέθοδος Προγραμματισμού Τεχνικών" name="technicianSchedulingMethod" value={formData.technicianSchedulingMethod} onChange={handleChange} options={['Χειροκίνητα', 'Excel/Ημερολόγιο', 'Ειδικό λογισμικό', 'Άλλο']} />
                <TextField label="Διαχείριση Αιτημάτων Πελατών" name="customerRequestHandling" value={formData.customerRequestHandling} onChange={handleChange} multiline={true} placeholder="Περιγράψτε πώς διαχειρίζεστε τα αιτήματα πελατών" />
                <TextField label="Σύστημα Διαχείρισης Εγγράφων" name="documentManagementSystem" value={formData.documentManagementSystem} onChange={handleChange} placeholder="Περιγράψτε το σύστημα διαχείρισης εγγράφων" />
                <TextField label="Διαδικασία Τιμολόγησης" name="billingProcess" value={formData.billingProcess} onChange={handleChange} multiline={true} placeholder="Περιγράψτε τη διαδικασία τιμολόγησης" />
              </FormSection>
              
              <FormSection 
                title="5. Προκλήσεις" 
                description="Περιγράψτε τις βασικές προκλήσεις που αντιμετωπίζετε."
                current={currentSection}
                index={4}
              >
                <TextField label="Κορυφαίες Προκλήσεις" name="topChallenges" value={formData.topChallenges} onChange={handleChange} multiline={true} placeholder="Περιγράψτε τις κορυφαίες προκλήσεις που αντιμετωπίζετε" />
                <TextField label="Διοικητικές Ώρες" name="administrativeHours" value={formData.administrativeHours} onChange={handleChange} placeholder="Εκτιμώμενες ώρες που αφιερώνονται σε διοικητικές εργασίες ανά εβδομάδα" />
                <TextField label="Προκλήσεις Υποστήριξης Γραφείου" name="supportOfficeChallenges" value={formData.supportOfficeChallenges} onChange={handleChange} multiline={true} placeholder="Περιγράψτε τις προκλήσεις που αντιμετωπίζετε με την υποστήριξη γραφείου" />
                <TextField label="Προβλήματα Επικοινωνίας με Πελάτες" name="customerCommunicationProblems" value={formData.customerCommunicationProblems} onChange={handleChange} multiline={true} placeholder="Περιγράψτε τα προβλήματα επικοινωνίας με τους πελάτες" />
                <TextField label="Περιορισμοί Αναφορών" name="reportingLimitations" value={formData.reportingLimitations} onChange={handleChange} multiline={true} placeholder="Περιγράψτε τους περιορισμούς αναφορών" />
                <TextField label="Ελλείψεις Προγραμματισμού" name="schedulingDeficiencies" value={formData.schedulingDeficiencies} onChange={handleChange} multiline={true} placeholder="Περιγράψτε τις ελλείψεις προγραμματισμού" />
              </FormSection>
              
              <FormSection 
                title="6. Μετρήσεις" 
                description="Παρέχετε μετρήσεις απόδοσης."
                current={currentSection}
                index={5}
              >
                <TextField label="Μέσος Χρόνος Μετακίνησης" name="averageTravelTime" value={formData.averageTravelTime} onChange={handleChange} placeholder="Μέσος χρόνος μετακίνησης μεταξύ εργασιών" />
                <TextField label="Μέσος Χρόνος Εργασίας" name="averageTaskTime" value={formData.averageTaskTime} onChange={handleChange} placeholder="Μέσος χρόνος ολοκλήρωσης εργασίας" />
                <TextField label="Ικανοποίηση Πελατών" name="customerSatisfaction" value={formData.customerSatisfaction} onChange={handleChange} placeholder="Βαθμολογία ικανοποίησης πελατών (εάν διαθέσιμη)" />
                <TextField label="Ποσοστό Επανεπίσκεψης" name="revisitPercentage" value={formData.revisitPercentage} onChange={handleChange} placeholder="% εργασιών που απαιτούν επανεπίσκεψη" />
                <TextField label="Χρόνος Ολοκλήρωσης Εγγράφων" name="documentCompletionTime" value={formData.documentCompletionTime} onChange={handleChange} placeholder="Χρόνος για την ολοκλήρωση εγγράφων μετά την εργασία" />
                <TextField label="Ποσοστό Επιτυχίας Πρώτης Επίσκεψης" name="firstVisitSuccessRate" value={formData.firstVisitSuccessRate} onChange={handleChange} placeholder="% εργασιών που ολοκληρώνονται στην πρώτη επίσκεψη" />
              </FormSection>
              
              <FormSection 
                title="7. Απαιτήσεις Συστήματος" 
                description="Προσδιορίστε τις απαιτήσεις σας για το νέο σύστημα."
                current={currentSection}
                index={6}
              >
                <NumberField label="Αριθμός Τεχνικών Κινητών" name="mobileTechnicians" value={formData.mobileTechnicians} onChange={handleChange} placeholder="Αριθμός τεχνικών που θα χρησιμοποιούν την εφαρμογή κινητού" />
                <NumberField label="Αριθμός Χρηστών Web" name="officeWebUsers" value={formData.officeWebUsers} onChange={handleChange} placeholder="Αριθμός χρηστών γραφείου που θα χρησιμοποιούν την εφαρμογή web" />
                <NumberField label="Αριθμός Χρηστών Διαχείρισης" name="managementUsers" value={formData.managementUsers} onChange={handleChange} placeholder="Αριθμός χρηστών διαχείρισης" />
                <TextField label="Απαιτήσεις Ενσωμάτωσης" name="integrationRequirements" value={formData.integrationRequirements} onChange={handleChange} multiline={true} placeholder="Περιγράψτε τις απαιτήσεις ενσωμάτωσης με άλλα συστήματα" />
                <CheckboxGroup label="Προτιμήσεις Κινητών" name="mobilePreferences" value={formData.mobilePreferences} onChange={handleChange} options={['iOS', 'Android', 'Προβολή web']} />
              </FormSection>
              
              <FormSection 
                title="8. Μετάβαση και Ασφάλεια" 
                description="Προσδιορίστε τις απαιτήσεις μετάβασης και ασφάλειας."
                current={currentSection}
                index={7}
              >
                <TextField label="Απαιτήσεις Μετάβασης Δεδομένων" name="dataMigrationRequirements" value={formData.dataMigrationRequirements} onChange={handleChange} multiline={true} placeholder="Περιγράψτε τις απαιτήσεις μετάβασης δεδομένων" />
                <TextField label="Έτη Ιστορικού Δεδομένων" name="dataHistoryYears" value={formData.dataHistoryYears} onChange={handleChange} placeholder="Πόσα έτη ιστορικού δεδομένων χρειάζεστε;" />
                <TextField label="Απαιτήσεις Ασφαλείας" name="securityRequirements" value={formData.securityRequirements} onChange={handleChange} multiline={true} placeholder="Περιγράψτε τις απαιτήσεις ασφαλείας σας" />
                <TextField label="Επιθυμητό Χρονοδιάγραμμα" name="desiredTimeline" value={formData.desiredTimeline} onChange={handleChange} placeholder="Ποιο είναι το επιθυμητό χρονοδιάγραμμα υλοποίησης;" />
                <TextField label="Απαιτήσεις Εκπαίδευσης" name="trainingRequirements" value={formData.trainingRequirements} onChange={handleChange} multiline={true} placeholder="Περιγράψτε τις απαιτήσεις εκπαίδευσης σας" />
              </FormSection>
              
              <FormSection 
                title="9. Μελλοντικές Ανάγκες" 
                description="Περιγράψτε τις μελλοντικές ανάγκες και τα σχέδια ανάπτυξης."
                current={currentSection}
                index={8}
              >
                <TextField label="Προσαρμοσμένες Απαιτήσεις Λειτουργιών" name="customFunctionRequirements" value={formData.customFunctionRequirements} onChange={handleChange} multiline={true} placeholder="Περιγράψτε τυχόν προσαρμοσμένες απαιτήσεις λειτουργιών" />
                <CheckboxGroup label="Εστίαση ROI" name="roiFocus" value={formData.roiFocus} onChange={handleChange} options={['Εξοικονόμηση χρόνου', 'Μείωση διοικητικής εργασίας', 'Βελτιωμένες αναφορές', 'Αυξημένη παραγωγικότητα', 'Βελτιωμένη εμπειρία πελάτη']} />
                <TextField label="Σχέδια Ανάπτυξης" name="growthPlans" value={formData.growthPlans} onChange={handleChange} multiline={true} placeholder="Περιγράψτε σχέδια ανάπτυξης για τα επόμενα 2-3 χρόνια" />
                <TextField label="Γεωγραφική Επέκταση" name="geographicExpansion" value={formData.geographicExpansion} onChange={handleChange} multiline={true} placeholder="Περιγράψτε τυχόν σχέδια γεωγραφικής επέκτασης" />
                <TextField label="Σχεδιασμένες Υπηρεσίες" name="plannedServices" value={formData.plannedServices} onChange={handleChange} multiline={true} placeholder="Περιγράψτε νέες υπηρεσίες που σκοπεύετε να προσφέρετε" />
              </FormSection>
              
              <FormSection 
                title="10. Πρόσθετες Πληροφορίες" 
                description="Παρέχετε επιπλέον πληροφορίες που μπορεί να είναι χρήσιμες." 
                current={currentSection} 
                index={9}
              >
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
                  disabled={isSubmitting}
                  className={`flex items-center justify-center py-3 px-6 rounded-md font-medium transition-colors ${
                    !isSubmitting ? 'bg-blue-600 hover:bg-blue-500 text-white' : 'bg-gray-700 text-gray-300 cursor-not-allowed'
                  }`}
                  whileHover={!isSubmitting ? { scale: 1.05 } : {}}
                  whileTap={!isSubmitting ? { scale: 0.95 } : {}}
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