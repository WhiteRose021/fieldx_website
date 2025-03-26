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
  ChevronDown, Phone, Mail, MessageSquare, X, Send, RefreshCw, Filter 
} from 'lucide-react';
import { JSX } from 'react/jsx-runtime';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, where, serverTimestamp } from 'firebase/firestore';
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
  const [activeTab, setActiveTab] = useState<'users' | 'leads' | 'tickets'>('users');
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

  // Load all users and leads data
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

  // Send a message to a ticket
  const sendAdminMessage = async (ticketId: string, content: string) => {
    if (!user?.email || !content.trim()) return;
    
    try {
      const ticketRef = doc(db, 'tickets', ticketId);
      const now = serverTimestamp();
      
      const newMessage = {
        sender: user.email,
        content,
        timestamp: now,
        isAdmin: true
      };
      
      // Add the new message to the messages array
      await updateDoc(ticketRef, {
        messages: [...(selectedTicket?.messages || []), newMessage],
        lastUpdate: now
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

  // Filter leads based on search query
  const filteredLeads = leads.filter(lead => {
    if (!lead) return false;
    
    const email = lead.email || '';
    const name = lead.name || '';
    const company = lead.company || '';
    
    return (
      email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      company.toLowerCase().includes(searchQuery.toLowerCase())
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
      open: 'bg-green-500/20 text-green-400'
    };
    
    const statusIcons: Record<string, JSX.Element> = {
      active: <CheckCircle size={16} className="mr-2" />,
      awaiting: <Clock size={16} className="mr-2" />,
      declined: <XCircle size={16} className="mr-2" />,
      new: <CheckCircle size={16} className="mr-2" />,
      contacted: <User size={16} className="mr-2" />,
      converted: <CheckCircle size={16} className="mr-2" />,
      closed: <XCircle size={16} className="mr-2" />,
      open: <CheckCircle size={16} className="mr-2" />
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
                              <div className="text-sm text-white capitalize">{lead.planId || ''}</div>
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
                                    >
                                      <Edit size={16} />
                                    </button>
                                    <button
                                      onClick={() => setViewingLead(lead)}
                                      className="text-blue-400 hover:text-blue-300 ml-2"
                                    >
                                      <MessageSquare size={16} />
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
                            {searchQuery ? 'No leads found matching your search' : 'No leads found'}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
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
                    <div className="mt-2">
                      <StatusBadge status={viewingLead.status || 'new'} />
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
                    <span className="text-white capitalize">{viewingLead.planId || 'No plan selected'}</span>
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
                  <button
                    onClick={() => {
                      setEditingLead(viewingLead.id);
                      setEditLeadStatus(viewingLead.status);
                      setViewingLead(null);
                    }}
                    className="bg-blue-600 hover:bg-blue-500 text-white py-2 px-4 rounded-md text-sm"
                  >
                    Change Status
                  </button>
                  
                  <button
                    onClick={() => setViewingLead(null)}
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