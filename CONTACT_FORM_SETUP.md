# Contact Administrator Form - Setup Instructions

## Overview
The login page now includes a functional "Contact Administrator" form that sends emails to rutgervanbasten1@gmail.com.

## Changes Made

### 1. Dark Mode Text Fix ✅
- Fixed "or continue with" separator text color in dark mode
- Background now uses `bg-white/95 dark:bg-gray-800/95` for transparency
- Text color uses `text-gray-500 dark:text-gray-400`
- Border uses `border-gray-200 dark:border-gray-700`

### 2. Twitter Login Removed ✅
- Removed Twitter login button
- Google login button now centered and full-width (max-w-xs)

### 3. Contact Administrator Form ✅
- Modal dialog opens when clicking "Contact administrator" link
- Form includes:
  - Company Name (required text input)
  - Email Address (required email input with validation)
  - Reason / Message (required textarea)
- Success/error notifications via toast
- Email sent to: rutgervanbasten1@gmail.com (server-side only, not exposed in frontend)

## Email Configuration

### Option 1: Gmail (Recommended for Testing)
1. Create a Gmail App Password:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate a new app password

2. Create a `.env.local` file in the project root:
```env
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password-here
```

### Option 2: Resend API (Recommended for Production)
If you prefer to use Resend instead of Nodemailer:

1. Sign up at https://resend.com
2. Get your API key
3. Update `/app/api/contact-admin/route.ts`:

```typescript
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: NextRequest) {
  // ... validation code ...
  
  const { data, error } = await resend.emails.send({
    from: 'MenuInzicht <onboarding@resend.dev>',
    to: 'rutgervanbasten1@gmail.com',
    subject: `Contact Request from ${companyName}`,
    html: `...`,
    replyTo: email,
  })
  
  // ... error handling ...
}
```

4. Add to `.env.local`:
```env
RESEND_API_KEY=re_your_api_key_here
```

## Testing

1. Start the development server:
```bash
npm run dev
```

2. Navigate to the login page
3. Click "Contact administrator"
4. Fill out the form and submit
5. Check for success toast notification
6. Verify email received at rutgervanbasten1@gmail.com

## Security Notes

- ✅ Admin email (rutgervanbasten1@gmail.com) is stored server-side only
- ✅ Email credentials use environment variables
- ✅ Form validation on both client and server
- ✅ Email format validation
- ✅ All fields required

## Files Modified/Created

### Created:
- `/app/api/contact-admin/route.ts` - API endpoint for sending emails
- `/components/ui/dialog.tsx` - Dialog component
- `/components/ui/textarea.tsx` - Textarea component
- `/components/ui/toast.tsx` - Toast notification component
- `/components/ui/toaster.tsx` - Toast container
- `/hooks/use-toast.ts` - Toast hook

### Modified:
- `/app/page.tsx` - Login page with all three updates
- `/app/layout.tsx` - Added Toaster component

## Environment Variables Required

Create `.env.local` in the project root:

```env
# For Gmail SMTP
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-gmail-app-password

# OR for Resend (if you switch to Resend)
# RESEND_API_KEY=re_your_api_key_here
```

## Dependencies Installed

The following packages have been installed:
- `nodemailer` - Email sending library
- `@types/nodemailer` - TypeScript types
- `@radix-ui/react-dialog` - Dialog primitive
- `@radix-ui/react-toast` - Toast primitive
- `class-variance-authority` - Styling utility

## Troubleshooting

### Email not sending?
1. Check `.env.local` exists and has correct credentials
2. For Gmail: Ensure 2FA is enabled and you're using an App Password
3. Check server console for error messages
4. Verify firewall isn't blocking SMTP port (587/465)

### Toast not showing?
1. Ensure `<Toaster />` is added to `layout.tsx`
2. Check browser console for errors
3. Verify all toast dependencies are installed

### Dark mode issues?
1. Clear browser cache
2. Toggle theme and check again
3. Verify Tailwind dark mode classes are applied
