// File: app/api/submit-inquiry/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface InquiryData {
  email: string;
  name: string;
  surname: string;
  company: string;
  phone: string;
  description?: string;
}

interface ApiResponse {
  success: boolean;
  message: string;
}

export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse>> {
  try {
    // Parse the request body
    const data: InquiryData = await request.json();
    
    // Validate required fields
    const requiredFields: (keyof InquiryData)[] = ['email', 'name', 'surname', 'company', 'phone'];
    
    for (const field of requiredFields) {
      if (!data[field]) {
        return NextResponse.json(
          { success: false, message: `Field '${field}' is required` },
          { status: 400 }
        );
      }
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      return NextResponse.json(
        { success: false, message: 'Invalid email format' },
        { status: 400 }
      );
    }
    
    // Create new inquiry in Firestore
    const inquiriesCollection = collection(db, "inquiries");
    
    const docRef = await addDoc(inquiriesCollection, {
      email: data.email,
      name: data.name,
      surname: data.surname,
      company: data.company,
      phone: data.phone,
      description: data.description || '',
      status: 'new',
      createdAt: serverTimestamp()
    });
    
    console.log('New inquiry submitted with ID:', docRef.id);
    
    // Return success response
    return NextResponse.json(
      { 
        success: true, 
        message: 'Thank you for your inquiry! Our team will contact you shortly.' 
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error processing inquiry:', error);
    
    // Return error response
    return NextResponse.json(
      { 
        success: false, 
        message: 'An error occurred while processing your inquiry. Please try again later.' 
      },
      { status: 500 }
    );
  }
}