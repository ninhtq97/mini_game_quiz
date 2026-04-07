"use client";

import { Avatar, Dropdown, Spinner } from "@heroui/react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { useEffect } from "react";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: "📊" },
  { label: "Chơi Quiz", href: "/play", icon: "🎮" },
  { label: "Bảng xếp hạng", href: "/leaderboard", icon: "🏆" },
  { label: "Lịch sử", href: "/history", icon: "📋" },
];

export default function GameLayout({
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
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-linear-to-br from-primary-500 to-neon-cyan flex items-center justify-center text-white font-bold text-sm">
              Q
            </div>
            <span className="font-bold text-lg hidden sm:block">MiniQuiz</span>
          </Link>
        </div>

        <div className="hidden sm:flex items-center gap-6">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2 text-sm font-medium transition-colors ${
                pathname.startsWith(item.href)
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
          <Dropdown>
            <Dropdown.Trigger>
              <Avatar
                size="sm"
                className="ring-2 ring-primary-500/30 hover:ring-primary-500/60 transition-all cursor-pointer outline-none"
              >
                <Avatar.Image
                  src={session.user?.image || undefined}
                  alt="USer"
                />
                <Avatar.Fallback>
                  {session.user?.name?.[0] || "U"}
                </Avatar.Fallback>
              </Avatar>
            </Dropdown.Trigger>
            <Dropdown.Popover
              placement="bottom end"
              className="glass border border-white/10 p-1 min-w-50 rounded-xl outline-none"
            >
              <Dropdown.Menu
                aria-label="User menu"
                className="p-1 outline-none flex flex-col gap-1"
              >
                <Dropdown.Item
                  id="profile"
                  className="flex flex-col items-start px-2 py-2 mb-1 border-b border-white/10 cursor-default outline-none"
                >
                  <p className="font-semibold">
                    {session.user?.name || "User"}
                  </p>
                  <p className="text-xs text-slate-400">
                    {session.user?.email}
                  </p>
                </Dropdown.Item>

                <Dropdown.Item
                  id="dashboard"
                  href="/dashboard"
                  className="px-2 py-1.5 rounded-lg hover:bg-white/10 cursor-pointer outline-none"
                >
                  📊 Dashboard
                </Dropdown.Item>

                <Dropdown.Item
                  id="history"
                  href="/history"
                  className="px-2 py-1.5 rounded-lg hover:bg-white/10 cursor-pointer outline-none"
                >
                  📋 Lịch sử
                </Dropdown.Item>

                {(session.user as { role?: string })?.role === "ADMIN" && (
                  <Dropdown.Item
                    id="admin"
                    href="/admin"
                    className="px-2 py-1.5 rounded-lg hover:bg-white/10 cursor-pointer outline-none text-warning"
                  >
                    ⚙️ Admin Panel
                  </Dropdown.Item>
                )}

                <Dropdown.Item
                  id="logout"
                  onPress={() => signOut({ callbackUrl: "/" })}
                  className="px-2 py-1.5 rounded-lg hover:bg-red-500/20 text-red-500 cursor-pointer outline-none mt-1 border-t border-white/10 pt-2"
                >
                  🚪 Đăng xuất
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown.Popover>
          </Dropdown>
        </div>
      </nav>

      {/* Mobile bottom nav */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-50 glass border-t border-white/5">
        <div className="flex justify-around py-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg text-xs transition-colors ${
                pathname.startsWith(item.href)
                  ? "text-primary-400"
                  : "text-slate-500"
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </div>
      </div>

      <main className="pb-20 sm:pb-0">{children}</main>
    </div>
  );
}
