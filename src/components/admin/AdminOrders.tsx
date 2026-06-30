import React, { useState } from "react";
import { Trash2, ChevronDown, ChevronUp, PackageX, Phone, MapPin } from "lucide-react";
import {
  Order,
  OrderStatus,
  ORDER_STATUS_LABEL,
  updateOrderStatus,
  deleteOrder,
} from "../../store";

interface AdminOrdersProps {
  orders: Order[];
}

const STATUS_STYLE: Record<OrderStatus, string> = {
  new: "bg-blue-50 text-blue-600 border-blue-200",
  processing: "bg-amber-50 text-amber-700 border-amber-200",
  delivered: "bg-emerald-50 text-emerald-600 border-emerald-200",
  cancelled: "bg-rose-50 text-rose-600 border-rose-200",
};

const DISTRICT_NAMES: Record<string, string> = {
  Bayanzurkh: "Баянзүрх",
  Sukhbaatar: "Сүхбаатар",
  Chingeltei: "Чингэлтэй",
  Bayangol: "Баянгол",
  KhanUul: "Хан-Уул",
  Songinokhairkhan: "Сонгинохайрхан",
};

const PAYMENT_NAMES: Record<string, string> = {
  qpay: "QPay",
  bank: "Дансаар",
  cash: "Бэлнээр",
};

const fmt = (n: number) => n.toLocaleString() + " ₮";

export default function AdminOrders({ orders }: AdminOrdersProps) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [filter, setFilter] = useState<OrderStatus | "all">("all");

  const visible = filter === "all" ? orders : orders.filter((o) => o.status === filter);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900">Захиалгууд</h2>
          <p className="text-sm text-slate-400">Нийт {orders.length} захиалга</p>
        </div>

        {/* Status filter */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {(["all", "new", "processing", "delivered", "cancelled"] as const).map((st) => (
            <button
              key={st}
              onClick={() => setFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                filter === st
                  ? "bg-slate-900 text-white"
                  : "bg-white border border-slate-200 text-slate-600 hover:border-slate-300"
              }`}
            >
              {st === "all" ? "Бүгд" : ORDER_STATUS_LABEL[st]}
            </button>
          ))}
        </div>
      </div>

      {visible.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center py-24 bg-white border border-dashed border-slate-200 rounded-3xl">
          <PackageX className="w-12 h-12 text-slate-300 mb-4" />
          <h4 className="text-lg font-bold text-slate-700">Захиалга алга</h4>
          <p className="text-sm text-slate-400 mt-1">
            Дэлгүүрээс захиалга өгөхөд энд бүртгэгдэнэ.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {visible.map((order) => {
            const isOpen = expanded === order.id;
            return (
              <div
                key={order.id}
                className="bg-white border border-slate-200 rounded-2xl overflow-hidden"
              >
                {/* Row header */}
                <div className="flex items-center gap-4 p-4">
                  <div className="flex-grow min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-sm font-bold text-slate-900">
                        #{order.id}
                      </span>
                      <span
                        className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${STATUS_STYLE[order.status]}`}
                      >
                        {ORDER_STATUS_LABEL[order.status]}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {order.customer.fullName} ·{" "}
                      {new Date(order.createdAt).toLocaleString("mn-MN")}
                    </p>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-bold text-slate-900 font-mono">
                      {fmt(order.total)}
                    </p>
                    <p className="text-[11px] text-slate-400">
                      {order.items.reduce((a, i) => a + i.quantity, 0)} ширхэг
                    </p>
                  </div>

                  {/* Status selector */}
                  <select
                    value={order.status}
                    onChange={(e) =>
                      updateOrderStatus(order.id, e.target.value as OrderStatus)
                    }
                    className="text-xs font-semibold border border-slate-200 rounded-lg px-2 py-1.5 bg-white text-slate-700 focus:outline-none focus:border-blue-400 cursor-pointer hidden sm:block"
                  >
                    {(Object.keys(ORDER_STATUS_LABEL) as OrderStatus[]).map((s) => (
                      <option key={s} value={s}>
                        {ORDER_STATUS_LABEL[s]}
                      </option>
                    ))}
                  </select>

                  <button
                    onClick={() => setExpanded(isOpen ? null : order.id)}
                    className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-50 rounded-lg"
                    title="Дэлгэрэнгүй"
                  >
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </button>

                  <button
                    onClick={() => {
                      if (confirm("Энэ захиалгыг устгах уу?")) deleteOrder(order.id);
                    }}
                    className="p-2 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                    title="Устгах"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Expanded detail */}
                {isOpen && (
                  <div className="border-t border-slate-100 p-4 bg-slate-50/50 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2 space-y-1.5">
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                        Захиалсан бараа
                      </p>
                      {order.items.map((item) => (
                        <div
                          key={item.id}
                          className="flex justify-between text-sm bg-white border border-slate-100 rounded-lg px-3 py-2"
                        >
                          <span className="text-slate-700">
                            {item.name}{" "}
                            <span className="text-slate-400 font-mono">×{item.quantity}</span>
                          </span>
                          <span className="font-mono font-semibold text-slate-900">
                            {fmt(item.price * item.quantity)}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="space-y-2 text-sm">
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                        Хүргэлт / Төлбөр
                      </p>
                      <p className="flex items-center gap-2 text-slate-600">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        <span className="font-mono">{order.customer.phone}</span>
                      </p>
                      <p className="flex items-start gap-2 text-slate-600">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 mt-0.5" />
                        <span>
                          {DISTRICT_NAMES[order.customer.district] ?? order.customer.district},{" "}
                          {order.customer.address}
                        </span>
                      </p>
                      <p className="text-slate-600">
                        Төлбөр:{" "}
                        <span className="font-semibold">
                          {PAYMENT_NAMES[order.payment] ?? order.payment}
                        </span>
                      </p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
