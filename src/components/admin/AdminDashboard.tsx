import React, { useState, useEffect } from "react";
import {
  LayoutDashboard,
  ClipboardList,
  Boxes,
  LayoutList,
  Tag,
  ArrowLeft,
  Store,
} from "lucide-react";
import {
  Order,
  OrderStatus,
  CustomSection,
  HomeFlags,
  BuiltinConfig,
  HeroSlide,
  getOrders,
  getStoredProducts,
  getSections,
  getHeroBrands,
  getHomeFlags,
  getBuiltinConfig,
  getHeroSlides,
  onStoreChange,
} from "../../store";
import { Product } from "../../types";
import { supabase } from "../../lib/supabase";
import AdminAnalytics from "./AdminAnalytics";
import AdminOrders from "./AdminOrders";
import AdminProducts from "./AdminProducts";
import AdminSections from "./AdminSections";
import AdminBrands from "./AdminBrands";

interface AdminDashboardProps {
  onExit: () => void;
}

type Tab = "analytics" | "orders" | "products" | "sections" | "brands";

const TABS: { key: Tab; label: string; icon: React.ElementType }[] = [
  { key: "analytics", label: "Хяналтын самбар", icon: LayoutDashboard },
  { key: "orders", label: "Захиалга", icon: ClipboardList },
  { key: "products", label: "Бүтээгдэхүүн", icon: Boxes },
  { key: "sections", label: "Home хэсгүүд", icon: LayoutList },
  { key: "brands", label: "Брэндүүд", icon: Tag },
];

export default function AdminDashboard({ onExit }: AdminDashboardProps) {
  const [tab, setTab] = useState<Tab>("analytics");
  const [orders, setOrders] = useState<Order[]>(getOrders);
  const [products, setProducts] = useState<Product[]>(getStoredProducts);
  const [sections, setSections] = useState<CustomSection[]>(getSections);
  const [brands, setBrands] = useState<string[]>(getHeroBrands);
  const [homeFlags, setHomeFlags] = useState<HomeFlags>(getHomeFlags);
  const [builtinConfig, setBuiltinConfig] = useState<BuiltinConfig>(getBuiltinConfig);
  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>(getHeroSlides);

  // Store-ийн аливаа өөрчлөлтөд бүх өгөгдлийг шинэчилнэ
  useEffect(() => {
    const refresh = () => {
      setProducts(getStoredProducts());
      setSections(getSections());
      setBrands(getHeroBrands());
      setHomeFlags(getHomeFlags());
      setBuiltinConfig(getBuiltinConfig());
      setHeroSlides(getHeroSlides());
      // Merge localStorage + Supabase orders (localStorage as base, Supabase overrides by ID)
      const local = getOrders();
      supabase.from("orders").select("*").order("created_at", { ascending: false })
        .then(({ data }) => {
          if (!data?.length) { setOrders(local); return; }
          const remote: Order[] = data.map((r) => ({
            id: r.id,
            createdAt: r.created_at,
            customer: {
              fullName: r.customer_full_name,
              phone: r.customer_phone,
              district: r.customer_district,
              address: r.customer_address,
            },
            payment: r.payment,
            items: r.items,
            total: r.total,
            status: r.status as OrderStatus,
          }));
          // Merge: remote takes priority, append local-only entries
          const remoteIds = new Set(remote.map((o) => o.id));
          const localOnly = local.filter((o) => !remoteIds.has(o.id));
          setOrders([...remote, ...localOnly]);
        });
    };
    refresh();
    return onStoreChange(refresh);
  }, []);

  const newOrderCount = orders.filter((o) => o.status === "new").length;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row">
      {/* Sidebar */}
      <aside className="lg:w-64 lg:flex-shrink-0 bg-white border-b lg:border-b-0 lg:border-r border-slate-200 lg:min-h-screen lg:sticky lg:top-0">
        <div className="p-5 flex items-center gap-2.5 border-b border-slate-100">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-blue-600 to-blue-400 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
            <Store className="w-5 h-5" />
          </div>
          <div>
            <p className="text-sm font-extrabold text-slate-900 tracking-wide">
              MY TECH
            </p>
            <p className="text-[10px] text-slate-400 uppercase tracking-widest">
              Admin Panel
            </p>
          </div>
        </div>

        <nav className="p-3 flex lg:flex-col gap-1 overflow-x-auto scrollbar-none">
          {TABS.map((t) => {
            const active = tab === t.key;
            return (
              <button
                key={t.key}
                id={`admin-tab-${t.key}`}
                onClick={() => setTab(t.key)}
                className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-colors ${
                  active
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-500/10"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <t.icon className="w-4 h-4" />
                <span>{t.label}</span>
                {t.key === "orders" && newOrderCount > 0 && (
                  <span
                    className={`ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                      active ? "bg-white text-blue-600" : "bg-blue-600 text-white"
                    }`}
                  >
                    {newOrderCount}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="p-3 lg:absolute lg:bottom-0 lg:w-64 border-t border-slate-100">
          <button
            id="admin-exit-btn"
            onClick={onExit}
            className="w-full flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100"
          >
            <ArrowLeft className="w-4 h-4" /> Дэлгүүр рүү буцах
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-grow p-5 md:p-8 max-w-6xl w-full mx-auto">
        {tab === "analytics" && <AdminAnalytics orders={orders} products={products} />}
        {tab === "orders" && <AdminOrders orders={orders} />}
        {tab === "products" && <AdminProducts products={products} />}
        {tab === "sections" && (
          <AdminSections
            sections={sections}
            products={products}
            homeFlags={homeFlags}
            builtinConfig={builtinConfig}
            heroSlides={heroSlides}
          />
        )}
        {tab === "brands" && <AdminBrands brands={brands} />}
      </main>
    </div>
  );
}
