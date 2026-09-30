# Sales Management Frontend

React + Vite frontend for the Sales Management API. The current screen implements the complete Product CRUD flow:

- List products with search and pagination.
- Create a product.
- Edit a product.
- Delete a product.
- Display API validation and error responses.

## Folder structure

```text
src/
├── api/                         # Shared HTTP client and API errors
├── components/
│   ├── feedback/                # Alert, loading and empty states
│   ├── layout/                  # Application shell/header
│   └── navigation/              # Pagination
├── features/
│   └── products/
│       ├── components/          # Product-specific UI components
│       └── productApi.js        # Product API operations
├── pages/                       # Page-level composition
├── App.jsx
├── App.css
└── index.css
```

## Run locally

1. Start SQL Server and the ASP.NET Core API.
2. Run the API with the HTTPS profile so it listens on `https://localhost:7017`.
3. Install frontend dependencies and start Vite:

```bash
npm install
npm run dev
```

Open the URL printed by Vite, normally `http://localhost:5173`.

The Vite development proxy forwards `/api` requests to the API. Copy `.env.example` to `.env.local` when a different API port is required.

## Production build

```bash
npm run build
npm run preview
```

For a separately hosted API, set `VITE_API_BASE_URL` to the API base URL when building. Production deployment should configure CORS or place the frontend and API behind the same reverse proxy/domain.
