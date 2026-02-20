"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { BookOpen, Home, LogOut, Settings } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { ThemeToggle } from "./theme-toggle";

interface AppShellProps {
  children: React.ReactNode;
  hideNav?: boolean;
}

export function AppShell({ children, hideNav = false }: AppShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const { setTheme } = useTheme();

  // Sync theme from DB on mount
  useEffect(() => {
    const syncTheme = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: profile } = await supabase
        .from("profiles")
        .select("theme")
        .eq("id", user.id)
        .single();
      if (profile?.theme && (profile.theme === "light" || profile.theme === "dark")) {
        setTheme(profile.theme);
      }
    };
    syncTheme();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  const navItems = [
    { label: "Dashboard", href: "/app", icon: Home },
    { label: "Livros", href: "/app/books", icon: BookOpen },
    { label: "Ajustes", href: "/app/settings", icon: Settings },
  ];

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* Sidebar for Desktop */}
      {!hideNav && (
        <aside className="hidden md:flex w-64 flex-col fixed inset-y-0 left-0 border-r bg-surface z-50">
          <div className="flex h-16 items-center px-6 border-b">
            <Link href="/app" className="flex items-center gap-2">
              <span className="text-xl font-bold tracking-tight text-primary">Marcapágina</span>
            </Link>
          </div>

          <div className="flex-1 py-6 px-4 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <Icon className="h-5 w-5" />
                  {item.label}
                </Link>
              );
            })}
          </div>

          <div className="p-4 border-t">
            <ThemeToggle />

            <Button
              variant="ghost"
              className="w-full justify-start gap-3 rounded-xl text-muted-foreground hover:text-danger hover:bg-danger/10 cursor-pointer"
              onClick={handleLogout}
            >
              <LogOut className="h-5 w-5" />
              Sair
            </Button>
          </div>
        </aside>
      )}

      {/* Main Layout Wrapper */}
      <div className={cn("flex flex-col flex-1", !hideNav && "md:pl-64")}>
        {/* Topbar (Mobile Only) */}
        {!hideNav && (
          <header className="sticky top-0 z-40 w-full border-b bg-surface/80 backdrop-blur md:hidden">
            <div className="container flex h-16 items-center justify-between px-4 mx-auto max-w-lg">
              <Link href="/app" className="flex items-center gap-2">
                <span className="text-xl font-bold tracking-tight text-primary">Marcapágina</span>
              </Link>

              <Button variant="ghost" size="icon" onClick={handleLogout} title="Sair">
                <LogOut className="h-5 w-5 text-muted-foreground" />
              </Button>
            </div>
          </header>
        )}

        {/* Main Content */}
        <main className={cn("flex-1", !hideNav && "pb-20 md:pb-8")}>
          <div className={cn(
            "container px-4 py-8 mx-auto transition-all duration-500",
            hideNav ? "max-w-md" : "max-w-lg lg:max-w-5xl"
          )}>
            {children}
          </div>
        </main>

        {/* Mobile Nav */}
        {!hideNav && (
          <nav className="fixed bottom-0 left-0 z-40 w-full border-t bg-surface/80 backdrop-blur md:hidden">
            <div className="container flex h-16 items-center justify-around px-4 mx-auto max-w-lg">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex flex-col items-center gap-1 transition-colors",
                      isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="text-xs font-medium">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </nav>
        )}
      </div>
    </div>
  );
}
