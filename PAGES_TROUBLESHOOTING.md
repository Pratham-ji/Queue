# 🆘 Error Handling & Troubleshooting Guide

## API Error Responses

### 1. Missing Role Parameter
```
Request: GET /api/pages/faq
Response: 400 Bad Request

{
  "error": "Missing role parameter. Use: /api/pages?role=PROVIDER"
}
```

**Fix:** Always include `?role=PROVIDER` or `?role=USER`

---

### 2. Invalid Role
```
Request: GET /api/pages/faq?role=SUPERUSER
Response: 400 Bad Request

{
  "error": "Invalid role. Allowed: PROVIDER, ADMIN, STAFF, USER"
}
```

**Valid roles:** `PROVIDER`, `ADMIN`, `STAFF`, `USER`

---

### 3. Page Not Found
```
Request: GET /api/pages/nonexistent?role=USER
Response: 404 Not Found

{
  "error": "Page not found"
}
```

**Fix:** Check slug spelling, verify page exists in database

---

### 4. Access Denied
```
Request: GET /api/pages/provider-guide?role=USER
Response: 403 Forbidden

{
  "error": "Access denied. You don't have permission to view this page."
}
```

**Fix:** Check page's `userRole` array - ensure it includes your role

---

### 5. Server Error
```
Request: GET /api/pages
Response: 500 Internal Server Error

{
  "error": "Failed to fetch pages",
  "details": "Connection refused to database"
}
```

**Fix:** Check backend logs, verify database connection

---

## Mobile App Error Scenarios

### Scenario 1: Network Error

**Problem:** No internet connection
```tsx
// ContentScreen will show:
setError("Something went wrong");
// Display: ❌ Something went wrong
```

**Solution:**
```tsx
const fetchPage = async () => {
  try {
    const response = await fetch(`${API_URL}/api/pages/${slug}?role=${role}`);
    // ...
  } catch (err) {
    if (err instanceof TypeError) {
      setError("Network error. Check your connection.");
    } else {
      setError(err.message);
    }
  }
};
```

---

### Scenario 2: Wrong API URL

**Problem:** `EXPO_PUBLIC_API_URL` not set or wrong
```
App tries: http://undefined/api/pages/faq
Result: Network error
```

**Solution:**
```tsx
// user-mobile/.env or .env.local
EXPO_PUBLIC_API_URL=http://192.168.1.100:3000
// or for production
EXPO_PUBLIC_API_URL=https://api.yourdomain.com
```

**Verify:**
```tsx
console.log(process.env.EXPO_PUBLIC_API_URL);
```

---

### Scenario 3: Page Role Mismatch

**Problem:** User tries to access provider-only page
```tsx
// navigateToPage("provider-guide", "title", "USER")
// Backend returns: 403 Forbidden
// App shows: ❌ Access denied. You don't have permission...
```

**Solution:**
Check that user's role matches page's userRole array:

```tsx
// pages.seed.ts - check this
{
  slug: "provider-guide",
  userRole: ["PROVIDER", "ADMIN"]  // USER not here = access denied
}
```

---

### Scenario 4: API Not Running

**Problem:** Backend server is down
```
ConnectionError: Connection refused
```

**Check:**
```bash
# Terminal 1: Start backend
cd apps/backend
npm run dev
# Should show: Server running on http://localhost:3000

# Terminal 2: Test endpoint
curl http://localhost:3000/api/pages?role=USER
# Should return: {"success":true, "role":"USER", "count":4, "pages":[...]}
```

---

## Debugging Tips

### 1. Check Mobile Console
```tsx
// Add logging to ContentScreen
const fetchPage = async () => {
  console.log("📍 Fetching page:", slug);
  console.log("📍 Role:", role);
  console.log("📍 API URL:", API_URL);
  
  try {
    const response = await fetch(`${API_URL}/api/pages/${slug}?role=${role}`);
    console.log("📍 Response status:", response.status);
    const data = await response.json();
    console.log("📍 Response data:", data);
    setPage(data.page);
  } catch (err) {
    console.error("❌ Error:", err);
    setError(err.message);
  }
};
```

### 2. Check Backend Logs
```bash
# Backend terminal shows each request
[GET] /api/pages?role=USER
[GET] /api/pages/faq?role=USER
[POST] /api/pages/admin
```

### 3. Test API Manually
```bash
# Get all user pages
curl "http://localhost:3000/api/pages?role=USER"

# Get specific page
curl "http://localhost:3000/api/pages/faq?role=USER"

# Create page
curl -X POST http://localhost:3000/api/pages/admin \
  -H "Content-Type: application/json" \
  -d '{"slug":"test","title":"Test","content":"Test content","type":"INFO","userRole":["USER"]}'
```

### 4. Check Database with Prisma Studio
```bash
cd apps/backend
npx prisma studio
# Opens admin UI at http://localhost:5555
```

---

## Common Issues & Solutions

| Issue | Symptoms | Solution |
|-------|----------|----------|
| Wrong API URL | Network error | Set `EXPO_PUBLIC_API_URL` env var |
| Backend not running | Connection refused | `npm run dev` in backend folder |
| Database not migrated | Table doesn't exist | `npx prisma migrate dev` |
| No pages seeded | Empty pages list | `npx ts-node src/seeds/pages.seed.ts` |
| Wrong role | 403 Forbidden | Check page's `userRole` array |
| Page slug typo | 404 Not found | Verify spelling in navigation call |
| CORS error | Blocked by browser | Already handled in backend |
| Outdated npm packages | Weird errors | `npm install` & `npm audit fix` |
| TypeScript errors | Build fails | Check imports and types |

---

## Enhanced Error Handling

### Add Better Error Messages to ContentScreen

```tsx
const fetchPage = async () => {
  try {
    setLoading(true);
    setError(null);

    const response = await fetch(
      `${API_URL}/api/pages/${slug}?role=${role}`
    );

    // Handle different error codes
    if (response.status === 404) {
      setError("📄 Page not found. It may have been deleted.");
    } else if (response.status === 403) {
      setError("🔒 You don't have access to this page.");
    } else if (response.status === 400) {
      setError("⚠️ Invalid request. Contact support.");
    } else if (!response.ok) {
      setError(`❌ Error ${response.status}: Please try again later.`);
    } else {
      const data = await response.json();
      setPage(data.page);
    }
  } catch (err) {
    // Network errors
    if (err instanceof TypeError) {
      setError("🌐 Network error. Check your internet connection.");
    } else {
      setError("🔧 Something went wrong. Please try again.");
    }
    console.error("Fetch error:", err);
  } finally {
    setLoading(false);
  }
};
```

### Add Retry Button

```tsx
if (error) {
  return (
    <View style={styles.errorContainer}>
      <Text style={styles.errorText}>{error}</Text>
      <TouchableOpacity onPress={fetchPage}>
        <Text style={styles.retryButton}>🔄 Retry</Text>
      </TouchableOpacity>
    </View>
  );
}
```

---

## Testing Checklist

- [ ] Backend server running (`npm run dev`)
- [ ] Database migrated (`prisma migrate dev`)
- [ ] Pages seeded (`npx ts-node src/seeds/pages.seed.ts`)
- [ ] API endpoint responds (`curl http://localhost:3000/api/pages?role=USER`)
- [ ] `EXPO_PUBLIC_API_URL` set correctly in mobile app
- [ ] Role matches page's `userRole` array
- [ ] NetworkError shows network error, not blank
- [ ] 404 shows "Page not found"
- [ ] 403 shows "Access denied"
- [ ] Retry button works after error
- [ ] Page content displays after successful fetch

---

## Performance Debugging

### Slow Page Loading?

```tsx
// Add timing logs
const fetchPage = async () => {
  const startTime = performance.now();
  
  try {
    const response = await fetch(...);
    const data = await response.json();
    setPage(data.page);
    
    const endTime = performance.now();
    console.log(`Page loaded in ${endTime - startTime}ms`);
  } catch (err) {
    // ...
  }
};
```

If > 1 second:
- Check network (WiFi vs cellular)
- Check backend logs for slow queries
- Add caching to mobile app

---

## Support

**Still stuck?**

1. Check all documentation files:
   - `PAGES_DELIVERY_GUIDE.md`
   - `PAGES_SETUP_CHECKLIST.md`
   - `PAGES_EXAMPLES.tsx`

2. Review backend logs:
   ```bash
   cd apps/backend && npm run dev
   ```

3. Inspect database:
   ```bash
   npx prisma studio
   ```

4. Test API manually:
   ```bash
   curl http://localhost:3000/api/pages?role=USER
   ```

5. Check mobile console for errors

---

**Most common issues:**
1. ❌ `EXPO_PUBLIC_API_URL` not set → ✅ Set it in `.env`
2. ❌ Backend not running → ✅ `npm run dev`
3. ❌ Database not migrated → ✅ `npx prisma migrate dev`
4. ❌ Pages not seeded → ✅ Run seed script
5. ❌ Wrong role used → ✅ Check page's `userRole` array

Good luck! 🚀
