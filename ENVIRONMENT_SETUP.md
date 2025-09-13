# Environment Variables Setup

This document explains how to configure environment variables to replace hardcoded URLs in the application.

## Frontend Environment Variables

Create a `.env` file in the `frontend/` directory with the following variables:

```env
# Frontend Environment Variables
VITE_API_BASE_URL=http://localhost:8000/api
VITE_BACKEND_URL=http://localhost:8000
VITE_FRONTEND_URL=http://localhost:5173
```

### Variables Description:
- `VITE_API_BASE_URL`: The base URL for API calls (default: http://localhost:8000/api)
- `VITE_BACKEND_URL`: The backend server URL for image and file requests (default: http://localhost:8000)
- `VITE_FRONTEND_URL`: The frontend application URL (default: http://localhost:5173)

## Backend Environment Variables

Create a `.env` file in the `backend/` directory with the following variables:

```env
# Backend Environment Variables
APP_URL=http://localhost:8000
FRONTEND_URL=http://localhost:5173
FRONTEND_URL_ALT=http://127.0.0.1:5173
SANCTUM_STATEFUL_DOMAINS_LIST=localhost,localhost:3000,127.0.0.1,127.0.0.1:8000,::1
```

### Variables Description:
- `APP_URL`: The backend application URL (default: http://localhost:8000)
- `FRONTEND_URL`: The primary frontend URL for CORS (default: http://localhost:5173)
- `FRONTEND_URL_ALT`: Alternative frontend URL for CORS (default: http://127.0.0.1:5173)
- `SANCTUM_STATEFUL_DOMAINS_LIST`: Comma-separated list of domains for Sanctum authentication

## Production Configuration

For production deployment, update these variables to match your actual domain:

### Frontend (.env):
```env
VITE_API_BASE_URL=https://your-api-domain.com/api
VITE_BACKEND_URL=https://your-api-domain.com
VITE_FRONTEND_URL=https://your-frontend-domain.com
```

### Backend (.env):
```env
APP_URL=https://your-api-domain.com
FRONTEND_URL=https://your-frontend-domain.com
FRONTEND_URL_ALT=https://www.your-frontend-domain.com
SANCTUM_STATEFUL_DOMAINS_LIST=your-frontend-domain.com,www.your-frontend-domain.com
```

## Files Modified

The following files have been updated to use environment variables instead of hardcoded URLs:

### Frontend:
- `src/lib/imageUtils.ts` - Backend URL for image handling
- `src/components/EventModal.tsx` - Image URL construction
- `src/components/ItineraryViewer.tsx` - Multiple image URL references
- `src/components/PackagesList.tsx` - Company logo URLs
- `src/components/ItineraryViewerIframe.tsx` - Image URLs
- `src/components/ItineraryBuilder.tsx` - Image and logo URLs

### Backend:
- `config/cors.php` - CORS allowed origins
- `app/Http/Middleware/AddCorsHeaders.php` - CORS headers
- `config/sanctum.php` - Sanctum stateful domains

## Setup Instructions

1. Copy the example environment files:
   ```bash
   # Frontend
   cp frontend/env.example frontend/.env
   
   # Backend
   cp backend/env.example backend/.env
   ```

2. Update the values in the `.env` files according to your environment

3. Restart your development servers to pick up the new environment variables

## Notes

- All hardcoded URLs have been replaced with environment variables
- Default values are provided as fallbacks for development
- The application will work without environment variables but will use localhost defaults
- Make sure to update both frontend and backend environment variables when deploying to production
