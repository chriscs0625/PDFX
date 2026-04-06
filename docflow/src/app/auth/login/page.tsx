"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import { signIn } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const cardRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    gsap.from('.auth-card', { y: 30, opacity: 0, duration: 0.6 });
  }, { scope: cardRef });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    const { error: signInError } = await signIn.email({ email, password });
    if (signInError) {
      setError("Invalid email or password");
      setIsLoading(false);
    } else {
      router.push("/dashboard");
    }
  };

  return (
    <div className="flex flex-col min-h-screen items-center justify-center bg-background" ref={cardRef}>
      <div className="auth-card w-full max-w-md bg-[#111111] rounded-2xl p-8 border border-white/10 shadow-2xl">
        <h1 className="text-2xl font-bold text-white mb-2 text-center">Welcome back</h1>
        <p className="text-gray-400 text-center mb-6">Log in to your account</p>
        
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Email</label>
            <input 
              type="email" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              required 
              className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Password</label>
            <input 
              type="password" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              required 
              className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500" 
            />
          </div>
          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition-colors mt-2 disabled:opacity-50"
          >
            {isLoading ? "Signing in..." : "Log in"}
          </button>
        </form>

        {error && <div className="mt-4 text-red-500 text-sm text-center">{error}</div>}

        <p className="mt-6 text-center text-sm text-gray-400">
          Don't have an account? <Link href="/auth/register" className="text-blue-500 hover:text-blue-400 hover:underline transition-colors">Sign up</Link>
        </p>
      </div>
    </div>
  );
}