# How to Check and Update Your User Role

## Problem: Products Page Redirects to Dashboard

The products page requires **ADMIN** or **WAREHOUSE** role. If you're logged in as a **USER**, you'll be automatically redirected to the dashboard.

## Check Your Current Role

### Method 1: Browser DevTools

1. Open browser DevTools (F12)
2. Go to **Application** tab (Chrome) or **Storage** tab (Firefox)
3. Expand **Local Storage**
4. Click on your site URL (e.g., `http://localhost:4200`)
5. Look for the `user` key
6. Click on it to see the JSON value
7. Check the `role` field

**Example:**
```json
{
  "_id": "...",
  "email": "user@example.com",
  "role": "user",  // ← This is your current role
  ...
}
```

### Method 2: Check in the UI

Look at the sidebar footer - it shows your role:
- **User Name**: Your name or email
- **User Role**: Your current role (user, admin, manager, warehouse)

## Update Your Role to Admin

### Option 1: Create a New Admin User (Recommended)

```bash
cd backend
npm run seed:admin
```

This creates an admin user with:
- Email: `admin@example.com`
- Password: `Admin1234`

Then log out and log in with the admin credentials.

### Option 2: Update Existing User in MongoDB

1. **Connect to MongoDB:**
   ```bash
   # If using MongoDB Atlas, use mongosh or MongoDB Compass
   # If using local MongoDB:
   mongosh "your-connection-string"
   ```

2. **Update your user:**
   ```javascript
   use inventory_db
   db.users.updateOne(
     { email: "your-email@example.com" },
     { $set: { role: "admin" } }
   )
   ```

3. **Log out and log back in** to refresh your session

### Option 3: Update via MongoDB Compass

1. Open MongoDB Compass
2. Connect to your database
3. Navigate to `inventory_db` → `users` collection
4. Find your user document
5. Edit the `role` field
6. Change from `"user"` to `"admin"`
7. Save the document
8. Log out and log back in

## Role Requirements

| Page | Required Roles |
|------|----------------|
| Dashboard | All authenticated users |
| Products | ADMIN or WAREHOUSE |
| Sales | ADMIN or MANAGER |
| Staff | ADMIN or MANAGER |

## After Updating Role

1. **Log out** from the frontend
2. **Log back in** to refresh your session
3. You should now have access to the products page

## Troubleshooting

### Role Still Not Working After Update

1. **Clear browser storage:**
   - Open DevTools (F12)
   - Application → Local Storage
   - Clear all items
   - Log in again

2. **Check backend logs:**
   - Verify the role was updated in the database
   - Check if there are any errors

3. **Verify token:**
   - The JWT token contains your role
   - After updating role, you need to log out and log back in to get a new token

### Still Redirected?

- Make sure you logged out and logged back in after updating your role
- Check that the role in the database matches exactly: `"admin"`, `"warehouse"`, `"manager"`, or `"user"` (lowercase)
- Verify your user is active: `isActive: true` in the database
