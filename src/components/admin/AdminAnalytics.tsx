import React, { useMemo } from "react";
import {
  TrendingUp,
  ShoppingCart,
  Package,
  Wallet,
  Trophy,
  AlertTriangle,
} from "lucide-react";
import { Order, ORDER_STATUS_LABEL, OrderStatus } from "../../store";
import { Product } from "../../types";

interface AdminAnalyticsProps {
  orders: Order[];
  products: Product[];
}

const fmt = (n: number) => n.toLocaleString() + " ₮";

const STATUS_COLOR: Record<OrderStatus, string> = {
  new: "bg-blue-500",
  processing: "bg-amber-500",
  delivered: "bg-emerald-500",
  cancelled: "bg-rose-500",
};

export default function AdminAnalytics({ orders, products }: AdminAnalyticsProps) {
  const now = new Date();
  const month = now.getMonth();
  const year = now.getFullYear();
  const monthName = now.toLocaleDateString("mn-MN", { month: "long", year: "numeric" });

  // Энэ сарын захиалгууд (цуцлагдсанаас бусад нь борлуулалт)
  const monthOrders = useMemo(
    () =>
      orders.filter((o) => {
        const d = new Date(o.createdAt);
        return d.getMonth() === month && d.getFullYear() === year;
      }),
    [orders, month, year]
  );

  const paidOrders = monthOrders.filter((o) => o.status !== "cancelled");

  const revenue = paidOrders.reduce((s, o) => s + o.total, 0);
  const itemsSold = paidOrders.reduce(
    (s, o) => s + o.items.reduce((a, i) => a + i.quantity, 0),
    0
  );
  const avgOrder = paidOrders.length ? Math.round(revenue / paidOrders.length) : 0;

  // Төлвөөр задаргаа
  const statusCounts = useMemo(() => {
    const counts: Record<OrderStatus, number> = {
      new: 0,
      processing: 0,
      delivered: 0,
      cancelled: 0,
    };
    monthOrders.forEach((o) => (counts[o.status] += 1));
    return counts;
  }, [monthOrders]);

  // Өдрөөр борлуулалт (тухайн сарын өдрүүд)
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const dailyRevenue = useMemo(() => {
    const arr = new Array(daysInMonth).fill(0);
    paidOrders.forEach((o) => {
      const d = new Date(o.createdAt).getDate();
      arr[d - 1] += o.total;
    });
    return arr;
  }, [paidOrders, daysInMonth]);
  const maxDaily = Math.max(1, ...dailyRevenue);

  // Шилдэг борлуулалттай бараа (орлогоор)
  const topProducts = useMemo(() => {
    const map = new Map<string, { name: string; qty: number; revenue: number }>();
    paidOrders.forEach((o) =>
      o.items.forEach((i) => {
        const cur = map.get(i.id) ?? { name: i.name, qty: 0, revenue: 0 };
        cur.qty += i.quantity;
        cur.revenue += i.price * i.quantity;
        map.set(i.id, cur);
      })
    );
    return Array.from(map.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
  }, [paidOrders]);

  // Дуусч буй бараа
  const lowStock = products.filter((p) => p.stock <= 5).slice(0, 6);

  const stats = [
    { label: "Энэ сарын орлого", value: fmt(revenue), icon: Wallet, color: "text-emerald-600 bg-emerald-50" },
    { label: "Захиалгын тоо", value: paidOrders.length.toString(), icon: ShoppingCart, color: "text-blue-600 bg-blue-50" },
    { label: "Зарагдсан бараа", value: itemsSold.toString(), icon: Package, color: "text-violet-600 bg-violet-50" },
    { label: "Дундаж захиалга", value: fmt(avgOrder), icon: TrendingUp, color: "text-amber-600 bg-amber-50" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-extrabold text-slate-900">Борлуулалтын тойм</h2>
        <p className="text-sm text-slate-400 capitalize">{monthName}</p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div
            key={s.label}
            className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col gap-3"
          >
            <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${s.color}`}>
              <s.icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium">{s.label}</p>
              <p className="text-xl font-extrabold text-slate-900 font-mono mt-0.5">
                {s.value}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Daily revenue chart */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-5">
          <h3 className="text-base font-bold text-slate-900 mb-4">Өдөр тутмын борлуулалт</h3>
          {revenue === 0 ? (
            <p className="text-sm text-slate-400 py-12 text-center">
              Энэ сард борлуулалт хараахан бүртгэгдээгүй байна.
            </p>
          ) : (
            <div className="flex items-stretch gap-[3px] h-44">
              {dailyRevenue.map((val, i) => (
                <div
                  key={i}
                  className="flex-1 group relative flex items-end h-full"
                  title={`${i + 1}-ний өдөр: ${fmt(val)}`}
                >
                  <div
                    className={`w-full rounded-t transition-all ${
                      val > 0 ? "bg-blue-500 group-hover:bg-blue-600" : "bg-slate-100"
                    }`}
                    style={{ height: `${Math.max(2, (val / maxDaily) * 100)}%` }}
                  />
                </div>
              ))}
            </div>
          )}
          <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-2">
            <span>1</span>
            <span>{Math.ceil(daysInMonth / 2)}</span>
            <span>{daysInMonth}</span>
          </div>
        </div>

        {/* Status breakdown */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5">
          <h3 className="text-base font-bold text-slate-900 mb-4">Захиалгын төлөв</h3>
          <div className="space-y-3">
            {(Object.keys(statusCounts) as OrderStatus[]).map((st) => {
              const count = statusCounts[st];
              const pct = monthOrders.length
                ? Math.round((count / monthOrders.length) * 100)
                : 0;
              return (
                <div key={st}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-600 font-medium">
                      {ORDER_STATUS_LABEL[st]}
                    </span>
                    <span className="text-slate-400 font-mono">{count}</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${STATUS_COLOR[st]}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top products */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5">
          <h3 className="flex items-center gap-2 text-base font-bold text-slate-900 mb-4">
            <Trophy className="w-4 h-4 text-amber-500" /> Шилдэг борлуулалттай
          </h3>
          {topProducts.length === 0 ? (
            <p className="text-sm text-slate-400 py-6 text-center">Мэдээлэл алга</p>
          ) : (
            <div className="space-y-2">
              {topProducts.map((p, i) => (
                <div
                  key={p.name}
                  className="flex items-center gap-3 py-2 border-b border-slate-50 last:border-0"
                >
                  <span className="h-6 w-6 rounded-lg bg-slate-100 text-slate-500 text-xs font-bold flex items-center justify-center flex-shrink-0">
                    {i + 1}
                  </span>
                  <span className="flex-grow text-sm text-slate-700 font-medium line-clamp-1">
                    {p.name}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">{p.qty} ш</span>
                  <span className="text-sm font-bold text-slate-900 font-mono w-28 text-right">
                    {fmt(p.revenue)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Low stock */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5">
          <h3 className="flex items-center gap-2 text-base font-bold text-slate-900 mb-4">
            <AlertTriangle className="w-4 h-4 text-rose-500" /> Дуусч буй бараа
          </h3>
          {lowStock.length === 0 ? (
            <p className="text-sm text-slate-400 py-6 text-center">
              Бүх барааны үлдэгдэл хангалттай байна.
            </p>
          ) : (
            <div className="space-y-2">
              {lowStock.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center gap-3 py-2 border-b border-slate-50 last:border-0"
                >
                  <img
                    src={p.image}
                    alt={p.name}
                    referrerPolicy="no-referrer"
                    className="h-8 w-8 rounded-lg object-cover border border-slate-100"
                  />
                  <span className="flex-grow text-sm text-slate-700 font-medium line-clamp-1">
                    {p.name}
                  </span>
                  <span
                    className={`text-xs font-bold font-mono px-2 py-0.5 rounded-md ${
                      p.stock === 0
                        ? "bg-rose-100 text-rose-600"
                        : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {p.stock} ш
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
