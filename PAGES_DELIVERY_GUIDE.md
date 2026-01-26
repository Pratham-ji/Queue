# Dynamic Page Delivery System

This system allows you to deliver dynamic pages/content to both **User Mobile** and **Provider Mobile** apps from your backend API.

---

## 📋 Architecture Overview

### Components:
1. **Backend API** (`/api/pages`) - Stores and serves page content
2. **Database Schema** - Prisma `Page` model with role-based access
3. **Mobile Components** - Reusable `ContentScreen` in both apps
4. **Navigation** - Updated to include `ContentPage` route
5. **Hooks** - `useContentNavigation` for easy navigation

---

## 🚀 How It Works

### 1. **Backend Setup** (Already Done)

**Endpoints:**
```
GET /api/pages?role=PROVIDER              # Get all pages for a role
GET /api/pages/{slug}?role=PROVIDER       # Get specific page
POST /api/pages/admin                      # Create/Update page (Admin only)
DELETE /api/pages/admin/{slug}             # Delete page (Admin only)
```

**Example Request:**
```bash
# Get all pages for a USER
curl http://localhost:3000/api/pages?role=USER

# Get a specific page
curl http://localhost:3000/api/pages/faq?role=USER

# Response:
{
  "success": true,
  "page": {
    "id": "uuid-123",
    "slug": "faq",
    "title": "Frequently Asked Questions",
    "content": "Q: How do I join a queue?\nA: Search for a clinic...",
    "type": "HELP",
    "updatedAt": "2026-01-21T10:00:00Z"
  }
}
```

---

## 📱 Using in Mobile Apps

### **User Mobile App**

Navigate to a page:
```tsx
import { useContentNavigation } from "../hooks/useContentNavigation";

export default function SettingsScreen() {
  const { navigateToPage } = useContentNavigation();

  return (
    <View>
      <Button 
        title="View FAQ" 
        onPress={() => navigateToPage("faq", "FAQ")}
      />
      <Button 
        title="Privacy Policy" 
        onPress={() => navigateToPage("privacy-policy")}
      />
      <Button 
        title="How It Works" 
        onPress={() => navigateToPage("how-it-works")}
      />
    </View>
  );
}
```

### **Provider Mobile App**

```tsx
import { useContentNavigation } from "../hooks/useContentNavigation";

export default function SettingsScreen() {
  const { navigateToPage } = useContentNavigation();

  return (
    <View>
      <Button 
        title="Provider Guide" 
        onPress={() => navigateToPage("provider-guide", "Provider Guide", "PROVIDER")}
      />
      <Button 
        title="Queue Management" 
        onPress={() => navigateToPage("queue-management")}
      />
      <Button 
        title="Support" 
        onPress={() => navigateToPage("support")}
      />
    </View>
  );
}
```

---

## 📚 Available Pages (Pre-seeded)

### For Users:
- `how-it-works` - How to use the app
- `faq` - Frequently asked questions
- `privacy-policy` - Privacy policy
- `terms-of-service` - Terms of service

### For Providers:
- `provider-guide` - Provider user guide
- `queue-management` - Queue management guide
- `analytics-help` - Analytics explanation
- `support` - Technical support

### Shared:
- `privacy-policy` - Available to both
- `terms-of-service` - Available to both

---

## 🛠️ How to Add New Pages

### Option 1: Use Seeding Script

Edit [seed-pages.ts](../src/seeds/pages.seed.ts) and add new pages:

```typescript
const pages = [
  {
    slug: "my-new-page",
    title: "My New Page",
    content: "Page content here...",
    type: "GUIDE",
    userRole: ["USER", "PROVIDER"],
  },
  // ... more pages
];
```

Then run:
```bash
npm run seed:pages
```

### Option 2: Create via API

```bash
curl -X POST http://localhost:3000/api/pages/admin \
  -H "Content-Type: application/json" \
  -d '{
    "slug": "my-new-page",
    "title": "My New Page",
    "content": "Page content here...",
    "type": "GUIDE",
    "userRole": ["USER", "PROVIDER"]
  }'
```

---

## 🎨 Page Types

```typescript
enum PageType {
  INFO         // Information pages (How it works, FAQ, etc.)
  TERMS        // Terms & Conditions
  PRIVACY      // Privacy Policy
  GUIDE        // User guides
  HELP         // Help & Support
}
```

---

## 👥 Roles & Access Control

Each page has a `userRole` array that determines who can access it:

```typescript
enum Role {
  USER      // End users (user-mobile app)
  PROVIDER  // Doctors/Clinic staff (provider-mobile app)
  ADMIN     // Administrators
  STAFF     // Clinic staff
}
```

**Example: A page for both users and providers**
```json
{
  "slug": "privacy-policy",
  "userRole": ["USER", "PROVIDER"]
}
```

**Example: Provider-only page**
```json
{
  "slug": "provider-guide",
  "userRole": ["PROVIDER", "ADMIN"]
}
```

---

## 🔄 Database Migration

After updating the Prisma schema, run:

```bash
cd apps/backend
npx prisma migrate dev --name add_page_model
```

---

## 📊 Content Storage Options

### Currently: Plain Text
Pages store content as plain strings.

### Future: Support Rich Content
You can extend to support:

```typescript
// Option 1: JSON structure
content: {
  sections: [
    { type: "heading", text: "Title" },
    { type: "paragraph", text: "Content..." },
    { type: "button", label: "Join Queue" }
  ]
}

// Option 2: HTML
content: "<h1>Title</h1><p>Content...</p>"

// Option 3: Markdown
content: "# Title\n\nContent..."
```

To implement, update the `ContentScreen` component to parse and render accordingly.

---

## 🐛 Troubleshooting

**Page not loading?**
- Check API endpoint: `http://localhost:3000/api/pages/slug-name?role=USER`
- Verify `EXPO_PUBLIC_API_URL` environment variable
- Check browser console for errors

**Access denied error?**
- Ensure the role in the query matches the page's `userRole` array
- User app should use `role=USER`
- Provider app should use `role=PROVIDER`

**Pages not in database?**
- Run: `npm run seed:pages` in backend directory
- Check Prisma logs: `npx prisma studio`

---

## 🎯 Next Steps

1. ✅ Run database migration
2. ✅ Seed initial pages
3. ✅ Add page links to screens (Settings, Help, About sections)
4. ✅ Test navigation in both apps
5. 📝 Create admin panel to manage pages dynamically

---

## 📌 File Structure

```
Queue/
├── apps/
│   ├── backend/
│   │   ├── src/
│   │   │   ├── controllers/page.controller.ts   ← Page logic
│   │   │   ├── routes/page.routes.ts            ← API routes
│   │   │   └── seeds/pages.seed.ts              ← Sample pages
│   │   └── prisma/schema.prisma                 ← DB schema
│   │
│   ├── user-mobile/
│   │   └── src/
│   │       ├── screens/content/ContentScreen.tsx     ← Display page
│   │       ├── hooks/useContentNavigation.ts         ← Navigation hook
│   │       └── navigation/RootNavigator.tsx          ← Routes
│   │
│   └── provider-mobile/
│       └── src/
│           ├── screens/content/ContentScreen.tsx     ← Display page
│           ├── hooks/useContentNavigation.ts         ← Navigation hook
│           └── navigation/RootNavigator.tsx          ← Routes
```

---

## 💡 Example: Adding Help Section to Settings

**User Mobile:**
```tsx
// src/screens/profile/SettingsScreen.tsx
import { useContentNavigation } from "../../hooks/useContentNavigation";

export default function SettingsScreen() {
  const { navigateToPage } = useContentNavigation();

  return (
    <ScrollView>
      <Section>
        <Text style={styles.sectionTitle}>Help</Text>
        <TouchableOpacity onPress={() => navigateToPage("faq", "FAQ")}>
          <Text>FAQ</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigateToPage("how-it-works")}>
          <Text>How It Works</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigateToPage("privacy-policy")}>
          <Text>Privacy Policy</Text>
        </TouchableOpacity>
      </Section>
    </ScrollView>
  );
}
```

---

**All done!** Your app now supports dynamic page delivery from the backend. 🎉
