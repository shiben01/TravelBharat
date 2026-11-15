# TravelBharat — Digital Tourism Encyclopedia of India

**TravelBharat** is a full-stack, read-only tourism encyclopedia for India built with **Next.js (App Router)** and **Express / MongoDB**. Users can browse Indian States and Union Territories, explore famous monuments, natural landscapes, adventure circuits, and sacred pilgrimages, and search across destinations by name, region, or category. 

It is strictly **read-only for visitors**—no bookings, payments, advertisements, visitor accounts, or reviews. An authenticated **Admin** portal allows editors to add, update, and delete administrative regions, city hubs, and tourist places.

---

## 📸 Core Features

- 🇮🇳 **Explore 28 States & 8 Union Territories**: Browse regional capitals, descriptions, high-resolution imagery, and lists of places and cities within each state.
- 🏛️ **Four Core Categories**:
  - **Heritage**: Majestic forts, royal palaces, Mughal architecture, and UNESCO World Heritage sites.
  - **Nature**: Hill stations, emerald backwaters, waterfalls, and pristine coastlines.
  - **Adventure**: High-altitude Himalayan passes, river rafting in the Ganges, and desert safaris.
  - **Religious**: Timeless river ghats, sacred Dravidian gopurams, and pilgrimage circuits.
- 🔍 **Universal Search & Filtering**: Real-time keyword search across monument names and historical chronicles, with state and category filter chips.
- 🖼️ **Interactive Place Galleries**: Multi-image photography with primary photo highlighting and descriptive captions.
- 📍 **Practical Travel Intelligence**: Accurate visiting hours, entry fees (Indian / Foreign tourists), best seasons to visit, and Google Maps direct links.
- 🛡️ **Secure Admin CMS**:
  - Protected using **bcryptjs** and **JSON Web Tokens (JWT)** stored in an `httpOnly` cookie.
  - Full CRUD operations for **States**, **Cities**, and **Places** with dynamic multi-image URL management.
  - Cascading delete safeguards (prevents deleting states/cities that still hold tourist destinations).

---

## 🛠️ Stack & Architecture

| Layer | Technologies |
|---|---|
| **Frontend (`/client`)** | Next.js 14 (App Router), React 18, Tailwind CSS, Lucide React, JavaScript (ES6+) |
| **Backend (`/server`)** | Node.js, Express 4.19, Mongoose 8, MongoDB |
| **Authentication** | `bcryptjs` password hashing, `jsonwebtoken` in an `httpOnly` secure cookie |
| **Testing** | Jest and Supertest (`server/tests/api.test.js`) |
| **Fallback DB** | Embedded `mongodb-memory-server` fallback for zero-configuration instant local startup |

---

## 📂 Folder Layout

```
travelbharat/
├── client/                     # Next.js 14 App Router frontend
│   ├── src/
│   │   ├── app/                # App router routes
│   │   │   ├── page.js         # Homepage (Hero, Stats, Categories, Curated Places)
│   │   │   ├── layout.js       # Root Layout (Navbar, Footer, AuthProvider)
│   │   │   ├── globals.css     # Tailwind Directives & Custom Styles
│   │   │   ├── states/         # States & UTs Directory
│   │   │   │   ├── page.js     # Filterable States Grid
│   │   │   │   └── [slug]/     # Single State Page (Cities & Places)
│   │   │   ├── places/
│   │   │   │   └── [slug]/     # Single Place Page (Gallery, Facts, History)
│   │   │   ├── categories/     # Category Explorer (Heritage, Nature, etc.)
│   │   │   ├── search/         # Universal Destination Search
│   │   │   └── admin/          # Admin Editorial Console
│   │   │       ├── login/      # Admin Login Portal
│   │   │       ├── page.js     # Metrics Dashboard
│   │   │       ├── states/     # State CRUD Manager
│   │   │       ├── cities/     # City CRUD Manager
│   │   │       └── places/     # Place CRUD Manager & Photo Gallery Editor
│   │   ├── components/         # Navbar, Footer, PlaceCard, StateCard, AdminGuard
│   │   └── lib/                # API Client & AuthContext
│   ├── .env.example            # Client environment sample
│   ├── .env.local              # Client environment config
│   ├── package.json
│   └── tailwind.config.js
│
├── server/                     # Express REST API backend
│   ├── src/
│   │   ├── config/             # DB connector with Memory Server fallback
│   │   ├── controllers/        # Auth, State, City, Place controllers
│   │   ├── middleware/         # JWT Auth Protect & Central Error Handler
│   │   ├── models/             # State, City, Place, Admin Mongoose Schemas
│   │   ├── routes/             # REST API Routes
│   │   ├── scripts/            # Comprehensive Seed Dataset (States, Cities, Places)
│   │   ├── app.js              # Express app initialization & middleware
│   │   └── server.js           # Server runner & automatic startup auto-seed
│   ├── tests/                  # Jest & Supertest Integration Test Suite
│   ├── .env.example            # Server environment sample
│   ├── .env                    # Server environment config
│   └── package.json
│
├── README.md                   # Project documentation & sensible defaults
└── PRD.md                      # Product Requirements Document
```

---

## 🎯 Sensible Defaults Picked

Where specifications were open-ended, the following sensible defaults were implemented:

1. **Port Allocations**:
   - Backend API runs on port `5000` (`http://localhost:5000`).
   - Frontend runs on port `3000` (`http://localhost:3000`).
2. **Autonomous Database Fallback**:
   - The backend checks for standard MongoDB connection (`mongodb://localhost:27017/travelbharat`).
   - If a local MongoDB daemon is not detected, in development it **automatically spins up an embedded in-memory MongoDB instance** (`mongodb-memory-server`) and immediately runs the auto-seeder. This guarantees the project runs immediately with zero setup friction.
3. **Pre-Seeded Administrator Account**:
   - Default Email: `admin@travelbharat.in`
   - Default Password: `Admin@123456`
   - Automatically seeded on first startup if no admin exists.
4. **JWT Cookie Policy**:
   - Token cookie named `token` configured with `httpOnly: true`, `sameSite: 'lax'`, `maxAge: 7 days`.
   - In production, `secure: true` is enforced.
   - Dual-token support: Fallback `Authorization: Bearer <token>` header is also accepted for automated API test clients.
5. **Cascading Delete Protection**:
   - An administrator cannot delete a State that still contains registered Cities or Tourist Places. The API returns an informative `400 Bad Request` instructing the editor to remove or reassign associated records first.
6. **Images Representation**:
   - Every place contains an array of `{ url, caption, isPrimary }`. The admin UI provides dynamic add/remove rows and a one-click "Set Primary" selector.

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18.0.0 or higher recommended)
- Optional: Local [MongoDB](https://www.mongodb.com/) (if absent, the app automatically falls back to an embedded in-memory database).

---

### 1. Server Setup (`/server`)

```bash
# Navigate to the server folder
cd server

# Install dependencies
npm install

# (Optional) Verify your environment variables
# A default .env is pre-configured with:
# PORT=5000
# MONGODB_URI=mongodb://localhost:27017/travelbharat
# JWT_SECRET=travelbharat_jwt_super_secret_key_2026_change_in_production
# CLIENT_URL=http://localhost:3000

# Run Integration Tests with Jest and Supertest
npm test

# Start the Express API server (runs auto-seeder if database is empty)
npm run dev   # or: npm start
```

Backend will be running at `http://localhost:5000`  
Health check endpoint: `http://localhost:5000/api/health`

---

### 2. Client Setup (`/client`)

In a new terminal window:

```bash
# Navigate to the client folder
cd client

# Install dependencies
npm install

# Start the Next.js development server
npm run dev
```

Frontend will be running at `http://localhost:3000`.

---

## 🧪 Running Automated Tests

The backend includes an exhaustive integration test suite using **Jest** and **Supertest** covering 24 assertions across health, visitor routes, search filters, JWT authentication, and admin CRUD.

```bash
cd server
npm test
```

### Test Suite Coverage:
- `GET /api/health` — Service uptime & health status.
- `GET /api/states` — Active states directory & region type filtering (`?type=State`, `?type=Union Territory`).
- `GET /api/states/:slug` — State details populated with child cities and tourist places.
- `GET /api/places` — Listing places with keyword search (`?q=Taj`), category filter (`?category=Heritage`), and slug query.
- `GET /api/categories` & `GET /api/stats` — Summary aggregation endpoints.
- `POST /api/auth/login` — Verifies valid and invalid credentials, and confirms `Set-Cookie` httpOnly header.
- `GET /api/auth/me` & `POST /api/auth/logout` — Validates cookie authentication and cookie invalidation.
- `POST/PUT/DELETE /api/states` & `/api/places` — Validates admin protected routes, creation, updates, and foreign key constraint protection.

---

## 🔌 API Reference

### Public Visitor Endpoints (Read-Only)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Service health status |
| `GET` | `/api/states` | List states & UTs (Supports `?type=`, `?search=`, `?activeOnly=`) |
| `GET` | `/api/states/:slug` | Get single state with its cities and tourist places |
| `GET` | `/api/cities` | List cities (Supports `?stateId=`, `?stateSlug=`) |
| `GET` | `/api/places` | List places (Supports `?q=`, `?state=`, `?category=`, `?city=`, `?sort=`) |
| `GET` | `/api/places/:slug` | Get single place detail with populated state & city |
| `GET` | `/api/categories` | Categories list with documented site counts |
| `GET` | `/api/stats` | High-level metrics for dashboard & homepage counters |

### Admin Endpoints (Protected by JWT Cookie)
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/login` | Authenticate admin, returns JWT inside `httpOnly` cookie |
| `POST` | `/api/auth/logout` | Clears authentication cookie |
| `GET` | `/api/auth/me` | Fetch authenticated admin profile |
| `POST` | `/api/admin/states` | Create new State or Union Territory |
| `PUT` | `/api/admin/states/:id` | Update existing State / UT |
| `DELETE` | `/api/admin/states/:id` | Delete State (blocked if places/cities exist) |
| `POST` | `/api/admin/cities` | Create city hub |
| `PUT` | `/api/admin/cities/:id` | Update city hub |
| `DELETE` | `/api/admin/cities/:id` | Delete city hub |
| `POST` | `/api/admin/places` | Create tourist place with image gallery |
| `PUT` | `/api/admin/places/:id` | Update tourist place details & images |
| `DELETE` | `/api/admin/places/:id` | Delete tourist place |

---

## 🔐 Admin Portal Access

To access the editorial dashboard:
1. Navigate to `/admin/login` in your browser.
2. Sign in with the seeded credentials:
   - **Email**: `admin@travelbharat.in`
   - **Password**: `Admin@123456`
3. You will be redirected to the `/admin` dashboard where you can create, modify, and delete states, cities, and tourist destinations.

---

## ☁️ Cloud Deployment & Production Checklist

If deploying to platforms like **Render**, **Railway**, or **Vercel**:

### 1. MongoDB Atlas Configuration
- In your **MongoDB Atlas** dashboard:
  - Go to **Network Access** → Click **Add IP Address** → Choose **Allow Access from Anywhere (`0.0.0.0/0`)**. Cloud hosting platforms (like Render/Railway) use dynamic outbound IPs. If not set to `0.0.0.0/0`, Atlas will reject connections when your server wakes up or changes instances.
  - In **Database Access**, verify your database user has read/write privileges. If the password has special characters (`@`, `:`, `/`), URL-encode them.

### 2. Environment Variables Checklist
- **Backend (Render / Railway)**:
  - `PORT`: `5000` (or host provided)
  - `NODE_ENV`: `production`
  - `MONGODB_URI`: `mongodb+srv://<username>:<password>@cluster0.xxx.mongodb.net/travelbharat?retryWrites=true&w=majority`
  - `CLIENT_URL`: URL of your frontend (e.g. `https://your-app.vercel.app`)
  - `JWT_SECRET`: A long secure random string
- **Frontend (Vercel)**:
  - `NEXT_PUBLIC_API_URL`: URL of your backend with `/api` path (e.g. `https://your-backend.onrender.com/api` without trailing slash)

### 3. Understanding Cloud Sleep & Cold Starts (Free Tier)
- Free tier services on Render sleep after 15 minutes of inactivity. When a request arrives, it takes 30-50 seconds for the backend container to wake up.
- The frontend includes built-in retry and cold-start tolerance. If a request times out while the server is waking up, click **"Refresh Content"** or visit your backend URL's `/api/health` to trigger wakeup.
- Check live database status anytime by visiting `https://your-backend.onrender.com/api/health`. It reports MongoDB connection state and document counts in real time.
