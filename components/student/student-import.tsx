'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Upload, Download } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import * as XLSX from 'xlsx';

export function StudentImport() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (formData: FormData) => {
    setIsLoading(true);
    
    try {
      const file = formData.get('file') as File;
      if (!file) {
        toast({
          title: 'خطا',
          description: 'لطفاً یک فایل انتخاب کنید',
          variant: 'destructive',
        });
        return;
      }

      const response = await fetch('/api/students/import', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('خطا در آپلود فایل');
      }

      const result = await response.json();
      
      toast({
        title: 'نتیجه آپلود',
        description: `${result.success} دانش‌آموز با موفقیت اضافه شد. ${result.failed} دانش‌آموز با خطا مواجه شد.`,
      });

      if (result.errors.length > 0) {
        toast({
          title: 'خطاها',
          description: result.errors.join('\n'),
          variant: 'destructive',
        });
      }

      router.refresh();
    } catch (error) {
      toast({
        title: 'خطا',
        description: 'مشکلی در آپلود فایل رخ داده است',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const downloadSampleFile = () => {
    // Sample data
    const data = [
      {
        firstName: 'علی',
        lastName: 'محمدی',
        nationalId: '1234567890',
        mobileNumber: '09123456789',
        dateOfBirth: '1380-01-01',
        city: 'سنندج',
        term: 'استارتر'
      },
      {
        firstName: 'سارا',
        lastName: 'احمدی',
        nationalId: '0987654321',
        mobileNumber: '09123456788',
        dateOfBirth: '1381-02-02',
        city: 'سقز',
        term: 'ترم 1'
      }
    ];

    // Create worksheet
    const ws = XLSX.utils.json_to_sheet(data);

    // Create workbook
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'دانش‌آموزان');

    // Generate Excel file
    XLSX.writeFile(wb, 'نمونه_دانش_آموزان.xlsx');
  };

  return (
    <div className="flex gap-4">
      <form action={handleSubmit} className="flex gap-4">
        <Input
          type="file"
          name="file"
          accept=".xlsx,.xls"
          className="hidden"
          id="file-upload"
        />
        <Button
          type="button"
          variant="outline"
          onClick={() => document.getElementById('file-upload')?.click()}
          disabled={isLoading}
        >
          <Upload className="ml-2 h-4 w-4" />
          آپلود فایل اکسل
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'در حال آپلود...' : 'ذخیره'}
        </Button>
      </form>
      <Button
        type="button"
        variant="outline"
        onClick={downloadSampleFile}
        disabled={isLoading}
      >
        <Download className="ml-2 h-4 w-4" />
        دانلود نمونه فایل
      </Button>
    </div>
  );
} 