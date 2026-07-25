# GLORY PAINTS MANAGEMENT SYSTEM — Architecture Blueprint

> **Version:** 1.0  
> **Status:** Pre-Development  
> **Last Updated:** July 2026

---

## TABLE OF CONTENTS

1. [System Overview](#1-system-overview)
2. [Folder Structure](#2-folder-structure)
3. [Database Schema Plan](#3-database-schema-plan)
4. [REST API Endpoint Plan](#4-rest-api-endpoint-plan)
5. [React Component Tree](#5-react-component-tree)
6. [Authentication Flow](#6-authentication-flow)
7. [Routing Structure](#7-routing-structure)
8. [Backend Architecture](#8-backend-architecture)
9. [Frontend Architecture](#9-frontend-architecture)
10. [Shared Components & Reusables](#10-shared-components--reusables)
11. [Error Handling & Loading Strategy](#11-error-handling--loading-strategy)
12. [Security Considerations](#12-security-considerations)
13. [Development Roadmap](#13-development-roadmap)
14. [Naming Conventions](#14-naming-conventions)
15. [Best Practices](#15-best-practices)
16. [Future Scalability](#16-future-scalability)
17. [Suggested Improvements](#17-suggested-improvements)

---

## 1. SYSTEM OVERVIEW

### What We're Building

A full-stack web application that digitizes the entire workshop management workflow of Glory Paints — replacing physical logbooks with a clean, modern, production-quality system.

### Core Modules

| # | Module | Access |
|---|--------|--------|
| 1 | Dashboard | Owner sees full analytics; Employee sees assigned jobs |
| 2 | Vehicle Registration | Both (Employee registers, Owner manages) |
| 3 | Repair Status Tracking | Both |
| 4 | Digital Job Card | Both |
| 5 | FC Certificate Management | Owner (full), Employee (view/upload) |
| 6 | Customer History | Owner (full), Employee (limited) |
| 7 | Invoice Generator | Owner only |
| 8 | ~~Vehicle Timeline~~ | **SKIPPED** |
| 9 | Inventory Management | Owner (full), Employee (view stock) |
| 10 | Employee Management | Owner only |

### User Roles

| Capability | Owner | Employee |
|-----------|:-----:|:--------:|
| View Dashboard | Yes | Yes (simplified) |
| Register Vehicles | Yes | Yes |
| Edit Vehicle Details | Yes | Limited |
| Delete Records | Yes | No |
| Update Repair Status | Yes | Yes |
| Upload Images | Yes | Yes |
| Manage Job Cards | Yes | Yes (own) |
| FC Certificate Management | Yes | View/Upload only |
| Customer History | Yes | View only |
| Generate Invoices | Yes | No |
| View Revenue / Reports | Yes | No |
| Inventory Management | Yes | View only |
| Employee Management | Yes | No |

### Vehicle Workflow (Strict Sequential)

```
Received → Inspection → Repair → Painting → Quality Check → FC Inspection → Ready For Delivery → Delivered
```

Status can only move **forward**, never backward. Each transition is logged with timestamp and employee ID.

---

## 2. FOLDER STRUCTURE

```
glory-paints-management-system/
│
├── client/                          # React Frontend
│   ├── public/
│   │   └── favicon.ico
│   │
│   ├── src/
│   │   ├── main.jsx                 # Entry point, renders App
│   │   ├── App.jsx                  # Router + Provider tree
│   │   ├── index.css                # Tailwind imports + global styles
│   │   │
│   │   ├── api/
│   │   │   ├── axiosInstance.js     # Axios instance with baseURL, interceptors
│   │   │   └── endpoints.js         # All API endpoint constants
│   │   │
│   │   ├── assets/
│   │   │   └── logo.svg
│   │   │
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   │   ├── Sidebar.jsx          # Main navigation sidebar
│   │   │   │   ├── Topbar.jsx           # Top bar with search, profile, notifications
│   │   │   │   ├── MainLayout.jsx       # Sidebar + Topbar + Outlet wrapper
│   │   │   │   └── AuthLayout.jsx       # Centered card layout for login/register
│   │   │   │
│   │   │   ├── ui/                      # Reusable pure UI primitives
│   │   │   │   ├── Button.jsx
│   │   │   │   ├── Input.jsx
│   │   │   │   ├── Select.jsx
│   │   │   │   ├── Textarea.jsx
│   │   │   │   ├── Badge.jsx
│   │   │   │   ├── Card.jsx
│   │   │   │   ├── Modal.jsx
│   │   │   │   ├── Table.jsx
│   │   │   │   ├── Pagination.jsx
│   │   │   │   ├── Spinner.jsx
│   │   │   │   ├── EmptyState.jsx
│   │   │   │   ├── ErrorState.jsx
│   │   │   │   ├── SearchInput.jsx
│   │   │   │   ├── StatusBadge.jsx
│   │   │   │   ├── ConfirmDialog.jsx
│   │   │   │   ├── FileUpload.jsx
│   │   │   │   └── DateInput.jsx
│   │   │   │
│   │   │   └── shared/                  # Domain-specific shared components
│   │   │       ├── VehicleStatusTimeline.jsx
│   │   │       ├── VehicleBasicInfo.jsx
│   │   │       ├── CustomerInfoCard.jsx
│   │   │       ├── JobCardPreview.jsx
│   │   │       ├── StatsCard.jsx
│   │   │       ├── RecentActivityItem.jsx
│   │   │       └── QuickActions.jsx
│   │   │
│   │   ├── context/
│   │   │   ├── AuthContext.jsx           # Auth state, login, logout, user info
│   │   │   └── AppContext.jsx            # Global UI state (sidebar, theme, toasts)
│   │   │
│   │   ├── hooks/
│   │   │   ├── useAuth.js               # Convenience hook for AuthContext
│   │   │   ├── useDebounce.js           # Debounce for search inputs
│   │   │   ├── usePagination.js         # Pagination state management
│   │   │   ├── useFetch.js              # Generic data fetching with loading/error
│   │   │   └── useConfirm.js            # Confirmation dialog hook
│   │   │
│   │   ├── pages/
│   │   │   ├── auth/
│   │   │   │   ├── LoginPage.jsx
│   │   │   │   └── ForgotPasswordPage.jsx
│   │   │   │
│   │   │   ├── dashboard/
│   │   │   │   └── DashboardPage.jsx
│   │   │   │
│   │   │   ├── vehicles/
│   │   │   │   ├── VehicleListPage.jsx
│   │   │   │   ├── VehicleRegisterPage.jsx
│   │   │   │   ├── VehicleDetailPage.jsx
│   │   │   │   └── VehicleEditPage.jsx
│   │   │   │
│   │   │   ├── jobs/
│   │   │   │   ├── JobCardListPage.jsx
│   │   │   │   └── JobCardDetailPage.jsx
│   │   │   │
│   │   │   ├── fc/
│   │   │   │   ├── FCListPage.jsx
│   │   │   │   └── FCDetailPage.jsx
│   │   │   │
│   │   │   ├── customers/
│   │   │   │   └── CustomerHistoryPage.jsx
│   │   │   │
│   │   │   ├── invoices/
│   │   │   │   ├── InvoiceListPage.jsx
│   │   │   │   ├── InvoiceCreatePage.jsx
│   │   │   │   └── InvoicePreviewPage.jsx
│   │   │   │
│   │   │   ├── inventory/
│   │   │   │   ├── InventoryListPage.jsx
│   │   │   │   └── InventoryFormPage.jsx
│   │   │   │
│   │   │   ├── employees/
│   │   │   │   ├── EmployeeListPage.jsx
│   │   │   │   └── EmployeeFormPage.jsx
│   │   │   │
│   │   │   └── NotFoundPage.jsx
│   │   │
│   │   ├── protected/
│   │   │   ├── OwnerRoute.jsx           # Owner-only route guard
│   │   │   └── AuthRoute.jsx            # Any authenticated user route guard
│   │   │
│   │   ├── utils/
│   │   │   ├── constants.js             # Status enums, role enums, colors
│   │   │   ├── formatters.js            # Date, currency, phone formatters
│   │   │   ├── validators.js            # Form validation helpers
│   │   │   ├── helpers.js               # Generic utility functions
│   │   │   └── jobCardGenerator.js      # Job ID generation logic
│   │   │
│   │   └── static/
│   │       ├── sidebarLinks.js          # Navigation link definitions
│   │       └── vehicleStages.js         # Vehicle workflow stage definitions
│   │
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── vite.config.js
│   └── .env
│
├── server/                            # Express Backend
│   ├── src/
│   │   ├── index.js                   # Entry point: DB connect + start server
│   │   ├── app.js                     # Express app setup (cors, json, routes)
│   │   │
│   │   ├── config/
│   │   │   ├── db.js                   # Mongoose connection
│   │   │   ├── env.js                  # Environment variable loader & validation
│   │   │   └── cloudinary.js           # Cloudinary config (future-ready)
│   │   │
│   │   ├── models/
│   │   │   ├── User.js
│   │   │   ├── Vehicle.js
│   │   │   ├── JobCard.js
│   │   │   ├── Invoice.js
│   │   │   ├── Inventory.js
│   │   │   ├── FCCertificate.js
│   │   │   └── StatusLog.js
│   │   │
│   │   ├── routes/
│   │   │   ├── index.js                # Route aggregator
│   │   │   ├── auth.routes.js
│   │   │   ├── vehicle.routes.js
│   │   │   ├── jobCard.routes.js
│   │   │   ├── invoice.routes.js
│   │   │   ├── inventory.routes.js
│   │   │   ├── fc.routes.js
│   │   │   ├── employee.routes.js
│   │   │   ├── customer.routes.js
│   │   │   └── dashboard.routes.js
│   │   │
│   │   ├── controllers/
│   │   │   ├── auth.controller.js
│   │   │   ├── vehicle.controller.js
│   │   │   ├── jobCard.controller.js
│   │   │   ├── invoice.controller.js
│   │   │   ├── inventory.controller.js
│   │   │   ├── fc.controller.js
│   │   │   ├── employee.controller.js
│   │   │   ├── customer.controller.js
│   │   │   └── dashboard.controller.js
│   │   │
│   │   ├── middlewares/
│   │   │   ├── auth.js                 # JWT verification
│   │   │   ├── role.js                 # Role-based access control
│   │   │   ├── errorHandler.js         # Global error handler
│   │   │   ├── validate.js             # Request validation (express-validator)
│   │   │   └── upload.js               # Multer file upload config
│   │   │
│   │   ├── services/
│   │   │   ├── jobCard.service.js      # Job ID generation, status transitions
│   │   │   ├── invoice.service.js      # Invoice calculations, PDF generation
│   │   │   └── dashboard.service.js    # Aggregation queries for dashboard
│   │   │
│   │   ├── utils/
│   │   │   ├── ApiError.js             # Custom error class with status codes
│   │   │   ├── ApiResponse.js          # Standardized API response format
│   │   │   ├── asyncHandler.js         # Async wrapper to catch errors
│   │   │   ├── jobNumberGenerator.js   # GP-YYYY-XXXXXX generator
│   │   │   └── validators.js           # Shared validation rules
│   │   │
│   │   └── uploads/                    # Local file storage (dev only)
│   │       └── vehicles/
│   │
│   ├── package.json
│   ├── .env
│   └── .env.example
│
├── .gitignore
├── package.json                        # Root package (scripts to run both)
└── README.md
```

---

## 3. DATABASE SCHEMA PLAN

### 3.1 Users Collection

```js
{
  _id: ObjectId,
  
  // Authentication
  name: String,              // "Karan Manager"
  email: String,             // unique, lowercase
  password: String,          // bcrypt hashed
  phone: String,             // optional
  
  // Role
  role: Enum["owner", "employee"],
  
  // Profile
  avatar: String,            // URL (Cloudinary or local)
  isActive: Boolean,         // soft delete / disable
  
  // Timestamps
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:** `email` (unique), `role`

---

### 3.2 Vehicles Collection (Core Entity)

```js
{
  _id: ObjectId,
  
  // Job Identity
  jobId: String,             // "GP-2026-000001" — unique, indexed
  
  // Vehicle Info
  vehicleType: Enum["car", "truck", "bus", "two-wheeler", "commercial", "other"],
  make: String,              // "Maruti Suzuki"
  model: String,             // "Swift Dzire"
  year: Number,              // 2020
  color: String,             // "White"
  licensePlate: String,      // "MH-12-AB-1234" — unique per active job
  engineNumber: String,      // optional
  chassisNumber: String,     // optional
  
  // Customer Info (embedded for simplicity)
  customer: {
    name: String,
    phone: String,
    email: String,           // optional
    address: String,         // optional
  },
  
  // Status
  currentStatus: Enum[
    "received",
    "inspection",
    "repair",
    "painting",
    "quality_check",
    "fc_inspection",
    "ready_for_delivery",
    "delivered"
  ],
  
  // Assignment
  assignedEmployee: ObjectId, // ref → Users
  createdBy: ObjectId,        // ref → Users
  
  // Work Details
  serviceType: Enum["painting", "repair", "fc_inspection", "full_service", "other"],
  estimatedCost: Number,
  actualCost: Number,          // set on completion
  estimatedDeliveryDate: Date,
  actualDeliveryDate: Date,
  
  // Images
  images: [{
    url: String,
    caption: String,
    uploadedAt: Date,
    uploadedBy: ObjectId      // ref → Users
  }],
  
  // Notes
  inspectionNotes: String,
  repairNotes: String,
  
  // Status History (embedded array for quick access)
  statusHistory: [{
    status: String,
    changedAt: Date,
    changedBy: ObjectId,      // ref → Users
    notes: String
  }],
  
  // Soft delete
  isDeleted: Boolean,
  
  // Timestamps
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:** `jobId` (unique), `currentStatus`, `customer.phone`, `assignedEmployee`, `createdAt`

---

### 3.3 JobCards Collection

```js
{
  _id: ObjectId,
  
  // Reference
  vehicle: ObjectId,          // ref → Vehicles (one-to-one, same as jobId basically)
  jobId: String,              // denormalized for quick queries
  
  // Job Details
  jobType: Enum["painting", "repair", "fc_inspection", "denting", "touchup", "full_service", "other"],
  description: String,
  priority: Enum["low", "medium", "high", "urgent"],
  
  // Materials Used
  materialsUsed: [{
    inventoryItem: ObjectId,  // ref → Inventory
    quantity: Number,
    unitCost: Number
  }],
  
  // Labor
  laborHours: Number,
  assignedTechnician: ObjectId, // ref → Users
  
  // Cost Breakdown
  materialCost: Number,
  laborCost: Number,
  otherCost: Number,
  totalCost: Number,
  
  // Status
  status: Enum["pending", "in_progress", "completed", "on_hold"],
  
  // Completion
  completedAt: Date,
  completedBy: ObjectId,
  
  // Timestamps
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:** `jobId`, `vehicle`, `status`, `assignedTechnician`

---

### 3.4 Invoices Collection

```js
{
  _id: ObjectId,
  
  // Invoice Identity
  invoiceNumber: String,      // "INV-2026-000001" — unique
  
  // References
  vehicle: ObjectId,          // ref → Vehicles
  jobId: String,              // denormalized
  customer: {
    name: String,
    phone: String,
    email: String,
    address: String,
  },
  
  // Line Items
  items: [{
    description: String,
    quantity: Number,
    unitPrice: Number,
    total: Number
  }],
  
  // Totals
  subtotal: Number,
  discount: Number,
  taxRate: Number,            // percentage
  taxAmount: Number,
  grandTotal: Number,
  
  // Payment
  paymentStatus: Enum["unpaid", "partial", "paid"],
  paymentMethod: Enum["cash", "upi", "card", "bank_transfer", "other"],
  amountPaid: Number,
  paymentDate: Date,
  
  // Notes
  notes: String,
  
  // Generated by
  createdBy: ObjectId,        // ref → Users
  
  // Timestamps
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:** `invoiceNumber` (unique), `jobId`, `paymentStatus`, `createdAt`

---

### 3.5 Inventory Collection

```js
{
  _id: ObjectId,
  
  // Item Info
  name: String,               // "Asian Paints Apex"
  category: Enum["paint", "primer", "thinner", "sandpaper", "tool", "spare_part", "consumable", "other"],
  sku: String,                // auto-generated, unique
  
  // Stock
  quantity: Number,
  unit: Enum["liters", "kg", "pieces", "rolls", "boxes", "other"],
  minStockLevel: Number,      // reorder threshold
  
  // Pricing
  purchasePrice: Number,
  sellingPrice: Number,       // for billing materials to customers
  
  // Supplier
  supplier: {
    name: String,
    phone: String,
  },
  
  // Tracking
  lastRestockedAt: Date,
  
  // Timestamps
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:** `name`, `category`, `sku` (unique)

---

### 3.6 FCCertificates Collection

```js
{
  _id: ObjectId,
  
  // References
  vehicle: ObjectId,          // ref → Vehicles
  jobId: String,
  
  // FC Details
  fcNumber: String,           // official FC certificate number
  issueDate: Date,
  expiryDate: Date,
  
  // Result
  result: Enum["passed", "failed", "pending"],
  
  // Inspection Details
  inspectedBy: String,        // external FC inspector name
  inspectionCenter: String,
  remarks: String,
  
  // Documents
  documentUrl: String,        // scanned copy — Cloudinary/local
  documentPublicId: String,   // Cloudinary public ID
  
  // Status
  status: Enum["scheduled", "in_progress", "completed"],
  
  // Timestamps
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:** `vehicle`, `jobId`, `expiryDate`, `result`

---

### 3.7 StatusLogs Collection (Audit Trail)

```js
{
  _id: ObjectId,
  
  vehicle: ObjectId,          // ref → Vehicles
  jobId: String,
  
  fromStatus: String,         // previous status
  toStatus: String,           // new status
  changedBy: ObjectId,        // ref → Users
  notes: String,
  
  createdAt: Date
}
```

**Indexes:** `vehicle`, `jobId`, `createdAt`

> **Design Note:** While `statusHistory` is embedded in Vehicle for fast reads, StatusLogs provides a separate audit trail for reporting and analytics.

---

### Schema Relationships Summary

```
User (1) ──→ (N) Vehicle        [createdBy, assignedEmployee]
User (1) ──→ (N) JobCard        [assignedTechnician]
Vehicle (1) ──→ (1) JobCard     [1:1 relationship via jobId]
Vehicle (1) ──→ (N) Invoice     [one vehicle can have multiple invoices]
Vehicle (1) ──→ (N) FCCertificate
Vehicle (1) ──→ (N) StatusLog
Inventory (1) ──→ (N) JobCard   [via materialsUsed]
```

---

## 4. REST API ENDPOINT PLAN

### Base URL: `/api/v1`

---

### 4.1 Authentication

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/auth/register` | Register first owner / seed | Public (disabled after first owner) |
| POST | `/auth/login` | Login, returns JWT | Public |
| GET | `/auth/me` | Get current user profile | Auth |
| PUT | `/auth/profile` | Update own profile | Auth |
| PUT | `/auth/password` | Change password | Auth |

---

### 4.2 Vehicles

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/vehicles` | List all vehicles (search, filter, paginate) | Auth |
| GET | `/vehicles/:id` | Get vehicle detail + status history | Auth |
| POST | `/vehicles` | Register new vehicle (auto-generates jobId) | Auth |
| PUT | `/vehicles/:id` | Update vehicle details | Owner |
| DELETE | `/vehicles/:id` | Soft delete vehicle | Owner |
| PUT | `/vehicles/:id/status` | Advance vehicle to next status | Auth |
| POST | `/vehicles/:id/images` | Upload vehicle images | Auth |
| DELETE | `/vehicles/:id/images/:imageId` | Remove a vehicle image | Owner |
| GET | `/vehicles/stats` | Vehicle counts by status | Auth |

**Query Parameters for GET /vehicles:**
- `search` — search by jobId, licensePlate, customer name, phone
- `status` — filter by currentStatus
- `assignedTo` — filter by assigned employee
- `vehicleType` — filter by type
- `dateFrom` / `dateTo` — filter by registration date range
- `page`, `limit` — pagination (default: page=1, limit=20)
- `sort` — sort field (default: `-createdAt`)

---

### 4.3 Job Cards

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/jobs` | List all job cards | Auth |
| GET | `/jobs/:id` | Get job card detail | Auth |
| POST | `/jobs` | Create job card for a vehicle | Auth |
| PUT | `/jobs/:id` | Update job card | Auth |
| PUT | `/jobs/:id/status` | Update job card status | Auth |
| PUT | `/jobs/:id/materials` | Add/update materials used | Auth |
| GET | `/jobs/assigned` | Get jobs assigned to current employee | Employee |

---

### 4.4 FC Certificates

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/fc` | List all FC records | Auth |
| GET | `/fc/:id` | Get FC detail | Auth |
| POST | `/fc` | Create FC record for a vehicle | Owner |
| PUT | `/fc/:id` | Update FC details | Owner |
| PUT | `/fc/:id/result` | Update FC result (pass/fail) | Owner |
| GET | `/fc/expiring` | Get FCs expiring within 30 days | Owner |

---

### 4.5 Invoices

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/invoices` | List all invoices | Owner |
| GET | `/invoices/:id` | Get invoice detail | Owner |
| POST | `/invoices` | Create invoice | Owner |
| PUT | `/invoices/:id` | Update invoice | Owner |
| PUT | `/invoices/:id/payment` | Record payment | Owner |
| GET | `/invoices/:id/print` | Generate printable invoice | Owner |
| GET | `/invoices/stats` | Revenue summary (daily/weekly/monthly) | Owner |

---

### 4.6 Inventory

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/inventory` | List all inventory items | Auth |
| GET | `/inventory/:id` | Get inventory item detail | Auth |
| POST | `/inventory` | Add new inventory item | Owner |
| PUT | `/inventory/:id` | Update inventory item | Owner |
| PUT | `/inventory/:id/restock` | Restock item quantity | Owner |
| DELETE | `/inventory/:id` | Remove inventory item | Owner |
| GET | `/inventory/low-stock` | Items below minimum stock level | Owner |

---

### 4.7 Employees

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/employees` | List all employees | Owner |
| GET | `/employees/:id` | Get employee detail | Owner |
| POST | `/employees` | Create new employee | Owner |
| PUT | `/employees/:id` | Update employee | Owner |
| PUT | `/employees/:id/status` | Activate/Deactivate employee | Owner |
| GET | `/employees/:id/stats` | Employee performance stats | Owner |

---

### 4.8 Customers

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/customers` | Search customers by name/phone | Auth |
| GET | `/customers/:phone` | Get customer history (all vehicles, invoices) | Auth |
| GET | `/customers/:phone/vehicles` | All vehicles for a customer | Auth |

---

### 4.9 Dashboard

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/dashboard/summary` | Total vehicles, active, delivered, revenue | Owner |
| GET | `/dashboard/activity` | Recent activity feed | Auth |
| GET | `/dashboard/status-distribution` | Vehicle count by status | Owner |
| GET | `/dashboard/monthly-revenue` | Monthly revenue for charts | Owner |
| GET | `/dashboard/my-jobs` | Employee's assigned jobs summary | Employee |

---

## 5. REACT COMPONENT TREE

```
<App>
├── <AuthProvider>
│   └── <AppProvider>
│       └── <BrowserRouter>
│           └── <Routes>
│
│               ├── Public Routes (AuthLayout)
│               │   ├── /login        → <LoginPage>
│               │   └── /forgot       → <ForgotPasswordPage>
│               │
│               ├── Protected Routes (MainLayout)
│               │   │
│               │   ├── ALL ROLES
│               │   │   ├── /dashboard           → <DashboardPage>
│               │   │   ├── /vehicles            → <VehicleListPage>
│               │   │   ├── /vehicles/new        → <VehicleRegisterPage>
│               │   │   ├── /vehicles/:id        → <VehicleDetailPage>
│               │   │   ├── /vehicles/:id/edit   → <VehicleEditPage>
│               │   │   ├── /jobs                → <JobCardListPage>
│               │   │   ├── /jobs/:id            → <JobCardDetailPage>
│               │   │   └── /customers           → <CustomerHistoryPage>
│               │   │
│               │   ├── OWNER ONLY
│               │   │   ├── /fc                  → <FCListPage>
│               │   │   ├── /fc/:id              → <FCDetailPage>
│               │   │   ├── /invoices            → <InvoiceListPage>
│               │   │   ├── /invoices/new        → <InvoiceCreatePage>
│               │   │   ├── /invoices/:id        → <InvoicePreviewPage>
│               │   │   ├── /inventory           → <InventoryListPage>
│               │   │   ├── /inventory/new       → <InventoryFormPage>
│               │   │   ├── /inventory/:id/edit  → <InventoryFormPage>
│               │   │   ├── /employees           → <EmployeeListPage>
│               │   │   ├── /employees/new       → <EmployeeFormPage>
│               │   │   └── /employees/:id/edit  → <EmployeeFormPage>
│               │   │
│               │   └── *                       → <NotFoundPage>
```

### MainLayout Internal Structure

```
<MainLayout>
├── <Sidebar>
│   ├── Logo + Brand
│   ├── NavLinks (filtered by role)
│   │   ├── Dashboard
│   │   ├── Vehicles
│   │   ├── Job Cards
│   │   ├── FC Certificates       [Owner]
│   │   ├── Customers
│   │   ├── Invoices              [Owner]
│   │   ├── Inventory             [Owner]
│   │   └── Employees             [Owner]
│   └── Collapse Toggle
│
├── <Topbar>
│   ├── Mobile Menu Toggle
│   ├── Page Title / Breadcrumb
│   ├── Global Search
│   └── User Menu (avatar, name, dropdown)
│
├── <main>
│   └── <Outlet />                ← React Router renders current page
│
└── <Toast />                     ← Global toast notifications
```

---

## 6. AUTHENTICATION FLOW

### Login Flow

```
1. User enters email + password on LoginPage
2. Frontend sends POST /api/v1/auth/login
3. Backend validates credentials against bcrypt hash
4. Backend generates JWT with { id, role, name }
5. Backend returns { token, user: { id, name, email, role } }
6. Frontend stores token in localStorage
7. Frontend stores user in AuthContext state
8. Axios interceptor attaches Authorization: Bearer <token> to all requests
9. User is redirected to /dashboard
```

### Route Protection Flow

```
App loads
  → AuthContext checks localStorage for token
  → If token exists, calls GET /api/v1/auth/me to validate
  → If valid: user state populated, app renders
  → If invalid: token cleared, user redirected to /login

Protected Route renders
  → Checks if user is authenticated
  → If not → redirect to /login
  → If yes but wrong role (e.g., employee accessing /employees)
  → → redirect to /dashboard with toast error
```

### JWT Payload

```js
{
  id: ObjectId,
  role: "owner" | "employee",
  iat: <issued_at>,
  exp: <expires_in_7_days>
}
```

### Token Refresh Strategy
- **Initial approach:** 7-day expiry, re-login required after
- **Future enhancement:** Implement refresh token rotation

---

## 7. ROUTING STRUCTURE

### Frontend Routes

| Path | Component | Access | Layout |
|------|-----------|--------|--------|
| `/login` | LoginPage | Public | AuthLayout |
| `/forgot-password` | ForgotPasswordPage | Public | AuthLayout |
| `/dashboard` | DashboardPage | All Auth | MainLayout |
| `/vehicles` | VehicleListPage | All Auth | MainLayout |
| `/vehicles/new` | VehicleRegisterPage | All Auth | MainLayout |
| `/vehicles/:id` | VehicleDetailPage | All Auth | MainLayout |
| `/vehicles/:id/edit` | VehicleEditPage | Owner | MainLayout |
| `/jobs` | JobCardListPage | All Auth | MainLayout |
| `/jobs/:id` | JobCardDetailPage | All Auth | MainLayout |
| `/fc` | FCListPage | Owner | MainLayout |
| `/fc/:id` | FCDetailPage | Owner | MainLayout |
| `/customers` | CustomerHistoryPage | All Auth | MainLayout |
| `/customers/:phone` | CustomerHistoryPage | All Auth | MainLayout |
| `/invoices` | InvoiceListPage | Owner | MainLayout |
| `/invoices/new` | InvoiceCreatePage | Owner | MainLayout |
| `/invoices/:id` | InvoicePreviewPage | Owner | MainLayout |
| `/inventory` | InventoryListPage | Owner | MainLayout |
| `/inventory/new` | InventoryFormPage | Owner | MainLayout |
| `/inventory/:id/edit` | InventoryFormPage | Owner | MainLayout |
| `/employees` | EmployeeListPage | Owner | MainLayout |
| `/employees/new` | EmployeeFormPage | Owner | MainLayout |
| `/employees/:id/edit` | EmployeeFormPage | Owner | MainLayout |
| `*` | NotFoundPage | Public | AuthLayout |

---

## 8. BACKEND ARCHITECTURE

### Request Lifecycle

```
Client Request
    ↓
Express App
    ↓
CORS Middleware
    ↓
Body Parser (express.json)
    ↓
Route Handler
    ↓
Auth Middleware (JWT verify)      ← if protected route
    ↓
Role Middleware (role check)     ← if owner-only route
    ↓
Validation Middleware            ← if request body validation needed
    ↓
Controller Function
    ↓
Service Layer (business logic)
    ↓
Mongoose Model (DB operation)
    ↓
ApiResponse.send(res)
    ↓
Client Response
```

### Middleware Stack

| Middleware | Purpose |
|-----------|---------|
| `cors` | Allow frontend origin |
| `express.json` | Parse JSON bodies |
| `auth` | Verify JWT, attach `req.user` |
| `role("owner")` | Check `req.user.role` |
| `validate` | Validate request body/params/query |
| `upload` | Multer config for file uploads |
| `errorHandler` | Catch all errors, format response |

### Error Handling

```js
// Custom ApiError class
class ApiError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
  }
}

// All controllers wrapped in asyncHandler
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Global error handler middleware
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || "Internal Server Error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack })
  });
});
```

### Standard API Response Format

```js
// Success
{
  "success": true,
  "message": "Vehicle registered successfully",
  "data": { ... }
}

// Success with pagination
{
  "success": true,
  "data": {
    "items": [...],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 150,
      "pages": 8
    }
  }
}

// Error
{
  "success": false,
  "message": "Vehicle not found"
}
```

---

## 9. FRONTEND ARCHITECTURE

### Context Providers

**AuthContext** — Manages:
- `user` object (id, name, email, role)
- `token` string
- `isAuthenticated` boolean
- `isOwner` boolean (derived)
- `login(email, password)` function
- `logout()` function
- `updateProfile(data)` function

**AppContext** — Manages:
- `sidebarOpen` boolean (for mobile)
- `toggleSidebar()` function
- `showToast(message, type)` function

### Custom Hooks

| Hook | Purpose |
|------|---------|
| `useAuth()` | Convenience wrapper for AuthContext |
| `useFetch(url, options)` | Data fetching with loading, error, refetch |
| `usePagination(defaultLimit)` | Page state, next/prev, total pages |
| `useDebounce(value, delay)` | Debounced search input |
| `useConfirm()` | Show confirmation dialog before destructive actions |

### Axios Instance Configuration

```js
// api/axiosInstance.js
const axiosInstance = axios.create({
  baseURL: "/api/v1",
  headers: { "Content-Type": "application/json" }
});

// Request interceptor — attach token
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Response interceptor — handle 401
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);
```

---

## 10. SHARED COMPONENTS & REUSABLES

### UI Primitives (Pure, Stateless)

| Component | Props | Purpose |
|-----------|-------|---------|
| `Button` | `variant, size, loading, disabled, icon, children` | Consistent buttons |
| `Input` | `label, error, icon, ...rest` | Form inputs with labels & validation |
| `Select` | `label, options, error, ...rest` | Dropdowns |
| `Textarea` | `label, error, rows, ...rest` | Multi-line inputs |
| `Badge` | `variant, children` | Status badges (colors per status) |
| `Card` | `title, children, actions` | Content containers |
| `Modal` | `isOpen, onClose, title, children` | Dialog overlays |
| `Table` | `columns, data, onRowClick` | Data tables |
| `Pagination` | `page, totalPages, onPageChange` | Page controls |
| `Spinner` | `size` | Loading indicator |
| `EmptyState` | `icon, title, description, action` | No-data states |
| `ErrorState` | `message, onRetry` | Error states |
| `SearchInput` | `value, onChange, placeholder` | Debounced search |
| `StatusBadge` | `status` | Vehicle status with color coding |
| `ConfirmDialog` | `isOpen, onConfirm, onCancel, title, message` | Delete confirmations |
| `FileUpload` | `accept, onUpload, multiple` | Image upload with preview |
| `DateInput` | `label, value, onChange` | Date picker |

### Status Color Mapping

| Status | Color |
|--------|-------|
| `received` | Blue |
| `inspection` | Yellow |
| `repair` | Orange |
| `painting` | Purple |
| `quality_check` | Cyan |
| `fc_inspection` | Teal |
| `ready_for_delivery` | Green |
| `delivered` | Gray |

---

## 11. ERROR HANDLING & LOADING STRATEGY

### Loading States

| Scenario | UI |
|----------|-----|
| Page initial load | Full-page `<Spinner />` centered |
| Data fetching in list | Skeleton rows or `<Spinner />` above table |
| Form submission | Button shows `<Spinner />` + disabled state |
| Image upload | Progress bar or percentage |
| Status transition | Optimistic UI with rollback on error |

### Empty States

| Scenario | UI |
|----------|-----|
| No vehicles registered | Illustration + "Register your first vehicle" CTA |
| No search results | "No vehicles match your search" |
| No job cards | "No job cards yet" |
| No invoices | "No invoices generated" |
| No inventory items | "Your inventory is empty. Add items to get started." |

### Error States

| Scenario | UI |
|----------|-----|
| API network error | "Unable to connect. Check your internet." + Retry |
| 404 | "Resource not found" + Go Back button |
| 403 | "You don't have permission" + redirect |
| 500 | "Something went wrong" + Retry |
| Form validation | Inline field errors below inputs |
| Duplicate entry | Toast error with specific message |

### Toast Notification System

- **Success:** Green, auto-dismiss 3 seconds
- **Error:** Red, auto-dismiss 5 seconds
- **Warning:** Yellow, auto-dismiss 4 seconds
- **Info:** Blue, auto-dismiss 3 seconds
- Position: Top-right corner, stackable (max 3 visible)

---

## 12. SECURITY CONSIDERATIONS

### Backend

| Area | Implementation |
|------|----------------|
| Password Hashing | bcrypt with salt rounds = 12 |
| JWT | HMAC SHA256, 7-day expiry |
| Input Validation | express-validator on all mutation endpoints |
| SQL/NoSQL Injection | Mongoose parameterized queries |
| Rate Limiting | express-rate-limit on auth routes (5 attempts / 15 min) |
| CORS | Whitelist only frontend origin |
| File Upload | Validate MIME type, max size 5MB, limit to images |
| Helmet | Security headers via helmet middleware |
| Environment | Never commit .env files, use .env.example |
| Soft Delete | Never hard-delete records, use isDeleted flag |
| Role Check | Middleware on every sensitive endpoint |

### Frontend

| Area | Implementation |
|------|----------------|
| Token Storage | localStorage (consider httpOnly cookie for production) |
| XSS Prevention | React auto-escapes; avoid dangerouslySetInnerHTML |
| Route Protection | AuthRoute + OwnerRoute wrapper components |
| Input Sanitization | Trim & validate client-side before sending |
| Sensitive Data | Never store passwords or tokens in state beyond localStorage |

---

## 13. DEVELOPMENT ROADMAP

### Phase 1 — Foundation (Days 1-3)

- [ ] Initialize project structure (monorepo with client/ and server/)
- [ ] Set up Express server with basic middleware
- [ ] Connect MongoDB with Mongoose
- [ ] Set up React with Vite + Tailwind
- [ ] Configure Axios instance
- [ ] Build authentication system (User model, login, JWT)
- [ ] Create AuthContext + route protection
- [ ] Build Layout components (Sidebar, Topbar, MainLayout)
- [ ] Build UI primitives (Button, Input, Card, Modal, Table)

### Phase 2 — Core Vehicle Module (Days 4-6)

- [ ] Vehicle model + API endpoints
- [ ] Vehicle registration form
- [ ] Vehicle list page with search/filter/pagination
- [ ] Vehicle detail page with status timeline
- [ ] Status advancement system
- [ ] Job ID auto-generation (GP-YYYY-XXXXXX)
- [ ] StatusLogs audit trail

### Phase 3 — Job Cards & FC (Days 7-9)

- [ ] JobCard model + API endpoints
- [ ] Job card creation & management
- [ ] Material linking from inventory
- [ ] FC Certificate model + API endpoints
- [ ] FC management pages
- [ ] FC expiry alerts

### Phase 4 — Business Operations (Days 10-12)

- [ ] Invoice model + API endpoints
- [ ] Invoice creation form with line items
- [ ] Invoice preview/print page
- [ ] Payment tracking
- [ ] Inventory model + API endpoints
- [ ] Inventory CRUD with low-stock alerts

### Phase 5 — People & Dashboard (Days 13-15)

- [ ] Employee management (Owner only)
- [ ] Employee role-based access
- [ ] Dashboard analytics widgets
- [ ] Revenue charts (Recharts)
- [ ] Activity feed
- [ ] Customer history page

### Phase 6 — Polish & Deploy (Days 16-18)

- [ ] Image upload (local storage, Cloudinary-ready)
- [ ] Error handling refinement
- [ ] Loading state polish
- [ ] Responsive testing (mobile/tablet/desktop)
- [ ] Seed script for demo data
- [ ] Production build optimization
- [ ] Deployment configuration

---

## 14. NAMING CONVENTIONS

### General

- **Files:** PascalCase for components (`VehicleListPage.jsx`), camelCase for utilities (`formatters.js`)
- **Folders:** camelCase (`controllers/`, `utils/`) or lowercase (`components/`)
- **CSS Classes:** Tailwind utility classes (no custom CSS files)

### Code

| Element | Convention | Example |
|---------|-----------|---------|
| React Components | PascalCase | `VehicleListPage` |
| Custom Hooks | camelCase, `use` prefix | `useAuth`, `useFetch` |
| Variables | camelCase | `currentStatus`, `jobId` |
| Functions | camelCase | `getStatusColor`, `formatCurrency` |
| Constants | UPPER_SNAKE_CASE | `API_BASE_URL`, `VEHICLE_STATUSES` |
| Mongoose Models | PascalCase, singular | `Vehicle`, `JobCard` |
| API Endpoints | kebab-case | `/api/v1/fc-certificates` (but we use camelCase for simplicity) |
| MongoDB fields | camelCase | `currentStatus`, `jobId` |
| Component Props | camelCase | `vehicleData`, `onSubmit` |

---

## 15. BEST PRACTICES

### Code Organization
1. **One component per file** — never nest components in the same file
2. **Separate concerns** — pages handle layout, hooks handle logic, utils handle pure functions
3. **Colocate related code** — a feature's components, hooks, and utils should be nearby
4. **Keep components small** — if a component exceeds 150 lines, split it

### State Management
1. **Local state first** — use useState for component-specific state
2. **Context for global auth/UI** — don't over-use context for everything
3. **Server state** — fetch data in useEffect or custom hooks, don't cache excessively
4. **Lift state up** — when siblings need shared data, lift to parent

### API Design
1. **Consistent response format** — always `{ success, message, data }`
2. **Pagination on all list endpoints** — never return unbounded results
3. **Soft delete everywhere** — maintain data integrity
4. **Validate before write** — both client-side and server-side

### React Patterns
1. **Prop destructuring** in function parameters
2. **Early returns** for loading/error/empty states
3. **Keys from IDs**, never array index
4. **Memoize expensive computations** with useMemo
5. **Debounce search inputs** — minimum 300ms delay

### Git Workflow
1. **Feature branches** from main
2. **Conventional commits**: `feat:`, `fix:`, `refactor:`, `style:`, `chore:`
3. **No commits to main without review** (even for solo dev — maintain discipline)

---

## 16. FUTURE SCALABILITY

### Short-Term Enhancements

| Feature | Description |
|---------|-------------|
| Email/SMS Notifications | Notify customers when vehicle is ready |
| PDF Invoice Generation | Server-side PDF with Puppeteer or PDFKit |
| Barcode/QR on Job Cards | Scan to pull up vehicle details |
| Dark Mode | Tailwind dark: classes, Context toggle |
| Multi-language | Hindi/Marathi support for local staff |

### Medium-Term

| Feature | Description |
|---------|-------------|
| Role-Based Permissions | Granular permission system beyond owner/employee |
| Photo Gallery | Before/after vehicle photos with comparison |
| WhatsApp Integration | Send invoice/status updates via WhatsApp API |
| Audit Logs | Full audit trail for compliance |
| Backup System | Automated MongoDB backups |

### Long-Term

| Feature | Description |
|---------|-------------|
| Multi-Branch | Support multiple workshop locations |
| Mobile App | React Native companion app |
| Customer Portal | Customers track their vehicle status |
| Accounting Integration | Tally/Zoho Books sync |
| AI Predictions | Estimate repair time based on historical data |

---

## 17. SUGGESTED IMPROVEMENTS

1. **Add a Vehicle Search Bar in Sidebar** — Quick access to find any vehicle by jobId or plate number without navigating to the list page.

2. **Dashboard Quick Actions** — Floating "+" button with quick actions: Register Vehicle, Create Invoice, Add Inventory Item.

3. **Vehicle Status Notifications** — When a vehicle advances status, auto-log it and optionally notify relevant parties.

4. **Print-Optimized Stylesheets** — Invoice and Job Card pages should have print-specific CSS for clean paper output.

5. **Offline-First Consideration** — Workshop internet may be unreliable. Consider adding service workers and IndexedDB for offline vehicle registration (sync when online).

6. **Keyboard Shortcuts** — Power users can navigate faster with keyboard shortcuts (e.g., Ctrl+K for search, Ctrl+N for new vehicle).

7. **Batch Operations** — Allow selecting multiple vehicles and performing bulk status updates.

8. **Vehicle Photo Comparison** — Side-by-side before/after photos for quality check documentation.

9. **Revenue Forecasting** — Use historical data to predict monthly revenue trends.

10. **Customer Communication Log** — Track every phone call/email with a customer, linked to their vehicle.

---

> **This blueprint is the single source of truth for the Glory Paints Management System. All development should follow this architecture. Any deviation should be documented and justified.**
