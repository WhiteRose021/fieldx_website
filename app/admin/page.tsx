"use client"

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { PageTransitionWrapper } from '@/components/page-transition';
import Header from '@/components/header';
import { 
  ChevronLeft, Edit, CheckCircle, XCircle, Clock, User, Search, 
  ChevronDown, Phone, Mail, MessageSquare, X, Send, RefreshCw, Filter, Download, Zap
} from 'lucide-react';
import { JSX } from 'react/jsx-runtime';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, where, serverTimestamp, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

// Define types
interface UserType {
  uid: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  displayName?: string;
}

interface PlanType {
  id: string;
  status: 'active' | 'awaiting' | 'declined';
  selectedAt?: {
    seconds: number;
    nanoseconds: number;
  };
}

interface LeadType {
  id: string;
  email: string;
  name: string;
  surname: string;
  company: string;
  phone: string;
  description?: string;
  planId: string;
  status: 'new' | 'contacted' | 'converted' | 'closed';
  createdAt: {
    seconds: number;
    nanoseconds: number;
  };
  pricingPlan?: string; // Added field for pricing plan
}

interface Message {
  id?: string;
  sender: string;
  content: string;
  timestamp: any;
  isAdmin: boolean;
}

interface Ticket {
  id: string;
  subject: string;
  status: 'open' | 'closed';
  createdAt: any;
  lastUpdate: any;
  messages: Message[];
  userId: string;
}

interface UserPlanType {
  user: UserType;
  plan: PlanType | null;
}

interface EvaluationType {
  id: string;
  companyName: string;
  industry: string[];
  employeeCount: string;
  status: 'new' | 'reviewing' | 'contacted' | 'completed';
  createdAt: {
    seconds: number;
    nanoseconds: number;
  };
  pdfUrl?: string;
  formData?: Record<string, any>;
}

interface AuthContextType {
  user: UserType | null;
  loading: boolean;
  getAllUsers?: () => Promise<UserPlanType[]>;
  updateUserPlanStatus?: (userId: string, planId: string, status: 'active' | 'awaiting' | 'declined') => Promise<boolean>;
  getLeads?: () => Promise<LeadType[]>;
  updateLeadStatus?: (leadId: string, status: 'new' | 'contacted' | 'converted' | 'closed') => Promise<boolean>;
  logout: () => void;
}

interface StatusBadgeProps {
  status: string;
}

// Admin Dashboard Component
export default function AdminDashboard() {
  const { user, loading, getAllUsers, updateUserPlanStatus, getLeads, updateLeadStatus, logout } = useAuth() as AuthContextType;
  const router = useRouter();
  const [users, setUsers] = useState<UserPlanType[]>([]);
  const [leads, setLeads] = useState<LeadType[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [evaluations, setEvaluations] = useState<EvaluationType[]>([]);
  const [activeTab, setActiveTab] = useState<'users' | 'leads' | 'tickets' | 'evaluations'>('leads'); // Default to leads tab
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [editStatus, setEditStatus] = useState<'active' | 'awaiting' | 'declined'>('active');
  const [editingLead, setEditingLead] = useState<string | null>(null);
  const [editLeadStatus, setEditLeadStatus] = useState<'new' | 'contacted' | 'converted' | 'closed'>('new');
  const [viewingLead, setViewingLead] = useState<LeadType | null>(null);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [ticketFilterStatus, setTicketFilterStatus] = useState<'all' | 'open' | 'closed'>('all');
  const [isLoadingTickets, setIsLoadingTickets] = useState<boolean>(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [leadFilterPlan, setLeadFilterPlan] = useState<'all' | 'freemium'>('all');
  const [downloadingJson, setDownloadingJson] = useState<string | null>(null);
  const [editingEvaluation, setEditingEvaluation] = useState<string | null>(null);
  const [editEvaluationStatus, setEditEvaluationStatus] = useState<'new' | 'reviewing' | 'contacted' | 'completed'>('new');
  const [viewingEvaluation, setViewingEvaluation] = useState<EvaluationType | null>(null);

  // Check if user is admin
  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login?redirect=admin');
      } else if (user.email !== 'garvanitis@applink.gr') {
        router.push('/dashboard');
      } else {
        loadData();
        subscribeToTickets();
      }
    }
  }, [user, loading, router]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (selectedTicket) {
      scrollToBottom();
    }
  }, [selectedTicket?.messages?.length]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Function to fetch evaluations
  const loadEvaluations = async () => {
    try {
      const evaluationsRef = collection(db, "evaluations");
      const q = query(evaluationsRef, orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      
      const fetchedEvaluations = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          companyName: data.companyName || '',
          industry: data.industry || [],
          employeeCount: data.employeeCount || '',
          status: data.status || 'new',
          createdAt: data.createdAt,
          pdfUrl: data.pdfUrl || '',
          formData: data.formData || {}
        } as EvaluationType;
      });
      
      setEvaluations(fetchedEvaluations);
    } catch (error) {
      console.error('Error loading evaluations:', error);
    }
  };

  // Load all users, leads, and evaluations data
  const loadData = async () => {
    setIsLoading(true);
    try {
      if (getAllUsers) {
        const userData = await getAllUsers();
        setUsers(userData || []);
      }
      
      if (getLeads) {
        const leadsData = await getLeads();
        setLeads(leadsData || []);
      }
      
      // Load evaluations
      await loadEvaluations();
    } catch (error) {
      console.error('Error loading admin data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Subscribe to tickets collection for real-time updates
  const subscribeToTickets = () => {
    setIsLoadingTickets(true);
    
    const ticketsRef = collection(db, 'tickets');
    const q = query(ticketsRef, orderBy('lastUpdate', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedTickets = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          subject: data.subject,
          status: data.status,
          createdAt: data.createdAt,
          lastUpdate: data.lastUpdate,
          messages: data.messages || [],
          userId: data.userId
        } as Ticket;
      });
      
      setTickets(fetchedTickets);
      
      // Update selected ticket if it exists in the list
      if (selectedTicket) {
        const updatedTicket = fetchedTickets.find(t => t.id === selectedTicket.id);
        if (updatedTicket) {
          setSelectedTicket(updatedTicket);
        }
      }
      
      setIsLoadingTickets(false);
    }, (error) => {
      console.error("Error fetching tickets:", error);
      setIsLoadingTickets(false);
    });
    
    return unsubscribe;
  };

  // Download application JSON file
  const downloadApplicationJson = async (leadId: string, email: string) => {
    try {
      setDownloadingJson(leadId);
      
      // Create a simpler JSON directly from the lead data
      // This approach doesn't require a separate API endpoint
      const lead = leads.find(l => l.id === leadId);
      
      if (!lead) {
        throw new Error('Application data not found');
      }
      
      // Format the data
      const formattedEmail = email.replace(/[^a-zA-Z0-9]/g, '_');
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const fileName = `application_${formattedEmail}_${timestamp}.json`;
      
      // Create the application JSON structure
      const applicationData = {
        inquiryId: leadId,
        timestamp: new Date().toISOString(),
        userData: {
          email: lead.email || '',
          name: lead.name || '',
          surname: lead.surname || '',
          company: lead.company || '',
          phone: lead.phone || '',
          description: lead.description || ''
        },
        plan: {
          type: lead.pricingPlan || lead.planId || 'standard',
          duration: lead.pricingPlan === 'freemium' ? '28 days' : 'custom'
        },
        status: lead.status || 'pending',
        createdAt: lead.createdAt 
          ? new Date(lead.createdAt.seconds * 1000).toISOString()
          : new Date().toISOString()
      };
      
      // Create a blob with the JSON data
      const blob = new Blob([JSON.stringify(applicationData, null, 2)], { type: 'application/json' });
      
      // Create a download link and trigger the download
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error('Error creating application JSON:', error);
      alert('Failed to download application data. Please try again.');
    } finally {
      setDownloadingJson(null);
    }
  };

  // Add this function to your component (right after the downloadApplicationJson function)

const downloadEvaluationJson = async (evaluationId: string) => {
  try {
    setDownloadingJson(evaluationId);
    
    // Find the evaluation in the local state
    const evaluation = evaluations.find(e => e.id === evaluationId);
    
    if (!evaluation) {
      throw new Error('Evaluation data not found');
    }
    
    // Format the data
    const companyName = evaluation.companyName.replace(/[^a-zA-Z0-9]/g, '_') || 'unnamed_company';
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = `evaluation_${companyName}_${timestamp}.json`;
    
    // Create the evaluation JSON structure
    const evaluationData = {
      evaluationId: evaluation.id,
      timestamp: new Date().toISOString(),
      companyData: {
        companyName: evaluation.companyName || '',
        industry: evaluation.industry || [],
        employeeCount: evaluation.employeeCount || '',
      },
      status: evaluation.status || 'new',
      createdAt: evaluation.createdAt 
        ? new Date(evaluation.createdAt.seconds * 1000).toISOString()
        : new Date().toISOString(),
      formData: evaluation.formData || {}
    };
    
    // Create a blob with the JSON data
    const blob = new Blob([JSON.stringify(evaluationData, null, 2)], { type: 'application/json' });
    
    // Create a download link and trigger the download
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    
    // Clean up
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    
  } catch (error) {
    console.error('Error creating evaluation JSON:', error);
    alert('Failed to download evaluation data. Please try again.');
  } finally {
    setDownloadingJson(null);
  }
};

  // Update evaluation status
  const updateEvaluationStatus = async (evaluationId: string, status: 'new' | 'reviewing' | 'contacted' | 'completed') => {
    try {
      const evaluationRef = doc(db, "evaluations", evaluationId);
      await updateDoc(evaluationRef, {
        status: status,
        updatedAt: serverTimestamp()
      });
      
      // Update local state
      setEvaluations(prev => 
        prev.map(evaluation => {
          if (evaluation.id === evaluationId) {
            return { ...evaluation, status };
          }
          return evaluation;
        })
      );
      
      setEditingEvaluation(null);
      return true;
    } catch (error) {
      console.error('Error updating evaluation status:', error);
      return false;
    }
  };

  const sendAdminMessage = async (ticketId: string, content: string) => {
    if (!user?.email || !content.trim()) return;
    
    try {
      const ticketRef = doc(db, 'tickets', ticketId);
      
      // Create a regular timestamp for the message in the array
      const now = new Date();
      const firestoreTimestamp = {
        seconds: Math.floor(now.getTime() / 1000),
        nanoseconds: now.getMilliseconds() * 1000000
      };
      
      const newMessage = {
        sender: user.email,
        content,
        timestamp: firestoreTimestamp, // Use regular timestamp object instead of serverTimestamp()
        isAdmin: true
      };
      
      // Add the new message to the messages array
      await updateDoc(ticketRef, {
        messages: [...(selectedTicket?.messages || []), newMessage],
        lastUpdate: serverTimestamp() // This is fine outside arrays
      });
      
      // Clear the input field
      setNewMessage('');
      
      // The ticket will be updated by the onSnapshot listener
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please try again.');
    }
  };

  // Update ticket status (open/closed)
  const updateTicketStatus = async (ticketId: string, status: 'open' | 'closed') => {
    try {
      const ticketRef = doc(db, 'tickets', ticketId);
      await updateDoc(ticketRef, {
        status,
        lastUpdate: serverTimestamp()
      });
      
      // The ticket will be updated by the onSnapshot listener
    } catch (error) {
      console.error('Error updating ticket status:', error);
      alert('Failed to update ticket status. Please try again.');
    }
  };

  // Filter users based on search query
  const filteredUsers = users.filter(item => {
    if (!item || !item.user) return false;
    
    const email = item.user.email || '';
    const firstName = item.user.firstName || '';
    const lastName = item.user.lastName || '';
    
    return (
      email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lastName.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  // Filter leads based on search query and plan filter
  const filteredLeads = leads.filter(lead => {
    if (!lead) return false;
    
    // First filter by plan type if not "all"
    if (leadFilterPlan !== 'all' && (lead.pricingPlan?.toLowerCase() !== leadFilterPlan)) {
      return false;
    }
    
    // Then filter by search term
    if (!searchQuery) return true;
    
    const email = lead.email || '';
    const name = lead.name || '';
    const company = lead.company || '';
    
    return (
      email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      company.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  // Filter evaluations based on search query
  const filteredEvaluations = evaluations.filter(evaluation => {
    if (!evaluation) return false;
    
    if (!searchQuery) return true;
    
    const companyName = evaluation.companyName || '';
    const industry = evaluation.industry?.join(' ') || '';
    
    return (
      companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      industry.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  // Filter tickets based on search query and status
  const filteredTickets = tickets.filter(ticket => {
    // First filter by status if not "all"
    if (ticketFilterStatus !== 'all' && ticket.status !== ticketFilterStatus) {
      return false;
    }
    
    // Then filter by search term
    if (!searchQuery) return true;
    
    return (
      ticket.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.userId.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  // Update user plan status
  const handleUpdateStatus = async (userId: string, planId: string, status: 'active' | 'awaiting' | 'declined') => {
    if (updateUserPlanStatus) {
      const success = await updateUserPlanStatus(userId, planId, status);
      if (success) {
        // Update local state
        setUsers(prevUsers => 
          prevUsers.map(item => {
            if (item.user && item.user.uid === userId) {
              return { 
                ...item, 
                plan: { 
                  ...(item.plan || { id: planId, selectedAt: { seconds: Date.now() / 1000, nanoseconds: 0 } }), 
                  id: planId,
                  status 
                } 
              };
            }
            return item;
          })
        );
        setEditingUser(null);
      }
    }
  };

  // Update lead status
  const handleUpdateLeadStatus = async (leadId: string, status: 'new' | 'contacted' | 'converted' | 'closed') => {
    if (updateLeadStatus) {
      const success = await updateLeadStatus(leadId, status);
      if (success) {
        // Update local state
        setLeads(prevLeads => 
          prevLeads.map(lead => {
            if (lead.id === leadId) {
              return { ...lead, status };
            }
            return lead;
          })
        );
        setEditingLead(null);
      }
    } else {
      // Fallback for demo if updateLeadStatus is not available
      setLeads(prevLeads => 
        prevLeads.map(lead => {
          if (lead.id === leadId) {
            return { ...lead, status };
          }
          return lead;
        })
      );
      setEditingLead(null);
    }
  };

  // Handle update evaluation status
  const handleUpdateEvaluationStatus = async (evaluationId: string, status: 'new' | 'reviewing' | 'contacted' | 'completed') => {
    const success = await updateEvaluationStatus(evaluationId, status);
    if (success) {
      setEditingEvaluation(null);
    }
  };

  // Status badge component
  const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
    const statusStyles: Record<string, string> = {
      active: 'bg-green-500/20 text-green-400',
      awaiting: 'bg-yellow-500/20 text-yellow-400',
      declined: 'bg-red-500/20 text-red-400',
      new: 'bg-blue-500/20 text-blue-400',
      contacted: 'bg-purple-500/20 text-purple-400',
      converted: 'bg-green-500/20 text-green-400',
      closed: 'bg-gray-500/20 text-gray-400',
      open: 'bg-green-500/20 text-green-400',
      freemium: 'bg-blue-500/20 text-blue-400',
      reviewing: 'bg-yellow-500/20 text-yellow-400',
      completed: 'bg-green-500/20 text-green-400'
    };
    
    const statusIcons: Record<string, JSX.Element> = {
      active: <CheckCircle size={16} className="mr-2" />,
      awaiting: <Clock size={16} className="mr-2" />,
      declined: <XCircle size={16} className="mr-2" />,
      new: <CheckCircle size={16} className="mr-2" />,
      contacted: <User size={16} className="mr-2" />,
      converted: <CheckCircle size={16} className="mr-2" />,
      closed: <XCircle size={16} className="mr-2" />,
      open: <CheckCircle size={16} className="mr-2" />,
      freemium: <Zap size={16} className="mr-2" />,
      reviewing: <Clock size={16} className="mr-2" />,
      completed: <CheckCircle size={16} className="mr-2" />
    };

    return (
      <div className={`flex items-center px-3 py-1 rounded-full text-sm ${statusStyles[status] || 'bg-gray-500/20 text-gray-400'}`}>
        {statusIcons[status] || <Clock size={16} className="mr-2" />}
        {status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Unknown'}
      </div>
    );
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <PageTransitionWrapper>
      <div className="min-h-screen bg-black text-white">
        {/* Header */}
        <Header />
        
        <div className="pt-24 pb-16 px-4">
          <div className="container mx-auto max-w-6xl">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8">
              <div>
                <Link href="/dashboard" className="inline-block mb-4">
                  <motion.div 
                    className="flex items-center text-blue-400 hover:text-blue-300 transition-colors"
                    whileHover={{ x: -5 }}
                  >
                    <ChevronLeft size={18} />
                    <span className="ml-1 text-sm">Back to Dashboard</span>
                  </motion.div>
                </Link>
                
                <h1 className="text-3xl font-light">Admin Dashboard</h1>
                <p className="text-gray-400 mt-2">Manage users, plans, tickets and leads</p>
              </div>
              
              <div className="mt-4 md:mt-0 flex items-center">
                <div className="flex items-center bg-gray-900 rounded-lg px-4 py-2 border border-gray-800">
                  <Search size={18} className="text-gray-500 mr-2" />
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-transparent border-none focus:outline-none text-white w-64"
                  />
                </div>
                
                <button 
                  onClick={loadData}
                  className="ml-4 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-md text-sm"
                >
                  Refresh
                </button>
              </div>
            </div>
            
            {/* Tabs */}
            <div className="flex border-b border-gray-800 mb-6 overflow-x-auto">
              <button
                className={`px-6 py-3 text-sm font-medium ${activeTab === 'users' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400 hover:text-gray-200'}`}
                onClick={() => setActiveTab('users')}
              >
                Users & Plans
              </button>
              <button
                className={`px-6 py-3 text-sm font-medium ${activeTab === 'leads' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400 hover:text-gray-200'}`}
                onClick={() => setActiveTab('leads')}
              >
                Contact Inquiries
              </button>
              <button
                className={`px-6 py-3 text-sm font-medium ${activeTab === 'tickets' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400 hover:text-gray-200'}`}
                onClick={() => {
                  setActiveTab('tickets');
                  setSelectedTicket(null);
                }}
              >
                Support Tickets
              </button>
              <button
                className={`px-6 py-3 text-sm font-medium ${activeTab === 'evaluations' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400 hover:text-gray-200'}`}
                onClick={() => setActiveTab('evaluations')}
              >
                Customer Evaluations
              </button>
            </div>
            
            {/* Users Tab */}
            {activeTab === 'users' && (
              <div className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-800">
                    <thead className="bg-gray-900">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                          User
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                          Plan
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                          Status
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                          Selected On
                        </th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-gray-900 divide-y divide-gray-800">
                      {filteredUsers.length > 0 ? (
                        filteredUsers.map((item) => (
                          <tr key={item.user?.uid || Math.random().toString()}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-10 w-10 bg-blue-500 rounded-full flex items-center justify-center">
                                  <span className="font-medium text-white">
                                    {((item.user?.firstName || item.user?.email || '?').charAt(0) || 'U').toUpperCase()}
                                  </span>
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-white">
                                    {item.user?.firstName || ''} {item.user?.lastName || ''}
                                  </div>
                                  <div className="text-sm text-gray-400">{item.user?.email || ''}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-white capitalize">
                                {item.plan ? item.plan.id : 'No Plan'}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {editingUser === item.user?.uid ? (
                                <div className="relative">
                                  <select
                                    value={editStatus}
                                    onChange={(e) => setEditStatus(e.target.value as 'active' | 'awaiting' | 'declined')}
                                    className="bg-gray-800 border border-gray-700 text-white rounded-md px-3 py-1 pr-8 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  >
                                    <option value="active">Active</option>
                                    <option value="awaiting">Awaiting</option>
                                    <option value="declined">Declined</option>
                                  </select>
                                  <ChevronDown size={16} className="text-gray-400 absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none" />
                                </div>
                              ) : (
                                item.plan ? <StatusBadge status={item.plan.status} /> : <span className="text-gray-400">-</span>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                              {item.plan && item.plan.selectedAt ? new Date(item.plan.selectedAt.seconds * 1000).toLocaleDateString() : '-'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              {editingUser === item.user?.uid ? (
                                <div className="flex justify-end space-x-2">
                                  <button
                                    onClick={() => handleUpdateStatus(
                                      item.user?.uid || '', 
                                      item.plan ? item.plan.id : 'basic', 
                                      editStatus
                                    )}
                                    className="text-green-400 hover:text-green-300"
                                  >
                                    Save
                                  </button>
                                  <button
                                    onClick={() => setEditingUser(null)}
                                    className="text-red-400 hover:text-red-300"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={() => {
                                    if (item.user?.uid) {
                                      setEditingUser(item.user.uid);
                                      setEditStatus(item.plan ? item.plan.status : 'awaiting');
                                    }
                                  }}
                                  className="text-blue-400 hover:text-blue-300"
                                >
                                  <Edit size={16} />
                                </button>
                              )}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5} className="px-6 py-4 text-center text-gray-400">
                            {searchQuery ? 'No users found matching your search' : 'No users found'}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            
            {/* Leads Tab */}
            {activeTab === 'leads' && (
              <div>
                {/* Filter bar for lead types */}
                <div className="mb-4 flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-400">Filter by plan:</span>
                    <select 
                      className="bg-gray-800 border border-gray-700 rounded-md text-sm p-1.5 text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={leadFilterPlan}
                      onChange={(e) => setLeadFilterPlan(e.target.value as 'all' | 'freemium')}
                    >
                      <option value="all">All Applications</option>
                      <option value="freemium">Freemium Only</option>
                    </select>
                    <Filter size={16} className="text-gray-400" />
                  </div>
                  
                  {/* Counter for applications */}
                  <div className="text-sm text-gray-400">
                    <span className="font-medium text-white">{filteredLeads.length}</span> applications
                    {leadFilterPlan !== 'all' && (
                      <span> (filtered by {leadFilterPlan})</span>
                    )}
                  </div>
                </div>
                
                <div className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-800">
                      <thead className="bg-gray-900">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                            Contact
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                            Company
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                            Plan
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                            Status
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                            Date
                          </th>
                          <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-gray-900 divide-y divide-gray-800">
                        {filteredLeads.length > 0 ? (
                          filteredLeads.map((lead) => (
                            <tr key={lead.id || Math.random().toString()}>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="flex-shrink-0 h-10 w-10 bg-purple-500 rounded-full flex items-center justify-center">
                                    <span className="font-medium text-white">
                                      {((lead.name || '?').charAt(0) || 'L').toUpperCase()}
                                    </span>
                                  </div>
                                  <div className="ml-4">
                                    <div className="text-sm font-medium text-white">
                                      {lead.name || ''} {lead.surname || ''}
                                    </div>
                                    <div className="text-sm text-gray-400">{lead.email || ''}</div>
                                    <div className="text-sm text-gray-400">{lead.phone || ''}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-white">{lead.company || ''}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                {lead.pricingPlan?.toLowerCase() === 'freemium' ? (
                                  <StatusBadge status="freemium" />
                                ) : (
                                  <div className="text-sm text-white capitalize">{lead.planId || ''}</div>
                                )}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                {editingLead === lead.id ? (
                                  <div className="relative">
                                    <select
                                      value={editLeadStatus}
                                      onChange={(e) => setEditLeadStatus(e.target.value as 'new' | 'contacted' | 'converted' | 'closed')}
                                      className="bg-gray-800 border border-gray-700 text-white rounded-md px-3 py-1 pr-8 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                      <option value="new">New</option>
                                      <option value="contacted">Contacted</option>
                                      <option value="converted">Converted</option>
                                      <option value="closed">Closed</option>
                                    </select>
                                    <ChevronDown size={16} className="text-gray-400 absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none" />
                                  </div>
                                ) : (
                                  <StatusBadge status={lead.status || 'new'} />
                                )}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                                {lead.createdAt ? new Date(lead.createdAt.seconds * 1000).toLocaleDateString() : '-'}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <div className="flex justify-end space-x-2">
                                  {editingLead === lead.id ? (
                                    <>
                                      <button
                                        onClick={() => handleUpdateLeadStatus(lead.id, editLeadStatus)}
                                        className="text-green-400 hover:text-green-300"
                                      >
                                        Save
                                      </button>
                                      <button
                                        onClick={() => setEditingLead(null)}
                                        className="text-red-400 hover:text-red-300"
                                      >
                                        Cancel
                                      </button>
                                    </>
                                  ) : (
                                    <>
                                      <button
                                        onClick={() => {
                                          setEditingLead(lead.id);
                                          setEditLeadStatus(lead.status);
                                        }}
                                        className="text-blue-400 hover:text-blue-300"
                                        title="Edit Status"
                                      >
                                        <Edit size={16} />
                                      </button>
                                      <button
                                        onClick={() => setViewingLead(lead)}
                                        className="text-blue-400 hover:text-blue-300"
                                        title="View Details"
                                      >
                                        <MessageSquare size={16} />
                                      </button>
                                      {/* Download JSON button */}
                                      <button
                                        onClick={() => downloadApplicationJson(lead.id, lead.email)}
                                        className="text-blue-400 hover:text-blue-300"
                                        title="Download Application JSON"
                                        disabled={downloadingJson === lead.id}
                                      >
                                        {downloadingJson === lead.id ? (
                                          <RefreshCw size={16} className="animate-spin" />
                                        ) : (
                                          <Download size={16} />
                                        )}
                                      </button>
                                    </>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={6} className="px-6 py-4 text-center text-gray-400">
                              {searchQuery || leadFilterPlan !== 'all' ? 'No applications found matching your filters' : 'No applications found'}
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
            
            {/* Tickets Tab */}
            {activeTab === 'tickets' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Tickets List */}
                <div className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden">
                  <div className="p-4 border-b border-gray-800 flex justify-between items-center">
                    <h3 className="text-lg font-light">Support Tickets</h3>
                    <div className="flex items-center space-x-2">
                      <select 
                        className="bg-gray-800 border border-gray-700 rounded-md text-sm p-1.5 text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={ticketFilterStatus}
                        onChange={(e) => setTicketFilterStatus(e.target.value as 'all' | 'open' | 'closed')}
                      >
                        <option value="all">All Tickets</option>
                        <option value="open">Open</option>
                        <option value="closed">Closed</option>
                      </select>
                      <Filter size={16} className="text-gray-400" />
                    </div>
                  </div>
                  
                  <div className="max-h-[600px] overflow-y-auto">
                    {isLoadingTickets ? (
                      <div className="p-8 flex justify-center">
                        <RefreshCw size={24} className="text-blue-400 animate-spin" />
                      </div>
                    ) : filteredTickets.length === 0 ? (
                      <div className="p-8 text-center text-gray-400">
                        <MessageSquare size={32} className="mx-auto mb-3 opacity-30" />
                        <p>No tickets found</p>
                        <p className="text-sm mt-1">
                          {searchQuery ? 'Try adjusting your search' : 'Users have not submitted any tickets yet'}
                        </p>
                      </div>
                    ) : (
                      <div className="divide-y divide-gray-800">
                        {filteredTickets.map((ticket) => (
                          <motion.div 
                            key={ticket.id}
                            className={`p-4 cursor-pointer hover:bg-gray-800 transition-colors ${
                              selectedTicket?.id === ticket.id ? 'bg-gray-800 border-l-4 border-blue-500' : ''
                            }`}
                            onClick={() => setSelectedTicket(ticket)}
                            whileHover={{ x: 5 }}
                          >
                            <div className="flex justify-between mb-2">
                              <h4 className="font-medium text-gray-200 truncate max-w-[70%]">{ticket.subject}</h4>
                              <StatusBadge status={ticket.status} />
                            </div>
                            <div className="flex justify-between items-center text-xs text-gray-400">
                              <div className="flex items-center">
                                <MessageSquare size={12} className="mr-1" />
                                <span>{ticket.messages.length} messages</span>
                              </div>
                              <div className="flex items-center">
                                <User size={12} className="mr-1" />
                                <span>{ticket.userId}</span>
                              </div>
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              Last update: {ticket.lastUpdate ? new Date(ticket.lastUpdate.seconds * 1000).toLocaleString() : '-'}
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Ticket Details */}
                <div className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden flex flex-col h-[600px]">
                  {selectedTicket ? (
                    <>
                      <div className="p-4 border-b border-gray-800 flex justify-between items-center">
                        <div>
                          <h3 className="text-lg font-medium">{selectedTicket.subject}</h3>
                          <div className="text-xs text-gray-400 mt-1 flex items-center">
                            <User size={12} className="mr-1" />
                            <span>{selectedTicket.userId}</span>
                            <span className="mx-2">•</span>
                            <span>
                              Created: {new Date(selectedTicket.createdAt.seconds * 1000).toLocaleString()}
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-3">
                          <StatusBadge status={selectedTicket.status} />
                          
                          {selectedTicket.status === 'open' ? (
                            <button
                              onClick={() => updateTicketStatus(selectedTicket.id, 'closed')}
                              className="text-xs bg-red-500/10 hover:bg-red-500/20 text-red-400 py-1 px-2 rounded-md transition-colors"
                            >
                              Close Ticket
                            </button>
                          ) : (
                            <button
                              onClick={() => updateTicketStatus(selectedTicket.id, 'open')}
                              className="text-xs bg-green-500/10 hover:bg-green-500/20 text-green-400 py-1 px-2 rounded-md transition-colors"
                            >
                              Reopen Ticket
                            </button>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex-grow overflow-y-auto p-4 space-y-4">
                        {selectedTicket.messages.map((message, index) => (
                          <div 
                            key={index}
                            className={`flex ${message.isAdmin ? 'justify-end' : 'justify-start'}`}
                          >
                            <div className={`max-w-[80%] ${
                              message.isAdmin 
                                ? 'bg-blue-600 text-white' 
                                : 'bg-gray-800 text-gray-200'
                              } rounded-lg p-3`}
                            >
                              <div className="flex items-center mb-1">
                                <span className="text-xs font-medium">
                                  {message.isAdmin ? 'Admin' : 'User'}
                                </span>
                                <span className="text-xs opacity-70 ml-2">
                                  {message.sender}
                                </span>
                              </div>
                              <p className="text-sm">{message.content}</p>
                              <div className="text-xs opacity-70 mt-1 text-right">
                                {message.timestamp ? new Date(message.timestamp.seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}
                              </div>
                            </div>
                          </div>
                        ))}
                        <div ref={messagesEndRef} />
                      </div>
                      
                      {selectedTicket.status === 'open' ? (
                        <form 
                          onSubmit={(e) => {
                            e.preventDefault();
                            if (newMessage.trim()) {
                              sendAdminMessage(selectedTicket.id, newMessage);
                            }
                          }} 
                          className="p-4 border-t border-gray-800 flex"
                        >
                          <textarea
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Type your response..."
                            className="bg-gray-800 border border-gray-700 rounded-md py-2 px-3 flex-1 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                            rows={2}
                          />
                          <button
                            type="submit"
                            disabled={!newMessage.trim()}
                            className="ml-3 bg-blue-600 hover:bg-blue-500 text-white p-3 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Send size={18} />
                          </button>
                        </form>
                      ) : (
                        <div className="p-4 border-t border-gray-800 bg-gray-800/50 text-center text-gray-400 text-sm">
                          This ticket is closed. Reopen it to send a response.
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center p-6">
                        <MessageSquare size={40} className="mx-auto mb-4 text-gray-600" />
                        <h3 className="text-xl font-light mb-2">No Ticket Selected</h3>
                        <p className="text-gray-400 text-sm">
                          Select a ticket from the list to view details and reply.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {/* Evaluations Tab */}
            {activeTab === 'evaluations' && (
              <div>
                <div className="mb-4 flex justify-between items-center">
                  <div className="text-sm text-gray-400">
                    <span className="font-medium text-white">{filteredEvaluations.length}</span> evaluation forms
                  </div>
                  <button 
                    onClick={loadEvaluations}
                    className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-md text-sm flex items-center"
                  >
                    <RefreshCw size={16} className="mr-2" />
                    Refresh Evaluations
                  </button>
                </div>
                
                <div className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-800">
                      <thead className="bg-gray-900">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                            Company
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                            Industry
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                            Employees
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                            Status
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                            Date
                          </th>
                          <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-gray-900 divide-y divide-gray-800">
                        {filteredEvaluations.length > 0 ? (
                          filteredEvaluations.map((evaluation) => (
                            <tr key={evaluation.id}>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="flex-shrink-0 h-10 w-10 bg-teal-500 rounded-full flex items-center justify-center">
                                    <span className="font-medium text-white">
                                      {((evaluation.companyName || '?').charAt(0) || 'E').toUpperCase()}
                                    </span>
                                  </div>
                                  <div className="ml-4">
                                    <div className="text-sm font-medium text-white">
                                      {evaluation.companyName || 'Unnamed Company'}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-white">
                                  {evaluation.industry && evaluation.industry.length > 0 
                                    ? evaluation.industry.slice(0, 2).join(', ') + (evaluation.industry.length > 2 ? '...' : '') 
                                    : 'N/A'}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-white">{evaluation.employeeCount || 'N/A'}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                {editingEvaluation === evaluation.id ? (
                                  <div className="relative">
                                    <select
                                      value={editEvaluationStatus}
                                      onChange={(e) => setEditEvaluationStatus(e.target.value as 'new' | 'reviewing' | 'contacted' | 'completed')}
                                      className="bg-gray-800 border border-gray-700 text-white rounded-md px-3 py-1 pr-8 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                      <option value="new">New</option>
                                      <option value="reviewing">Reviewing</option>
                                      <option value="contacted">Contacted</option>
                                      <option value="completed">Completed</option>
                                    </select>
                                    <ChevronDown size={16} className="text-gray-400 absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none" />
                                  </div>
                                ) : (
                                  <StatusBadge status={evaluation.status || 'new'} />
                                )}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                                {evaluation.createdAt ? new Date(evaluation.createdAt.seconds * 1000).toLocaleDateString() : '-'}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <div className="flex justify-end space-x-2">
  {editingEvaluation === evaluation.id ? (
    <>
      <button
        onClick={() => handleUpdateEvaluationStatus(evaluation.id, editEvaluationStatus)}
        className="text-green-400 hover:text-green-300"
      >
        Save
      </button>
      <button
        onClick={() => setEditingEvaluation(null)}
        className="text-red-400 hover:text-red-300"
      >
        Cancel
      </button>
    </>
  ) : (
    <>
      <button
        onClick={() => {
          setEditingEvaluation(evaluation.id);
          setEditEvaluationStatus(evaluation.status);
        }}
        className="text-blue-400 hover:text-blue-300"
        title="Edit Status"
      >
        <Edit size={16} />
      </button>
      <button
        onClick={() => setViewingEvaluation(evaluation)}
        className="text-blue-400 hover:text-blue-300"
        title="View Details"
      >
        <MessageSquare size={16} />
      </button>
      {/* Add the download button */}
      <button
        onClick={() => downloadEvaluationJson(evaluation.id)}
        className="text-blue-400 hover:text-blue-300"
        title="Download Evaluation JSON"
        disabled={downloadingJson === evaluation.id}
      >
        {downloadingJson === evaluation.id ? (
          <RefreshCw size={16} className="animate-spin" />
        ) : (
          <Download size={16} />
        )}
      </button>
      {evaluation.pdfUrl && (
        <a
          href={evaluation.pdfUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-400 hover:text-blue-300"
          title="View PDF"
        >
          <Eye size={16} />
        </a>
      )}
    </>
  )}
</div>


                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={6} className="px-6 py-4 text-center text-gray-400">
                              No evaluation forms submitted yet
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Lead Details Modal */}
        {viewingLead && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 px-4">
            <motion.div 
              className="bg-gray-900 rounded-lg border border-gray-800 p-6 max-w-2xl w-full"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-xl font-light">Lead Details</h2>
                <button 
                  onClick={() => setViewingLead(null)}
                  className="text-gray-400 hover:text-white"
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="flex space-x-4">
                  <div className="flex-shrink-0 h-16 w-16 bg-purple-500 rounded-full flex items-center justify-center">
                    <span className="font-medium text-white text-2xl">
                      {((viewingLead.name || '?').charAt(0) || 'L').toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-xl font-medium">
                      {viewingLead.name || ''} {viewingLead.surname || ''}
                    </h3>
                    <p className="text-gray-400">{viewingLead.company || ''}</p>
                    <div className="mt-2 flex space-x-2">
                      <StatusBadge status={viewingLead.status || 'new'} />
                      {viewingLead.pricingPlan === 'freemium' && <StatusBadge status="freemium" />}
                    </div>
                  </div>
                </div>
                
                <div className="border-t border-gray-800 pt-4 mt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center">
                      <Mail size={16} className="text-gray-400 mr-2" />
                      <span className="text-gray-300">{viewingLead.email || 'No email provided'}</span>
                    </div>
                    <div className="flex items-center">
                      <Phone size={16} className="text-gray-400 mr-2" />
                      <span className="text-gray-300">{viewingLead.phone || 'No phone provided'}</span>
                    </div>
                  </div>
                </div>
                
                <div className="border-t border-gray-800 pt-4 mt-4">
                  <h4 className="text-sm font-medium text-gray-400 mb-2">Interested Plan</h4>
                  <div className="bg-gray-800 rounded-md p-3">
                    <span className="text-white capitalize">
                      {viewingLead.pricingPlan === 'freemium' 
                        ? 'Freemium Plan (28-day free access)' 
                        : (viewingLead.planId || 'No plan selected')}
                    </span>
                  </div>
                </div>
                
                {viewingLead.description && (
                  <div className="border-t border-gray-800 pt-4 mt-4">
                    <h4 className="text-sm font-medium text-gray-400 mb-2">Message</h4>
                    <div className="bg-gray-800 rounded-md p-3 min-h-[100px] whitespace-pre-wrap">
                      {viewingLead.description}
                    </div>
                  </div>
                )}
                
                <div className="border-t border-gray-800 pt-4 mt-4">
                  <h4 className="text-sm font-medium text-gray-400 mb-2">Submitted on</h4>
                  <div className="text-gray-300">
                    {viewingLead.createdAt ? new Date(viewingLead.createdAt.seconds * 1000).toLocaleString() : 'Unknown date'}
                  </div>
                </div>
                <div className="border-t border-gray-800 pt-4 mt-4 flex justify-between">
  <div className="flex space-x-2">
    <button
      onClick={() => {
        setEditingEvaluation(viewingEvaluation.id);
        setEditEvaluationStatus(viewingEvaluation.status);
        setViewingEvaluation(null);
      }}
      className="bg-blue-600 hover:bg-blue-500 text-white py-2 px-4 rounded-md text-sm"
    >
      Change Status
    </button>
    
    {/* Add download button */}
    <button
      onClick={() => downloadEvaluationJson(viewingEvaluation.id)}
      className="bg-green-600 hover:bg-green-500 text-white py-2 px-4 rounded-md text-sm flex items-center"
      disabled={downloadingJson === viewingEvaluation.id}
    >
      {downloadingJson === viewingEvaluation.id ? (
        <>
          <RefreshCw size={16} className="mr-2 animate-spin" />
          Processing...
        </>
      ) : (
        <>
          <Download size={16} className="mr-2" />
          Download JSON
        </>
      )}
    </button>
    
    {viewingEvaluation.pdfUrl && (
      <a
        href={viewingEvaluation.pdfUrl}
        target="_blank"
        rel="noopener noreferrer" 
        className="bg-purple-600 hover:bg-purple-500 text-white py-2 px-4 rounded-md text-sm flex items-center"
      >
        <Eye size={16} className="mr-2" />
        View PDF
      </a>
    )}
  </div>
  
  <button
    onClick={() => setViewingEvaluation(null)}
    className="bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded-md text-sm"
  >
    Close
  </button>
</div>
              </div>
            </motion.div>
          </div>
        )}
        
        {/* Evaluation Details Modal */}
        {viewingEvaluation && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 px-4">
            <motion.div 
              className="bg-gray-900 rounded-lg border border-gray-800 p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-xl font-light">Customer Evaluation Details</h2>
                <button 
                  onClick={() => setViewingEvaluation(null)}
                  className="text-gray-400 hover:text-white"
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-xl font-medium">{viewingEvaluation.companyName}</h3>
                    <div className="mt-2 flex space-x-2">
                      <StatusBadge status={viewingEvaluation.status || 'new'} />
                      <div className="bg-gray-800 text-gray-300 text-xs px-3 py-1 rounded-full">
                        {viewingEvaluation.employeeCount} employees
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-sm text-gray-400">
                    Submitted: {viewingEvaluation.createdAt 
                      ? new Date(viewingEvaluation.createdAt.seconds * 1000).toLocaleString() 
                      : 'Unknown date'
                    }
                  </div>
                </div>
                
                {/* Accordion for form sections */}
                <div className="mt-6 space-y-4">
                  {viewingEvaluation.formData && (
                    <>
                      <div className="border border-gray-800 rounded-lg overflow-hidden">
                        <div className="bg-gray-800 px-4 py-3 flex justify-between items-center cursor-pointer">
                          <h4 className="font-medium">1. Πληροφορίες Εταιρείας</h4>
                          <ChevronDown size={18} className="text-gray-400" />
                        </div>
                        <div className="p-4 bg-gray-900">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm text-gray-400">Επωνυμία Εταιρείας</p>
                              <p className="text-white">{viewingEvaluation.formData.companyName || '-'}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-400">Κλάδος/Εξειδίκευση</p>
                              <p className="text-white">{viewingEvaluation.formData.industry?.join(', ') || '-'}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-400">Αριθμός Εργαζομένων</p>
                              <p className="text-white">{viewingEvaluation.formData.employeeCount || '-'}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-400">Διεύθυνση Εταιρείας</p>
                              <p className="text-white">{viewingEvaluation.formData.companyAddress || '-'}</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Add more sections as needed - similar pattern for each section */}
                      {/* For brevity, I'm just showing one section, but you would repeat this pattern for all 10 sections */}
                    </>
                  )}
                </div>
                
                <div className="border-t border-gray-800 pt-4 mt-4 flex justify-between">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        setEditingEvaluation(viewingEvaluation.id);
                        setEditEvaluationStatus(viewingEvaluation.status);
                        setViewingEvaluation(null);
                      }}
                      className="bg-blue-600 hover:bg-blue-500 text-white py-2 px-4 rounded-md text-sm"
                    >
                      Change Status
                    </button>
                    
                    {viewingEvaluation.pdfUrl && (
                      <a
                        href={viewingEvaluation.pdfUrl}
                        target="_blank"
                        rel="noopener noreferrer" 
                        className="bg-green-600 hover:bg-green-500 text-white py-2 px-4 rounded-md text-sm flex items-center"
                      >
                        <Download size={16} className="mr-2" />
                        View PDF
                      </a>
                    )}
                  </div>
                  
                  <button
                    onClick={() => setViewingEvaluation(null)}
                    className="bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded-md text-sm"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </PageTransitionWrapper>
  );
}