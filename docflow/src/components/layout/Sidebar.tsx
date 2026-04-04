"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function Sidebar() {
  const pathname = usePathname();

  const links = [
    { name: "Dashboard", href: "/" },
    { name: "New Document", href: "/new" },
    { name: "History", href: "/history" }
  ];

  return (
    <aside className="w-64 bg-gray-50 border-r min-h-[calc(100vh-4rem)] p-4 flex flex-col gap-2">
      {links.map((link) => {
        const isActive = pathname === link.href;
        return (
          <Link 
            key={link.name} 
            href={link.href} 
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${isActive ? "bg-blue-100 text-blue-700" : "text-gray-700 hover:bg-gray-100"}`}
          >
            {link.name}
          </Link>
        )
      })}
    </aside>
  );
}