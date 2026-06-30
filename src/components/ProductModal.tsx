import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Star, ShieldCheck, Truck, RefreshCw, ShoppingCart, Minus, Plus } from "lucide-react";
import { Product } from "../types";
import { getCategoryLabel } from "../data";

interface ProductModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (product: Product, quantity: number, color?: string) => void;
}

export default function ProductModal({
  product,
  onClose,
  onAddToCart,
}: ProductModalProps) {
  if (!product) return null;

  const [selectedColor, setSelectedColor] = useState(
    product.colors && product.colors.length > 0 ? product.colors[0] : undefined
  );
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<"desc" | "specs">("desc");

  const incrementQty = () => {
    if (quantity < product.stock) {
      setQuantity((q) => q + 1);
    }
  };

  const decrementQty = () => {
    if (quantity > 1) {
      setQuantity((q) => q - 1);
    }
  };

  const handleAddToCart = () => {
    onAddToCart(product, quantity, selectedColor);
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
        {/* Backdrop overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm"
        />

        {/* Modal Content */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: "spring", stiffness: 200, damping: 22 }}
          className="relative bg-white text-slate-900 rounded-[32px] w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl z-10 border border-slate-100 flex flex-col md:flex-row"
          id="product-detail-modal"
        >
          {/* Close Button */}
          <button
            id="close-modal-btn"
            onClick={onClose}
            className="absolute top-5 right-5 p-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-500 hover:text-slate-900 rounded-full transition-colors duration-300 z-20"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Left Side: Dynamic Gallery & Specs Preview */}
          <div className="w-full md:w-1/2 p-6 md:p-10 bg-white flex flex-col justify-center items-center border-r border-slate-100">
            <motion.div
              layoutId={`modal-img-container-${product.id}`}
              className="relative w-full h-[280px] md:h-[350px] rounded-[24px] bg-white border border-slate-100 overflow-hidden flex items-center justify-center shadow-inner"
            >
              <img
                src={product.image}
                alt={product.name}
                referrerPolicy="no-referrer"
                className="max-h-full max-w-full object-contain p-4 transition-transform duration-500 hover:scale-105"
              />

              {/* Tag overlay */}
              {product.isNew && (
                <span className="absolute top-4 left-4 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-md">
                  Шинэ Загвар
                </span>
              )}
            </motion.div>

            {/* Micro badges below image */}
            <div className="grid grid-cols-3 gap-3 w-full mt-6">
              <div className="flex flex-col items-center p-2.5 bg-white border border-slate-100 rounded-2xl text-center">
                <ShieldCheck className="w-5 h-5 text-blue-600 mb-1" />
                <span className="text-[10px] font-bold text-slate-800">1 ЖИЛ</span>
                <span className="text-[8px] text-slate-400">Баталгаат хугацаа</span>
              </div>
              <div className="flex flex-col items-center p-2.5 bg-white border border-slate-100 rounded-2xl text-center">
                <Truck className="w-5 h-5 text-blue-600 mb-1" />
                <span className="text-[10px] font-bold text-slate-800">ҮГҮЙ</span>
                <span className="text-[8px] text-slate-400">Хүргэлт үнэгүй</span>
              </div>
              <div className="flex flex-col items-center p-2.5 bg-white border border-slate-100 rounded-2xl text-center">
                <RefreshCw className="w-5 h-5 text-blue-600 mb-1" />
                <span className="text-[10px] font-bold text-slate-800">7 ХОНОГ</span>
                <span className="text-[8px] text-slate-400">Буцаах нөхцөл</span>
              </div>
            </div>
          </div>

          {/* Right Side: Product Customization & Ordering */}
          <div className="w-full md:w-1/2 p-6 md:p-10 flex flex-col justify-between">
            <div>
              {/* Category Breadcrumb */}
              <span className="text-xs font-extrabold text-blue-600 uppercase tracking-widest">
                {getCategoryLabel(product.category)}
              </span>

              <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight mt-1 leading-tight">
                {product.name}
              </h2>

              {/* Rating & Review counts */}
              <div className="flex items-center gap-2 mt-2">
                <div className="flex items-center text-amber-400">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span className="text-sm font-bold text-slate-800 ml-1 font-mono">
                    {product.rating}
                  </span>
                </div>
                <span className="text-slate-300">|</span>
                <span className="text-xs text-emerald-600 font-semibold bg-emerald-50 px-2.5 py-0.5 rounded-full">
                  Агуулахад бэлэн ({product.stock} ш)
                </span>
              </div>

              {/* Prices block */}
              <div className="flex items-baseline gap-3 mt-4">
                <span className="text-2xl md:text-3xl font-black text-slate-900 font-mono">
                  {product.price.toLocaleString()} ₮
                </span>
                {product.originalPrice && (
                  <span className="text-sm md:text-base text-slate-400 line-through font-mono">
                    {product.originalPrice.toLocaleString()} ₮
                  </span>
                )}
              </div>

              {/* Tabs for Description & Specs */}
              <div className="flex border-b border-slate-100 mt-6 mb-4">
                <button
                  id="tab-desc"
                  onClick={() => setActiveTab("desc")}
                  className={`pb-2 px-4 text-xs md:text-sm font-bold border-b-2 transition-all duration-300 ${
                    activeTab === "desc"
                      ? "border-blue-600 text-blue-600"
                      : "border-transparent text-slate-400 hover:text-slate-600"
                  }`}
                >
                  Танилцуулга
                </button>
                <button
                  id="tab-specs"
                  onClick={() => setActiveTab("specs")}
                  className={`pb-2 px-4 text-xs md:text-sm font-bold border-b-2 transition-all duration-300 ${
                    activeTab === "specs"
                      ? "border-blue-600 text-blue-600"
                      : "border-transparent text-slate-400 hover:text-slate-600"
                  }`}
                >
                  Үзүүлэлтүүд
                </button>
              </div>

              {/* Tab Contents */}
              <div className="min-h-[100px] text-xs md:text-sm text-slate-600 leading-relaxed">
                {activeTab === "desc" ? (
                  <div className="space-y-3">
                    <p>{product.description}</p>
                    {product.features && (
                      <ul className="list-disc pl-5 space-y-1 text-slate-500 mt-2">
                        {product.features.map((feat, i) => (
                          <li key={i}>{feat}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-2 bg-white p-4 rounded-2xl border border-slate-200 font-sans">
                    {Object.entries(product.specs).map(([key, value]) => (
                      <div key={key} className="flex justify-between py-1 border-b border-slate-100 last:border-0">
                        <span className="font-semibold text-slate-500">{key}</span>
                        <span className="text-slate-900 font-medium text-right">{value}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Color Customizer Selection */}
              {product.colors && product.colors.length > 0 && (
                <div className="mt-6">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">
                    Өнгө сонгох: <span className="text-slate-900">{selectedColor}</span>
                  </span>
                  <div className="flex gap-2.5">
                    {product.colors.map((color) => {
                      const isSelected = selectedColor === color;
                      return (
                        <button
                          key={color}
                          id={`color-selector-${color}`}
                          onClick={() => setSelectedColor(color)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all duration-300 ${
                            isSelected
                              ? "bg-slate-950 text-white border-slate-950 shadow-md scale-105"
                              : "bg-white text-slate-600 border-slate-200 hover:border-slate-400"
                          }`}
                        >
                          {color}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Ordering Options */}
            <div className="mt-8 pt-6 border-t border-slate-100">
              <div className="flex items-center justify-between gap-4 mb-4">
                <div className="flex flex-col">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Тоо ширхэг</span>
                  <div className="flex items-center gap-1 mt-1 bg-white p-1 rounded-xl border border-slate-200">
                    <button
                      id="qty-minus"
                      onClick={decrementQty}
                      className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors duration-300"
                      disabled={quantity <= 1}
                    >
                      <Minus className="w-3.5 h-3.5 text-slate-600" />
                    </button>
                    <span className="w-8 text-center text-sm font-bold text-slate-800 font-mono">
                      {quantity}
                    </span>
                    <button
                      id="qty-plus"
                      onClick={incrementQty}
                      className="p-1.5 hover:bg-white rounded-lg transition-colors duration-300"
                      disabled={quantity >= product.stock}
                    >
                      <Plus className="w-3.5 h-3.5 text-slate-600" />
                    </button>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Нийлбэр үнэ</span>
                  <p className="text-xl md:text-2xl font-black text-blue-600 font-mono mt-1">
                    {(product.price * quantity).toLocaleString()} ₮
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  id="modal-add-to-cart-btn"
                  onClick={handleAddToCart}
                  className="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-3.5 px-6 rounded-2xl font-bold text-sm md:text-base flex items-center justify-center gap-2 transition-all duration-300 shadow-xl shadow-blue-500/20 active:scale-95"
                >
                  <ShoppingCart className="w-5 h-5" />
                  <span>Сагсанд нэмэх</span>
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
