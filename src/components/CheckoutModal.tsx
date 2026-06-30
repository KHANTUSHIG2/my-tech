import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, CheckCircle2, ChevronRight, ShoppingBag, CreditCard, Landmark, Coins } from "lucide-react";
import { CartItem } from "../types";
import { addOrder } from "../store";
import { supabase } from "../lib/supabase";

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onClearCart: () => void;
}

export default function CheckoutModal({
  isOpen,
  onClose,
  cartItems,
  onClearCart,
}: CheckoutModalProps) {
  const [step, setStep] = useState<"form" | "success">("form");
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    district: "Bayanzurkh",
    address: "",
    payment: "qpay",
  });

  const subtotal = cartItems.reduce(
    (acc, item) => acc + item.product.price * item.quantity,
    0
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.phone || !formData.address) {
      alert("Бүх талбарыг бөглөнө үү!");
      return;
    }
    const orderItems = cartItems.map((item) => ({
      id: item.product.id,
      name: item.product.name,
      price: item.product.price,
      quantity: item.quantity,
    }));
    // Save to localStorage
    const order = addOrder({
      customer: {
        fullName: formData.fullName,
        phone: formData.phone,
        district: formData.district,
        address: formData.address,
      },
      payment: formData.payment,
      items: orderItems,
      total: subtotal,
    });
    // Also save to Supabase (silently ignore if schema not set up yet)
    const { data: { user } } = await supabase.auth.getUser();
    supabase.from("orders").insert({
      id: order.id,
      customer_full_name: formData.fullName,
      customer_phone: formData.phone,
      customer_district: formData.district,
      customer_address: formData.address,
      payment: formData.payment,
      items: orderItems,
      total: subtotal,
      status: "new",
      user_id: user?.id ?? null,
    }).then(() => {});
    setStep("success");
  };

  const handleSuccessClose = () => {
    onClearCart();
    setStep("form");
    onClose();
  };

  const districtNames: Record<string, string> = {
    Bayanzurkh: "Баянзүрх дүүрэг",
    Sukhbaatar: "Сүхбаатар дүүрэг",
    Chingeltei: "Чингэлтэй дүүрэг",
    Bayangol: "Баянгол дүүрэг",
    KhanUul: "Хан-Уул дүүрэг",
    Songinokhairkhan: "Сонгинохайрхан дүүрэг",
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
          {/* Backdrop overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={step === "form" ? onClose : undefined}
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", stiffness: 220, damping: 24 }}
            className="relative bg-white text-slate-900 rounded-[32px] w-full max-w-2xl overflow-hidden shadow-2xl z-10 border border-slate-100 flex flex-col"
            id="checkout-modal-container"
          >
            {/* Close Button (only on form step) */}
            {step === "form" && (
              <button
                id="close-checkout-btn"
                onClick={onClose}
                className="absolute top-5 right-5 p-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-500 hover:text-slate-900 rounded-full transition-colors duration-300 z-20"
              >
                <X className="w-5 h-5" />
              </button>
            )}

            {step === "form" ? (
              <form onSubmit={handleSubmit} className="flex flex-col h-full">
                {/* Header */}
                <div className="p-6 md:p-8 bg-white border-b border-slate-100 flex items-center gap-3">
                  <div className="h-10 w-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shadow-md">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xl font-extrabold text-slate-900 font-display">Захиалга баталгаажуулах</h3>
                    <p className="text-xs text-slate-400 font-mono">ТА МЭДЭЭЛЛЭЭ БҮРЭН ЗӨВ БӨГЛӨНӨ ҮҮ</p>
                  </div>
                </div>

                {/* Form Elements */}
                <div className="p-6 md:p-8 space-y-6 max-h-[60vh] overflow-y-auto">
                  {/* Order Summary banner */}
                  <div className="p-4 bg-blue-50/50 border border-blue-100/50 rounded-2xl flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <ShoppingBag className="w-4 h-4 text-blue-600" />
                      <span className="text-xs font-bold text-slate-700 font-mono">
                        {cartItems.length} нэр төрлийн бараа
                      </span>
                    </div>
                    <span className="text-base font-black text-blue-600 font-mono">
                      {subtotal.toLocaleString()} ₮
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* Full Name */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Хүлээн авагчийн нэр *
                      </label>
                      <input
                        id="checkout-name"
                        type="text"
                        required
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        className="w-full px-4 py-3 bg-white border border-slate-200 focus:border-blue-500 rounded-xl text-sm focus:outline-none font-medium transition-colors duration-200"
                        placeholder="Бат-Эрдэнэ"
                      />
                    </div>

                    {/* Phone Number */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Утасны дугаар *
                      </label>
                      <input
                        id="checkout-phone"
                        type="tel"
                        required
                        pattern="[0-9]{8}"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full px-4 py-3 bg-white border border-slate-200 focus:border-blue-500 rounded-xl text-sm focus:outline-none font-semibold transition-colors duration-200 font-mono"
                        placeholder="99112233"
                      />
                      <span className="text-[10px] text-slate-400">8 оронтой тоо оруулна уу</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* District Selector */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Хүргүүлэх дүүрэг *
                      </label>
                      <select
                        id="checkout-district"
                        value={formData.district}
                        onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                        className="w-full px-4 py-3 bg-white border border-slate-200 focus:border-blue-500 rounded-xl text-sm focus:outline-none font-medium transition-colors duration-200"
                      >
                        <option value="Bayanzurkh">Баянзүрх дүүрэг</option>
                        <option value="Sukhbaatar">Сүхбаатар дүүрэг</option>
                        <option value="Chingeltei">Чингэлтэй дүүрэг</option>
                        <option value="Bayangol">Баянгол дүүрэг</option>
                        <option value="KhanUul">Хан-Уул дүүрэг</option>
                        <option value="Songinokhairkhan">Сонгинохайрхан дүүрэг</option>
                      </select>
                    </div>

                    {/* Detail Address */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Дэлгэрэнгүй хаяг *
                      </label>
                      <input
                        id="checkout-address"
                        type="text"
                        required
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        className="w-full px-4 py-3 bg-white border border-slate-200 focus:border-blue-500 rounded-xl text-sm focus:outline-none font-medium transition-colors duration-200"
                        placeholder="13-р хороолол, 25-р байр, 44 тоот"
                      />
                    </div>
                  </div>

                  {/* Payment Method Selector */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                      Төлбөрийн хэрэгсэл *
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {/* QPay */}
                      <button
                        type="button"
                        id="pay-qpay"
                        onClick={() => setFormData({ ...formData, payment: "qpay" })}
                        className={`flex flex-col items-center p-3 rounded-2xl border transition-all duration-300 ${
                          formData.payment === "qpay"
                            ? "bg-blue-50 border-blue-500 text-blue-600 font-bold scale-[1.02]"
                            : "bg-white border-slate-200 hover:border-slate-300 text-slate-600"
                        }`}
                      >
                        <Coins className="w-5 h-5 mb-1" />
                        <span className="text-xs">QPay</span>
                      </button>

                      {/* Bank Transfer */}
                      <button
                        type="button"
                        id="pay-bank"
                        onClick={() => setFormData({ ...formData, payment: "bank" })}
                        className={`flex flex-col items-center p-3 rounded-2xl border transition-all duration-300 ${
                          formData.payment === "bank"
                            ? "bg-blue-50 border-blue-500 text-blue-600 font-bold scale-[1.02]"
                            : "bg-white border-slate-200 hover:border-slate-300 text-slate-600"
                        }`}
                      >
                        <Landmark className="w-5 h-5 mb-1" />
                        <span className="text-xs">Дансаар</span>
                      </button>

                      {/* Cash on delivery */}
                      <button
                        type="button"
                        id="pay-cash"
                        onClick={() => setFormData({ ...formData, payment: "cash" })}
                        className={`flex flex-col items-center p-3 rounded-2xl border transition-all duration-300 ${
                          formData.payment === "cash"
                            ? "bg-blue-50 border-blue-500 text-blue-600 font-bold scale-[1.02]"
                            : "bg-white border-slate-200 hover:border-slate-300 text-slate-600"
                        }`}
                      >
                        <CheckCircle2 className="w-5 h-5 mb-1" />
                        <span className="text-xs">Хүргэлтээр</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Footer buttons */}
                <div className="p-6 md:p-8 border-t border-slate-100 bg-white flex items-center justify-between gap-4">
                  <span className="text-xs text-slate-400 leading-relaxed font-sans max-w-[280px]">
                    "Илгээх" дарснаар таны захиалга манай арын системд бүртгэгдэнэ.
                  </span>

                  <button
                    type="submit"
                    id="submit-order-btn"
                    className="bg-blue-600 hover:bg-blue-500 text-white py-3 px-6 rounded-2xl font-bold text-sm md:text-base flex items-center justify-center gap-1.5 transition-all duration-300 shadow-xl shadow-blue-500/20 active:scale-95"
                  >
                    <span>Захиалга илгээх</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </form>
            ) : (
              // Success Screen View
              <div className="p-8 md:p-12 text-center flex flex-col items-center">
                <motion.div
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
                  className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-6 shadow-md shadow-emerald-500/10"
                >
                  <CheckCircle2 className="w-10 h-10" />
                </motion.div>

                <h3 className="text-2xl font-extrabold text-slate-950 font-display">
                  Захиалга амжилттай бүртгэгдлээ!
                </h3>
                
                <p className="text-sm text-slate-500 max-w-[450px] mt-3 leading-relaxed">
                  Баярлалаа, <strong className="text-slate-800">{formData.fullName}</strong>. Таны{" "}
                  <strong className="text-blue-600">{subtotal.toLocaleString()} ₮</strong> дүн бүхий захиалга амжилттай баталгаажлаа.
                </p>

                {/* Delivery details breakdown */}
                <div className="w-full max-w-sm mt-6 p-4 bg-white border border-slate-200 rounded-2xl text-left text-xs md:text-sm space-y-2 font-sans">
                  <div className="flex justify-between border-b border-slate-200/50 pb-2">
                    <span className="text-slate-400 font-medium">Утасны дугаар:</span>
                    <span className="text-slate-800 font-bold font-mono">{formData.phone}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-200/50 pb-2">
                    <span className="text-slate-400 font-medium">Хүргэлтийн хаяг:</span>
                    <span className="text-slate-800 font-semibold text-right max-w-[200px] line-clamp-1">
                      {districtNames[formData.district]}, {formData.address}
                    </span>
                  </div>
                  <div className="flex justify-between pt-1">
                    <span className="text-slate-400 font-medium">Төлбөрийн төрөл:</span>
                    <span className="text-slate-800 font-bold">
                      {formData.payment === "qpay"
                        ? "QPay (Кодоор)"
                        : formData.payment === "bank"
                        ? "Банкны шилжүүлэг"
                        : "Хүлээн авахдаа бэлнээр"}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-400 mt-6 max-w-[360px]">
                  Манай менежер таны оруулсан утасны дугаар руу 10 минутын дотор холбогдож хүргэлтийн цагийг тохирох болно.
                </p>

                <button
                  id="checkout-success-close-btn"
                  onClick={handleSuccessClose}
                  className="mt-8 bg-slate-900 hover:bg-blue-600 hover:text-white text-slate-100 font-bold py-3.5 px-8 rounded-2xl transition-all duration-300 shadow-xl hover:shadow-blue-500/10"
                >
                  Үндсэн хуудас руу буцах
                </button>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
