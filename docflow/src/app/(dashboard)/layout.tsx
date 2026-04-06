"use client";

import React, { useEffect, useRef } from "react";
import { useSession, signOut } from "@/lib/auth-client";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { LayoutDashboard, FilePlus2, History, LogOut } from "lucide-react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "New Document", href: "/dashboard/new", icon: FilePlus2 },
  { label: "History", href: "/dashboard/history", icon: History },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const sidebarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isPending && !session) {
      router.push("/login");
    }
  }, [session, isPending, router]);

  useGSAP(() => {
    if (sidebarRef.current) {
      gsap.from(sidebarRef.current, {
        x: -50,
        opacity: 0,
        duration: 0.6,
        ease: "power3.out",
      });
    }
  }, []);

  if (isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center font-bold text-gray-500 bg-[#0a0a0a]">
        Loading DocFlow...
      </div>
    );
  }

  if (!session) return null;

  return (
    <div className="flex h-screen bg-[#0a0a0a] text-white overflow-hidden">
      {/* Sidebar */}
      <aside
        ref={sidebarRef}
        className="w-[220px] bg-[#0f0f0f] border-r border-white/10 flex flex-col justify-between"
      >
        <div>
          <div className="p-6">
            <h1 className="text-2xl font-bold text-white tracking-tight">DocFlow</h1>
          </div>
          <nav className="mt-4 flex flex-col gap-1 px-4">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors text-sm font-medium",
                    isActive
                      ? "text-white bg-blue-600/10 border-l-4 border-blue-600"
                      : "text-gray-400 hover:text-white hover:bg-white/5 border-l-4 border-transparent"
                  )}
                >
                  <Icon className="w-5 h-5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Navbar */}
        <header className="h-16 flex items-center justify-between px-8 border-b border-white/10 shrink-0">
          <div className="text-gray-400 text-sm font-medium">Workspace</div>
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium">{session.user?.name || session.user?.email}</span>
            <button
              onClick={() => signOut({ fetchOptions: { onSuccess: () => router.push("/auth/login") } })}
              className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-300 transition-colors rounded-lg hover:text-white hover:bg-red-500/20 group"
            >
              <LogOut className="w-4 h-4 group-hover:text-red-500 transition-colors" />
              Sign Out
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto w-full h-full p-8 md:p-12">
          {children}
        </main>
      </div>
    </div>
  );
}