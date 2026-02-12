"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const isLoginPage = pathname === "/admin/login";

  useEffect(() => {
    if (loading || isLoginPage) return;
    if (!user) router.replace("/admin/login");
  }, [user, loading, router, isLoginPage]);

  if (isLoginPage) return <>{children}</>;
  if (loading) return <div className="p-8 text-slate-300">Chargement…</div>;
  if (!user) return null;
  return <>{children}</>;
}
