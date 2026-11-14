# Product Requirements Document (PRD)
## TravelBharat — The Digital Tourism Encyclopedia of India

---

## 1. Executive Summary
**TravelBharat** is a comprehensive, non-commercial digital tourism encyclopedia dedicated to chronicling India's 28 States, 8 Union Territories, historical landmarks, natural wonders, high-altitude adventure circuits, and sacred pilgrimage destinations. 

Unlike commercial booking portals, TravelBharat is strictly **read-only for visitors**—free from advertisements, hotel affiliate links, sponsored bookings, or user reviews. An authenticated **Admin** portal provides full Content Management System (CMS) capabilities to create, update, and manage administrative regions, city hubs, and tourist destinations.

---

## 2. Target Audience & Personas
- **Cultural Tourists & Travellers**: Researching India's monumental architecture, regional landscapes, visiting hours, and geographical coordinates.
- **Students & Researchers**: Seeking authentic historical significance, state capitals, and heritage classifications.
- **Encyclopedia Curators & Administrators**: Authorized editors maintaining factual accuracy, entry tariffs, seasonal advisories, and photography.

---

## 3. Product Principles
1. **Uncluttered & Pure Information**: No commercial bookings, payment gateways, review solicitations, or visitor accounts.
2. **Authentic Cultural Representation**: Showcasing Indian heritage with rich photography, accurate geography, and historical context.
3. **Robust Security**: Authentication secured using bcryptjs password hashing and JSON Web Tokens delivered strictly inside `httpOnly` cookies.
4. **Resilient Out-of-the-Box Execution**: Intelligent database fallback supporting both standard MongoDB installations and autonomous in-memory instances for evaluation and testing.

---

## 4. Technical Architecture & Tech Stack

```
+--------------------------------------------------------------+
|                        Client Layer                          |
|         Next.js 14 (App Router) + React 18 + Tailwind CSS     |
|   - Public Directory: States, UTs, Places, Categories, Search|
|   - Admin Portal: Dashboard, States/Cities/Places CRUD Forms |
+--------------------------------------------------------------+
                               |
                   HTTP / REST with httpOnly Cookies
                               v
+--------------------------------------------------------------+
|                        Server Layer                          |
|                  Node.js + Express 4.19                      |
|   - Routing: States, Cities, Places, Categories, Auth        |
|   - Middleware: Cookie-Parser, Helmet, CORS, JWT Protect     |
+--------------------------------------------------------------+
                               |
                            Mongoose
                               v
+--------------------------------------------------------------+
|                       Database Layer                         |
|                 MongoDB / MongoDB-Memory-Server              |
|   - Collections: states, cities, places, admins              |
+--------------------------------------------------------------+
```

### 4.1 Frontend Stack
- **Framework**: Next.js 14 with App Router (`/client`)
- **UI & Styling**: React 18, Tailwind CSS, Lucide React icons
- **State & Context**: React Context (`AuthContext`) handling admin authentication state and cookie lifecycle
- **Language**: JavaScript (ES6+)

### 4.2 Backend Stack
- **Runtime**: Node.js (>= 18.0.0)
- **Framework**: Express.js
- **Database & ODM**: MongoDB with Mongoose ODM
- **Security & Auth**: `bcryptjs` (salt rounds: 10), `jsonwebtoken` stored in `httpOnly` cookies
- **Testing**: Jest and Supertest

---

## 5. Information Architecture & Data Models

### 5.1 State Model (`State`)
| Field | Type | Attributes | Description |
|---|---|---|---|
| `name` | String | Required, Unique, Trim | Full name of the State or UT (e.g., "Rajasthan") |
| `slug` | String | Required, Unique, Lowercase | URL slug (e.g., "rajasthan") |
| `type` | String | Required, Enum `['State', 'Union Territory']` | Administrative classification |
| `capital` | String | Required, Trim | Capital city (e.g., "Jaipur") |
| `description` | String | Required, Trim | Detailed cultural and geographical overview |
| `heroImage` | String | Trim | High-resolution photography URL |
| `isActive` | Boolean | Default: `true` | Visibility flag for visitors |
| `timestamps` | Date | `createdAt`, `updatedAt` | Automatic audit timestamps |

### 5.2 City Model (`City`)
| Field | Type | Attributes | Description |
|---|---|---|---|
| `name` | String | Required, Trim | Name of the city/hub (e.g., "Jaipur") |
| `slug` | String | Required, Lowercase | URL slug |
| `state` | ObjectId | Ref: `'State'`, Required | Associated State or Union Territory |
| `description` | String | Optional, Trim | Brief summary of the city |

### 5.3 Place Model (`Place`)
| Field | Type | Attributes | Description |
|---|---|---|---|
| `name` | String | Required, Trim | Name of destination (e.g., "Taj Mahal") |
| `slug` | String | Required, Unique, Lowercase | URL slug (e.g., "taj-mahal") |
| `state` | ObjectId | Ref: `'State'`, Required | State / UT foreign key |
| `city` | ObjectId | Ref: `'City'`, Optional | City / District hub reference |
| `category` | String | Required, Enum `['Heritage', 'Nature', 'Adventure', 'Religious']` | Thematic category |
| `description` | String | Required, Trim | Comprehensive overview |
| `historicalSignificance` | String | Optional | Founding history, dynasty, or scripture |
| `bestTimeToVisit` | String | Optional | Ideal season / climatic advice |
| `entryFee` | String | Default: `'Free'` | Visitor entry tariff |
| `timings` | String | Default: `'Open daily'` | Visiting hours / closures |
| `mapLink` | String | Optional | Google Maps navigation URL |
| `images` | Array | `[{ url, caption, isPrimary }]` | Multi-image gallery with primary thumbnail |

### 5.4 Admin Model (`Admin`)
| Field | Type | Attributes | Description |
|---|---|---|---|
| `name` | String | Default: `'Administrator'` | Admin display name |
| `email` | String | Required, Unique, Lowercase | Sign-in email address |
| `password` | String | Required, Hashed | bcryptjs-hashed password (hidden in queries) |
| `role` | String | Default: `'admin'` | Role authorization |

---

## 6. Functional Specifications

### 6.1 Public Visitor Portal (Read-Only)
- **Home (`/`)**: Hero banner with live search launcher, stats counters (States, UTs, Destinations), Category spotlight, curated places grid, and mission manifesto.
- **States Directory (`/states`)**: Filterable grid displaying 28 States and 8 Union Territories with capital, place counts, and search filter.
- **State Detail (`/states/[slug]`)**: Hero banner, capital, regional description, city hub list, and categorized tourist places in that state.
- **Place Detail (`/places/[slug]`)**: Breadcrumbs, category badge, interactive photo gallery (with primary thumbnail indicator and captions), fast-fact sheet (timings, fee, season, capital), narrative description, historical significance, Google Maps link, and nearby attractions.
- **Category Explorer (`/categories`)**: Thematic navigation across *Heritage*, *Nature*, *Adventure*, and *Religious* with summary counts and filtered destinations.
- **Universal Search (`/search`)**: Real-time keyword search across place names, descriptions, and regions with state dropdown and category filters.

### 6.2 Admin Editorial Portal
- **Login (`/admin/login`)**: Email and password authentication with demo credential assistance. Sets secure `httpOnly` cookie.
- **Dashboard (`/admin`)**: Metric tiles (States, UTs, Cities, Places count), quick action navigation, and recent place updates.
- **States Management (`/admin/states`)**: Create, Edit, and Delete states; toggle public active status; deletion safeguard if places/cities reference the state.
- **Cities Management (`/admin/cities`)**: Create, Edit, and Delete city hubs filtered by state.
- **Places Management (`/admin/places`)**: Complete editorial form with multi-image gallery manager (add/remove URLs, set primary photo, captions), state-dependent city selector, timings, fees, and coordinates.
- **Logout (`/admin`)**: Securely clears the JWT cookie and resets admin context.

---

## 7. Testing & Quality Assurance
- **Integration Tests**: Jest + Supertest test suite (`server/tests/api.test.js`) validating:
  1. API Health Check endpoint.
  2. Public visitor endpoints (States, Places, Categories, Stats, Slugs).
  3. Authentication flows (Invalid login, valid login, cookie generation, logout).
  4. Protected Admin CRUD (Unauthorized rejection, State CRUD, City CRUD, Place CRUD, cascade deletion protection).
