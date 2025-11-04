# NewsBuddy Login & User Preferences Testing

## Quick Start Guide

### 1. Start the Application

**Backend:**
```bash
cd backend
npm install
npm start
```
Server should start on http://localhost:5000

**Frontend:**
```bash
cd frontend
npm install
npm start
```
Frontend should start on http://localhost:3000

### 2. Test Login Features

#### Register New User
1. Go to http://localhost:3000/register
2. Fill in the form:
   - Username: testuser
   - Email: test@example.com
   - Password: password123
   - Confirm Password: password123
3. Click "Create Account"
4. Should redirect to home page with personalized welcome

#### Login Existing User
1. Go to http://localhost:3000/login
2. Enter credentials:
   - Email: test@example.com
   - Password: password123
3. Click "Sign In"
4. Should redirect to home page

### 3. Test User Preferences

#### Set Preferences
1. Click on profile menu (avatar) in header
2. Select "Profile" from dropdown
3. Go to "Preferences" tab
4. Select categories (e.g., Technology, Sports, Business)
5. Add keywords (e.g., "AI", "Machine Learning", "Football")
6. Select language and country
7. Click "Save Preferences"

#### View Personalized Feed
1. Go to home page (/)
2. If logged in, you'll see "For You" and "All News" buttons
3. Click "For You" to see personalized content
4. Or go directly to /personalized for full personalized feed

### 4. Test Features

#### Home Page Features
- **Not logged in**: Shows general news with category tabs
- **Logged in**: Shows welcome message with user's name
- **Personalized toggle**: "For You" vs "All News" buttons
- **Category filtering**: Works for general news

#### Profile Page Features
- **Profile Info**: Basic user information
- **Preferences**: News categories, keywords, language, country
- **Settings**: Theme, notifications, privacy
- **Bookmarks**: Saved articles
- **Reading History**: Previously read articles

#### Personalized Feed Features
- **User Stats Card**: Shows reading statistics and preferences
- **Personalized Articles**: Based on user preferences
- **Interactive Cards**: Bookmark, like, share functionality
- **Fallback**: Shows trending if personalized fails

### 5. Expected Behavior

#### Authentication
- ✅ Registration creates new user account
- ✅ Login authenticates and stores JWT token
- ✅ Protected routes require authentication
- ✅ User data persists across sessions

#### Personalization
- ✅ Preferences affect article recommendations
- ✅ Reading history is tracked
- ✅ Bookmarks are saved and displayed
- ✅ User stats are calculated and shown

#### UI/UX
- ✅ Responsive design works on mobile/desktop
- ✅ Loading states and error handling
- ✅ Toast notifications for user actions
- ✅ Smooth navigation between pages

### 6. Troubleshooting

#### Common Issues
1. **"Network Error"**: Check if backend is running on port 5000
2. **"Token expired"**: Clear localStorage and login again
3. **"User not found"**: Register a new account
4. **No personalized articles**: Set preferences first

#### Debug Steps
1. Open browser DevTools (F12)
2. Check Console tab for JavaScript errors
3. Check Network tab for failed API calls
4. Verify localStorage has auth token
5. Check backend logs for server errors

### 7. API Endpoints Working

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `GET /api/user/preferences` - Get user preferences
- `PUT /api/user/preferences` - Update preferences
- `GET /api/recommendations` - Get personalized articles
- `POST /api/user/bookmarks` - Add bookmark
- `GET /api/user/reading-history` - Get reading history

### 8. Demo Credentials

For quick testing, you can use:
- **Email**: demo@newsbuddy.com
- **Password**: demo123
- **Username**: demouser

Or create your own account using the registration form.

## Success Indicators

✅ Login form appears and works
✅ Registration creates new accounts
✅ Home page shows personalized content for logged-in users
✅ Profile page allows setting preferences
✅ Personalized feed shows relevant articles
✅ All interactive features work (bookmark, like, share)
✅ Navigation between pages works smoothly