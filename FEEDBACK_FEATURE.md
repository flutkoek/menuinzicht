# Dashboard Feedback Feature

## Overview
A feedback section has been added to the bottom of the dashboard page, allowing users to submit feedback, bug reports, or feature requests directly from the dashboard.

## Features

### ✅ User Interface
- **Location**: Bottom of the dashboard page (after all charts)
- **Title**: "Feedback or Request"
- **Description**: "Have suggestions, found a bug, or need a feature? Let us know!"
- **Components**:
  - Multi-line textarea (6 rows, max 5000 characters)
  - Character counter (shows current/max characters)
  - Submit button with loading state
  - Success/error toast notifications

### ✅ Functionality
- **Validation**: Non-empty input required
- **Character limit**: 5000 characters max
- **Loading state**: Button disabled while submitting
- **Success behavior**: Shows success toast and clears the textarea
- **Error handling**: Shows error toast with specific error message

### ✅ Security Features

#### Spam Prevention
1. **Honeypot field**: Hidden input field that bots typically fill out
   - Position: Absolute positioning off-screen
   - Tab index: -1 (not accessible via keyboard)
   - Auto-complete: Off
   - If filled, submission is rejected as spam

2. **Rate limiting**: Button disabled during submission
3. **Character limit**: 5000 characters max
4. **Server-side validation**: All inputs validated on API route

#### Email Privacy
- Recipient email (`rutgervanbasten1@gmail.com`) stored in environment variable
- Never exposed to client-side code
- Configurable via `FEEDBACK_TO_EMAIL` in `.env.local`

### ✅ Email Content

**Subject**: `New dashboard feedback`

**Body includes**:
- Timestamp (formatted for Europe/Amsterdam timezone)
- User name (if available from auth context)
- User email (if available from auth context)
- Feedback text (preserves line breaks)
- Source indicator ("MenuInzicht Analytics Dashboard")

**Format**: Both HTML (styled) and plain text versions

**Reply-To**: Set to user's email if available

## Technical Implementation

### Files Created/Modified

#### Created:
- `/app/api/send-feedback/route.ts` - API endpoint for sending feedback emails

#### Modified:
- `/app/dashboard/page.tsx` - Added feedback section and handler
- `/env.example` - Added feedback email configuration

### API Route: `/api/send-feedback`

**Endpoint**: `POST /api/send-feedback`

**Request Body**:
```json
{
  "feedback": "User's feedback text",
  "userName": "Optional user name",
  "userEmail": "Optional user email",
  "honeypot": "" // Should be empty for real users
}
```

**Response (Success)**:
```json
{
  "message": "Feedback sent successfully"
}
```

**Response (Error)**:
```json
{
  "error": "Error message"
}
```

**Status Codes**:
- `200`: Success
- `400`: Validation error (empty feedback, honeypot filled, too long)
- `500`: Server error (email sending failed)

### Environment Variables

Add to `.env.local`:

```env
# Primary SMTP configuration (Gmail example)
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-gmail-app-password

# Alternative SMTP configuration (optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-gmail-app-password

# Feedback recipient (defaults to rutgervanbasten1@gmail.com)
FEEDBACK_TO_EMAIL=rutgervanbasten1@gmail.com
```

### Dependencies

Uses existing dependencies:
- `nodemailer` - Email sending
- `@/hooks/use-toast` - Toast notifications
- `@/components/ui/textarea` - Textarea component
- `@/components/ui/button` - Button component
- `@/components/ui/card` - Card components

## Usage

### For Users

1. Scroll to the bottom of the dashboard
2. Find the "Feedback or Request" section
3. Type your feedback in the textarea
4. Click "Send Feedback"
5. Wait for success confirmation
6. Textarea clears automatically on success

### For Administrators

**Receiving Feedback**:
1. Feedback emails arrive at `rutgervanbasten1@gmail.com`
2. Subject line: "New dashboard feedback"
3. Email includes:
   - User information (if logged in)
   - Timestamp
   - Feedback text
4. Reply directly to user's email if provided

**Monitoring**:
- Check server logs for any email sending errors
- Monitor spam submissions (honeypot catches)
- Review character limit violations

## Styling

**Design matches dashboard theme**:
- Gradient background (white/gray-50 light, gray-900/gray-800 dark)
- Backdrop blur effect
- Ring border with subtle shadow
- Green accent color for submit button
- Responsive layout
- Smooth animations (reveal-on-scroll)

**Dark mode support**:
- Automatic theme adaptation
- Proper contrast ratios
- Readable text colors

## Testing

### Manual Testing Checklist

1. **Empty submission**:
   - Leave textarea empty
   - Click submit
   - Should show error toast: "Please enter your feedback"

2. **Valid submission**:
   - Enter feedback text
   - Click submit
   - Should show success toast
   - Textarea should clear

3. **Character limit**:
   - Type 5000+ characters
   - Should be limited to 5000
   - Counter should show 5000/5000

4. **Loading state**:
   - Submit feedback
   - Button should show "Sending..." with spinner
   - Button should be disabled during submission

5. **Honeypot (spam test)**:
   - Open browser console
   - Fill honeypot field: `document.querySelector('input[name="website"]').value = "spam"`
   - Submit form
   - Should be rejected (400 error)

6. **Email delivery**:
   - Submit valid feedback
   - Check `rutgervanbasten1@gmail.com` inbox
   - Verify email received with correct content

### API Testing

```bash
# Test valid feedback
curl -X POST http://localhost:3000/api/send-feedback \
  -H "Content-Type: application/json" \
  -d '{
    "feedback": "This is a test feedback",
    "userName": "Test User",
    "userEmail": "test@example.com",
    "honeypot": ""
  }'

# Test empty feedback (should fail)
curl -X POST http://localhost:3000/api/send-feedback \
  -H "Content-Type: application/json" \
  -d '{
    "feedback": "",
    "honeypot": ""
  }'

# Test honeypot (should fail)
curl -X POST http://localhost:3000/api/send-feedback \
  -H "Content-Type: application/json" \
  -d '{
    "feedback": "Test",
    "honeypot": "spam"
  }'
```

## Troubleshooting

### Email Not Sending

**Check environment variables**:
```bash
# Verify .env.local exists and has correct values
cat .env.local | grep EMAIL
```

**Common issues**:
1. Missing `.env.local` file → Create from `env.example`
2. Wrong Gmail password → Use App Password, not regular password
3. 2FA not enabled → Enable in Google Account settings
4. Firewall blocking SMTP → Check ports 587/465

**Check server logs**:
```bash
# Look for errors in terminal where `npm run dev` is running
# Errors will show: "Error sending feedback: ..."
```

### Toast Not Showing

1. Verify `<Toaster />` is in `app/layout.tsx`
2. Check browser console for errors
3. Try refreshing the page
4. Check if toast appears in bottom-right corner

### Honeypot False Positives

If legitimate users are being blocked:
1. Check browser extensions (some auto-fill forms)
2. Verify honeypot field is properly hidden
3. Check for accessibility tools that might fill hidden fields

## Future Enhancements

Possible improvements:
- [ ] Add file attachment support
- [ ] Categorize feedback (bug/feature/suggestion)
- [ ] Add priority/severity selector
- [ ] Screenshot capture integration
- [ ] Feedback history for logged-in users
- [ ] Admin dashboard to view all feedback
- [ ] Email templates with better styling
- [ ] Rate limiting per user/IP
- [ ] Feedback status tracking

## Security Considerations

✅ **Implemented**:
- Honeypot spam prevention
- Server-side validation
- Character limits
- Email address not exposed to client
- Environment variables for credentials
- Input sanitization (HTML escaping in email)

⚠️ **Recommended for production**:
- Rate limiting per IP/user (e.g., 5 submissions per hour)
- CAPTCHA for additional spam prevention
- Content filtering for inappropriate language
- Database logging of all submissions
- Admin notification system
- Backup email delivery method

## Support

For issues or questions:
1. Check this documentation
2. Review `CONTACT_FORM_SETUP.md` for email setup
3. Check server logs for errors
4. Verify environment variables are set correctly
5. Test API endpoint directly with curl
