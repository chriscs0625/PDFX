"use client";

import React from "react";
import Link from "next/link";
import { useSession, signOut } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

export function Navbar() {
  const { data: session } = useSession();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push("/auth/login");
  };

  return (
    <div className="h-16 border-b flex items-center justify-between px-6 bg-white sticky top-0 z-10 w-full">
      <Link href="/" className="font-bold text-xl text-blue-600">DocFlow</Link>
      
      {session?.user && (
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-gray-700">{session.user.name || session.user.email}</span>
          <button onClick={handleSignOut} className="px-3 py-1 text-sm bg-red-50 text-red-600 rounded hover:bg-red-100 transition">Sign Out</button>
        </div>
      )}
    </div>
  );
}