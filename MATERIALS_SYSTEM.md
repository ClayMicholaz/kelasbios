# Materials System Documentation

## Overview

Sistem untuk menampilkan materi kelas dengan access control yang ketat. Materi dapat berupa:

- **Markdown (.md)**: Ditampilkan langsung di browser (tidak dapat didownload)
- **PDF (.pdf)**: Dapat didownload oleh member
- **File lainnya**: Dapat didownload oleh member

## Access Control

Member dapat mengakses materi HANYA jika:

1. ✅ User sudah login
2. ✅ User terdaftar (enrolled) di kelas tersebut
3. ✅ Payment status = 'verified'
4. ✅ Kelas sudah dimulai (waktu sekarang >= class_date + class_time)

## Setup Supabase Storage

### 1. Buat Storage Bucket

```sql
-- Di Supabase Dashboard: Storage > Create Bucket
-- Bucket name: class-materials
-- Public: false (untuk security)
```

### 2. Setup RLS Policies

```sql
-- Policy untuk membaca materials (sudah di-handle oleh API route)
-- Tidak perlu RLS khusus karena download lewat server-side API

-- Policy untuk admin upload (opsional, bisa lewat Dashboard)
CREATE POLICY "Admins can upload materials"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'class-materials'
  AND auth.uid() IN (
    SELECT user_id FROM profiles WHERE role = 'admin'
  )
);
```

## Struktur File di Storage

```
class-materials/
├── {classId}/
│   ├── Materi-Pertemuan-1.md
│   ├── Materi-Pertemuan-2.md
│   ├── Soal-Latihan.pdf
│   └── ...
```

**Path format**: `class-materials/{classId}/filename.ext`

## Upload Materials

### Via Supabase Dashboard

1. Buka Supabase Dashboard > Storage > class-materials
2. Create folder dengan nama `classId` (contoh: `123e4567-e89b-12d3-a456-426614174000`)
3. Upload file markdown atau PDF ke folder tersebut
4. Copy public URL yang dihasilkan

### Contoh URL:

```
https://your-project.supabase.co/storage/v1/object/public/class-materials/123e4567-e89b-12d3-a456-426614174000/Materi-Pertemuan-1.md
```

## Update Database

Setelah upload ke Storage, update `classes` table:

```sql
UPDATE classes
SET materials = jsonb_build_array(
  jsonb_build_object(
    'name', 'Materi Pertemuan 1',
    'url', 'https://your-project.supabase.co/storage/v1/object/public/class-materials/{classId}/Materi-Pertemuan-1.md'
  ),
  jsonb_build_object(
    'name', 'Soal Latihan',
    'url', 'https://your-project.supabase.co/storage/v1/object/public/class-materials/{classId}/Soal-Latihan.pdf'
  )
)
WHERE id = '{classId}';
```

Atau via Supabase Dashboard:

1. Table Editor > classes
2. Find class by ID
3. Edit `materials` column (JSON format):

```json
[
  {
    "name": "Materi Pertemuan 1",
    "url": "https://your-project.supabase.co/storage/v1/object/public/class-materials/{classId}/Materi-Pertemuan-1.md"
  },
  {
    "name": "Soal Latihan",
    "url": "https://your-project.supabase.co/storage/v1/object/public/class-materials/{classId}/Soal-Latihan.pdf"
  }
]
```

## Contoh Markdown File

### Basic Markdown

````markdown
# Materi Pertemuan 1: Pengenalan Pemrograman

## Tujuan Pembelajaran

- Memahami konsep dasar pemrograman
- Mengenal syntax JavaScript
- Praktik coding sederhana

## Pengenalan JavaScript

JavaScript adalah bahasa pemrograman yang digunakan untuk membuat website interaktif.

### Contoh Code

```javascript
function greet(name) {
  console.log(`Hello, ${name}!`);
}

greet("World");
```
````

## Tabel Reference

| Operator | Description    | Example |
| -------- | -------------- | ------- |
| +        | Addition       | 5 + 3   |
| -        | Subtraction    | 5 - 3   |
| \*       | Multiplication | 5 \* 3  |
| /        | Division       | 6 / 3   |

## Tugas

1. Buat function untuk menghitung luas persegi
2. Implementasikan loop untuk print 1-10
3. Buat array dan tampilkan semua elemennya

> **Note:** Kumpulkan tugas sebelum pertemuan berikutnya!

````

### Advanced Markdown Features
- GitHub Flavored Markdown (GFM) supported
- Tables: `| Header | Header |`
- Code blocks with syntax highlighting: ` ```language `
- Task lists: `- [ ] Todo`
- Strikethrough: `~~text~~`
- Blockquotes: `> quote`
- Images: `![alt](url)`
- Links: `[text](url)`

## API Endpoint

### GET `/api/class/[classId]/materials`

**Request:**
```bash
curl -X GET "https://your-domain.com/api/class/{classId}/materials" \
  -H "Cookie: your-session-cookie"
````

**Response (Success):**

```json
{
  "materials": [
    {
      "name": "Materi Pertemuan 1",
      "content": "# Markdown content here...",
      "type": "markdown"
    },
    {
      "name": "Soal Latihan",
      "url": "https://.../Soal-Latihan.pdf",
      "content": null,
      "type": "pdf"
    }
  ],
  "classTitle": "Pemrograman Web",
  "classDate": "2026-03-01"
}
```

**Response (Errors):**

- `401`: Unauthorized (not logged in)
- `403`: Forbidden (not enrolled, payment not verified, or class not started)
- `404`: Class not found

## Frontend Components

### MaterialsViewer Component

Located: `src/components/MaterialsViewer.tsx`

**Features:**

- ✅ Auto-fetch materials from API
- ✅ Loading & error states
- ✅ Tabs for multiple materials
- ✅ Markdown rendering with syntax highlighting
- ✅ PDF download button (red)
- ✅ Other files download button (primary)
- ❌ NO download for markdown files (display only)

**Usage:**

```tsx
import MaterialsViewer from "@/components/MaterialsViewer";

<MaterialsViewer classId={classData.id} />;
```

## Security Features

### API Route Protection

- ✅ Authentication check (Supabase Auth)
- ✅ Enrollment verification (RLS)
- ✅ Payment status check
- ✅ Time-based access (class must have started)
- ✅ Server-side file download (hides storage URLs)

### Markdown Security

- ✅ rehype-sanitize: Prevents XSS attacks
- ✅ rehype-raw: Safely handles HTML in markdown
- ✅ Content served without download URL (view-only)

## Testing Checklist

### Before Class Starts

- [ ] Unenrolled user: Should see "You are not enrolled" (403)
- [ ] Enrolled but payment pending: Should see "Payment not verified yet" (403)
- [ ] Enrolled but payment verified: Should see "Materials not available yet" (403) with class start time

### After Class Starts

- [ ] Enrolled + verified: Should see MaterialsViewer
- [ ] Markdown files: Display in browser with proper styling
- [ ] Markdown files: NO download button visible
- [ ] PDF files: Show download button (red)
- [ ] Code blocks: Syntax highlighting working
- [ ] Tables: Properly formatted
- [ ] Multiple materials: Tabs working correctly

### Error Cases

- [ ] No materials uploaded: "No materials available for this class"
- [ ] Failed to load markdown: "Failed to load material content"
- [ ] Invalid class ID: "Class not found" (404)

## Tips for Admin

### Best Practices

1. **Naming Convention**: Use descriptive names
   - Good: `Materi-Pertemuan-1-Pengenalan.md`
   - Bad: `materi1.md`

2. **File Size**: Keep markdown files < 1MB for fast loading

3. **Images in Markdown**: Upload images to Storage first, then reference in markdown:

   ```markdown
   ![Diagram](https://your-project.supabase.co/storage/v1/object/public/class-materials/{classId}/image.png)
   ```

4. **Code Formatting**: Always specify language for syntax highlighting:

   ````markdown
   ```javascript
   // code here
   ```
   ````

5. **Test Before Publishing**: Upload to test class first

### Common Issues

**Q: Markdown tidak muncul, hanya "No content available"**

- A: Pastikan file extension `.md` dan URL benar di database

**Q: PDF tidak bisa didownload**

- A: Check bucket `class-materials` public access atau RLS policies

**Q: Materials tidak muncul sama sekali**

- A: Verify:
  1. User enrolled di class
  2. Payment status = 'verified'
  3. Class sudah dimulai (class_date + class_time < now)
  4. Field `materials` di database tidak null

**Q: Code syntax highlighting tidak bekerja**

- A: Pastikan specify language di code block: ` ```javascript `

## Future Enhancements

### Admin Panel Improvements

- [ ] File upload UI in admin panel
- [ ] Markdown editor with preview
- [ ] Drag-and-drop file upload
- [ ] Bulk upload multiple files
- [ ] Materials ordering (reorder tabs)

### Student Features

- [ ] Progress tracking (materials read)
- [ ] Bookmark specific sections
- [ ] Print-friendly view for markdown
- [ ] Search within materials
- [ ] Materials comments/discussions

### Advanced Features

- [ ] Video embedding support
- [ ] Interactive code playground
- [ ] Quiz integration
- [ ] Materials versioning
- [ ] Download all materials as ZIP (PDF only)

## Changelog

### v1.0 (Current)

- ✅ Markdown viewer with GFM support
- ✅ PDF download functionality
- ✅ Access control (enrollment + payment + time)
- ✅ Multi-material tabs interface
- ✅ Responsive design
- ✅ Error handling & loading states
