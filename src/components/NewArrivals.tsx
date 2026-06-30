import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, ShoppingCart, ArrowRight, Star } from "lucide-react";
import { Product } from "../types";
import { getCategoryLabel } from "../data";

interface NewArrivalsProps {
  products: Product[];
  /** Админаас сонгосон барааны id-ууд (хоосон бол isNew автоматаар) */
  overrideIds?: string[];
  onSelectProduct: (product: Product) => void;
  onAddToCart: (product: Product) => void;
}

export default function NewArrivals({
  products,
  overrideIds,
  onSelectProduct,
  onAddToCart,
}: NewArrivalsProps) {
  // Админаас сонгосон бараа байвал тэр, эс бөгөөс "шинэ" тэмдэгтэй бараанууд
  const newProducts =
    overrideIds && overrideIds.length
      ? (overrideIds
          .map((id) => products.find((p) => p.id === id))
          .filter(Boolean) as Product[])
      : products.filter((p) => p.isNew);

  // Идэвхтэй (preview дээр харагдаж буй) барааны id
  const [activeId, setActiveId] = useState<string | null>(
    newProducts[0]?.id ?? null
  );

  // Бараа жагсаалт өөрчлөгдвөл идэвхтэй сонголтыг шинэчилнэ
  useEffect(() => {
    if (!newProducts.some((p) => p.id === activeId)) {
      setActiveId(newProducts[0]?.id ?? null);
    }
  }, [newProducts, activeId]);

  if (newProducts.length === 0) return null;

  const activeProduct =
    newProducts.find((p) => p.id === activeId) ?? newProducts[0];

  const discount = activeProduct.originalPrice
    ? Math.round(
        ((activeProduct.originalPrice - activeProduct.price) /
          activeProduct.originalPrice) *
          100
      )
    : 0;

  return (
    <section
      id="new-arrivals-section"
      className="w-full py-12 px-4 max-w-7xl mx-auto flex flex-col"
    >
      {/* Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h3 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-500" />
            <span>ШИНЭ БҮТЭЭГДЭХҮҮН</span>
          </h3>
          <p className="text-xs text-slate-400 font-mono tracking-widest mt-1">
            ДӨНГӨЖ ИРСЭН ШИНЭ БАРААНУУДЫГ СОНГОЖ ҮЗЭЭРЭЙ
          </p>
        </div>
        <span className="text-xs font-mono text-slate-500 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-full">
          Нийт {newProducts.length} шинэ бараа
        </span>
      </div>

      {/* Main preview panel — selected new product */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10 items-stretch bg-white border border-slate-200/80 rounded-[28px] p-5 md:p-8 shadow-sm">
        {/* Image side */}
        <div className="relative w-full h-[260px] md:h-[360px] rounded-[20px] bg-slate-50 border border-slate-100 overflow-hidden flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.img
              key={activeProduct.id}
              src={activeProduct.image}
              alt={activeProduct.name}
              referrerPolicy="no-referrer"
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.35 }}
              className="absolute inset-0 w-full h-full object-cover"
            />
          </AnimatePresence>

          {/* New badge */}
          <span className="absolute top-4 left-4 z-10 flex items-center gap-1 bg-blue-600 text-white text-[11px] font-bold px-3 py-1.5 rounded-full shadow-lg shadow-blue-500/20">
            <Sparkles className="w-3.5 h-3.5" />
            ШИНЭ
          </span>

          {discount > 0 && (
            <span className="absolute top-4 right-4 z-10 bg-rose-500 text-white text-[11px] font-extrabold px-3 py-1.5 rounded-full shadow-lg">
              -{discount}%
            </span>
          )}
        </div>

        {/* Info side */}
        <div className="flex flex-col justify-between">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeProduct.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[11px] font-semibold text-blue-500 uppercase tracking-widest bg-blue-50 px-2.5 py-0.5 rounded-full">
                  {getCategoryLabel(activeProduct.category)}
                </span>
                <div className="flex items-center gap-1 text-amber-400">
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  <span className="text-xs font-bold text-slate-700 font-mono">
                    {activeProduct.rating}
                  </span>
                </div>
              </div>

              <h4 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
                {activeProduct.name}
              </h4>

              <p className="text-sm text-slate-500 mt-3 leading-relaxed line-clamp-3">
                {activeProduct.description}
              </p>

              {/* Price */}
              <div className="flex items-end gap-3 mt-5">
                <span className="text-2xl md:text-3xl font-extrabold text-blue-600 font-mono">
                  {activeProduct.price.toLocaleString()} ₮
                </span>
                {activeProduct.originalPrice && (
                  <span className="text-sm text-slate-400 line-through mb-1 font-mono">
                    {activeProduct.originalPrice.toLocaleString()} ₮
                  </span>
                )}
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Actions */}
          <div className="flex items-center gap-3 mt-6">
            <button
              id={`new-detail-btn-${activeProduct.id}`}
              onClick={() => onSelectProduct(activeProduct)}
              className="flex-1 flex items-center justify-center gap-2 px-5 py-3.5 bg-slate-900 hover:bg-blue-600 text-white text-sm font-bold rounded-2xl transition-all duration-300 hover:scale-[1.02] shadow-lg shadow-slate-900/10"
            >
              Дэлгэрэнгүй харах
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              id={`new-cart-btn-${activeProduct.id}`}
              onClick={() => onAddToCart(activeProduct)}
              className="flex items-center justify-center gap-2 px-5 py-3.5 bg-blue-50 hover:bg-blue-600 text-blue-600 hover:text-white text-sm font-bold rounded-2xl transition-all duration-300 hover:scale-[1.02]"
              title="Сагсанд нэмэх"
            >
              <ShoppingCart className="w-4 h-4" />
              <span className="hidden sm:inline">Сагслах</span>
            </button>
          </div>
        </div>
      </div>

      {/* Thumbnail selector — choose which new product to preview next */}
      <div className="mt-6">
        <p className="text-[11px] text-slate-400 font-mono uppercase tracking-widest mb-3">
          Дараагийн бараагаа сонгоно уу
        </p>
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
          {newProducts.map((product) => {
            const isActive = product.id === activeProduct.id;
            return (
              <button
                key={product.id}
                id={`new-thumb-${product.id}`}
                onClick={() => setActiveId(product.id)}
                className={`group flex-shrink-0 w-36 md:w-44 text-left rounded-2xl border p-2.5 transition-all duration-300 ${
                  isActive
                    ? "border-blue-500 bg-blue-50/60 shadow-lg shadow-blue-500/10 scale-[1.02]"
                    : "border-slate-200 bg-white hover:border-blue-300 hover:bg-slate-50"
                }`}
              >
                <div className="relative w-full h-20 md:h-24 rounded-xl bg-slate-50 border border-slate-100 overflow-hidden">
                  <img
                    src={product.image}
                    alt={product.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                </div>
                <p
                  className={`text-xs font-bold mt-2 line-clamp-1 ${
                    isActive ? "text-blue-600" : "text-slate-800"
                  }`}
                >
                  {product.name}
                </p>
                <p className="text-xs text-slate-500 font-mono mt-0.5">
                  {product.price.toLocaleString()} ₮
                </p>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
