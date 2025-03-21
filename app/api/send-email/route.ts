// pages/api/send-email.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import nodemailer from 'nodemailer'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' })
  }

  const { fullName, companyName, email, phone, description, selectedPlan, billingCycle } = req.body

  // Create a transporter using your email service (e.g., Gmail, SendGrid, etc.)
  const transporter = nodemailer.createTransport({
    service: 'gmail', // You can use other services like SendGrid, Mailgun, etc.
    auth: {
      user: process.env.EMAIL_USER, // Your email address (e.g., your Gmail address)
      pass: process.env.EMAIL_PASS, // Your email password or app-specific password
    },
  })

  // Email options
  const mailOptions = {
    from: process.env.EMAIL_USER, // Sender address
    to: 'alexisarvas2005@gmail.com', // Recipient address
    subject: 'New Application from FieldX',
    text: `
      New application received:

      Full Name: ${fullName}
      Company Name: ${companyName}
      Email: ${email}
      Phone: ${phone}
      Description: ${description}
      Selected Plan: ${selectedPlan.name} (${billingCycle === 'monthly' ? selectedPlan.monthlyPrice : selectedPlan.yearlyPrice}€ / ${billingCycle})
    `,
  }

  try {
    await transporter.sendMail(mailOptions)
    res.status(200).json({ message: 'Email sent successfully' })
  } catch (error) {
    console.error('Error sending email:', error)
    res.status(500).json({ message: 'Failed to send email', error })
  }
}