import React, { useState } from "react";
import { Plus, Trash2, Tag, RotateCcw } from "lucide-react";
import { addHeroBrand, deleteHeroBrand, resetHeroBrands } from "../../store";

interface AdminBrandsProps {
  brands: string[];
}

export default function AdminBrands({ brands }: AdminBrandsProps) {
  const [name, setName] = useState("");

  const handleAdd = () => {
    const n = name.trim();
    if (!n) return;
    addHeroBrand(n);
    setName("");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900">Брэндүүд</h2>
          <p className="text-sm text-slate-400">
            Эхлэл хуудасны брэнд гүйлгээнд (loop) гарах брэндүүд
          </p>
        </div>
        <button
          onClick={() => {
            if (confirm("Брэндүүдийг үндсэн жагсаалт руу буцаах уу?")) resetHeroBrands();
          }}
          className="flex items-center gap-1.5 px-3 py-2.5 bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:border-slate-300 rounded-xl text-sm font-semibold"
        >
          <RotateCcw className="w-4 h-4" />
          <span className="hidden sm:inline">Сэргээх</span>
        </button>
      </div>

      {/* Add brand */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5">
        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
          Шинэ брэнд нэмэх
        </label>
        <div className="flex gap-2 mt-2">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            placeholder="Жишээ: Razer"
            className="admin-input flex-grow"
          />
          <button
            onClick={handleAdd}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold whitespace-nowrap"
          >
            <Plus className="w-4 h-4" /> Нэмэх
          </button>
        </div>
      </div>

      {/* Brand list */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5">
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
          Идэвхтэй брэндүүд ({brands.length})
        </p>
        {brands.length === 0 ? (
          <p className="text-sm text-slate-400 py-6 text-center">Брэнд алга.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {brands.map((brand) => (
              <div
                key={brand}
                className="group flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl pl-3 pr-1.5 py-1.5"
              >
                <Tag className="w-3.5 h-3.5 text-blue-500" />
                <span className="text-sm font-semibold text-slate-700">{brand}</span>
                <button
                  onClick={() => deleteHeroBrand(brand)}
                  className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                  title="Устгах"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
