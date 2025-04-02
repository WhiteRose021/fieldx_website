import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json({ success: false, message: 'reCAPTCHA token is missing' }, { status: 400 });
    }

    const secretKey = process.env.RECAPTCHA_SECRET_KEY;
    
    if (!secretKey) {
      console.error('RECAPTCHA_SECRET_KEY is not defined in environment variables');
      return NextResponse.json(
        { success: false, message: 'Server configuration error' },
        { status: 500 }
      );
    }

    // Google's reCAPTCHA verification endpoint requires the request to be sent as application/x-www-form-urlencoded
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

    if (!verificationData.success) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'reCAPTCHA verification failed', 
          errors: verificationData['error-codes'] 
        },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true, message: 'reCAPTCHA verification successful' }, { status: 200 });
  } catch (error) {
    console.error('Error verifying reCAPTCHA:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error during reCAPTCHA verification' },
      { status: 500 }
    );
  }
}