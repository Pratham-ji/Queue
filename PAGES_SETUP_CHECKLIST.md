# 📋 Page Delivery System - Setup Checklist

## ✅ What's Been Implemented

### Backend (Already Done)
- [x] Added `Page` model to Prisma schema
- [x] Created `page.controller.ts` with CRUD operations
- [x] Created `page.routes.ts` with API endpoints
- [x] Updated `app.ts` to include page routes
- [x] Created seed script with sample pages
- [x] Added role-based access control (PROVIDER, USER, ADMIN, STAFF)

**API Endpoints Ready:**
```
GET    /api/pages?role=USER              # List all pages
GET    /api/pages/{slug}?role=USER       # Get single page
POST   /api/pages/admin                  # Create/Update page
DELETE /api/pages/admin/{slug}           # Delete page
```

### User Mobile App
- [x] Created `ContentScreen.tsx` component
- [x] Updated `RootNavigator.tsx` with ContentPage route
- [x] Created `useContentNavigation.ts` hook

### Provider Mobile App
- [x] Created `ContentScreen.tsx` component
- [x] Updated `RootNavigator.tsx` with ContentPage route
- [x] Created `useContentNavigation.ts` hook

---

## 🔧 Setup Steps (What You Need to Do)

### Step 1: Database Migration
```bash
cd apps/backend
npx prisma migrate dev --name add_page_model
```
**What it does:** Creates the `Page` table in your PostgreSQL database

---

### Step 2: Seed Sample Pages
```bash
cd apps/backend
npx ts-node src/seeds/pages.seed.ts
```
**What it does:** Adds 8 sample pages to the database:
- For Users: how-it-works, faq
- For Providers: provider-guide, queue-management, analytics-help
- For Both: privacy-policy, terms-of-service, support

**Verify with:**
```bash
npx prisma studio  # Opens admin UI to view database
```

---

### Step 3: Test Backend Endpoints

**Get all USER pages:**
```bash
curl "http://localhost:3000/api/pages?role=USER"
```

**Get specific page:**
```bash
curl "http://localhost:3000/api/pages/faq?role=USER"
```

**Expected response:**
```json
{
  "success": true,
  "page": {
    "id": "uuid-123",
    "slug": "faq",
    "title": "Frequently Asked Questions",
    "content": "Q: How do I join a queue?...",
    "type": "HELP",
    "updatedAt": "2026-01-21T10:00:00Z"
  }
}
```

---

### Step 4: Update Environment Variables (Mobile Apps)

**user-mobile/.env.local** or **.env**:
```
EXPO_PUBLIC_API_URL=http://localhost:3000
```

**provider-mobile/.env.local** or **.env**:
```
EXPO_PUBLIC_API_URL=http://localhost:3000
```

If deployed:
```
EXPO_PUBLIC_API_URL=https://api.yourdomain.com
```

---

### Step 5: Add Navigation Links

Add links in your screens to test. Example:

**user-mobile/src/screens/profile/SettingsScreen.tsx:**
```tsx
import { useContentNavigation } from "../../hooks/useContentNavigation";

export default function SettingsScreen() {
  const { navigateToPage } = useContentNavigation();

  return (
    <TouchableOpacity onPress={() => navigateToPage("faq", "FAQ")}>
      <Text>View FAQ</Text>
    </TouchableOpacity>
  );
}
```

---

### Step 6: Test in Mobile App

1. Start backend: `npm run dev` (in apps/backend)
2. Start user-mobile: `npm start` (in apps/user-mobile)
3. Tap the link you added
4. Page should load from backend! ✨

---

## 🎯 Common Tasks

### Add a New Page

**Option A: Via API (Recommended for testing)**
```bash
curl -X POST http://localhost:3000/api/pages/admin \
  -H "Content-Type: application/json" \
  -d '{
    "slug": "refund-policy",
    "title": "Refund Policy",
    "content": "Our refund policy...",
    "type": "INFO",
    "userRole": ["USER", "PROVIDER"]
  }'
```

**Option B: Via Seed Script (For initial setup)**
1. Edit `apps/backend/src/seeds/pages.seed.ts`
2. Add your page to the `pages` array
3. Run: `npx ts-node src/seeds/pages.seed.ts`

---

### Add Link in a Screen

```tsx
import { useContentNavigation } from "../hooks/useContentNavigation";

function MyScreen() {
  const { navigateToPage } = useContentNavigation();

  return (
    <Button
      title="View Help"
      onPress={() => navigateToPage("my-slug", "Display Title")}
    />
  );
}
```

---

### Update Page Content

```bash
curl -X POST http://localhost:3000/api/pages/admin \
  -H "Content-Type: application/json" \
  -d '{
    "slug": "faq",
    "title": "Updated FAQ",
    "content": "New content...",
    "type": "HELP",
    "userRole": ["USER"]
  }'
```
This will update the existing page (upsert).

---

### Delete a Page

```bash
curl -X DELETE http://localhost:3000/api/pages/admin/my-slug
```

---

## 🧪 Testing Checklist

- [ ] Database migration completed without errors
- [ ] Sample pages seeded successfully
- [ ] `GET /api/pages?role=USER` returns 4+ pages
- [ ] `GET /api/pages/faq?role=USER` returns specific page
- [ ] Environment variables set in both mobile apps
- [ ] Navigation links added to a test screen
- [ ] Tap link in user-mobile → page loads ✨
- [ ] Tap link in provider-mobile → page loads ✨
- [ ] Try with role=PROVIDER → provider pages load
- [ ] Invalid role returns error
- [ ] Deleted page returns 404

---

## 🐛 Troubleshooting

| Problem | Solution |
|---------|----------|
| Migration fails | Check PostgreSQL connection, delete old migrations |
| No pages in database | Run seed script: `npx ts-node src/seeds/pages.seed.ts` |
| Page returns 404 | Check slug name, verify in Prisma Studio |
| Access denied error | Ensure `userRole` array contains the requested role |
| App doesn't connect to backend | Check `EXPO_PUBLIC_API_URL` environment variable |
| Page content not displaying | Check browser console for API errors |

---

## 📊 Database Schema

```typescript
model Page {
  id        String   @id @default(uuid())
  slug      String   @unique              // URL-friendly identifier
  title     String                        // Display title
  content   String                        // Page content (plain text/HTML)
  type      PageType @default(INFO)       // Category
  userRole  Role[]   @default([PROVIDER]) // Who can access
  updatedAt DateTime @updatedAt           // Last update time
  createdAt DateTime @default(now())      // Created time
}

enum PageType {
  INFO, TERMS, PRIVACY, GUIDE, HELP
}

enum Role {
  USER, PROVIDER, ADMIN, STAFF
}
```

---

## 🚀 Next: Advanced Features

### 1. Admin Panel
Create a dashboard to manage pages without API calls
- List all pages
- Create/Edit/Delete pages
- Manage who can access each page

### 2. Rich Content
Support Markdown or HTML formatting:
```typescript
content: "# Heading\n\nParagraph with **bold** text"
```

### 3. Caching
Store pages locally in AsyncStorage for offline access:
```tsx
const [cachedPages, setCachedPages] = useAsyncStorage('pages');
```

### 4. Search
Add search functionality to find pages

### 5. Analytics
Track which pages users view most

---

## 📚 Files Reference

```
Queue/
├── apps/backend/
│   ├── src/
│   │   ├── controllers/page.controller.ts     ← Page logic
│   │   ├── routes/page.routes.ts              ← API endpoints
│   │   └── seeds/pages.seed.ts                ← Sample data
│   └── prisma/schema.prisma                   ← Database schema
│
├── apps/user-mobile/
│   └── src/
│       ├── screens/content/ContentScreen.tsx  ← Display component
│       ├── hooks/useContentNavigation.ts      ← Navigation hook
│       └── navigation/RootNavigator.tsx       ← Routes
│
├── apps/provider-mobile/
│   └── src/
│       ├── screens/content/ContentScreen.tsx  ← Display component
│       ├── hooks/useContentNavigation.ts      ← Navigation hook
│       └── navigation/RootNavigator.tsx       ← Routes
│
├── PAGES_DELIVERY_GUIDE.md                    ← Full documentation
├── PAGES_EXAMPLES.tsx                         ← Code examples
└── PAGES_SETUP_CHECKLIST.md                   ← This file
```

---

## ✨ That's It!

Your apps now have a complete system to deliver dynamic pages from the backend to both user and provider mobile apps. 

**Next action:** Run the setup steps above and test it out! 🎉

Questions? Check:
1. [PAGES_DELIVERY_GUIDE.md](PAGES_DELIVERY_GUIDE.md) - Full reference
2. [PAGES_EXAMPLES.tsx](PAGES_EXAMPLES.tsx) - Code examples
3. Backend logs for errors
4. Prisma Studio to inspect database
