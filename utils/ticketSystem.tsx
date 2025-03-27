"use client"

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { 
  MessageSquare, CheckCircle, XCircle, Send, RefreshCw, 
  Filter, PlusCircle 
} from 'lucide-react';
import { 
  collection, addDoc, query, where, orderBy, onSnapshot, 
  serverTimestamp, doc, updateDoc, getDocs 
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useToasts } from './notifications';

// Type definitions
export interface UserType {
  email?: string;
}

export interface Message {
  id?: string;
  sender: string;
  content: string;
  timestamp: Date | any;
  isAdmin: boolean;
}

export interface Ticket {
  id: string;
  subject: string;
  status: 'open' | 'closed';
  createdAt: Date | any;
  lastUpdate: Date | any;
  messages: Message[];
  userId: string;
}

export interface TicketListProps {
  tickets: Ticket[];
  selectedTicket: Ticket | null;
  selectTicket: (ticket: Ticket) => void;
  isLoading: boolean;
}

export interface TicketDetailProps {
  ticket: Ticket | null;
  sendMessage: (content: string) => Promise<void>;
  closeTicket: () => Promise<void>;
  user: UserType | null;
}

export interface NewTicketFormProps {
  onCreate: (subject: string, message: string) => Promise<void>;
  isSubmitting: boolean;
}

export function useTicketSystem(user: UserType | null) {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreatingTicket, setIsCreatingTicket] = useState(false);
  const selectedTicketId = useRef<string | null>(null);
  const toast = useToasts();
  
  const handleError = useCallback((error: any) => {
    console.error("Error fetching tickets:", error);
    toast.error('Failed to load tickets', error.message);
    setIsLoading(false);
  }, [toast]);

  const processTickets = useCallback((snapshot: any) => {
    const fetchedTickets = snapshot.docs.map((doc: any) => {
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
    return fetchedTickets;
  }, []);

  useEffect(() => {
    if (!user?.email) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const ticketsRef = collection(db, 'tickets');
    const q = query(
      ticketsRef,
      where('userId', '==', user.email),
      orderBy('lastUpdate', 'desc')
    );

    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        const newTickets = processTickets(snapshot);
        setTickets(newTickets);
        setIsLoading(false);
      }, 
      handleError
    );

    return () => unsubscribe();
  }, [user?.email, processTickets, handleError]);

  useEffect(() => {
    if (selectedTicketId.current && tickets.length > 0) {
      const updatedTicket = tickets.find(t => t.id === selectedTicketId.current);
      setSelectedTicket(updatedTicket || null);
      if (!updatedTicket) selectedTicketId.current = null;
    }
  }, [tickets]);

  const selectTicket = useCallback((ticket: Ticket | null) => {
    selectedTicketId.current = ticket?.id || null;
    setSelectedTicket(ticket);
  }, []);

  const createTicket = useCallback(async (subject: string, message: string) => {
    if (!user?.email) return;
    
    return toast.promiseToast(
      (async () => {
        setIsCreatingTicket(true);
        try {
          const now = new Date();
          const firestoreTimestamp = {
            seconds: Math.floor(now.getTime() / 1000),
            nanoseconds: now.getMilliseconds() * 1000000
          };
          
          const newTicket = {
            subject,
            status: 'open',
            createdAt: serverTimestamp(),
            lastUpdate: serverTimestamp(),
            userId: user.email,
            messages: [{
              sender: user.email,
              content: message,
              timestamp: firestoreTimestamp,
              isAdmin: false
            }]
          };
          
          const docRef = await addDoc(collection(db, 'tickets'), newTicket);
          return docRef.id;
        } finally {
          setIsCreatingTicket(false);
        }
      })(),
      {
        loading: 'Creating your ticket...',
        success: 'Ticket created successfully!',
        error: (err) => `Failed to create ticket: ${err.message || 'Unknown error'}`
      }
    );
  }, [user, toast]);
  
  const sendMessage = useCallback(async (content: string) => {
    if (!selectedTicket || !user?.email) return;
    
    return toast.promiseToast(
      (async () => {
        const ticketRef = doc(db, 'tickets', selectedTicket.id);
        const now = new Date();
        const firestoreTimestamp = {
          seconds: Math.floor(now.getTime() / 1000),
          nanoseconds: now.getMilliseconds() * 1000000
        };
        
        const newMessage = {
          sender: user.email,
          content,
          timestamp: firestoreTimestamp,
          isAdmin: false
        };
        
        await updateDoc(ticketRef, {
          messages: [...selectedTicket.messages, newMessage],
          lastUpdate: serverTimestamp()
        });
        return true;
      })(),
      {
        loading: 'Sending message...',
        success: 'Message sent!',
        error: (err) => `Failed to send message: ${err.message || 'Unknown error'}`
      }
    );
  }, [selectedTicket, user, toast]);

  const closeTicket = useCallback(async () => {
    if (!selectedTicket) return;
    
    return toast.promiseToast(
      (async () => {
        const ticketRef = doc(db, 'tickets', selectedTicket.id);
        await updateDoc(ticketRef, {
          status: 'closed',
          lastUpdate: serverTimestamp()
        });
        return true;
      })(),
      {
        loading: 'Closing ticket...',
        success: 'Ticket closed successfully',
        error: (err) => `Failed to close ticket: ${err.message || 'Unknown error'}`
      }
    );
  }, [selectedTicket, toast]);

  return {
    tickets,
    selectedTicket,
    setSelectedTicket: selectTicket,
    isLoading,
    isCreatingTicket,
    createTicket,
    sendMessage,
    closeTicket
  };
}

// Rest of the components (TicketList, NewTicketForm, TicketDetail) remain unchanged
export function TicketList({ tickets, selectedTicket, selectTicket, isLoading }: TicketListProps) {
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
}

export function NewTicketForm({ onCreate, isSubmitting }: NewTicketFormProps) {
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
}

export function TicketDetail({ ticket, sendMessage, closeTicket, user }: TicketDetailProps) {
  const [newMessage, setNewMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [ticket?.messages.length]);

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
}