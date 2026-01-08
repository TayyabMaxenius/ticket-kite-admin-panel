# Ticket Kite Admin Panel

A comprehensive admin panel for managing shows, events, venues, and ticket sales through Nliven API integration.

## Features

- **Shows Management**: Create and manage shows with rich metadata
- **Events Management**: Create events for shows and sync with Nliven API
- **Venues Management**: Manage venue information
- **Promotions & Price Levels**: Configure promotions and pricing tiers
- **Nliven Integration**: Seamless integration with Nliven API for ticket sales
- **Categories & Tags**: Organize shows with categories and tags
- **Tips & Tricks**: Content management for tips and articles
- **Media Management**: Upload and manage images/videos via S3

## Tech Stack

- **Framework**: Next.js 16
- **Language**: TypeScript
- **Database**: Supabase (PostgreSQL)
- **UI Components**: Radix UI + Tailwind CSS
- **Rich Text Editor**: Tiptap
- **Storage**: AWS S3
- **API Integration**: Nliven API

## Getting Started

### Prerequisites

- Node.js 18+ and Yarn
- Supabase account and project
- AWS S3 bucket (for media storage)
- Nliven API credentials (for ticket sales)

### Installation

1. Clone the repository

```bash
git clone <repository-url>
cd ticket-kite-admin-panel
```

2. Install dependencies

```bash
yarn install
```

3. Set up environment variables

```bash
cp .env.example .env.local
```

Fill in your environment variables:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# AWS S3
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=your_aws_region
AWS_S3_BUCKET=your_bucket_name

# Nliven API
NEXT_PUBLIC_NLIVEN_API_BASE_URL=https://api.nliven.co
NEXT_PUBLIC_NLIVEN_API_KEY=your_nliven_api_key
NEXT_PUBLIC_NLIVEN_API_SECRET=your_nliven_api_secret
```

4. Run database migrations
   Execute the SQL files in the `migrations/` directory in your Supabase SQL editor:

- `create_promotions_table.sql`
- `create_price_levels_table.sql`
- `create_events_table.sql`
- (and other migration files)

5. Start the development server

```bash
yarn dev
```

6. Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
├── app/
│   ├── dashboard/
│   │   ├── shows/          # Shows management
│   │   ├── events/         # Events management (Nliven integration)
│   │   ├── venues/         # Venues management
│   │   ├── promotions/     # Promotions management
│   │   ├── price-levels/   # Price levels management
│   │   └── ...
│   └── api/                # API routes
├── components/
│   ├── ui/                 # Reusable UI components
│   └── dashboard/          # Dashboard-specific components
├── lib/
│   ├── nliven/             # Nliven API client
│   └── supabase/           # Supabase client
├── migrations/             # Database migration files
└── docs/                   # Documentation
```

## Nliven Integration

The admin panel integrates with Nliven API for ticket sales. See [Nliven Integration Documentation](./docs/NLIVEN_INTEGRATION.md) for detailed information.

### Key Features

- **Event Creation**: Automatically sync events with Nliven when created
- **Promotion Mapping**: Link promotions to Nliven events
- **Price Level Mapping**: Map price levels to Nliven pricing tiers
- **Ticket Sales**: Process ticket purchases through Nliven API

### API Documentation

- **Swagger Interactive Docs**: https://nliven.co/apidocumentation/purchasingapiinteractive/
- **Main Documentation**: https://nliven.co/apidocumentation/

## Database Schema

### Shows

- Basic show information (name, description, images)
- Pricing and fees
- Venue association
- Categories and tags
- Promotions and price levels
- Nliven token and promo code

### Events

- Linked to shows
- Event date/time
- Venue information
- Promotions and price levels
- Nliven event ID (after sync)
- Ticket availability and pricing

### Promotions

- Promotion codes
- Nliven promotion IDs
- Status and requirements

### Price Levels

- Price level names and labels
- Nliven price level IDs
- Descriptions and status

## Development

### Adding a New Feature

1. Create database migration if needed
2. Create UI components
3. Add API routes if needed
4. Update sidebar navigation
5. Add documentation

### Code Style

- Use TypeScript for type safety
- Follow Next.js 13+ App Router conventions
- Use Tailwind CSS for styling
- Follow existing component patterns

## Deployment

### Build

```bash
yarn build
```

### Environment Variables

Ensure all environment variables are set in your deployment platform (Vercel, Netlify, etc.)

### Database

Run all migrations in your production Supabase database.

## Support

For issues and questions:

- Check the [Nliven Integration Documentation](./docs/NLIVEN_INTEGRATION.md)
- Review the API documentation at https://nliven.co/apidocumentation/

## License

[Your License Here]
