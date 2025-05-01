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
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import { Pencil, MoreHorizontal, Trash2, Search, Clock, Calculator } from 'lucide-react';

interface Exam {
  id: string;
  title: string;
  digitCount: number;
  rowCount: number;
  itemsPerRow: number;
  timeLimit: number;
  operators: string;
  term: string;
}

interface ExamTableProps {
  exams: Exam[];
}

export function ExamTable({ exams }: ExamTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [examToDelete, setExamToDelete] = useState<string | null>(null);
  const router = useRouter();

  const filteredExams = exams.filter((exam) => 
    exam.title.includes(searchTerm) || 
    exam.term.includes(searchTerm)
  );

  const handleEdit = (examId: string) => {
    router.push(`/admin/exams/${examId}/edit`);
  };

  const handleDelete = async () => {
    if (!examToDelete) return;

    try {
      const response = await fetch(`/api/exams/${examToDelete}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('مشکلی در حذف آزمون رخ داده است');
      }

      toast({
        title: 'موفقیت‌آمیز',
        description: 'آزمون با موفقیت حذف شد.',
      });

      router.refresh();
    } catch (error) {
      toast({
        title: 'خطا',
        description: 'مشکلی در حذف آزمون رخ داده است.',
        variant: 'destructive',
      });
    } finally {
      setExamToDelete(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="جستجوی آزمون..."
            className="w-full pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>عنوان</TableHead>
              <TableHead className="hidden md:table-cell">تعداد ارقام</TableHead>
              <TableHead className="hidden md:table-cell">تعداد ردیف</TableHead>
              <TableHead className="hidden md:table-cell">آیتم در ردیف</TableHead>
              <TableHead>زمان (ثانیه)</TableHead>
              <TableHead>عملگرها</TableHead>
              <TableHead>ترم</TableHead>
              <TableHead className="text-left">عملیات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredExams.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center">
                  آزمونی یافت نشد
                </TableCell>
              </TableRow>
            ) : (
              filteredExams.map((exam) => (
                <TableRow key={exam.id}>
                  <TableCell>{exam.title}</TableCell>
                  <TableCell className="hidden md:table-cell">{exam.digitCount}</TableCell>
                  <TableCell className="hidden md:table-cell">{exam.rowCount}</TableCell>
                  <TableCell className="hidden md:table-cell">{exam.itemsPerRow}</TableCell>
                  <TableCell>{exam.timeLimit}</TableCell>
                  <TableCell>{exam.operators}</TableCell>
                  <TableCell>{exam.term}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">منو</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEdit(exam.id)}>
                          <Pencil className="ml-2 h-4 w-4" />
                          ویرایش
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() => setExamToDelete(exam.id)}
                        >
                          <Trash2 className="ml-2 h-4 w-4" />
                          حذف
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={!!examToDelete} onOpenChange={(open) => !open && setExamToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>آیا از حذف این آزمون مطمئن هستید؟</AlertDialogTitle>
            <AlertDialogDescription>
              این عمل غیرقابل بازگشت است. آزمون و تمامی اطلاعات مرتبط با آن حذف خواهد شد.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>انصراف</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleDelete}
            >
              حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}