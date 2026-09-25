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
    <div className="w-full overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-slate-200">
            <th scope="col" className="px-5 py-3.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">
              Product
            </th>
            <th scope="col" className="px-4 py-3.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">
              Category
            </th>
            <th scope="col" className="px-4 py-3.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider text-right whitespace-nowrap">
              Price
            </th>
            <th scope="col" className="px-4 py-3.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider text-right whitespace-nowrap">
              Rating
            </th>
            <th scope="col" className="px-4 py-3.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider text-right whitespace-nowrap">
              Stock
            </th>
            <th scope="col" className="px-4 py-3.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider text-right whitespace-nowrap">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {products.map((product) => {
            const isLowStock = product.stock < 10;
            return (
              <tr
                key={product.id}
                className="group hover:bg-slate-50 transition-colors duration-150 relative"
              >
                {/* Left accent bar on hover */}
                <td className="px-5 py-3.5 relative">
                  {/* Indigo left-border accent appears on row hover */}
                  <div className="absolute left-0 top-0 bottom-0 w-[3px] rounded-r
                                  bg-gradient-to-b from-emerald-500 to-teal-400
                                  opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                  <div className="flex items-center gap-3">
                    <div className="relative w-11 h-11 rounded-xl overflow-hidden border border-slate-200
                                    flex-shrink-0 bg-white shadow-sm">
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
                      className="font-semibold text-slate-800 hover:text-emerald-600
                                 transition-colors duration-150 w-44 sm:w-60 truncate text-sm"
                      title={product.title}
                    >
                      {product.title}
                    </Link>
                  </div>
                </td>

                {/* Category badge */}
                <td className="px-4 py-3.5">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-medium
                                   bg-slate-100 text-slate-600 border border-slate-200 capitalize whitespace-nowrap">
                    {product.category.replaceAll("-", " ")}
                  </span>
                </td>

                {/* Price */}
                <td className="px-4 py-3.5 text-right">
                  <span className="font-bold text-slate-800 text-sm">
                    ${product.price.toFixed(2)}
                  </span>
                </td>

                {/* Rating */}
                <td className="px-4 py-3.5 text-right">
                  <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg
                                  bg-amber-50 text-xs border border-amber-200/50">
                    <span className="text-amber-500 text-sm">★</span>
                    <span className="font-semibold text-amber-700">{product.rating.toFixed(1)}</span>
                  </div>
                </td>

                {/* Stock with status dot */}
                <td className="px-4 py-3.5 text-right">
                  <div className="inline-flex items-center gap-1.5 justify-end">
                    <span
                      className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                        product.stock === 0
                          ? "bg-red-500"
                          : isLowStock
                          ? "bg-amber-400"
                          : "bg-emerald-500"
                      }`}
                    />
                    <span
                      className={`text-sm font-medium ${
                        isLowStock ? "text-red-500" : "text-slate-700"
                      }`}
                    >
                      {product.stock}
                    </span>
                  </div>
                </td>

                {/* Actions */}
                <td className="px-4 py-3.5 text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <button
                      onClick={() => onEdit(product)}
                      className="px-3 py-1.5 rounded-lg bg-white hover:bg-amber-50
                                 text-slate-600 hover:text-amber-600 text-xs font-medium
                                 border border-slate-200 hover:border-amber-200
                                 transition-all duration-150"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => onDelete(product)}
                      className="px-3 py-1.5 rounded-lg bg-white hover:bg-red-50
                                 text-slate-600 hover:text-red-600 text-xs font-medium
                                 border border-slate-200 hover:border-red-200
                                 transition-all duration-150"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
