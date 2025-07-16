import nodemailer from 'nodemailer';
import crypto from 'crypto';

export interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

export interface VerificationEmailData {
  to: string;
  firstName: string;
  verificationCode: string;
}

export interface SupportEmailData {
  to: string;
  from: string;
  fromName: string;
  subject: string;
  message: string;
}

class EmailService {
  private transporter: nodemailer.Transporter | null = null;

  constructor() {
    this.initializeTransporter();
  }

  private initializeTransporter() {
    // Configure email service based on environment variables
    const emailHost = process.env.EMAIL_HOST?.trim();
    const emailPort = process.env.EMAIL_PORT?.trim();
    const emailUser = process.env.EMAIL_USER?.trim();
    const emailPass = (process.env.EMAIL_PASSWORD || process.env.EMAIL_PASS)?.trim();

    console.log('Email service configuration:', {
      host: emailHost ? 'SET' : 'NOT_SET',
      port: emailPort ? 'SET' : 'NOT_SET',
      user: emailUser ? 'SET' : 'NOT_SET',
      pass: emailPass ? 'SET' : 'NOT_SET'
    });

    if (!emailHost || !emailPort || !emailUser || !emailPass) {
      console.warn('Email service not configured. Set EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASSWORD environment variables.');
      return;
    }

    try {
      this.transporter = nodemailer.createTransport({
        host: emailHost,
        port: parseInt(emailPort),
        secure: parseInt(emailPort) === 465, // true for 465, false for other ports
        auth: {
          user: emailUser,
          pass: emailPass,
        },
      });

      console.log('Email service initialized successfully');
    } catch (error) {
      console.error('Failed to initialize email service:', error);
    }
  }

  /**
   * Generate a secure 6-digit verification code
   */
  generateVerificationCode(): string {
    return crypto.randomInt(100000, 999999).toString();
  }

  /**
   * Generate a secure verification token
   */
  generateVerificationToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Send verification email to user
   */
  async sendVerificationEmail({ to, firstName, verificationCode }: VerificationEmailData): Promise<boolean> {
    if (!this.transporter) {
      console.error('Email service not initialized');
      return false;
    }

    const subject = 'Verify your Contract Clarity account';
    const htmlContent = this.getVerificationEmailTemplate(firstName, verificationCode);
    const textContent = this.getVerificationEmailText(firstName, verificationCode);

    try {
      const info = await this.transporter.sendMail({
        from: `"Contract Clarity" <${process.env.EMAIL_USER}>`,
        to,
        subject,
        text: textContent,
        html: htmlContent,
      });

      console.log('Verification email sent successfully:', info.messageId);
      return true;
    } catch (error) {
      console.error('Failed to send verification email:', error);
      return false;
    }
  }

  /**
   * Get HTML template for verification email
   */
  private getVerificationEmailTemplate(firstName: string, verificationCode: string): string {
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verify Your Email - Contract Clarity</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f8fafc;
          }
          .container {
            background: white;
            padding: 40px;
            border-radius: 12px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.07);
          }
          .logo {
            text-align: center;
            margin-bottom: 30px;
          }
          .logo h1 {
            color: #6366f1;
            font-size: 28px;
            margin: 0;
            font-weight: 700;
          }
          .verification-code {
            background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
            color: white;
            font-size: 32px;
            font-weight: bold;
            text-align: center;
            padding: 20px;
            border-radius: 8px;
            margin: 30px 0;
            letter-spacing: 8px;
            font-family: 'Courier New', monospace;
          }
          .cta {
            text-align: center;
            margin: 30px 0;
          }
          .footer {
            text-align: center;
            margin-top: 40px;
            padding-top: 30px;
            border-top: 1px solid #e5e7eb;
            color: #6b7280;
            font-size: 14px;
          }
          .security-note {
            background: #fef3cd;
            border: 1px solid #fbbf24;
            border-radius: 6px;
            padding: 15px;
            margin: 20px 0;
            font-size: 14px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="logo">
            <h1>Contract Clarity</h1>
          </div>
          
          <h2>Welcome${firstName ? `, ${firstName}` : ''}!</h2>
          
          <p>Thank you for signing up for Contract Clarity. To complete your registration and secure your account, please verify your email address using the code below:</p>
          
          <div class="verification-code">
            ${verificationCode}
          </div>
          
          <div class="security-note">
            <strong>🔒 Security Note:</strong> This code will expire in 24 hours. If you didn't create an account with Contract Clarity, please ignore this email.
          </div>
          
          <p>Once verified, you'll have access to:</p>
          <ul>
            <li>AI-powered contract analysis</li>
            <li>Risk assessment and recommendations</li>
            <li>Multi-language support</li>
            <li>Secure document processing</li>
          </ul>
          
          <div class="footer">
            <p>Need help? Contact our support team or visit our help center.</p>
            <p>© 2025 Contract Clarity. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Get plain text version for verification email
   */
  private getVerificationEmailText(firstName: string, verificationCode: string): string {
    return `
Welcome${firstName ? `, ${firstName}` : ''}!

Thank you for signing up for Contract Clarity. To complete your registration and secure your account, please verify your email address using the code below:

VERIFICATION CODE: ${verificationCode}

This code will expire in 24 hours. If you didn't create an account with Contract Clarity, please ignore this email.

Once verified, you'll have access to:
- AI-powered contract analysis
- Risk assessment and recommendations  
- Multi-language support
- Secure document processing

Need help? Contact our support team or visit our help center.

© 2025 Contract Clarity. All rights reserved.
    `.trim();
  }

  /**
   * Send support contact email
   */
  async sendSupportEmail({ to, from, fromName, subject, message }: SupportEmailData): Promise<boolean> {
    if (!this.transporter) {
      console.error('Email service not initialized');
      return false;
    }

    try {
      const emailSubject = `[Contact Form] ${subject}`;
      const htmlContent = this.getSupportEmailTemplate(fromName, from, subject, message);
      const textContent = this.getSupportEmailText(fromName, from, subject, message);

      await this.transporter.sendMail({
        from: process.env.EMAIL_USER, // Send from our configured email
        to: to,
        replyTo: from, // Allow replying directly to the user
        subject: emailSubject,
        text: textContent,
        html: htmlContent,
      });

      console.log(`Support email sent successfully to ${to} from ${fromName} (${from})`);
      return true;
    } catch (error) {
      console.error('Failed to send support email:', error);
      return false;
    }
  }

  /**
   * Get HTML template for support email
   */
  private getSupportEmailTemplate(fromName: string, fromEmail: string, subject: string, message: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Contact Form Submission</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f8fafc;
          }
          .container {
            background: white;
            border-radius: 12px;
            padding: 40px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.07);
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 2px solid #e5e7eb;
          }
          .logo h1 {
            margin: 0;
            color: #6366f1;
            font-size: 28px;
            font-weight: bold;
          }
          .contact-info {
            background: #f3f4f6;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
          }
          .contact-info h3 {
            margin-top: 0;
            color: #374151;
          }
          .message-content {
            background: #fafafa;
            border-left: 4px solid #6366f1;
            padding: 20px;
            margin: 20px 0;
            border-radius: 0 8px 8px 0;
          }
          .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            color: #6b7280;
            font-size: 14px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">
              <h1>Contract Clarity</h1>
            </div>
            <h2>New Contact Form Submission</h2>
          </div>
          
          <div class="contact-info">
            <h3>Contact Information</h3>
            <p><strong>Name:</strong> ${fromName}</p>
            <p><strong>Email:</strong> ${fromEmail}</p>
            <p><strong>Subject:</strong> ${subject}</p>
          </div>
          
          <div class="message-content">
            <h3>Message</h3>
            <p>${message.replace(/\n/g, '<br>')}</p>
          </div>
          
          <div class="footer">
            <p>This email was sent from the Contract Clarity contact form.</p>
            <p>© 2025 Contract Clarity. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Get plain text version for support email
   */
  private getSupportEmailText(fromName: string, fromEmail: string, subject: string, message: string): string {
    return `
NEW CONTACT FORM SUBMISSION - Contract Clarity

Contact Information:
Name: ${fromName}
Email: ${fromEmail}
Subject: ${subject}

Message:
${message}

---
This email was sent from the Contract Clarity contact form.
`;
  }

  /**
   * Test email configuration
   */
  async testConnection(): Promise<boolean> {
    if (!this.transporter) {
      return false;
    }

    try {
      await this.transporter.verify();
      console.log('Email service connection verified');
      return true;
    } catch (error) {
      console.error('Email service connection failed:', error);
      return false;
    }
  }
}

export const emailService = new EmailService();