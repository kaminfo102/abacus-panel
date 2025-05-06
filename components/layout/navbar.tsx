'use client';

import { usePathname, useRouter } from 'next/navigation';
import { Menu, User, LogOut, UserCircle, Home, LayoutDashboard, Users, Calendar, Settings, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { UserRole } from '@prisma/client';
import { signOut, useSession } from 'next-auth/react';
import { NotificationDropdown } from '@/components/notifications/notification-dropdown';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { db } from '@/lib/prisma';

interface NavbarProps {
  role: UserRole;
  onMenuClick: () => void;
}

export function Navbar({ role, onMenuClick }: NavbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  const basePath = role === 'ADMIN' ? '/admin' : '/student';
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);

  const isAdmin = role === 'ADMIN';
  const userImage = session?.user?.image;
  const userName = session?.user?.name;

  // Default avatar for students
  const defaultStudentAvatar = '/images/default-student.png';
  const defaultAdminAvatar = '/images/default-admin.png';

  useEffect(() => {
    const fetchStudentProfile = async () => {
      if (!isAdmin && session?.user?.email) {
        try {
          const student = await db.student.findFirst({
            where: {
              user: {
                email: session.user.email
              }
            },
            select: {
              profileImageUrl: true
            }
          });
          
          if (student?.profileImageUrl) {
            setProfileImage(student.profileImageUrl);
          }
        } catch (error) {
          console.error('Error fetching student profile:', error);
        }
      }
    };

    fetchStudentProfile();
  }, [isAdmin, session?.user?.email]);

  const adminRoutes = [
    { href: `${basePath}/dashboard`, label: 'داشبورد', icon: LayoutDashboard, color: 'text-blue-600 dark:text-blue-400' },
    { href: `${basePath}/students`, label: 'دانش‌آموزان', icon: Users, color: 'text-green-600 dark:text-green-400' },
    { href: `${basePath}/activities`, label: 'فعالیت‌ها', icon: Calendar, color: 'text-purple-600 dark:text-purple-400' },
    { href: `${basePath}/exams`, label: 'آزمون‌ها', icon: Calendar, color: 'text-orange-600 dark:text-orange-400' },
    { href: `${basePath}/settings`, label: 'تنظیمات', icon: Settings, color: 'text-gray-600 dark:text-gray-400' },
  ];

  const studentRoutes = [
    { href: `${basePath}/dashboard`, label: 'داشبورد', icon: LayoutDashboard, color: 'text-blue-600 dark:text-blue-400' },
    { href: `${basePath}/activities`, label: 'فعالیت‌ها', icon: Calendar, color: 'text-purple-600 dark:text-purple-400' },
    { href: `${basePath}/exams`, label: 'آزمون‌ها', icon: Calendar, color: 'text-orange-600 dark:text-orange-400' },
    { href: `${basePath}/messages`, label: 'پیام‌ها', icon: Bell, color: 'text-pink-600 dark:text-pink-400' },
    { href: `${basePath}/profile`, label: 'پروفایل', icon: User, color: 'text-indigo-600 dark:text-indigo-400' },
  ];

  const routes = isAdmin ? adminRoutes : studentRoutes;

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

  const getInitials = (name: string | null | undefined) => {
    if (!name) return 'کاربر';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  const getAvatarFallback = () => {
    if (isAdmin) {
      return (
        <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
          <UserCircle className="h-6 w-6" />
        </div>
      );
    }
    return (
      <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-green-500 to-emerald-600 text-white">
        <UserCircle className="h-6 w-6" />
      </div>
    );
  };

  const getAvatarImage = () => {
    if (isAdmin) {
      return userImage || defaultAdminAvatar;
    }
    return profileImage || defaultStudentAvatar;
  };

  return (
    <nav className="sticky top-0 z-30 w-full border-b bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:bg-gray-900/80 dark:border-gray-800 shadow-sm">
      <div className="container flex h-16 items-center">
        <div className="flex items-center gap-2 md:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="h-10 w-10 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>

        <div className="flex flex-1 items-center justify-between">
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-2">
            {routes.map((route) => (
              <Button
                key={route.href}
                variant="ghost"
                size="sm"
                onClick={() => router.push(route.href)}
                className={cn(
                  "h-10 px-4 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200",
                  pathname === route.href 
                    ? "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100" 
                    : "text-gray-600 dark:text-gray-400"
                )}
              >
                <route.icon className={cn("h-5 w-5 ml-2", route.color)} />
                <span className="font-medium">{route.label}</span>
              </Button>
            ))}
          </div>

          {/* Mobile Home Button - Centered */}
          <div className="md:hidden absolute left-1/2 transform -translate-x-1/2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push(`${basePath}/dashboard`)}
              className="h-10 w-10 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <Home className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </Button>
          </div>

          {/* Mobile Navigation */}
          {isMobileMenuOpen && (
            <div className="absolute top-16 right-0 left-0 bg-white dark:bg-gray-900 border-b dark:border-gray-800 md:hidden">
              <div className="container py-2">
                {routes.map((route) => (
                  <Button
                    key={route.href}
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      router.push(route.href);
                      setIsMobileMenuOpen(false);
                    }}
                    className={cn(
                      "w-full justify-start h-12 px-4 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200",
                      pathname === route.href 
                        ? "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100" 
                        : "text-gray-600 dark:text-gray-400"
                    )}
                  >
                    <route.icon className={cn("h-5 w-5 ml-2", route.color)} />
                    <span className="font-medium">{route.label}</span>
                  </Button>
                ))}
              </div>
            </div>
          )}

          <div className="flex-1 flex items-center justify-end gap-3">
            <NotificationDropdown role={role} />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 hover:bg-gray-100 dark:hover:bg-gray-800 relative"
                >
                  <Avatar className="h-8 w-8 border-2 border-gray-200 dark:border-gray-700">
                    <AvatarImage 
                      src={getAvatarImage()} 
                      alt={userName || 'کاربر'} 
                    />
                    <AvatarFallback>
                      {getAvatarFallback()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-auto min-w-[200px] text-right border-gray-200 dark:border-gray-800">
                <div className="flex items-center gap-3 p-2 border-b dark:border-gray-800">
                  <Avatar className="h-10 w-10 border-2 border-gray-200 dark:border-gray-700">
                    <AvatarImage 
                      src={getAvatarImage()} 
                      alt={userName || 'کاربر'} 
                    />
                    <AvatarFallback>
                      {getAvatarFallback()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="font-medium text-sm">{userName || 'کاربر'}</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">{isAdmin ? 'مدیر' : 'فراگیر'}</span>
                  </div>
                </div>
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