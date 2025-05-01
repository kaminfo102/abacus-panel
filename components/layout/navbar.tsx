'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { Menu, Bell, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { UserRole } from '@prisma/client';
import { signOut } from 'next-auth/react';

interface NavbarProps {
  role: UserRole;
  onMenuClick: () => void;
}

export function Navbar({ role, onMenuClick }: NavbarProps) {
  const pathname = usePathname();
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  const getPageTitle = () => {
    const path = pathname.split('/').pop();
    switch (path) {
      case 'dashboard':
        return 'داشبورد';
      case 'students':
        return 'مدیریت دانش‌آموزان';
      case 'activities':
        return 'فعالیت‌ها';
      case 'exams':
        return 'آزمون‌ها';
      case 'settings':
        return 'تنظیمات';
      case 'profile':
        return 'پروفایل';
      case 'messages':
        return 'پیام‌ها';
      default:
        return 'پنل مدیریت';
    }
  };

  return (
    <nav className="sticky top-0 z-30 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="flex items-center gap-2 md:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={onMenuClick}
            className="h-9 w-9"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>

        <div className="flex flex-1 items-center justify-between">
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-semibold">{getPageTitle()}</h1>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="relative h-9 w-9"
              onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            >
              <Bell className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground">
                3
              </span>
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9"
              onClick={() => signOut({ callbackUrl: '/' })}
            >
              <User className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
} 