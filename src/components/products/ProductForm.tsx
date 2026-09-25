"use client";

import { useState, useEffect } from "react";
import type { Product } from "@/types/product";
import { addProduct, updateProduct } from "@/services/products.service";

interface ProductFormProps {
  mode: "add" | "edit";
  initialData?: Product | null;
  onClose: () => void;
  onSuccess: (savedProduct: Product) => void;
}

export default function ProductForm({
  mode,
  initialData,
  onClose,
  onSuccess,
}: ProductFormProps) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    stock: "",
    category: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  // Pre-fill form if editing
  useEffect(() => {
    if (mode === "edit" && initialData) {
      setFormData({
        title: initialData.title,
        description: initialData.description,
        price: initialData.price.toString(),
        stock: initialData.stock.toString(),
        category: initialData.category,
      });
    }
  }, [mode, initialData]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.title.trim()) newErrors.title = "Title is required";
    if (!formData.price || isNaN(Number(formData.price)))
      newErrors.price = "Valid price is required";
    if (!formData.stock || isNaN(Number(formData.stock)))
      newErrors.stock = "Valid stock is required";
    if (!formData.category.trim()) newErrors.category = "Category is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || submitting) return;

    setSubmitting(true);
    try {
      const payload = {
        title: formData.title,
        description: formData.description,
        price: Number(formData.price),
        stock: Number(formData.stock),
        category: formData.category,
        rating: mode === "edit" ? initialData?.rating ?? 0 : 0, // Mock fields
        thumbnail:
          initialData?.thumbnail ??
          "https://cdn.dummyjson.com/product-images/1/thumbnail.jpg",
        images: initialData?.images ?? [],
      };

      let saved: Product;
      if (mode === "add") {
        saved = await addProduct(payload);
      } else {
        saved = await updateProduct(initialData!.id, payload);
      }
      onSuccess(saved);
    } catch (err) {
      console.error("Failed to save product", err);
      alert("Failed to save product");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0">
      <div
        className="absolute inset-0 bg-zinc-950/80 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-md bg-zinc-900 border border-zinc-700 rounded-2xl shadow-2xl overflow-hidden animate-scaleIn">
        <div className="p-6">
          <h2 className="text-xl font-bold text-white mb-6">
            {mode === "add" ? "Add New Product" : "Edit Product"}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1">
                Title
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
              />
              {errors.title && (
                <p className="text-red-400 text-xs mt-1">{errors.title}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1">
                  Price ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({ ...formData, price: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                />
                {errors.price && (
                  <p className="text-red-400 text-xs mt-1">{errors.price}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1">
                  Stock
                </label>
                <input
                  type="number"
                  value={formData.stock}
                  onChange={(e) =>
                    setFormData({ ...formData, stock: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                />
                {errors.stock && (
                  <p className="text-red-400 text-xs mt-1">{errors.stock}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1">
                Category
              </label>
              <input
                type="text"
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
                placeholder="e.g. smartphones"
                className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
              />
              {errors.category && (
                <p className="text-red-400 text-xs mt-1">{errors.category}</p>
              )}
            </div>

            <div className="pt-4 flex gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={submitting}
                className="flex-1 py-2 rounded-lg border border-zinc-600 text-zinc-300 hover:bg-zinc-800 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium transition-colors disabled:opacity-50"
              >
                {submitting ? "Saving..." : "Save Product"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
