"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import { signUp } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const cardRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    gsap.from('.auth-card', { y: 30, opacity: 0, duration: 0.6 });
  }, { scope: cardRef });

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    const { error: signUpError } = await signUp.email({ email, password, name });
    if (signUpError) {
      setError(signUpError.message || "Registration failed");
      setIsLoading(false);
    } else {
      router.push("/dashboard");
    }
  };

  return (
    <div className="flex flex-col min-h-screen items-center justify-center bg-background" ref={cardRef}>
      <div className="auth-card w-full max-w-md bg-[#111111] rounded-2xl p-8 border border-white/10 shadow-2xl">
        <h1 className="text-2xl font-bold text-white mb-2 text-center">Join DocFlow</h1>
        <p className="text-gray-400 text-center mb-6">Create an account to get started</p>
        
        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Name</label>
            <input 
              value={name} 
              onChange={e => setName(e.target.value)} 
              required 
              className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500" 
            />
          </div>
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
              minLength={8} 
              className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500" 
            />
          </div>
          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition-colors mt-2 disabled:opacity-50"
          >
            {isLoading ? "Creating account..." : "Create account"}
          </button>
        </form>

        {error && <div className="mt-4 text-red-500 text-sm text-center">{error}</div>}

        <p className="mt-6 text-center text-sm text-gray-400">
          Already have an account? <Link href="/auth/login" className="text-blue-500 hover:text-blue-400 hover:underline transition-colors">Log in</Link>
        </p>
      </div>
    </div>
  );
}