# Installation

Follow these steps to get started with m6-boilerplate:

## Clone the repository

```bash
git clone https://github.com/username/m6-boilerplate.git my-project
```

## Navigate to the project directory

```bash
cd my-project
```

## Install dependencies

With npm:

```bash
npm install
```

With yarn:

```bash
yarn
```

With pnpm:

```bash
pnpm install
```

## Set up environment variables

Create a `.env.local` file in the root of your project and add the following variables:

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=

NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/
NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/
```

Also an `.env` file (Sorry, Prisma is picky - it's easier this way imo)

```env
DATABASE_URL=
```

## Run the development server

With npm:

```bash
npm run dev
```

With yarn:

```bash
yarn dev
```

With pnpm:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the result.
