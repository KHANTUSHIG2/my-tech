import { Product } from "./types";
import { PRODUCTS } from "./data";

/**
 * Frontend-only өгөгдлийн давхарга (localStorage).
 * Захиалга, бүтээгдэхүүний өөрчлөлт, home хэсгүүдийг хадгална.
 * Бүх бичилт хийгдэхэд "techstore-change" event ялгаруулж UI шинэчилнэ.
 */
const KEYS = {
  orders: "techstore_orders",
  overrides: "techstore_product_overrides",
  custom: "techstore_custom_products",
  deleted: "techstore_deleted_products",
  sections: "techstore_home_sections",
  brands: "techstore_hero_brands",
  homeFlags: "techstore_home_flags",
  builtin: "techstore_builtin_config",
  heroSlides: "techstore_hero_slides",
};

// Admin key is loaded from env — never hardcode in source
export const ADMIN_KEY = import.meta.env.VITE_ADMIN_KEY as string;

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error("localStorage бичих алдаа:", e);
  }
  window.dispatchEvent(new Event("techstore-change"));
}

/** Аливаа өөрчлөлтөд бүртгүүлэх (App, Admin хоёулаа сонсоно) */
export function onStoreChange(cb: () => void) {
  window.addEventListener("techstore-change", cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener("techstore-change", cb);
    window.removeEventListener("storage", cb);
  };
}

/* ────────────────────────────── ЗАХИАЛГА ────────────────────────────── */

export type OrderStatus = "new" | "processing" | "delivered" | "cancelled";

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  new: "Шинэ",
  processing: "Бэлтгэгдэж буй",
  delivered: "Хүргэгдсэн",
  cancelled: "Цуцлагдсан",
};

export interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: string;
  createdAt: string;
  customer: {
    fullName: string;
    phone: string;
    district: string;
    address: string;
  };
  payment: string;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
}

export const getOrders = (): Order[] => read<Order[]>(KEYS.orders, []);

export function addOrder(data: Omit<Order, "id" | "createdAt" | "status">): Order {
  const order: Order = {
    ...data,
    id: `ORD-${Date.now().toString().slice(-8)}`,
    createdAt: new Date().toISOString(),
    status: "new",
  };
  write(KEYS.orders, [order, ...getOrders()]);
  return order;
}

export function updateOrderStatus(id: string, status: OrderStatus) {
  write(
    KEYS.orders,
    getOrders().map((o) => (o.id === id ? { ...o, status } : o))
  );
}

export function deleteOrder(id: string) {
  write(KEYS.orders, getOrders().filter((o) => o.id !== id));
}

/* ────────────────────────────── БҮТЭЭГДЭХҮҮН ────────────────────────────── */

export type ProductPatch = Partial<
  Pick<
    Product,
    | "name"
    | "brand"
    | "price"
    | "originalPrice"
    | "description"
    | "image"
    | "stock"
    | "rating"
    | "isNew"
    | "category"
  >
>;
type OverrideMap = Record<string, ProductPatch>;

const getOverrides = (): OverrideMap => read<OverrideMap>(KEYS.overrides, {});
const getCustomProducts = (): Product[] => read<Product[]>(KEYS.custom, []);
const getDeleted = (): string[] => read<string[]>(KEYS.deleted, []);

/** Үндсэн өгөгдөл + админ өөрчлөлтийг нэгтгэсэн бүтээгдэхүүний жагсаалт */
export function getStoredProducts(): Product[] {
  const overrides = getOverrides();
  const deleted = new Set(getDeleted());
  const apply = (p: Product): Product =>
    overrides[p.id] ? { ...p, ...overrides[p.id] } : p;

  const custom = getCustomProducts().map(apply);
  const base = PRODUCTS.map(apply);
  return [...custom, ...base].filter((p) => !deleted.has(p.id));
}

export function updateProduct(id: string, patch: ProductPatch) {
  const customs = getCustomProducts();
  const idx = customs.findIndex((c) => c.id === id);
  if (idx > -1) {
    customs[idx] = { ...customs[idx], ...patch };
    write(KEYS.custom, customs);
  } else {
    const ov = getOverrides();
    ov[id] = { ...ov[id], ...patch };
    write(KEYS.overrides, ov);
  }
}

export function addProduct(p: Product) {
  write(KEYS.custom, [p, ...getCustomProducts()]);
}

export function deleteProduct(id: string) {
  const customs = getCustomProducts();
  if (customs.some((c) => c.id === id)) {
    write(KEYS.custom, customs.filter((c) => c.id !== id));
  } else {
    write(KEYS.deleted, Array.from(new Set([...getDeleted(), id])));
  }
}

/** Бүх админ өөрчлөлтийг анхны төлөвт буцаах */
export function resetProductChanges() {
  write(KEYS.overrides, {});
  write(KEYS.deleted, []);
  write(KEYS.custom, []);
}

/* ────────────────────────────── HOME ХЭСГҮҮД ────────────────────────────── */

export interface CustomSection {
  id: string;
  title: string;
  subtitle: string;
  productIds: string[];
  enabled: boolean;
}

export const getSections = (): CustomSection[] =>
  read<CustomSection[]>(KEYS.sections, []);

export function addSection(s: Omit<CustomSection, "id">): CustomSection {
  const section: CustomSection = { ...s, id: `sec-${Date.now()}` };
  write(KEYS.sections, [...getSections(), section]);
  return section;
}

export function updateSection(id: string, patch: Partial<CustomSection>) {
  write(
    KEYS.sections,
    getSections().map((s) => (s.id === id ? { ...s, ...patch } : s))
  );
}

export function deleteSection(id: string) {
  write(KEYS.sections, getSections().filter((s) => s.id !== id));
}

/* ────────────────────────────── HERO БРЭНДҮҮД ────────────────────────────── */

/** Hero section-ийн брэнд loop-д үндсэн брэндүүд */
export const DEFAULT_HERO_BRANDS = [
  "AttackShark",
  "Logitech",
  "SteelSeries",
  "Zowie",
  "HyperX",
];

export function getHeroBrands(): string[] {
  const raw = read<string[] | null>(KEYS.brands, null);
  return raw && raw.length ? raw : DEFAULT_HERO_BRANDS;
}

export function addHeroBrand(name: string) {
  const n = name.trim();
  if (!n) return;
  const cur = getHeroBrands();
  if (cur.some((b) => b.toLowerCase() === n.toLowerCase())) return;
  write(KEYS.brands, [...cur, n]);
}

export function deleteHeroBrand(name: string) {
  write(KEYS.brands, getHeroBrands().filter((b) => b !== name));
}

export function resetHeroBrands() {
  write(KEYS.brands, DEFAULT_HERO_BRANDS);
}

/* ────────────────────── ҮНДСЭН HOME ХЭСГҮҮД (харагдах эсэх) ────────────────────── */

export interface HomeFlags {
  newArrivals: boolean;
  featured: boolean;
}

const DEFAULT_HOME_FLAGS: HomeFlags = { newArrivals: true, featured: true };

export function getHomeFlags(): HomeFlags {
  return { ...DEFAULT_HOME_FLAGS, ...read<Partial<HomeFlags>>(KEYS.homeFlags, {}) };
}

export function setHomeFlag(key: keyof HomeFlags, enabled: boolean) {
  write(KEYS.homeFlags, { ...getHomeFlags(), [key]: enabled });
}

/* ───────── ҮНДСЭН ХЭСГИЙН БАРАА СОНГОЛТ (хоосон бол анхны төлөв) ───────── */

export interface BuiltinConfig {
  /** Шинэ бүтээгдэхүүн showcase-д гарах бараа (хоосон = isNew автоматаар) */
  newArrivals: string[];
  /** Онцлох бүтээгдэхүүн карусель (хоосон = бүх бараа) */
  featured: string[];
  /** Hero слайдерт гарах бараа/зургууд (хоосон = isNew эхний 5) */
  hero: string[];
}

const DEFAULT_BUILTIN_CONFIG: BuiltinConfig = {
  newArrivals: [],
  featured: [],
  hero: [],
};

export function getBuiltinConfig(): BuiltinConfig {
  return { ...DEFAULT_BUILTIN_CONFIG, ...read<Partial<BuiltinConfig>>(KEYS.builtin, {}) };
}

export function setBuiltinSelection(key: keyof BuiltinConfig, ids: string[]) {
  write(KEYS.builtin, { ...getBuiltinConfig(), [key]: ids });
}

/* ───────── HERO СЛАЙДЕР (upload хийсэн зургууд) ───────── */

export interface HeroSlide {
  id: string;
  image: string; // URL эсвэл upload хийсэн dataURL
  title: string;
  subtitle: string;
}

export const getHeroSlides = (): HeroSlide[] =>
  read<HeroSlide[]>(KEYS.heroSlides, []);

export function addHeroSlide(slide: Omit<HeroSlide, "id">): HeroSlide {
  const s: HeroSlide = { ...slide, id: `slide-${Date.now()}` };
  write(KEYS.heroSlides, [...getHeroSlides(), s]);
  return s;
}

export function updateHeroSlide(id: string, patch: Partial<HeroSlide>) {
  write(
    KEYS.heroSlides,
    getHeroSlides().map((s) => (s.id === id ? { ...s, ...patch } : s))
  );
}

export function deleteHeroSlide(id: string) {
  write(KEYS.heroSlides, getHeroSlides().filter((s) => s.id !== id));
}

/* ────────────────────────────── ХЭРЭГЛЭГЧ / НЭВТРЭЛТ ────────────────────────────── */
// Auth бүрэн Supabase руу шилжсэн. Session type-г App болон Header-т зориулан экспортолно.

export type AuthProvider = "phone" | "google" | "facebook";

export interface Session {
  id: string;
  name: string;
  phone: string;
  provider: AuthProvider;
}
