import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ShoppingBag, ArrowRight, Check, X, Shield, PhoneCall, HelpCircle } from "lucide-react";
import Header from "./components/Header";
import HeroSlider from "./components/HeroSlider";
import NewArrivals from "./components/NewArrivals";
import BottomGrid from "./components/BottomGrid";
import CategoryPage from "./components/CategoryPage";
import ProductModal from "./components/ProductModal";
import CartDrawer from "./components/CartDrawer";
import CheckoutModal from "./components/CheckoutModal";
import CustomSections from "./components/CustomSections";
import AuthModal from "./components/AuthModal";
import AdminDashboard from "./components/admin/AdminDashboard";
import AdminGate from "./components/admin/AdminGate";
import { matchesCategory } from "./data";
import {
  getStoredProducts,
  getSections,
  getHeroBrands,
  getHomeFlags,
  getBuiltinConfig,
  getHeroSlides,
  onStoreChange,
  CustomSection,
  HomeFlags,
  BuiltinConfig,
  HeroSlide,
  Session,
} from "./store";
import { supabase, supabaseUserToSession } from "./lib/supabase";
import { Product, CartItem } from "./types";

export default function App() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  // "home" = эхлэл хуудас (hero/шинэ/онцлох), "listing" = категори/хайлтын дэлгэрэнгүй хуудас
  const [view, setView] = useState<"home" | "listing">("home");

  // ── Admin routing (#admin hash) ──
  const [isAdmin, setIsAdmin] = useState(
    () => typeof window !== "undefined" && window.location.hash === "#admin"
  );
  useEffect(() => {
    const onHash = () => setIsAdmin(window.location.hash === "#admin");
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  // ── Бүтээгдэхүүн ба home хэсгүүд (store-оос, өөрчлөлтөд автоматаар шинэчлэгдэнэ) ──
  const [products, setProducts] = useState<Product[]>(getStoredProducts);
  const [customSections, setCustomSections] = useState<CustomSection[]>(getSections);
  const [heroBrands, setHeroBrands] = useState<string[]>(getHeroBrands);
  const [homeFlags, setHomeFlags] = useState<HomeFlags>(getHomeFlags);
  const [builtinConfig, setBuiltinConfig] = useState<BuiltinConfig>(getBuiltinConfig);
  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>(getHeroSlides);
  const [session, setSession] = useState<Session | null>(null);

  // Supabase auth session listener
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s?.user ? supabaseUserToSession(s.user) : null);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s?.user ? supabaseUserToSession(s.user) : null);
    });
    return () => subscription.unsubscribe();
  }, []);

  // Store (localStorage) data listener
  useEffect(() => {
    const refresh = () => {
      setProducts(getStoredProducts());
      setCustomSections(getSections());
      setHeroBrands(getHeroBrands());
      setHomeFlags(getHomeFlags());
      setBuiltinConfig(getBuiltinConfig());
      setHeroSlides(getHeroSlides());
    };
    refresh();
    return onStoreChange(refresh);
  }, []);

  // Нэвтрэх/бүртгүүлэх цонх
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  // Админ нээгдсэн эсэх (зөвхөн тусгай түлхүүрээр, browser tab-д хадгалагдана)
  const [adminUnlocked, setAdminUnlocked] = useState(
    () =>
      typeof window !== "undefined" &&
      sessionStorage.getItem("techstore_admin_unlocked") === "1"
  );
  const unlockAdmin = () => {
    sessionStorage.setItem("techstore_admin_unlocked", "1");
    setAdminUnlocked(true);
  };
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  // Success alert/toast state
  const [toast, setToast] = useState<{ message: string; visible: boolean }>({
    message: "",
    visible: false,
  });

  const showToast = (message: string) => {
    setToast({ message, visible: true });
  };

  useEffect(() => {
    if (toast.visible) {
      const timer = setTimeout(() => {
        setToast((prev) => ({ ...prev, visible: false }));
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toast.visible]);

  // Cart operations
  const handleAddToCart = (product: Product, quantity: number = 1, color?: string) => {
    setCartItems((prevItems) => {
      // Find index of item with same ID and color
      const existingIndex = prevItems.findIndex(
        (item) =>
          item.product.id === product.id &&
          (!color || item.selectedColor === color)
      );

      if (existingIndex > -1) {
        const newItems = [...prevItems];
        const newQty = newItems[existingIndex].quantity + quantity;
        if (newQty <= product.stock) {
          newItems[existingIndex].quantity = newQty;
          showToast(`${product.name} сагсанд нэмэгдлээ (${newQty} ш)`);
        } else {
          showToast(`Уучлаарай, агуулахад бэлэн үлдэгдэл хүрэлцэхгүй байна.`);
        }
        return newItems;
      } else {
        showToast(`${product.name} сагсанд амжилттай нэмэгдлээ.`);
        return [...prevItems, { product, quantity, selectedColor: color }];
      }
    });
  };

  const handleUpdateCartQty = (productId: string, quantity: number, color?: string) => {
    setCartItems((prevItems) =>
      prevItems.map((item) => {
        if (item.product.id === productId && item.selectedColor === color) {
          return { ...item, quantity: Math.max(1, quantity) };
        }
        return item;
      })
    );
  };

  const handleRemoveCartItem = (productId: string, color?: string) => {
    setCartItems((prevItems) => {
      const itemToRemove = prevItems.find(
        (item) => item.product.id === productId && item.selectedColor === color
      );
      if (itemToRemove) {
        showToast(`${itemToRemove.product.name} сагснаас хасагдлаа.`);
      }
      return prevItems.filter(
        (item) => !(item.product.id === productId && item.selectedColor === color)
      );
    });
  };

  const handleClearCart = () => {
    setCartItems([]);
  };

  // Navigation handlers
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  // Header-ийн категори дээр дарвал тусдаа listing хуудас руу шилжинэ
  const handleSelectCategory = (id: string) => {
    setSelectedCategory(id);
    setSearchQuery("");
    setView("listing");
    scrollToTop();
  };

  // Logo дээр дарвал эхлэл хуудас руу буцна
  const handleGoHome = () => {
    setSelectedCategory("all");
    setSearchQuery("");
    setView("home");
    scrollToTop();
  };

  // Хайлт хийвэл listing хуудас руу шилжиж, бичвэрээ цэвэрлэвэл эхлэл рүү буцна
  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    setView(query.trim() !== "" ? "listing" : "home");
  };

  // Filter products by category AND search query
  const filteredProductsBySearch = products.filter((product) => {
    const inCategory = matchesCategory(product.category, selectedCategory);
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase());
    return inCategory && matchesSearch;
  });

  // Админ горим: зөвхөн нууц түлхүүр оруулсан үед нээгдэнэ
  if (isAdmin) {
    const exitAdmin = () => {
      window.location.hash = "";
      setIsAdmin(false);
    };
    if (!adminUnlocked) {
      return <AdminGate onUnlock={unlockAdmin} onExit={exitAdmin} />;
    }
    return <AdminDashboard onExit={exitAdmin} />;
  }

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans flex flex-col justify-between">
      {/* Top Header Bar */}
      <Header
        selectedCategory={selectedCategory}
        onSelectCategory={handleSelectCategory}
        onGoHome={handleGoHome}
        cartCount={cartItems.reduce((acc, item) => acc + item.quantity, 0)}
        onOpenCart={() => setIsCartOpen(true)}
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        user={session}
        onOpenAuth={() => setIsAuthOpen(true)}
        onLogout={() => {
          supabase.auth.signOut();
          showToast("Та системээс гарлаа.");
        }}
      />

      {/* Main Body Layout */}
      <main className="flex-grow">
        {view === "listing" ? (
          /* ── Категори / Хайлтын listing хуудас (шүүлт, эрэмбэлэлттэй) ── */
          <CategoryPage
            products={filteredProductsBySearch}
            selectedCategory={selectedCategory}
            searchQuery={searchQuery}
            onSelectProduct={setSelectedProduct}
            onAddToCart={(product) => handleAddToCart(product, 1)}
          />
        ) : (
          /* ── Эхлэл хуудас (hero, шинэ, онцлох) ── */
          <>
            {/* 3D Hero Slider Section (The central 5-card swapper carousel) */}
            <div className="bg-white pt-2 pb-6 border-b border-slate-100/80">
              <HeroSlider
                products={products}
                brands={heroBrands}
                slides={heroSlides}
                onSelectProduct={setSelectedProduct}
                onAddToCart={(product) => handleAddToCart(product, 1)}
              />
            </div>

            {/* New Arrivals showcase */}
            {homeFlags.newArrivals && (
              <NewArrivals
                products={products}
                overrideIds={builtinConfig.newArrivals}
                onSelectProduct={setSelectedProduct}
                onAddToCart={(product) => handleAddToCart(product, 1)}
              />
            )}

            {/* Featured Products Grid Section (The 4 vertical cards layout) */}
            {homeFlags.featured && (
              <div className="py-8 bg-white">
                <BottomGrid
                  products={builtinConfig.featured.length ? products : filteredProductsBySearch}
                  onSelectProduct={setSelectedProduct}
                  onAddToCart={(product) => handleAddToCart(product, 1)}
                  selectedCategory={selectedCategory}
                  overrideIds={builtinConfig.featured}
                />
              </div>
            )}

            {/* Админ самбараас үүсгэсэн нэмэлт home хэсгүүд */}
            <CustomSections
              sections={customSections}
              products={products}
              onSelectProduct={setSelectedProduct}
              onAddToCart={(product) => handleAddToCart(product, 1)}
            />
          </>
        )}

        {/* Brand Quality Statements / Minimalist badges */}
        <section id="trust-badges" className="bg-white border-t border-slate-100 py-16 px-4">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex items-start gap-4 p-5 bg-white rounded-2xl border border-slate-100 shadow-sm">
              <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-base font-bold text-slate-900">БАТАЛГААТ ЧАНАР</h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Манай бүх бүтээгдэхүүн үйлдвэрлэгчийн албан ёсны 1 жилийн баталгаатай бөгөөд чанарын дээд зэргийн хяналттайгаар нийлүүлэгддэг.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-5 bg-white rounded-2xl border border-slate-100 shadow-sm">
              <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
                <PhoneCall className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-base font-bold text-slate-900">24/7 ХОЛБОГДОХ СУВАГ</h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Захиалга болон техникийн холбогдолтой асуултуудад манай бэлтгэгдсэн мэргэжлийн оператор танд түргэн шуурхай туслах болно.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-5 bg-white rounded-2xl border border-slate-100 shadow-sm">
              <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
                <HelpCircle className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-base font-bold text-slate-900">ТУХТАЙ ХҮРГЭЛТТЭЙ</h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Бид таны сонгосон барааг Улаанбаатар хот дахь заасан хаягаар найдвартай сав баглаа боодолтойгоор богино хугацаанд хүргэж өгнө.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer copyright */}
      <footer className="bg-slate-950 text-white border-t border-slate-900 py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-blue-600 flex items-center justify-center text-white">
              ★
            </div>
            <div>
              <span className="text-base font-extrabold tracking-wider font-display">ЦЭНХЭР ТЕХ</span>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-0.5">MINIMALIST TECH STORE MONGOLIA</p>
            </div>
          </div>
          
          <div className="text-center md:text-right">
            <p className="text-xs text-slate-400 font-sans">
              &copy; {new Date().getFullYear()} Цэнхэр Тех Дэлгүүр. Бүх эрх хуулиар хамгаалагдсан.
            </p>
            <p className="text-[10px] text-slate-600 mt-1">
              Минималист загвар, дээд зэргийн анимэйшн туршлага.
            </p>
          </div>
        </div>
      </footer>

      {/* Floating Notifications Toast */}
      <AnimatePresence>
        {toast.visible && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
            className="fixed bottom-6 left-6 z-50 bg-slate-900 text-white px-5 py-3.5 rounded-2xl border border-slate-800 shadow-2xl flex items-center gap-3 max-w-sm"
          >
            <div className="h-6 w-6 bg-blue-500 rounded-full flex items-center justify-center text-white flex-shrink-0">
              <Check className="w-3.5 h-3.5 stroke-[3]" />
            </div>
            <span className="text-xs md:text-sm font-semibold pr-3 leading-snug">
              {toast.message}
            </span>
            <button
              id="toast-close-btn"
              onClick={() => setToast((prev) => ({ ...prev, visible: false }))}
              className="text-slate-400 hover:text-white ml-auto"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Product Detail Modal */}
      <ProductModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={handleAddToCart}
      />

      {/* Shopping Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onUpdateQty={handleUpdateCartQty}
        onRemoveItem={handleRemoveCartItem}
        onCheckout={() => {
          setIsCartOpen(false);
          setIsCheckoutOpen(true);
        }}
      />

      {/* Checkout form Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        cartItems={cartItems}
        onClearCart={handleClearCart}
      />

      {/* Login / Sign up Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onSuccess={(msg) => showToast(msg)}
      />
    </div>
  );
}
