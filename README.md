<a href="">
  <h1 align="center">Ledgerly: Revolutionizing Financial Management</h1>
</a>

<p align="center">
  Empower your financial management with Ledgerly - AI-driven insights at your fingertips. Optimize your finances effortlessly.
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

Welcome to Ledgerly, where we're ushering in a new era of financial management. Leveraging cutting-edge AI, Ledgerly redefines how you track, analyze, and optimize your finances, ensuring smarter, more secure financial decisions.

With Ledgerly, gain unparalleled insights into your spending habits and financial patterns, empowering you to budget better and experience more. Trusted by the world's most innovative companies, Ledgerly is here to revolutionize your financial management experience.

## What we are using

Lets goooo - Next.js 14, Drizzle ORM, Planetscale, Clerk, Resend, React Email, Shadcn/ui, and Stripe.
<br/>
All seamlessly integrated with the Ledgerly to accelerate the development.

## Directory Structure

The monorepo is split between `apps` and `packages` directories.

    .
    ├── apps                         # Its app workspace which contains
    │    ├── www                     # Nextjs app which is deployed in Vercel
    │    └── ...
    ├── tooling                      # are the shared configuration that are used by the apps and packages (e.g. `@ledgerly/eslint-config`)
    ├── packages                     # are the shared packages that are used by the apps (e.g. `@ledgerly/components`)
    ├── docker-compose.yml
    ├── LICENSE
    └── README.md

> Use short lowercase names at least for the top-level files and folders except
> `LICENSE`, `README.md`

## Installation

Clone & create this repo locally with the following command:

```bash
git clone https://github.com/JoaoArturCosta/ledgerly.git
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
