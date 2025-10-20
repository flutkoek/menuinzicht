import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { feedback, userName, userEmail, honeypot } = body

    // Honeypot spam check - if filled, it's likely a bot
    if (honeypot) {
      return NextResponse.json(
        { error: 'Invalid submission' },
        { status: 400 }
      )
    }

    // Validate feedback
    if (!feedback || typeof feedback !== 'string' || feedback.trim().length === 0) {
      return NextResponse.json(
        { error: 'Feedback cannot be empty' },
        { status: 400 }
      )
    }

    if (feedback.trim().length > 5000) {
      return NextResponse.json(
        { error: 'Feedback is too long (max 5000 characters)' },
        { status: 400 }
      )
    }

    // Get feedback recipient from environment variable
    const feedbackEmail = process.env.FEEDBACK_TO_EMAIL || 'rutgervanbasten1@gmail.com'

    // Create transporter using environment variables
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || process.env.EMAIL_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true' || false, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER || process.env.EMAIL_USER,
        pass: process.env.SMTP_PASS || process.env.EMAIL_PASSWORD,
      },
    })

    // Format timestamp
    const timestamp = new Date().toLocaleString('en-US', {
      timeZone: 'Europe/Amsterdam',
      dateStyle: 'full',
      timeStyle: 'long',
    })

    // Email content
    const mailOptions = {
      from: process.env.SMTP_USER || process.env.EMAIL_USER,
      to: feedbackEmail,
      subject: 'New dashboard feedback',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #22c55e; border-bottom: 2px solid #22c55e; padding-bottom: 10px;">
            New Dashboard Feedback
          </h2>
          
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 5px 0;"><strong>Submitted:</strong> ${timestamp}</p>
            ${userName ? `<p style="margin: 5px 0;"><strong>User Name:</strong> ${userName}</p>` : ''}
            ${userEmail ? `<p style="margin: 5px 0;"><strong>User Email:</strong> ${userEmail}</p>` : ''}
          </div>
          
          <div style="background-color: #ffffff; padding: 20px; border-left: 4px solid #22c55e; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #374151;">Feedback:</h3>
            <p style="white-space: pre-wrap; color: #1f2937; line-height: 1.6;">${feedback}</p>
          </div>
          
          <p style="color: #6b7280; font-size: 12px; margin-top: 30px; border-top: 1px solid #e5e7eb; padding-top: 15px;">
            This feedback was submitted from the MenuInzicht Analytics Dashboard.
          </p>
        </div>
      `,
      text: `
New Dashboard Feedback

Submitted: ${timestamp}
${userName ? `User Name: ${userName}` : ''}
${userEmail ? `User Email: ${userEmail}` : ''}

Feedback:
${feedback}

---
This feedback was submitted from the MenuInzicht Analytics Dashboard.
      `,
      replyTo: userEmail || undefined,
    }

    // Send email
    await transporter.sendMail(mailOptions)

    return NextResponse.json(
      { message: 'Feedback sent successfully' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error sending feedback:', error)
    return NextResponse.json(
      { error: 'Failed to send feedback. Please try again later.' },
      { status: 500 }
    )
  }
}
