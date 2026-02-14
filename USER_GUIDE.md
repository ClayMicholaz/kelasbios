# User Guide - Kelas BIOS

Complete guide for using the Kelas BIOS Learning Management System.

## Table of Contents

- [For Members](#for-members)
  - [Registration & Login](#registration--login)
  - [Browsing Classes](#browsing-classes)
  - [Enrolling in a Class](#enrolling-in-a-class)
  - [Payment Process](#payment-process)
  - [Accessing Materials](#accessing-materials)
  - [Practice Questions](#practice-questions)
- [For Admins](#for-admins)
  - [Admin Dashboard](#admin-dashboard)
  - [Creating a Class](#creating-a-class)
  - [Managing Classes](#managing-classes)
  - [Verifying Payments](#verifying-payments)
  - [Attendance Management](#attendance-management)
- [FAQ](#faq)

---

## For Members

### Registration & Login

#### Creating an Account

##### Option 1: Google OAuth (Recommended)

1. Go to the homepage and click **"Daftar"**
2. Click **"Daftar dengan Google UBM"** button
3. Sign in with your **@student.ubm.ac.id** Google account
4. Grant necessary permissions
5. You'll be automatically redirected to the dashboard
6. Your profile will be created automatically with:
   - **Full Name**: From your Google account
   - **Email**: Your UBM email
   - **NIM**: Automatically extracted from your email (e.g., s32230111@student.ubm.ac.id → NIM: 32230111)

> **Note**: Google OAuth requires initial setup by admin. See [GOOGLE_OAUTH_SETUP.md](./GOOGLE_OAUTH_SETUP.md) for configuration guide.

##### Option 2: Email & Password

1. Go to the homepage and click **"Masuk"** → **"Belum punya akun? Daftar"**
2. Click **"Atau daftar dengan email"** (below the Google button)
3. Fill in the registration form:
   - **Full Name**: Your complete name
   - **Email**: Must use `@student.ubm.ac.id` domain
   - **Password**: Minimum 6 characters
4. Click **"Daftar"**
5. If successful, you'll be redirected to the dashboard

> **Important**: Only UBM student emails (@student.ubm.ac.id) are allowed to register.

#### Logging In

##### Option 1: Google OAuth (Recommended)

1. Click **"Masuk"** on the homepage
2. Click **"Masuk dengan Google UBM"** button
3. Sign in with your **@student.ubm.ac.id** Google account
4. You'll be redirected to your dashboard

##### Option 2: Email & Password

1. Click **"Masuk"** on the homepage
2. Click **"Atau masuk dengan email"** (below the Google button)
3. Enter your email and password
4. Click **"Masuk"**
5. You'll be redirected to your dashboard

### Browsing Classes

#### Homepage

- The homepage shows all **open classes** available for enrollment
- Each class card displays:
  - Class title and description
  - Schedule (date and time)
  - Classroom location
  - Duration
  - Available slots (e.g., "25/30 Peserta")
  - Price (Rp 10,000)
  - Enrollment deadline

#### Class Details

1. Click **"Lihat Detail"** on any class card
2. You'll see complete information including:
   - Full description
   - Materials covered
   - Registration deadline countdown
   - Enrollment button

### Enrolling in a Class

#### Steps to Enroll

1. On the class detail page, click **"Daftar Sekarang"**
2. Confirm the enrollment
3. After successful enrollment, you'll see:
   - Your enrollment status: **"Pending Pembayaran"**
   - Payment instructions
   - Upload button for payment proof

#### Payment Requirements

- **Amount**: Rp 10,000 per 2-hour session
- **Transfer to**:
  - **Bank**: Bank Jago
  - **Account Number**: 100271468145
  - **Account Name**: Christoper Harris
- **Payment proof**: Must be an image (JPG, PNG)
- **Max file size**: 5MB

### Payment Process

#### Uploading Payment Proof

1. Go to your **Dashboard**
2. Find the class under **"Menunggu Pembayaran"** section
3. Click **"Upload Bukti Pembayaran"**
4. In the modal:
   - Select your payment proof image
   - Preview will show automatically
   - Click **"Upload"**
5. Wait for admin verification

#### Payment Status

Your payment can have three states:

1. **Pending** (Yellow badge)
   - Payment proof uploaded
   - Waiting for admin verification
   - You'll see "Menunggu Verifikasi"

2. **Verified** (Green badge)
   - Payment approved by admin
   - You can now access class materials
   - Class appears in "Kelas Saya" section

3. **Rejected** (Red badge)
   - Payment rejected by admin
   - You can re-upload a new payment proof
   - Check the reason and upload valid proof

#### Re-uploading (if Rejected)

1. Find the class under **"Pembayaran Ditolak"**
2. Read the rejection reason
3. Click **"Upload Ulang Bukti"**
4. Upload a clear and valid payment proof
5. Submit for re-verification

### Accessing Materials

#### Viewing Class Materials

1. Go to your **Dashboard**
2. Under **"Kelas Saya"**, find your verified class
3. Click **"Lihat Materi & Latihan"**
4. You'll see:
   - **Text materials**: Listed topics/materials
   - **PDF files**: Downloadable documents with download buttons

#### Downloading PDFs

1. Click the **"Download"** button next to any PDF material
2. The file will download to your device
3. You can access these materials anytime

> **Note**: Only verified enrolled students can access materials.

### Practice Questions

#### Taking Practice Quiz

1. On the materials page, scroll to **"Soal Latihan"** section
2. Questions are interactive with multiple choice options
3. Select your answer for each question
4. Navigation:
   - **Selanjutnya**: Move to next question
   - **Sebelumnya**: Go back to previous question
   - Question numbers at bottom: Jump to specific question
5. After answering all questions, click **"Selesai & Lihat Hasil"**

#### Viewing Results

After submitting:

- **Score**: Shows correct answers (e.g., "8/10")
- **Percentage**: Your grade percentage
- **Rating**:
  - 🎉 Sangat Baik! (≥80%)
  - 👍 Cukup Baik (60-79%)
  - 📖 Perlu Belajar Lagi (<60%)
- **Detailed Review**: Shows each question with:
  - Your answer
  - Correct answer
  - Whether you got it right (✓/✗)

#### Retrying Quiz

- Click **"Ulangi Latihan"** to reset and try again
- All answers will be cleared
- You can practice unlimited times

---

## For Admins

### Admin Authorization

#### Adding Admin Emails

BIOS LMS supports automatic admin role assignment through an email whitelist system. Admins can manage authorized admin emails without needing to manually update the database.

**To add admin emails:**

1. Open `.env` file in your project root
2. Locate or add the `NEXT_PUBLIC_ADMIN_EMAILS` variable
3. Add email addresses (comma-separated):
   ```env
   NEXT_PUBLIC_ADMIN_EMAILS=admin@student.ubm.ac.id,christoper.harris@student.ubm.ac.id,other.admin@student.ubm.ac.id
   ```
4. Save the file and restart your development server:
   ```bash
   npm run dev
   ```

**How it works:**

- When a user with a whitelisted email logs in or registers, they are automatically assigned the "admin" role
- The middleware checks the whitelist on every request and updates user roles accordingly
- No need to manually update the database profiles table
- Existing users will be upgraded to admin automatically on their next login

**Security Notes:**

- Never commit `.env` file to Git (already in `.gitignore`)
- Only add trusted email addresses to the admin whitelist
- Use UBM email addresses (@student.ubm.ac.id) only
- Changes take effect immediately after server restart

### Admin Dashboard

#### Accessing Admin Panel

1. Login with your admin account
2. Click **"Admin"** in the navigation bar
3. Admin dashboard shows:
   - **Statistics**: Total classes, enrollments, verified, pending, revenue
   - **Quick Actions**: Create class, manage classes, verify payments
   - **Recent Activity**: Latest enrollments

### Creating a Class

#### Step-by-Step Class Creation

1. From admin dashboard, click **"Buat Kelas Baru"**
2. Fill in the class information form:

   **Basic Information**
   - **Judul Kelas**: Class name
   - **Deskripsi Kelas**: Detailed description
   - **Durasi**: Duration in hours (e.g., 2)
   - **Ruangan**: Classroom location (e.g., "Lab 301")
   - **Maksimal Peserta**: Maximum participants (e.g., 30)

   **Schedule**
   - **Tanggal Kelas**: Class date
   - **Waktu Kelas**: Class time
   - **Batas Pendaftaran**: Registration deadline
     - Must be before class date

   **Materials (Text Topics)**
   - Add topics covered in the class
   - Click "Tambah Materi" to add more
   - Click "Hapus" to remove a topic

   **Materials (PDF Files)**
   - Click "Choose File" to select PDF files
   - Can upload multiple PDFs
   - Shows file name and size
   - Click "Hapus" to remove before uploading

   **Practice Questions (JSON)**
   - Optional field for quiz questions
   - Format:
     ```json
     [
       {
         "question": "What is React?",
         "options": ["A. Framework", "B. Library", "C. Language", "D. Tool"],
         "answer": "B. Library"
       }
     ]
     ```
   - Must be valid JSON array

3. Click **"Buat Kelas"** to create
4. Wait for PDF uploads to complete
5. You'll be redirected to class list

#### Tips for Creating Classes

- ✅ Set realistic deadlines (at least 1 day before class)
- ✅ Upload clear and relevant PDF materials
- ✅ Test JSON format before pasting (use JSON validator)
- ✅ Check participant capacity matches room size

### Managing Classes

#### Class List View

1. Navigate to **Admin** → **"Kelola Kelas"**
2. Classes are organized by status:
   - **Open**: Currently accepting enrollments
   - **Closed**: No longer accepting enrollments
   - **Completed**: Past classes

3. Each class shows:
   - Title
   - Date and schedule
   - Enrollment count (verified/total capacity)
   - Status badge
   - Action buttons

#### Class Actions

**View Details & Attendance**

- Click any class card to see:
  - Complete class information
  - Enrolled students list
  - Attendance status for each student
  - Pending payment count

**Mark Attendance**

1. Open the class detail page
2. Find the student in the list
3. Click **"Tandai Hadir"** to mark present
4. Click **"Batalkan"** to unmark
5. Attendance timestamp is recorded automatically

### Verifying Payments

#### Payment Verification Dashboard

1. Go to **Admin** → **"Verifikasi Pembayaran"**
2. You'll see:
   - **Statistics**: Pending and verified counts
   - **Pending Payments**: Students waiting for verification
   - **Verified Payments**: Recently approved payments

#### Verifying a Payment

1. Find the pending payment card
2. Review:
   - Student name and email
   - Class information
   - Payment proof image (click to enlarge)
   - Upload date
3. If payment is valid:
   - Click **"✓ Verifikasi"**
   - Confirm the action
   - Student gains immediate access
4. If payment is invalid:
   - Click **"✗ Tolak"**
   - Student can re-upload

#### Payment Verification Checklist

✅ Check if:

- Payment amount matches (Rp 10,000)
- Transfer receipt is clear and readable
- Bank account matches BIOS account
- Transfer date is recent
- Student information matches

### Attendance Management

#### Marking Attendance

**From Class Detail Page:**

1. Navigate to class details
2. View the participants table
3. Each row shows:
   - Student number
   - Name and email
   - Payment status
   - Attendance status
   - Action button

**To Mark Present:**

- Click **"Tandai Hadir"** button
- Button changes to **"Batalkan"**
- Attendance timestamp recorded
- Row highlights in green

**To Remove Attendance:**

- Click **"Batalkan"** button
- Attendance is removed
- Timestamp is cleared

#### Attendance Statistics

Dashboard shows:

- **Total Terdaftar**: Verified enrollments
- **Hadir**: Students marked present
- **Belum Hadir**: Students not yet marked
- **Pending**: Unverified payments

---

## FAQ

### For Members

**Q: Can I use a non-UBM email?**  
A: No, only `@student.ubm.ac.id` emails are allowed for registration.

**Q: Can I enroll in multiple classes?**  
A: Yes, you can enroll in as many classes as you want (subject to availability).

**Q: What happens if the class is full?**  
A: You won't be able to enroll. The system prevents over-enrollment automatically.

**Q: Can I cancel my enrollment?**  
A: Currently, there's no self-cancel feature. Contact an admin if needed.

**Q: How long does payment verification take?**  
A: It depends on admin availability, typically within 24-48 hours.

**Q: What if my payment is rejected?**  
A: You can re-upload a valid payment proof from your dashboard.

**Q: Can I download materials before the class?**  
A: Yes, once your payment is verified, you can access materials anytime.

**Q: Are practice questions graded?**  
A: No, they are for self-practice. You can retake them unlimited times.

### For Admins

**Q: How do I become an admin?**  
A: Database administrator must manually change your role to 'admin' in the profiles table.

**Q: Can I edit a class after creating it?**  
A: Currently, there's no edit feature. You may need to create a new class or contact database admin.

**Q: Can I delete a class?**  
A: Use the database interface to delete classes. Ensure no active enrollments first.

**Q: What file formats are supported for materials?**  
A: Only PDF files for downloadable materials. Images are allowed for payment proofs.

**Q: Can I close enrollments manually?**  
A: Yes, change the class status in the database or wait for the deadline to pass automatically.

**Q: How do I handle duplicate enrollments?**  
A: The system prevents double enrollment automatically. Each user can only enroll once per class.

**Q: Can I see who attended past classes?**  
A: Yes, navigate to the completed class detail page to see attendance records.

**Q: What if I accidentally reject a valid payment?**  
A: Contact the student to re-upload. The system doesn't have an undo feature.

---

## Contact & Support

For technical issues or questions:

- Contact BIOS administrators
- Check the database logs in Supabase
- Review deployment guide for troubleshooting

---

**Happy Learning! 🎓**

_Built with ❤️ for BIOS Organization, UBM University_
