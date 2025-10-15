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
- `npm run build` – type-check, bundle the application, and copy `dist/index.html` to `dist/404.html` for GitHub Pages routing support
- `npm run preview` – preview the production build locally
- `npm run lint` – run ESLint using the provided config

## Deployment

The repository includes a GitHub Actions workflow (`.github/workflows/deploy-pages.yml`) that builds the frontend and publishes it to GitHub Pages at `https://jeremystokese2.github.io/My-ADO/`.

1. Ensure the `main` branch contains the latest changes.
2. Push to `main` (or trigger the workflow manually) to run the deployment pipeline.
3. In the repository settings, enable Pages and choose “GitHub Actions” as the source.

The workflow builds with the Azure DevOps defaults:

- Organization: `engagesq`
- Project: `Brief Connect`
- API base URL: `https://dev.azure.com/engagesq`

If you need to override these values, edit the `Build frontend` step in the workflow to source them from repository secrets.

## License

MIT
