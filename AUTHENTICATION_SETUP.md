# Authentication System - Setup Complete

## Overview
A complete Passport.js authentication system with manual approval workflow has been implemented for the sponsorship application.

## Features Implemented

### Backend (Express + Passport.js)
- ✅ User model with approval workflow
- ✅ Session-based authentication with secure cookies
- ✅ Password hashing with bcrypt (cost factor 10)
- ✅ Manual approval system (users must be approved by admin)
- ✅ Protected API routes
- ✅ Admin routes for user management
- ✅ Role-based access control (user/admin)

### Frontend (React)
- ✅ Login page with form validation
- ✅ Registration page with password confirmation
- ✅ Auth context for global state management
- ✅ Protected routes
- ✅ Navigation with user info and logout
- ✅ Responsive design

## How to Test Locally

### 1. Start the Backend
```bash
cd backend
npm run dev
```

The server will start on `http://localhost:3001`

### 2. Start the Frontend
```bash
cd frontend
npm run dev
```

The frontend will start on `http://localhost:5173`

### 3. Test Authentication Flow

#### Admin Login (Already Created)
- **Username**: `admin`
- **Password**: `admin123`
- **Status**: Approved, Admin role

#### Register a New User
1. Go to `http://localhost:5173/register`
2. Fill in the form
3. Submit registration
4. You'll see: "Account pending approval" message

#### Approve the New User (as Admin)
Option 1 - Using Prisma Studio:
```bash
cd backend
npm run db:studio
```
- Open Users table
- Set `isApproved` to `true` for the new user

Option 2 - Using Admin API (requires admin login):
```bash
# Login as admin first
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "admin123"}' \
  -c cookies.txt

# Get pending users
curl http://localhost:3001/api/auth/pending-users -b cookies.txt

# Approve user (replace {id} with actual user ID)
curl -X PATCH http://localhost:3001/api/auth/users/{id}/approve -b cookies.txt
```

#### Login with Approved User
1. Go to `http://localhost:5173/login`
2. Enter credentials
3. You should be redirected to the dashboard

## API Endpoints

### Public Endpoints
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout

### Protected Endpoints (Require Authentication)
- `GET /api/auth/me` - Get current user info
- `GET /api/children` - Get all children
- `GET /api/sponsors` - Get all sponsors
- (All other existing API routes)

### Admin Only Endpoints
- `GET /api/auth/users` - List all users
- `GET /api/auth/pending-users` - List pending approval users
- `PATCH /api/auth/users/:id/approve` - Approve user
- `PATCH /api/auth/users/:id/activate` - Activate user
- `PATCH /api/auth/users/:id/deactivate` - Deactivate user

## Database Schema

### Users Table
```prisma
model User {
  id           Int      @id @default(autoincrement())
  username     String   @unique
  password     String   // Hashed with bcrypt
  fullName     String
  email        String?
  role         String   @default("user") // user, admin
  isApproved   Boolean  @default(false)  // Manual approval
  isActive     Boolean  @default(true)
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
  lastLoginAt  DateTime?
}
```

## Security Features

1. **Password Hashing**: bcrypt with cost factor 10
2. **Secure Sessions**: httpOnly, sameSite cookies
3. **Manual Approval**: Prevents unauthorized access
4. **Protected Routes**: All API routes require authentication
5. **Role-Based Access**: Admin-only routes for user management
6. **HTTPS**: Secure cookies in production (Railway)

## Production Deployment (Railway)

### Environment Variables to Add in Railway:
```
SESSION_SECRET=<generate-a-random-secret-32-chars-or-more>
```

Generate a secure secret:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Database Migration
Before deploying, push the schema to your production Turso database:
```bash
# Update .env to point to production database temporarily
# Or use Turso CLI to create the users table
```

### Create First Admin User in Production
Use SQL directly in Turso:
```sql
INSERT INTO users (username, password, fullName, role, isApproved, isActive, createdAt, updatedAt)
VALUES ('admin', '<bcrypt-hashed-password>', 'Administrator', 'admin', true, true, datetime('now'), datetime('now'));
```

To generate the bcrypt hash:
```bash
node -e "const bcrypt = require('bcrypt'); console.log(bcrypt.hashSync('your-password', 10));"
```

## Files Created/Modified

### Backend
- `backend/prisma/schema.prisma` - Added User model
- `backend/src/config/passport.ts` - Passport configuration
- `backend/src/middleware/auth.ts` - Authentication middleware
- `backend/src/routes/auth.ts` - Auth routes
- `backend/src/index.ts` - Added session middleware
- `backend/src/routes/*.ts` - Protected all existing routes
- `backend/.env` - Added SESSION_SECRET

### Frontend
- `frontend/src/contexts/AuthContext.tsx` - Auth state management
- `frontend/src/components/Login.tsx` - Login page
- `frontend/src/components/Register.tsx` - Registration page
- `frontend/src/components/ProtectedRoute.tsx` - Route protection
- `frontend/src/components/Navigation.tsx` - Added logout
- `frontend/src/App.tsx` - Wrapped with AuthProvider

## Troubleshooting

### "Account pending approval" on login
- The user needs admin approval
- Use Prisma Studio or admin API to approve

### Session not persisting
- Check that cookies are enabled
- Verify SESSION_SECRET is set
- Check CORS credentials setting

### Cannot access protected routes
- Ensure you're logged in
- Check browser cookies
- Verify backend session middleware is running

## Next Steps (Optional Enhancements)

1. **Email Notifications**: Send email when account is approved
2. **Password Reset**: Add forgot password functionality
3. **User Profile**: Allow users to update their profile
4. **Activity Logs**: Track user actions
5. **Two-Factor Authentication**: Add 2FA for extra security
6. **Admin Dashboard**: Create UI for user management

## Support

If you encounter issues:
1. Check backend logs for errors
2. Check browser console for frontend errors
3. Verify all environment variables are set
4. Ensure database schema is up to date
