'use client';

import { useState, useEffect } from 'react';
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
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import { Pencil, Trash2, Search, ChevronUp, ChevronDown, Eye, CheckCircle2, XCircle } from 'lucide-react';

interface Student {
  id: string;
  firstName: string;
  lastName: string;
  nationalId: string;
  mobileNumber: string;
  city: string;
  term: string;
  examResults: {
    id: string;
    score: number;
    examId: string;
    examTitle: string;
  }[];
  examResultsCount: number;
}

interface StudentTableProps {
  students: Student[];
}

const PAGE_SIZE_OPTIONS = [
  { value: '10', label: '10 دانش‌آموز' },
  { value: '20', label: '20 دانش‌آموز' },
  { value: '50', label: '50 دانش‌آموز' },
  { value: '100', label: '100 دانش‌آموز' },
  { value: 'all', label: 'همه' },
];

export function StudentTable({ students }: StudentTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [studentToDelete, setStudentToDelete] = useState<string | null>(null);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState('10');
  const [sortConfig, setSortConfig] = useState<{
    key: 'term' | 'city' | null;
    direction: 'asc' | 'desc';
  }>({
    key: null,
    direction: 'desc'
  });
  const [selectedCity, setSelectedCity] = useState<string>('all');
  const [selectedTerm, setSelectedTerm] = useState<string>('all');
  const [isClient, setIsClient] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Get unique cities and terms for filter options
  const cities = Array.from(new Set(students.map(student => student.city))).sort();
  const terms = Array.from(new Set(students.map(student => student.term))).sort();

  const filteredStudents = students
    .filter((student) => {
      const fullName = `${student.firstName} ${student.lastName}`;
      const matchesSearch = fullName.includes(searchTerm) ||
        student.nationalId.includes(searchTerm) ||
        student.mobileNumber.includes(searchTerm);
      
      const matchesCity = selectedCity === 'all' || student.city === selectedCity;
      const matchesTerm = selectedTerm === 'all' || student.term === selectedTerm;

      return matchesSearch && matchesCity && matchesTerm;
    })
    .sort((a, b) => {
      if (!sortConfig.key) return 0;
      
      const direction = sortConfig.direction === 'asc' ? 1 : -1;
      
      if (sortConfig.key === 'term') {
        return direction * a.term.localeCompare(b.term);
      }
      
      if (sortConfig.key === 'city') {
        return direction * a.city.localeCompare(b.city);
      }
      
      return 0;
    });

  const itemsPerPage = pageSize === 'all' ? filteredStudents.length : parseInt(pageSize);
  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedStudents = filteredStudents.slice(startIndex, startIndex + itemsPerPage);

  const handleSort = (key: 'term' | 'city') => {
    setSortConfig(current => ({
      key,
      direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleEdit = (studentId: string) => {
    router.push(`/admin/students/${studentId}/edit`);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedStudents(paginatedStudents.map(student => student.id));
    } else {
      setSelectedStudents([]);
    }
  };

  const handleSelectStudent = (studentId: string, checked: boolean) => {
    if (checked) {
      setSelectedStudents([...selectedStudents, studentId]);
    } else {
      setSelectedStudents(selectedStudents.filter(id => id !== studentId));
    }
  };

  const handlePageSizeChange = (value: string) => {
    setPageSize(value);
    setCurrentPage(1);
  };

  const handleDelete = async (studentIds: string[]) => {
    try {
      const response = await fetch('/api/students/bulk-delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ studentIds }),
      });

      if (!response.ok) {
        throw new Error('مشکلی در حذف دانش‌آموزان رخ داده است');
      }

      toast({
        title: 'موفقیت‌آمیز',
        description: 'دانش‌آموزان با موفقیت حذف شدند.',
      });

      setSelectedStudents([]);
      router.refresh();
    } catch (error) {
      toast({
        title: 'خطا',
        description: 'مشکلی در حذف دانش‌آموزان رخ داده است.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-4">
      {isClient ? (
        <>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex flex-col sm:flex-row gap-4 w-full">
              <div className="relative w-full sm:max-w-sm">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="جستجوی دانش‌آموز..."
                  className="w-full pl-8 text-right"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <Select value={selectedCity} onValueChange={setSelectedCity}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="شهرستان" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">همه شهرستان‌ها</SelectItem>
                    {cities.map((city) => (
                      <SelectItem key={city} value={city}>
                        {city}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedTerm} onValueChange={setSelectedTerm}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="ترم" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">همه ترم‌ها</SelectItem>
                    {terms.map((term) => (
                      <SelectItem key={term} value={term}>
                        {term}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            {selectedStudents.length > 0 && (
              <Button
                variant="destructive"
                onClick={() => setStudentToDelete('bulk')}
                className="flex items-center gap-2 w-full sm:w-auto"
              >
                <Trash2 className="h-4 w-4" />
                حذف {selectedStudents.length} دانش‌آموز
              </Button>
            )}
          </div>

          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[40px] sm:w-[50px]">
                    <Checkbox
                      checked={paginatedStudents.length > 0 && selectedStudents.length === paginatedStudents.length}
                      onCheckedChange={handleSelectAll}
                      aria-label="انتخاب همه"
                    />
                  </TableHead>
                  <TableHead className="text-right w-[40px] sm:w-[50px]">ردیف</TableHead>
                  <TableHead className="text-right">نام و نام‌خانوادگی</TableHead>
                  <TableHead className="text-right hidden sm:table-cell">کد ملی</TableHead>
                  <TableHead className="text-right hidden md:table-cell">شماره موبایل</TableHead>
                  <TableHead className="text-right hidden lg:table-cell cursor-pointer" onClick={() => handleSort('city')}>
                    <div className="flex items-center justify-end gap-1">
                      شهرستان
                      {sortConfig.key === 'city' && (
                        sortConfig.direction === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead className="text-right cursor-pointer" onClick={() => handleSort('term')}>
                    <div className="flex items-center justify-end gap-1">
                      ترم
                      {sortConfig.key === 'term' && (
                        sortConfig.direction === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead className="text-right">تعداد آزمون</TableHead>
                  <TableHead className="text-right w-[120px]">عملیات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedStudents.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center">
                      دانش‌آموزی یافت نشد
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedStudents.map((student, index) => {
                    const examResults = Array.isArray(student.examResults) ? student.examResults : [];
                    const examCount = examResults.length;
                    const hasExams = examCount > 0;

                    return (
                      <TableRow key={student.id}>
                        <TableCell>
                          <Checkbox
                            checked={selectedStudents.includes(student.id)}
                            onCheckedChange={(checked) => handleSelectStudent(student.id, checked as boolean)}
                            aria-label={`انتخاب ${student.firstName} ${student.lastName}`}
                          />
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {startIndex + index + 1}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          <div className="flex flex-col">
                            <span>{student.firstName} {student.lastName}</span>
                            <span className="text-xs text-muted-foreground sm:hidden">
                              {student.nationalId}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right hidden sm:table-cell">{student.nationalId}</TableCell>
                        <TableCell className="text-right hidden md:table-cell">{student.mobileNumber}</TableCell>
                        <TableCell className="text-right hidden lg:table-cell">{student.city}</TableCell>
                        <TableCell className="text-right">{student.term}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex flex-col items-center">
                            {hasExams ? (
                              <div className="flex items-center gap-2">
                                <CheckCircle2 className="h-5 w-5 text-green-500" />
                                <span className="text-sm">شرکت کرده ({examCount})</span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2">
                                <XCircle className="h-5 w-5 text-red-500" />
                                <span className="text-sm">شرکت نکرده</span>
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1 sm:gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => router.push(`/admin/students/${student.id}`)}
                              className="hover:bg-primary/10 h-8 w-8 sm:h-9 sm:w-9"
                            >
                              <Eye className="h-4 w-4 text-blue-500" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEdit(student.id)}
                              className="hover:bg-primary/10 h-8 w-8 sm:h-9 sm:w-9"
                            >
                              <Pencil className="h-4 w-4 text-primary" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setStudentToDelete(student.id)}
                              className="hover:bg-destructive/10 h-8 w-8 sm:h-9 sm:w-9"
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TableCell colSpan={8} className="text-right">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
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
                        <Select
                          value={pageSize}
                          onValueChange={handlePageSizeChange}
                        >
                          <SelectTrigger className="w-[150px]">
                            <SelectValue placeholder="تعداد در صفحه" />
                          </SelectTrigger>
                          <SelectContent>
                            {PAGE_SIZE_OPTIONS.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
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
                  <AlertDialogTitle className="text-xl font-bold text-center">
                    {studentToDelete === 'bulk' ? 'حذف دانش‌آموزان انتخاب شده' : 'حذف دانش‌آموز'}
                  </AlertDialogTitle>
                  <AlertDialogDescription className="text-right mt-2 text-muted-foreground">
                    {studentToDelete === 'bulk' 
                      ? `آیا از حذف ${selectedStudents.length} دانش‌آموز انتخاب شده مطمئن هستید؟`
                      : 'آیا از حذف این دانش‌آموز مطمئن هستید؟'}
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
                  onClick={() => {
                    if (studentToDelete === 'bulk') {
                      handleDelete(selectedStudents);
                    } else if (studentToDelete) {
                      handleDelete([studentToDelete]);
                    }
                    setStudentToDelete(null);
                  }}
                >
                  <Trash2 className="ml-2 h-5 w-5" />
                  حذف
                </AlertDialogAction>
                <AlertDialogCancel className="mt-0 min-w-[120px] h-10 text-base">انصراف</AlertDialogCancel>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </>
      ) : (
        <div className="flex items-center justify-center h-32">
          <div className="animate-pulse">در حال بارگذاری...</div>
        </div>
      )}
    </div>
  );
}