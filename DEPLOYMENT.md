# Deployment Guide - Kelas BIOS

## Prerequisites

- Node.js 18+ installed
- A Supabase account
- A Vercel account (for deployment)

## Setup Instructions

### 1. Database Setup

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Go to SQL Editor and run the complete schema from `DATABASE_SCHEMA.md`
3. Enable Row Level Security on all tables
4. Create the storage buckets as specified in the schema

### 2. Environment Configuration

1. Copy `.env.local.example` to `.env.local`:

   ```bash
   cp .env.local.example .env.local
   ```

2. Fill in your Supabase credentials:

   ```env
   NEXT_PUBLIC_SUPABASE_URL=your-project-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

3. You can find these values in your Supabase project settings under "API"

### 3. Install Dependencies

```bash
npm install
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

### 5. Create First Admin User

After registering your first user with @student.ubm.ac.id email:

1. Go to Supabase Dashboard → Table Editor → `profiles`
2. Find your user record
3. Change the `role` field from `member` to `admin`
4. Save the changes

Now you can access the admin dashboard at `/admin`

## Deployment to Vercel

### Method 1: Connect Git Repository (Recommended)

1. Push your code to GitHub/GitLab/Bitbucket
2. Go to [vercel.com](https://vercel.com) and click "New Project"
3. Import your repository
4. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. Click "Deploy"

### Method 2: Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# Add production environment variables
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY

# Deploy to production
vercel --prod
```

## Post-Deployment Checklist

- [ ] Verify Supabase connection
- [ ] Test user registration with @student.ubm.ac.id email
- [ ] Create first admin user
- [ ] Test class creation as admin
- [ ] Test enrollment and payment flow
- [ ] Test payment verification
- [ ] Test attendance marking
- [ ] Upload sample class materials
- [ ] Test materials access
- [ ] Verify error pages (404, 403)

## Environment Variables Reference

| Variable                        | Description                 | Example                     |
| ------------------------------- | --------------------------- | --------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | Your Supabase project URL   | `https://xxxxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anonymous key | `eyJhbGc...`                |

## Storage Buckets Configuration

Make sure these buckets are created in Supabase Storage:

1. **payment-proofs**
   - Public: No
   - Allowed MIME types: image/\*
   - Max file size: 5MB

2. **class-materials**
   - Public: Yes
   - Allowed MIME types: application/pdf
   - Max file size: 50MB

## Troubleshooting

### Authentication Issues

If users can't login:

- Check if RLS policies are enabled
- Verify email domain validation in middleware
- Check Supabase auth settings

### File Upload Issues

If file uploads fail:

- Verify storage buckets exist
- Check RLS policies on storage
- Verify file size and type restrictions

### Admin Access Issues

If admin routes show 403:

- Check user `role` in `profiles` table
- Verify middleware is running
- Clear browser cache and cookies

## Maintenance

### Regular Tasks

1. **Monitor enrollments** - Check for pending payments regularly
2. **Verify payments** - Process payment verifications promptly
3. **Update class status** - Close/complete classes after they finish
4. **Backup database** - Use Supabase backup features
5. **Check storage usage** - Monitor file storage limits

### Database Maintenance

```sql
-- Close classes that are past their date
UPDATE classes
SET status = 'completed'
WHERE class_date < CURRENT_DATE
AND status = 'open';

-- Clean up rejected enrollments older than 30 days
DELETE FROM enrollments
WHERE payment_status = 'rejected'
AND created_at < NOW() - INTERVAL '30 days';
```

## Security Considerations

1. **Row Level Security (RLS)** is enabled on all tables
2. **Email domain validation** restricts registration to @student.ubm.ac.id
3. **File type validation** ensures only allowed files are uploaded
4. **Admin routes** are protected by middleware
5. **Payment verification** requires admin approval
6. **Attendance marking** is admin-only

## Support

For issues and questions:

- Check the [README.md](README.md) for feature documentation
- Review the database schema in [DATABASE_SCHEMA.md](DATABASE_SCHEMA.md)
- Check Supabase logs for backend errors
- Check browser console for frontend errors

## License

This project is built for BIOS organization at UBM University.
