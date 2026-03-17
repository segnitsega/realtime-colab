"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect } from "react";

export default function DashboardPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const token = searchParams.get("token");
    const refreshToken = searchParams.get("refreshToken");

    if (typeof window !== "undefined" && (token || refreshToken)) {
      if (token) window.localStorage.setItem("token", token);
      if (refreshToken) window.localStorage.setItem("refreshToken", refreshToken);

      router.replace("/dashboard");
    }
  }, [searchParams, router]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex items-center justify-center">
      <h1 className="text-2xl font-semibold">Dashboard</h1>
    </div>
  );
}

