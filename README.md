# ShopEase E-Commerce Application

A full-stack e-commerce application built with React, TypeScript, and Supabase.

## Setup Instructions

### 1. Supabase Setup

This application uses Supabase for the backend. You need to:

1. Click the "Connect to Supabase" button in the top right of the editor
2. Execute the database migrations by running each SQL migration file in the Supabase SQL Editor:
   - Open the Supabase dashboard
   - Go to the SQL Editor section
   - Run the contents of each file in the `supabase/migrations` folder in sequence
   - Finally, run the seed data from `supabase/seed.sql` to populate the database with sample products

### 2. Application Features

- Product browsing and searching
- Detailed product views 
- Shopping cart functionality
- User authentication (register, login, logout)
- Responsive design for mobile and desktop

### 3. Running the Application

The application is already configured to connect to Supabase using the environment variables in `.env`.

To start the development server:

```bash
npm run dev
```

## Development

- Frontend: React with TypeScript
- Styling: Tailwind CSS
- State Management: Zustand
- Form Handling: React Hook Form
- Routing: React Router
- Database: Supabase (PostgreSQL)
- Authentication: Supabase Auth