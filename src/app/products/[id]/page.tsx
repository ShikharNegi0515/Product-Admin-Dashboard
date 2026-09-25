"use client";

/**
 * Product Details Page (/products/[id])
 *
 * Shows full product information, an interactive image gallery, and customer reviews.
 * Includes graceful handling for invalid IDs or network errors.
 */

import { useEffect, useState, use } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Product } from "@/types/product";
import { getProductById } from "@/services/products.service";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

export default function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const router = useRouter();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Incrementing this triggers a re-fetch without unmounting the component.
  const [retryCount, setRetryCount] = useState(0);

  // For the image gallery
  const [activeImg, setActiveImg] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    async function loadProduct() {
      setLoading(true);
      setError(null);
      try {
        const data = await getProductById(resolvedParams.id, controller.signal);
        setProduct(data);
      } catch (err: unknown) {
        if (err instanceof Error && err.name === "CanceledError") return;
        setError(
          err instanceof Error ? err.message : "Product not found"
        );
      } finally {
        setLoading(false);
      }
    }

    loadProduct();
    return () => controller.abort();
  }, [resolvedParams.id, retryCount]);

  if (loading) {
    return <LoadingSpinner label="Loading product details…" size="lg" />;
  }

  // Not Found / Error State
  if (error || !product) {
    return (
      <div className="flex flex-col items-center justify-center py-20 animate-fadeIn">
        <svg
          className="w-20 h-20 text-zinc-700 mb-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1}
            d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <h2 className="text-2xl font-bold text-white mb-2">Product Not Found</h2>
        <p className="text-zinc-400 mb-8 max-w-md text-center">
          We couldn&apos;t find the product you&apos;re looking for. It may have been deleted or the ID is
          incorrect.
        </p>
        <div className="flex gap-3">
          <button
            onClick={() => {
              setError(null);
              setRetryCount((c) => c + 1);
            }}
            className="px-6 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium transition-colors"
          >
            Retry
          </button>
          <button
            onClick={() => router.back()}
            className="px-6 py-2.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white font-medium transition-colors border border-zinc-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // Fallback if images array is missing/empty
  const images = product.images?.length > 0 ? product.images : [product.thumbnail];

  return (
    <div className="animate-fadeIn max-w-5xl mx-auto space-y-6">
      {/* Back button */}
      <Link
        href="/products"
        className="inline-flex items-center gap-2 text-sm font-medium text-zinc-400 hover:text-white transition-colors group"
      >
        <svg
          className="w-4 h-4 group-hover:-translate-x-1 transition-transform"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Back to Products
      </Link>

      {/* Main Content Card */}
      <div className="bg-zinc-900/60 border border-zinc-700/60 rounded-2xl overflow-hidden shadow-2xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
          {/* Gallery */}
          <div className="p-6 border-b md:border-b-0 md:border-r border-zinc-700/60">
            {/* Main image */}
            <div className="relative aspect-square rounded-xl overflow-hidden bg-white mb-3 shadow-inner">
              <Image
                src={images[activeImg] ?? product.thumbnail}
                alt={product.title}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-contain p-4 transition-opacity duration-200"
                priority
              />
            </div>
            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-2 flex-wrap">
                {images.map((src, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImg(idx)}
                    className={`relative w-14 h-14 rounded-lg overflow-hidden border-2 bg-white transition-all ${
                      activeImg === idx
                        ? "border-blue-500 shadow-lg shadow-blue-500/20"
                        : "border-zinc-700 hover:border-zinc-500 opacity-60 hover:opacity-100"
                    }`}
                    aria-label={`View image ${idx + 1}`}
                  >
                    <Image
                      src={src}
                      alt={`Thumbnail ${idx + 1}`}
                      fill
                      sizes="56px"
                      className="object-contain p-1"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="p-6 sm:p-8 flex flex-col">
            <div className="mb-2 flex items-center gap-3">
              <span className="px-2.5 py-1 rounded-full bg-zinc-800 text-xs font-medium text-zinc-300 capitalize border border-zinc-700">
                {product.category.replaceAll("-", " ")}
              </span>
              <div className="flex items-center gap-1 text-sm text-zinc-400">
                <span className="text-amber-400">★</span>
                {product.rating.toFixed(2)}
              </div>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold text-white leading-tight mb-4">
              {product.title}
            </h1>

            <div className="flex items-baseline gap-4 mb-6">
              <span className="text-3xl font-black text-emerald-400">
                ${product.price.toFixed(2)}
              </span>
              <span
                className={`text-sm font-medium ${
                  product.stock > 10 ? "text-green-500" : "text-red-400"
                }`}
              >
                {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
              </span>
            </div>

            <p className="text-zinc-300 leading-relaxed mb-8 flex-1">
              {product.description}
            </p>

            {/* Action buttons (fake) */}
            <div className="flex gap-3 mt-auto">
              <button className="flex-1 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-colors shadow-lg shadow-blue-500/20">
                Buy Now
              </button>
              <button className="px-4 py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-medium transition-colors border border-zinc-700">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      {product.reviews && product.reviews.length > 0 && (
        <div className="bg-zinc-900/60 border border-zinc-700/60 rounded-2xl p-6 sm:p-8 mt-6">
          <h3 className="text-xl font-bold text-white mb-6">Customer Reviews</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {product.reviews.map((r, i) => (
              <div key={i} className="p-4 rounded-xl bg-zinc-800/50 border border-zinc-700/50">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1 text-sm font-medium">
                    <span className="text-amber-400">★</span>
                    <span className="text-white">{r.rating}</span>
                  </div>
                  <span className="text-xs text-zinc-500">
                    {new Date(r.date).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-sm text-zinc-300 italic mb-3">"{r.comment}"</p>
                <div className="text-xs text-zinc-400">
                  <span className="font-medium text-zinc-300">{r.reviewerName}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
