# DreamClick

DreamClick is a full-stack creative marketplace and media gallery built for photographers, video editors, and digital creators. It combines a polished image exploration experience with a creator-first video template marketplace where users can browse, preview, save, add to cart, upload, manage, and purchase VN-style video editing templates.

The project is designed as a modern MERN application with a React 19 frontend, an Express/MongoDB backend, JWT authentication, creator/admin workflows, and object-storage support through MinIO/S3-style services.

## What It Does

DreamClick gives visitors a clean way to explore creative media while giving creators a structured place to publish and sell reusable video templates.

Core experiences include:

- A modern animated home page with an interactive WebGL Threads background.
- A public image gallery with zoom and thumbnail navigation.
- A video template marketplace with portrait preview cards, hover playback, pricing, categories, tags, and creator attribution.
- Guest cart and favourite support backed by local storage.
- Authenticated cart and favourite syncing through the backend.
- Email-based quick login flow that can merge guest cart/favourites into a user account.
- Template upload, edit, delete, preview, and purchase flows.
- Role-aware accounts for end users, content creators, and admins.
- Admin dashboard sections for users, templates, products, orders, analytics, and settings.
- MinIO-backed upload listing, file preview, URL copy, and delete utilities.

## Product Highlights

### Public Experience

- Browse curated photography through a responsive LightGallery-powered grid.
- Discover video templates in a mobile-friendly 9:16 card layout.
- Preview videos inline with `react-player`.
- Save favourite templates or add them to cart without signing in.
- Keep cart and favourites after login through guest-state merging.
- Navigate through Home, Explore, Video Templates, Cart, Favourites, About, and Contact pages.

### Creator Experience

- Sign up as a content creator.
- Add new video templates with title, description, preview video URL, thumbnail, category, price, old price, tags, and optional file URL.
- View personal uploads through the `Mine` filter.
- Delete owned templates directly from creator-facing cards.

### Admin Experience

- Manage users with searchable, paginated tables.
- View user KPIs such as total users, admin users, regular users, and new users this month.
- Manage all templates from a dedicated admin table.
- Preview, edit, add, and delete templates.
- Navigate a structured admin shell with dashboard, orders, products, customers, analytics, templates, and settings sections.

## Tech Stack

### Frontend

- React 19
- TypeScript
- Vite
- Tailwind CSS 4
- Radix UI primitives
- shadcn-style local UI components
- React Router 7
- TanStack Query
- TanStack Table
- Framer Motion
- GSAP
- OGL WebGL renderer
- React Player
- LightGallery
- React Hook Form
- Zod
- Axios
- Sonner toast notifications
- Lucide icons

### Backend

- Node.js
- Express
- MongoDB
- Mongoose
- JWT authentication
- bcrypt / bcryptjs
- Joi validation
- Multer
- MinIO
- AWS S3 SDK-compatible storage support
- Centralized async/error handling

## Architecture

```text
DreamClick
|
|-- client/                  React + TypeScript + Vite application
|   |-- src/
|   |   |-- components/      Navbar, UI primitives, modals, cards, layouts
|   |   |-- context/         Cart/favourite global state
|   |   |-- hooks/           Auth, cart, favourites, device helpers
|   |   |-- pages/           Public, auth, marketplace, admin pages
|   |   |-- services/        API clients for auth, users, templates
|   |   |-- types/           Shared frontend TypeScript types
|   |   |-- scss/            Gallery and auth styling
|   |   `-- routes.tsx       App route map
|
|-- server/                  Express API
|   |-- config/              MongoDB, MinIO, S3 config
|   |-- controllers/         Auth, user, template request handlers
|   |-- middlewares/         Auth and upload middleware
|   |-- models/              User, template, category schemas
|   |-- routes/              API route definitions
|   |-- services/            Business logic
|   |-- utils/               AppError and async helpers
|   `-- index.js             Server entry point
|
`-- minio-server/            Local object-storage support files
```

## Main Routes

### Frontend

| Route | Purpose |
| --- | --- |
| `/` | Redirects to dashboard |
| `/dashboard` | Home page |
| `/explore` | Public image gallery |
| `/video-templates` | Template marketplace |
| `/cart` | Saved cart templates |
| `/favorites` | Saved favourite templates |
| `/about` | Project/about page |
| `/contact` | Contact page |
| `/login` | Login and signup |
| `/profile` | Protected profile page |
| `/settings` | Protected settings page |
| `/admin/*` | Admin dashboard and management screens |

### Backend

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/ping` | Health check |
| `POST` | `/auth/signup` | Create account |
| `POST` | `/auth/login` | Login with email/password |
| `POST` | `/auth/email-login` | Email quick login and guest cart/favourite merge |
| `GET` | `/auth/verify` | Verify JWT |
| `GET` | `/api/templates` | List templates |
| `GET` | `/api/templates?mine=true` | List current user's templates |
| `GET` | `/api/templates/:id` | Get one template |
| `POST` | `/api/templates` | Create template |
| `PATCH` | `/api/templates/:id` | Update template |
| `DELETE` | `/api/templates/:id` | Delete template |
| `POST` | `/api/templates/:id/purchase` | Purchase template |
| `POST` | `/api/users/cart` | Toggle template in cart |
| `POST` | `/api/users/favorites` | Toggle template in favourites |
| `GET` | `/api/users` | List users |
| `POST` | `/api/users` | Create user |
| `GET` | `/api/users/:id` | Get user by ID |
| `PATCH` | `/api/users/:id` | Update user |
| `DELETE` | `/api/users/:id` | Delete user |
| `POST` | `/upload` | Upload file to MinIO |
| `GET` | `/upload/files` | List uploaded files |
| `DELETE` | `/upload/files/:fileName` | Delete uploaded file |

## Getting Started

### Prerequisites

Install these before running the project:

- Node.js 20 or newer
- npm
- MongoDB database
- MinIO server, if you want local object storage

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/DreamClick.git
cd DreamClick
```

### 2. Install Dependencies

```bash
cd client
npm install

cd ../server
npm install
```

### 3. Configure Environment Variables

Create `client/.env`:

```env
VITE_BACKEND_URL=http://localhost:5000
VITE_DATE_FORMAT=dd/MM/yyyy
VITE_DATE_FORMAT_MONTH=dd-MMM-yy
```

Create `server/.env`:

```env
FRONTEND_URL=http://localhost:5173
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=replace_with_a_long_random_secret

MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_BUCKET=mybucket
MINIO_USE_SSL=false
MINIO_ACCESS_KEY=your_minio_access_key
MINIO_SECRET_KEY=your_minio_secret_key

MINIO_ROOT_USER=minioadmin
MINIO_ROOT_PASSWORD=minioadmin

AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=ap-south-1
AWS_BUCKET_NAME=your_bucket_name
```

Do not commit real credentials. Use placeholders in examples and keep production secrets in your hosting provider's secret manager.

### 4. Run the Backend

```bash
cd server
npm run dev
```

The API should be available at:

```text
http://localhost:5000
```

Check the health route:

```text
http://localhost:5000/ping
```

### 5. Run the Frontend

```bash
cd client
npm run dev
```

The app should be available at:

```text
http://localhost:5173
```

## Available Scripts

### Client

```bash
npm run dev       # Start Vite dev server
npm run build     # Type-check and build production bundle
npm run lint      # Run ESLint
npm run preview   # Preview production build locally
```

### Server

```bash
npm run dev       # Start Express with nodemon
npm start         # Start Express with Node
```

## Data Model Overview

### User

Users support multiple roles and marketplace behaviour:

- `end_user`
- `content_creator`
- `admin`

The schema also supports:

- JWT-authenticated accounts
- hashed passwords
- cart and favourites
- purchase history
- Razorpay-oriented payment fields
- billing address
- creator profile
- social links
- email notification preferences

### Template

Templates are the core marketplace item:

- name
- description
- preview video URL
- optional downloadable file URL
- price and old price
- thumbnail
- category
- tags
- uploader reference
- created/updated timestamps

## Design Notes

DreamClick leans into a clean creator-tool aesthetic:

- Dark/light theme support through CSS variables and `next-themes`.
- Tailwind utility styling with reusable Radix-based components.
- Motion used for subtle page transitions, hover states, cards, and admin interactions.
- WebGL Threads background on the home page for a polished first impression.
- Responsive layouts for mobile-first browsing and template discovery.
- Toast-based feedback for create, update, delete, login, and purchase actions.

## Storage

The backend includes MinIO integration for local object storage. Upload APIs can:

- upload a file into a bucket
- return a public-style URL
- list stored files
- delete files by name

The repository also contains AWS S3 SDK dependencies, so the storage layer can be moved toward S3-compatible production infrastructure.

## Authentication and State

Authentication is token-based:

- JWT is issued by the server.
- The client stores the token in local storage.
- Axios interceptors attach the token to API requests.
- Protected routes verify authentication before rendering.

Cart and favourite state is centralized in `CartFavContext`:

- Guests use `localStorage`.
- Authenticated users sync to MongoDB.
- Email login can merge guest cart/favourite state into the user account.

## Project Status

DreamClick is an active full-stack project with working marketplace, auth, admin, gallery, and upload foundations. Some areas are intentionally scaffolded for future production work, including full payment processing, richer order management, and expanded analytics.

Current next steps that would make the project even stronger:

- Add `.env.example` files and remove real secrets from committed `.env` files.
- Add automated tests for auth, templates, cart, and favourites.
- Complete real payment gateway integration.
- Add creator payout and order history flows.
- Harden admin-only API authorization for user-management routes.
- Add API documentation through Swagger or OpenAPI.
- Add CI checks for linting and builds.

## Security Notes

Before deploying or making the repository public:

- Rotate any credentials that have ever been committed.
- Replace development JWT secrets with strong production secrets.
- Restrict CORS to trusted production domains.
- Protect admin/user-management API routes with admin authorization.
- Avoid storing tokens in local storage for high-security deployments; consider httpOnly secure cookies.
- Configure MinIO/S3 bucket policies carefully.

## Why This Project Stands Out

DreamClick is more than a CRUD demo. It brings together a real marketplace shape, creator accounts, media previews, guest-to-user state migration, admin tooling, object storage, polished UI details, and a full-stack architecture that can grow into a serious creative commerce platform.

It is a strong foundation for a production-grade creator marketplace.
