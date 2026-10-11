# MenuQR 🍽️📱

**MenuQR** is a modern, responsive web application that empowers restaurants, cafes, bakeries, fast-food shops, and home chefs to publish a digital menu, generate an instant QR code, and receive customer orders straight into WhatsApp.

---

## 🚀 Key Features

### 1. Public Customers (Zero friction)
- **No registration required:** Diners browse the digital menu directly by visiting `/menu/:slug` or scanning a QR code.
- **Categorized navigation:** Smooth category filtering, dish photos, descriptions, and real-time availability badges.
- **Interactive Cart & Drawer:** Add items, customize quantities, add special instructions/notes. Persisted locally via `zustand/middleware`.
- **Direct WhatsApp Ordering:** Automatically generates a formatted, URL-encoded WhatsApp order breakdown with itemized subtotals, customer name, and notes directed to the shop's registered WhatsApp phone number.

### 2. Shop Owners (Self-serve dashboard)
- **Fast Onboarding:** Register, fill in shop details (name, slug, WhatsApp number, address, opening hours, currency, and logo upload).
- **Menu Management:**
  - Create, edit, delete, hide, and reorder categories.
  - Create, edit, delete, hide, and reorder products with photos, pricing, and availability switches.
- **QR Code Studio:**
  - Real-time scannable QR code generated for the exact public menu URL.
  - Print-ready card layout with the shop name and "Scan to view menu" badge.
  - One-click PNG download for tabletop stands, packaging, or posters.
- **Clear Approval Status:** Visual indicator for `pending`, `active`, or `paused` status.

### 3. Platform Admins
- **Admin Control Panel:** Dedicated dashboard at `/admin` protected by both frontend route guards and Supabase database Row Level Security (RLS).
- **Shop Verification:** Review pending shops, approve shops to take them live, or pause shops.
- **Search & Filters:** Search shops by name or slug, and filter by status (`all`, `pending`, `active`, `paused`).

---

## 🛠️ Technology Stack

- **Frontend:** React 19 + Vite + TypeScript
- **Routing:** React Router v7
- **Styling:** Tailwind CSS v4 (with warm SaaS design system)
- **Database & Auth:** Supabase (PostgreSQL + Auth + Storage + Row Level Security)
- **Data Fetching & Cache:** TanStack Query (React Query)
- **Forms & Validation:** React Hook Form + Zod
- **State Management:** Zustand (with localStorage persistence)
- **QR Generation:** `qrcode.react`
- **Icons:** Lucide React

---

## 📁 Project Structure

```
├── public/                 # Static assets & favicon
├── src/
│   ├── app/                # App entrypoint, routing, protected route guards
│   ├── components/
│   │   ├── layout/         # Navigation & shared layouts (Public, Dashboard, Admin)
│   │   └── ui/             # Reusable UI components (Modal, FormField, Badge, Spinner)
│   ├── features/
│   │   ├── auth/           # Auth context & Supabase session listener
│   │   └── cart/           # Zustand persistent shopping cart store
│   ├── lib/
│   │   ├── supabase.ts     # Supabase client & storage URL helpers
│   │   ├── utils.ts        # Currency formatting, WhatsApp message builder, image validation
│   │   └── validation.ts   # Zod validation schemas
│   ├── pages/
│   │   ├── admin/          # Admin overview, shops management, settings
│   │   ├── auth/           # Login & Registration pages
│   │   ├── dashboard/      # Owner dashboard: shop, categories, menu, QR code, settings
│   │   ├── menu/           # Public customer menu & WhatsApp checkout drawer
│   │   ├── public/         # Landing, Features, Pricing, Contact, 404
│   │   └── NotFoundPage.tsx
│   ├── types/              # Database entity types
│   ├── index.css           # Tailwind CSS design system tokens
│   └── main.tsx            # React DOM root
├── supabase/
│   └── migrations/
│       ├── 001_initial_schema.sql    # Schema, triggers, indexes & RLS policies
│       └── 002_storage_and_seed.sql  # Storage bucket, policies & optional seed data
├── .env.example            # Environment template
└── README.md
```

---

## 🔐 Security & Row Level Security (RLS)

All Supabase tables have **Row Level Security (RLS) enabled**:

1. **`profiles`**:
   - Users can read and update only their own profile.
   - Users **cannot** escalate their role to `admin` through client updates (enforced by `CHECK (role = (SELECT role FROM profiles WHERE id = auth.uid()))`).
   - Admins can read all profiles.

2. **`shops`**:
   - Public visitors can only view `active` shops.
   - Shop owners can read and update only shops they own (`owner_id = auth.uid()`).
   - Shop owners can only create shops in `pending` status.
   - Shop owners cannot modify the `status` column (enforced by RLS `WITH CHECK`).
   - Admins have full access (`ALL`) to approve or pause shops.

3. **`categories` & `products`**:
   - Public visitors can only query visible categories and available products belonging to `active` shops.
   - Shop owners can manage (`SELECT`, `INSERT`, `UPDATE`, `DELETE`) only categories and products for their own shop.
   - Admins have full management access.

4. **Storage (`shop-assets`)**:
   - Public read access for logos and dish photos.
   - Authenticated shop owners can only upload/delete in their own folder: `<user_id>/*`.
   - 5 MB file size limit and strict image MIME type validation (`image/jpeg`, `image/png`, `image/webp`, `image/gif`).

---

## ⚙️ Local Development Setup

### 1. Prerequisites
- Node.js 18+ and `npm`
- A free account on [Supabase](https://supabase.com)

### 2. Clone and install dependencies
```bash
git clone https://github.com/your-username/MenuQR.git
cd MenuQR
npm install
```

### 3. Configure Supabase Backend
1. Create a new project in your [Supabase Dashboard](https://supabase.com/dashboard).
2. Go to the **SQL Editor** tab in your Supabase project.
3. Open `supabase/migrations/001_initial_schema.sql` and run the entire script.
4. Open `supabase/migrations/002_storage_and_seed.sql` and run the storage bucket and policy commands.
5. (Optional) Run the seed section at the bottom of `002_storage_and_seed.sql` to populate sample menu data.

### 4. Create the First Admin Account
To create an admin securely (never via frontend forms):
1. Register a new account via the MenuQR UI at `/register` (e.g. `admin@menuqr.app`).
2. Go to your Supabase project dashboard -> **Table Editor** -> `profiles`.
3. Locate the row corresponding to your user email and change `role` from `shop_owner` to `admin`:
   ```sql
   UPDATE public.profiles
   SET role = 'admin'
   WHERE id = (SELECT id FROM auth.users WHERE email = 'admin@menuqr.app');
   ```
4. Sign out and sign back in. The `/admin` routes and administrative functions are now accessible.

### 5. Setup Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Update the keys from your Supabase project (**Project Settings -> API**):
```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
VITE_APP_URL=http://localhost:5173
```

### 6. Start Development Server
```bash
npm run dev
```
Open your browser at `http://localhost:5173`.

---

## 🧪 Verification & User Flows

1. **Owner Registration & Shop Creation:**
   - Go to `/register` and create an account.
   - Navigate to `/dashboard/shop` and complete the shop form with a slug (e.g., `the-burger-lab`) and WhatsApp number (with international dial code, e.g. `+923001234567`).
   - The shop appears as **Pending**.
2. **Admin Approval:**
   - Log in with your admin account and visit `/admin/shops`.
   - Locate the pending shop and click **Approve**.
3. **Menu Building:**
   - In the owner dashboard, visit `/dashboard/categories` and add categories (e.g. `Burgers`, `Beverages`).
   - Visit `/dashboard/menu` and add products with prices and optional images.
4. **QR Code Generation:**
   - Visit `/dashboard/qr-code` to preview the scannable QR card and download the high-resolution PNG.
5. **Customer Ordering Flow:**
   - Open `/menu/:slug` in an incognito window or mobile browser.
   - Add items to the cart, adjust quantities, open the cart drawer, input your name and optional note, and tap **Order on WhatsApp**.
   - WhatsApp opens with the pre-formatted order breakdown ready to send.

---

## 🚢 Deployment to Vercel

1. Push your repository to GitHub.
2. Go to [Vercel](https://vercel.com) and click **Add New Project**.
3. Import your MenuQR repository.
4. Set the Framework Preset to **Vite**.
5. Add the following Environment Variables:
   - `VITE_SUPABASE_URL`: Your Supabase Project URL
   - `VITE_SUPABASE_ANON_KEY`: Your Supabase Anonymous Key
   - `VITE_APP_URL`: Your deployed Vercel domain (e.g. `https://menuqr.vercel.app`)
6. Click **Deploy**.
7. In Supabase Dashboard -> **Authentication** -> **URL Configuration**:
   - Add your Vercel URL to **Site URL** and **Redirect URLs**.

---

## 📄 License
MIT License. Built for restaurants and small businesses.
