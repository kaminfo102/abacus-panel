'use client';

import { usePathname, useRouter } from 'next/navigation';
import { Menu, User, LogOut, UserCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { UserRole } from '@prisma/client';
import { signOut } from 'next-auth/react';
import { NotificationDropdown } from '@/components/notifications/notification-dropdown';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface NavbarProps {
  role: UserRole;
  onMenuClick: () => void;
}

export function Navbar({ role, onMenuClick }: NavbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const basePath = role === 'ADMIN' ? '/admin' : '/student';

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
    <nav className="sticky top-0 z-30 w-full border-b bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:bg-gray-900/80 dark:border-gray-800 shadow-sm">
      <div className="container flex h-16 items-center">
        <div className="flex items-center gap-2 md:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={onMenuClick}
            className="h-10 w-10 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>

        <div className="flex flex-1 items-center justify-between">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              {getPageTitle()}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <NotificationDropdown role={role} />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-auto min-w-[160px] text-right border-gray-200 dark:border-gray-800">
                <DropdownMenuItem onClick={() => router.push(`${basePath}/profile`)} className="flex-row-reverse py-2.5">
                  <UserCircle className="ml-2 h-4 w-4" />
                  <span>پروفایل</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="flex-row-reverse text-red-600 focus:text-red-600 py-2.5"
                >
                  <LogOut className="ml-2 h-4 w-4" />
                  <span>خروج</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </nav>
  );
} 