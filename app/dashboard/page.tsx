"use client"

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { PageTransitionWrapper } from '@/components/page-transition';
import { 
  ChevronDown, User, BarChart2, Map, Calendar, Settings, 
  LogOut, Menu, X, PlusCircle, MessageSquare, 
  Clock, CheckCircle, XCircle, Send, RefreshCw, Filter 
} from 'lucide-react';
import { collection, addDoc, query, where, orderBy, onSnapshot, serverTimestamp, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

// Type definitions
interface UserType {
  email?: string;
  // Add other user properties as needed
}

interface Message {
  id?: string;
  sender: string;
  content: string;
  timestamp: Date | any;
  isAdmin: boolean;
}

interface Ticket {
  id: string;
  subject: string;
  status: 'open' | 'closed';
  createdAt: Date | any;
  lastUpdate: Date | any;
  messages: Message[];
  userId: string;
}

interface AuthContextType {
  user: UserType | null;
  loading: boolean;
  logout: () => void;
}

// Component props interfaces
interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
  logout: () => void;
}

interface TicketListProps {
  tickets: Ticket[];
  selectedTicket: Ticket | null;
  selectTicket: (ticket: Ticket) => void;
  isLoading: boolean;
}

interface TicketDetailProps {
  ticket: Ticket | null;
  sendMessage: (content: string) => Promise<void>;
  closeTicket: () => Promise<void>;
  user: UserType | null;
}

interface NewTicketFormProps {
  onCreate: (subject: string, message: string) => Promise<void>;
  isSubmitting: boolean;
}

// Sidebar navigation component
// Update the Sidebar component in your dashboard.tsx file

const Sidebar = ({ isOpen, toggleSidebar, logout }: SidebarProps) => {
    // Change the navItems to all point to dashboard for now
    const navItems = [
      { icon: BarChart2, label: 'Dashboard', href: '/dashboard', active: true },
      // Commented items are placeholders - uncomment when these features are ready
      // { icon: Map, label: 'Projects', href: '/dashboard/projects', active: false },
      // { icon: Calendar, label: 'Schedule', href: '/dashboard/schedule', active: false },
      // { icon: Settings, label: 'Settings', href: '/dashboard/settings', active: false },
      { icon: MessageSquare, label: 'Support Tickets', href: '/dashboard', active: false },
    ];
  
    return (
      <>
        {/* Mobile overlay */}
        {isOpen && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={toggleSidebar}
          />
        )}
        
        {/* Sidebar */}
        <motion.aside
          className={`fixed inset-y-0 left-0 z-50 w-64 bg-gray-900 border-r border-gray-800 transform ${
            isOpen ? 'translate-x-0' : '-translate-x-full'
          } md:translate-x-0 transition-transform duration-300 ease-in-out`}
          initial={{ x: -64 }}
          animate={{ x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between p-4 border-b border-gray-800">
              <Link href="/" className="flex items-center space-x-2">
                <div className="text-xl font-bold text-white">
                  <span className="font-light">Field</span>X
                </div>
              </Link>
              <button
                className="md:hidden text-gray-400 hover:text-white"
                onClick={toggleSidebar}
              >
                <X size={20} />
              </button>
            </div>
            
            <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
              {navItems.map((item) => (
                <Link href={item.href} key={item.label}>
                  <motion.div
                    className={`flex items-center px-3 py-3 text-gray-300 rounded-md hover:bg-gray-800 hover:text-white transition-colors group ${
                      item.active ? 'bg-gray-800 text-white' : ''
                    }`}
                    whileHover={{ x: 5 }}
                  >
                    <item.icon size={18} className="mr-3" />
                    <span>{item.label}</span>
                  </motion.div>
                </Link>
              ))}
            </nav>
            
            <div className="p-4 border-t border-gray-800">
              <motion.button
                onClick={logout}
                className="flex items-center w-full px-3 py-3 text-gray-300 rounded-md hover:bg-gray-800 hover:text-white transition-colors"
                whileHover={{ x: 5 }}
              >
                <LogOut size={18} className="mr-3" />
                <span>Log out</span>
              </motion.button>
            </div>
          </div>
        </motion.aside>
      </>
    );
  };

// Ticket list component
const TicketList = ({ tickets, selectedTicket, selectTicket, isLoading }: TicketListProps) => {
  const [filter, setFilter] = useState<'all' | 'open' | 'closed'>('all');
  
  const filteredTickets = tickets.filter(ticket => {
    if (filter === 'all') return true;
    return ticket.status === filter;
  });

  return (
    <div className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden">
      <div className="p-4 border-b border-gray-800 flex justify-between items-center">
        <h3 className="text-lg font-light">Your Tickets</h3>
        <div className="flex items-center space-x-2">
          <select 
            className="bg-gray-800 border border-gray-700 rounded-md text-sm p-1.5 text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={filter}
            onChange={(e) => setFilter(e.target.value as 'all' | 'open' | 'closed')}
          >
            <option value="all">All Tickets</option>
            <option value="open">Open</option>
            <option value="closed">Closed</option>
          </select>
          <Filter size={16} className="text-gray-400" />
        </div>
      </div>
      
      <div className="max-h-[500px] overflow-y-auto">
        {isLoading ? (
          <div className="p-8 flex justify-center">
            <RefreshCw size={24} className="text-blue-400 animate-spin" />
          </div>
        ) : filteredTickets.length === 0 ? (
          <div className="p-8 text-center text-gray-400">
            <MessageSquare size={32} className="mx-auto mb-3 opacity-30" />
            <p>No tickets found</p>
            <p className="text-sm mt-1">Create a new ticket to get help</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-800">
            {filteredTickets.map((ticket) => (
              <motion.div 
                key={ticket.id}
                className={`p-4 cursor-pointer hover:bg-gray-800 transition-colors ${
                  selectedTicket?.id === ticket.id ? 'bg-gray-800 border-l-4 border-blue-500' : ''
                }`}
                onClick={() => selectTicket(ticket)}
                whileHover={{ x: 5 }}
              >
                <div className="flex justify-between mb-2">
                  <h4 className="font-medium text-gray-200 truncate max-w-[70%]">{ticket.subject}</h4>
                  <span className={`text-xs py-1 px-2 rounded-full ${
                    ticket.status === 'open' 
                      ? 'bg-green-500/20 text-green-400' 
                      : 'bg-gray-600/20 text-gray-400'
                  }`}>
                    {ticket.status === 'open' ? 'Open' : 'Closed'}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs text-gray-400">
                  <div className="flex items-center">
                    <MessageSquare size={12} className="mr-1" />
                    <span>{ticket.messages.length} messages</span>
                  </div>
                  <span>
                    {ticket.lastUpdate ? new Date(ticket.lastUpdate.seconds * 1000).toLocaleDateString() : '-'}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// New ticket form
const NewTicketForm = ({ onCreate, isSubmitting }: NewTicketFormProps) => {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState<{subject?: string, message?: string}>({});

  const validateForm = () => {
    const newErrors: {subject?: string, message?: string} = {};
    if (!subject.trim()) newErrors.subject = 'Subject is required';
    if (!message.trim()) newErrors.message = 'Message is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      await onCreate(subject, message);
      setSubject('');
      setMessage('');
    }
  };

  return (
    <div className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden">
      <div className="p-4 border-b border-gray-800">
        <h3 className="text-lg font-light">Create New Ticket</h3>
      </div>
      
      <form onSubmit={handleSubmit} className="p-4">
        <div className="mb-4">
          <label htmlFor="subject" className="block text-sm font-medium text-gray-300 mb-2">
            Subject <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            id="subject"
            value={subject}
            onChange={(e) => {
              setSubject(e.target.value);
              if (errors.subject) setErrors({...errors, subject: undefined});
            }}
            className={`bg-gray-800 border ${errors.subject ? 'border-red-400' : 'border-gray-700'} rounded-md py-2 px-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-500`}
            placeholder="How can we help you?"
          />
          {errors.subject && <p className="mt-1 text-sm text-red-400">{errors.subject}</p>}
        </div>
        
        <div className="mb-4">
          <label htmlFor="message" className="block text-sm font-medium text-gray-300 mb-2">
            Message <span className="text-red-400">*</span>
          </label>
          <textarea
            id="message"
            value={message}
            onChange={(e) => {
              setMessage(e.target.value);
              if (errors.message) setErrors({...errors, message: undefined});
            }}
            rows={4}
            className={`bg-gray-800 border ${errors.message ? 'border-red-400' : 'border-gray-700'} rounded-md py-2 px-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-500`}
            placeholder="Describe your issue in detail..."
          />
          {errors.message && <p className="mt-1 text-sm text-red-400">{errors.message}</p>}
        </div>
        
        <motion.button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-blue-600 hover:bg-blue-500 text-white py-2 px-4 rounded-md font-medium transition-colors flex items-center justify-center"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {isSubmitting ? (
            <span className="flex items-center">
              <RefreshCw size={18} className="animate-spin mr-2" />
              Submitting...
            </span>
          ) : (
            <>
              Create Ticket
              <PlusCircle size={18} className="ml-2" />
            </>
          )}
        </motion.button>
      </form>
    </div>
  );
};

// Ticket detail component
const TicketDetail = ({ ticket, sendMessage, closeTicket, user }: TicketDetailProps) => {
  const [newMessage, setNewMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollToBottom();
  }, [ticket?.messages.length]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    
    setIsSubmitting(true);
    try {
      await sendMessage(newMessage);
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseTicket = async () => {
    if (window.confirm('Are you sure you want to close this ticket?')) {
      await closeTicket();
    }
  };

  if (!ticket) {
    return (
      <div className="bg-gray-900 rounded-lg border border-gray-800 h-full flex items-center justify-center p-8">
        <div className="text-center">
          <MessageSquare size={48} className="mx-auto mb-4 text-gray-600" />
          <h3 className="text-xl font-light mb-2">No Ticket Selected</h3>
          <p className="text-gray-400 text-sm">
            Select a ticket from the list or create a new one to get started.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 rounded-lg border border-gray-800 flex flex-col h-full">
      <div className="p-4 border-b border-gray-800 flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium">{ticket.subject}</h3>
          <div className="text-xs text-gray-400 mt-1">
            Created on {new Date(ticket.createdAt.seconds * 1000).toLocaleString()}
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <span className={`text-xs py-1 px-2 rounded-full ${
            ticket.status === 'open' 
              ? 'bg-green-500/20 text-green-400' 
              : 'bg-gray-600/20 text-gray-400'
          }`}>
            {ticket.status === 'open' ? 'Open' : 'Closed'}
          </span>
          {ticket.status === 'open' && (
            <motion.button
              onClick={handleCloseTicket}
              className="text-xs bg-red-500/10 hover:bg-red-500/20 text-red-400 py-1 px-2 rounded-md transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Close Ticket
            </motion.button>
          )}
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {ticket.messages.map((message, index) => (
          <div 
            key={message.id || index}
            className={`flex ${message.isAdmin ? 'justify-start' : 'justify-end'}`}
          >
            <div className={`max-w-[80%] ${
              message.isAdmin 
                ? 'bg-gray-800 text-gray-300' 
                : 'bg-blue-600 text-white'
              } rounded-lg p-3`}
            >
              <div className="flex items-center mb-1">
                <span className="text-xs font-medium">
                  {message.isAdmin ? 'Support Agent' : 'You'}
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
      
      {ticket.status === 'open' ? (
        <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-800 flex items-end">
          <textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className="bg-gray-800 border border-gray-700 rounded-md py-2 px-3 flex-1 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            rows={3}
          />
          <motion.button
            type="submit"
            disabled={isSubmitting || !newMessage.trim()}
            className="ml-3 bg-blue-600 hover:bg-blue-500 text-white p-3 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {isSubmitting ? (
              <RefreshCw size={20} className="animate-spin" />
            ) : (
              <Send size={20} />
            )}
          </motion.button>
        </form>
      ) : (
        <div className="p-4 border-t border-gray-800 bg-gray-800/50 text-center text-gray-400 text-sm">
          This ticket is closed. You cannot send more messages.
        </div>
      )}
    </div>
  );
};

export default function Dashboard() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreatingTicket, setIsCreatingTicket] = useState(false);
  const [showNewTicketForm, setShowNewTicketForm] = useState(false);
  
  const { user, loading, logout } = useAuth() as AuthContextType;
  const router = useRouter();

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Check if user is logged in
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login?redirect=dashboard');
    }
  }, [user, loading, router]);

  // Fetch tickets from Firestore
  useEffect(() => {
    if (!user?.email) return;

    setIsLoading(true);
    const ticketsRef = collection(db, 'tickets');
    const q = query(
      ticketsRef,
      where('userId', '==', user.email),
      orderBy('lastUpdate', 'desc')
    );

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
      
      // Update selected ticket if it's in the list
      if (selectedTicket) {
        const updatedSelectedTicket = fetchedTickets.find(t => t.id === selectedTicket.id);
        if (updatedSelectedTicket) {
          setSelectedTicket(updatedSelectedTicket);
        }
      }
      
      setIsLoading(false);
    }, (error) => {
      console.error("Error fetching tickets:", error);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [user, selectedTicket]);

// Fix for the ticket creation function in dashboard.tsx
// Replace your current createTicket function with this one:

const createTicket = async (subject: string, message: string) => {
    if (!user?.email) return;
    
    try {
      setIsCreatingTicket(true);
      
      // Create a regular timestamp instead of serverTimestamp for the messages array
      const now = new Date();
      const firestoreTimestamp = {
        seconds: Math.floor(now.getTime() / 1000),
        nanoseconds: now.getMilliseconds() * 1000000
      };
      
      const newTicket = {
        subject,
        status: 'open',
        createdAt: serverTimestamp(), // This is fine outside of arrays
        lastUpdate: serverTimestamp(), // This is fine outside of arrays
        userId: user.email,
        messages: [{
          sender: user.email,
          content: message,
          timestamp: firestoreTimestamp, // Use regular timestamp object for arrays
          isAdmin: false
        }]
      };
      
      const docRef = await addDoc(collection(db, 'tickets'), newTicket);
      setShowNewTicketForm(false);
      
    } catch (error) {
      console.error('Error creating ticket:', error);
      alert('Failed to create ticket. Please try again.');
    } finally {
      setIsCreatingTicket(false);
    }
  };
  
  // Similarly, update your sendMessage function:
  const sendMessage = async (content: string) => {
    if (!selectedTicket || !user?.email) return;
    
    try {
      const ticketRef = doc(db, 'tickets', selectedTicket.id);
      
      // Create a regular timestamp for the message
      const now = new Date();
      const firestoreTimestamp = {
        seconds: Math.floor(now.getTime() / 1000),
        nanoseconds: now.getMilliseconds() * 1000000
      };
      
      const newMessage = {
        sender: user.email,
        content,
        timestamp: firestoreTimestamp, // Use regular timestamp object
        isAdmin: false
      };
      
      // Add the new message to the messages array
      await updateDoc(ticketRef, {
        messages: [...selectedTicket.messages, newMessage],
        lastUpdate: serverTimestamp() // This is fine outside arrays
      });
      
      // The ticket will be updated by the onSnapshot listener
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  };

  const closeTicket = async () => {
    if (!selectedTicket) return;
    
    try {
      const ticketRef = doc(db, 'tickets', selectedTicket.id);
      await updateDoc(ticketRef, {
        status: 'closed',
        lastUpdate: serverTimestamp()
      });
      
      // The ticket will be updated by the onSnapshot listener
    } catch (error) {
      console.error('Error closing ticket:', error);
      alert('Failed to close ticket. Please try again.');
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
      <div className="min-h-screen bg-black text-white flex flex-col">
        {/* Header */}
        <header className="bg-gray-900 border-b border-gray-800 py-4 px-6 flex items-center justify-between md:pl-64">
          <button
            className="md:hidden text-gray-400 hover:text-white focus:outline-none"
            onClick={toggleSidebar}
          >
            <Menu size={24} />
          </button>
          
          <div className="ml-auto flex items-center space-x-4">
            <div className="relative">
              <button className="flex items-center space-x-2 text-sm">
                <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
                  <span className="font-medium">{user?.email?.charAt(0).toUpperCase() || 'U'}</span>
                </div>
                <span className="hidden md:inline-block">{user?.email || 'User'}</span>
              </button>
            </div>
          </div>
        </header>
        
        {/* Sidebar */}
        <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} logout={logout} />
        
        {/* Main content */}
        <main className="flex-1 md:ml-64 p-6">
          <div className="mb-8 flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-light">Support Tickets</h1>
              <p className="text-gray-400 mt-2">Manage your support tickets and get help from our team</p>
            </div>
            
            <motion.button
              onClick={() => setShowNewTicketForm(!showNewTicketForm)}
              className="bg-blue-600 hover:bg-blue-500 text-white py-2 px-4 rounded-md font-medium transition-colors flex items-center"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {showNewTicketForm ? 'Cancel' : 'New Ticket'}
              {!showNewTicketForm && <PlusCircle size={18} className="ml-2" />}
            </motion.button>
          </div>
          
          {showNewTicketForm ? (
            <div className="mb-8">
              <NewTicketForm
                onCreate={createTicket}
                isSubmitting={isCreatingTicket}
              />
            </div>
          ) : (
            <div className="mb-4 md:mb-8">
              {user?.email === 'garvanitis@applink.gr' && (
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-md p-4 mb-6">
                  <p className="text-blue-400 text-sm">
                    <span className="font-medium">Developer Account:</span> You are currently logged in as the administrator test account.
                  </p>
                </div>
              )}
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <TicketList
              tickets={tickets}
              selectedTicket={selectedTicket}
              selectTicket={setSelectedTicket}
              isLoading={isLoading}
            />
            
            <TicketDetail
              ticket={selectedTicket}
              sendMessage={sendMessage}
              closeTicket={closeTicket}
              user={user}
            />
          </div>
        </main>
      </div>
    </PageTransitionWrapper>
  );
}