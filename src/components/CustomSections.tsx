import React from "react";
import { AnimatePresence } from "motion/react";
import { LayoutList } from "lucide-react";
import { Product } from "../types";
import { CustomSection } from "../store";
import ProductCard from "./ProductCard";

interface CustomSectionsProps {
  sections: CustomSection[];
  products: Product[];
  onSelectProduct: (product: Product) => void;
  onAddToCart: (product: Product) => void;
}

/** Админ самбараас үүсгэсэн home хэсгүүдийг рендэрлэнэ */
export default function CustomSections({
  sections,
  products,
  onSelectProduct,
  onAddToCart,
}: CustomSectionsProps) {
  const active = sections.filter((s) => s.enabled && s.productIds.length > 0);
  if (active.length === 0) return null;

  return (
    <>
      {active.map((section) => {
        const items = section.productIds
          .map((id) => products.find((p) => p.id === id))
          .filter((p): p is Product => Boolean(p));
        if (items.length === 0) return null;

        return (
          <section
            key={section.id}
            id={`custom-section-${section.id}`}
            className="w-full py-12 px-4 max-w-7xl mx-auto flex flex-col"
          >
            <div className="mb-8">
              <h3 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <LayoutList className="w-5 h-5 text-blue-500" />
                <span>{section.title}</span>
              </h3>
              {section.subtitle && (
                <p className="text-xs text-slate-400 font-mono tracking-widest mt-1">
                  {section.subtitle}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <AnimatePresence mode="popLayout">
                {items.map((product, idx) => (
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
          </section>
        );
      })}
    </>
  );
}
