# Creating an Admin User

There is **no default admin account**. You need to create one.

## Option 1: Using the Seed Script (Recommended)

Run the seed script to create an admin user:

```bash
cd backend
npm run seed:admin
```

**Default Admin Credentials:**
- **Email**: `admin@example.com`
- **Password**: `Admin1234`

### Custom Admin Credentials

You can set custom credentials using environment variables:

```bash
# Windows PowerShell
$env:ADMIN_EMAIL="admin@yourcompany.com"
$env:ADMIN_PASSWORD="YourSecurePassword123"
npm run seed:admin

# Linux/Mac
ADMIN_EMAIL="admin@yourcompany.com" ADMIN_PASSWORD="YourSecurePassword123" npm run seed:admin
```

Or add to your `.env` file:
```env
ADMIN_EMAIL=admin@yourcompany.com
ADMIN_PASSWORD=YourSecurePassword123
```

## Option 2: Using the API Directly

You can create an admin user via the API using curl or Postman:

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "Admin1234",
    "firstName": "Admin",
    "lastName": "User",
    "role": "admin"
  }'
```

**Note**: The registration endpoint may not allow setting the role directly. If it doesn't work, use Option 1 or Option 3.

## Option 3: Update Existing User to Admin

If you already have a user account, you can update their role to admin using MongoDB:

1. Connect to your MongoDB database
2. Find your user:
   ```javascript
   db.users.findOne({ email: "your-email@example.com" })
   ```
3. Update the role:
   ```javascript
   db.users.updateOne(
     { email: "your-email@example.com" },
     { $set: { role: "admin" } }
   )
   ```

## Option 4: Using MongoDB Compass or MongoDB Shell

1. Open MongoDB Compass or connect via `mongosh`
2. Navigate to your database (default: `inventory_db`)
3. Go to the `users` collection
4. Find your user document
5. Edit the `role` field and change it from `"user"` to `"admin"`
6. Save the document

## After Creating Admin

1. **Login** with the admin credentials at: http://localhost:4200/auth/login
2. **Change the password** immediately for security
3. You'll now have access to:
   - Dashboard
   - Staff Management
   - Products Management
   - Sales Management
   - All admin features

## Security Notes

**Important Security Reminders:**
- Change the default password immediately after first login
- Use a strong password (minimum 8 characters, uppercase, lowercase, number)
- Never commit admin credentials to version control
- In production, use environment variables for admin credentials

## Troubleshooting

### "Admin user already exists"
- The email is already registered
- Use a different email or delete the existing user first

### "Cannot connect to database"
- Make sure MongoDB is running
- Check your `MONGODB_URI` in `.env` file
- Verify database connection string is correct

### "Permission denied"
- Make sure you're running the script from the `backend` directory
- Check that MongoDB connection has write permissions
