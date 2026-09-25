# Product Admin Dashboard

A comprehensive, responsive admin dashboard for managing products, built with Next.js (App Router), React, Tailwind CSS, and Axios. Powered by the [DummyJSON API](https://dummyjson.com).

## 🚀 Setup & Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/ShikharNegi0515/Product-Admin-Dashboard.git
   cd "Product Admin Dashboard"
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Run the development server:**
   ```bash
   npm run dev
   ```

4. **Login Credentials:**
   Open `http://localhost:3000` and use the following dummy credentials:
   - **Username:** `emilys`
   - **Password:** `emilyspass`

---

## ✅ Completed Features

- **Authentication:** Fully functional login page (`POST /auth/login`) with client-side validation, error handling, and a global `AuthContext` to protect routes.
- **Responsive Layout:** A clean, professional UI that renders a Data Table on desktop and a Grid of Cards on mobile devices.
- **Advanced Pagination:** Custom pagination logic using `skip` and `limit`, featuring page size options (10, 20, 50), page numbers, and "Showing X-Y of Z" tracking.
- **Search & Debounce:** Search products via `/products/search?q=`. It waits 500ms after typing stops before calling the API, and immediately resets to Page 1.
- **Sorting & Filtering:** Sort by Price, Rating, or Title, and filter by Category.
- **Product Details:** A dedicated page at `/products/[id]` with a full image gallery, description, price, stock indicator, and customer reviews grid. Invalid or deleted product IDs show a "Not Found" state with both a **Retry** button (re-fetches without navigating away) and a **Go Back** button. Requests are aborted via `AbortController` on unmount to prevent stale updates.
- **CRUD Operations:** Add, Edit, and Delete products with a validation form and deletion confirmation popup.
- **Robust UI States:** Comprehensive loading spinners, empty states ("No products found"), and Error/Retry boundaries.
- **Global URL Sync:** Search, page, limit, category, and sort parameters are synced 100% with the URL (e.g., `?q=phone&page=2&category=smartphones`), making the dashboard perfectly shareable and resilient to refresh.
- **Axios Interceptors:** A single shared Axios instance (`src/lib/axios.ts`) that automatically injects the Bearer token and globally catches `401 Unauthorized` errors to force logout.

---

## 🧠 Architectural Choices & Solutions

### 1. The Search + Category Filter Conflict
**The Problem:** The DummyJSON API does not natively support searching (`/products/search?q=`) and filtering (`/products/category/X`) at the exact same time.
**The Solution:** I prioritized a seamless user experience. If a user tries to use both, the app fetches a larger batch of the search results from the API, and then applies the Category filter **client-side** before paginating. This completely abstracts the API limitation away from the user.

### 2. Overcoming Fake Mutations (Add/Edit/Delete)
**The Problem:** DummyJSON accepts `POST/PATCH/DELETE` requests but does not actually save the changes to their database.
**The Solution:** I built an **Optimistic In-Memory Mutation Overlay** inside `products.service.ts`. When a product is added, updated, or deleted, it gets tracked in a local `Map`. Whenever the app fetches data from the API, this service intercepts the response and applies the local mutations on top of it. This ensures that the user's edits persist flawlessly as they navigate around the dashboard, without needing a complex state manager like Redux.

### 3. Preventing Race Conditions & Double Submits
**The Problem:** Fast typing can cause old search queries to resolve after new ones. Spam-clicking "Save" can trigger 10 API requests.
**The Solution:** 
- **Search Race Conditions:** Every fetch request in `products/page.tsx` utilizes an `AbortController`. If a new request is triggered (e.g. typing a new letter), the previous pending HTTP request is immediately aborted at the network level.
- **Double Submits:** Forms use a `useRef(false)` flag alongside a `submitting` boolean to strictly block parallel identical requests.

### 4. Why AI Was Helpful
AI was instrumental in quickly scaffolding the boilerplate Next.js App Router setup, generating precise Tailwind CSS classes for the responsive mobile/desktop shifts, and writing the regex/string replacements when overhauling the color theme from Purple/Slate to the sleek Blue/Zinc palette. It also helped construct the complex Next.js Intercepting Routes architecture (`@modal`) to allow the Product Details page to render as a popup card while retaining a shareable URL.
