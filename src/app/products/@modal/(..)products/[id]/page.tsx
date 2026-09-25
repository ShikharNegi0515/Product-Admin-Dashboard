"use client";

import { useEffect, useState, use } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import type { Product } from "@/types/product";
import { getProductById } from "@/services/products.service";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

export default function ProductDetailModal({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeImg, setActiveImg] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    async function loadProduct() {
      try {
        const data = await getProductById(resolvedParams.id, controller.signal);
        setProduct(data);
      } catch (err: any) {
        if (err.name === "CanceledError") return;
        setError(err.message || "Product not found");
      } finally {
        setLoading(false);
      }
    }
    loadProduct();
    return () => controller.abort();
  }, [resolvedParams.id]);

  const onDismiss = () => {
    const query = searchParams.toString();
    router.push(`/products${query ? `?${query}` : ''}`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-zinc-950/80 backdrop-blur-sm"
        onClick={onDismiss}
      />
      
      {/* Modal Card */}
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-zinc-900 border border-zinc-700 rounded-2xl shadow-2xl overflow-y-auto animate-scaleIn flex flex-col">
        {/* Close Button */}
        <button 
          onClick={onDismiss}
          className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-zinc-800/80 text-zinc-400 hover:text-white hover:bg-zinc-700 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {loading ? (
          <div className="p-20"><LoadingSpinner label="Loading product details…" /></div>
        ) : error || !product ? (
          <div className="p-20 flex flex-col items-center text-center">
            <h2 className="text-xl font-bold text-white mb-2">Error</h2>
            <p className="text-zinc-400">{error || "Product not found"}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2">
            {/* Gallery */}
            <div className="p-6 border-b md:border-b-0 md:border-r border-zinc-700/60 bg-zinc-900/50">
              <div className="relative aspect-square rounded-xl overflow-hidden bg-white mb-4 shadow-inner">
                <Image
                  src={(product.images?.length ? product.images : [product.thumbnail])[activeImg] ?? product.thumbnail}
                  alt={product.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-contain p-4 transition-opacity duration-200"
                />
              </div>
              {product.images?.length > 1 && (
                <div className="flex gap-2 flex-wrap">
                  {product.images.map((src, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImg(idx)}
                      className={`relative w-12 h-12 rounded-lg overflow-hidden border-2 bg-white transition-all ${
                        activeImg === idx
                          ? "border-blue-500 shadow-md"
                          : "border-zinc-700 opacity-60 hover:opacity-100"
                      }`}
                    >
                      <Image src={src} alt="thumb" fill sizes="48px" className="object-contain p-1" />
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            {/* Details */}
            <div className="p-6 sm:p-8 flex flex-col">
              <span className="inline-block px-2.5 py-1 rounded-full bg-zinc-800 text-xs font-medium text-zinc-300 capitalize border border-zinc-700 self-start mb-4">
                {product.category.replace("-", " ")}
              </span>
              <h2 className="text-2xl font-bold text-white mb-2">{product.title}</h2>
              <div className="flex items-center gap-1 text-sm text-zinc-400 mb-4">
                <span className="text-amber-400">★</span>
                {product.rating.toFixed(2)}
              </div>
              <div className="flex items-baseline gap-4 mb-4">
                <span className="text-2xl font-black text-emerald-400">${product.price.toFixed(2)}</span>
                <span className={`text-sm ${product.stock > 10 ? "text-green-500" : "text-red-400"}`}>
                  Stock: {product.stock}
                </span>
              </div>
              <p className="text-zinc-300 leading-relaxed text-sm mb-8 flex-1">
                {product.description}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
