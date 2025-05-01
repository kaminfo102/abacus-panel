'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { UserRole } from '@prisma/client';
import { signOut } from 'next-auth/react';
import {
  LayoutDashboard,
  Users,
  Calendar,
  Settings,
  LogOut,
  Bell,
  User,
  AlertCircle,
} from 'lucide-react';
import { useState, useEffect } from 'react';

interface SidebarProps {
  role: UserRole;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function Sidebar({ role, isOpen, onOpenChange }: SidebarProps) {
  const pathname = usePathname();

  const isAdmin = role === 'ADMIN';
  const basePath = isAdmin ? '/admin' : '/student';

  const adminRoutes = [
    { href: `${basePath}/dashboard`, label: 'داشبورد', icon: LayoutDashboard },
    { href: `${basePath}/students`, label: 'دانش‌آموزان', icon: Users },
    { href: `${basePath}/activities`, label: 'فعالیت‌ها', icon: Calendar },
    { href: `${basePath}/exams`, label: 'آزمون‌ها', icon: Calendar },
    { href: `${basePath}/settings`, label: 'تنظیمات', icon: Settings },
  ];

  const studentRoutes = [
    { href: `${basePath}/dashboard`, label: 'داشبورد', icon: LayoutDashboard },
    { href: `${basePath}/activities`, label: 'فعالیت‌ها', icon: Calendar },
    { href: `${basePath}/exams`, label: 'آزمون‌ها', icon: Calendar },
    { href: `${basePath}/messages`, label: 'پیام‌ها', icon: Bell },
    { href: `${basePath}/profile`, label: 'پروفایل', icon: User },
  ];

  const routes = isAdmin ? adminRoutes : studentRoutes;

  // Prevent body scroll when sidebar is open (mobile)
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 backdrop-blur-sm transition-opacity duration-300 md:hidden"
          onClick={() => onOpenChange(false)}
          aria-label="بستن منو"
        />
      )}

      <div
        className={cn(
          "fixed inset-y-0 right-0 z-40 flex w-64 flex-col bg-white border-l shadow-sm dark:bg-gray-950 dark:border-gray-800",
          "transition-all duration-300 ease-in-out",
          "md:relative md:translate-x-0",
          isOpen ? "translate-x-0" : "translate-x-64"
        )}
      >
        <div className="flex h-16 items-center border-b px-4 dark:border-gray-800">
          <h2 className="text-lg font-bold">
            {isAdmin ? 'پنل مدیریت' : 'پنل دانش‌آموز'}
          </h2>
        </div>
        <div className="flex-1 overflow-auto py-4">
          <nav className="grid gap-1 px-2">
            {routes.map((route) => (
              <Link
                key={route.href}
                href={route.href}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors",
                  pathname === route.href
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground"
                )}
                onClick={() => {
                  if (isOpen) {
                    onOpenChange(false);
                  }
                }}
              >
                <route.icon className="h-4 w-4" />
                {route.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="border-t p-4 dark:border-gray-800">
          <Button
            variant="outline"
            className="w-full flex items-center justify-center gap-2"
            onClick={() => signOut({ callbackUrl: '/' })}
          >
            <LogOut className="h-4 w-4" />
            خروج
          </Button>
        </div>
      </div>
    </>
  );
}