// File: app/api/get-application-json/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { promises as fs } from 'fs';
import path from 'path';

export async function GET(request: NextRequest) {
  try {
    // Get the leadId from the URL query parameters
    const searchParams = request.nextUrl.searchParams;
    const leadId = searchParams.get('leadId');
    
    if (!leadId) {
      return NextResponse.json(
        { error: 'Lead ID is required' },
        { status: 400 }
      );
    }
    
    // First try to get the application data from Firestore
    const leadDoc = await getDoc(doc(db, 'inquiries', leadId));
    
    if (!leadDoc.exists()) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      );
    }
    
    const leadData = leadDoc.data();
    
    // Check if there's a corresponding JSON file
    const applicationsDir = path.join(process.cwd(), 'applications');
    let jsonFileFound = false;
    let jsonData = null;
    
    try {
      // Try to read the directory
      const files = await fs.readdir(applicationsDir);
      
      // Look for a file that contains the lead ID or email
      const emailIdentifier = leadData.email?.replace(/[^a-zA-Z0-9]/g, '_');
      const matchingFile = files.find(file => 
        file.includes(leadId) || (emailIdentifier && file.includes(emailIdentifier))
      );
      
      if (matchingFile) {
        // Read the file content
        const filePath = path.join(applicationsDir, matchingFile);
        const fileContent = await fs.readFile(filePath, 'utf-8');
        jsonData = JSON.parse(fileContent);
        jsonFileFound = true;
      }
    } catch (error) {
      // If directory doesn't exist or other file system error, continue with Firestore data
      console.error('Error accessing application files:', error);
    }
    
    // If no JSON file is found, create one with Firestore data
    if (!jsonFileFound) {
      // Format the data as if it was from a JSON file
      const timestamp = new Date().toISOString();
      
      jsonData = {
        inquiryId: leadId,
        timestamp,
        userData: {
          email: leadData.email || '',
          name: leadData.name || '',
          surname: leadData.surname || '',
          company: leadData.company || '',
          phone: leadData.phone || '',
          description: leadData.description || ''
        },
        plan: {
          type: leadData.pricingPlan || leadData.planId || 'standard',
          duration: leadData.pricingPlan === 'freemium' ? '28 days' : 'custom'
        },
        status: leadData.status || 'pending',
        createdAt: leadData.createdAt 
          ? new Date(leadData.createdAt.seconds * 1000).toISOString()
          : new Date().toISOString()
      };
      
      // Try to save this as a new JSON file for future use
      try {
        // Create the applications directory if it doesn't exist
        await fs.mkdir(applicationsDir, { recursive: true });
        
        // Create a filename
        const fileName = `application_${leadData.email?.replace(/[^a-zA-Z0-9]/g, '_') || leadId}_${timestamp}.json`;
        const filePath = path.join(applicationsDir, fileName);
        
        // Write the file
        await fs.writeFile(filePath, JSON.stringify(jsonData, null, 2));
      } catch (error) {
        console.error('Error creating application JSON file:', error);
        // Continue even if file creation fails
      }
    }
    
    // Return the JSON data
    return NextResponse.json(jsonData);
    
  } catch (error) {
    console.error('Error retrieving application data:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve application data' },
      { status: 500 }
    );
  }
}