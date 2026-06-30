import { Product, Category } from "./types";

/**
 * Header-ийн навигаци: 3 үндсэн бүлэг.
 *  - "prebuilt"     → шууд сонгогдоно (dropdown-гүй)
 *  - "components"   → dropdown дотроо эд ангиудтай
 *  - "accessories"  → dropdown дотроо дагалдах хэрэгслүүдтэй
 * Бараа бүрийн `category` нь доорх дэд категориудын `id`-тай тэнцүү байна.
 */
export const CATEGORIES: Category[] = [
  { id: "all", name: "Бүгд", icon: "Grid" },
  { id: "prebuilt", name: "Бэлэн компьютер", icon: "Monitor" },
  {
    id: "components",
    name: "Компьютерийн эд анги",
    icon: "Cpu",
    subcategories: [
      { id: "cpu", name: "Процессор (CPU)", icon: "Cpu" },
      { id: "motherboard", name: "Эх хавтан (Motherboard)", icon: "CircuitBoard" },
      { id: "ram", name: "Санах ой (RAM)", icon: "MemoryStick" },
      { id: "ssd", name: "SSD хадгалах", icon: "HardDrive" },
      { id: "hdd", name: "HDD хадгалах", icon: "HardDrive" },
      { id: "gpu", name: "Видео карт (GPU)", icon: "MonitorPlay" },
      { id: "psu", name: "Тэжээл (Power Supply)", icon: "Power" },
      { id: "cooler", name: "Хөргөлт (Cooler)", icon: "Fan" },
      { id: "case", name: "Кэйс (Case)", icon: "Box" },
    ],
  },
  {
    id: "accessories",
    name: "Дагалдах хэрэгсэл",
    icon: "Keyboard",
    subcategories: [
      { id: "mouse", name: "Хулгана", icon: "Mouse" },
      { id: "keyboard", name: "Гар (Keyboard)", icon: "Keyboard" },
      { id: "headset", name: "Чихэвч", icon: "Headphones" },
      { id: "speaker", name: "Чанга яригч", icon: "Speaker" },
      { id: "microphone", name: "Микрофон", icon: "Mic" },
      { id: "camera", name: "Вэб камер", icon: "Camera" },
      { id: "mousepad", name: "Хулганы дэвсгэр", icon: "Square" },
    ],
  },
];

/** catId → харагдах нэр (badge, breadcrumb-д ашиглагдана) */
const LABEL_MAP: Record<string, string> = (() => {
  const map: Record<string, string> = {};
  for (const cat of CATEGORIES) {
    map[cat.id] = cat.name;
    cat.subcategories?.forEach((sub) => {
      map[sub.id] = sub.name;
    });
  }
  return map;
})();

export const getCategoryLabel = (catId: string): string => LABEL_MAP[catId] ?? catId;

/**
 * Сонгогдсон категорид тохирох "навч" (leaf) категориудын id-уудыг буцаана.
 *  - "all"                 → null (бүх бараа)
 *  - бүлэг (components гм.) → доторх бүх дэд категорийн id-ууд
 *  - дэд категори (cpu гм.) → тухайн нэг id
 */
export const getLeafCategoryIds = (selected: string): string[] | null => {
  if (selected === "all") return null;
  const group = CATEGORIES.find((c) => c.id === selected);
  if (group?.subcategories?.length) return group.subcategories.map((s) => s.id);
  return [selected];
};

/** Сонгогдсон категорид бараа тохирч буй эсэх */
export const matchesCategory = (productCategory: string, selected: string): boolean => {
  const leafIds = getLeafCategoryIds(selected);
  return leafIds === null || leafIds.includes(productCategory);
};


export const PRODUCTS: Product[] = [
  /* ───────────────────────── БЭЛЭН КОМПЬЮТЕР ───────────────────────── */
  {
    id: "prebuilt-zen-rtx4070",
    name: "ZEN Gaming RTX 4070 Бэлэн ПК",
    brand: "ZEN",
    price: 6490000,
    originalPrice: 6990000,
    description:
      "Ryzen 7 болон RTX 4070 Super видео картаар тоноглогдсон, 2K нягтралд тогтвортой өндөр FPS өгөх тоглоомын бэлэн компьютер. Угсралт, тест бүрэн хийгдсэн.",
    category: "prebuilt",
    image: "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&q=80&w=800",
    rating: 4.9,
    stock: 6,
    colors: ["Хар", "Цагаан"],
    features: [
      "RTX 4070 Super 12GB видео карт",
      "AMD Ryzen 7 7700 8 цөмт процессор",
      "32GB DDR5 хурдан санах ой",
      "1TB NVMe SSD + RGB агааржуулалт",
    ],
    specs: {
      "Процессор": "AMD Ryzen 7 7700 (8 цөм / 16 урсгал)",
      "Видео карт": "NVIDIA RTX 4070 Super 12GB",
      "Санах ой": "32GB DDR5 6000MHz",
      "Хадгалах": "1TB NVMe Gen4 SSD",
      "Тэжээл": "750W 80+ Gold",
    },
    isNew: true,
  },
  {
    id: "prebuilt-office-ryzen5",
    name: "Office Pro Ryzen 5 Бэлэн ПК",
    brand: "ZEN",
    price: 2290000,
    originalPrice: 2490000,
    description:
      "Оффис, сурах, өдөр тутмын хэрэглээнд төгс тохирох чимээгүй, найдвартай бэлэн компьютер. Олон цонх, видео уулзалтыг хялбар даана.",
    category: "prebuilt",
    image: "https://images.unsplash.com/photo-1593640408182-31c70c8268f5?auto=format&fit=crop&q=80&w=800",
    rating: 4.7,
    stock: 14,
    colors: ["Хар"],
    features: [
      "AMD Ryzen 5 5600G дотоод графиктай",
      "16GB DDR4 санах ой",
      "512GB NVMe SSD",
      "Чимээгүй, хэмнэлттэй тэжээл",
    ],
    specs: {
      "Процессор": "AMD Ryzen 5 5600G (6 цөм)",
      "График": "Radeon Vega дотоод",
      "Санах ой": "16GB DDR4 3200MHz",
      "Хадгалах": "512GB NVMe SSD",
      "Тэжээл": "450W 80+ Bronze",
    },
    isNew: false,
  },

  /* ───────────────────────── ПРОЦЕССОР (CPU) ───────────────────────── */
  {
    id: "cpu-ryzen7-7800x3d",
    name: "AMD Ryzen 7 7800X3D",
    brand: "AMD",
    price: 1150000,
    originalPrice: 1290000,
    description:
      "3D V-Cache технологитой, тоглоомд дэлхийд тэргүүлэгч гүйцэтгэлтэй 8 цөмт процессор. Бага илчтэй, өндөр хүчин чадал.",
    category: "cpu",
    image: "https://images.unsplash.com/photo-1555680202-c86f0e12f086?auto=format&fit=crop&q=80&w=800",
    rating: 5.0,
    stock: 10,
    features: [
      "8 цөм / 16 урсгал, 5.0GHz хүртэл",
      "96MB AMD 3D V-Cache",
      "AM5 суурьтай нийцтэй",
      "Тоглоомд маркетын тэргүүн",
    ],
    specs: {
      "Цөм / Урсгал": "8 / 16",
      "Давтамж": "4.2GHz Base / 5.0GHz Boost",
      "Кэш": "96MB L3 (3D V-Cache)",
      "Суурь": "AMD AM5",
      "TDP": "120W",
    },
    isNew: true,
  },
  {
    id: "cpu-intel-i5-13600k",
    name: "Intel Core i5-13600K",
    brand: "Intel",
    price: 980000,
    description:
      "Тоглоом болон бүтээмжийн ажилд гайхалтай тэнцвэр өгөх 14 цөмт процессор. Хурдтай, олон зориулалттай.",
    category: "cpu",
    image: "https://images.unsplash.com/photo-1597838816882-4435b1977fbe?auto=format&fit=crop&q=80&w=800",
    rating: 4.8,
    stock: 16,
    features: [
      "14 цөм (6P + 8E) / 20 урсгал",
      "5.1GHz хүртэл Turbo",
      "DDR4 ба DDR5 дэмжинэ",
      "LGA1700 суурьтай",
    ],
    specs: {
      "Цөм / Урсгал": "14 / 20",
      "Давтамж": "3.5GHz / 5.1GHz Boost",
      "Кэш": "24MB L3",
      "Суурь": "Intel LGA1700",
      "TDP": "125W",
    },
    isNew: false,
  },

  /* ───────────────────────── ЭХ ХАВТАН (MOTHERBOARD) ───────────────────────── */
  {
    id: "mb-msi-b650-tomahawk",
    name: "MSI MAG B650 Tomahawk WiFi",
    brand: "MSI",
    price: 720000,
    originalPrice: 790000,
    description:
      "Ryzen 7000 серийн процессоруудад зориулсан бат бөх VRM, WiFi 6E болон PCIe 4.0 дэмжлэгтэй ATX эх хавтан.",
    category: "motherboard",
    image: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=800",
    rating: 4.7,
    stock: 9,
    features: [
      "AMD AM5 суурь, DDR5 дэмжлэг",
      "WiFi 6E + 2.5G сүлжээ",
      "12+2+1 фазын тэжээлийн систем",
      "PCIe 4.0 M.2 хоёр слот",
    ],
    specs: {
      "Чипсет": "AMD B650",
      "Суурь": "AM5",
      "Санах ой": "4x DDR5, 128GB хүртэл",
      "Хэлбэр": "ATX",
      "Сүлжээ": "WiFi 6E, 2.5GbE",
    },
    isNew: false,
  },

  /* ───────────────────────── САНАХ ОЙ (RAM) ───────────────────────── */
  {
    id: "ram-corsair-vengeance-32",
    name: "Corsair Vengeance 32GB DDR5 6000MHz",
    brand: "Corsair",
    price: 480000,
    description:
      "Тоглоом болон бүтээмжийн ажилд зориулсан 6000MHz хурдтай, RGB гэрэлтүүлэгтэй 2x16GB DDR5 санах ойн иж бүрдэл.",
    category: "ram",
    image: "https://images.unsplash.com/photo-1562976540-1502c2145186?auto=format&fit=crop&q=80&w=800",
    rating: 4.8,
    stock: 20,
    features: [
      "32GB (2x16GB) DDR5",
      "6000MHz, CL30 хоцролт",
      "Intel XMP 3.0 / AMD EXPO",
      "iCUE RGB гэрэлтүүлэг",
    ],
    specs: {
      "Багтаамж": "32GB (2x16GB)",
      "Хурд": "6000MHz",
      "Хоцрол": "CL30",
      "Хүчдэл": "1.35V",
      "Төрөл": "DDR5",
    },
    isNew: false,
  },

  /* ───────────────────────── SSD ───────────────────────── */
  {
    id: "ssd-samsung-990-1tb",
    name: "Samsung 990 Pro 1TB NVMe SSD",
    brand: "Samsung",
    price: 420000,
    originalPrice: 460000,
    description:
      "PCIe 4.0-ийн хязгаарыг шавхсан, 7450MB/s унших хурдтай дээд зэрэглэлийн NVMe SSD. Систем болон тоглоомд хурдыг мэдрэгдтэл нэмнэ.",
    category: "ssd",
    image: "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?auto=format&fit=crop&q=80&w=800",
    rating: 4.9,
    stock: 25,
    features: [
      "7450MB/s унших хурд",
      "PCIe 4.0 Gen4 x4",
      "Дулаан зохицуулагч давхаргатай",
      "5 жилийн баталгаа",
    ],
    specs: {
      "Багтаамж": "1TB",
      "Интерфэйс": "PCIe 4.0 NVMe M.2",
      "Унших": "7450 MB/s",
      "Бичих": "6900 MB/s",
      "Хэлбэр": "M.2 2280",
    },
    isNew: true,
  },

  /* ───────────────────────── HDD ───────────────────────── */
  {
    id: "hdd-seagate-barracuda-2tb",
    name: "Seagate Barracuda 2TB HDD",
    brand: "Seagate",
    price: 220000,
    description:
      "Их хэмжээний өгөгдөл, тоглоомын сан хадгалахад тохиромжтой, найдвартай 7200RPM-ийн хатуу диск.",
    category: "hdd",
    image: "https://images.unsplash.com/photo-1544785349-c4a5301826fd?auto=format&fit=crop&q=80&w=800",
    rating: 4.5,
    stock: 18,
    features: [
      "2TB багтаамж",
      "7200RPM эргэлт",
      "256MB кэш",
      "SATA 6Gb/s холболт",
    ],
    specs: {
      "Багтаамж": "2TB",
      "Эргэлт": "7200 RPM",
      "Кэш": "256MB",
      "Интерфэйс": "SATA III 6Gb/s",
      "Хэлбэр": '3.5"',
    },
    isNew: false,
  },

  /* ───────────────────────── ВИДЕО КАРТ (GPU) ───────────────────────── */
  {
    id: "gpu-rtx-4070-super",
    name: "NVIDIA GeForce RTX 4070 Super 12GB",
    brand: "NVIDIA",
    price: 2490000,
    originalPrice: 2690000,
    description:
      "1440p тоглоомд төгс, DLSS 3 болон Ray Tracing бүрэн дэмждэг хүчирхэг видео карт. Бүтээмжийн ажилд ч маш сайн.",
    category: "gpu",
    image: "https://images.unsplash.com/photo-1591488320449-011701bb6704?auto=format&fit=crop&q=80&w=800",
    rating: 4.9,
    stock: 7,
    colors: ["Хар"],
    features: [
      "12GB GDDR6X санах ой",
      "DLSS 3 + Frame Generation",
      "Ray Tracing 3-р үе",
      "Чимээгүй 3 сэнстэй хөргөлт",
    ],
    specs: {
      "Чип": "NVIDIA AD104",
      "Санах ой": "12GB GDDR6X",
      "Bus": "192-bit",
      "Тэжээл": "650W санал болгоно",
      "Холболт": "PCIe 4.0, HDMI 2.1, 3x DP",
    },
    isNew: true,
  },
  {
    id: "gpu-rx-7800xt",
    name: "AMD Radeon RX 7800 XT 16GB",
    brand: "AMD",
    price: 2190000,
    description:
      "16GB их санах ойтой, 1440p тоглоомд гайхалтай үнэ-чанарын харьцаа өгөх видео карт. Ирээдүйн тоглоомд бэлэн.",
    category: "gpu",
    image: "https://images.unsplash.com/photo-1592669241067-9a3b6a3af52b?auto=format&fit=crop&q=80&w=800",
    rating: 4.7,
    stock: 8,
    colors: ["Хар", "Улаан"],
    features: [
      "16GB GDDR6 санах ой",
      "RDNA 3 архитектур",
      "FSR 3 дэмжлэг",
      "1440p-д өндөр FPS",
    ],
    specs: {
      "Чип": "AMD Navi 32",
      "Санах ой": "16GB GDDR6",
      "Bus": "256-bit",
      "Тэжээл": "700W санал болгоно",
      "Холболт": "PCIe 4.0, HDMI 2.1, 3x DP",
    },
    isNew: false,
  },

  /* ───────────────────────── ТЭЖЭЭЛ (PSU) ───────────────────────── */
  {
    id: "psu-corsair-rm850x",
    name: "Corsair RM850x 850W 80+ Gold",
    brand: "Corsair",
    price: 560000,
    description:
      "Бүрэн модульчлагдсан кабельтай, 80+ Gold гэрчилгээтэй, чимээгүй ажиллагаатай найдвартай тэжээл. Хүчирхэг угсралтад тохиромжтой.",
    category: "psu",
    image: "https://images.unsplash.com/photo-1624705013726-8afead36c9d8?auto=format&fit=crop&q=80&w=800",
    rating: 4.8,
    stock: 13,
    features: [
      "850W тогтвортой чадал",
      "80+ Gold үр ашиг",
      "Бүрэн модульчлагдсан кабель",
      "Чимээгүй 135мм сэнс",
    ],
    specs: {
      "Чадал": "850W",
      "Гэрчилгээ": "80+ Gold",
      "Кабель": "Бүрэн модульчлагдсан",
      "Сэнс": "135мм Zero RPM",
      "Баталгаа": "10 жил",
    },
    isNew: false,
  },

  /* ───────────────────────── ХӨРГӨЛТ (COOLER) ───────────────────────── */
  {
    id: "cooler-nzxt-kraken-x63",
    name: "NZXT Kraken X63 280mm AIO",
    brand: "NZXT",
    price: 690000,
    originalPrice: 750000,
    description:
      "280мм радиатортой шингэн хөргөлтийн систем. Процессорыг хүйтэн, чимээгүй байлгаж, RGB толгойгоор угсралтыг чимнэ.",
    category: "cooler",
    image: "https://images.unsplash.com/photo-1603732551658-5fabbefa84eb?auto=format&fit=crop&q=80&w=800",
    rating: 4.7,
    stock: 11,
    features: [
      "280мм радиатор, 2x140мм сэнс",
      "Эргэдэг RGB толгой",
      "CAM программаар удирдана",
      "Бүх орчин үеийн суурьтай нийц",
    ],
    specs: {
      "Төрөл": "AIO шингэн хөргөлт",
      "Радиатор": "280мм",
      "Сэнс": "2x 140мм Aer P",
      "Гэрэлтүүлэг": "Infinity Mirror RGB",
      "Баталгаа": "6 жил",
    },
    isNew: false,
  },

  /* ───────────────────────── КЭЙС (CASE) ───────────────────────── */
  {
    id: "case-lianli-o11-evo",
    name: "Lian Li O11 Dynamic EVO",
    brand: "Lian Li",
    price: 540000,
    description:
      "Хоёр талын шилэн хана, маш сайн агааржуулалттай, угсралтын уян хатан байдал өндөртэй дээд зэрэглэлийн кэйс.",
    category: "case",
    image: "https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?auto=format&fit=crop&q=80&w=800",
    rating: 4.9,
    stock: 9,
    colors: ["Хар", "Цагаан"],
    features: [
      "Хоёр талын битүү шилэн хана",
      "Урвуу болон стандарт угсралт",
      "10 хүртэл сэнс байрлуулна",
      "360мм радиатор багтана",
    ],
    specs: {
      "Хэлбэр": "Mid Tower (E-ATX хүртэл)",
      "Материал": "Хөнгөн цагаан + Tempered Glass",
      "Сэнс": "10 байрлал",
      "Радиатор": "360мм x 2",
      "I/O": "USB-C, 2x USB-A",
    },
    isNew: true,
  },

  /* ───────────────────────── ХУЛГАНА (MOUSE) ───────────────────────── */
  {
    id: "mouse-logitech-g502x",
    name: "Logitech G502 X Plus",
    brand: "Logitech",
    price: 290000,
    originalPrice: 320000,
    description:
      "LIGHTSPEED утасгүй холболт, HERO 25K мэдрэгч болон RGB-тэй домогт тоглоомын хулгана. 13 програмчлагдах товчтой.",
    category: "mouse",
    image: "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&q=80&w=800",
    rating: 4.8,
    stock: 22,
    colors: ["Хар", "Цагаан"],
    features: [
      "HERO 25K оптик мэдрэгч",
      "LIGHTSPEED утасгүй холболт",
      "LIGHTFORCE гибрид товчлуур",
      "13 програмчлагдах товч",
    ],
    specs: {
      "Мэдрэгч": "HERO 25,600 DPI",
      "Холболт": "LIGHTSPEED утасгүй / USB-C",
      "Товч": "13 програмчлагдах",
      "Батарей": "130 цаг хүртэл",
      "Жин": "106 грамм",
    },
    isNew: false,
  },

  /* ───────────────────────── ГАР (KEYBOARD) ───────────────────────── */
  {
    id: "keychron-q1-pro",
    name: "Keychron Q1 Pro",
    brand: "Keychron",
    price: 699000,
    originalPrice: 799000,
    description:
      "Металл биетэй, утасгүй механик гар. QMK/VIA дэмждэг тул товчлууруудыг бүрэн өөрийнхөөрөө програмчлах боломжтой.",
    category: "keyboard",
    image:
      "https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?auto=format&fit=crop&q=80&w=800",
    rating: 4.9,
    stock: 15,
    colors: ["Карбон Хар", "Мөнгөлөг Саарал", "Бүрхэг Цэнхэр"],
    features: [
      "Бүрэн CNC хөнгөн цагаан их бие",
      "Ажлын болон тоглоомын горимын Bluetooth 5.1",
      "Халуун солигддог (Hot-swappable) свитчүүд",
      "Өмнө зүг рүү харсан RGB гэрэлтүүлэг",
    ],
    specs: {
      "Бүтэц": "75% Хураангуй багтаамжтай",
      "Холболт": "Bluetooth 5.1 эсвэл Тусгай кабель",
      "Свитч төрөл": "Keychron K Pro Red/Brown",
      "Батарей": "4000 mAh (Гэрэлгүйгээр 300 цаг)",
    },
    isNew: false,
  },

  /* ───────────────────────── ЧИХЭВЧ (HEADSET) ───────────────────────── */
  {
    id: "sony-xm5",
    name: "Sony WH-1000XM5",
    brand: "Sony",
    price: 1399000,
    originalPrice: 1599000,
    description:
      "Салбартаа тэргүүлэгч ухаалаг дуу тусгаарлалт бүхий Sony-ийн шилдэг чихэвч. Гайхамшигт дуугаралт, утасгүй дамжуулалтын LDAC чанар.",
    category: "headset",
    image:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=800",
    rating: 4.7,
    stock: 22,
    colors: ["Хар", "Цагаан саарал", "Хөх"],
    features: [
      "Хос процессор бүхий Auto NC Optimizer дуу тусгаарлалт",
      "Маш хөнгөн, тухтай зөөлөн арьсан чихэвч",
      "8 микрофон бүхий тунгалаг ярианы систем",
      "Speak-to-Chat ухаалаг зогсолт",
    ],
    specs: {
      "Дууны драйвер": "30мм тусгай зохион бүтээгдсэн",
      "Батарей": "30 цаг (дуу тусгаарлагчтай)",
      "Холболт": "Bluetooth 5.2, Multipoint",
      "Жин": "250 грамм",
    },
    isNew: false,
  },
  {
    id: "airpods-max",
    name: "AirPods Max",
    brand: "Apple",
    price: 1999000,
    originalPrice: 2299000,
    description:
      "Дууны өндөр нягтрал болон идэвхтэй дуу чимээ тусгаарлагчийн (ANC) төгс хослол. Тансаг зэрэглэлийн материал, туйлын тухтай загвар.",
    category: "headset",
    image:
      "https://images.unsplash.com/photo-1613040809024-b4ef7ba99bc3?auto=format&fit=crop&q=80&w=800",
    rating: 4.8,
    stock: 18,
    colors: ["Сансрын Саарал", "Мөнгөлөг", "Ногоон", "Хөх", "Ягаан"],
    features: [
      "Идэвхтэй дуу чимээ тусгаарлагч (ANC)",
      "Орчны дууг нэвтрүүлэх тунгалаг горим",
      "Орон зайн дуугаралт (Spatial Audio)",
      "Толгойн хэлбэрт уусдаг торон дэр",
    ],
    specs: {
      "Холболт": "Bluetooth 5.0, Apple H1 чип",
      "Батарей": "20 цаг тасралтгүй ажиллана",
      "Цэнэглэлт": "Lightning",
      "Жин": "384.8 грамм",
    },
    isNew: false,
  },

  /* ───────────────────────── ЧАНГА ЯРИГЧ (SPEAKER) ───────────────────────── */
  {
    id: "marshall-stanmore",
    name: "Marshall Stanmore III",
    brand: "Marshall",
    price: 1350000,
    originalPrice: 1490000,
    description:
      "Marshall-ийн уламжлалт рок өнгө аясыг орчин үеийн утасгүй технологитой хослуулсан, дууны маш өндөр багтаамжтай гэр ахуйн спикер.",
    category: "speaker",
    image:
      "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&q=80&w=800",
    rating: 4.8,
    stock: 9,
    colors: ["Хар", "Цөцгийн өнгөтэй", "Браун"],
    features: [
      "Marshall-ийн өвөрмөц цэвэр, хүчирхэг басс дуугаралт",
      "Орчны цуурайг тэнцвэржүүлэх ухаалаг систем",
      "Bluetooth 5.2 утасгүй холболт",
      "Байгальд ээлтэй 70% дахин боловсруулсан материал",
    ],
    specs: {
      "Өсгөгч": "50W Woofer + 2x 15W Tweeter",
      "Давтамж": "45–20,000 Hz",
      "Холболтууд": "Bluetooth 5.2, 3.5мм Aux, RCA",
      "Жин": "4.25 кг",
    },
    isNew: false,
  },

  /* ───────────────────────── МИКРОФОН (MICROPHONE) ───────────────────────── */
  {
    id: "mic-hyperx-quadcast-s",
    name: "HyperX QuadCast S",
    brand: "HyperX",
    price: 380000,
    description:
      "Стрим, подкаст болон видео уулзалтад зориулсан RGB-тэй USB конденсатор микрофон. Дуу тусгаарлах суурьтай, чанартай дуу бичлэг.",
    category: "microphone",
    image: "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&q=80&w=800",
    rating: 4.7,
    stock: 16,
    colors: ["Хар"],
    features: [
      "4 чиглэлийн бичлэгийн горим",
      "Доргио шингээгч суурьтай",
      "Хүрэлцээний дуугүйжүүлэх товч",
      "RGB динамик гэрэлтүүлэг",
    ],
    specs: {
      "Төрөл": "Конденсатор, USB-C",
      "Горим": "Stereo, Omni, Cardioid, Bidirectional",
      "Дискретжилт": "48kHz / 16-bit",
      "Холболт": "USB-C",
      "Чихэвч гарц": "3.5мм мониторинг",
    },
    isNew: false,
  },

  /* ───────────────────────── ШИНЭ 4 БҮТЭЭГДЭХҮҮН ───────────────────────── */
  {
    id: "gpu-rtx-4090-founders",
    name: "NVIDIA GeForce RTX 4090 24GB",
    brand: "NVIDIA",
    price: 5990000,
    originalPrice: 6490000,
    description:
      "Ada Lovelace архитектур дээр суурилсан дэлхийн хамгийн хүчирхэг хэрэглэгчийн видео карт. 4K тоглоом, AI рендер, 3D бүтээлчид зориулагдсан.",
    category: "gpu",
    image: "https://images.unsplash.com/photo-1591488320449-011701bb6704?auto=format&fit=crop&q=80&w=800",
    rating: 5.0,
    stock: 4,
    colors: ["Хар"],
    features: [
      "24GB GDDR6X санах ой",
      "DLSS 3 + Frame Generation",
      "4K 120fps+ тоглоомд",
      "16,384 CUDA цөм",
    ],
    specs: {
      "Чип": "NVIDIA AD102",
      "Санах ой": "24GB GDDR6X 384-bit",
      "Тэжээл": "850W санал болгоно",
      "Холболт": "PCIe 4.0, HDMI 2.1, 3x DP 1.4a",
      "TDP": "450W",
    },
    isNew: true,
  },
  {
    id: "cpu-ryzen9-7950x3d",
    name: "AMD Ryzen 9 7950X3D",
    brand: "AMD",
    price: 2490000,
    originalPrice: 2790000,
    description:
      "16 цөм, 3D V-Cache технологитой AMD-ийн хамгийн хүчирхэг хэрэглэгчийн процессор. Тоглоом болон мэргэжлийн ажилд дэлхийд тэргүүлнэ.",
    category: "cpu",
    image: "https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?auto=format&fit=crop&q=80&w=800",
    rating: 5.0,
    stock: 6,
    features: [
      "16 цөм / 32 урсгал",
      "144MB нийт кэш (3D V-Cache)",
      "5.7GHz хүртэл Boost",
      "AM5 суурь, DDR5 дэмжлэг",
    ],
    specs: {
      "Цөм / Урсгал": "16 / 32",
      "Давтамж": "4.2GHz Base / 5.7GHz Boost",
      "Кэш": "144MB L3 (3D V-Cache)",
      "Суурь": "AMD AM5",
      "TDP": "120W",
    },
    isNew: true,
  },
  {
    id: "keyboard-razer-blackwidow-v4",
    name: "Razer BlackWidow V4 Pro",
    brand: "Razer",
    price: 890000,
    originalPrice: 990000,
    description:
      "Утасгүй механик тоглоомын гар. Razer Yellow свитч, Chroma RGB гэрэлтүүлэг, металл биетэй. 200 цагийн батарей.",
    category: "keyboard",
    image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&q=80&w=800",
    rating: 4.8,
    stock: 12,
    colors: ["Хар"],
    features: [
      "Razer Yellow утасгүй механик свитч",
      "2.4GHz HyperSpeed утасгүй холболт",
      "200 цагийн батарей хугацаа",
      "Chroma RGB 16.8 сая өнгө",
    ],
    specs: {
      "Свитч": "Razer Yellow Linear",
      "Холболт": "2.4GHz / Bluetooth / USB-C",
      "Батарей": "200 цаг (гэрэлгүйгээр)",
      "Товч": "110 + программчлах товч",
      "Хэлбэр": "Full-size",
    },
    isNew: true,
  },
  {
    id: "mouse-razer-deathadder-v3-pro",
    name: "Razer DeathAdder V3 Pro",
    brand: "Razer",
    price: 390000,
    originalPrice: 440000,
    description:
      "63 граммын хэт хөнгөн биетэй, Focus Pro 30K оптик мэдрэгчтэй мэргэжлийн тоглоомын хулгана. eSports-ийн дэлхийн шилдэг тамирчдын сонголт.",
    category: "mouse",
    image: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&q=80&w=800",
    rating: 4.9,
    stock: 18,
    colors: ["Хар", "Цагаан"],
    features: [
      "63 грамм хэт хөнгөн загвар",
      "Focus Pro 30,000 DPI оптик мэдрэгч",
      "HyperSpeed 2.4GHz утасгүй",
      "90 цагийн батарей",
    ],
    specs: {
      "Мэдрэгч": "Focus Pro 30K DPI",
      "Холболт": "HyperSpeed 2.4GHz / USB-C",
      "Батарей": "90 цаг",
      "Товч": "5 програмчлагдах",
      "Жин": "63 грамм",
    },
    isNew: true,
  },

  /* ───────────────────────── ВЭБ КАМЕР (CAMERA) ───────────────────────── */
  {
    id: "camera-logitech-brio-4k",
    name: "Logitech Brio 4K Webcam",
    brand: "Logitech",
    price: 450000,
    originalPrice: 490000,
    description:
      "4K Ultra HD нягтрал, HDR болон автомат гэрэл тохируулгатай мэргэжлийн вэб камер. Видео уулзалт, стримд төгс.",
    category: "camera",
    image: "https://images.unsplash.com/photo-1611532736597-de2d4265fba3?auto=format&fit=crop&q=80&w=800",
    rating: 4.6,
    stock: 12,
    colors: ["Хар"],
    features: [
      "4K Ultra HD 30fps бичлэг",
      "HDR болон RightLight 3",
      "Windows Hello нүүр таних",
      "5x тоон зум",
    ],
    specs: {
      "Нягтрал": "4K (4096x2160)",
      "Кадр": "30fps @ 4K, 90fps @ 720p",
      "Талбай": "65°/78°/90° сонголт",
      "Микрофон": "Хос чимээ багасгагч",
      "Холболт": "USB-C / USB-A",
    },
    isNew: false,
  },

  /* ───────────────────────── ХУЛГАНЫ ДЭВСГЭР (MOUSEPAD) ───────────────────────── */
  {
    id: "mousepad-steelseries-qck-xxl",
    name: "SteelSeries QcK XXL",
    brand: "SteelSeries",
    price: 150000,
    description:
      "Бүх ширээг бүрхэх том хэмжээтэй, нягт нэхмэл гадаргуутай тоглоомын хулганы дэвсгэр. Хулганы хөдөлгөөнийг нарийвчлалтай дамжуулна.",
    category: "mousepad",
    image: "https://images.unsplash.com/photo-1616499370260-485b3e5ed653?auto=format&fit=crop&q=80&w=800",
    rating: 4.8,
    stock: 30,
    colors: ["Хар"],
    features: [
      "900x400мм өргөн гадаргуу",
      "Нягт нэхмэл микро-сүлжээ",
      "Гулсдаггүй резинэн суурь",
      "Усанд тэсвэртэй өнгөлгөө",
    ],
    specs: {
      "Хэмжээ": "900 x 400 x 4мм",
      "Гадаргуу": "Нэхмэл даавуу",
      "Суурь": "Резинэн гулсдаггүй",
      "Ирмэг": "Энгийн (оёдолгүй)",
    },
    isNew: false,
  },
];
