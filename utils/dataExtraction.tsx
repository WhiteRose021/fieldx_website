"use client"

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Download, RefreshCw, Lock } from 'lucide-react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { UserType } from './ticketSystem';

// Component props interfaces
export interface DataExtractionButtonProps {
  user: UserType | null;
}

export interface PrivacyPanelProps {
  user: UserType | null;
}

// Helper function to fetch user data
export async function fetchUserData(user: UserType | null) {
  if (!user?.email) return null;

  try {
    // 1. Get tickets data
    const ticketsRef = collection(db, 'tickets');
    const q = query(
      ticketsRef,
      where('userId', '==', user.email)
    );
    const ticketDocs = await getDocs(q);
    const tickets = ticketDocs.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // 2. Get any cookie consent data
    let cookiePreferences = {};
    if (typeof window !== 'undefined') {
      try {
        const savedPreferences = localStorage.getItem('cookiePreferences');
        if (savedPreferences) {
          cookiePreferences = JSON.parse(savedPreferences);
        }
      } catch (e) {
        console.error('Error parsing cookie preferences', e);
      }
    }

    // 3. Return the user data
    return {
      email: user.email,
      tickets: tickets,
      cookiePreferences: cookiePreferences,
      exportDate: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Error fetching user data:', error);
    throw error;
  }
}

// PDF Generation function
export function generatePDF(userData: any) {
  // Create a new PDF document
  const doc = new jsPDF();
  
  // Add title
  doc.setFontSize(20);
  doc.text('FieldX User Data Export', 14, 22);
  
  // Add export info
  doc.setFontSize(12);
  doc.text(`User: ${userData.email}`, 14, 32);
  doc.text(`Export Date: ${new Date(userData.exportDate).toLocaleString()}`, 14, 39);
  
  // Add cookie preferences section
  doc.setFontSize(16);
  doc.text('Cookie Preferences', 14, 50);
  
  let currentY = 55;
  
  const cookiePrefs = userData.cookiePreferences;
  if (Object.keys(cookiePrefs).length > 0) {
    const cookieData = Object.keys(cookiePrefs).map(key => [
      key.charAt(0).toUpperCase() + key.slice(1),
      cookiePrefs[key] ? 'Enabled' : 'Disabled'
    ]);
    
    autoTable(doc, {
      startY: currentY,
      head: [['Category', 'Status']],
      body: cookieData,
      theme: 'grid',
      headStyles: { fillColor: [59, 130, 246] }
    });
    
    currentY = (doc as any).lastAutoTable.finalY + 15;
  } else {
    doc.text('No cookie preferences saved', 14, currentY);
    currentY += 15;
  }
  
  // Add tickets section
  doc.setFontSize(16);
  doc.text('Support Tickets', 14, currentY);
  currentY += 5;
  
  if (userData.tickets.length > 0) {
    const ticketData = userData.tickets.map((ticket: any) => [
      ticket.id.slice(0, 8) + '...',
      ticket.subject,
      ticket.status,
      new Date(ticket.createdAt.seconds * 1000).toLocaleDateString(),
      ticket.messages ? ticket.messages.length : 0
    ]);
    
    autoTable(doc, {
      startY: currentY + 5,
      head: [['ID', 'Subject', 'Status', 'Created', 'Messages']],
      body: ticketData,
      theme: 'grid',
      headStyles: { fillColor: [59, 130, 246] }
    });
    
    // Add detail for each ticket
    currentY = (doc as any).lastAutoTable.finalY + 15;
    
    userData.tickets.forEach((ticket: any, index: number) => {
      // Check if we need a new page
      if (currentY > 250) {
        doc.addPage();
        currentY = 20;
      }
      
      doc.setFontSize(14);
      doc.text(`Ticket: ${ticket.subject}`, 14, currentY);
      currentY += 7;
      
      doc.setFontSize(12);
      doc.text(`Status: ${ticket.status}`, 14, currentY);
      currentY += 10;
      
      // Add messages table
      if (ticket.messages && ticket.messages.length > 0) {
        const messageData = ticket.messages.map((msg: any) => [
          msg.isAdmin ? 'Support' : 'You',
          msg.content.length > 40 ? msg.content.substring(0, 40) + '...' : msg.content,
          msg.timestamp && msg.timestamp.seconds ? 
            new Date(msg.timestamp.seconds * 1000).toLocaleString() : '-'
        ]);
        
        autoTable(doc, {
          startY: currentY,
          head: [['Sender', 'Message', 'Time']],
          body: messageData,
          theme: 'grid',
          headStyles: { fillColor: [59, 130, 246] }
        });
        
        currentY = (doc as any).lastAutoTable.finalY + 15;
      } else {
        doc.text('No messages', 14, currentY);
        currentY += 10;
      }
      
      // Add separator
      if (index < userData.tickets.length - 1) {
        doc.setDrawColor(200, 200, 200);
        doc.line(14, currentY - 5, 196, currentY - 5);
        currentY += 5;
      }
    });
  } else {
    doc.text('No tickets found', 14, currentY + 5);
    currentY += 15;
  }
  
  // Add privacy notice
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text('This document contains all data stored about you by FieldX. If you wish to delete your data,', 14, currentY + 10);
  doc.text('please contact us at privacy@fieldx.gr', 14, currentY + 15);
  
  // Save the PDF
  doc.save(`FieldX_User_Data_${userData.email.split('@')[0]}_${new Date().toISOString().slice(0,10)}.pdf`);
}

// Data extraction button component
export function DataExtractionButton({ user }: DataExtractionButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const extractUserData = async () => {
    if (!user?.email) return;
    
    setIsLoading(true);
    try {
      const userData = await fetchUserData(user);
      if (userData) {
        generatePDF(userData);
      }
    } catch (error) {
      console.error('Error extracting user data:', error);
      alert('Failed to extract user data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.button
      onClick={extractUserData}
      disabled={isLoading}
      className="bg-green-600 hover:bg-green-500 text-white py-2 px-4 rounded-md font-medium transition-colors flex items-center"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      {isLoading ? (
        <span className="flex items-center">
          <RefreshCw size={18} className="animate-spin mr-2" />
          Exporting...
        </span>
      ) : (
        <>
          Download My Data
          <Download size={18} className="ml-2" />
        </>
      )}
    </motion.button>
  );
}

// Privacy Panel component
export function PrivacyPanel({ user }: PrivacyPanelProps) {
  return (
    <div className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden">
      <div className="p-4 border-b border-gray-800 flex justify-between items-center">
        <div className="flex items-center">
          <Lock size={20} className="text-green-400 mr-2" />
          <h3 className="text-lg font-light">Your Privacy</h3>
        </div>
      </div>
      
      <div className="p-6">
        <p className="text-gray-300 mb-6">
          At FieldX, we value your privacy. You can download all the data we store about you, 
          including your support tickets and cookie preferences. This data is provided in PDF format.
        </p>
        
        <div className="flex justify-center">
          <DataExtractionButton user={user} />
        </div>
        
        <div className="mt-6 text-xs text-gray-500 text-center">
          In accordance with GDPR and our <Link href="/privacy-policy" className="text-blue-400 hover:underline">Privacy Policy</Link>,
          you have the right to access, modify, and delete your personal data.
        </div>
      </div>
    </div>
  );
}