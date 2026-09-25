"use client";

import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/types/product";

interface ProductTableProps {
  products: Product[];
  onEdit: (p: Product) => void;
  onDelete: (p: Product) => void;
}

export default function ProductTable({ products, onEdit, onDelete }: ProductTableProps) {
  if (products.length === 0) return null;

  return (
    <div className="w-full overflow-x-auto rounded-xl border border-zinc-700/60 bg-zinc-900/60">
      <table className="w-full text-left text-sm whitespace-nowrap">
        <thead className="bg-zinc-800/80 text-zinc-300 text-xs uppercase tracking-wider border-b border-zinc-700/60">
          <tr>
            <th scope="col" className="px-4 py-3 font-medium">Product</th>
            <th scope="col" className="px-4 py-3 font-medium">Category</th>
            <th scope="col" className="px-4 py-3 font-medium text-right">Price</th>
            <th scope="col" className="px-4 py-3 font-medium text-right">Rating</th>
            <th scope="col" className="px-4 py-3 font-medium text-right">Stock</th>
            <th scope="col" className="px-4 py-3 font-medium text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-700/50">
          {products.map((product) => (
            <tr key={product.id} className="hover:bg-zinc-800/40 transition-colors">
              {/* Product (image + title) */}
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="relative w-11 h-11 rounded-lg overflow-hidden border border-zinc-700 flex-shrink-0 bg-white">
                    <Image
                      src={product.thumbnail}
                      alt={product.title}
                      fill
                      sizes="44px"
                      className="object-contain p-1"
                    />
                  </div>
                  <Link
                    href={`/products/${product.id}`}
                    className="font-medium text-zinc-200 hover:text-blue-400 transition-colors w-48 sm:w-64 truncate"
                    title={product.title}
                  >
                    {product.title}
                  </Link>
                </div>
              </td>

              {/* Category */}
              <td className="px-4 py-3 text-zinc-400 capitalize">
                {product.category.replace("-", " ")}
              </td>

              {/* Price */}
              <td className="px-4 py-3 text-right font-medium text-emerald-400">
                ${product.price.toFixed(2)}
              </td>

              {/* Rating */}
              <td className="px-4 py-3 text-right">
                <div className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-zinc-800 text-xs">
                  <span className="text-amber-400">★</span>
                  <span className="text-zinc-300">{product.rating.toFixed(2)}</span>
                </div>
              </td>

              {/* Stock */}
              <td className="px-4 py-3 text-right">
                <span
                  className={
                    product.stock < 10
                      ? "text-red-400 font-medium"
                      : "text-zinc-400"
                  }
                >
                  {product.stock}
                </span>
              </td>

              {/* Actions */}
              <td className="px-4 py-3 text-right">
                <div className="flex items-center justify-end gap-2">
                  <button
                    onClick={() => onEdit(product)}
                    className="px-2.5 py-1.5 rounded bg-zinc-800 hover:bg-amber-500/10 text-zinc-300 hover:text-amber-400 text-xs font-medium border border-zinc-700 transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => onDelete(product)}
                    className="px-2.5 py-1.5 rounded bg-zinc-800 hover:bg-red-500/10 text-zinc-300 hover:text-red-400 text-xs font-medium border border-zinc-700 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
