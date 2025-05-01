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
import { Pencil, MoreHorizontal, Trash2, Search } from 'lucide-react';

interface Activity {
  id: string;
  title: string;
  count: number;
  date: string;
  completionTime: string;
  score: number;
  term: string;
}

interface ActivityTableProps {
  activities: Activity[];
}

export function ActivityTable({ activities }: ActivityTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activityToDelete, setActivityToDelete] = useState<string | null>(null);
  const router = useRouter();

  const filteredActivities = activities.filter((activity) => 
    activity.title.includes(searchTerm) || 
    activity.term.includes(searchTerm)
  );

  const handleEdit = (activityId: string) => {
    router.push(`/admin/activities/${activityId}/edit`);
  };

  const handleDelete = async () => {
    if (!activityToDelete) return;

    try {
      const response = await fetch(`/api/activities/${activityToDelete}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('مشکلی در حذف فعالیت رخ داده است');
      }

      toast({
        title: 'موفقیت‌آمیز',
        description: 'فعالیت با موفقیت حذف شد.',
      });

      router.refresh();
    } catch (error) {
      toast({
        title: 'خطا',
        description: 'مشکلی در حذف فعالیت رخ داده است.',
        variant: 'destructive',
      });
    } finally {
      setActivityToDelete(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="جستجوی فعالیت..."
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
              <TableHead className="hidden md:table-cell">تعداد</TableHead>
              <TableHead className="hidden md:table-cell">تاریخ</TableHead>
              <TableHead className="hidden md:table-cell">زمان انجام</TableHead>
              <TableHead>امتیاز</TableHead>
              <TableHead>ترم</TableHead>
              <TableHead className="text-left">عملیات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredActivities.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center">
                  فعالیتی یافت نشد
                </TableCell>
              </TableRow>
            ) : (
              filteredActivities.map((activity) => (
                <TableRow key={activity.id}>
                  <TableCell>{activity.title}</TableCell>
                  <TableCell className="hidden md:table-cell">{activity.count}</TableCell>
                  <TableCell className="hidden md:table-cell">{activity.date}</TableCell>
                  <TableCell className="hidden md:table-cell">{activity.completionTime}</TableCell>
                  <TableCell>{activity.score}</TableCell>
                  <TableCell>{activity.term}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">منو</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEdit(activity.id)}>
                          <Pencil className="ml-2 h-4 w-4" />
                          ویرایش
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() => setActivityToDelete(activity.id)}
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

      <AlertDialog open={!!activityToDelete} onOpenChange={(open) => !open && setActivityToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>آیا از حذف این فعالیت مطمئن هستید؟</AlertDialogTitle>
            <AlertDialogDescription>
              این عمل غیرقابل بازگشت است. فعالیت و تمامی اطلاعات مرتبط با آن حذف خواهد شد.
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