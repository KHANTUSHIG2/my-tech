import React, { useRef, useState } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  X,
  Eye,
  EyeOff,
  LayoutList,
  Sparkles,
  Star,
  GalleryHorizontalEnd,
  Upload,
  ImagePlus,
} from "lucide-react";
import { Product } from "../../types";
import {
  CustomSection,
  HomeFlags,
  BuiltinConfig,
  HeroSlide,
  addSection,
  updateSection,
  deleteSection,
  setHomeFlag,
  setBuiltinSelection,
  addHeroSlide,
  updateHeroSlide,
  deleteHeroSlide,
} from "../../store";

interface AdminSectionsProps {
  sections: CustomSection[];
  products: Product[];
  homeFlags: HomeFlags;
  builtinConfig: BuiltinConfig;
  heroSlides: HeroSlide[];
}

const BUILTIN_SECTIONS: {
  key: keyof BuiltinConfig;
  title: string;
  desc: string;
  icon: React.ElementType;
  toggleKey?: keyof HomeFlags;
}[] = [
  {
    key: "hero",
    title: "Hero слайдер (зураг солигч)",
    desc: "Дээд талын 3D слайдерт гарах бараа/зургууд",
    icon: GalleryHorizontalEnd,
    // Hero үргэлж харагдана — toggle байхгүй
  },
  {
    key: "newArrivals",
    title: "Шинэ бүтээгдэхүүн",
    desc: "Эхлэл хуудасны интерактив шинэ барааны showcase",
    icon: Sparkles,
    toggleKey: "newArrivals",
  },
  {
    key: "featured",
    title: "Онцлох бүтээгдэхүүн",
    desc: "Эхлэл хуудасны онцлох барааны карусель",
    icon: Star,
    toggleKey: "featured",
  },
];

type Draft = {
  id?: string;
  title: string;
  subtitle: string;
  productIds: string[];
  enabled: boolean;
};

const emptyDraft = (): Draft => ({
  title: "",
  subtitle: "",
  productIds: [],
  enabled: true,
});

export default function AdminSections({
  sections,
  products,
  homeFlags,
  builtinConfig,
  heroSlides,
}: AdminSectionsProps) {
  const [editing, setEditing] = useState<Draft | null>(null);
  // Үндсэн хэсгийн бараа сонгох picker
  const [picker, setPicker] = useState<{
    key: keyof BuiltinConfig;
    title: string;
    ids: string[];
  } | null>(null);
  // Hero слайдерын зураг upload manager нээлттэй эсэх
  const [heroOpen, setHeroOpen] = useState(false);
  const heroFileRef = useRef<HTMLInputElement>(null);

  // Сонгосон зургийн файлуудыг dataURL болгож hero slide болгон нэмнэ
  const handleHeroUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () =>
        addHeroSlide({ image: String(reader.result), title: "", subtitle: "" });
      reader.readAsDataURL(file);
    });
    e.target.value = "";
  };

  const togglePickerProduct = (id: string) =>
    setPicker((p) =>
      p
        ? {
            ...p,
            ids: p.ids.includes(id)
              ? p.ids.filter((x) => x !== id)
              : [...p.ids, id],
          }
        : p
    );

  const savePicker = () => {
    if (!picker) return;
    setBuiltinSelection(picker.key, picker.ids);
    setPicker(null);
  };

  const handleSave = () => {
    if (!editing) return;
    if (!editing.title.trim()) {
      alert("Хэсгийн гарчгийг оруулна уу.");
      return;
    }
    if (editing.id) {
      updateSection(editing.id, {
        title: editing.title.trim(),
        subtitle: editing.subtitle.trim(),
        productIds: editing.productIds,
        enabled: editing.enabled,
      });
    } else {
      addSection({
        title: editing.title.trim(),
        subtitle: editing.subtitle.trim(),
        productIds: editing.productIds,
        enabled: editing.enabled,
      });
    }
    setEditing(null);
  };

  const toggleProduct = (id: string) =>
    setEditing((d) =>
      d
        ? {
            ...d,
            productIds: d.productIds.includes(id)
              ? d.productIds.filter((x) => x !== id)
              : [...d.productIds, id],
          }
        : d
    );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900">Home хэсгүүд</h2>
          <p className="text-sm text-slate-400">
            Эхлэл хуудсанд гарах өөрийн хэсгүүдийг үүсгэх
          </p>
        </div>
        <button
          onClick={() => setEditing(emptyDraft())}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold"
        >
          <Plus className="w-4 h-4" /> Шинэ хэсэг
        </button>
      </div>

      {/* Үндсэн хэсгүүд (харуулах / нуух) */}
      <div>
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
          Үндсэн хэсгүүд
        </p>
        <div className="grid grid-cols-1 gap-4">
          {BUILTIN_SECTIONS.map((b) => {
            const enabled = b.toggleKey ? homeFlags[b.toggleKey] : true;
            const isHero = b.key === "hero";
            const count = isHero ? heroSlides.length : builtinConfig[b.key].length;
            return (
              <div
                key={b.key}
                className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-wrap items-center gap-3"
              >
                <div
                  className={`h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    enabled ? "bg-blue-50 text-blue-600" : "bg-slate-100 text-slate-400"
                  }`}
                >
                  <b.icon className="w-5 h-5" />
                </div>
                <div className="min-w-0 flex-grow">
                  <h4 className="font-bold text-slate-900 line-clamp-1">{b.title}</h4>
                  <p className="text-xs text-slate-400 line-clamp-1">{b.desc}</p>
                </div>

                <span className="text-xs font-mono text-slate-500 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-lg">
                  {count > 0
                    ? isHero
                      ? `${count} зураг`
                      : `${count} бараа сонгосон`
                    : "Автомат"}
                </span>

                {isHero ? (
                  <button
                    id="builtin-edit-hero"
                    onClick={() => setHeroOpen(true)}
                    className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors flex-shrink-0"
                  >
                    <ImagePlus className="w-3.5 h-3.5" /> Зураг засах
                  </button>
                ) : (
                  <button
                    id={`builtin-edit-${b.key}`}
                    onClick={() =>
                      setPicker({ key: b.key, title: b.title, ids: builtinConfig[b.key] })
                    }
                    className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors flex-shrink-0"
                  >
                    <Pencil className="w-3.5 h-3.5" /> Бараа засах
                  </button>
                )}

                {b.toggleKey && (
                  <button
                    id={`builtin-toggle-${b.toggleKey}`}
                    onClick={() => setHomeFlag(b.toggleKey!, !enabled)}
                    className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg transition-colors flex-shrink-0 ${
                      enabled
                        ? "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                        : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                    }`}
                  >
                    {enabled ? (
                      <>
                        <Eye className="w-3.5 h-3.5" /> Харагдаж байна
                      </>
                    ) : (
                      <>
                        <EyeOff className="w-3.5 h-3.5" /> Нуусан
                      </>
                    )}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Өөрийн үүсгэсэн хэсгүүд */}
      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
        Нэмэлт хэсгүүд
      </p>

      {sections.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center py-20 bg-white border border-dashed border-slate-200 rounded-3xl">
          <LayoutList className="w-12 h-12 text-slate-300 mb-4" />
          <h4 className="text-lg font-bold text-slate-700">Хэсэг алга</h4>
          <p className="text-sm text-slate-400 mt-1 max-w-sm">
            "Шинэ хэсэг" дарж эхлэл хуудсандаа онцлох бараануудын блок нэмээрэй.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sections.map((s) => (
            <div
              key={s.id}
              className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col gap-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <h4 className="font-bold text-slate-900 line-clamp-1">{s.title}</h4>
                  <p className="text-xs text-slate-400 line-clamp-1">
                    {s.subtitle || "—"}
                  </p>
                </div>
                <span
                  className={`text-[11px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${
                    s.enabled
                      ? "bg-emerald-50 text-emerald-600"
                      : "bg-slate-100 text-slate-400"
                  }`}
                >
                  {s.enabled ? "Идэвхтэй" : "Идэвхгүй"}
                </span>
              </div>

              <p className="text-xs text-slate-500">{s.productIds.length} бараа</p>

              <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                <button
                  onClick={() => updateSection(s.id, { enabled: !s.enabled })}
                  className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-blue-600 px-2 py-1.5 rounded-lg hover:bg-slate-50"
                >
                  {s.enabled ? (
                    <>
                      <EyeOff className="w-3.5 h-3.5" /> Нуух
                    </>
                  ) : (
                    <>
                      <Eye className="w-3.5 h-3.5" /> Харуулах
                    </>
                  )}
                </button>
                <button
                  onClick={() =>
                    setEditing({
                      id: s.id,
                      title: s.title,
                      subtitle: s.subtitle,
                      productIds: s.productIds,
                      enabled: s.enabled,
                    })
                  }
                  className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-blue-600 px-2 py-1.5 rounded-lg hover:bg-slate-50"
                >
                  <Pencil className="w-3.5 h-3.5" /> Засах
                </button>
                <button
                  onClick={() => {
                    if (confirm(`"${s.title}" хэсгийг устгах уу?`)) deleteSection(s.id);
                  }}
                  className="flex items-center gap-1.5 text-xs font-semibold text-rose-500 hover:text-rose-600 px-2 py-1.5 rounded-lg hover:bg-rose-50 ml-auto"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Устгах
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit / Add modal */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-white flex items-center justify-between p-5 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">
                {editing.id ? "Хэсэг засах" : "Шинэ хэсэг"}
              </h3>
              <button
                onClick={() => setEditing(null)}
                className="p-2 text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <label className="block">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Гарчиг
                </span>
                <input
                  value={editing.title}
                  onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                  placeholder="Жишээ: 7 хоногийн онцлох"
                  className="admin-input mt-1"
                />
              </label>

              <label className="block">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Дэд гарчиг
                </span>
                <input
                  value={editing.subtitle}
                  onChange={(e) => setEditing({ ...editing, subtitle: e.target.value })}
                  placeholder="Жишээ: Хямдралтай бараанууд"
                  className="admin-input mt-1"
                />
              </label>

              <div>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Бараа сонгох ({editing.productIds.length})
                </span>
                <div className="mt-2 max-h-64 overflow-y-auto border border-slate-200 rounded-xl divide-y divide-slate-100">
                  {products.map((p) => {
                    const checked = editing.productIds.includes(p.id);
                    return (
                      <label
                        key={p.id}
                        className="flex items-center gap-3 p-2.5 cursor-pointer hover:bg-slate-50"
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleProduct(p.id)}
                          className="h-4 w-4 accent-blue-600"
                        />
                        <img
                          src={p.image}
                          alt={p.name}
                          referrerPolicy="no-referrer"
                          className="h-8 w-8 rounded-lg object-cover border border-slate-100"
                        />
                        <span className="text-sm text-slate-700 line-clamp-1 flex-grow">
                          {p.name}
                        </span>
                        <span className="text-xs text-slate-400 font-mono">
                          {p.price.toLocaleString()} ₮
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={editing.enabled}
                  onChange={(e) => setEditing({ ...editing, enabled: e.target.checked })}
                  className="h-4 w-4 accent-blue-600"
                />
                <span className="text-sm text-slate-700 font-medium">
                  Эхлэл хуудсанд харуулах
                </span>
              </label>
            </div>

            <div className="sticky bottom-0 bg-white flex gap-3 p-5 border-t border-slate-100">
              <button
                onClick={() => setEditing(null)}
                className="flex-1 py-2.5 border border-slate-200 text-slate-600 rounded-xl text-sm font-semibold hover:bg-slate-50"
              >
                Болих
              </button>
              <button
                onClick={handleSave}
                className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold"
              >
                Хадгалах
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Үндсэн хэсгийн бараа сонгох picker modal */}
      {picker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-white flex items-center justify-between p-5 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-bold text-slate-900">{picker.title}</h3>
                <p className="text-xs text-slate-400">
                  Бараа сонгох ({picker.ids.length}) — хоосон бол автомат
                </p>
              </div>
              <button
                onClick={() => setPicker(null)}
                className="p-2 text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5">
              <div className="max-h-80 overflow-y-auto border border-slate-200 rounded-xl divide-y divide-slate-100">
                {products.map((p) => {
                  const checked = picker.ids.includes(p.id);
                  return (
                    <label
                      key={p.id}
                      className="flex items-center gap-3 p-2.5 cursor-pointer hover:bg-slate-50"
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => togglePickerProduct(p.id)}
                        className="h-4 w-4 accent-blue-600"
                      />
                      <img
                        src={p.image}
                        alt={p.name}
                        referrerPolicy="no-referrer"
                        className="h-9 w-9 rounded-lg object-cover border border-slate-100"
                      />
                      <span className="text-sm text-slate-700 line-clamp-1 flex-grow">
                        {p.name}
                      </span>
                      <span className="text-xs text-slate-400 font-mono">
                        {p.price.toLocaleString()} ₮
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="sticky bottom-0 bg-white flex gap-3 p-5 border-t border-slate-100">
              <button
                onClick={() => {
                  setBuiltinSelection(picker.key, []);
                  setPicker(null);
                }}
                className="px-4 py-2.5 border border-slate-200 text-slate-600 rounded-xl text-sm font-semibold hover:bg-slate-50"
              >
                Автомат болгох
              </button>
              <button
                onClick={savePicker}
                className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold"
              >
                Хадгалах
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hero слайдерын зураг upload manager */}
      {heroOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-white flex items-center justify-between p-5 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Hero слайдерын зураг</h3>
                <p className="text-xs text-slate-400">
                  Зураг upload хийнэ — хоосон бол шинэ бараанууд автоматаар гарна
                </p>
              </div>
              <button
                onClick={() => setHeroOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              {/* Upload товч */}
              <button
                id="hero-upload-btn"
                onClick={() => heroFileRef.current?.click()}
                className="w-full flex flex-col items-center justify-center gap-2 py-8 border-2 border-dashed border-slate-200 hover:border-blue-400 rounded-2xl text-slate-500 hover:text-blue-600 transition-colors"
              >
                <Upload className="w-7 h-7" />
                <span className="text-sm font-semibold">Зураг сонгож байршуулах</span>
                <span className="text-xs text-slate-400">Олон зураг зэрэг сонгож болно</span>
              </button>
              <input
                ref={heroFileRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleHeroUpload}
                className="hidden"
              />

              {/* Одоо байгаа слайдууд */}
              {heroSlides.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-4">
                  Одоогоор зураг байршуулаагүй байна.
                </p>
              ) : (
                <div className="space-y-3">
                  {heroSlides.map((slide) => (
                    <div
                      key={slide.id}
                      className="flex gap-3 p-3 border border-slate-200 rounded-2xl"
                    >
                      <img
                        src={slide.image}
                        alt="slide"
                        className="h-16 w-16 rounded-xl object-cover border border-slate-100 flex-shrink-0"
                      />
                      <div className="flex-grow space-y-2 min-w-0">
                        <input
                          value={slide.title}
                          onChange={(e) =>
                            updateHeroSlide(slide.id, { title: e.target.value })
                          }
                          placeholder="Гарчиг (заавал биш)"
                          className="admin-input text-sm py-1.5"
                        />
                        <input
                          value={slide.subtitle}
                          onChange={(e) =>
                            updateHeroSlide(slide.id, { subtitle: e.target.value })
                          }
                          placeholder="Дэд гарчиг (заавал биш)"
                          className="admin-input text-xs py-1.5"
                        />
                      </div>
                      <button
                        onClick={() => deleteHeroSlide(slide.id)}
                        className="p-2 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg self-start"
                        title="Устгах"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="sticky bottom-0 bg-white flex gap-3 p-5 border-t border-slate-100">
              <button
                onClick={() => setHeroOpen(false)}
                className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold"
              >
                Болсон
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
