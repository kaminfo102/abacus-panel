'use client';

import { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

interface Notification {
  id: string;
  title: string;
  message: string;
  createdAt: string;
  isRead: boolean;
}

interface NotificationDropdownProps {
  role: 'ADMIN' | 'STUDENT';
}

export function NotificationDropdown({ role }: NotificationDropdownProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await fetch('/api/notifications');
      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications);
        setUnreadCount(data.notifications.filter((n: Notification) => !n.isRead).length);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'PATCH',
      });
      if (response.ok) {
        setNotifications(notifications.map(notification =>
          notification.id === notificationId
            ? { ...notification, isRead: true }
            : notification
        ));
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead) {
      markAsRead(notification.id);
    }
    // در اینجا می‌توانید کاربر را به صفحه مربوطه هدایت کنید
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative h-9 w-9 hover:bg-primary/10 transition-colors"
        >
          <Bell className="h-5 w-5 text-primary" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[11px] font-bold text-white shadow-sm animate-pulse">
              {unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0 shadow-lg border-primary/20" align="end">
        <div className="flex items-center justify-between border-b p-4 bg-gradient-to-r from-primary/5 to-transparent">
          <h4 className="font-bold text-lg text-primary">اعلان‌ها</h4>
          {unreadCount > 0 && (
            <span className="text-sm font-medium text-primary">
              {unreadCount} اعلان جدید
            </span>
          )}
        </div>
        <ScrollArea className="h-[300px]">
          {notifications.length === 0 ? (
            <div className="p-8 text-center">
              <Bell className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
              <p className="text-sm text-muted-foreground">
                اعلان جدیدی وجود ندارد
              </p>
            </div>
          ) : (
            <div className="grid gap-2 p-3">
              {notifications.map((notification) => (
                <button
                  key={notification.id}
                  className={cn(
                    "flex flex-col items-start gap-2 rounded-lg p-4 text-right transition-all duration-200",
                    "hover:bg-primary/5 hover:shadow-sm border border-transparent",
                    !notification.isRead && "bg-primary/5 border-primary/10"
                  )}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex items-center gap-2 w-full">
                    <span className="font-extrabold text-right text-blue-600 text-lg">{notification.title}</span>
                    {!notification.isRead && (
                      <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed text-right w-full">
                    {notification.message.split('عنوان آزمون').map((part, index, array) => {
                      if (index === array.length - 1) return part;
                      return (
                        <>
                          {part}
                          <span className="font-bold text-blue-600">عنوان آزمون</span>
                        </>
                      );
                    })}
                  </p>
                  <span className="text-xs text-primary/70 font-medium text-right w-full">
                    {new Date(notification.createdAt).toLocaleDateString('fa-IR')}
                  </span>
                </button>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
} 