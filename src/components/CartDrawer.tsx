import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, ShoppingBag, Trash2, Plus, Minus, CreditCard, ShoppingCart } from "lucide-react";
import { CartItem } from "../types";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQty: (productId: string, qty: number, color?: string) => void;
  onRemoveItem: (productId: string, color?: string) => void;
  onCheckout: () => void;
}

export default function CartDrawer({
  isOpen,
  onClose,
  cartItems,
  onUpdateQty,
  onRemoveItem,
  onCheckout,
}: CartDrawerProps) {
  const subtotal = cartItems.reduce(
    (acc, item) => acc + item.product.price * item.quantity,
    0
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
          />

          {/* Drawer container */}
          <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="w-screen max-w-md bg-white shadow-2xl flex flex-col h-full border-l border-slate-100"
              id="cart-drawer-container"
            >
              {/* Header */}
              <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-white">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                    <ShoppingBag className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-extrabold text-slate-900 font-display">Миний Сагс</h3>
                    <p className="text-xs text-slate-400 font-mono">
                      {cartItems.length} ТӨРЛИЙН БҮТЭЭГДЭХҮҮН
                    </p>
                  </div>
                </div>

                <button
                  id="close-cart-btn"
                  onClick={onClose}
                  className="p-2 bg-white hover:bg-slate-100 text-slate-500 hover:text-slate-900 border border-slate-200 rounded-full transition-colors duration-300"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Items List */}
              <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
                {cartItems.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center py-20 px-4">
                    <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center text-blue-500 mb-4 animate-bounce">
                      <ShoppingCart className="w-8 h-8" />
                    </div>
                    <h4 className="text-base font-bold text-slate-800">Таны сагс хоосон байна</h4>
                    <p className="text-xs text-slate-400 max-w-[250px] mt-2">
                      Танд хэрэгтэй шинэ технологийн бүтээгдэхүүнүүдийг сагсандаа нэмээрэй.
                    </p>
                    <button
                      id="cart-empty-shop-btn"
                      onClick={onClose}
                      className="mt-6 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl transition-all duration-300"
                    >
                      ХУДАЛДАН АВАЛТ ХИЙХ
                    </button>
                  </div>
                ) : (
                  cartItems.map((item) => (
                    <motion.div
                      key={`${item.product.id}-${item.selectedColor || "none"}`}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="flex gap-4 p-4 bg-white border border-slate-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300"
                    >
                      {/* Product Thumbnail */}
                      <div className="h-20 w-20 bg-white rounded-xl overflow-hidden flex items-center justify-center flex-shrink-0 border border-slate-100">
                        <img
                          src={item.product.image}
                          alt={item.product.name}
                          referrerPolicy="no-referrer"
                          className="max-h-full max-w-full object-contain p-1"
                        />
                      </div>

                      {/* Product Details & Actions */}
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-start">
                            <h4 className="text-sm font-bold text-slate-900 line-clamp-1">
                              {item.product.name}
                            </h4>
                            <button
                              id={`remove-item-${item.product.id}`}
                              onClick={() => onRemoveItem(item.product.id, item.selectedColor)}
                              className="text-slate-400 hover:text-rose-500 p-1 rounded transition-colors duration-200"
                              title="Устгах"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>

                          {item.selectedColor && (
                            <span className="text-[10px] text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md font-medium mt-1 inline-block">
                              Өнгө: {item.selectedColor}
                            </span>
                          )}
                        </div>

                        <div className="flex justify-between items-center mt-2">
                          {/* Quantity selector */}
                          <div className="flex items-center gap-1 bg-white p-0.5 rounded-lg border border-slate-200">
                            <button
                              id={`qty-minus-item-${item.product.id}`}
                              onClick={() =>
                                onUpdateQty(
                                  item.product.id,
                                  item.quantity - 1,
                                  item.selectedColor
                                )
                              }
                              className="p-1 hover:bg-slate-100 rounded transition-colors duration-300"
                              disabled={item.quantity <= 1}
                            >
                              <Minus className="w-3 h-3 text-slate-600" />
                            </button>
                            <span className="w-6 text-center text-xs font-bold text-slate-800 font-mono">
                              {item.quantity}
                            </span>
                            <button
                              id={`qty-plus-item-${item.product.id}`}
                              onClick={() =>
                                onUpdateQty(
                                  item.product.id,
                                  item.quantity + 1,
                                  item.selectedColor
                                )
                              }
                              className="p-1 hover:bg-slate-100 rounded transition-colors duration-300"
                              disabled={item.quantity >= item.product.stock}
                            >
                              <Plus className="w-3 h-3 text-slate-600" />
                            </button>
                          </div>

                          {/* Price */}
                          <span className="text-sm font-bold text-blue-600 font-mono">
                            {(item.product.price * item.quantity).toLocaleString()} ₮
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>

              {/* Subtotal & Action Footer */}
              {cartItems.length > 0 && (
                <div className="px-6 py-6 border-t border-slate-100 bg-white space-y-4">
                  <div className="flex justify-between text-slate-900">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Нийлбэр дүн</span>
                    <span className="text-xl font-black font-mono text-slate-900">
                      {subtotal.toLocaleString()} ₮
                    </span>
                  </div>

                  <p className="text-[10px] text-slate-400 text-center leading-relaxed">
                    Үнэд НӨАТ багтсан болно. Улаанбаатар хот дотор хүргэлт хийгдэнэ.
                  </p>

                  <button
                    id="cart-checkout-btn"
                    onClick={onCheckout}
                    className="w-full bg-blue-600 hover:bg-blue-500 text-white py-3.5 px-4 rounded-2xl font-bold text-sm md:text-base flex items-center justify-center gap-2 transition-all duration-300 shadow-xl shadow-blue-500/10 active:scale-95"
                  >
                    <CreditCard className="w-5 h-5" />
                    <span>Захиалга баталгаажуулах</span>
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
