"use client";

import { Button, Spinner } from "@heroui/react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect } from "react";

const adminNavItems = [
  { label: "Tổng quan", href: "/admin", icon: "📊" },
  { label: "Ngày chơi", href: "/admin/days", icon: "📅" },
  { label: "Câu hỏi", href: "/admin/questions", icon: "❓" },
  { label: "Kết quả", href: "/admin/results", icon: "🏆" },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  if (status === "loading" || !session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" color="current" />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <nav className="glass border-b border-white/5 py-3 px-4 sm:px-6 flex items-center justify-between">
        <div>
          <Link href="/admin" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-linear-to-br from-red-500 to-orange-500 flex items-center justify-center text-white font-bold text-sm">
              A
            </div>
            <span className="font-bold text-lg">Admin Panel</span>
          </Link>
        </div>

        <div className="hidden sm:flex items-center gap-6">
          {adminNavItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2 text-sm font-medium transition-colors ${
                pathname === item.href
                  ? "text-primary-400"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </div>

        <div>
          <Button
            onPress={() => router.push("/dashboard")}
            size="sm"
            variant="ghost"
          >
            ← Về Game
          </Button>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">{children}</main>
    </div>
  );
}
