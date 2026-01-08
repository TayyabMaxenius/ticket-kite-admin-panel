# Ticket Kite Admin Panel - System Structure

## Overview

This document explains the complete structure of the Ticket Kite Admin Panel, including how shows, events, price levels, and promotions work together.

---

## System Architecture

The system follows a hierarchical structure:

```
Shows (Base Configuration)
  ├── Price Levels (Ticket Types)
  ├── Promotions (Discount Codes)
  └── Events (Specific Date/Time Instances)
      ├── Inherits Price Levels from Show
      ├── Inherits Promotions from Show
      └── Can Override/Add Event-Specific Pricing
```

---

## 1. Shows

### What is a Show?

A **Show** represents a production or performance that can have multiple event dates/times. It contains:

- Basic information (name, description, images)
- Venue association
- Base price levels (Premium, Table, GA Seat, etc.)
- Available promotions
- Categories and tags
- Series code and Nliven integration data

### Database Structure

**Table:** `shows`

**Key Columns:**

- `id` - Primary key (auto-increment)
- `venue_id` - Foreign key to `venues` table
- `status` - 'active' or 'inactive'
- `product_slug` - URL-friendly identifier
- `product_id` - External product ID
- `series_id` - Series identifier
- `series_code` - Series code (references `series_codes` table)
- `title` - Show title
- `data` - JSONB field storing all show details:
  - Basic info (name, description, pricing)
  - Images (image_url, cover_image, portrait_image)
  - Categories (JSONB array)
  - Tags (JSONB array)
  - Promotions (JSONB array)
  - Price Levels (JSONB array)
  - Show features, cast members, gallery images/videos
  - Venue details, story content, additional info

### How Shows Are Added

1. **Navigate to Shows Page**
   - Go to `/dashboard/shows`
   - Click "Add New Show" button

2. **Fill in Show Information**
   - **Basic Info**: Name, description, product slug, pricing
   - **Images**: Main image, cover image, portrait image
   - **Venue**: Select from venues dropdown
   - **Categories**: Multi-select from available categories
   - **Tags**: Multi-select from available tags
   - **Promotions**: Multi-select from available promotions
   - **Price Levels**: Multi-select from available price levels
   - **Series Code**: Select from series codes dropdown
   - **Nliven Integration**: Series ID, Nliven token, promo code

3. **Save Show**
   - Click "Save" button
   - Show is stored in `shows` table
   - All JSONB data (categories, tags, promotions, price levels) is saved as JSON arrays

### Show Data Storage

Shows use a **hybrid storage approach**:

- **Indexed columns** (`product_slug`, `title`, `series_code`) for fast queries
- **JSONB field** (`data`) for flexible, nested data structure
- This allows both fast filtering and flexible schema

---

## 2. Price Levels

### What is a Price Level?

A **Price Level** represents a type of ticket or seating category. Examples:

- Premium Seat with Table
- Table
- General Admission Seat
- Dealer's Choice

Price levels are **reusable** across multiple shows and events.

### Database Structure

**Table:** `price_levels`

**Key Columns:**

- `id` - Primary key (auto-increment)
- `price_level_id` - External price level ID (from Nliven, unique)
- `name` - Price level name (e.g., "Premium Seat with Table")
- `label` - Short label (e.g., "Premium")
- `description` - Optional description
- `status` - 'active' or 'inactive'

### How Price Levels Work

1. **Price levels are created independently** in `/dashboard/price-levels`
2. **Shows reference price levels** by storing them in the `promotions` JSONB array:
   ```json
   [
   	{
   		"id": 1,
   		"price_level_id": 21971,
   		"name": "Premium Seat with Table",
   		"label": "Premium"
   	}
   ]
   ```
3. **Events inherit price levels from shows** but can also add their own
4. **Pricing is handled at the event level** (not stored in price levels table)

### Price Level Management

- **Create**: Go to `/dashboard/price-levels` → "Add New Price Level"
- **Edit**: Click edit button on any price level
- **Delete**: Click delete button (only if not used by shows/events)
- **Status**: Set to 'inactive' to hide from dropdowns without deleting

---

## 3. Promotions

### What is a Promotion?

A **Promotion** represents a discount code or special offer. Examples:

- "APGUEST" - AP Guest discount
- "TICKETKITEVEGAS" - Ticket Kite promotion
- "BRITS2VEGAS" - Brits 2 Vegas discount

Promotions are **reusable** across multiple shows and events.

### Database Structure

**Table:** `promotions`

**Key Columns:**

- `id` - Primary key (auto-increment)
- `promotion_id` - External promotion ID (from Nliven, unique)
- `name` - Promotion name (e.g., "AP Guest")
- `code` - Promotion code (e.g., "APGUEST")
- `require_even_number_of_tickets` - Boolean flag
- `status` - 'active' or 'inactive'

### How Promotions Work

1. **Promotions are created independently** in `/dashboard/promotions`
2. **Shows reference promotions** by storing them in the `promotions` JSONB array:
   ```json
   [
   	{
   		"id": 1,
   		"promotion_id": 43260,
   		"name": "AP Guest",
   		"code": "APGUEST"
   	}
   ]
   ```
3. **Events inherit promotions from shows** but can also add their own
4. **Pricing with promotions** is calculated at purchase time (not stored in promotions table)

### Promotion Management

- **Create**: Go to `/dashboard/promotions` → "Add New Promotion"
- **Edit**: Click edit button on any promotion
- **Delete**: Click delete button (only if not used by shows/events)
- **Status**: Set to 'inactive' to hide from dropdowns without deleting

---

## 4. Events

### What is an Event?

An **Event** represents a specific date instance of a show. Each event:

- Is linked to a parent show (required)
- Has a specific date (date-only, no time)
- **One event per show per date** (duplicate prevention enforced)
- Inherits price levels and promotions from the show
- Contains pricing information for each promotion + price level combination
- Each price level has its own ticket availability (seats)

### Database Structure

**Table:** `events`

**Key Columns:**

- `id` - Primary key (auto-increment)
- `show_id` - Foreign key to `shows` table (required, CASCADE DELETE)
- `name` - Event name
- `description` - Event description
- `event_date` - Event date (timestamptz, required, date-only in UI)
- `event_end_date` - Event end date (timestamptz, optional, not used in current implementation)
- `status` - 'active', 'cancelled', 'sold_out', etc.
- `promotions` - JSONB array of promotion objects, each containing `priceBlocks` with pricing for all price levels
- `price_levels` - JSONB array of price level objects, each with its own `availability` (number of seats)
- `created_at` - Timestamp when event was created
- `updated_at` - Timestamp when event was last updated

**Note:** Venue information is inherited from the parent show, not stored in the events table.

### How Events Are Added

1. **Navigate to Events Page**
   - Go to `/dashboard/events`
   - Click "Add Event" button

2. **Fill in Event Information**
   - **Show**: Select parent show from dropdown (required)
   - **Name**: Event name
   - **Description**: Event description
   - **Date Mode**: Choose "Single Date" or "Multiple Dates (Range)"
     - **Single Date**: Creates one event for the selected date
     - **Multiple Dates**: Creates one event per date in the selected range
   - **Event Date**: Select date (date-only, no time)
   - **End Date**: Select end date (only shown for "Multiple Dates" mode)
   - **Status**: 'active', 'cancelled', 'sold_out', etc.

3. **Inherit Price Levels and Promotions**
   - When a show is selected, the event automatically inherits:
     - All price levels from the show
     - All promotions from the show
   - Each promotion includes `priceBlocks` for all price levels
   - Each price level includes its own `availability` (number of seats)

4. **Configure Pricing**
   - For each promotion, set pricing for all price levels:
     - **Full Retail Price**: The retail price for this price level with this promotion
     - **Full Purchase Price**: The purchase price for this price level with this promotion
   - Pricing is stored in `promotions[].priceBlocks[]` array

5. **Set Ticket Availability**
   - For each price level, set the number of available seats
   - This is stored in `price_levels[].availability`
   - Each price level can have different availability

6. **Save Event**
   - Click "Save" button
   - **Duplicate Prevention**: System checks if any selected date already has an event for that show
     - **Single Date Mode**: If date exists, shows error and doesn't create
     - **Multiple Dates Mode**: Skips existing dates, creates events only for new dates
   - Events are stored in `events` table
   - Each date gets its own event record (one event = one date)

### Date Selection Rules

- **One event per show per date**: The system enforces that each show can only have one event per date
- **Single Date Mode**:
  - If the date already exists for that show → Error: "Event already exists for this show on [date]"
  - If the date doesn't exist → Creates the event
- **Multiple Dates Mode**:
  - Checks all dates in the range
  - Filters out dates that already have events for that show
  - Creates events only for dates that don't exist
  - Shows success message with count of created events and list of skipped dates

### Event Inheritance

Events **inherit** price levels and promotions from their parent show:

1. **When creating an event**, the system automatically:
   - Copies all price levels from show to event (with `availability` field)
   - Copies all promotions from show to event (with empty `priceBlocks` array)
   - Creates `priceBlocks` for each promotion × price level combination

2. **Event-specific configuration**:
   - Events can add price levels not in the show
   - Events can add promotions not in the show
   - Events can remove price levels/promotions from the show
   - Each promotion must have pricing (`priceBlocks`) for all price levels
   - Each price level must have its own availability (seats)

3. **Final event structure**:
   - Event's `price_levels` JSONB array contains price level objects with `availability`
   - Event's `promotions` JSONB array contains promotion objects with `priceBlocks` for all price levels
   - Each `priceBlock` contains `fullRetailPrice` and `fullPurchasePrice` for that price level

---

## 5. How Prices Are Handled

### Price Level vs. Pricing

**Important distinction:**

- **Price Levels** define the **type** of ticket (Premium, Table, GA, etc.)
- **Pricing** (actual dollar amounts) is **NOT stored in price levels table**
- **Pricing is stored in events** within the `promotions` JSONB array

### Pricing Structure

The pricing model follows this structure:

1. **Every promotion has all price levels**: When a promotion is added to an event, it automatically gets a `priceBlock` for each price level

2. **Each priceBlock contains pricing for that price level**:

   ```json
   {
   	"price_level_id": 21971,
   	"price_level_name": "Premium Seat with Table",
   	"fullRetailPrice": 111.95,
   	"fullPurchasePrice": 58.95
   }
   ```

3. **Pricing is stored in events.promotions[]**:

   ```json
   {
   	"id": 1,
   	"promotion_id": 43260,
   	"name": "AP Guest",
   	"code": "APGUEST",
   	"priceBlocks": [
   		{
   			"price_level_id": 21971,
   			"price_level_name": "Premium Seat with Table",
   			"fullRetailPrice": 111.95,
   			"fullPurchasePrice": 58.95
   		},
   		{
   			"price_level_id": 21972,
   			"price_level_name": "Table",
   			"fullRetailPrice": 89.95,
   			"fullPurchasePrice": 49.95
   		}
   	]
   }
   ```

4. **Each price level has its own availability**:
   ```json
   {
   	"id": 1,
   	"price_level_id": 21971,
   	"name": "Premium Seat with Table",
   	"label": "Premium",
   	"availability": 20 // 20 seats available for this price level
   }
   ```

### Pricing Rules

- **Every promotion must have pricing for all price levels**: When you add a promotion to an event, you must set `fullRetailPrice` and `fullPurchasePrice` for each price level
- **Different promotions can have different prices**: The same price level can have different prices under different promotions
- **Availability is per price level**: Each price level has its own number of available seats, independent of other price levels

---

## 6. Data Relationships

### Entity Relationships

```
shows
  ├── venue_id → venues(id)
  ├── series_code → series_codes(name)
  ├── promotions (JSONB) → references promotions table
  └── price_levels (JSONB) → references price_levels table

events
  ├── show_id → shows(id) [CASCADE DELETE]
  ├── promotions (JSONB) → references promotions table, contains priceBlocks with pricing
  └── price_levels (JSONB) → references price_levels table, contains availability per price level

price_levels
  └── (standalone table, referenced by shows and events)

promotions
  └── (standalone table, referenced by shows and events)
```

### JSONB Array Structure

Both `shows` and `events` store related data as JSONB arrays:

**Promotions Array:**

```json
[
	{
		"id": 1,
		"promotion_id": 43260,
		"name": "AP Guest",
		"code": "APGUEST"
	}
]
```

**Price Levels Array (in events):**

```json
[
	{
		"id": 1,
		"price_level_id": 21971,
		"name": "Premium Seat with Table",
		"label": "Premium",
		"availability": 20 // Number of seats available for this price level
	}
]
```

**Promotions Array (in events):**

```json
[
	{
		"id": 1,
		"promotion_id": 43260,
		"name": "AP Guest",
		"code": "APGUEST",
		"priceBlocks": [
			{
				"price_level_id": 21971,
				"price_level_name": "Premium Seat with Table",
				"fullRetailPrice": 111.95,
				"fullPurchasePrice": 58.95
			},
			{
				"price_level_id": 21972,
				"price_level_name": "Table",
				"fullRetailPrice": 89.95,
				"fullPurchasePrice": 49.95
			}
		]
	}
]
```

### Why JSONB?

- **Flexibility**: Can store nested data without schema changes
- **Performance**: PostgreSQL JSONB is indexed and queryable
- **Simplicity**: No need for junction tables for many-to-many relationships
- **Efficiency**: Single query retrieves all related data

---

## 7. Workflow Examples

### Example 1: Creating a Show with Price Levels and Promotions

1. **Create Price Levels** (if not exists):
   - Go to `/dashboard/price-levels`
   - Create "Premium Seat with Table" (price_level_id: 21971)
   - Create "Table" (price_level_id: 21972)
   - Create "General Admission Seat" (price_level_id: 21973)

2. **Create Promotions** (if not exists):
   - Go to `/dashboard/promotions`
   - Create "AP Guest" (code: APGUEST, promotion_id: 43260)
   - Create "Ticket Kite Vegas" (code: TICKETKITEVEGAS, promotion_id: 43246)

3. **Create Show**:
   - Go to `/dashboard/shows` → "Add New Show"
   - Fill in show details
   - Select price levels: Premium, Table, GA Seat
   - Select promotions: AP Guest, Ticket Kite Vegas
   - Save show

4. **Result**:
   - Show is created with price levels and promotions stored in JSONB arrays
   - These are now available for all events of this show

### Example 2: Creating an Event for a Show (Single Date)

1. **Navigate to Events**:
   - Go to `/dashboard/events` → "Add Event"

2. **Select Show**:
   - Choose the show from dropdown (e.g., "All Motown")
   - Event automatically inherits price levels and promotions from show

3. **Set Event Details**:
   - **Date Mode**: Select "Single Date"
   - **Name**: "All Motown - January 7, 2026"
   - **Event Date**: 2026-01-07 (date-only, no time)
   - **Status**: 'active'

4. **Configure Pricing**:
   - For each promotion (e.g., "AP Guest"), set pricing for all price levels:
     - Premium Seat: Retail $111.95, Purchase $58.95
     - Table: Retail $89.95, Purchase $49.95
     - GA Seat: Retail $69.95, Purchase $39.95

5. **Set Ticket Availability**:
   - Premium Seat: 20 seats
   - Table: 15 seats
   - GA Seat: 50 seats

6. **Save Event**:
   - System checks if 2026-01-07 already has an event for "All Motown"
   - If exists → Error: "Event already exists for this show on 1/7/2026"
   - If not exists → Event is created and linked to show

### Example 3: Creating Multiple Events (Date Range)

1. **Navigate to Events**:
   - Go to `/dashboard/events` → "Add Event"

2. **Select Show**:
   - Choose the show from dropdown (e.g., "All Motown")

3. **Set Event Details**:
   - **Date Mode**: Select "Multiple Dates (Range)"
   - **Name**: "All Motown - January 2026"
   - **Start Date**: 2026-01-07
   - **End Date**: 2026-01-20
   - System shows preview: "This will create 14 event(s) for dates: 1/7/2026, 1/8/2026, ..., 1/20/2026"

4. **Configure Pricing and Availability** (same as single date)

5. **Save Event**:
   - System checks all dates from 1/7 to 1/20
   - If 1/8/2026 already has an event for "All Motown":
     - Creates events for: 1/7, 1/9, 1/10, ..., 1/20 (skips 1/8)
     - Success message: "Successfully created 13 event(s). Skipped 1 date(s) that already exist: 1/8/2026"
   - If no conflicts:
     - Creates all 14 events (one per date)

---

## 8. Key Concepts Summary

### Shows

- **Purpose**: Base configuration for a production
- **Contains**: Price levels, promotions, venue, categories, tags
- **Storage**: Hybrid (indexed columns + JSONB)

### Price Levels

- **Purpose**: Define ticket types (Premium, Table, GA, etc.)
- **Storage**: Standalone table
- **Usage**: Referenced by shows and events via JSONB arrays
- **Note**: Price levels don't store prices, only ticket types

### Promotions

- **Purpose**: Discount codes and special offers
- **Storage**: Standalone table
- **Usage**: Referenced by shows and events via JSONB arrays
- **Note**: Promotions don't store prices, only codes and rules

### Events

- **Purpose**: Specific date instance of a show (date-only, no time)
- **Contains**: Inherits price levels and promotions from show
- **Can Override**: Add/remove price levels and promotions
- **Pricing**: Stored in `promotions[].priceBlocks[]` with `fullRetailPrice` and `fullPurchasePrice` for each price level
- **Availability**: Each price level has its own `availability` (number of seats)
- **Duplicate Prevention**: One event per show per date (enforced)

### Pricing

- **Storage**: Pricing is stored in events within `promotions[].priceBlocks[]`
- **Structure**: Every promotion has pricing for all price levels
- **Fields**: `fullRetailPrice` and `fullPurchasePrice` per price level
- **Availability**: Stored in `price_levels[].availability` (per price level)

---

## 9. Database Tables Reference

### Core Tables

1. **`shows`** - Show/production data
2. **`events`** - Event instances linked to shows
3. **`price_levels`** - Ticket type definitions
4. **`promotions`** - Discount code definitions
5. **`venues`** - Venue information
6. **`series_codes`** - Series code definitions
7. **`categories`** - Category definitions
8. **`tags`** - Tag definitions

### Supporting Tables

- **`tips`** - Tips & Tricks articles
- **`show_features`** - Show feature definitions

---

## 10. Next Steps / Future Enhancements

### Inventory Management

- Track individual seats (for reserved seating)
- Real-time availability updates when tickets are purchased
- Support for different seat types (reserved vs. general admission)

### Purchase System

- Create `orders` table
- Create `order_items` table
- Create `tickets` table
- Create `customers` table
- Implement checkout flow
- Handle payment processing
- Generate ticket PDFs/QR codes

### Additional Features

- Event capacity management
- Waitlist functionality
- Refund processing
- Reporting and analytics

---

## Conclusion

This system provides a flexible, scalable structure for managing shows, events, price levels, and promotions. The use of JSONB arrays for many-to-many relationships simplifies the schema while maintaining query performance through PostgreSQL's JSONB indexing.

The hierarchical structure (Shows → Events) with inheritance allows for efficient management of multiple event dates for the same show, while still allowing event-specific customizations.
