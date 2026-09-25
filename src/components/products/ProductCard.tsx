"use client";

import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/types/product";

interface ProductCardProps {
  product: Product;
  onEdit: (p: Product) => void;
  onDelete: (p: Product) => void;
}

export default function ProductCard({ product, onEdit, onDelete }: ProductCardProps) {
  return (
    <div className="rounded-xl bg-zinc-800/60 border border-zinc-700/60 overflow-hidden hover:border-zinc-600 transition-all hover:shadow-lg hover:shadow-black/20 group">
      {/* Thumbnail */}
      <div className="relative h-48 bg-white border-b border-zinc-700/60">
        <Image
          src={product.thumbnail}
          alt={product.title}
          fill
          sizes="(max-width: 640px) 100vw, 50vw"
          className="object-contain p-4 group-hover:scale-105 transition-transform duration-300"
        />
        {/* Category badge overlay */}
        <span className="absolute top-2 left-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-zinc-900/80 text-zinc-300 backdrop-blur-sm capitalize">
          {product.category.replace("-", " ")}
        </span>
      </div>

      {/* Body */}
      <div className="p-4 space-y-2">
        <h3 className="font-semibold text-zinc-200 line-clamp-2 text-sm leading-snug">
          {product.title}
        </h3>
        
        <div className="flex items-center justify-between mt-2">
          <span className="text-emerald-400 font-bold">${product.price.toFixed(2)}</span>
          <div className="flex items-center gap-1 bg-zinc-900/80 px-1.5 py-0.5 rounded text-xs text-zinc-300">
            <span className="text-amber-400">★</span> {product.rating}
          </div>
        </div>
        
        <div className="text-xs text-zinc-400 flex justify-between items-center">
          <span>Stock:</span>
          <span className={product.stock < 10 ? "text-red-400 font-medium" : "text-zinc-300"}>
            {product.stock}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="px-4 pb-4 flex gap-2">
        <Link
          href={`/products/${product.id}`}
          className="flex-1 flex items-center justify-center py-2 rounded-lg border border-zinc-600 text-zinc-300 hover:bg-zinc-700 text-xs font-medium transition-colors"
        >
          View
        </Link>
        <button
          onClick={() => onEdit(product)}
          className="flex-1 py-2 rounded-lg border border-amber-500/30 text-amber-400 hover:bg-amber-500/10 text-xs font-medium transition-colors"
          aria-label={`Edit ${product.title}`}
        >
          Edit
        </button>
        <button
          onClick={() => onDelete(product)}
          className="flex-1 py-2 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 text-xs font-medium transition-colors"
          aria-label={`Delete ${product.title}`}
        >
          Delete
        </button>
      </div>
    </div>
  );
}
