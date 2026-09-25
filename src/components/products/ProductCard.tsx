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
  const isLowStock = product.stock < 10;

  return (
    <div className="group rounded-2xl bg-white border border-slate-200 shadow-sm
                    hover:border-emerald-300 hover:shadow-xl hover:shadow-emerald-500/5
                    overflow-hidden transition-all duration-300 hover:-translate-y-0.5 flex flex-col">
      {/* ── Image ───────────────────────────────────────────────────────── */}
      <div className="relative h-48 bg-white overflow-hidden flex-shrink-0">
        <Image
          src={product.thumbnail}
          alt={product.title}
          fill
          sizes="(max-width: 640px) 100vw, 50vw"
          className="object-contain p-4 group-hover:scale-105 transition-transform duration-500"
        />
        {/* Gradient overlay at bottom of image */}
        <div className="absolute inset-x-0 bottom-0 h-12
                        bg-gradient-to-t from-black/40 to-transparent" />

        {/* Category badge — bottom-left of image */}
        <span className="absolute bottom-2 left-2.5 inline-flex items-center px-2 py-0.5
                         rounded-full text-[10px] font-semibold uppercase tracking-wider
                         bg-emerald-600/80 text-emerald-50 backdrop-blur-sm capitalize">
          {product.category.replaceAll("-", " ")}
        </span>

        {/* Low-stock warning badge */}
        {isLowStock && (
          <span className="absolute top-2 right-2 inline-flex items-center px-2 py-0.5
                           rounded-full text-[10px] font-semibold bg-red-500/80 text-white
                           backdrop-blur-sm">
            Low Stock
          </span>
        )}
      </div>

      {/* ── Body ────────────────────────────────────────────────────────── */}
      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-semibold text-slate-800 line-clamp-2 text-sm leading-snug mb-3">
          {product.title}
        </h3>

        {/* Stats row */}
        <div className="flex items-center justify-between mt-auto mb-3">
          {/* Price */}
          <span className="text-lg font-black text-slate-800">
            ${product.price.toFixed(2)}
          </span>

          {/* Rating */}
          <div className="flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded-lg text-xs border border-amber-200/50">
            <span className="text-amber-500">★</span>
            <span className="font-semibold text-amber-700">{product.rating.toFixed(1)}</span>
          </div>
        </div>

        {/* Stock bar */}
        <div className="flex items-center justify-between text-xs text-slate-500 mb-4">
          <span>Stock</span>
          <span className={`font-semibold ${isLowStock ? "text-red-500" : "text-slate-700"}`}>
            {product.stock} units
          </span>
        </div>

        {/* ── Actions ─────────────────────────────────────────────────── */}
        <div className="flex gap-2 mt-auto">
          <Link
            href={`/products/${product.id}`}
            className="flex-1 flex items-center justify-center py-2 rounded-xl
                       border border-slate-200 text-slate-600 hover:text-slate-900
                       hover:bg-slate-50 text-xs font-medium transition-colors duration-150"
          >
            View
          </Link>
          <button
            onClick={() => onEdit(product)}
            className="flex-1 py-2 rounded-xl border border-slate-200 text-amber-600
                       hover:bg-amber-50 hover:border-amber-200
                       text-xs font-medium transition-colors duration-150"
            aria-label={`Edit ${product.title}`}
          >
            Edit
          </button>
          <button
            onClick={() => onDelete(product)}
            className="flex-1 py-2 rounded-xl border border-slate-200 text-red-600
                       hover:bg-red-50 hover:border-red-200
                       text-xs font-medium transition-colors duration-150"
            aria-label={`Delete ${product.title}`}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
