import React, { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Product } from "../types";
import { matchesCategory } from "../data";
import ProductCard from "./ProductCard";

interface BottomGridProps {
  products: Product[];
  onSelectProduct: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  selectedCategory: string;
  /** Админаас сонгосон барааны id-ууд (хоосон бол ангилалаар автоматаар) */
  overrideIds?: string[];
}

export default function BottomGrid({
  products,
  onSelectProduct,
  onAddToCart,
  selectedCategory,
  overrideIds,
}: BottomGridProps) {
  // Админаас сонгосон бараа байвал тэр, эс бөгөөс ангилалаар шүүнэ
  const filteredProducts =
    overrideIds && overrideIds.length
      ? (overrideIds
          .map((id) => products.find((p) => p.id === id))
          .filter(Boolean) as Product[])
      : products.filter((p) => matchesCategory(p.category, selectedCategory));

  // We want to show exactly 4 items at a time, sliding through the filtered product set.
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(1); // 1 = дараах, -1 = өмнөх

  // If filtered products changes, reset the slide index to 0
  React.useEffect(() => {
    setCurrentIndex(0);
  }, [selectedCategory]);

  const itemsToShow = 4;
  const maxIndex = Math.max(0, filteredProducts.length - itemsToShow);

  const handleNext = () => {
    setDirection(1);
    setCurrentIndex((prev) => (prev < maxIndex ? prev + 1 : 0));
  };

  const handlePrev = () => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : maxIndex));
  };

  const visibleProducts = filteredProducts.slice(
    currentIndex,
    currentIndex + itemsToShow
  );

  // Handle case when category has fewer than 4 products - fill to keep the 4-card layout.
  // Админаас бараа сонгосон үед дүүргэхгүй — яг сонгосон барааг л харуулна.
  const hasOverride = !!(overrideIds && overrideIds.length);
  const displayProducts = [...visibleProducts];
  if (!hasOverride && displayProducts.length < itemsToShow && products.length >= itemsToShow) {
    const additional = products.filter(
      (p) => !displayProducts.some((dp) => dp.id === p.id)
    );
    while (displayProducts.length < itemsToShow && additional.length > 0) {
      displayProducts.push(additional.shift()!);
    }
  }

  return (
    <div
      id="bottom-featured-section"
      className="w-full py-12 px-4 max-w-7xl mx-auto flex flex-col"
    >
      {/* Title & Navigation controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h3 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>ОНЦЛОХ БҮТЭЭГДЭХҮҮНҮҮД</span>
            <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
          </h3>
          <p className="text-xs text-slate-400 font-mono tracking-widest mt-1">
            ХЭРЭГЛЭГЧДИЙН ТАШААЛЫГ ХҮЛЭЭСЭН ШИЛДЭГ ТЕХНОЛОГИУД
          </p>
        </div>

        {/* Carousel controls */}
        {filteredProducts.length > itemsToShow && (
          <div className="flex items-center gap-2">
            <button
              id="grid-prev-btn"
              onClick={handlePrev}
              className="p-2.5 bg-white border border-slate-200 hover:bg-blue-600 hover:border-blue-600 hover:text-white text-slate-600 rounded-xl transition-all duration-300"
              title="Өмнөх"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-mono text-slate-500 font-medium px-2">
              {currentIndex + 1} / {maxIndex + 1}
            </span>
            <button
              id="grid-next-btn"
              onClick={handleNext}
              className="p-2.5 bg-white border border-slate-200 hover:bg-blue-600 hover:border-blue-600 hover:text-white text-slate-600 rounded-xl transition-all duration-300"
              title="Дараах"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Grid container — бүхэл мөр чиглэлтэйгээр жигдхэн гулсана */}
      <div className="overflow-hidden">
        <AnimatePresence mode="popLayout" custom={direction} initial={false}>
          <motion.div
            key={currentIndex}
            custom={direction}
            variants={{
              enter: (d: number) => ({ x: d >= 0 ? 70 : -70, opacity: 0 }),
              center: { x: 0, opacity: 1 },
              exit: (d: number) => ({ x: d >= 0 ? -70 : 70, opacity: 0 }),
            }}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {displayProducts.slice(0, 4).map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                plain
                onSelect={onSelectProduct}
                onAddToCart={onAddToCart}
              />
            ))}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
