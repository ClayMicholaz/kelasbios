# ADMIN CONFIGURATION GUIDE

## How to Give Admin Access to Users

To give admin access to specific users in BIOS LMS, you need to add their email addresses to the `NEXT_PUBLIC_ADMIN_EMAILS` environment variable.

### Step-by-Step Guide

#### For Local Development:

1. Create a `.env.local` file in the root directory if it doesn't exist
2. Add the following line with your admin emails:
   ```
   NEXT_PUBLIC_ADMIN_EMAILS=admin1@student.ubm.ac.id,admin2@student.ubm.ac.id,admin3@student.ubm.ac.id
   ```
3. Restart your development server for changes to take effect

#### For Vercel Deployment:

1. Go to your Vercel Dashboard: https://vercel.com/dashboard
2. Select your project (kelasbios)
3. Click on "Settings" tab
4. Click on "Environment Variables" in the left sidebar
5. Add a new environment variable:
   - **Variable Name**: `NEXT_PUBLIC_ADMIN_EMAILS`
   - **Value**: `admin1@student.ubm.ac.id,admin2@student.ubm.ac.id`
   - **Environment**: Select all (Production, Preview, Development)
6. Click "Save"
7. **IMPORTANT**: Redeploy your application for the changes to take effect
   - Go to "Deployments" tab
   - Click on "..." menu on the latest deployment
   - Click "Redeploy"

### Important Notes:

1. **Format**:
   - Use comma-separated email addresses (no spaces after commas)
   - ✅ Correct: `email1@student.ubm.ac.id,email2@student.ubm.ac.id`
   - ❌ Wrong: `email1@student.ubm.ac.id, email2@student.ubm.ac.id` (has space)
   - ❌ Wrong: `email1@student.ubm.ac.id,` (trailing comma)

2. **Email Requirements**:
   - Must use `@student.ubm.ac.id` domain
   - Must be exact match (case-sensitive)

3. **Environment Variable Name**:
   - Must use `NEXT_PUBLIC_ADMIN_EMAILS` (with NEXT*PUBLIC* prefix)
   - This prefix makes it available in both server and client-side code

4. **When Changes Take Effect**:
   - **Local**: After restarting dev server
   - **Vercel**: After redeploying the application
   - Existing users need to log out and log back in for admin role to be applied

### How It Works:

The system checks admin emails in three places:

1. **On Login** (`src/app/auth/callback/page.tsx`):
   - When a new user logs in via Google OAuth, the system checks if their email is in the admin list
   - If yes, creates profile with `role: "admin"`
   - If no, creates profile with `role: "member"`

2. **On Every Request** (`src/lib/supabase/proxy.ts`):
   - Middleware checks if logged-in user's email is in admin list
   - If their current role is not "admin" but email is in the list, updates their role to "admin"
   - This ensures existing users get admin access when added to the list

3. **Route Protection**:
   - Admin routes (starting with `/admin`) are protected
   - Only users with `role: "admin"` in their profile can access these routes

### Troubleshooting:

**Problem**: I added my email to Vercel but still don't have admin access

**Solutions**:

1. Verify the environment variable name is exactly `NEXT_PUBLIC_ADMIN_EMAILS` (case-sensitive)
2. Check there are no spaces after commas in the email list
3. Make sure you redeployed the application after adding the variable
4. Log out and log back in to trigger the admin check
5. Check Supabase database - look at your profile in the `profiles` table to see your current role

**Problem**: How do I verify the environment variable is set correctly?

**Solution**:
Run this in your browser console while logged in:

```javascript
console.log(process.env.NEXT_PUBLIC_ADMIN_EMAILS);
```

If it shows `undefined`, the variable is not set correctly in Vercel.

### Security Note:

Using `NEXT_PUBLIC_` prefix means this variable is exposed to the client-side code. However, this is acceptable for admin email checking because:

- The actual authorization happens server-side in the middleware and database policies
- Knowing admin emails doesn't grant access - the system still verifies the user's authenticated email matches
- Row Level Security (RLS) in Supabase provides additional protection

---

**Last Updated**: February 25, 2026
