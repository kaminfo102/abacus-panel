import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

export default async function AdminSettings() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || session.user.role !== 'ADMIN') {
    redirect('/');
  }

  return (
    <DashboardLayout requiredRole="ADMIN">
      <div className="page-transition space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">تنظیمات</h1>
          <p className="text-muted-foreground">
            تنظیمات و پیکربندی سیستم
          </p>
        </div>

        <Card className="animate-fade-in">
          <CardHeader>
            <CardTitle>تنظیمات سیستم</CardTitle>
            <CardDescription>
              پیکربندی عمومی سیستم مدیریت دانش‌آموزان
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="dark-mode">حالت تاریک</Label>
                <p className="text-sm text-muted-foreground">
                  فعال‌سازی حالت تاریک برای سیستم
                </p>
              </div>
              <Switch id="dark-mode" />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="notifications">اعلان‌ها</Label>
                <p className="text-sm text-muted-foreground">
                  فعال‌سازی اعلان‌ها برای رویدادهای سیستم
                </p>
              </div>
              <Switch id="notifications" defaultChecked />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="auto-logout">خروج خودکار</Label>
                <p className="text-sm text-muted-foreground">
                  خروج خودکار پس از 30 دقیقه عدم فعالیت
                </p>
              </div>
              <Switch id="auto-logout" defaultChecked />
            </div>
          </CardContent>
        </Card>
        
        <Card className="animate-fade-in delay-100">
          <CardHeader>
            <CardTitle>نسخه پشتیبان</CardTitle>
            <CardDescription>
              مدیریت نسخه‌های پشتیبان سیستم
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                از اطلاعات سیستم نسخه پشتیبان تهیه کنید
              </p>
              <Button variant="outline">ایجاد نسخه پشتیبان</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}