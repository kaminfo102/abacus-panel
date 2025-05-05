'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from '@/hooks/use-toast';
import { Pencil, Trash2, Search, ChevronUp, ChevronDown } from 'lucide-react';

interface Student {
  id: string;
  firstName: string;
  lastName: string;
  nationalId: string;
  mobileNumber: string;
  city: string;
  term: string;
}

interface StudentTableProps {
  students: Student[];
}

export function StudentTable({ students }: StudentTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [studentToDelete, setStudentToDelete] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const router = useRouter();
  const itemsPerPage = 10;

  const filteredStudents = students
    .filter((student) => {
      const fullName = `${student.firstName} ${student.lastName}`;
      return (
        fullName.includes(searchTerm) ||
        student.nationalId.includes(searchTerm) ||
        student.mobileNumber.includes(searchTerm)
      );
    })
    .sort((a, b) => {
      if (sortOrder === 'asc') {
        return a.term.localeCompare(b.term);
      }
      return b.term.localeCompare(a.term);
    });

  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedStudents = filteredStudents.slice(startIndex, startIndex + itemsPerPage);

  const handleSort = () => {
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
  };

  const handleEdit = (studentId: string) => {
    router.push(`/admin/students/${studentId}/edit`);
  };

  const handleDelete = async () => {
    if (!studentToDelete) return;

    try {
      const response = await fetch(`/api/students/${studentToDelete}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('مشکلی در حذف دانش‌آموز رخ داده است');
      }

      toast({
        title: 'موفقیت‌آمیز',
        description: 'دانش‌آموز با موفقیت حذف شد.',
      });

      router.refresh();
    } catch (error) {
      toast({
        title: 'خطا',
        description: 'مشکلی در حذف دانش‌آموز رخ داده است.',
        variant: 'destructive',
      });
    } finally {
      setStudentToDelete(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center">
        <div className="relative w-full max-w-sm">
          {/* <Search className="absolute right-2.5 top-2.5 h-4 w-4 text-muted-foreground" /> */}
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="جستجوی دانش‌آموز..."
            // className="w-full pr-8 text-right"
            className="w-full pl-8 text-right"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-right w-[50px]">ردیف</TableHead>
              <TableHead className="text-right">نام و نام‌خانوادگی</TableHead>
              <TableHead className="text-right">کد ملی</TableHead>
              <TableHead className="text-right hidden md:table-cell">شماره موبایل</TableHead>
              <TableHead className="text-right hidden md:table-cell">شهرستان</TableHead>
              <TableHead className="text-right">
                <Button
                  variant="ghost"
                  onClick={handleSort}
                  className="flex items-center gap-1"
                >
                  ترم
                  {sortOrder === 'asc' ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>
              </TableHead>
              <TableHead className="text-right">عملیات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedStudents.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center">
                  دانش‌آموزی یافت نشد
                </TableCell>
              </TableRow>
            ) : (
              paginatedStudents.map((student, index) => (
                <TableRow key={student.id}>
                  <TableCell className="text-right font-medium">
                    {startIndex + index + 1}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {student.firstName} {student.lastName}
                  </TableCell>
                  <TableCell className="text-right">{student.nationalId}</TableCell>
                  <TableCell className="text-right hidden md:table-cell">{student.mobileNumber}</TableCell>
                  <TableCell className="text-right hidden md:table-cell">{student.city}</TableCell>
                  <TableCell className="text-right">{student.term}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(student.id)}
                        className="hover:bg-primary/10"
                      >
                        <Pencil className="h-4 w-4 text-primary" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setStudentToDelete(student.id)}
                        className="hover:bg-destructive/10"
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell colSpan={7} className="text-right">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      قبلی
                    </Button>
                    <span className="text-sm text-muted-foreground">
                      صفحه {currentPage} از {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(currentPage + 1)}
                      disabled={currentPage === totalPages}
                    >
                      بعدی
                    </Button>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    تعداد کل: {filteredStudents.length} دانش‌آموز
                  </div>
                </div>
              </TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </div>

      <AlertDialog open={!!studentToDelete} onOpenChange={(open) => !open && setStudentToDelete(null)}>
        <AlertDialogContent className="sm:max-w-[425px]">
          <div className="flex flex-col items-center space-y-4 py-4">
            <div className="rounded-full bg-destructive/10 p-3">
              <Trash2 className="h-6 w-6 text-destructive animate-pulse" />
            </div>
            <AlertDialogHeader className="text-center w-full">
              <AlertDialogTitle className="text-xl font-bold text-center">حذف دانش‌آموز</AlertDialogTitle>
              <AlertDialogDescription className="text-right mt-2 text-muted-foreground">
                آیا از حذف این دانش‌آموز مطمئن هستید؟
                <br />
                <span className="text-sm text-destructive mt-1 block">
                  این عمل غیرقابل بازگشت است و تمامی اطلاعات مرتبط با دانش‌آموز حذف خواهد شد.
                </span>
              </AlertDialogDescription>
            </AlertDialogHeader>
          </div>
          <AlertDialogFooter className="flex-row-reverse justify-center gap-4 px-6 py-4">
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors min-w-[120px] h-10 text-base"
              onClick={handleDelete}
            >
              <Trash2 className="ml-2 h-5 w-5" />
              حذف
            </AlertDialogAction>
            <AlertDialogCancel className="mt-0 min-w-[120px] h-10 text-base">انصراف</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}