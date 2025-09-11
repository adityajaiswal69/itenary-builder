# Company Profile Feature

This feature allows users to add company details that will be displayed on their shared itineraries.

## Features Added

### 1. Backend Changes

#### Database
- **New Model**: `CompanyDetails` with fields:
  - `company_name` (required)
  - `logo` (optional - image URL)
  - `email` (optional)
  - `phone` (optional)
  - `address` (optional)
  - `website` (optional)
  - `description` (optional)

#### API Endpoints
- `GET /api/company-details` - Get user's company details
- `POST /api/company-details` - Create/update company details
- `PUT /api/company-details/{id}` - Update company details
- `DELETE /api/company-details/{id}` - Delete company details

#### Database Migration
- Migration file: `2025_09_11_102854_create_company_details_table.php`
- Run with: `php artisan migrate`

### 2. Frontend Changes

#### New Components
- **ProfileModal**: Modal for managing company details
  - Logo upload functionality
  - Form fields for all company information
  - Save/update company details

#### Updated Components
- **PackagesList**: Added profile button in header
- **ItineraryViewer**: Displays company logo and "More Info" card
- **ItineraryViewerIframe**: Same company display for iframe version

#### API Integration
- Added `companyDetailsApi` to `services/api.ts`
- Updated `Itinerary` interface to include `company_details`

## How to Use

### For Users
1. **Access Profile**: Click on the user icon in the top-right corner of the packages list page
2. **Add Company Details**: Fill in the company information form
3. **Upload Logo**: Use the "Upload Logo" button to add a company logo
4. **Save**: Click "Save Details" to save your company information

### For Viewers
1. **View Itinerary**: Open any shared itinerary
2. **See Company Info**: Company logo appears in the banner area
3. **More Info Card**: A dedicated "More Information" card shows:
   - Company name
   - Company description
   - Contact information (email, phone, website, address)
   - Company logo

## Technical Details

### Database Schema
```sql
CREATE TABLE company_details (
    id BIGINT PRIMARY KEY,
    user_id UUID NOT NULL,
    company_name VARCHAR(255) NOT NULL,
    logo VARCHAR(255) NULL,
    email VARCHAR(255) NULL,
    phone VARCHAR(20) NULL,
    address TEXT NULL,
    website VARCHAR(255) NULL,
    description TEXT NULL,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(user_id)
);
```

### API Response Format
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "user_id": "uuid",
    "company_name": "Company Name",
    "logo": "https://example.com/logo.png",
    "email": "company@example.com",
    "phone": "+1234567890",
    "address": "123 Main St, City, State",
    "website": "https://company.com",
    "description": "Company description",
    "created_at": "2025-09-11T10:28:54.000000Z",
    "updated_at": "2025-09-11T10:28:54.000000Z"
  }
}
```

## Files Modified

### Backend
- `app/Models/CompanyDetails.php` - New model
- `app/Models/User.php` - Added relationship
- `app/Http/Controllers/Api/CompanyDetailsController.php` - New controller
- `app/Http/Controllers/Api/ShareController.php` - Updated to include company details
- `database/migrations/2025_09_11_102854_create_company_details_table.php` - New migration
- `routes/api.php` - Added company details routes

### Frontend
- `src/components/ProfileModal.tsx` - New component
- `src/components/PackagesList.tsx` - Added profile button
- `src/components/ItineraryViewer.tsx` - Added company display
- `src/components/ItineraryViewerIframe.tsx` - Added company display
- `src/services/api.ts` - Added company details API

## Testing

1. **Backend**: Run `php artisan migrate` to create the table
2. **Frontend**: Start the development server and test the profile modal
3. **Integration**: Create company details and view them on a shared itinerary

## Notes

- Company details are optional - itineraries will still work without them
- Logo uploads use the existing image upload API
- Company details are only shown on published itineraries
- The feature gracefully falls back to user contact info if no company details exist
