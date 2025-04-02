// app/api/verify-recaptcha/route.ts
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    console.log("[DEBUG] verify-recaptcha endpoint called");
    
    const { token } = await request.json();

    if (!token) {
      console.error("[ERROR] reCAPTCHA token is missing");
      return NextResponse.json({ 
        success: false, 
        message: 'reCAPTCHA token is missing' 
      }, { status: 400 });
    }

    // HARDCODED KEY FOR DEVELOPMENT ONLY
    // REMOVE BEFORE DEPLOYING TO PRODUCTION
    const secretKey = "6LfMVAcrAAAAADjcrg_H6NWiiIHWSrSbc_fqyVPh";
    
    console.log("[DEBUG] Using hardcoded secret key for verification");
    
    const verificationURL = `https://www.google.com/recaptcha/api/siteverify`;
    const formData = new URLSearchParams();
    formData.append('secret', secretKey);
    formData.append('response', token);
    
    console.log("[DEBUG] Sending verification request to Google");
    
    const verificationResponse = await fetch(verificationURL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString(),
    });
    
    const verificationData = await verificationResponse.json();
    console.log("[DEBUG] Google verification response:", verificationData);

    if (!verificationData.success) {
      console.error("[ERROR] Google verification failed:", verificationData['error-codes']);
      return NextResponse.json(
        { 
          success: false, 
          message: 'reCAPTCHA verification failed', 
          errors: verificationData['error-codes'] 
        },
        { status: 400 }
      );
    }

    console.log("[DEBUG] reCAPTCHA verification successful");
    return NextResponse.json(
      { success: true, message: 'reCAPTCHA verification successful' }, 
      { status: 200 }
    );
  } catch (error) {
    console.error("[ERROR] Error in verify-recaptcha:", error);
    return NextResponse.json(
      { success: false, message: 'Error processing request' },
      { status: 500 }
    );
  }
}