'use client';

import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { UserRole } from '@prisma/client';
import { useState } from 'react';

import { authOptions } from '@/app/api/auth/[...nextauth]/route';
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
    <div className="min-h-screen bg-background">
      <div className="flex">
        <Sidebar role={requiredRole} isOpen={isSidebarOpen} onOpenChange={setIsSidebarOpen} />
        <div className="flex-1 transition-all duration-300">
          <Navbar role={requiredRole} onMenuClick={() => setIsSidebarOpen(true)} />
          <main className="p-4 md:p-8 min-h-screen">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}