# Itinerary Builder - Travel Agency Management System

A comprehensive travel agency itinerary builder with Notion-like UI. Agency owners can create detailed itineraries, manage travel packages, and generate shareable links for clients.

## Features

### 🎯 Core Functionality
- **Day-based Itinerary Management**: Organize trips by days with detailed event planning
- **Rich Text Editor**: WYSIWYG editor with formatting, lists, tables, and media support
- **Package Management**: Complete package creation with pricing, locations, inclusions/exclusions
- **Library System**: Reusable content blocks for efficient itinerary creation
- **Shareable Links**: Public read-only views for clients with auto-updates

### 🎨 User Interface
- **Notion-like Experience**: Clean, modern interface with intuitive navigation
- **Category & Sub-category Selection**: Info, Hotel, Activity, Flights, Transport, Cruise
- **Image Upload**: Support for up to 5 photos per event
- **Cover Image Management**: Customizable trip cover images
- **Responsive Design**: Works seamlessly on desktop and mobile devices

### 📋 Package Features
- **Package Info Modal**: Comprehensive package details with:
  - Status (Published/Unpublished)
  - Title and start location
  - Validity dates
  - Rich text description
  - Pricing with currency selection
  - Location tags
  - Inclusions and exclusions lists

### 🔧 Technical Features
- **Real-time Updates**: Changes reflect immediately in shared views
- **Rich Text Support**: Bold, italic, underline, alignment, lists, links, tables
- **Image Management**: Drag & drop image upload with preview
- **Tag System**: Dynamic location, inclusion, and exclusion tags
- **PDF Export**: Download functionality for client presentations

## Technology Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **shadcn/ui** for UI components
- **Lucide React** for icons

### Backend
- **Laravel 10** with PHP
- **MySQL** database
- **Laravel Sanctum** for authentication
- **UUID** support for shareable links

## Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── ItineraryBuilder.tsx      # Main builder interface
│   │   ├── ItineraryViewer.tsx       # Public share view
│   │   ├── PackageInfoModal.tsx      # Package management modal
│   │   ├── EventModal.tsx            # Event creation/editing modal
│   │   ├── RichTextEditor.tsx        # WYSIWYG text editor
│   │   ├── Login.tsx                 # Authentication
│   │   ├── Register.tsx              # User registration
│   │   └── ui/                       # shadcn/ui components
│   ├── services/
│   │   └── api.ts                    # API service layer
│   └── main.tsx                      # Application entry point

backend/
├── app/
│   ├── Http/Controllers/Api/         # API controllers
│   ├── Models/                       # Eloquent models
│   └── Http/Middleware/              # Authentication middleware
├── database/migrations/              # Database schema
└── routes/api.php                    # API routes
```

## Getting Started

### Prerequisites
- Node.js 18+ and npm
- PHP 8.1+ and Composer
- MySQL 8.0+

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### Backend Setup
```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate
php artisan serve
```

## Usage

### Creating an Itinerary
1. **Login** to the system as an agency owner
2. **Create New Itinerary** or select existing one
3. **Add Days** to organize your trip structure
4. **Add Events** with categories and sub-categories
5. **Use Rich Text Editor** for detailed descriptions
6. **Upload Images** (up to 5 per event)
7. **Save** your itinerary

### Managing Packages
1. **Click Package Info** button
2. **Fill Package Details**:
   - Title and start location
   - Validity period
   - Rich text description
   - Pricing (per person or total)
   - Locations, inclusions, exclusions
3. **Set Status** (published/unpublished)
4. **Save Package**

### Sharing with Clients
1. **Publish** your itinerary
2. **Copy Share Link** from the interface
3. **Send to Clients** - no login required
4. **Clients View** read-only version with auto-updates

### Library System
1. **Add Events to Library** for reuse
2. **Copy from Library** to add to new itineraries
3. **Manage Library Items** with edit/delete options

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/user` - Get current user

### Itineraries
- `GET /api/itineraries` - List user itineraries
- `POST /api/itineraries` - Create new itinerary
- `PUT /api/itineraries/{id}` - Update itinerary
- `DELETE /api/itineraries/{id}` - Delete itinerary

### Packages
- `GET /api/packages` - List packages
- `POST /api/packages` - Create package
- `PUT /api/packages/{id}` - Update package
- `DELETE /api/packages/{id}` - Delete package

### Sharing
- `GET /api/share/{shareUuid}` - Get public itinerary view

## Database Schema

### Users
- `id` (UUID)
- `name`, `email`, `password`
- `created_at`, `updated_at`

### Itineraries
- `id` (UUID)
- `user_id` (FK to users)
- `title`, `content` (JSON), `cover_image`
- `is_published`, `share_uuid`
- `created_at`, `updated_at`

### Packages
- `id` (UUID)
- `itinerary_id` (FK to itineraries)
- `title`, `start_location`, `valid_till`
- `description` (JSON), `price`, `price_type`
- `locations`, `inclusions`, `exclusions` (JSON arrays)
- `is_published`
- `created_at`, `updated_at`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please open an issue in the GitHub repository.
