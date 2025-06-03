<a href="">
  <h1 align="center">Kleero: Revolutionizing Financial Management</h1>
</a>

<p align="center">
  Empower your financial management with Kleero - AI-driven insights at your fingertips. Optimize your finances effortlessly.
</p>

<p align="center">
  <a href="#introduction"><strong>Introduction</strong></a> ·
  <a href="#installation"><strong>Installation</strong></a> ·
  <a href="#tech-stack--features"><strong>Tech Stack + Features</strong></a> ·
  <a href="#author"><strong>Author</strong></a> ·
  <a href="#contributing"><strong>Credits</strong></a>
</p>
<br/>

## Introduction

Welcome to Kleero, where we're ushering in a new era of financial management. Leveraging cutting-edge AI, Kleero redefines how you track, analyze, and optimize your finances, ensuring smarter, more secure financial decisions.

With Kleero, gain unparalleled insights into your spending habits and financial patterns, empowering you to budget better and experience more. Trusted by the world's most innovative companies, Kleero is here to revolutionize your financial management experience.

## What we are using

Lets goooo - Next.js 14, Drizzle ORM, Planetscale, Clerk, Resend, React Email, Shadcn/ui, and Stripe.
<br/>
All seamlessly integrated with the Kleero to accelerate the development.

## Directory Structure

The monorepo is split between `apps` and `packages` directories.

    .
    ├── apps                         # Its app workspace which contains
    │    ├── www                     # Nextjs app which is deployed in Vercel
    │    └── ...
    ├── tooling                      # are the shared configuration that are used by the apps and packages (e.g. `@Kleero/eslint-config`)
    ├── packages                     # are the shared packages that are used by the apps (e.g. `@Kleero/components`)
    ├── docker-compose.yml
    ├── LICENSE
    └── README.md

> Use short lowercase names at least for the top-level files and folders except
> `LICENSE`, `README.md`

## Installation

Clone & create this repo locally with the following command:

```bash
git clone https://github.com/JoaoArturCosta/Kleero.git
```

1. Install dependencies using yarn:

```sh
yarn install
```

2. Copy `.env.example` to `.env.local` and update the variables.

```sh
cp .env.example .env.local
```

4. Input everything you need for the env.

   1. Create [Supabase](https://supabase.com/) Account
   2. Create [Resend](https://resend.com) Account
   3. Create [Stripe](https://stripe.com) Account
   4. Create [Edge Store](https://edgestore.dev) Account

5. Start the development server from either yarn or turbo:

```sh
# At the root of the mono repo
yarn run dev

# Or from the app directory
cd apps/www
yarn dev
```

## Database

This project uses MySQL database on PlanetScale. To setup a DB for your local dev:

1. Create a free account and a [new Database](https://planetscale.com/docs/tutorials/planetscale-quick-start-guide#create-a-database)
2. From the dashboard, create a branch and click "Connect" button.
3. Hit `Create password` and select `Drizzle` in `Connect with` dropdown
4. Copy the entire list of params to `.env.local` file. Make sure to change the params under the section "Database (MySQL - PlanetScale)"
5. run `yarn db:push`

You can also use `docker-compose` to have a Mysql database locally, instead of relying on PlanetScale:

1. Enter `MYSQL_ROOT_PASSWORD`, `MYSQL_DATABASE`, `MYSQL_USER` and `MYSQL_PASSWORD` values in `.env.local`.
2. run `docker-compose --env-file .env.local up` to start the DB.
3. run `yarn db:push`.

## Email provider

This project uses [Resend](https://resend.com/) to handle transactional emails. You need to add create an account and get an api key needed for authentication.

Please be aware that the Resend is designed to send test emails exclusively to the email address registered with the account, or to `delivered@resend.dev`, where they are logged on their dashboard.

The default setting for `TEST_EMAIL_ADDRESS` is `delivered@resend.dev` but you have the option to change it to the email address that is associated with your Resend account.

## Roadmap

- [x] ~Initial setup~
- [ ] Start removing template
- [ ] Update UI to match the product
- [ ] XXXXXXXX

## Tech Stack + Features

### Frameworks

- [Next.js](https://nextjs.org/) – React framework for building performant apps with the best developer experience
- [NextAuth.js](https://next-auth.js.org) – Handle user authentication with ease with providers like Google, Twitter, GitHub, etc.
- [Drizzle ORM](https://orm.drizzle.team/) – TypeScript ORM that feels like SPA with SSR
- [React Email](https://react.email/) – Versatile email framework for efficient and flexible email development

### Platforms

- [Vercel](https://vercel.com/) – Easily preview & deploy changes with git
- [PlanetScale](https://planetscale.com/) – A cutting-edge database platform for seamless, scalable data management
- [Resend](https://resend.com/) – A powerful email framework for streamlined email development
- [Edge Store](https://edgestore.dev/) - Storage, CDN and a super easy to use type-safe library.
- [Stripe](https://stripe.com) - Payments

### UI

- [Tailwind CSS](https://tailwindcss.com/) – Utility-first CSS framework for rapid UI development
- [Shadcn/ui](https://ui.shadcn.com/) – Re-usable components built using Radix UI and Tailwind CSS
- [Framer Motion](https://framer.com/motion) – Motion library for React to animate components with ease
- [Lucide](https://lucide.dev/) – Beautifully simple, pixel-perfect icons
- [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) – Optimize custom fonts and remove external network requests for improved performance
- [`ImageResponse`](https://nextjs.org/docs/app/api-reference/functions/image-response) – Generate dynamic Open Graph images at the edge

# Kleero

Your comprehensive financial management platform. Track expenses, manage income, monitor savings, and gain insights into your financial health with powerful analytics and intuitive design.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL database
- At least one OAuth provider configured (Discord or Google)

### Installation

1. Clone the repository

```bash
git clone <repository-url>
cd Kleero
```

2. Install dependencies

```bash
npm install
```

3. Set up environment variables

```bash
cp .env.example .env.local
```

4. Configure your environment variables (see [Environment Setup](#environment-setup))

5. Run database migrations

```bash
npm run db:push
```

6. Start the development server

```bash
npm run dev
```

## 🔐 Authentication Setup

Kleero uses NextAuth.js with OAuth providers for secure authentication.

### Environment Setup

Create a `.env.local` file with the following variables:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/Kleero"

# NextAuth.js
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"

# OAuth Providers (configure at least one)
# Discord OAuth
DISCORD_CLIENT_ID="your-discord-client-id"
DISCORD_CLIENT_SECRET="your-discord-client-secret"

# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

### OAuth Provider Setup

#### Discord OAuth Setup

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Create a new application
3. Go to OAuth2 → General
4. Add redirect URI: `http://localhost:3000/api/auth/callback/discord`
5. Copy Client ID and Client Secret to your `.env.local`

#### Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Go to Credentials → Create OAuth 2.0 Client ID
5. Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
6. Copy Client ID and Client Secret to your `.env.local`

### Authentication Flow

```mermaid
graph TD
    A[User visits /] --> B{Authenticated?}
    B -->|Yes| C[Redirect to /dashboard]
    B -->|No| D[Show landing page]
    D --> E[User clicks Sign In]
    E --> F[OAuth Provider Login]
    F --> G[Successful Auth]
    G --> H[Redirect to /dashboard]

    I[User visits /dashboard] --> J{Authenticated?}
    J -->|No| K[Redirect to signin with callback]
    J -->|Yes| L[Show dashboard]
```

## 🛠️ Development

### Project Structure

```
src/
├── app/                 # Next.js App Router pages
│   ├── auth/           # Authentication pages
│   ├── dashboard/      # Protected dashboard pages
│   ├── api/            # API routes
│   └── page.tsx        # Landing page
├── components/         # Reusable UI components
├── lib/               # Utility libraries
│   └── auth.ts        # Centralized auth utilities
├── server/            # Server-side code
│   ├── auth.ts        # NextAuth.js configuration
│   └── db/            # Database schema and utilities
└── middleware.ts      # Route protection middleware
```

### Authentication Architecture

#### Middleware (`middleware.ts`)

- Runs on every request at the edge
- Handles route protection and redirects
- Uses NextAuth.js JWT tokens for auth state

#### Auth Utilities (`src/lib/auth.ts`)

- Centralized authentication helpers
- Consistent session handling across server/client
- Route configuration and path checking utilities

#### Server Auth (`src/server/auth.ts`)

- NextAuth.js configuration
- OAuth provider setup with graceful degradation
- Session callbacks and user management

### Route Protection

Routes are automatically protected based on configuration in `src/lib/auth.ts`:

- **Public Routes**: `/`, `/api/auth/*`
- **Protected Routes**: `/dashboard`, `/expenses`, `/banking`
- **Admin Routes**: `/admin`

### Adding New Protected Routes

1. Add the route path to `RouteConfig.protected` in `src/lib/auth.ts`
2. The middleware will automatically protect it
3. Use `getAuthSession()` in server components for user data

## 🐛 Debugging Authentication

### Common Issues

#### "No OAuth providers configured"

- Check that environment variables are properly set
- Ensure at least one provider has both CLIENT_ID and CLIENT_SECRET
- Restart the development server after changing env vars

#### "Access Denied" errors

- Verify OAuth redirect URIs match exactly
- Check that OAuth app is not in development mode (for production)
- Ensure OAuth scopes include profile and email

#### Infinite redirect loops

- Check middleware configuration
- Verify NextAuth.js secret is set
- Clear browser cookies and try again

### Debug Mode

Enable debug logging by adding to your `.env.local`:

```env
NEXTAUTH_DEBUG=true
```

### Development Tools

- Visit `/api/auth/providers` to see configured providers
- Check browser developer tools for auth-related cookies
- Use `getAuthSession()` to debug session state in server components

## 📊 Database

The application uses Drizzle ORM with PostgreSQL:

- Schema: `src/server/db/schema.ts`
- Database utilities: `src/server/db/index.ts`
- Migrations: `npm run db:push`
- Studio: `npm run db:studio`

## 🚢 Deployment

### Environment Variables for Production

```env
# Required for production
DATABASE_URL="your-production-database-url"
NEXTAUTH_SECRET="your-production-secret"
NEXTAUTH_URL="https://your-domain.com"

# OAuth providers
DISCORD_CLIENT_ID="your-discord-client-id"
DISCORD_CLIENT_SECRET="your-discord-client-secret"
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

### Deployment Checklist

- [ ] Set up production database
- [ ] Configure OAuth redirect URIs for production domain
- [ ] Set all required environment variables
- [ ] Run database migrations
- [ ] Test authentication flow in production

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Test authentication flows
5. Commit changes: `git commit -m 'Add amazing feature'`
6. Push to branch: `git push origin feature/amazing-feature`
7. Open a Pull Request

## 📝 License

This project is licensed under the MIT License.
