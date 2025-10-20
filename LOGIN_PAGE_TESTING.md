# Login Page - Testing Guide

## Quick Start

### 1. Set Up Email Configuration

Copy the environment variables template:
```bash
cp env.example .env.local
```

Edit `.env.local` and add your Gmail credentials:
```env
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-gmail-app-password
```

**To get a Gmail App Password:**
1. Go to https://myaccount.google.com/security
2. Enable 2-Step Verification if not already enabled
3. Go to "App passwords" (search for it in settings)
4. Generate a new app password for "Mail"
5. Copy the 16-character password (no spaces)

### 2. Start the Development Server

```bash
npm run dev
```

Navigate to: http://localhost:3000

## Testing Checklist

### ✅ Dark Mode Text Fix
1. Toggle between light and dark mode using the theme toggle (top right)
2. Check the "Or continue with" separator text:
   - **Light mode**: Should have gray text on white background
   - **Dark mode**: Should have light gray text on dark background (no white block)
3. Verify the separator line is visible in both modes

### ✅ Twitter Login Removed
1. Check the social login section
2. Verify only the **Google** button is present
3. Twitter button should be completely gone
4. Google button should be centered and full-width

### ✅ Contact Administrator Form
1. Click the "Contact administrator" link at the bottom
2. A modal dialog should open with the title "Contact Administrator"
3. Fill out the form:
   - **Company Name**: Test Company
   - **Email**: your-test-email@example.com
   - **Message**: Testing the contact form functionality
4. Click "Send Message"
5. Verify:
   - Button shows "Sending..." with spinner
   - Success toast appears: "Message sent successfully!"
   - Modal closes automatically
   - Form resets

### ✅ Form Validation
Test the validation by:
1. Opening the contact form
2. Try submitting with empty fields → Should show browser validation
3. Enter invalid email (e.g., "notanemail") → Should show email validation
4. Enter valid data → Should submit successfully

### ✅ Email Delivery
1. After submitting the form, check the inbox: **rutgervanbasten1@gmail.com**
2. You should receive an email with:
   - Subject: "Contact Request from [Company Name]"
   - Body containing: Company Name, Email, and Message
   - Reply-To set to the user's email address

## Troubleshooting

### Email Not Sending?

**Check the API route:**
```bash
# Look for errors in the terminal where you ran `npm run dev`
# You should see any email sending errors there
```

**Common issues:**
- ❌ `.env.local` file not created → Create it from `env.example`
- ❌ Wrong Gmail password → Use App Password, not regular password
- ❌ 2FA not enabled → Enable it in Google Account settings
- ❌ Firewall blocking SMTP → Check ports 587 or 465

**Test the API directly:**
```bash
curl -X POST http://localhost:3000/api/contact-admin \
  -H "Content-Type: application/json" \
  -d '{
    "companyName": "Test Company",
    "email": "test@example.com",
    "message": "This is a test message"
  }'
```

Expected response:
```json
{"message":"Email sent successfully"}
```

### Toast Not Showing?

1. Check browser console for errors (F12)
2. Verify `<Toaster />` is in `app/layout.tsx`
3. Try refreshing the page
4. Check if toast appears in bottom-right corner

### Dark Mode Issues?

1. Clear browser cache (Ctrl+Shift+Delete)
2. Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)
3. Toggle theme multiple times
4. Check if Tailwind classes are applied (inspect element)

## Production Deployment

### Environment Variables

When deploying to production (Vercel, Netlify, etc.), add these environment variables:

```env
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-gmail-app-password
```

### Alternative: Use Resend for Production

For better deliverability in production, consider using Resend:

1. Sign up at https://resend.com
2. Get your API key
3. Update `/app/api/contact-admin/route.ts`:

```typescript
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { companyName, email, message } = body

  // Validation...

  const { data, error } = await resend.emails.send({
    from: 'MenuInzicht <onboarding@resend.dev>',
    to: 'rutgervanbasten1@gmail.com',
    subject: `Contact Request from ${companyName}`,
    html: `...`, // Your HTML template
    replyTo: email,
  })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ message: 'Email sent successfully' }, { status: 200 })
}
```

4. Add environment variable:
```env
RESEND_API_KEY=re_your_api_key_here
```

## Security Notes

✅ **Admin email is server-side only**: The email `rutgervanbasten1@gmail.com` is never exposed to the frontend

✅ **Environment variables**: Email credentials are stored in `.env.local` (not committed to git)

✅ **Input validation**: Both client-side and server-side validation

✅ **Email format check**: Regex validation for email addresses

✅ **Required fields**: All fields must be filled out

## Support

If you encounter any issues:
1. Check the terminal output for errors
2. Review the browser console (F12)
3. Verify `.env.local` is properly configured
4. Test the API endpoint directly with curl
5. Check the `CONTACT_FORM_SETUP.md` for detailed setup instructions
