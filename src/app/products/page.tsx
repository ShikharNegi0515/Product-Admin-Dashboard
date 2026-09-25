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

import { useEffect, useState, useCallback, Suspense } from "react";
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
  
  // Mutate State
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"add" | "edit">("add");
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

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

  // Fetch Products whenever URL state changes
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
        
        setProducts(res.products);
        setTotal(res.total);
      } catch (err: any) {
        if (err.name === "CanceledError") return; // Ignored aborts
        setError("Failed to load products. Please try again.");
      } finally {
        setLoading(false);
      }
    }
    
    loadData();
    return () => controller.abort(); // Cancel stale requests
  }, [page, limit, search, category, sortBy, order]);

  // Handlers
  const handleSearch = (q: string) => updateURL({ q, page: 1 }); // reset page on search
  
  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateURL({ category: e.target.value, page: 1 });
  };
  
  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (!val) {
      updateURL({ sortBy: null, order: null });
      return;
    }
    updateURL({ sortBy: val, order: "asc" }); // Simple asc toggle for demo
  };

  const handleDelete = async (p: Product) => {
    if (!window.confirm(`Are you sure you want to delete "${p.title}"?`)) return;
    
    try {
      await deleteProduct(p.id);
      // Trigger a re-fetch of the current page
      updateURL({ _t: Date.now() }); // Hack to force refresh if URL hasn't changed
    } catch {
      alert("Failed to delete product.");
    }
  };

  const handleFormSuccess = () => {
    setFormOpen(false);
    updateURL({ _t: Date.now() });
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Products</h1>
          <p className="text-sm text-zinc-400 mt-0.5">
            Manage your product catalog
          </p>
        </div>
        <button
          onClick={() => {
            setFormMode("add");
            setEditingProduct(null);
            setFormOpen(true);
          }}
          className="flex items-center gap-2 p-2 sm:px-4 sm:py-2 rounded-lg bg-gradient-to-r from-blue-600 to-sky-600 hover:from-blue-500 hover:to-sky-500 text-white text-sm font-semibold transition-all shadow-lg shadow-blue-500/20"
        >
          <svg className="w-5 h-5 sm:w-4 sm:h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          <span className="hidden sm:inline">Add Product</span>
        </button>
      </div>

      {/* Filters bar */}
      <div className="rounded-xl bg-zinc-900/60 border border-zinc-700/60 p-4 space-y-4">
        {/* Search + Category */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 w-full">
            <SearchBar value={search} onSearch={handleSearch} />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              value={category}
              onChange={handleCategoryChange}
              className="flex-1 sm:flex-none px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[140px]"
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
                className="px-3 py-2 rounded-lg text-xs font-medium text-zinc-400 hover:text-zinc-200 border border-zinc-700 hover:bg-zinc-700 transition-colors whitespace-nowrap"
              >
                Clear all
              </button>
            )}
          </div>
        </div>

        {/* Sort */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
            Sort by:
          </span>
          {["Price", "Rating", "Title"].map((opt) => {
            const isSelected = sortBy.toLowerCase() === opt.toLowerCase();
            return (
              <button
                key={opt}
                onClick={() => updateURL({ sortBy: isSelected ? null : opt.toLowerCase() })}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors border ${
                  isSelected
                    ? "bg-blue-600/20 text-blue-400 border-blue-500/50"
                    : "bg-zinc-800/50 text-zinc-400 border-zinc-700 hover:border-zinc-600"
                }`}
              >
                {opt}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="min-h-[400px]">
        {error ? (
          <div className="flex flex-col items-center justify-center py-20">
            <p className="text-red-400 mb-4">{error}</p>
            <button
              onClick={() => updateURL({ _t: Date.now() })}
              className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white transition-colors"
            >
              Retry
            </button>
          </div>
        ) : loading ? (
          <LoadingSpinner label="Loading products…" />
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-zinc-500">
            <svg className="w-16 h-16 mb-4 text-zinc-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
            <p className="text-lg font-medium text-zinc-300">No products found</p>
            <p className="text-sm mt-1">Try adjusting your search or filters.</p>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
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
            
            {/* Mobile Cards View */}
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
            <div className="mt-6 border-t border-zinc-700/60 pt-4">
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
