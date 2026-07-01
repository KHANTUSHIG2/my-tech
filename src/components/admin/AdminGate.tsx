import React, { useState, useEffect } from "react";
import { ShieldCheck, ArrowLeft, KeyRound, ShieldAlert } from "lucide-react";
import { ADMIN_KEY } from "../../store";

interface AdminGateProps {
  onUnlock: () => void;
  onExit: () => void;
}

const LOCKOUT_KEY = "techstore_admin_lockout";
const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 15 * 60 * 1000; // 15 минут

function getLockout(): { attempts: number; until: number } {
  try {
    return JSON.parse(localStorage.getItem(LOCKOUT_KEY) || "{}");
  } catch {
    return { attempts: 0, until: 0 };
  }
}

export default function AdminGate({ onUnlock, onExit }: AdminGateProps) {
  const [key, setKey] = useState("");
  const [error, setError] = useState(false);
  const [remaining, setRemaining] = useState(0);

  // Countdown timer хасах
  useEffect(() => {
    const tick = () => {
      const { until } = getLockout();
      const left = Math.max(0, until - Date.now());
      setRemaining(left);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const isLocked = remaining > 0;
  const mins = Math.ceil(remaining / 60000);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLocked) return;

    const lockout = getLockout();
    const attempts = (lockout.attempts || 0) + 1;

    if (key === ADMIN_KEY) {
      // Амжилттай → тоолуурыг цэвэрлэнэ
      localStorage.removeItem(LOCKOUT_KEY);
      onUnlock();
      return;
    }

    // Буруу нууц үг
    const newLockout = {
      attempts,
      until: attempts >= MAX_ATTEMPTS ? Date.now() + LOCKOUT_MS : 0,
    };
    localStorage.setItem(LOCKOUT_KEY, JSON.stringify(newLockout));
    setError(true);
    setKey("");

    if (attempts >= MAX_ATTEMPTS) {
      setRemaining(LOCKOUT_MS);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white border border-slate-200 rounded-3xl shadow-xl p-7 text-center">
        <div className={`mx-auto h-14 w-14 rounded-2xl flex items-center justify-center mb-4 ${
          isLocked ? "bg-rose-600" : "bg-slate-900"
        }`}>
          {isLocked
            ? <ShieldAlert className="w-7 h-7 text-white" />
            : <ShieldCheck className="w-7 h-7 text-white" />
          }
        </div>

        <h1 className="text-xl font-extrabold text-slate-900">Админ нэвтрэлт</h1>

        {isLocked ? (
          <>
            <p className="text-sm text-rose-500 font-semibold mt-2">
              Хандалт түр хаагдлаа
            </p>
            <p className="text-xs text-slate-400 mt-1">
              {mins} минутын дараа дахин оролдоно уу.
            </p>
            <div className="mt-4 bg-rose-50 border border-rose-100 rounded-2xl py-4 px-5">
              <p className="text-2xl font-mono font-bold text-rose-600">
                {String(Math.floor(remaining / 60000)).padStart(2, "0")}:
                {String(Math.floor((remaining % 60000) / 1000)).padStart(2, "0")}
              </p>
              <p className="text-xs text-rose-400 mt-1">Үлдсэн хугацаа</p>
            </div>
          </>
        ) : (
          <>
            <p className="text-sm text-slate-400 mt-1">
              Үргэлжлүүлэхийн тулд нууц түлхүүрээ оруулна уу.
            </p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-3">
              <div className={`flex items-center gap-2.5 bg-slate-50 border rounded-xl px-3.5 ${
                error ? "border-rose-300" : "border-slate-200 focus-within:border-blue-400"
              }`}>
                <KeyRound className="w-4 h-4 text-slate-400" />
                <input
                  id="admin-key-input"
                  type="password"
                  autoFocus
                  placeholder="Нууц түлхүүр"
                  value={key}
                  onChange={(e) => { setKey(e.target.value); setError(false); }}
                  className="w-full bg-transparent border-none outline-none py-3 text-sm text-slate-800 placeholder-slate-400"
                />
              </div>

              {error && (
                <p className="text-xs text-rose-500 font-medium">
                  Түлхүүр буруу байна. {MAX_ATTEMPTS - (getLockout().attempts || 0)} оролдлого үлдсэн.
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
          </>
        )}

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
