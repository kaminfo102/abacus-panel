'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import { Pencil, Trash2, Search, ChevronUp, ChevronDown, Eye } from 'lucide-react';
import { StudentAddSubTable } from './StudentAddSubTable';
import { StudentMulDivTable } from './StudentMulDivTable';

interface Exam {
  id: string;
  title: string;
  digitCount: number;
  rowCount: number;
  itemsPerRow: number;
  timeLimit: number;
  operators: string;
  term: string;
  isActive: boolean;
  addSubQuestions?: string | {
    numbers: number[];
    operators: ('+' | '-')[];
    answer: number | '';
  }[];
  mulDivQuestions?: string | {
    numbers: number[];
    operators: ('×' | '÷')[];
    answer: number | '';
  }[];
}

interface ExamTableProps {
  exams: Exam[];
}

export function ExamTable({ exams }: ExamTableProps) {
  const { data: session } = useSession();
  const [searchTerm, setSearchTerm] = useState('');
  const [examToDelete, setExamToDelete] = useState<string | null>(null);
  const [examToPreview, setExamToPreview] = useState<Exam | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const router = useRouter();
  const itemsPerPage = 10;

  const filteredExams = exams
    .filter((exam) => 
      exam.title.includes(searchTerm) || 
      exam.term.includes(searchTerm)
    )
    .sort((a, b) => {
      if (sortOrder === 'asc') {
        return a.term.localeCompare(b.term);
      }
      return b.term.localeCompare(a.term);
    });

  const totalPages = Math.ceil(filteredExams.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedExams = filteredExams.slice(startIndex, startIndex + itemsPerPage);

  const handleSort = () => {
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
  };

  const handlePreview = (exam: Exam) => {
    const parsedExam = {
      ...exam,
      addSubQuestions: typeof exam.addSubQuestions === 'string' 
        ? JSON.parse(exam.addSubQuestions)
        : exam.addSubQuestions || [],
      mulDivQuestions: typeof exam.mulDivQuestions === 'string'
        ? JSON.parse(exam.mulDivQuestions)
        : exam.mulDivQuestions || [],
    };
    setExamToPreview(parsedExam);
  };

  const handleEdit = (examId: string) => {
    router.push(`/admin/exams/${examId}/edit`);
  };

  const handleDelete = async () => {
    if (!examToDelete) return;

    try {
      console.log('Deleting exam:', examToDelete);
      const response = await fetch(`/api/exams/${examToDelete}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Delete error:', errorText);
        throw new Error(errorText || 'مشکلی در حذف آزمون رخ داده است');
      }

      toast({
        title: 'موفقیت‌آمیز',
        description: 'آزمون با موفقیت حذف شد.',
      });

      router.refresh();
    } catch (error) {
      console.error('Delete error:', error);
      toast({
        title: 'خطا',
        description: error instanceof Error 
          ? error.message 
          : 'مشکلی در حذف آزمون رخ داده است.',
        variant: 'destructive',
      });
    } finally {
      setExamToDelete(null);
    }
  };

  const handleToggleActive = async (examId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/exams/${examId}/toggle`, {
        method: 'PATCH',
      });

      if (!response.ok) {
        throw new Error('مشکلی در تغییر وضعیت آزمون رخ داده است');
      }

      toast({
        title: 'موفقیت‌آمیز',
        description: `آزمون با موفقیت ${currentStatus ? 'غیرفعال' : 'فعال'} شد.`,
      });

      router.refresh();
    } catch (error) {
      console.error('Toggle error:', error);
      toast({
        title: 'خطا',
        description: error instanceof Error 
          ? error.message 
          : 'مشکلی در تغییر وضعیت آزمون رخ داده است.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center">
        <div className="relative w-full">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="جستجوی آزمون..."
            className="w-full pl-8 text-right"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-right w-[50px]">ردیف</TableHead>
              <TableHead className="text-right">عنوان</TableHead>
              <TableHead className="text-right hidden md:table-cell">تعداد ارقام</TableHead>
              <TableHead className="text-right hidden md:table-cell">تعداد ردیف</TableHead>
              <TableHead className="text-right hidden md:table-cell">آیتم در ردیف</TableHead>
              <TableHead className="text-right hidden sm:table-cell">زمان (ثانیه)</TableHead>
              <TableHead className="text-right hidden sm:table-cell">عملگرها</TableHead>
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
              <TableHead className="text-right">وضعیت</TableHead>
              <TableHead className="text-right">عملیات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedExams.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} className="text-center">
                  آزمونی یافت نشد
                </TableCell>
              </TableRow>
            ) : (
              paginatedExams.map((exam, index) => (
                <TableRow key={exam.id}>
                  <TableCell className="text-right font-medium">
                    {startIndex + index + 1}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    <div className="flex flex-col">
                      <span>{exam.title}</span>
                      <div className="text-xs text-muted-foreground md:hidden mt-1">
                        <span className="ml-2">زمان: {exam.timeLimit} ثانیه</span>
                        <span>عملگرها: {exam.operators}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right hidden md:table-cell">{exam.digitCount}</TableCell>
                  <TableCell className="text-right hidden md:table-cell">{exam.rowCount}</TableCell>
                  <TableCell className="text-right hidden md:table-cell">{exam.itemsPerRow}</TableCell>
                  <TableCell className="text-right hidden sm:table-cell">{exam.timeLimit}</TableCell>
                  <TableCell className="text-right hidden sm:table-cell">{exam.operators}</TableCell>
                  <TableCell className="text-right">{exam.term}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant={exam.isActive ? "default" : "secondary"}
                      size="sm"
                      onClick={() => handleToggleActive(exam.id, exam.isActive)}
                      className="w-24"
                    >
                      {exam.isActive ? 'فعال' : 'غیرفعال'}
                    </Button>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handlePreview(exam)}
                        className="hover:bg-primary/10"
                      >
                        <Eye className="h-4 w-4 text-primary" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(exam.id)}
                        className="hover:bg-primary/10"
                      >
                        <Pencil className="h-4 w-4 text-primary" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setExamToDelete(exam.id)}
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
              <TableCell colSpan={10} className="text-right">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
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
                    تعداد کل: {filteredExams.length} آزمون
                  </div>
                </div>
              </TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </div>

      <Dialog open={!!examToPreview} onOpenChange={(open) => !open && setExamToPreview(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-center">
              پیش‌نمایش آزمون: {examToPreview?.title}
            </DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            {examToPreview?.operators.includes('+') || examToPreview?.operators.includes('-') ? (
              <StudentAddSubTable
                questions={Array.isArray(examToPreview.addSubQuestions) ? examToPreview.addSubQuestions : []}
                answers={[]}
                setAnswers={() => {}}
                disabled={true}
                showAnswers={session?.user?.role === 'ADMIN'}
              />
            ) : null}
            {examToPreview?.operators.includes('*') || examToPreview?.operators.includes('/') ? (
              <StudentMulDivTable
                questions={Array.isArray(examToPreview.mulDivQuestions) ? examToPreview.mulDivQuestions : []}
                answers={[]}
                setAnswers={() => {}}
                disabled={true}
                showAnswers={session?.user?.role === 'ADMIN'}
              />
            ) : null}
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!examToDelete} onOpenChange={(open) => !open && setExamToDelete(null)}>
        <AlertDialogContent className="sm:max-w-[425px]">
          <div className="flex flex-col items-center space-y-4 py-4">
            <div className="rounded-full bg-destructive/10 p-3">
              <Trash2 className="h-6 w-6 text-destructive animate-pulse" />
            </div>
            <AlertDialogHeader className="text-center w-full">
              <AlertDialogTitle className="text-xl font-bold text-center">حذف آزمون</AlertDialogTitle>
              <AlertDialogDescription className="text-right mt-2 text-muted-foreground">
                آیا از حذف این آزمون مطمئن هستید؟
                <br />
                <span className="text-sm text-destructive mt-1 block">
                  این عمل غیرقابل بازگشت است و تمامی اطلاعات مرتبط با آزمون حذف خواهد شد.
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