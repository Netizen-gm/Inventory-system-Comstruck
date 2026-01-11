# Troubleshooting: Products, Sales, and Staff Pages Not Loading

## Common Issues and Solutions

### 1. Pages Show "Loading..." Forever

**Possible Causes:**
- API request is hanging
- Backend is not responding
- Network/CORS issues
- Authentication token expired

**Solutions:**
1. **Check Browser Console (F12)**
   - Look for errors in the Console tab
   - Check Network tab to see if API requests are pending or failing

2. **Check Backend Status**
   ```bash
   curl http://localhost:3000/health
   ```
   Should return: `{"status":"OK","database":"connected",...}`

3. **Verify Authentication**
   - Check if you're logged in
   - Try logging out and logging back in
   - Check localStorage for tokens (DevTools → Application → Local Storage)

4. **Check User Role**
   - Products: Requires `ADMIN` or `WAREHOUSE` role
   - Sales: Requires `ADMIN` or `MANAGER` role
   - Staff: Requires `ADMIN` or `MANAGER` role
   
   If you're a `USER`, you won't have access to these pages.

### 2. Pages Show Empty Tables

**This is Normal!**
- If there's no data in the database, pages will show "No products/sales/staff found"
- This is expected behavior for a new system

**To Add Data:**
- Use the API endpoints to create products, sales, or staff
- Or use the frontend forms (if implemented)
- Or use MongoDB directly to add test data

### 3. Error Messages Appear

**401 Unauthorized:**
- Your session expired
- **Solution:** Log out and log back in

**403 Forbidden:**
- Your user role doesn't have permission
- **Solution:** Use an admin account or update your user role

**Cannot connect to server:**
- Backend is not running
- **Solution:** Start the backend: `cd backend && npm run dev`

**Network Error:**
- CORS issue or backend not accessible
- **Solution:** Check CORS_ORIGIN in backend `.env` file

### 4. Role-Based Access Issues

**Check Your User Role:**
1. Open browser DevTools (F12)
2. Go to Application → Local Storage
3. Find `user` key and check the `role` field

**Required Roles:**
- **Products Page:** `admin` or `warehouse`
- **Sales Page:** `admin` or `manager`
- **Staff Page:** `admin` or `manager`
- **Dashboard:** All authenticated users

**To Change Your Role:**
1. Create an admin user: `cd backend && npm run seed:admin`
2. Or update your user in MongoDB:
   ```javascript
   db.users.updateOne(
     { email: "your-email@example.com" },
     { $set: { role: "admin" } }
   )
   ```

### 5. API Endpoints Not Working

**Test API Endpoints:**
```bash
# Test Products (requires auth token)
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:3000/api/products

# Test Sales (requires auth token)
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:3000/api/sales

# Test Staff (requires auth token)
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:3000/api/staff
```

**If endpoints return 401:**
- Get a valid token by logging in first
- Check JWT_SECRET in backend `.env`

**If endpoints return 404:**
- Check backend routes are registered
- Verify backend is running
- Check API base URL in `frontend/src/app/core/config/api.config.ts`

### 6. Browser Console Errors

**Common Errors:**

**"Cannot read property 'data' of undefined"**
- API response structure mismatch
- Check Network tab to see actual API response
- Verify response matches expected format

**"Http failure response"**
- Network error or backend not responding
- Check backend logs for errors

**"TypeError: Cannot read property 'length' of undefined"**
- Data structure issue
- Check if API returns data in expected format

### 7. Quick Diagnostic Steps

1. **Check Backend:**
   ```bash
   cd backend
   npm run dev
   ```
   Should show: `Server is running on port 3000`

2. **Check Frontend:**
   ```bash
   cd frontend
   npm start
   ```
   Should show: `Application bundle generation complete`

3. **Check Browser:**
   - Open DevTools (F12)
   - Go to Network tab
   - Navigate to a page
   - Check if API requests are made
   - Check response status codes

4. **Check Authentication:**
   - Verify tokens in localStorage
   - Check if tokens are being sent in requests
   - Verify token hasn't expired

### 8. Still Not Working?

**Enable Debug Logging:**
1. Open browser DevTools (F12)
2. Go to Console tab
3. Look for error messages
4. Check Network tab for failed requests
5. Share the error messages for further help

**Check Backend Logs:**
- Look at the terminal where backend is running
- Check for error messages
- Verify database connection

**Verify Configuration:**
- Backend `.env` file is configured correctly
- Frontend API config points to correct backend URL
- CORS is configured to allow frontend origin

## Summary

Most issues are caused by:
1. **Not logged in** → Log in first
2. **Wrong user role** → Use admin account
3. **Backend not running** → Start backend
4. **No data** → This is normal, add data via API
5. **Token expired** → Log out and log back in

The pages should now show:
- Clear error messages if something fails
- Empty state messages if no data exists
- Retry buttons to reload data
- Better loading indicators
