"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    setBusy(true);

    if (!isLogin) {
      try {
        const reg = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, password }),
        });
        if (!reg.ok) {
          const data = await reg.json().catch(() => ({}));
          setError(data.error || "Could not create the account");
          setBusy(false);
          return;
        }
      } catch {
        setError("Network error. Please try again.");
        setBusy(false);
        return;
      }
    }

    // تسجيل الدخول باستخدام NextAuth
    const res = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });

    setBusy(false);

    if (res?.error) {
      setError("Invalid email or password");
    } else {
      router.push("/"); // لو نجح، يرجع للصفحة الرئيسية
      router.refresh();
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-gray-50 px-4 py-12">
      <div className="bg-white p-8 md:p-12 rounded-lg shadow-sm w-full max-w-md border border-gray-100">
        
        <div className="text-center mb-8">
          <h1 className="text-3xl font-serif mb-2">
            {isLogin ? "Welcome Back" : "Create Account"}
          </h1>
          <p className="text-sm text-gray-500">
            {isLogin ? "Enter your details to sign in." : "Join us to enjoy a personalized experience."}
          </p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-500 p-3 rounded mb-4 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Full name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border border-gray-300 p-3 text-sm focus:outline-none focus:border-black transition-colors"
                placeholder="Your name"
                required
              />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">Email</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-300 p-3 text-sm focus:outline-none focus:border-black transition-colors" 
              placeholder="you@example.com" 
              required 
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-gray-300 p-3 text-sm focus:outline-none focus:border-black transition-colors" 
              placeholder="••••••••" 
              required 
              minLength={isLogin ? undefined : 8}
            />
            {!isLogin && <p className="text-xs text-gray-400 mt-1">At least 8 characters</p>}
          </div>

          <button 
            type="submit" 
            disabled={busy}
            className="w-full bg-[#000000] text-white py-4 font-semibold text-sm uppercase tracking-widest hover:bg-gray-800 transition-colors mt-2 disabled:opacity-60"
          >
            {busy ? "Please wait..." : isLogin ? "Sign In" : "Create Account"}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-600">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button 
            onClick={() => { setIsLogin(!isLogin); setError(""); }} 
            className="font-semibold text-black underline hover:text-gray-700"
          >
            {isLogin ? "Register" : "Sign In"}
          </button>
        </div>

      </div>
    </div>
  );
}