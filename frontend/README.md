# My ADO Mobile Frontend

This project is a mobile-first web client for Azure DevOps work items. It is built with React, Vite, and TypeScript and optimized for touch interactions.

## Getting started

1. Install dependencies:

   ```bash
   npm install
   ```

2. Start the development server:

   ```bash
   npm run dev
   ```

3. Build for production:

   ```bash
   npm run build
   ```

## Configuration

The app reads Azure DevOps configuration from environment variables or the sign-in form. When using environment variables, create a `.env.local` file in the project root with the following values:

```
VITE_AZDO_ORG=<your-organization>
VITE_AZDO_PROJECT=<your-project>
VITE_AZDO_API_BASE=https://dev.azure.com
```

At runtime the app asks for:

- An Azure DevOps personal access token (PAT)
- Organization and project names (pre-filled from environment variables when provided)

Credentials are stored only in `localStorage` on the device and can be cleared from the Settings drawer.

## Features

- Azure DevOps work item list with keyword search, state filters, assignee filter, and sortable columns
- Column chooser with persistence for custom layouts
- Detailed work item view with description, metadata, comment history, state transitions, and comment composer
- Optimistic interactions built with React Query for fast navigation on mobile devices

## Project structure

```
src/
├── app/                  # Layout and router
├── features/
│   ├── auth/             # PAT authentication flow and settings
│   └── work-items/       # Work item list and detail screens
├── lib/                  # API client helpers
└── main.tsx              # App entry point
```

## Scripts

- `npm run dev` – start Vite in development mode
- `npm run build` – type-check and bundle the application
- `npm run preview` – preview the production build locally
- `npm run lint` – run ESLint using the provided config

## License

MIT
