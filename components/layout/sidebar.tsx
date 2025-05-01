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
          "fixed inset-y-0 right-0 z-40 flex w-72 flex-col bg-white border-l shadow-lg dark:bg-gray-900 dark:border-gray-800",
          "transition-all duration-300 ease-in-out",
          "md:relative md:translate-x-0",
          isOpen ? "translate-x-0" : "translate-x-72"
        )}
      >
        <div className="flex h-16 items-center border-b px-6 dark:border-gray-800">
          <h2 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            {isAdmin ? 'پنل مدیریت' : 'پنل دانش‌آموز'}
          </h2>
        </div>
        <div className="flex-1 overflow-auto py-6">
          <nav className="grid gap-2 px-4">
            {routes.map((route) => (
              <Link
                key={route.href}
                href={route.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all duration-200",
                  pathname === route.href
                    ? "bg-blue-50 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200"
                )}
                onClick={() => {
                  if (isOpen) {
                    onOpenChange(false);
                  }
                }}
              >
                <route.icon className="h-5 w-5" />
                {route.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="border-t p-6 dark:border-gray-800">
          <Button
            variant="outline"
            className="w-full flex items-center justify-center gap-2 h-11 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/50"
            onClick={() => signOut({ callbackUrl: '/' })}
          >
            <LogOut className="h-5 w-5" />
            خروج
          </Button>
        </div>
      </div>
    </>
  );
}