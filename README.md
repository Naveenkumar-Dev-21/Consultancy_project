# Aadhiran Baby Products — E-Commerce Platform

A full-stack e-commerce application for baby products built with **React** (frontend) and **Express + MongoDB** (backend).

## Tech Stack

| Layer     | Technology                          |
|-----------|-------------------------------------|
| Frontend  | React 19, Vite, TailwindCSS        |
| Backend   | Express 5, MongoDB, Mongoose       |
| Auth      | JWT, Google OAuth                   |
| Payments  | Razorpay                            |
| Deploy    | Vercel (frontend + backend)         |

## Project Structure

```
Consultancy_project/
├── backend/
│   ├── config/          # Database connection
│   ├── constants/       # Shared enums and error messages
│   ├── controllers/     # Route handlers (auth, order, product, etc.)
│   ├── middleware/       # Auth & error middleware
│   ├── models/          # Mongoose schemas
│   ├── routes/          # Express route definitions
│   ├── utils/           # Encryption utilities
│   ├── validators/      # Request validation logic
│   ├── server.js        # App entry point
│   └── vercel.json      # Vercel deployment config
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── auth/    # Route guards (Protected, Admin, Public)
│   │   │   ├── common/  # Reusable UI (ProductCard, Carousel, Lightbox)
│   │   │   └── layout/  # Header, Footer
│   │   ├── context/     # React contexts (Cart, Toast, Wishlist)
│   │   ├── pages/       # Page-level components
│   │   ├── services/    # API client (Axios instance)
│   │   ├── styles/      # CSS files
│   │   └── utils/       # PDF generator
│   └── vercel.json      # Vercel deployment config
│
├── .gitignore
└── README.md
```

## Getting Started

### Prerequisites

- **Node.js** ≥ 18
- **MongoDB** (local or Atlas)
- **Razorpay** account (for payments)
- **Google Cloud** project (for OAuth)

### Backend Setup

```bash
cd backend
cp .env.example .env
# Edit .env with your actual credentials
npm install
npm run dev
```

### Frontend Setup

```bash
cd frontend
cp .env.example .env
# Edit .env with your actual values
npm install
npm run dev
```

The frontend dev server runs at `http://localhost:5173` and proxies API requests to `http://localhost:5000`.

## Environment Variables

### Backend (`.env`)

| Variable           | Description                      |
|--------------------|----------------------------------|
| `MONGO_URI`        | MongoDB connection string        |
| `JWT_SECRET`       | Secret key for JWT signing       |
| `PORT`             | Server port (default: 5000)      |
| `ADMIN_EMAIL`      | Admin user email address         |
| `RAZORPAY_KEY_ID`  | Razorpay API key ID              |
| `RAZORPAY_KEY_SECRET` | Razorpay API key secret       |
| `ENCRYPTION_KEY`   | 32-char key for image encryption |

### Frontend (`.env`)

| Variable               | Description                    |
|------------------------|--------------------------------|
| `VITE_API_URL`         | Backend API base URL           |
| `VITE_GOOGLE_AUTH_URL` | Google OAuth endpoint          |
| `VITE_GOOGLE_CLIENT_ID`| Google OAuth client ID         |

## Deployment

Both frontend and backend are configured for **Vercel** deployment as separate projects. See `vercel.json` in each directory.