import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronLeft, ChevronRight, Eye, ShoppingCart, Star } from "lucide-react";
import { Product } from "../types";
import { getCategoryLabel } from "../data";
import { HeroSlide } from "../store";

interface HeroSliderProps {
  products: Product[];
  brands: string[];
  /** Админаас upload хийсэн hero slide-ууд (хоосон бол isNew бараанууд) */
  slides?: HeroSlide[];
  onSelectProduct: (product: Product) => void;
  onAddToCart: (product: Product) => void;
}

/** Deck-д харуулах нэгж — slide эсвэл бараанаас үүснэ */
type DeckItem = {
  id: string;
  image: string;
  title: string;
  subtitle: string;
  product?: Product;
};

/** Брэндийн нэрээс лого slug гаргана */
const brandSlug = (name: string) => name.toLowerCase().replace(/[^a-z0-9]/g, "");

/** Лого хайх эх сурвалжууд (эхнийх нь алдвал дараагийнх руу шилжинэ) */
const logoSources = (name: string) => {
  const slug = brandSlug(name);
  return [
    `https://cdn.simpleicons.org/${slug}`,
    `https://logo.clearbit.com/${slug}.com`,
  ];
};

/** Брэндийг лого + нэрээр loop дотор харуулна (лого олдохгүй бол зөвхөн нэр) */
function BrandPill({ name }: { name: string }) {
  const sources = logoSources(name);
  const [stage, setStage] = useState(0);
  const hasLogo = stage < sources.length;
  return (
    <div className="flex items-center justify-center gap-2.5 bg-white border border-slate-200 rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.03)] px-7 py-4 h-16 md:h-20 min-w-[150px] md:min-w-[200px] hover:border-blue-500 hover:shadow-md hover:scale-[1.02] transition-all duration-300 cursor-pointer">
      {hasLogo && (
        <img
          key={stage}
          src={sources[stage]}
          alt={name}
          referrerPolicy="no-referrer"
          onError={() => setStage((s) => s + 1)}
          className="h-6 md:h-8 w-auto max-w-[48px] object-contain"
        />
      )}
      <span className="text-slate-800 font-black tracking-wide text-sm md:text-base uppercase select-none whitespace-nowrap">
        {name}
      </span>
    </div>
  );
}

export default function HeroSlider({
  products,
  brands,
  slides,
  onSelectProduct,
  onAddToCart,
}: HeroSliderProps) {
  // Админаас upload хийсэн slide байвал тэр, эс бөгөөс эхний 5 шинэ бараа
  const deckItems: DeckItem[] =
    slides && slides.length
      ? slides.slice(0, 6).map((s) => ({
          id: s.id,
          image: s.image,
          title: s.title,
          subtitle: s.subtitle,
        }))
      : products
          .filter((p) => p.isNew)
          .slice(0, 5)
          .map((p) => ({
            id: p.id,
            image: p.image,
            title: p.name,
            subtitle: getCategoryLabel(p.category),
            product: p,
          }));
  const [activeIndex, setActiveIndex] = useState(2); // Start with center (index 2)

  // Сонголт өөрчлөгдөж индекс хүрээнээс хальбал тохируулна
  React.useEffect(() => {
    if (activeIndex > deckItems.length - 1) {
      setActiveIndex(Math.max(0, Math.floor((deckItems.length - 1) / 2)));
    }
  }, [deckItems.length, activeIndex]);

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % deckItems.length);
  };

  const handlePrev = () => {
    setActiveIndex(
      (prev) => (prev - 1 + deckItems.length) % deckItems.length
    );
  };

  const handleCardClick = (index: number) => {
    setActiveIndex(index);
  };

  // Helper to determine position relative to active index
  const getCardStyle = (index: number) => {
    const len = deckItems.length;
    // Calculate shortest distance in a circular array
    let diff = index - activeIndex;
    if (diff < -2) diff += len;
    if (diff > 2) diff -= len;

    // Define positioning, scaling, rotation, and colors matching the user diagram:
    // User diagram has: Center (Light Blue), Left (Red), Far Left (Pink), Right (Red), Far Right (Pink)
    if (diff === 0) {
      return {
        x: "0%",
        scale: 1.05,
        zIndex: 40,
        opacity: 1,
        rotateY: 0,
        // Active/Center: Light Blue theme
        glowColor: "rgba(59, 130, 246, 0.45)",
        borderColor: "border-blue-400/90",
        shadowColor: "shadow-blue-500/40",
      };
    } else if (diff === 1) {
      return {
        x: "48%",
        scale: 0.88,
        zIndex: 30,
        opacity: 0.85,
        rotateY: -15,
        // Right: Red theme
        glowColor: "rgba(239, 68, 68, 0.35)",
        borderColor: "border-red-400/50",
        shadowColor: "shadow-red-500/20",
      };
    } else if (diff === 2) {
      return {
        x: "90%",
        scale: 0.72,
        zIndex: 20,
        opacity: 0.55,
        rotateY: -30,
        // Far Right: Pink/Magenta theme
        glowColor: "rgba(236, 72, 153, 0.3)",
        borderColor: "border-pink-400/40",
        shadowColor: "shadow-pink-500/15",
      };
    } else if (diff === -1) {
      return {
        x: "-48%",
        scale: 0.88,
        zIndex: 30,
        opacity: 0.85,
        rotateY: 15,
        // Left: Red theme
        glowColor: "rgba(239, 68, 68, 0.35)",
        borderColor: "border-red-400/50",
        shadowColor: "shadow-red-500/20",
      };
    } else if (diff === -2) {
      return {
        x: "-90%",
        scale: 0.72,
        zIndex: 20,
        opacity: 0.55,
        rotateY: 30,
        // Far Left: Pink/Magenta theme
        glowColor: "rgba(236, 72, 153, 0.3)",
        borderColor: "border-pink-400/40",
        shadowColor: "shadow-pink-500/15",
      };
    }

    return {
      x: "100%",
      scale: 0.5,
      zIndex: 0,
      opacity: 0,
      rotateY: 0,
      glowColor: "transparent",
      borderColor: "border-transparent",
      shadowColor: "shadow-none",
    };
  };

  return (
    <div id="hero-slider-section" className="relative w-full pt-1 pb-8 overflow-hidden flex flex-col items-center">
      {/* Background Soft Glow Effect */}
      <div className="absolute inset-0 pointer-events-none flex justify-center items-center">
        <motion.div
          animate={{
            backgroundColor:
              activeIndex === 2
                ? "rgba(59, 130, 246, 0.08)"
                : activeIndex === 1 || activeIndex === 3
                ? "rgba(239, 68, 68, 0.05)"
                : "rgba(236, 72, 153, 0.05)",
          }}
          transition={{ duration: 0.5 }}
          className="w-[600px] h-[350px] rounded-full blur-[100px]"
        />
      </div>

      {/* 3D Cards Container */}
      <div className="relative w-full max-w-7xl h-[390px] md:h-[430px] flex justify-center items-center px-4 perspective-[1400px]">
        {deckItems.map((item, idx) => {
          const style = getCardStyle(idx);
          const isActive = idx === activeIndex;

          return (
            <motion.div
              key={item.id}
              id={`deck-card-${item.id}`}
              onClick={() => handleCardClick(idx)}
              animate={{
                x: style.x,
                scale: style.scale,
                zIndex: style.zIndex,
                opacity: style.opacity,
                rotateY: style.rotateY,
              }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className={`absolute w-[280px] md:w-[480px] h-[280px] md:h-[340px] rounded-[36px] cursor-pointer overflow-hidden border-2 ${style.borderColor} bg-slate-900/90 shadow-2xl ${style.shadowColor} select-none transition-all duration-300`}
              style={{
                boxShadow: `0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 40px ${style.glowColor}`,
                transformStyle: "preserve-3d",
              }}
              whileHover={
                isActive
                  ? {
                      scale: 1.08,
                      y: -5,
                      transition: { duration: 0.2 },
                    }
                  : {}
              }
            >
              {/* Product Card Image/Content */}
              <div className="relative w-full h-full flex flex-col justify-end p-6 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent">
                {/* Visual Accent corresponding to diagram */}
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-500 hover:scale-105"
                  style={{ backgroundImage: `url(${item.image})` }}
                />
                
                {/* Gradient shade overlays */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent pointer-events-none" />

                {/* Tags & Branding inside the card */}
                <div className="absolute top-4 left-4 flex gap-2">
                  {item.product?.isNew && (
                    <span className="px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-white bg-blue-600/80 backdrop-blur-md rounded-full">
                      ШИНЭ
                    </span>
                  )}
                  {item.product?.colors && (
                    <span className="px-2 py-1 text-[10px] font-mono text-slate-300 bg-slate-800/80 backdrop-blur-md rounded-md">
                      {item.product.colors.length} өнгө
                    </span>
                  )}
                </div>

                {/* Info Overlay (Only fully visible or styled on Active) */}
                <div className="relative z-10 transition-opacity duration-300">
                  {item.subtitle && (
                    <p className="text-xs font-semibold tracking-wider text-blue-400 mb-1">
                      {item.subtitle}
                    </p>
                  )}
                  <h3 className="text-lg md:text-2xl font-bold text-white tracking-tight leading-tight line-clamp-1 mb-2">
                    {item.title}
                  </h3>

                  {isActive && item.product && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      className="flex items-center justify-between mt-2 pt-2 border-t border-slate-800/60"
                    >
                      <div className="flex flex-col">
                        <span className="text-xs text-slate-400 line-through">
                          {item.product.originalPrice?.toLocaleString()} ₮
                        </span>
                        <span className="text-sm md:text-lg font-bold text-blue-400 font-mono">
                          {item.product.price.toLocaleString()} ₮
                        </span>
                      </div>

                      <div className="flex gap-2">
                        <button
                          id={`quick-view-${item.product.id}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectProduct(item.product!);
                          }}
                          className="p-2 bg-slate-800 hover:bg-blue-600 text-white rounded-xl transition-all duration-300 hover:scale-105"
                          title="Дэлгэрэнгүй харах"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          id={`quick-add-${item.product.id}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            onAddToCart(item.product!);
                          }}
                          className="p-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-all duration-300 hover:scale-105 shadow-lg shadow-blue-500/20"
                          title="Сагсанд нэмэх"
                        >
                          <ShoppingCart className="w-4 h-4" />
                        </button>
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Navigation Arrows */}
      <div className="flex items-center gap-6 mt-4 z-10">
        <button
          id="hero-prev-btn"
          onClick={handlePrev}
          className="p-3 bg-slate-900/60 hover:bg-blue-600/90 border border-slate-800 hover:border-blue-400 text-slate-300 hover:text-white rounded-full backdrop-blur-md transition-all duration-300"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        {/* Dynamic dots index indicator */}
        <div className="flex items-center gap-2">
          {deckItems.map((_, idx) => (
            <button
              key={idx}
              id={`hero-dot-${idx}`}
              onClick={() => setActiveIndex(idx)}
              className={`h-2 rounded-full transition-all duration-500 ${
                idx === activeIndex
                  ? "w-8 bg-blue-500"
                  : "w-2 bg-slate-700 hover:bg-slate-500"
              }`}
            />
          ))}
        </div>

        <button
          id="hero-next-btn"
          onClick={handleNext}
          className="p-3 bg-slate-900/60 hover:bg-blue-600/90 border border-slate-800 hover:border-blue-400 text-slate-300 hover:text-white rounded-full backdrop-blur-md transition-all duration-300"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Brand Marquee Scrolling Tickers (Double Rows like user image) */}
      <div className="w-full flex flex-col gap-4 py-8 bg-slate-50/40 border-y border-slate-100 mt-10 mb-2 relative overflow-hidden select-none">
        {/* Soft fading edges overlay */}
        <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-white via-white/50 to-transparent z-10 pointer-events-none" />
        <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-white via-white/50 to-transparent z-10 pointer-events-none" />
        
        {/* Row 1: Scrolling Left */}
        <div className="w-full overflow-hidden flex">
          <motion.div
            className="flex gap-4 whitespace-nowrap items-center"
            animate={{ x: [0, -1000] }}
            transition={{
              ease: "linear",
              duration: 35,
              repeat: Infinity,
            }}
          >
            {Array.from({ length: 8 })
              .flatMap(() => brands)
              .map((brand, index) => (
                <BrandPill key={`r1-${index}`} name={brand} />
              ))}
          </motion.div>
        </div>

        {/* Row 2: Scrolling Right */}
        <div className="w-full overflow-hidden flex">
          <motion.div
            className="flex gap-4 whitespace-nowrap items-center"
            animate={{ x: [-1000, 0] }}
            transition={{
              ease: "linear",
              duration: 35,
              repeat: Infinity,
            }}
          >
            {Array.from({ length: 8 })
              .flatMap(() => [...brands].reverse())
              .map((brand, index) => (
                <BrandPill key={`r2-${index}`} name={brand} />
              ))}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
