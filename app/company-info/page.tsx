// app/company-info/page.tsx
"use client"

import { useState, useEffect, useRef, JSX } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { PageTransitionWrapper } from '@/components/page-transition';
import Header from '@/components/header';
import { ChevronLeft, Check, ArrowRight, ArrowLeft, Save, ChevronDown, X } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

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
  const [formData, setFormData] = useState<Record<string, any>>({
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

  const generatePDF = async (): Promise<jsPDF> => {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      putOnlyUsedFonts: true
    });

    autoTable(doc, {
      head: [['Φόρμα Αξιολόγησης Πελατών']],
      body: [],
      startY: 10,
      styles: { fontSize: 18, halign: 'center', textColor: [0, 0, 0] },
      columnStyles: { 0: { halign: 'center' } },
      theme: 'plain'
    });
    
    const addSection = (title: string, dataObj: Record<string, any>, startY: number): number => {
      autoTable(doc, {
        head: [[title]],
        body: [],
        startY: startY,
        styles: { 
          fontSize: 14, 
          halign: 'left', 
          textColor: [0, 0, 255],
          cellPadding: { top: 2, right: 2, bottom: 0, left: 5 }
        },
        theme: 'plain'
      });
      
      const tableData = Object.entries(dataObj).map(([key, value]) => {
        let displayValue = Array.isArray(value) ? value.join(', ') : String(value || '');
        if (displayValue === '') displayValue = '-';
        return [`${key}:`, displayValue];
      });
      
      autoTable(doc, {
        body: tableData,
        startY: startY + 10,
        styles: { 
          fontSize: 10, 
          overflow: 'linebreak',
          cellPadding: { top: 2, right: 2, bottom: 2, left: 5 } 
        },
        columnStyles: {
          0: { fontStyle: 'bold', cellWidth: 80 },
          1: { cellWidth: 'auto' }
        },
        theme: 'plain'
      });
      
      return (doc as any).lastAutoTable.finalY + 10;
    };
    
    const sections = [
      {
        title: '1. Πληροφορίες Εταιρείας',
        data: {
          'Επωνυμία Εταιρείας': formData.companyName,
          'Κλάδος/Εξειδίκευση': formData.industry,
          'Αριθμός Εργαζομένων': formData.employeeCount,
          'Διεύθυνση Εταιρείας': formData.companyAddress
        }
      },
      {
        title: '2. Δομή Ομάδας',
        data: {
          'Αριθμός Τεχνικών Πεδίου': formData.fieldTechnicians,
          'Αριθμός Διοικητικού/Γραφειακού Προσωπικού': formData.officeStaff,
          'Αριθμός Διευθυντών/Επιβλεπόντων': formData.managers
        }
      },
      {
        title: '3. Αξιολόγηση Τρέχουσας Ροής Εργασίας',
        data: {
          'Τρέχον Σύστημα CRM/FSM': formData.currentSystem,
          'Διαχείριση αναθέσεων εργασίας': formData.taskAssignmentProcess,
          'Μέσος αριθμός εργασιών ανά μήνα': formData.monthlyTaskCount,
          'Μέσος χρόνος ολοκλήρωσης': formData.averageTaskCompletion,
          'Μέθοδος προγραμματισμού τεχνικών': formData.technicianSchedulingMethod,
          'Διαχείριση αιτημάτων πελατών': formData.customerRequestHandling,
          'Σύστημα διαχείρισης εγγράφων': formData.documentManagementSystem,
          'Διαδικασία τιμολόγησης': formData.billingProcess
        }
      },
      {
        title: '4. Προβλήματα & Προκλήσεις',
        data: {
          'Κορυφαίες προκλήσεις': formData.topChallenges,
          'Χρόνος σε διοικητικές εργασίες': formData.administrativeHours,
          'Προκλήσεις στελέχωσης': formData.supportOfficeChallenges,
          'Προβλήματα επικοινωνίας': formData.customerCommunicationProblems,
          'Περιορισμοί reports': formData.reportingLimitations,
          'Ανεπάρκειες προγραμματισμού': formData.schedulingDeficiencies
        }
      },
      {
        title: '5. Λειτουργικές Μετρήσεις',
        data: {
          'Μέσος χρόνος μετακίνησης': formData.averageTravelTime,
          'Μέσος χρόνος ολοκλήρωσης': formData.averageTaskTime,
          'Ποσοστό ικανοποίησης πελατών': formData.customerSatisfaction,
          'Ποσοστό επισκέψεων επανεξέτασης': formData.revisitPercentage,
          'Χρόνος συμπλήρωσης εγγράφων': formData.documentCompletionTime,
          'Ποσοστό επιτυχίας πρώτης επίσκεψης': formData.firstVisitSuccessRate
        }
      },
      {
        title: '6. Τεχνικές Απαιτήσεις',
        data: {
          'Τεχνικοί με πρόσβαση μέσω κινητού': formData.mobileTechnicians,
          'Προσωπικό με πρόσβαση μέσω web': formData.officeWebUsers,
          'Διοίκηση με πρόσβαση': formData.managementUsers,
          'Απαιτήσεις ενσωμάτωσης': formData.integrationRequirements,
          'Προτιμήσεις κινητών συσκευών': formData.mobilePreferences,
          'Απαιτήσεις μετάπτωσης δεδομένων': formData.dataMigrationRequirements,
          'Έτη ιστορικών δεδομένων': formData.dataHistoryYears,
          'Απαιτήσεις ασφάλειας': formData.securityRequirements
        }
      },
      {
        title: '7. Προτιμήσεις Υλοποίησης',
        data: {
          'Χρονοδιάγραμμα υλοποίησης': formData.desiredTimeline,
          'Απαιτήσεις εκπαίδευσης': formData.trainingRequirements,
          'Απαιτήσεις προσαρμοσμένων λειτουργιών': formData.customFunctionRequirements
        }
      },
      {
        title: '8. Προσδοκίες ROI',
        data: {
          'Κύρια εστίαση ROI': formData.roiFocus
        }
      },
      {
        title: '9. Σχέδια Ανάπτυξης',
        data: {
          'Αναμενόμενη ανάπτυξη': formData.growthPlans,
          'Σχέδια γεωγραφικής επέκτασης': formData.geographicExpansion,
          'Σχεδιαζόμενες νέες υπηρεσίες': formData.plannedServices
        }
      },
      {
        title: '10. Πρόσθετες Πληροφορίες',
        data: {
          'Πώς μάθατε για εμάς': formData.howHeard,
          'Σημαντικοί παράγοντες απόφασης': formData.decisionFactors,
          'Συγκεκριμένες απαιτήσεις': formData.specificRequirements
        }
      }
    ];
    
    let currentY = 30;
    sections.forEach(section => {
      currentY = addSection(section.title, section.data, currentY);
    });
    
    const date = new Date();
    doc.setFontSize(8);
    doc.text(`Δημιουργήθηκε: ${date.toLocaleDateString()} ${date.toLocaleTimeString()}`, 14, 280);
    
    return doc;
  };

// In app/company-info/page.tsx
const sendEmailWithPDF = async (pdfDoc: jsPDF): Promise<boolean> => {
    try {
      const pdfBase64 = pdfDoc.output('datauristring');
      
      const emailData = {
        to: 'alexisarvas2005@gmail.com',
        subject: 'Νέα Φόρμα Αξιολόγησης Πελάτη',
        body: `Συνημμένα θα βρείτε μια νέα φόρμα αξιολόγησης πελάτη από την εταιρεία "${formData.companyName || 'Μη καταχωρημένη'}".`,
        attachments: [
          {
            name: `customer-evaluation-${new Date().toISOString().slice(0, 10)}.pdf`,
            data: pdfBase64.split(',')[1]
          }
        ]
      };
      
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(emailData),
      });
      
      if (!response.ok) {
        throw new Error('Failed to send email');
      }
      
      pdfDoc.save(`customer-evaluation-${new Date().toISOString().slice(0, 10)}.pdf`);
      return true;
    } catch (error) {
      console.error("Error sending email:", error);
      pdfDoc.save(`customer-evaluation-${new Date().toISOString().slice(0, 10)}.pdf`);
      return false;
    }
  };

// Replace the submitFormData and handleSubmit functions in the CustomerEvaluationForm component

// Replace these functions in your page.tsx file

const submitFormData = async (data: Record<string, any>): Promise<{ success: boolean; message?: string }> => {
  try {
    // Send data to the API endpoint
    const response = await fetch('/api/submit-evaluation', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error(`Server responded with status: ${response.status}`);
    }
    
    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Error submitting form data:", error);
    return { success: false, message: 'Error submitting form data.' };
  }
};

const handleSubmit = async (): Promise<void> => {
  setIsSubmitting(true);
  
  try {
    // Submit form data
    const result = await submitFormData(formData);
    
    if (result.success) {
      // Set success state
      setSubmitSuccess(true);
      
      // Redirect after showing success message
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);
    } else {
      alert(result.message || 'Failed to submit form. Please try again.');
    }
  } catch (error) {
    console.error("Error in form submission:", error);
    alert('An error occurred. Please try again.');
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
              
              <FormSection title="2. Δομή Ομάδας" description="Περιγράψτε τη διάρθρωση της ομάδας σας." current={currentSection} index={1}>
                <NumberField label="Αριθμός Τεχνικών Πεδίου" name="fieldTechnicians" value={formData.fieldTechnicians} onChange={handleChange} placeholder="πχ. 10" />
                <NumberField label="Αριθμός Διοικητικού/Γραφειακού Προσωπικού" name="officeStaff" value={formData.officeStaff} onChange={handleChange} placeholder="πχ. 5" />
                <NumberField label="Αριθμός Διευθυντών/Επιβλεπόντων" name="managers" value={formData.managers} onChange={handleChange} placeholder="πχ. 2" />
              </FormSection>
              
              <FormSection title="3. Αξιολόγηση Τρέχουσας Ροής Εργασίας" description="Εξηγήστε πώς διαχειρίζεστε τις εργασίες σας σήμερα." current={currentSection} index={2}>
                <TextField label="Τρέχον Σύστημα CRM/FSM (εάν υπάρχει)" name="currentSystem" value={formData.currentSystem} onChange={handleChange} placeholder="πχ. Microsoft Dynamics, Zoho CRM, κτλ." />
                <TextField label="Πώς διαχειρίζεστε τις αναθέσεις εργασίας σε τεχνικό;" name="taskAssignmentProcess" value={formData.taskAssignmentProcess} onChange={handleChange} multiline={true} placeholder="Περιγράψτε τη διαδικασία ανάθεσης εργασιών" />
                <NumberField label="Μέσος αριθμός εργασιών ανά μήνα" name="monthlyTaskCount" value={formData.monthlyTaskCount} onChange={handleChange} placeholder="πχ. 200" />
                <TextField label="Μέσος χρόνος ολοκλήρωσης μιας τυπικής εργασίας" name="averageTaskCompletion" value={formData.averageTaskCompletion} onChange={handleChange} placeholder="πχ. 2 ώρες" />
                <SelectField label="Μέθοδος προγραμματισμού τεχνικών" name="technicianSchedulingMethod" value={formData.technicianSchedulingMethod} onChange={handleChange} options={['Χειροκίνητα μέσω σημειώσεων', 'μηνυμάτων Viber/WhatsApp', 'Excel', 'Ειδικό λογισμικό', 'Άλλο']} multiple={true} />
                <TextField label="Πώς διαχειρίζεστε τα αιτήματα πελατών;" name="customerRequestHandling" value={formData.customerRequestHandling} onChange={handleChange} multiline={true} placeholder="Περιγράψτε τη διαδικασία διαχείρισης αιτημάτων πελατών" />
                <TextField label="Σύστημα διαχείρισης εγγράφων που αφορούν εργασίες ή πελάτες (εάν υπάρχει)" name="documentManagementSystem" value={formData.documentManagementSystem} onChange={handleChange} placeholder="πχ. SharePoint, Dropbox, Google Drive" />
                <TextField label="Πως γίνεται η διαδικασία της τιμολόγησης" name="billingProcess" value={formData.billingProcess} onChange={handleChange} placeholder="Περιγράψτε τη διαδικασία τιμολόγησης" />
              </FormSection>
              
              <FormSection title="4. Προβλήματα & Προκλήσεις" description="Μοιραστείτε τις δυσκολίες που αντιμετωπίζετε στις καθημερινές εργασίες." current={currentSection} index={3}>
                <TextField label="Κορυφαίες 3 προκλήσεις που αντιμετωπίζετε" name="topChallenges" value={formData.topChallenges} onChange={handleChange} multiline={true} placeholder="Περιγράψτε τις 3 σημαντικότερες προκλήσεις που αντιμετωπίζετε στις καθημερινές εργασίες" />
                <NumberField label="Εκτιμώμενος χρόνος σε διοικητικές εργασίες (ώρες ανά τεχνικό ανά εβδομάδα)" name="administrativeHours" value={formData.administrativeHours} onChange={handleChange} placeholder="πχ. 10" />
                <TextField label="Προκλήσεις στελέχωσης γραφείου υποστήριξης & back office" name="supportOfficeChallenges" value={formData.supportOfficeChallenges} onChange={handleChange} multiline={true} placeholder="Περιγράψτε τις προκλήσεις στελέχωσης του γραφείου υποστήριξης" />
                <TextField label="Προβλήματα επικοινωνίας με πελάτες" name="customerCommunicationProblems" value={formData.customerCommunicationProblems} onChange={handleChange} multiline={true} placeholder="Περιγράψτε τα προβλήματα επικοινωνίας με τους πελάτες" />
                <TextField label="Περιορισμοί που προκύπτουν στη διαδικασία δημιουργίας reports και ορατότητας" name="reportingLimitations" value={formData.reportingLimitations} onChange={handleChange} multiline={true} placeholder="Περιγράψτε τους περιορισμούς στη δημιουργία αναφορών" />
                <TextField label="Ανεπάρκειες προγραμματισμού και δρομολόγησης εργασιών" name="schedulingDeficiencies" value={formData.schedulingDeficiencies} onChange={handleChange} multiline={true} placeholder="Περιγράψτε τις ανεπάρκειες στον προγραμματισμό και τη δρομολόγηση εργασιών" />
              </FormSection>
              
              <FormSection title="5. Λειτουργικές Μετρήσεις" description="Παραθέστε μετρήσεις σχετικά με τη λειτουργία της εταιρείας." current={currentSection} index={4}>
                <TextField label="Μέσος χρόνος μετακίνησης μεταξύ εργασιών" name="averageTravelTime" value={formData.averageTravelTime} onChange={handleChange} placeholder="πχ. 30 λεπτά" />
                <TextField label="Μέσος χρόνος ολοκλήρωσης εργασίας" name="averageTaskTime" value={formData.averageTaskTime} onChange={handleChange} placeholder="πχ. 2 ώρες" />
                <TextField label="Ποσοστό ικανοποίησης πελατών (εάν μετράται)" name="customerSatisfaction" value={formData.customerSatisfaction} onChange={handleChange} placeholder="πχ. 85%" />
                <TextField label="Ποσοστό εργασιών που απαιτούν επισκέψεις επανεξέτασης" name="revisitPercentage" value={formData.revisitPercentage} onChange={handleChange} placeholder="πχ. 15%" />
                <TextField label="Χρόνος συμπλήρωσης εγγράφων ανά εργασία" name="documentCompletionTime" value={formData.documentCompletionTime} onChange={handleChange} placeholder="πχ. 20 λεπτά" />
                <TextField label="Ποσοστό επιτυχίας πρώτης επίσκεψης" name="firstVisitSuccessRate" value={formData.firstVisitSuccessRate} onChange={handleChange} placeholder="πχ. 80%" />
              </FormSection>
              
              <FormSection title="6. Τεχνικές Απαιτήσεις" description="Προσδιορίστε τις τεχνικές απαιτήσεις του συστήματος." current={currentSection} index={5}>
                <NumberField label="Τεχνικοί πεδίου που απαιτούν πρόσβαση μέσω κινητού" name="mobileTechnicians" value={formData.mobileTechnicians} onChange={handleChange} placeholder="πχ. 12" />
                <NumberField label="Προσωπικό γραφείου που απαιτεί πρόσβαση μέσω web" name="officeWebUsers" value={formData.officeWebUsers} onChange={handleChange} placeholder="πχ. 5" />
                <NumberField label="Διοίκηση που απαιτεί πρόσβαση" name="managementUsers" value={formData.managementUsers} onChange={handleChange} placeholder="πχ. 2" />
                <TextField label="Απαιτήσεις ενσωμάτωσης (λογιστικά, αποθέματα, συστήματα τιμολόγησης)" name="integrationRequirements" value={formData.integrationRequirements} onChange={handleChange} multiline={true} placeholder="Περιγράψτε τις απαιτήσεις ενσωμάτωσης με άλλα συστήματα" />
                <CheckboxGroup label="Προτιμήσεις κινητών συσκευών" name="mobilePreferences" value={formData.mobilePreferences} onChange={handleChange} options={['iOS', 'Android']} />
                <TextField label="Απαιτήσεις μετάπτωσης δεδομένων" name="dataMigrationRequirements" value={formData.dataMigrationRequirements} onChange={handleChange} multiline={true} placeholder="Περιγράψτε τις απαιτήσεις μετάπτωσης δεδομένων" />
                <NumberField label="Εύρος μετάπτωσης δεδομένων (έτη ιστορικών δεδομένων)" name="dataHistoryYears" value={formData.dataHistoryYears} onChange={handleChange} placeholder="πχ. 3" />
                <TextField label="Ειδικές απαιτήσεις ασφάλειας ή συμμόρφωσης για δεδομένα" name="securityRequirements" value={formData.securityRequirements} onChange={handleChange} multiline={true} placeholder="Περιγράψτε τυχόν ειδικές απαιτήσεις ασφαλείας" />
              </FormSection>
              
              <FormSection title="7. Προτιμήσεις Υλοποίησης" description="Καθορίστε τις προτιμήσεις σας για την υλοποίηση του συστήματος." current={currentSection} index={6}>
                <SelectField label="Επιθυμητό χρονοδιάγραμμα υλοποίησης" name="desiredTimeline" value={formData.desiredTimeline} onChange={handleChange} options={['Άμεσα (1-2 εβδομάδες)', 'Σύντομα (3-4 εβδομάδες)', 'Μεσοπρόθεσμα (1-2 μήνες)', 'Μακροπρόθεσμα (3+ μήνες)']} />
                <TextField label="Απαιτήσεις εκπαίδευσης" name="trainingRequirements" value={formData.trainingRequirements} onChange={handleChange} multiline={true} placeholder="Περιγράψτε τις απαιτήσεις εκπαίδευσης των χρηστών του συστήματος" />
                <TextField label="Απαιτήσεις προσαρμοσμένων λειτουργιών" name="customFunctionRequirements" value={formData.customFunctionRequirements} onChange={handleChange} multiline={true} placeholder="Περιγράψτε τυχόν απαιτήσεις για προσαρμοσμένες λειτουργίες" />
              </FormSection>
              
              <FormSection title="8. Προσδοκίες ROI" description="Προσδιορίστε τις προσδοκίες απόδοσης επένδυσης." current={currentSection} index={7}>
                <CheckboxGroup label="Κύρια εστίαση ROI" name="roiFocus" value={formData.roiFocus} onChange={handleChange} options={['Αποδοτικότητα τεχνικών', 'Μείωση διοικητικού φόρτου', 'Ικανοποίηση πελατών']} />
              </FormSection>
              
              <FormSection title="9. Σχέδια Ανάπτυξης" description="Περιγράψτε τα μελλοντικά σχέδια ανάπτυξης της εταιρείας σας." current={currentSection} index={8}>
                <TextField label="Αναμενόμενη ανάπτυξη εταιρείας τους επόμενους 12-24 μήνες" name="growthPlans" value={formData.growthPlans} onChange={handleChange} multiline={true} placeholder="Περιγράψτε τα σχέδια ανάπτυξης της εταιρείας" />
                <TextField label="Σχέδια γεωγραφικής επέκτασης" name="geographicExpansion" value={formData.geographicExpansion} onChange={handleChange} multiline={true} placeholder="Περιγράψτε τυχόν σχέδια γεωγραφικής επέκτασης" />
                <TextField label="Σχεδιαζόμενες νέες υπηρεσίες" name="plannedServices" value={formData.plannedServices} onChange={handleChange} multiline={true} placeholder="Περιγράψτε τυχόν σχεδιαζόμενες νέες υπηρεσίες" />
              </FormSection>
              
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
                  disabled={isSubmitting}
                  className={`flex items-center justify-center py-3 px-6 rounded-md font-medium transition-colors ${!isSubmitting ? 'bg-blue-600 hover:bg-blue-500 text-white' : 'bg-gray-700 text-gray-300 cursor-not-allowed'}`}
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
                <p>Το PDF έχει δημιουργηθεί και θα αποσταλεί στο email alexisarvas2005@gmail.com</p>
              </motion.div>
            )}
          </div>
        </div>
        
        <footer className="bg-black border-t border-gray-800 py-8">
          <div className="container mx-auto px-4 text-center">
            <p className="text-gray-500 text-sm">© {new Date().getFullYear()} Arvanitis G. All rights reserved.</p>
          </div>
        </footer>
      </div>
    </PageTransitionWrapper>
  );
}