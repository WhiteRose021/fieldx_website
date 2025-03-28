// File: app/api/submit-inquiry/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { promises as fs } from 'fs';
import path from 'path';

interface InquiryData {
  email: string;
  name: string;
  surname: string;
  company: string;
  phone: string;
  description?: string;
  pricingPlan: string;
}

interface ApiResponse {
  success: boolean;
  message: string;
  fileCreated?: boolean;
  filePath?: string;
}

export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse>> {
  try {
    // Parse the request body
    const data: InquiryData = await request.json();
    
    // Validate required fields
    const requiredFields: (keyof InquiryData)[] = ['email', 'name', 'surname', 'company', 'phone', 'pricingPlan'];
    
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
    
    // Ensure pricing plan is freemium (extra validation)
    if (data.pricingPlan.toLowerCase() !== 'freemium') {
      return NextResponse.json(
        { success: false, message: 'Only Freemium plan is available at this time' },
        { status: 400 }
      );
    }
    
    // Create new inquiry in Firestore
    const inquiriesCollection = collection(db, "inquiries");
    
    const timestamp = new Date().toISOString();
    
    const docRef = await addDoc(inquiriesCollection, {
      email: data.email,
      name: data.name,
      surname: data.surname,
      company: data.company,
      phone: data.phone,
      description: data.description || '',
      pricingPlan: data.pricingPlan,
      status: 'new',
      createdAt: serverTimestamp()
    });
    
    console.log('New inquiry submitted with ID:', docRef.id);
    
    // Create JSON file with application data
    let fileCreated = false;
    let filePath = '';
    
    try {
      // Create a unique filename
      const fileName = `application_${data.email.replace(/[^a-zA-Z0-9]/g, '_')}_${timestamp}.json`;
      
      // Define the applications directory path
      const applicationsDir = path.join(process.cwd(), 'applications');
      
      // Ensure the directory exists
      try {
        await fs.mkdir(applicationsDir, { recursive: true });
      } catch (err) {
        console.error('Error creating applications directory:', err);
      }
      
      // Full path for the JSON file
      filePath = path.join(applicationsDir, fileName);
      
      // Prepare JSON data
      const jsonData = {
        inquiryId: docRef.id,
        timestamp,
        userData: {
          email: data.email,
          name: data.name,
          surname: data.surname,
          company: data.company,
          phone: data.phone,
          description: data.description || ''
        },
        plan: {
          type: data.pricingPlan,
          duration: '28 days'
        },
        status: 'pending'
      };
      
      // Write the file
      await fs.writeFile(filePath, JSON.stringify(jsonData, null, 2));
      fileCreated = true;
      
      console.log('Application JSON file created:', filePath);
    } catch (fileError) {
      console.error('Error creating JSON file:', fileError);
      // We'll continue even if file creation fails
    }
    
    // Return success response
    return NextResponse.json(
      { 
        success: true, 
        message: 'Thank you for your application! Our team will contact you shortly.',
        fileCreated,
        filePath: fileCreated ? filePath : undefined
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error processing application:', error);
    
    // Return error response
    return NextResponse.json(
      { 
        success: false, 
        message: 'An error occurred while processing your application. Please try again later.' 
      },
      { status: 500 }
    );
  }
}