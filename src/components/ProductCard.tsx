import React, { useState } from "react";
import { motion } from "motion/react";
import { ShoppingCart, Star, Heart } from "lucide-react";
import { Product } from "../types";
import { getCategoryLabel } from "../data";

interface ProductCardProps {
  product: Product;
  index?: number;
  /** plain=true үед карт өөрөө орох/гарах анимэйшн хийхгүй (эцэг нь анимэйшн хийнэ) */
  plain?: boolean;
  onSelect: (product: Product) => void;
  onAddToCart: (product: Product) => void;
}

/** Дахин ашиглагдах барааны карт (Онцлох хэсэг ба категори хуудсанд хоёуланд нь) */
export default function ProductCard({
  product,
  index = 0,
  plain = false,
  onSelect,
  onAddToCart,
}: ProductCardProps) {
  const [wishlisted, setWishlisted] = useState(false);

  const motionProps = plain
    ? { whileHover: { y: -8, transition: { duration: 0.2 } } }
    : {
        layout: true,
        initial: { opacity: 0, y: 30, scale: 0.95 },
        animate: { opacity: 1, y: 0, scale: 1 },
        exit: { opacity: 0, scale: 0.9 },
        transition: {
          type: "spring" as const,
          stiffness: 210,
          damping: 26,
          delay: Math.min(index, 8) * 0.05,
        },
        whileHover: { y: -8, transition: { duration: 0.2 } },
      };

  return (
    <motion.div
      {...motionProps}
      onClick={() => onSelect(product)}
      className="group relative h-[380px] rounded-[28px] bg-white border border-slate-200/80 hover:border-blue-300 shadow-sm hover:shadow-xl hover:shadow-blue-500/5 cursor-pointer overflow-hidden flex flex-col justify-between p-5 transition-all duration-300 select-none"
      id={`product-card-${product.id}`}
    >
      {/* Image */}
      <div className="relative w-full h-[200px] rounded-[20px] bg-white border border-slate-100 overflow-hidden flex items-center justify-center">
        <img
          src={product.image}
          alt={product.name}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />

        {/* Rating badge */}
        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm">
          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
          <span className="text-xs font-bold text-slate-800 font-mono">
            {product.rating}
          </span>
        </div>

        {product.isNew && (
          <span className="absolute bottom-3 left-3 bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
            ШИНЭ
          </span>
        )}

        {/* Favorite */}
        <button
          id={`favorite-btn-${product.id}`}
          onClick={(e) => {
            e.stopPropagation();
            setWishlisted((v) => !v);
          }}
          className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-md hover:bg-rose-50 text-slate-400 hover:text-rose-500 rounded-full transition-colors duration-300 shadow-sm hover:scale-105"
        >
          <Heart
            className={`w-4 h-4 ${wishlisted ? "fill-rose-500 text-rose-500" : ""}`}
          />
        </button>
      </div>

      {/* Content */}
      <div className="flex flex-col flex-grow mt-4 justify-between">
        <div>
          <div className="flex justify-between items-center mb-1">
            <span className="text-[11px] font-semibold text-blue-500 uppercase tracking-widest bg-blue-50 px-2.5 py-0.5 rounded-full">
              {getCategoryLabel(product.category)}
            </span>
            {product.stock <= 5 && (
              <span className="text-[10px] text-rose-500 bg-rose-50 px-2 py-0.5 rounded-md font-medium">
                Цөөхөн үлдсэн
              </span>
            )}
          </div>

          <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mt-1">
            {product.brand}
          </p>
          <h4 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors duration-200 line-clamp-1">
            {product.name}
          </h4>

          <p className="text-xs text-slate-400 line-clamp-2 mt-1 leading-relaxed">
            {product.description}
          </p>
        </div>

        {/* Buy */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
          <div className="flex flex-col">
            {product.originalPrice && (
              <span className="text-[10px] text-slate-400 line-through">
                {product.originalPrice.toLocaleString()} ₮
              </span>
            )}
            <span className="text-base font-bold text-slate-900 font-mono group-hover:text-blue-500 transition-colors duration-300">
              {product.price.toLocaleString()} ₮
            </span>
          </div>

          <button
            id={`add-to-cart-${product.id}`}
            onClick={(e) => {
              e.stopPropagation();
              onAddToCart(product);
            }}
            className="p-2.5 bg-blue-50 hover:bg-blue-600 text-blue-600 hover:text-white rounded-xl transition-all duration-300 hover:scale-105 flex items-center gap-1 shadow-sm group-hover:shadow-md shadow-blue-500/5"
            title="Сагсанд нэмэх"
          >
            <ShoppingCart className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
