"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function ErrorPage({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-white p-8 rounded-lg shadow-sm border text-center max-w-md w-full">
        <h2 className="text-2xl font-bold text-red-600 mb-4">Something went wrong</h2>
        <p className="text-gray-600 mb-6">{error.message || "An unexpected error occurred."}</p>
        <div className="flex gap-4 justify-center">
          <button onClick={() => reset()} className="px-4 py-2 bg-blue-600 text-white rounded">Try again</button>
          <Link href="/" className="px-4 py-2 border rounded text-gray-700 bg-gray-50">Go home</Link>
        </div>
      </div>
    </div>
  );
}