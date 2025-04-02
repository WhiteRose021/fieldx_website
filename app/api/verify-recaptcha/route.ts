import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  console.log("[API] verify-recaptcha endpoint called");
  
  try {
    const { token } = await request.json();

    if (!token) {
      console.error("[API] reCAPTCHA token is missing");
      return NextResponse.json({ 
        success: false, 
        message: 'reCAPTCHA token is missing' 
      }, { status: 400 });
    }

    // Using your provided secret key
    const secretKey = "6LfMVAcrAAAAADjcrg_H6NWiiIHWSrSbc_fqyVPh";
    
    console.log("[API] Sending verification request to Google reCAPTCHA API");
    
    const verificationURL = `https://www.google.com/recaptcha/api/siteverify`;
    const formData = new URLSearchParams();
    formData.append('secret', secretKey);
    formData.append('response', token);
    
    const verificationResponse = await fetch(verificationURL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString(),
    });
    
    const verificationData = await verificationResponse.json();
    console.log("[API] Google reCAPTCHA verification response:", verificationData);

    if (!verificationData.success) {
      console.error("[API] Google verification failed:", verificationData['error-codes']);
      return NextResponse.json(
        { 
          success: false, 
          message: 'reCAPTCHA verification failed', 
          errors: verificationData['error-codes'] 
        },
        { status: 400 }
      );
    }

    console.log("[API] reCAPTCHA verification successful");
    return NextResponse.json(
      { success: true, message: 'reCAPTCHA verification successful' }, 
      { status: 200 }
    );
  } catch (error) {
    console.error("[API] Error in verify-recaptcha:", error);
    return NextResponse.json(
      { success: false, message: 'Error processing request' },
      { status: 500 }
    );
  }
}