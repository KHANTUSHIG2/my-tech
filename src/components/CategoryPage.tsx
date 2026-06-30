import React, { useState, useMemo, useEffect } from "react";
import { AnimatePresence } from "motion/react";
import { SlidersHorizontal, X, ArrowUpDown, Tag, PackageX } from "lucide-react";
import { Product } from "../types";
import { getCategoryLabel } from "../data";
import ProductCard from "./ProductCard";
import NewArrivals from "./NewArrivals";

interface CategoryPageProps {
  /** Категори + хайлтаар шүүгдсэн бараанууд */
  products: Product[];
  selectedCategory: string;
  searchQuery: string;
  onSelectProduct: (product: Product) => void;
  onAddToCart: (product: Product) => void;
}

type SortKey = "featured" | "newest" | "price-asc" | "price-desc" | "rating";

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: "featured", label: "Онцлох" },
  { key: "newest", label: "Шинээр нэмэгдсэн" },
  { key: "price-asc", label: "Үнэ: Багаас их" },
  { key: "price-desc", label: "Үнэ: Ихээс бага" },
  { key: "rating", label: "Үнэлгээгээр" },
];

export default function CategoryPage({
  products,
  selectedCategory,
  searchQuery,
  onSelectProduct,
  onAddToCart,
}: CategoryPageProps) {
  // Энэ категорийн бренд жагсаалт болон үнийн хязгаар
  const brands = useMemo(
    () => Array.from(new Set(products.map((p) => p.brand))).sort(),
    [products]
  );
  const priceBounds = useMemo(() => {
    if (products.length === 0) return { min: 0, max: 0 };
    const prices = products.map((p) => p.price);
    return { min: Math.min(...prices), max: Math.max(...prices) };
  }, [products]);

  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [minPrice, setMinPrice] = useState<string>("");
  const [maxPrice, setMaxPrice] = useState<string>("");
  const [sortBy, setSortBy] = useState<SortKey>("featured");
  const [showFilters, setShowFilters] = useState(false); // mobile toggle

  // Категори/хайлт солигдвол шүүлтийг цэвэрлэнэ
  useEffect(() => {
    setSelectedBrands([]);
    setMinPrice("");
    setMaxPrice("");
    setSortBy("featured");
  }, [selectedCategory, searchQuery]);

  const toggleBrand = (brand: string) =>
    setSelectedBrands((prev) =>
      prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand]
    );

  const clearFilters = () => {
    setSelectedBrands([]);
    setMinPrice("");
    setMaxPrice("");
    setSortBy("featured");
  };

  const hasActiveFilters =
    selectedBrands.length > 0 || minPrice !== "" || maxPrice !== "";

  // Шүүх + эрэмбэлэх
  const visibleProducts = useMemo(() => {
    const min = minPrice === "" ? -Infinity : Number(minPrice);
    const max = maxPrice === "" ? Infinity : Number(maxPrice);

    let result = products.filter((p) => {
      const brandOk =
        selectedBrands.length === 0 || selectedBrands.includes(p.brand);
      const priceOk = p.price >= min && p.price <= max;
      return brandOk && priceOk;
    });

    switch (sortBy) {
      case "newest":
        result = [...result].sort(
          (a, b) => Number(!!b.isNew) - Number(!!a.isNew)
        );
        break;
      case "price-asc":
        result = [...result].sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        result = [...result].sort((a, b) => b.price - a.price);
        break;
      case "rating":
        result = [...result].sort((a, b) => b.rating - a.rating);
        break;
    }
    return result;
  }, [products, selectedBrands, minPrice, maxPrice, sortBy]);

  const title = searchQuery
    ? `Хайлтын үр дүн: "${searchQuery}"`
    : getCategoryLabel(selectedCategory);

  // "Бүгд" хэсэгт (хайлтгүй үед) шинэ бүтээгдэхүүний showcase харуулна
  const showNewArrivals = selectedCategory === "all" && !searchQuery;

  // Filter sidebar markup (desktop + mobile дотор дахин ашиглана)
  const FilterPanel = (
    <div className="flex flex-col gap-6">
      {/* Brand filter */}
      <div>
        <h4 className="flex items-center gap-2 text-sm font-bold text-slate-900 mb-3">
          <Tag className="w-4 h-4 text-blue-500" /> Бренд
        </h4>
        {brands.length === 0 ? (
          <p className="text-xs text-slate-400">Бренд алга</p>
        ) : (
          <div className="flex flex-col gap-1.5 max-h-60 overflow-y-auto pr-1">
            {brands.map((brand) => {
              const checked = selectedBrands.includes(brand);
              return (
                <label
                  key={brand}
                  className="flex items-center gap-2.5 cursor-pointer group py-1"
                >
                  <span
                    className={`h-4 w-4 rounded-md border flex items-center justify-center transition-colors ${
                      checked
                        ? "bg-blue-600 border-blue-600"
                        : "border-slate-300 group-hover:border-blue-400"
                    }`}
                  >
                    {checked && (
                      <svg
                        className="w-3 h-3 text-white"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                      >
                        <path d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </span>
                  <input
                    id={`brand-${brand}`}
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleBrand(brand)}
                    className="sr-only"
                  />
                  <span
                    className={`text-sm ${
                      checked
                        ? "text-blue-600 font-semibold"
                        : "text-slate-600 group-hover:text-slate-900"
                    }`}
                  >
                    {brand}
                  </span>
                </label>
              );
            })}
          </div>
        )}
      </div>

      {/* Price range filter */}
      <div>
        <h4 className="text-sm font-bold text-slate-900 mb-3">Үнийн хязгаар (₮)</h4>
        <div className="flex items-center gap-2">
          <input
            id="price-min"
            type="number"
            inputMode="numeric"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            placeholder={priceBounds.min.toLocaleString()}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800 focus:outline-none focus:border-blue-400"
          />
          <span className="text-slate-400">—</span>
          <input
            id="price-max"
            type="number"
            inputMode="numeric"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            placeholder={priceBounds.max.toLocaleString()}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800 focus:outline-none focus:border-blue-400"
          />
        </div>
      </div>

      {hasActiveFilters && (
        <button
          id="clear-filters-btn"
          onClick={clearFilters}
          className="flex items-center justify-center gap-1.5 text-xs font-semibold text-rose-500 hover:text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-xl py-2.5 transition-colors"
        >
          <X className="w-3.5 h-3.5" /> Шүүлтийг цэвэрлэх
        </button>
      )}
    </div>
  );

  return (
    <>
      {/* Шинэ бүтээгдэхүүний showcase (зөвхөн "Бүгд" хэсэгт) */}
      {showNewArrivals && (
        <div className="border-b border-slate-100">
          <NewArrivals
            products={products}
            onSelectProduct={onSelectProduct}
            onAddToCart={onAddToCart}
          />
        </div>
      )}

      <div className="w-full max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-10">
        {/* Page heading */}
      <div className="mb-6">
        <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
          {title}
        </h2>
        <p className="text-xs text-slate-400 font-mono mt-1 uppercase tracking-widest">
          Нийт {visibleProducts.length} бараа олдлоо
        </p>
      </div>

      {/* Toolbar: mobile filter toggle + sort */}
      <div className="flex items-center justify-between gap-3 mb-6">
        <button
          id="mobile-filter-toggle"
          onClick={() => setShowFilters((v) => !v)}
          className="lg:hidden flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:border-blue-300"
        >
          <SlidersHorizontal className="w-4 h-4" />
          Шүүлт
          {hasActiveFilters && (
            <span className="h-2 w-2 rounded-full bg-blue-500" />
          )}
        </button>

        <div className="flex items-center gap-2 ml-auto">
          <ArrowUpDown className="w-4 h-4 text-slate-400 hidden sm:block" />
          <select
            id="sort-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortKey)}
            className="bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-700 focus:outline-none focus:border-blue-400 cursor-pointer"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.key} value={opt.key}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex gap-8">
        {/* Sidebar filters (desktop) */}
        <aside className="hidden lg:block w-64 flex-shrink-0">
          <div className="sticky top-28 bg-white border border-slate-200/80 rounded-2xl p-5">
            <h3 className="flex items-center gap-2 text-base font-bold text-slate-900 mb-4 pb-3 border-b border-slate-100">
              <SlidersHorizontal className="w-4 h-4 text-blue-500" /> Шүүлтүүд
            </h3>
            {FilterPanel}
          </div>
        </aside>

        {/* Mobile filter panel (collapsible) */}
        {showFilters && (
          <div className="lg:hidden fixed inset-0 z-50 bg-black/40 backdrop-blur-sm">
            <div className="absolute right-0 top-0 h-full w-80 max-w-[85vw] bg-white p-5 overflow-y-auto shadow-2xl">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                <h3 className="text-base font-bold text-slate-900">Шүүлтүүд</h3>
                <button
                  id="close-filters-btn"
                  onClick={() => setShowFilters(false)}
                  className="p-2 text-slate-400 hover:text-slate-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              {FilterPanel}
              <button
                onClick={() => setShowFilters(false)}
                className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl py-3"
              >
                {visibleProducts.length} бараа харах
              </button>
            </div>
          </div>
        )}

        {/* Product grid */}
        <div className="flex-grow">
          {visibleProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center py-24 border border-dashed border-slate-200 rounded-3xl">
              <PackageX className="w-12 h-12 text-slate-300 mb-4" />
              <h4 className="text-lg font-bold text-slate-700">
                Бараа олдсонгүй
              </h4>
              <p className="text-sm text-slate-400 mt-1">
                Шүүлтээ өөрчилж дахин оролдоно уу.
              </p>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="mt-5 px-5 py-2.5 bg-blue-50 hover:bg-blue-600 text-blue-600 hover:text-white text-sm font-semibold rounded-xl transition-colors"
                >
                  Шүүлтийг цэвэрлэх
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              <AnimatePresence mode="popLayout">
                {visibleProducts.map((product, idx) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    index={idx}
                    onSelect={onSelectProduct}
                    onAddToCart={onAddToCart}
                  />
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
      </div>
    </>
  );
}
