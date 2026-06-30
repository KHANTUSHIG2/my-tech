import React, { useState, useRef } from "react";
import { Plus, Pencil, Trash2, X, Upload, RotateCcw, Search } from "lucide-react";
import { Product } from "../../types";
import { CATEGORIES, getCategoryLabel } from "../../data";
import {
  ProductPatch,
  updateProduct,
  addProduct,
  deleteProduct,
  resetProductChanges,
} from "../../store";

interface AdminProductsProps {
  products: Product[];
}

// Бүх "навч" категориуд (сонголтод)
const LEAF_CATEGORIES = CATEGORIES.flatMap((c) =>
  c.subcategories?.length
    ? c.subcategories.map((s) => s.id)
    : c.id === "all"
    ? []
    : [c.id]
);

type Draft = {
  id: string;
  name: string;
  brand: string;
  category: string;
  price: string;
  originalPrice: string;
  stock: string;
  rating: string;
  description: string;
  image: string;
  isNew: boolean;
};

const emptyDraft = (): Draft => ({
  id: "",
  name: "",
  brand: "",
  category: LEAF_CATEGORIES[0] ?? "prebuilt",
  price: "",
  originalPrice: "",
  stock: "",
  rating: "4.5",
  description: "",
  image: "",
  isNew: false,
});

const fromProduct = (p: Product): Draft => ({
  id: p.id,
  name: p.name,
  brand: p.brand,
  category: p.category,
  price: String(p.price),
  originalPrice: p.originalPrice ? String(p.originalPrice) : "",
  stock: String(p.stock),
  rating: String(p.rating),
  description: p.description,
  image: p.image,
  isNew: !!p.isNew,
});

export default function AdminProducts({ products }: AdminProductsProps) {
  const [editing, setEditing] = useState<Draft | null>(null);
  const [isNewProduct, setIsNewProduct] = useState(false);
  const [query, setQuery] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const filtered = products.filter(
    (p) =>
      p.name.toLowerCase().includes(query.toLowerCase()) ||
      p.brand.toLowerCase().includes(query.toLowerCase())
  );

  const openEdit = (p: Product) => {
    setIsNewProduct(false);
    setEditing(fromProduct(p));
  };
  const openNew = () => {
    setIsNewProduct(true);
    setEditing(emptyDraft());
  };

  const handleImageFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editing) return;
    const reader = new FileReader();
    reader.onload = () =>
      setEditing((d) => (d ? { ...d, image: String(reader.result) } : d));
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    if (!editing) return;
    if (!editing.name.trim()) {
      alert("Барааны нэрийг оруулна уу.");
      return;
    }
    const patch: ProductPatch = {
      name: editing.name.trim(),
      brand: editing.brand.trim() || "Бусад",
      category: editing.category,
      price: Number(editing.price) || 0,
      originalPrice: editing.originalPrice ? Number(editing.originalPrice) : undefined,
      stock: Number(editing.stock) || 0,
      rating: Number(editing.rating) || 4.5,
      description: editing.description.trim(),
      image: editing.image.trim() || "https://loremflickr.com/800/800/computer",
      isNew: editing.isNew,
    };

    if (isNewProduct) {
      const id =
        editing.id.trim() ||
        `custom-${editing.name.trim().toLowerCase().replace(/\s+/g, "-").slice(0, 24)}-${Date.now()
          .toString()
          .slice(-4)}`;
      addProduct({
        id,
        specs: {},
        features: [],
        ...(patch as Required<ProductPatch>),
      } as Product);
    } else {
      updateProduct(editing.id, patch);
    }
    setEditing(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900">Бүтээгдэхүүн</h2>
          <p className="text-sm text-slate-400">Нийт {products.length} бараа</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              if (confirm("Бүх засвар, нэмсэн бараа, зургийг анхны төлөвт буцаах уу?"))
                resetProductChanges();
            }}
            className="flex items-center gap-1.5 px-3 py-2.5 bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:border-slate-300 rounded-xl text-sm font-semibold"
            title="Анхны төлөвт буцаах"
          >
            <RotateCcw className="w-4 h-4" />
            <span className="hidden sm:inline">Сэргээх</span>
          </button>
          <button
            onClick={openNew}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold"
          >
            <Plus className="w-4 h-4" /> Шинэ бараа
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Бараа хайх..."
          className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:border-blue-400"
        />
      </div>

      {/* Product table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
        <div className="divide-y divide-slate-100">
          {filtered.map((p) => (
            <div key={p.id} className="flex items-center gap-4 p-3 hover:bg-slate-50/50">
              <img
                src={p.image}
                alt={p.name}
                referrerPolicy="no-referrer"
                className="h-14 w-14 rounded-xl object-cover border border-slate-100 flex-shrink-0"
              />
              <div className="flex-grow min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-slate-900 text-sm line-clamp-1">
                    {p.name}
                  </p>
                  {p.isNew && (
                    <span className="text-[9px] font-bold bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded">
                      ШИНЭ
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400">
                  {p.brand} · {getCategoryLabel(p.category)}
                </p>
              </div>
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-slate-900 font-mono">
                  {p.price.toLocaleString()} ₮
                </p>
                <p className="text-xs text-slate-400">Үлдэгдэл: {p.stock}</p>
              </div>
              <button
                onClick={() => openEdit(p)}
                className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                title="Засах"
              >
                <Pencil className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  if (confirm(`"${p.name}"-г устгах уу?`)) deleteProduct(p.id);
                }}
                className="p-2 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                title="Устгах"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
          {filtered.length === 0 && (
            <p className="text-sm text-slate-400 text-center py-12">Бараа олдсонгүй.</p>
          )}
        </div>
      </div>

      {/* Edit / Add modal */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-white flex items-center justify-between p-5 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">
                {isNewProduct ? "Шинэ бараа нэмэх" : "Бараа засах"}
              </h3>
              <button
                onClick={() => setEditing(null)}
                className="p-2 text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              {/* Image preview + change */}
              <div className="flex items-center gap-4">
                <img
                  src={editing.image || "https://loremflickr.com/200/200/computer"}
                  alt="preview"
                  referrerPolicy="no-referrer"
                  className="h-20 w-20 rounded-xl object-cover border border-slate-200 flex-shrink-0"
                />
                <div className="flex-grow space-y-2">
                  <input
                    value={editing.image}
                    onChange={(e) => setEditing({ ...editing, image: e.target.value })}
                    placeholder="Зургийн URL..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-blue-400"
                  />
                  <button
                    onClick={() => fileRef.current?.click()}
                    className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700"
                  >
                    <Upload className="w-3.5 h-3.5" /> Зураг байршуулах
                  </button>
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageFile}
                    className="hidden"
                  />
                </div>
              </div>

              <Field label="Нэр">
                <input
                  value={editing.name}
                  onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                  className="admin-input"
                />
              </Field>

              <div className="grid grid-cols-2 gap-3">
                <Field label="Бренд">
                  <input
                    value={editing.brand}
                    onChange={(e) => setEditing({ ...editing, brand: e.target.value })}
                    placeholder="Жишээ: Logitech"
                    className="admin-input"
                  />
                </Field>
                <Field label="Ангилал">
                  <select
                    value={editing.category}
                    onChange={(e) => setEditing({ ...editing, category: e.target.value })}
                    className="admin-input"
                  >
                    {LEAF_CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {getCategoryLabel(c)}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Field label="Үнэ (₮)">
                  <input
                    type="number"
                    value={editing.price}
                    onChange={(e) => setEditing({ ...editing, price: e.target.value })}
                    className="admin-input"
                  />
                </Field>
                <Field label="Хуучин үнэ (₮)">
                  <input
                    type="number"
                    value={editing.originalPrice}
                    onChange={(e) =>
                      setEditing({ ...editing, originalPrice: e.target.value })
                    }
                    className="admin-input"
                  />
                </Field>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Field label="Үлдэгдэл">
                  <input
                    type="number"
                    value={editing.stock}
                    onChange={(e) => setEditing({ ...editing, stock: e.target.value })}
                    className="admin-input"
                  />
                </Field>
                <Field label="Үнэлгээ (0-5)">
                  <input
                    type="number"
                    step="0.1"
                    value={editing.rating}
                    onChange={(e) => setEditing({ ...editing, rating: e.target.value })}
                    className="admin-input"
                  />
                </Field>
              </div>

              <Field label="Тайлбар">
                <textarea
                  value={editing.description}
                  onChange={(e) =>
                    setEditing({ ...editing, description: e.target.value })
                  }
                  rows={3}
                  className="admin-input resize-none"
                />
              </Field>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={editing.isNew}
                  onChange={(e) => setEditing({ ...editing, isNew: e.target.checked })}
                  className="h-4 w-4 accent-blue-600"
                />
                <span className="text-sm text-slate-700 font-medium">
                  "Шинэ" гэж тэмдэглэх
                </span>
              </label>
            </div>

            <div className="sticky bottom-0 bg-white flex gap-3 p-5 border-t border-slate-100">
              <button
                onClick={() => setEditing(null)}
                className="flex-1 py-2.5 border border-slate-200 text-slate-600 rounded-xl text-sm font-semibold hover:bg-slate-50"
              >
                Болих
              </button>
              <button
                onClick={handleSave}
                className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold"
              >
                Хадгалах
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
        {label}
      </span>
      <div className="mt-1">{children}</div>
    </label>
  );
}
