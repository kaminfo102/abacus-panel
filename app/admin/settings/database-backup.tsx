'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";

interface BackupInfo {
  name: string;
  path: string;
  date: string;
  size: number;
  recordCount: {
    users: number;
    activities: number;
    exams: number;
    examResults: number;
  };
}

export function DatabaseBackup() {
  const [backups, setBackups] = useState<BackupInfo[]>([]);
  const [selectedBackup, setSelectedBackup] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const fetchBackups = async () => {
    try {
      const response = await fetch('/api/admin/database');
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.details || data.error || 'خطای ناشناخته');
      }
      
      if (data.backups) {
        setBackups(data.backups);
      }
    } catch (error) {
      console.error('Error fetching backups:', error);
      toast({
        title: "خطا",
        description: error instanceof Error ? error.message : "در دریافت لیست نسخه‌های پشتیبان مشکلی پیش آمده است",
        variant: "destructive",
      });
    }
  };

  const createBackup = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/admin/database', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'backup' }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.details || data.error || 'خطای ناشناخته');
      }

      if (data.success) {
        toast({
          title: "موفق",
          description: "نسخه پشتیبان با موفقیت ایجاد شد",
        });
        fetchBackups();
      } else {
        throw new Error(data.error || 'خطای ناشناخته');
      }
    } catch (error) {
      console.error('Error creating backup:', error);
      toast({
        title: "خطا",
        description: error instanceof Error ? error.message : "در ایجاد نسخه پشتیبان مشکلی پیش آمده است",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const restoreBackup = async () => {
    if (!selectedBackup) {
      toast({
        title: "خطا",
        description: "لطفاً یک نسخه پشتیبان را انتخاب کنید",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/admin/database', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'restore',
          backupFile: selectedBackup,
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.details || data.error || 'خطای ناشناخته');
      }

      toast({
        title: "موفق",
        description: "بازیابی با موفقیت انجام شد",
      });
      
      // Refresh the list after successful restore
      await fetchBackups();
    } catch (error) {
      console.error('Error restoring backup:', error);
      toast({
        title: "خطا",
        description: error instanceof Error ? error.message : "در بازیابی نسخه پشتیبان مشکلی پیش آمده است",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const deleteBackup = async (backupPath: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/admin/database?file=${encodeURIComponent(backupPath)}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.details || data.error || 'خطای ناشناخته');
      }

      toast({
        title: "موفق",
        description: "نسخه پشتیبان با موفقیت حذف شد",
      });
      
      // Refresh the list after successful delete
      await fetchBackups();
    } catch (error) {
      console.error('Error deleting backup:', error);
      toast({
        title: "خطا",
        description: error instanceof Error ? error.message : "در حذف نسخه پشتیبان مشکلی پیش آمده است",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/admin/database', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.details || data.error || 'خطای ناشناخته');
      }

      toast({
        title: "موفق",
        description: "فایل پشتیبان با موفقیت آپلود شد",
      });

      // Refresh the list
      await fetchBackups();
    } catch (error) {
      console.error('Error uploading backup:', error);
      toast({
        title: "خطا",
        description: error instanceof Error ? error.message : "در آپلود فایل پشتیبان مشکلی پیش آمده است",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Fetch backups on component mount
  useEffect(() => {
    fetchBackups();
  }, []);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Card className="animate-fade-in delay-100">
      <CardHeader>
        <CardTitle>نسخه پشتیبان</CardTitle>
        <CardDescription>
          مدیریت نسخه‌های پشتیبان سیستم
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <Button 
              onClick={createBackup} 
              disabled={isLoading}
              variant="outline"
            >
              ایجاد نسخه پشتیبان
            </Button>
            <Button 
              onClick={fetchBackups} 
              disabled={isLoading}
              variant="ghost"
            >
              بروزرسانی لیست
            </Button>
            <div className="flex items-center gap-2">
              <Input
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                disabled={uploading}
                ref={fileInputRef}
                className="hidden"
                id="backup-upload"
              />
              <Button
                variant="outline"
                disabled={uploading}
                onClick={() => fileInputRef.current?.click()}
              >
                {uploading ? 'در حال آپلود...' : 'آپلود نسخه پشتیبان'}
              </Button>
            </div>
          </div>

          {backups.length > 0 && (
            <div className="space-y-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>تاریخ</TableHead>
                    <TableHead>حجم</TableHead>
                    <TableHead>کاربران</TableHead>
                    <TableHead>فعالیت‌ها</TableHead>
                    <TableHead>آزمون‌ها</TableHead>
                    <TableHead>نتایج</TableHead>
                    <TableHead>عملیات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {backups.map((backup) => (
                    <TableRow key={backup.path}>
                      <TableCell>{new Date(backup.date).toLocaleString('fa-IR')}</TableCell>
                      <TableCell>{formatFileSize(backup.size)}</TableCell>
                      <TableCell>{backup.recordCount.users}</TableCell>
                      <TableCell>{backup.recordCount.activities}</TableCell>
                      <TableCell>{backup.recordCount.exams}</TableCell>
                      <TableCell>{backup.recordCount.examResults}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button 
                                variant="destructive"
                                size="sm"
                                disabled={isLoading}
                                onClick={() => setSelectedBackup(backup.path)}
                              >
                                بازیابی
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>آیا از بازیابی اطمینان دارید؟</AlertDialogTitle>
                                <AlertDialogDescription>
                                  این عملیات تمام داده‌های فعلی را با داده‌های نسخه پشتیبان جایگزین می‌کند.
                                  این عملیات غیرقابل بازگشت است.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>انصراف</AlertDialogCancel>
                                <AlertDialogAction onClick={restoreBackup}>
                                  بازیابی
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>

                          <Button
                            variant="outline"
                            size="sm"
                            disabled={isLoading}
                            onClick={() => {
                              window.location.href = `/api/admin/database?download=${encodeURIComponent(backup.path)}`;
                            }}
                          >
                            دانلود
                          </Button>

                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button 
                                variant="outline"
                                size="sm"
                                disabled={isLoading}
                              >
                                حذف
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>آیا از حذف اطمینان دارید؟</AlertDialogTitle>
                                <AlertDialogDescription>
                                  این عملیات نسخه پشتیبان را برای همیشه حذف می‌کند.
                                  این عملیات غیرقابل بازگشت است.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>انصراف</AlertDialogCancel>
                                <AlertDialogAction onClick={() => deleteBackup(backup.path)}>
                                  حذف
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 