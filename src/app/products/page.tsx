"use client";

/**
 * Main Products Page.
 *
 * This component acts as the "Controller" for the product list.
 * Requirements addressed:
 * 1. "Keep the page, search, filter and sort values in the URL": We use Next.js
 *    useRouter and useSearchParams to sync state to the URL.
 * 2. "Wrong URL values like ?page=abc must not break": We gracefully parse and fallback.
 * 3. "Show loading, empty, and error states": We manage loading/error state heavily.
 */

import { useEffect, useState, useCallback, Suspense, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { Product, Category } from "@/types/product";
import { fetchProducts, fetchCategories, deleteProduct } from "@/services/products.service";

import SearchBar from "@/components/ui/SearchBar";
import Pagination from "@/components/ui/Pagination";
import ProductTable from "@/components/products/ProductTable";
import ProductCard from "@/components/products/ProductCard";
import ProductForm from "@/components/products/ProductForm";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

function ProductsDashboard() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // URL State parsing
  const rawPage = searchParams.get("page");
  const rawLimit = searchParams.get("limit");
  
  const page = rawPage && !isNaN(Number(rawPage)) ? Math.max(1, Number(rawPage)) : 1;
  const limit = rawLimit && !isNaN(Number(rawLimit)) ? Number(rawLimit) : 10;
  
  const search = searchParams.get("q") || "";
  const category = searchParams.get("category") || "";
  const sortBy = searchParams.get("sortBy") || "";
  const order = (searchParams.get("order") as "asc" | "desc") || "asc";

  // Data State
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [total, setTotal] = useState(0);
  
  // UI State
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Incremented to force a re-fetch without polluting the URL.
  // Used after a delete or save, replacing the previous _t=Date.now() hack.
  const [refreshKey, setRefreshKey] = useState(0);

  // Mutate State
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"add" | "edit">("add");
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Ref that always holds the latest searchParams so the fetch useEffect can
  // read it for the page-clamp redirect WITHOUT being a reactive dependency.
  // (useSearchParams() returns a new object reference on every render in Next.js,
  // so putting it in the deps array would cause an infinite re-fetch loop.)
  const searchParamsRef = useRef(searchParams);
  searchParamsRef.current = searchParams;

  /**
   * Sync a partial state update to the URL
   */
  const updateURL = useCallback(
    (updates: Record<string, string | number | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      
      Object.entries(updates).forEach(([key, val]) => {
        if (val === null || val === "") {
          params.delete(key);
        } else {
          params.set(key, String(val));
        }
      });

      router.push(`/products?${params.toString()}`);
    },
    [router, searchParams]
  );

  // Fetch Categories on mount
  useEffect(() => {
    fetchCategories()
      .then(setCategories)
      .catch((err) => console.error("Failed to load categories", err));
  }, []);

  // Fetch Products whenever URL state changes (or after a mutation via refreshKey)
  useEffect(() => {
    const controller = new AbortController();

    async function loadData() {
      setLoading(true);
      setError(null);

      try {
        const res = await fetchProducts({
          page,
          limit,
          search,
          category,
          sortBy,
          order,
          signal: controller.signal,
        });

        // Auto-correct an out-of-range page (e.g., ?page=999).
        const totalPages = Math.ceil(res.total / limit) || 1;
        if (res.total > 0 && page > totalPages) {
          const correctedParams = new URLSearchParams(searchParamsRef.current.toString());
          correctedParams.set("page", String(totalPages));
          router.replace(`/products?${correctedParams.toString()}`);
          return;
        }

        setProducts(res.products);
        setTotal(res.total);
        setLoading(false); // ← only reached on success
      } catch (err: unknown) {
        // If the request was aborted (navigation / new keystroke), do NOT touch state.
        // Leaving loading=true prevents the empty-state flash before the next fetch starts.
        if (err instanceof Error && err.name === "CanceledError") return;
        setError("Failed to load products. Please try again.");
        setLoading(false); // ← only reached on a real error
      }
      // No finally block – intentional. See comment above.
    }

    loadData();
    return () => controller.abort(); // Cancel stale requests on next run
  }, [page, limit, search, category, sortBy, order, refreshKey, router]);

  // Handlers
  // Memoised so SearchBar's debounce useEffect doesn't re-register on every render.
  const handleSearch = useCallback(
    (q: string) => updateURL({ q, page: 1 }),
    [updateURL]
  );

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateURL({ category: e.target.value, page: 1 });
  };

  const handleDelete = async (p: Product) => {
    if (!window.confirm(`Are you sure you want to delete "${p.title}"?`)) return;

    try {
      await deleteProduct(p.id);
      // Bump refreshKey to re-fetch the current page without touching the URL.
      setRefreshKey((k) => k + 1);
    } catch {
      alert("Failed to delete product.");
    }
  };

  const handleFormSuccess = () => {
    setFormOpen(false);
    // Bump refreshKey to re-fetch the current page without touching the URL.
    setRefreshKey((k) => k + 1);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Products
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Manage your product catalog
          </p>
        </div>
        <button
          onClick={() => {
            setFormMode("add");
            setEditingProduct(null);
            setFormOpen(true);
          }}
          className="flex items-center gap-2 p-2.5 sm:px-4 sm:py-2.5 rounded-xl
                     bg-gradient-to-r from-emerald-500 to-teal-400
                     hover:from-emerald-400 hover:to-teal-300
                     text-white text-sm font-semibold transition-all duration-200
                     shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          <span className="hidden sm:inline">Add Product</span>
        </button>
      </div>

      {/* ── Filters bar ──────────────────────────────────────────────── */}
      <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-4 space-y-3.5">
        {/* Search + Category */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 w-full">
            <SearchBar value={search} onSearch={handleSearch} />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              value={category}
              onChange={handleCategoryChange}
              className="flex-1 sm:flex-none px-3 py-2 rounded-xl bg-slate-50 border border-slate-200
                         text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40
                         focus:border-emerald-500/30 transition-all min-w-[140px] cursor-pointer"
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </select>

            {(search || category || sortBy) && (
              <button
                onClick={() => updateURL({ q: null, category: null, sortBy: null, order: null, page: 1 })}
                className="px-3 py-2 rounded-xl text-xs font-medium text-slate-500 hover:text-slate-700
                           border border-slate-200 hover:bg-slate-50 transition-colors whitespace-nowrap"
              >
                Clear all
              </button>
            )}
          </div>
        </div>

        {/* Sort pills */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest">
            Sort by:
          </span>
          {["Price", "Rating", "Title"].map((opt) => {
            const isSelected = sortBy.toLowerCase() === opt.toLowerCase();
            return (
              <button
                key={opt}
                onClick={() => {
                  if (isSelected) {
                    updateURL({ sortBy: opt.toLowerCase(), order: order === "asc" ? "desc" : "asc" });
                  } else {
                    updateURL({ sortBy: opt.toLowerCase(), order: "asc" });
                  }
                }}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 border ${
                  isSelected
                    ? "bg-emerald-100 text-emerald-700 border-emerald-300 shadow-sm"
                    : "bg-slate-50 text-slate-500 border-slate-200 hover:border-slate-300 hover:text-slate-700"
                }`}
              >
                {opt}
                {isSelected && (
                  <span className="ml-1 font-bold">{order === "asc" ? "↑" : "↓"}</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Main Content ──────────────────────────────────────────────── */}
      <div className="min-h-[400px]">
        {error ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20
                            flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732
                     4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <p className="text-slate-700 font-medium mb-1">Something went wrong</p>
            <p className="text-sm text-slate-500 mb-5">{error}</p>
            <button
              onClick={() => setRefreshKey((k) => k + 1)}
              className="px-5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700
                         text-sm font-medium transition-colors border border-slate-200 shadow-sm"
            >
              Retry
            </button>
          </div>
        ) : loading ? (
          <LoadingSpinner label="Loading products…" />
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-20 h-20 rounded-3xl bg-slate-100 border border-slate-200
                            flex items-center justify-center mb-5">
              <svg className="w-10 h-10 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                  d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
            </div>
            <p className="text-lg font-semibold text-slate-700">No products found</p>
            <p className="text-sm text-slate-500 mt-1">Try adjusting your search or filters.</p>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden sm:block">
              <ProductTable
                products={products}
                onEdit={(p) => {
                  setEditingProduct(p);
                  setFormMode("edit");
                  setFormOpen(true);
                }}
                onDelete={handleDelete}
              />
            </div>

            {/* Mobile Cards */}
            <div className="sm:hidden grid grid-cols-1 gap-4 product-grid">
              {products.map((p) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  onEdit={(p) => {
                    setEditingProduct(p);
                    setFormMode("edit");
                    setFormOpen(true);
                  }}
                  onDelete={handleDelete}
                />
              ))}
            </div>

            {/* Pagination */}
            <div className="mt-6 border-t border-slate-200 pt-4">
              <Pagination
                currentPage={page}
                limit={limit}
                total={total}
                onPageChange={(p) => updateURL({ page: p })}
                onLimitChange={(l) => updateURL({ limit: l, page: 1 })}
              />
            </div>
          </>
        )}
      </div>

      {/* Form Modal */}
      {formOpen && (
        <ProductForm
          mode={formMode}
          initialData={editingProduct}
          onClose={() => setFormOpen(false)}
          onSuccess={handleFormSuccess}
        />
      )}
    </div>
  );
}

// Wrap in suspense since we use useSearchParams
export default function Page() {
  return (
    <Suspense fallback={<LoadingSpinner label="Loading…" />}>
      <ProductsDashboard />
    </Suspense>
  );
}
