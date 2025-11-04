# NewsBuddy User Preferences Testing Guide

## Features Implemented

### 1. User Profile Page (`/profile`)
- **Tabs**: Profile Info, Preferences, Settings, Bookmarks, Reading History
- **Preferences Tab**:
  - Category selection (business, entertainment, health, science, sports, technology)
  - Keyword management (add/remove custom keywords)
  - Language selection (English, Spanish, French, German, etc.)
  - Country selection (US, UK, Canada, Australia, etc.)
- **Settings Tab**:
  - Theme selection (light/dark/auto)
  - Notification preferences (email, push, breaking news)
  - Privacy settings (public profile, show reading history)
- **Bookmarks Tab**: View saved articles
- **Reading History Tab**: View previously read articles with ratings and time spent

### 2. Personalized Feed Page (`/personalized`)
- **User Stats Card**: Shows reading statistics and current preferences
- **Personalized Articles**: Based on user preferences and reading history
- **Interactive Article Cards**: 
  - Bookmark/unbookmark articles
  - Like/dislike feedback
  - Share functionality
  - "Not interested" and "Report" options
- **Fallback**: Shows trending articles if personalized feed fails

### 3. Enhanced Article Cards
- **Visual Design**: Gradient backgrounds, hover effects
- **Category Chips**: Color-coded category indicators
- **Source Information**: Author/source display with avatars
- **Time Stamps**: "X minutes ago" format
- **Action Buttons**: Like, bookmark, share with proper feedback

## Testing Steps

### 1. User Registration/Login
1. Navigate to `/register` or `/login`
2. Create account or login with existing credentials
3. Verify authentication works properly

### 2. Profile Setup
1. Go to `/profile`
2. **Test Preferences Tab**:
   - Click on different category chips to select/deselect
   - Add keywords by typing and pressing Enter
   - Remove keywords by clicking the X on chips
   - Change language and country dropdowns
   - Click "Save Preferences" and verify success message
3. **Test Settings Tab**:
   - Toggle theme, notification, and privacy switches
   - Click "Save Settings" and verify success message

### 3. Personalized Feed
1. Go to `/personalized`
2. Verify User Stats Card shows:
   - Welcome message with username
   - Reading statistics (articles read, bookmarks, reading time)
   - Selected preferences as chips
3. Test article interactions:
   - Click bookmark icon to save/unsave articles
   - Click like/dislike buttons
   - Click share button (should copy to clipboard or open native share)
   - Click "Read" button to open article in new tab
   - Click menu (three dots) for additional options

### 4. Navigation
1. Test sidebar navigation:
   - Home, Categories, Search, Trending
   - My Feed, Bookmarks, Profile
2. Test header navigation:
   - Profile menu dropdown
   - Search functionality
   - Theme toggle

### 5. Data Persistence
1. Set preferences and verify they persist after page refresh
2. Bookmark articles and verify they appear in bookmarks tab
3. Read articles and verify they appear in reading history

## API Endpoints Used

- `GET /user/profile` - Get user profile data
- `PUT /user/profile` - Update profile information
- `GET /user/preferences` - Get user preferences
- `PUT /user/preferences` - Update user preferences
- `GET /user/settings` - Get user settings
- `PUT /user/settings` - Update user settings
- `GET /user/bookmarks` - Get user bookmarks
- `POST /user/bookmarks` - Add bookmark
- `DELETE /user/bookmarks/:id` - Remove bookmark
- `GET /user/reading-history` - Get reading history
- `GET /recommendations` - Get personalized recommendations
- `POST /recommendations/feedback` - Send reading feedback

## Expected Behavior

1. **Preferences should affect feed**: Selecting categories should influence articles shown
2. **Bookmarks should persist**: Bookmarked articles should appear in profile bookmarks tab
3. **Reading history tracking**: Articles clicked should be tracked with timestamps
4. **Responsive design**: All features should work on mobile and desktop
5. **Error handling**: Graceful fallbacks when API calls fail
6. **Real-time updates**: Changes should reflect immediately in the UI

## Troubleshooting

If features don't work:
1. Check browser console for JavaScript errors
2. Check network tab for failed API calls
3. Verify backend server is running on port 5000
4. Verify frontend is running on port 3000
5. Check that user is properly authenticated (token in localStorage)