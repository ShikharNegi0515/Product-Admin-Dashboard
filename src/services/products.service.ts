/**
 * Products Service – handles all Product-related API calls.
 *
 * Requirements addressed here:
 * 1. "Race conditions": We accept an `AbortSignal` for fetch queries to cancel outdated requests if the user types quickly.
 * 2. "API cannot search and filter simultaneously": DummyJSON allows `/search?q=` or `/category/X` but not both natively.
 *    Decision: We always use the base or `/search` endpoint, and apply category filtering CLIENT-SIDE on the returned results.
 *    This ensures the user can search ("phone") AND filter by category ("smartphones") simultaneously.
 * 3. "Mutations not saved": We maintain an in-memory `mutationOverlay` map to overlay Add/Edit/Delete actions on top
 *    of the fetched API responses, so the user sees their changes persistently across navigations.
 */

import apiClient from "@/lib/axios";
import type {
  Product,
  FetchProductsResponse,
  Category,
  FetchProductsOptions,
} from "@/types/product";

// ── In-Memory Mutation Overlay ──────────────────────────────────────────────
// Because DummyJSON doesn't persist changes, we store mutations in memory.
// This survives route changes (e.g., navigating /products -> /products/123 -> /products)
// but resets on a hard page refresh.
const mutationOverlay = {
  added: new Map<number, Product>(),
  updated: new Map<number, Product>(),
  deleted: new Set<number>(),
};

// Start assigning fake IDs for new products (DummyJSON usually has ~200 items max)
let nextFakeId = 10000;

/**
 * Apply our local in-memory changes (additions, updates, deletions)
 * to a fresh API response so the UI reflects user actions.
 *
 * @param isFirstPage – locally-added products are always shown at the top of
 *   page 1. On subsequent pages the API slice is already correct.
 * @param limit – used to slice the merged result so a page never exceeds the
 *   chosen page size even after prepending added items.
 */
function applyMutations(
  apiProducts: Product[],
  totalFromApi: number,
  isFirstPage: boolean,
  limit: number
) {
  // Remove deleted items
  let result = apiProducts.filter((p) => !mutationOverlay.deleted.has(p.id));

  // Apply updates
  result = result.map((p) => {
    if (mutationOverlay.updated.has(p.id)) {
      return mutationOverlay.updated.get(p.id)!;
    }
    return p;
  });

  const addedArr = Array.from(mutationOverlay.added.values());

  // Recalculate total: Original Total - (deleted count) + (added count)
  const effectiveTotal =
    totalFromApi - mutationOverlay.deleted.size + mutationOverlay.added.size;

  // Prepend locally-added products only on page 1 and slice to `limit` so the
  // page never contains more rows than expected.
  const products = isFirstPage
    ? [...addedArr, ...result].slice(0, limit)
    : result;

  return { products, total: effectiveTotal };
}

// ── API Functions ───────────────────────────────────────────────────────────

export async function fetchProducts(
  options: FetchProductsOptions = {}
): Promise<FetchProductsResponse> {
  const {
    page = 1,
    limit = 10,
    search = "",
    category = "",
    sortBy = "",
    order = "asc",
    signal,
  } = options;

  // We fetch a larger batch if filtering by category while searching,
  // since the API can't do both simultaneously. If category is specified,
  // we fetch all search results (limit=0) and manually paginate locally.
  const isHybridFilter = search && category;
  const skip = (page - 1) * limit;

  let url = "/products";
  const params: Record<string, string | number> = {};

  if (search) {
    url = "/products/search";
    params.q = search;
    if (!isHybridFilter) {
      params.limit = limit;
      params.skip = skip;
    } else {
      params.limit = 0; // fetch all to client-side filter
    }
  } else if (category) {
    url = `/products/category/${category}`;
    params.limit = limit;
    params.skip = skip;
  } else {
    params.limit = limit;
    params.skip = skip;
  }

  if (sortBy) {
    params.sortBy = sortBy;
    params.order = order;
  }

  const { data } = await apiClient.get<FetchProductsResponse>(url, {
    params,
    signal,
  });

  let apiResults = data.products;
  let apiTotal = data.total;

  // Handle the hybrid case (Search + Category)
  if (isHybridFilter) {
    apiResults = apiResults.filter(
      (p) => p.category.toLowerCase() === category.toLowerCase()
    );
    apiTotal = apiResults.length;
    // Local pagination for the hybrid results
    apiResults = apiResults.slice(skip, skip + limit);
  }

  // Apply our local optimistic overlays
  const { products, total } = applyMutations(apiResults, apiTotal, page === 1, limit);

  return {
    products,
    total,
    skip,
    limit,
  };
}

export async function getProductById(
  id: string,
  signal?: AbortSignal
): Promise<Product> {
  const numId = Number(id);

  // 1. Check if it was locally added
  if (mutationOverlay.added.has(numId)) {
    return mutationOverlay.added.get(numId)!;
  }
  // 2. Check if it was deleted
  if (mutationOverlay.deleted.has(numId)) {
    throw new Error("Product not found (deleted)");
  }
  // 3. Fetch from API
  const { data } = await apiClient.get<Product>(`/products/${id}`, { signal });

  // 4. Return the local update if one exists, otherwise the raw API data
  if (mutationOverlay.updated.has(numId)) {
    return mutationOverlay.updated.get(numId)!;
  }
  return data;
}

export async function fetchCategories(): Promise<Category[]> {
  const { data } = await apiClient.get<Category[]>("/products/categories");
  return data;
}

export async function addProduct(
  productData: Omit<Product, "id">
): Promise<Product> {
  const { data } = await apiClient.post<Product>("/products/add", productData);
  
  // DummyJSON returns the new object with an ID, but it isn't saved on their end.
  // We use our fake ID logic in case the API recycles ID numbers.
  const newProduct = { ...data, id: nextFakeId++ };
  mutationOverlay.added.set(newProduct.id, newProduct);
  return newProduct;
}

export async function updateProduct(
  id: number,
  productData: Partial<Product>
): Promise<Product> {
  // If it's a locally added product, just update our local map
  if (mutationOverlay.added.has(id)) {
    const existing = mutationOverlay.added.get(id)!;
    const updated = { ...existing, ...productData };
    mutationOverlay.added.set(id, updated);
    return updated;
  }

  // Otherwise, patch the API
  const { data } = await apiClient.patch<Product>(
    `/products/${id}`,
    productData
  );
  
  // Overlay the patch so it persists in our app
  const finalProduct = { ...data, ...productData };
  mutationOverlay.updated.set(id, finalProduct);
  return finalProduct;
}

export async function deleteProduct(id: number): Promise<void> {
  // If it was locally added, just remove it from the added map
  if (mutationOverlay.added.has(id)) {
    mutationOverlay.added.delete(id);
    return;
  }

  // Otherwise tell the API, and mark it as deleted locally
  await apiClient.delete(`/products/${id}`);
  mutationOverlay.deleted.add(id);
  mutationOverlay.updated.delete(id); // remove any pending updates
}
