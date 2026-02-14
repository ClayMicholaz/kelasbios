# Database Schema for BIOS LMS

## Instructions to Setup Supabase Database

Run the following SQL commands in your Supabase SQL Editor:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('member', 'admin')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create classes table
CREATE TABLE classes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  duration_hours DECIMAL NOT NULL,
  classroom TEXT NOT NULL,
  max_participants INTEGER NOT NULL,
  class_date DATE NOT NULL,
  class_time TIME NOT NULL,
  registration_deadline TIMESTAMPTZ NOT NULL,
  materials JSONB DEFAULT '[]'::jsonb,
  practice_questions JSONB,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed', 'completed')),
  created_by UUID REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create enrollments table
CREATE TABLE enrollments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'verified', 'rejected')),
  payment_proof TEXT,
  payment_date TIMESTAMPTZ,
  verified_by UUID REFERENCES profiles(id),
  verified_at TIMESTAMPTZ,
  attended BOOLEAN DEFAULT FALSE,
  attended_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, class_id)
);

-- Create indexes
CREATE INDEX idx_classes_status ON classes(status);
CREATE INDEX idx_classes_registration_deadline ON classes(registration_deadline);
CREATE INDEX idx_enrollments_user_id ON enrollments(user_id);
CREATE INDEX idx_enrollments_class_id ON enrollments(class_id);
CREATE INDEX idx_enrollments_payment_status ON enrollments(payment_status);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Classes policies
CREATE POLICY "Classes are viewable by everyone" ON classes
  FOR SELECT USING (true);

CREATE POLICY "Only admins can insert classes" ON classes
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Only admins can update classes" ON classes
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Only admins can delete classes" ON classes
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Enrollments policies
CREATE POLICY "Users can view their own enrollments" ON enrollments
  FOR SELECT USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Users can create their own enrollments" ON enrollments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own enrollments" ON enrollments
  FOR UPDATE USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Function to prevent overseat
CREATE OR REPLACE FUNCTION check_class_capacity()
RETURNS TRIGGER AS $$
BEGIN
  IF (
    SELECT COUNT(*)
    FROM enrollments
    WHERE class_id = NEW.class_id AND payment_status = 'verified'
  ) >= (
    SELECT max_participants
    FROM classes
    WHERE id = NEW.class_id
  ) THEN
    RAISE EXCEPTION 'Class is full';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER prevent_overseat
  BEFORE INSERT OR UPDATE ON enrollments
  FOR EACH ROW
  WHEN (NEW.payment_status = 'verified')
  EXECUTE FUNCTION check_class_capacity();

-- Function to handle new user registration
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    'member'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- Updated at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_classes_updated_at BEFORE UPDATE ON classes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_enrollments_updated_at BEFORE UPDATE ON enrollments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create storage bucket for payment proofs
INSERT INTO storage.buckets (id, name, public) VALUES ('payment-proofs', 'payment-proofs', false);

-- Storage policies for payment proofs
CREATE POLICY "Users can upload their own payment proofs" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'payment-proofs' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view their own payment proofs" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'payment-proofs' AND (
      auth.uid()::text = (storage.foldername(name))[1] OR
      EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
      )
    )
  );

-- Create storage bucket for class materials
INSERT INTO storage.buckets (id, name, public) VALUES ('class-materials', 'class-materials', false);

-- Storage policies for class materials
CREATE POLICY "Admins can upload class materials" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'class-materials' AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Enrolled users can view class materials" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'class-materials' AND (
      EXISTS (
        SELECT 1 FROM enrollments
        JOIN classes ON enrollments.class_id = classes.id
        WHERE enrollments.user_id = auth.uid()
          AND enrollments.payment_status = 'verified'
          AND classes.id::text = (storage.foldername(name))[1]
      ) OR
      EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
      )
    )
  );
```

## Database Schema Overview

### Tables

1. **profiles** - User profiles linked to Supabase Auth
   - id (UUID, FK to auth.users)
   - email
   - full_name
   - role (member/admin)

2. **classes** - Course/class information
   - id (UUID)
   - title, description
   - duration_hours
   - classroom
   - max_participants
   - class_date, class_time
   - registration_deadline
   - materials (JSONB array)
   - practice_questions (JSONB)
   - status (open/closed/completed)
   - created_by (FK to profiles)

3. **enrollments** - Student enrollments and payments
   - id (UUID)
   - user_id (FK to profiles)
   - class_id (FK to classes)
   - payment_status (pending/verified/rejected)
   - payment_proof (storage URL)
   - payment_date
   - verified_by (FK to profiles)
   - verified_at
   - attended (boolean)
   - attended_at

### Security Features

- Row Level Security (RLS) enabled on all tables
- Automatic profile creation on user registration
- Email domain validation (@student.ubm.ac.id)
- Overseat prevention trigger
- Unique constraint on user_id + class_id to prevent duplicate enrollments
- Storage policies for secure file uploads

### Storage Buckets

1. **payment-proofs** - User payment proof uploads
2. **class-materials** - PDF and other class materials
