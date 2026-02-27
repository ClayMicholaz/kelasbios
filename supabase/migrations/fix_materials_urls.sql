-- Fix materials URLs to include classId folder in the path
-- The storage structure is: class-materials/{classId}/filename
-- But URLs in database are missing the {classId} folder

-- Update materials URLs for class 8f0203a9-80c7-44b2-983e-5fd8ec7ed8cf
UPDATE classes
SET materials = '[
  {
    "url": null,
    "name": "Struktur Data"
  },
  {
    "url": null,
    "name": "Pemrograman Berorientasi Objek"
  },
  {
    "url": "https://ezcpwobnfntjfrytaorq.supabase.co/storage/v1/object/public/class-materials/8f0203a9-80c7-44b2-983e-5fd8ec7ed8cf/RANGKUMAN_PBO.md",
    "name": "RANGKUMAN_PBO.md"
  },
  {
    "url": "https://ezcpwobnfntjfrytaorq.supabase.co/storage/v1/object/public/class-materials/8f0203a9-80c7-44b2-983e-5fd8ec7ed8cf/RANGKUMAN_PBO.pdf",
    "name": "RANGKUMAN_PBO.pdf"
  },
  {
    "url": "https://ezcpwobnfntjfrytaorq.supabase.co/storage/v1/object/public/class-materials/8f0203a9-80c7-44b2-983e-5fd8ec7ed8cf/RANGKUMAN_STRUKTUR_DATA.md",
    "name": "RANGKUMAN_STRUKTUR_DATA.md"
  },
  {
    "url": "https://ezcpwobnfntjfrytaorq.supabase.co/storage/v1/object/public/class-materials/8f0203a9-80c7-44b2-983e-5fd8ec7ed8cf/RANGKUMAN_STRUKTUR_DATA.pdf",
    "name": "RANGKUMAN_STRUKTUR_DATA.pdf"
  }
]'::jsonb
WHERE id = '8f0203a9-80c7-44b2-983e-5fd8ec7ed8cf';

-- Verify the update
SELECT title, materials FROM classes WHERE id = '8f0203a9-80c7-44b2-983e-5fd8ec7ed8cf';
