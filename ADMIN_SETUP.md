# Admin Panel & Bot Login Setup

## Overview
Successfully added an admin panel at `/admin` and a login system for `/bot` with user management, access codes, and time controls.

## Features

### Admin Panel (`/admin`)
- **Password**: `DNBCoach`
- **Location**: Navigate to `/admin` in your browser
- **Capabilities**:
  - Add new users with custom names
  - Set optional expiry dates for user access
  - Edit user details (name, expiry)
  - Delete users
  - View all users with their codes
  - Copy user codes to clipboard

### Bot Login (`/bot`)
- Users must enter an access code to use the bot
- Code validation happens before chat access
- User's name is stored and remembered after login
- Invalid/expired codes are rejected

### User Management
- Each user gets a unique 8-character code (auto-generated)
- Codes use unambiguous characters (no O/0, I/1, etc.)
- Optional expiry dates for time-limited access
- User data stored in memory (consider database for production)

## API Endpoints

### `/api/admin/auth` (POST)
- Validates admin password
- Body: `{ password: string }`

### `/api/admin/users`
- **GET**: List all users (requires auth)
- **POST**: Create user (requires auth)
  - Body: `{ name: string, expiryDate?: string | null }`
  - Returns: `{ user: User }` with generated code
- **PUT**: Update user (requires auth)
  - Body: `{ id: string, name?: string, expiryDate?: string | null }`
- **DELETE**: Delete user (requires auth)
  - Body: `{ id: string }`

### `/api/chat` (POST)
- Now requires `code` parameter for all requests
- Validates code and expiry before processing
- Special `validateOnly` mode for login verification

## Usage

### Adding a User
1. Navigate to `/admin`
2. Login with password: `DNBCoach`
3. Click "Add User"
4. Enter user name
5. Optionally set expiry date
6. Click "Add User"
7. Copy the generated code and share with the user

### User Logging In
1. Navigate to `/bot`
2. Enter the access code provided
3. Click "Login"
4. Start chatting!

### Editing/Deleting Users
1. In admin panel, click Edit icon to modify user details
2. Click Delete icon to remove a user
3. Changes take effect immediately

## Important Notes

- **Security**: Admin password is hardcoded (`DNBCoach`). For production, use environment variables and proper authentication.
- **Storage**: User data is stored in memory. Consider using a database (e.g., PostgreSQL, MongoDB) for production.
- **Deployment**: When using Vercel Functions locally, run `vercel dev` instead of `npm run dev` to test the API endpoints.
- **Session**: Admin authentication uses `sessionStorage` (cleared on browser close).
- **User Login**: Bot authentication uses `localStorage` (persists until code expires or user clears data).

## Testing Locally

To test the full functionality locally with Vercel Functions:
```bash
vercel dev
```

This will start both the Vite dev server and the Vercel Functions runtime.

## Production Recommendations

1. **Database**: Replace in-memory storage with a proper database
2. **Environment Variables**: Move `ADMIN_PASSWORD` to environment variables
3. **Enhanced Security**: Add rate limiting, CSRF protection, and proper session management
4. **User Tracking**: Add analytics to track user engagement and usage
5. **Notifications**: Consider email notifications when users are added/removed
