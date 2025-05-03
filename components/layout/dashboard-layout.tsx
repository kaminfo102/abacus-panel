'use client';

import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { UserRole } from '@prisma/client';
import { useState } from 'react';


import { authOptions } from '@/app/api/auth/[...nextauth]/auth';
import { Sidebar } from './sidebar';
import { Navbar } from './navbar';

interface DashboardLayoutProps {
  children: React.ReactNode;
  requiredRole: UserRole;
}

export function DashboardLayout({ 
  children, 
  requiredRole 
}: DashboardLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
      <div className="flex">
        <Sidebar role={requiredRole} isOpen={isSidebarOpen} onOpenChange={setIsSidebarOpen} />
        <div className="flex-1 transition-all duration-300">
          <Navbar role={requiredRole} onMenuClick={() => setIsSidebarOpen(true)} />
          <main className="p-4 md:p-8 min-h-screen">
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}