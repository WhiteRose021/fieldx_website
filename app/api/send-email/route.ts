// File: app/api/send-email/route.ts

import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { promises as fs } from 'fs';
import path from 'path';

interface EmailData {
  to: string;
  subject: string;
  body: string;
  attachments: Array<{
    name: string;
    data: string;
  }>;
}

interface ApiResponse {
  success: boolean;
  message: string;
}

export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse>> {
  try {
    // Parse the request body
    const data: EmailData = await request.json();
    
    // Validate required fields
    if (!data.to || !data.subject || !data.body) {
      return NextResponse.json(
        { success: false, message: 'Email recipient, subject, and body are required' },
        { status: 400 }
      );
    }
    
    // Create a Nodemailer transporter (configure with your email provider)
    const transporter = nodemailer.createTransport({
      // For testing, you can use services like Mailtrap or your own SMTP server
      host: process.env.SMTP_HOST || 'smtp.example.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER || 'your-email@example.com',
        pass: process.env.SMTP_PASSWORD || 'your-password',
      },
    });
    
    // Prepare email attachments
    const mailAttachments = data.attachments?.map(attachment => ({
      filename: attachment.name,
      content: attachment.data,
      encoding: 'base64',
    })) || [];
    
    // Send email
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || '"FieldX System" <system@fieldx.com>',
      to: data.to,
      subject: data.subject,
      html: data.body,
      attachments: mailAttachments,
    });
    
    console.log('Email sent:', info.messageId);
    
    // Return success response
    return NextResponse.json(
      { 
        success: true, 
        message: 'Email sent successfully',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error sending email:', error);
    
    // Return error response
    return NextResponse.json(
      { 
        success: false, 
        message: 'An error occurred while sending the email. Please try again later.' 
      },
      { status: 500 }
    );
  }
}