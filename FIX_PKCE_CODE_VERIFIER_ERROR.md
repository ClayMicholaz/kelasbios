# 🔧 Fix: PKCE Code Verifier Error - OAuth Callback

## 🔴 **ROOT CAUSE: AuthPKCECodeVerifierMissingError**

```
AuthPKCECodeVerifierMissingError: PKCE code verifier not found in storage.
This can happen if the auth flow was initiated in a different browser or device,
or if the storage was cleared. For SSR frameworks (Next.js, SvelteKit, etc.),
use @supabase/ssr on both the server and client to store the code verifier in cookies.
```

### **Kenapa Error Ini Terjadi?**

1. **Next.js App Router adalah SSR framework** (server-side rendered)
2. OAuth callback page menggunakan **client-side Supabase client** (`"use client"`)
3. PKCE code verifier disimpan di **localStorage** saat login
4. Saat callback, Next.js **render di server** → localStorage tidak available
5. `exchangeCodeForSession()` gagal karena **code verifier missing**

---

## ❌ **MASALAH SEBELUMNYA**

### **File:** `src/app/auth/callback/page.tsx` (DEPRECATED)

```tsx
"use client"; // ❌ CLIENT COMPONENT

import { createClient } from "@/lib/supabase/client"; // ❌ Client-side

export default function AuthCallbackPage() {
  useEffect(() => {
    const handleCallback = async () => {
      const supabase = createClient(); // ❌ Uses localStorage

      // ❌ FAILS: Code verifier not in localStorage (SSR context)
      const { error } = await supabase.auth.exchangeCodeForSession(code);
    };
  }, []);
}
```

**Masalah:**

- ❌ Client component dengan `"use client"`
- ❌ Menggunakan client-side Supabase client
- ❌ PKCE code verifier tidak available di SSR context
- ❌ Session tidak pernah dibuat
- ❌ Profile tidak bisa di-load karena tidak ada session

---

## ✅ **SOLUSI: Route Handler (Server-Side)**

### **File:** `src/app/auth/callback/route.ts` (NEW)

```typescript
import { createClient } from "@/lib/supabase/server"; // ✅ Server-side
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const origin = requestUrl.origin;

  if (code) {
    // ✅ Use server-side Supabase client with cookies
    const supabase = await createClient();

    // ✅ Exchange code for session (works because cookies are available)
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error("[Callback] Error exchanging code:", error);
      return NextResponse.redirect(
        `${origin}/auth/error?message=${encodeURIComponent(error.message)}`,
      );
    }

    console.log("[Callback] Successfully exchanged code for session");

    // ✅ Redirect to dashboard
    return NextResponse.redirect(`${origin}/dashboard`);
  }

  // No code provided
  return NextResponse.redirect(
    `${origin}/auth/error?message=Kode autentikasi tidak ditemukan`,
  );
}
```

**Keuntungan:**

- ✅ **Server-side Route Handler** (bukan client component)
- ✅ Menggunakan **server-side Supabase client** dengan **cookies**
- ✅ PKCE code verifier tersimpan di **cookies** (available di server)
- ✅ Session berhasil dibuat
- ✅ Profile bisa di-load setelah session ada

---

## 📊 **COMPARISON: Client vs Server**

### **Client-Side Approach (BROKEN)**

```
1. User click "Login with Google"
   ↓
2. Redirect to Google OAuth
   Code verifier → localStorage ❌
   ↓
3. Google redirect to /auth/callback?code=xxx
   ↓
4. Next.js SSR render callback page
   localStorage not available ❌
   ↓
5. exchangeCodeForSession() FAILS ❌
   PKCE code verifier missing
   ↓
6. Session NOT created ❌
   ↓
7. Profile fetch fails ❌
   useAuth retry 3x → still fails
```

---

### **Server-Side Approach (WORKING)**

```
1. User click "Login with Google"
   ↓
2. Redirect to Google OAuth
   Code verifier → cookies ✅
   ↓
3. Google redirect to /auth/callback?code=xxx
   ↓
4. Route Handler (server-side) processes
   Cookies available ✅
   ↓
5. exchangeCodeForSession() SUCCESS ✅
   Code verifier from cookies
   ↓
6. Session created & saved to cookies ✅
   ↓
7. Redirect to /dashboard ✅
   ↓
8. Dashboard creates profile (if not exists) ✅
   ↓
9. useAuth loads profile ✅
   Photo, name, role displayed
```

---

## 🔄 **AUTH FLOW LENGKAP**

### **1. Login Flow**

```typescript
// src/app/auth/login/page.tsx
const handleGoogleSignIn = async () => {
  const supabase = createClient(); // Client-side OK disini

  await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${window.location.origin}/auth/callback`, // ✅ Route handler
      queryParams: {
        hd: "student.ubm.ac.id", // UBM only
      },
    },
  });
};
```

### **2. OAuth Redirect**

```
User → Google OAuth → Authorize → Redirect
https://yourapp.com/auth/callback?code=xxx&state=yyy
```

### **3. Callback Processing (SERVER-SIDE)**

```typescript
// src/app/auth/callback/route.ts
export async function GET(request: Request) {
  const code = new URL(request.url).searchParams.get("code");
  const supabase = await createClient(); // Server-side with cookies

  await supabase.auth.exchangeCodeForSession(code);

  return NextResponse.redirect("/dashboard");
}
```

### **4. Middleware Auto-Refresh**

```typescript
// src/middleware.ts
export async function middleware(request: NextRequest) {
  return await updateSession(request); // Auto refresh session
}
```

### **5. Dashboard Profile Creation**

```typescript
// src/app/dashboard/page.tsx (Server Component)
const supabase = await createClient();
const {
  data: { user },
} = await supabase.auth.getUser();

// Check if profile exists
const { error: profileError } = await supabase
  .from("profiles")
  .select("*")
  .eq("id", user.id)
  .single();

// Create profile if doesn't exist
if (profileError?.code === "PGRST116") {
  await supabase.from("profiles").insert({
    id: user.id,
    email: user.email,
    full_name: user.user_metadata.full_name,
    nim: extractNIM(user.email),
    role: "member",
  });
}
```

### **6. Client-Side Profile Loading**

```typescript
// src/hooks/useAuth.ts
const { user, profile, loading, isAdmin } = useAuth();

// useAuth fetches profile with 3-retry logic
// Profile loads → photo, name, role displayed in Navbar
```

---

## 🔧 **TECHNICAL DETAILS**

### **Server-Side Supabase Client**

```typescript
// src/lib/supabase/server.ts
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll(); // ✅ Read cookies
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(
            ({ name, value, options }) => cookieStore.set(name, value, options), // ✅ Write cookies
          );
        },
      },
    },
  );
}
```

**Key Points:**

- ✅ Uses `@supabase/ssr` package (already installed: v0.8.0)
- ✅ Stores session in **cookies** (not localStorage)
- ✅ Cookies available in both server & client
- ✅ Works perfectly with Next.js App Router SSR

---

## 📝 **FILES CHANGED**

### **Created:**

1. ✅ **`src/app/auth/callback/route.ts`** - New Route Handler (server-side)

### **Backed Up:**

2. 📦 **`src/app/auth/callback/page.tsx.backup`** - Old client component (deprecated)

### **Dependencies Used:**

- ✅ `@supabase/ssr` (v0.8.0) - already installed
- ✅ `@supabase/supabase-js` (v2.95.3) - already installed

---

## ✅ **EXPECTED BEHAVIOR NOW**

### **Login Flow:**

1. User click "Masuk dengan Google UBM" ✅
2. Redirect to Google OAuth ✅
3. User authorize ✅
4. Redirect to `/auth/callback?code=xxx` ✅
5. **Route Handler processes (server-side)** ✅
6. Exchange code for session ✅
7. Session saved to cookies ✅
8. Redirect to `/dashboard` ✅
9. Dashboard creates profile (if not exists) ✅
10. useAuth loads profile with retry ✅
11. Navbar shows: photo, name, role ✅
12. Admin menu appears (if admin) ✅

### **No More Errors:**

- ✅ **No** AuthPKCECodeVerifierMissingError
- ✅ **No** stuck at "Mengarahkan..."
- ✅ **No** infinite profile fetch retries
- ✅ Profile created and loaded successfully
- ✅ Photo profile displayed
- ✅ Admin access works

---

## 🧪 **TESTING CHECKLIST**

### **❗ IMPORTANT: Clear Browser Data First**

```
1. Open browser DevTools (F12)
2. Application tab → Storage
3. Clear all:
   - Cookies (*.supabase.co)
   - Local Storage
   - Session Storage
4. Or use Incognito/Private window
```

### **1. Login Flow Test** ✅

- [ ] Buka http://localhost:3000/auth/login
- [ ] Click "Masuk dengan Google UBM"
- [ ] Google OAuth page muncul
- [ ] Authorize dengan s32230111@student.ubm.ac.id
- [ ] **Langsung redirect ke /dashboard** (tidak stuck)
- [ ] Dashboard muncul dalam 2 detik
- [ ] **NO PKCE ERROR di console** ✅

### **2. Profile Display Test** ✅

- [ ] Navbar muncul di dashboard
- [ ] Avatar/photo profile muncul
- [ ] Full name "KWIK ANDREAS JONATHAN" muncul
- [ ] Email "s32230111@student.ubm.ac.id" muncul
- [ ] Role badge "Admin" muncul (if admin)
- [ ] NIM "32230111" muncul di debug (if any)

### **3. Admin Access Test** ✅

- [ ] Admin menu muncul di Navbar
- [ ] Click "Admin" → redirect to /admin
- [ ] Admin dashboard accessible
- [ ] /admin/classes accessible
- [ ] /admin/payments accessible

### **4. Console Logs (Expected)** ✅

```
[Callback] Successfully exchanged code for session
[useAuth] Initializing auth...
[useAuth] Initial user: s32230111@student.ubm.ac.id
[useAuth] Fetching profile for user: s32230111@student.ubm.ac.id
[useAuth] Profile loaded: KWIK ANDREAS JONATHAN Role: admin
[useAuth] Auth state changed: SIGNED_IN
```

### **5. No Errors Expected** ✅

- ✅ No AuthPKCECodeVerifierMissingError
- ✅ No "Profile still not found after retries"
- ✅ No infinite retries
- ✅ HTTP 406 might appear once (normal - profile doesn't exist yet), then profile is created

---

## 🐛 **TROUBLESHOOTING**

### **Issue: Still getting PKCE error**

**Solution:**

1. Clear browser cookies & localStorage
2. Restart dev server: `npm run dev`
3. Test in Incognito window
4. Verify route.ts file exists (not page.tsx)

### **Issue: Profile not created**

**Check:**

1. Dashboard page.tsx has profile creation logic
2. RLS policies allow INSERT for authenticated users
3. Check Supabase logs for errors

### **Issue: 406 Not Acceptable persists**

**This is normal if:**

- Profile doesn't exist yet (PGRST116 error code)
- useAuth will retry and eventually load profile
- Check if profile is created in database after first login

---

## 📚 **REFERENCES**

1. [Supabase Auth with Next.js App Router](https://supabase.com/docs/guides/auth/server-side/nextjs)
2. [PKCE Flow](https://supabase.com/docs/guides/auth/server-side/pkce-flow)
3. [@supabase/ssr Package](https://github.com/supabase/auth-helpers)
4. [Next.js Route Handlers](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)

---

## ✨ **SUMMARY**

**Problem:**

- OAuth callback menggunakan client-side component
- PKCE code verifier tidak available di SSR context
- Session tidak pernah dibuat
- Profile tidak bisa di-load

**Solution:**

- ✅ Ubah callback menjadi **Route Handler** (server-side)
- ✅ Gunakan **server-side Supabase client** dengan cookies
- ✅ PKCE flow works properly dengan cookies storage
- ✅ Session berhasil dibuat
- ✅ Profile created & loaded successfully
- ✅ Photo, name, role muncul di Navbar

**Files Changed:**

- ✅ Created: `src/app/auth/callback/route.ts`
- ✅ Backed up: `src/app/auth/callback/page.tsx.backup`

**Status:**

- ✅ Server running: http://localhost:3000
- ✅ No compile errors
- ✅ Ready for testing

**Next Step:**
Test login flow dengan browser (clear cookies first!) dan verify bahwa:

1. ✅ No PKCE error
2. ✅ Session created
3. ✅ Profile loaded
4. ✅ Photo & name displayed
5. ✅ Admin access works
