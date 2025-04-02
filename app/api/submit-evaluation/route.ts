// File: app/api/submit-evaluation/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const data = await request.json();
    
    // Basic validation
    if (!data.companyName) {
      return NextResponse.json(
        { success: false, message: 'Company name is required' },
        { status: 400 }
      );
    }
    
    // Log the data received
    console.log('Received evaluation data:', data.companyName);
    
    // Create a record in Firestore
    const evaluationsCollection = collection(db, "evaluations");
    
    const docRef = await addDoc(evaluationsCollection, {
      companyName: data.companyName,
      industry: data.industry || [],
      employeeCount: data.employeeCount || '',
      status: 'new',
      createdAt: serverTimestamp(),
      formData: data // Store all data in a nested object
    });
    
    console.log('New evaluation submitted with ID:', docRef.id);
    
    // Return success response
    return NextResponse.json(
      { 
        success: true, 
        message: 'Evaluation form submitted successfully',
        evaluationId: docRef.id
      },
      { status: 200 }
    );
  } catch (error) {
    // Log the actual error for debugging
    console.error('Error processing evaluation form:', error);
    
    // Return error response
    return NextResponse.json(
      { 
        success: false, 
        message: 'An error occurred while processing your evaluation form'
      },
      { status: 500 }
    );
  }
}