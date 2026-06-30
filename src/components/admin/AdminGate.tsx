import React, { useState } from "react";
import { ShieldCheck, ArrowLeft, KeyRound } from "lucide-react";
import { ADMIN_KEY } from "../../store";

interface AdminGateProps {
  onUnlock: () => void;
  onExit: () => void;
}

export default function AdminGate({ onUnlock, onExit }: AdminGateProps) {
  const [key, setKey] = useState("");
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (key === ADMIN_KEY) {
      onUnlock();
    } else {
      setError(true);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white border border-slate-200 rounded-3xl shadow-xl p-7 text-center">
        <div className="mx-auto h-14 w-14 rounded-2xl bg-slate-900 flex items-center justify-center mb-4">
          <ShieldCheck className="w-7 h-7 text-white" />
        </div>
        <h1 className="text-xl font-extrabold text-slate-900">Админ нэвтрэлт</h1>
        <p className="text-sm text-slate-400 mt-1">
          Үргэлжлүүлэхийн тулд нууц түлхүүрээ оруулна уу.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-3">
          <div
            className={`flex items-center gap-2.5 bg-slate-50 border rounded-xl px-3.5 ${
              error ? "border-rose-300" : "border-slate-200 focus-within:border-blue-400"
            }`}
          >
            <KeyRound className="w-4 h-4 text-slate-400" />
            <input
              id="admin-key-input"
              type="password"
              autoFocus
              placeholder="Нууц түлхүүр"
              value={key}
              onChange={(e) => {
                setKey(e.target.value);
                setError(false);
              }}
              className="w-full bg-transparent border-none outline-none py-3 text-sm text-slate-800 placeholder-slate-400"
            />
          </div>

          {error && (
            <p className="text-xs text-rose-500 font-medium">
              Түлхүүр буруу байна.
            </p>
          )}

          <button
            id="admin-key-submit"
            type="submit"
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold transition-colors"
          >
            Нэвтрэх
          </button>
        </form>

        <button
          onClick={onExit}
          className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Дэлгүүр рүү буцах
        </button>
      </div>
    </div>
  );
}
