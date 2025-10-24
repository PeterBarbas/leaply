# User Authentication Setup Guide

This guide will help you set up the complete user authentication system for Leaply.

## 🚀 Quick Start

### 1. Environment Variables

Add these environment variables to your `.env.local` file:

```bash
# Supabase Configuration (already configured)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE=your_supabase_service_role_key

# OAuth Providers (optional for MVP)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

### 2. Database Setup

Run the database migration to create the users table:

```sql
-- Execute the SQL in database/migrations/001_create_users_table.sql
-- This will create the users table with proper RLS policies and triggers
```

### 3. Supabase Configuration

In your Supabase dashboard:

1. **Enable Authentication**:
   - Go to Authentication > Settings
   - Enable email authentication
   - Configure email templates (optional for MVP)

2. **Enable OAuth Providers** (optional):
   - Go to Authentication > Providers
   - Enable Google OAuth
   - Add your Google OAuth credentials

3. **Configure Site URL**:
   - Set Site URL to your domain (e.g., `http://localhost:3000` for development)
   - Add redirect URLs for OAuth (e.g., `http://localhost:3000/auth/callback`)

## 🎯 Features Implemented

### ✅ Authentication
- **Email/Password Sign Up**: Users can create accounts with email and password
- **Email/Password Sign In**: Secure login with credential validation
- **Google OAuth**: One-click sign in with Google (optional)
- **Session Management**: Automatic token refresh and secure session persistence
- **Password Security**: Minimum 8 characters, secure hashing via Supabase

### ✅ User Profile Management
- **Profile Creation**: Automatic profile creation on sign up
- **Profile Editing**: Users can update name, location, interests, and bio
- **Profile Photo**: Support for profile pictures (via OAuth or manual upload)
- **Data Validation**: Client and server-side validation with Zod schemas

### ✅ UI/UX
- **Modern Design**: Clean, responsive forms with proper error handling
- **User Menu**: Dropdown menu in header with profile access and sign out
- **Mobile Support**: Responsive design with mobile-friendly navigation
- **Loading States**: Proper loading indicators and error messages
- **Accessibility**: ARIA labels, keyboard navigation, and screen reader support

### ✅ Security
- **Row Level Security**: Database-level security with RLS policies
- **JWT Tokens**: Secure token-based authentication
- **HTTPS Only**: All authentication requests use secure connections
- **Input Validation**: Comprehensive validation on both client and server
- **CSRF Protection**: Built-in protection via Supabase

## 📁 File Structure

```
src/
├── lib/
│   ├── auth.tsx              # AuthContext and authentication logic
│   ├── schemas.ts            # Zod validation schemas
│   └── supabase.ts           # Supabase client configuration
├── components/
│   └── auth/
│       ├── SignInForm.tsx    # Sign in form component
│       ├── SignUpForm.tsx    # Sign up form component
│       └── UserProfile.tsx   # Profile management component
├── app/
│   ├── auth/
│   │   ├── signin/page.tsx   # Sign in page
│   │   ├── signup/page.tsx   # Sign up page
│   │   └── callback/route.ts # OAuth callback handler
│   ├── api/
│   │   ├── auth/
│   │   │   ├── signup/route.ts
│   │   │   ├── signin/route.ts
│   │   │   └── signout/route.ts
│   │   └── user/
│   │       └── profile/route.ts
│   └── dashboard/page.tsx    # Protected dashboard page
├── components/layout/
│   └── header.tsx            # Updated header with auth integration
└── middleware.ts             # Route protection middleware
```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/signup` - Create new account
- `POST /api/auth/signin` - Sign in user
- `POST /api/auth/signout` - Sign out user

### User Profile
- `GET /api/user/profile` - Get user profile
- `PUT /api/user/profile` - Update user profile

## 🛡️ Route Protection

The middleware automatically protects routes:
- **Protected Routes**: `/dashboard`, `/profile` (requires authentication)
- **Auth Routes**: `/auth/signin`, `/auth/signup` (redirects if already authenticated)

## 🎨 Customization

### Styling
All components use Tailwind CSS and can be customized by modifying the className props.

### Validation
Update validation rules in `src/lib/schemas.ts`:
- Password requirements
- Profile field constraints
- Error messages

### OAuth Providers
Add more OAuth providers by:
1. Configuring in Supabase dashboard
2. Adding provider logic in `src/lib/auth.tsx`
3. Updating UI components

## 🚨 Troubleshooting

### Common Issues

1. **"Missing environment variables"**
   - Ensure all Supabase environment variables are set
   - Check `.env.local` file exists and is properly formatted

2. **"Authentication failed"**
   - Verify Supabase URL and keys are correct
   - Check OAuth provider configuration
   - Ensure site URL is configured in Supabase

3. **"Profile not found"**
   - Check if database migration was run
   - Verify RLS policies are properly configured
   - Check if user trigger is working

4. **"CORS errors"**
   - Ensure site URL is configured in Supabase
   - Check redirect URLs for OAuth providers

### Debug Mode

Enable debug logging by adding to your environment:
```bash
NEXT_PUBLIC_DEBUG=true
```

## 🔄 Next Steps

### Future Enhancements
- [ ] Email verification flow
- [ ] Password reset functionality
- [ ] Two-factor authentication
- [ ] Social login (Apple, GitHub, etc.)
- [ ] User preferences and settings
- [ ] Account deletion
- [ ] Admin user management

### Integration Points
- [ ] Connect with existing simulation attempts
- [ ] Add user progress tracking
- [ ] Implement user preferences for recommendations
- [ ] Add user analytics and insights

## 📚 Documentation

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Next.js Middleware](https://nextjs.org/docs/app/building-your-application/routing/middleware)
- [Zod Validation](https://zod.dev/)

## 🤝 Support

If you encounter any issues:
1. Check the troubleshooting section above
2. Review the Supabase dashboard for configuration issues
3. Check browser console for client-side errors
4. Review server logs for API errors
