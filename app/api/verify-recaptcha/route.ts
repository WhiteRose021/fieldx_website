import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  const { token } = req.body;

  try {
    const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${token}`,
    });

    const data = await response.json();

    if (data.success && data.score >= 0.5) { // Adjust score threshold as needed
      res.status(200).json({ success: true });
    } else {
      res.status(400).json({ success: false, message: 'reCAPTCHA verification failed' });
    }
  } catch (error) {
    console.error('reCAPTCHA verification error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
}