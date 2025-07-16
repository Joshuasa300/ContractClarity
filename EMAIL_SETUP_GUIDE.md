# Email Setup Guide for Support System

Your support system can send emails to info@contractclarity.co.uk using several methods. Here are the easiest options:

## Option 1: Gmail SMTP (Recommended - Easiest)

1. **Use your Gmail account** (or create a new one for the business)
2. **Enable 2-Factor Authentication** in your Google account
3. **Generate an App Password**:
   - Go to Google Account Settings
   - Security → 2-Step Verification → App Passwords
   - Create an app password for "Mail"
4. **Set environment variables**:
   ```
   GMAIL_USER=your-email@gmail.com
   GMAIL_APP_PASSWORD=your-16-character-app-password
   ```

## Option 2: Any Email Provider SMTP

For other providers like Outlook, Yahoo, or custom domains:

```
EMAIL_HOST=smtp.yourmailserver.com
EMAIL_PORT=587 (or 465 for SSL)
EMAIL_USER=your-email@yourdomain.com
EMAIL_PASS=your-email-password
```

### Common SMTP Settings:

**Gmail:**
- Host: smtp.gmail.com
- Port: 587
- Security: STARTTLS

**Outlook/Hotmail:**
- Host: smtp-mail.outlook.com  
- Port: 587
- Security: STARTTLS

**Yahoo:**
- Host: smtp.mail.yahoo.com
- Port: 587 or 465
- Security: STARTTLS or SSL

## Current Status

✅ Support system is working and logging requests
✅ Email templates are ready for both notification and confirmation emails
✅ Form validation and error handling implemented
✅ Support page accessible at /support with professional design

**Right now:** The system logs emails to console for development. When you add email credentials, it will automatically start sending real emails to info@contractclarity.co.uk.

## What Happens When Email is Configured

1. **User submits support request** → Form validates input
2. **System sends notification email** → To info@contractclarity.co.uk with request details  
3. **System sends confirmation email** → To user confirming receipt
4. **Request logged** → Server logs all requests for backup

All emails use professional HTML templates with your Contract Clarity branding.