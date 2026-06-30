import React, { useState } from "react";
import {
  Search,
  ShoppingBag,
  Monitor,
  MonitorPlay,
  Cpu,
  CircuitBoard,
  MemoryStick,
  HardDrive,
  Power,
  Fan,
  Box,
  Mouse,
  Keyboard,
  Headphones,
  Speaker,
  Mic,
  Camera,
  Square,
  LayoutGrid,
  ChevronDown,
  X,
  User as UserIcon,
  LogOut,
} from "lucide-react";
import { Category } from "../types";
import { CATEGORIES } from "../data";
import { Session } from "../store";

interface HeaderProps {
  selectedCategory: string;
  onSelectCategory: (id: string) => void;
  onGoHome: () => void;
  cartCount: number;
  onOpenCart: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  user: Session | null;
  onOpenAuth: () => void;
  onLogout: () => void;
}

// Helper to get matching category icon by name
const getCategoryIcon = (iconName: string, className: string) => {
  switch (iconName) {
    case "Monitor":
      return <Monitor className={className} />;
    case "MonitorPlay":
      return <MonitorPlay className={className} />;
    case "Cpu":
      return <Cpu className={className} />;
    case "CircuitBoard":
      return <CircuitBoard className={className} />;
    case "MemoryStick":
      return <MemoryStick className={className} />;
    case "HardDrive":
      return <HardDrive className={className} />;
    case "Power":
      return <Power className={className} />;
    case "Fan":
      return <Fan className={className} />;
    case "Box":
      return <Box className={className} />;
    case "Mouse":
      return <Mouse className={className} />;
    case "Keyboard":
      return <Keyboard className={className} />;
    case "Headphones":
      return <Headphones className={className} />;
    case "Speaker":
      return <Speaker className={className} />;
    case "Mic":
      return <Mic className={className} />;
    case "Camera":
      return <Camera className={className} />;
    case "Square":
      return <Square className={className} />;
    case "Grid":
    default:
      return <LayoutGrid className={className} />;
  }
};

// A group is "active" if it itself or one of its subcategories is selected
const isGroupActive = (cat: Category, selectedCategory: string) =>
  cat.id === selectedCategory ||
  !!cat.subcategories?.some((s) => s.id === selectedCategory);

export default function Header({
  selectedCategory,
  onSelectCategory,
  onGoHome,
  cartCount,
  onOpenCart,
  searchQuery,
  onSearchChange,
  user,
  onOpenAuth,
  onLogout,
}: HeaderProps) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  // Which dropdown group is currently open (desktop)
  const [openGroup, setOpenGroup] = useState<string | null>(null);
  // Хэрэглэгчийн цэс нээлттэй эсэх
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleSelect = (id: string) => {
    onSelectCategory(id);
    setOpenGroup(null);
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-md border-b border-slate-100 text-slate-800 transition-all duration-300">
      {/* Top Main Navigation Row */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 md:h-20 flex items-center justify-between gap-4">
        {/* Logo / Brand Name */}
        <div
          onClick={() => {
            onGoHome();
            setOpenGroup(null);
          }}
          className="flex items-center gap-2.5 cursor-pointer select-none group"
        >
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-blue-600 to-blue-400 flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-all duration-300">
            <svg
              className="w-5 h-5 text-white fill-current"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>
          <div>
            <span className="text-lg md:text-xl font-extrabold tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-blue-700 via-blue-600 to-blue-500 font-display">
              ЦЭНХЭР ТЕХ
            </span>
            <span className="block text-[9px] text-blue-500 font-bold tracking-[0.2em] uppercase">
              COMPUTER & PARTS STORE
            </span>
          </div>
        </div>

        {/* Categories Menu (For wide screens, inline category menu with dropdowns) */}
        <nav className="hidden lg:flex items-center gap-1 bg-slate-50 p-1.5 rounded-2xl border border-slate-200/80">
          {CATEGORIES.map((cat) => {
            const isActive = isGroupActive(cat, selectedCategory);
            const hasSub = !!cat.subcategories?.length;

            if (!hasSub) {
              return (
                <button
                  key={cat.id}
                  id={`cat-header-btn-${cat.id}`}
                  onClick={() => handleSelect(cat.id)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-300 ${
                    isActive
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-500/10"
                      : "text-slate-500 hover:text-blue-600 hover:bg-blue-50/50"
                  }`}
                >
                  {getCategoryIcon(cat.icon, "w-3.5 h-3.5")}
                  <span>{cat.name}</span>
                </button>
              );
            }

            // Group with a dropdown of subcategories
            return (
              <div
                key={cat.id}
                className="relative"
                onMouseEnter={() => setOpenGroup(cat.id)}
                onMouseLeave={() => setOpenGroup(null)}
              >
                <button
                  id={`cat-header-btn-${cat.id}`}
                  onClick={() =>
                    setOpenGroup((prev) => (prev === cat.id ? null : cat.id))
                  }
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-300 ${
                    isActive
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-500/10"
                      : "text-slate-500 hover:text-blue-600 hover:bg-blue-50/50"
                  }`}
                >
                  {getCategoryIcon(cat.icon, "w-3.5 h-3.5")}
                  <span>{cat.name}</span>
                  <ChevronDown
                    className={`w-3 h-3 transition-transform duration-300 ${
                      openGroup === cat.id ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {/* Dropdown panel */}
                {openGroup === cat.id && (
                  <div className="absolute top-full left-0 pt-2 z-50">
                    <div className="w-60 bg-white rounded-2xl border border-slate-200 shadow-2xl p-2 grid grid-cols-1 gap-0.5">
                      {/* Whole-group shortcut */}
                      <button
                        id={`cat-sub-btn-${cat.id}`}
                        onClick={() => handleSelect(cat.id)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-colors duration-200 ${
                          selectedCategory === cat.id
                            ? "bg-blue-600 text-white"
                            : "text-slate-700 hover:bg-blue-50 hover:text-blue-600"
                        }`}
                      >
                        {getCategoryIcon(cat.icon, "w-4 h-4")}
                        <span>Бүх {cat.name.toLowerCase()}</span>
                      </button>

                      <div className="my-1 h-px bg-slate-100" />

                      {cat.subcategories!.map((sub) => {
                        const subActive = selectedCategory === sub.id;
                        return (
                          <button
                            key={sub.id}
                            id={`cat-sub-btn-${sub.id}`}
                            onClick={() => handleSelect(sub.id)}
                            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-colors duration-200 ${
                              subActive
                                ? "bg-blue-600 text-white"
                                : "text-slate-500 hover:bg-blue-50 hover:text-blue-600"
                            }`}
                          >
                            {getCategoryIcon(sub.icon, "w-4 h-4")}
                            <span>{sub.name}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Actions (Search, Cart, Profile) */}
        <div className="flex items-center gap-2 md:gap-4">
          {/* Animated Search Bar */}
          <div className="relative flex items-center">
            {isSearchOpen ? (
              <div className="absolute right-0 flex items-center bg-white border border-slate-200 rounded-xl px-3 py-1.5 w-60 md:w-80 shadow-2xl transition-all duration-300">
                <input
                  id="search-input"
                  type="text"
                  placeholder="Бүтээгдэхүүн хайх..."
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="w-full bg-transparent text-sm text-slate-800 focus:outline-none placeholder-slate-400 pr-6"
                  autoFocus
                />
                <button
                  id="search-close-btn"
                  onClick={() => {
                    setIsSearchOpen(false);
                    onSearchChange("");
                  }}
                  className="absolute right-3 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                id="search-open-btn"
                onClick={() => setIsSearchOpen(true)}
                className="p-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 hover:text-slate-800 rounded-xl transition-all duration-300"
                title="Хайх"
              >
                <Search className="w-4 h-4 md:w-5 h-5" />
              </button>
            )}
          </div>

          {/* Cart Icon */}
          <button
            id="header-cart-btn"
            onClick={onOpenCart}
            className="relative p-2.5 bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-200 text-slate-600 hover:text-blue-600 rounded-xl transition-all duration-300"
            title="Миний Сагс"
          >
            <ShoppingBag className="w-4 h-4 md:w-5 h-5" />
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 h-5 w-5 bg-blue-500 text-white text-[10px] font-extrabold flex items-center justify-center rounded-full border-2 border-white shadow-md animate-pulse">
                {cartCount}
              </span>
            )}
          </button>

          {/* User Profile / Auth */}
          <div className="relative flex items-center pl-2 border-l border-slate-200">
            {user ? (
              <>
                <button
                  id="header-user-btn"
                  onClick={() => setUserMenuOpen((v) => !v)}
                  className="flex items-center gap-2 group"
                  title={user.name}
                >
                  <div className="h-9 w-9 rounded-xl bg-blue-600 flex items-center justify-center text-xs font-bold text-white uppercase">
                    {user.name.charAt(0)}
                  </div>
                  <span className="hidden md:block text-sm font-semibold text-slate-700 max-w-[100px] truncate">
                    {user.name}
                  </span>
                  <ChevronDown className="hidden md:block w-3.5 h-3.5 text-slate-400" />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-2xl border border-slate-200 shadow-2xl p-2 z-50">
                    <div className="px-3 py-2 border-b border-slate-100 mb-1">
                      <p className="text-sm font-bold text-slate-900 truncate">
                        {user.name}
                      </p>
                      <p className="text-xs text-slate-400 truncate">
                        {user.phone || user.provider}
                      </p>
                    </div>
                    <button
                      id="header-logout-btn"
                      onClick={() => {
                        setUserMenuOpen(false);
                        onLogout();
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold text-rose-500 hover:bg-rose-50"
                    >
                      <LogOut className="w-4 h-4" /> Гарах
                    </button>
                  </div>
                )}
              </>
            ) : (
              <button
                id="header-login-btn"
                onClick={onOpenAuth}
                className="flex items-center gap-2 px-3 md:px-4 py-2.5 bg-slate-900 hover:bg-blue-600 text-white rounded-xl text-sm font-bold transition-colors"
              >
                <UserIcon className="w-4 h-4" />
                <span className="hidden sm:block">Нэвтрэх</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Categories subheader row (For smaller screens) — flattened groups + subcategories */}
      <div className="lg:hidden w-full border-t border-slate-100 bg-white py-2.5 px-4 overflow-x-auto flex items-center gap-2 scrollbar-none">
        {CATEGORIES.flatMap((cat) =>
          cat.subcategories?.length
            ? [{ ...cat, name: `Бүх ${cat.name.toLowerCase()}` }, ...cat.subcategories]
            : [cat]
        ).map((cat) => {
          const isActive = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              id={`cat-mobile-btn-${cat.id}`}
              onClick={() => handleSelect(cat.id)}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all duration-300 ${
                isActive
                  ? "bg-blue-600 text-white"
                  : "text-slate-600 hover:text-blue-600 bg-slate-50 hover:bg-blue-50"
              }`}
            >
              {getCategoryIcon(cat.icon, "w-3 h-3")}
              <span>{cat.name}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
}
