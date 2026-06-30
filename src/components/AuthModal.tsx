import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Phone, Lock, User as UserIcon, LogIn } from "lucide-react";
import { supabase } from "../lib/supabase";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (message: string) => void;
}

type PhoneMode = "login" | "register";

export default function AuthModal({ isOpen, onClose, onSuccess }: AuthModalProps) {
  const [phoneMode, setPhoneMode] = useState<PhoneMode>("login");

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");

  const reset = () => {
    setName(""); setPhone(""); setPassword("");
    setError(""); setLoading(false); setGoogleLoading(false);
  };
  const close = () => { reset(); onClose(); };

  /* ── Google OAuth ── */
  const handleGoogle = async () => {
    setError("");
    setGoogleLoading(true);
    const { error: err } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin },
    });
    if (err) {
      setGoogleLoading(false);
      setError("Google нэвтрэлт амжилтгүй: " + err.message);
    }
    // Redirect болоход хуудас шинэчлэгдэнэ → App.tsx onAuthStateChange барина
  };

  /* ── Утас + Нууц үг: Нэвтрэх ── */
  const handlePhoneLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const digits = phone.trim().replace(/\D/g, "");
    if (digits.length !== 8) { setError("8 оронтой утасны дугаар оруулна уу."); return; }
    if (password.length < 6) { setError("Нууц үг хамгийн багадаа 6 тэмдэгт байна."); return; }
    setLoading(true);
    const { error: err } = await supabase.auth.signInWithPassword({
      email: `${digits}@ts.mn`,
      password,
    });
    setLoading(false);
    if (err) {
      setError("Утасны дугаар эсвэл нууц үг буруу байна.");
      return;
    }
    onSuccess("Амжилттай нэвтэрлээ.");
    close();
  };

  /* ── Утас + Нууц үг: Бүртгүүлэх ── */
  const handlePhoneRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const digits = phone.trim().replace(/\D/g, "");
    if (digits.length !== 8) { setError("8 оронтой утасны дугаар оруулна уу."); return; }
    if (password.length < 6) { setError("Нууц үг хамгийн багадаа 6 тэмдэгт байна."); return; }
    setLoading(true);
    const displayName = name.trim() || `+976${digits}`;
    const { data, error: err } = await supabase.auth.signUp({
      email: `${digits}@ts.mn`,
      password,
      options: { data: { full_name: displayName, phone: `+976${digits}` } },
    });
    setLoading(false);
    if (err) {
      if (err.message.toLowerCase().includes("already registered")) {
        setError("Энэ дугаар аль хэдийн бүртгэлтэй. Нэвтрэх таб руу орно уу.");
      } else {
        setError(err.message || "Бүртгэл үүсгэхэд алдаа гарлаа.");
      }
      return;
    }
    if (data.user) {
      await supabase.from("user_profiles").upsert({ id: data.user.id, name: displayName });
      onSuccess("Бүртгэл амжилттай үүслээ!");
      close();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={close}
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", stiffness: 220, damping: 24 }}
            className="relative bg-white rounded-[28px] w-full max-w-md overflow-hidden shadow-2xl z-10 border border-slate-100"
          >
            <button onClick={close}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-50 z-20">
              <X className="w-5 h-5" />
            </button>

            <div className="px-7 pt-8 pb-5">
              {/* Толгой */}
              <div className="text-center mb-6">
                <div className="mx-auto h-12 w-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-blue-400 flex items-center justify-center shadow-lg shadow-blue-500/20 mb-3">
                  <LogIn className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-extrabold text-slate-900">Нэвтрэх / Бүртгүүлэх</h3>
                <p className="text-xs text-slate-400 mt-1">ЦЭНХЭР ТЕХ дэлгүүрт тавтай морил</p>
              </div>

              {/* ── Google товч ── */}
              <button
                onClick={handleGoogle}
                disabled={googleLoading}
                className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-white border-2 border-slate-200 hover:border-slate-300 hover:bg-slate-50 disabled:opacity-60 rounded-2xl text-sm font-semibold text-slate-700 transition-all shadow-sm"
              >
                {googleLoading ? (
                  <Spinner className="text-slate-500" />
                ) : (
                  <GoogleIcon />
                )}
                {googleLoading ? "Google руу холбогдож байна..." : "Google-ээр нэвтрэх"}
              </button>

              {/* ── Хуваагч ── */}
              <div className="flex items-center gap-3 my-5">
                <div className="flex-1 h-px bg-slate-200" />
                <span className="text-xs text-slate-400 font-medium">эсвэл утасны дугаараар</span>
                <div className="flex-1 h-px bg-slate-200" />
              </div>

              {/* ── Утас tabs ── */}
              <div className="flex bg-slate-100 rounded-xl p-1 gap-1 mb-4">
                <button
                  onClick={() => { setPhoneMode("login"); setError(""); }}
                  className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                    phoneMode === "login"
                      ? "bg-white text-blue-600 shadow"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  Нэвтрэх
                </button>
                <button
                  onClick={() => { setPhoneMode("register"); setError(""); }}
                  className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                    phoneMode === "register"
                      ? "bg-white text-emerald-600 shadow"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  Бүртгүүлэх
                </button>
              </div>

              <AnimatePresence mode="wait">
                {/* ── Нэвтрэх форм ── */}
                {phoneMode === "login" && (
                  <motion.form key="login" onSubmit={handlePhoneLogin}
                    initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }} transition={{ duration: 0.15 }}
                    className="space-y-3">
                    <Field icon={<Phone className="w-4 h-4" />}>
                      <span className="text-slate-400 text-sm font-mono select-none pr-1">+976</span>
                      <input type="tel" placeholder="99112233" maxLength={8}
                        value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                        className="auth-field font-mono" autoFocus required />
                    </Field>
                    <Field icon={<Lock className="w-4 h-4" />}>
                      <input type="password" placeholder="Нууц үг"
                        value={password} onChange={(e) => setPassword(e.target.value)}
                        className="auth-field" required />
                    </Field>
                    {error && <ErrorMsg>{error}</ErrorMsg>}
                    <button type="submit" disabled={loading}
                      className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white rounded-xl text-sm font-bold transition-colors shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2">
                      {loading && <Spinner />}
                      {loading ? "Нэвтэрч байна..." : "Нэвтрэх"}
                    </button>
                  </motion.form>
                )}

                {/* ── Бүртгүүлэх форм ── */}
                {phoneMode === "register" && (
                  <motion.form key="register" onSubmit={handlePhoneRegister}
                    initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.15 }}
                    className="space-y-3">
                    <Field icon={<UserIcon className="w-4 h-4" />}>
                      <input type="text" placeholder="Таны нэр (заавал биш)"
                        value={name} onChange={(e) => setName(e.target.value)}
                        className="auth-field" />
                    </Field>
                    <Field icon={<Phone className="w-4 h-4" />}>
                      <span className="text-slate-400 text-sm font-mono select-none pr-1">+976</span>
                      <input type="tel" placeholder="99112233" maxLength={8}
                        value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                        className="auth-field font-mono" autoFocus required />
                    </Field>
                    <Field icon={<Lock className="w-4 h-4" />}>
                      <input type="password" placeholder="Нууц үг (6+ тэмдэгт)"
                        value={password} onChange={(e) => setPassword(e.target.value)}
                        className="auth-field" required />
                    </Field>
                    {error && <ErrorMsg>{error}</ErrorMsg>}
                    <button type="submit" disabled={loading}
                      className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-60 text-white rounded-xl text-sm font-bold transition-colors shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2">
                      {loading && <Spinner />}
                      {loading ? "Бүртгэж байна..." : "Бүртгүүлэх"}
                    </button>
                  </motion.form>
                )}
              </AnimatePresence>

              <p className="text-center text-[11px] text-slate-300 mt-5 pb-1">
                Нэвтэрснээр үйлчилгээний нөхцөлийг зөвшөөрч байна.
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

function Field({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2.5 bg-slate-50 border border-slate-200 rounded-xl px-3.5 focus-within:border-blue-400 transition-colors">
      <span className="text-slate-400">{icon}</span>
      {children}
    </div>
  );
}

function ErrorMsg({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs text-rose-500 font-medium bg-rose-50 px-3 py-2 rounded-lg">{children}</p>
  );
}

function Spinner({ className = "text-white" }: { className?: string }) {
  return (
    <svg className={`animate-spin w-4 h-4 ${className}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
    </svg>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
      <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4"/>
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
      <path d="M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z" fill="#FBBC05"/>
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.961L3.964 7.293C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
    </svg>
  );
}
