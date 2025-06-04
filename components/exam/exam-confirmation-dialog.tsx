'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Play } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function ExamConfirmationDialog({ examId }: { examId: string }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="w-full h-12 text-lg font-bold bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-300">
          <Play className="h-5 w-5 ml-2" />
          شروع آزمون
        </Button>
      </DialogTrigger>
      <DialogContent 
        className="w-[95%] max-w-[425px] p-4 sm:p-6 rounded-2xl"
        onPointerDownOutside={(e) => {
          e.preventDefault();
        }}
        onEscapeKeyDown={(e) => {
          e.preventDefault();
        }}
      >
        <DialogHeader className="space-y-4">
          <DialogTitle className="text-xl sm:text-2xl font-bold text-center text-emerald-600">نابغه کوچولو آماده ای؟</DialogTitle>
          <DialogDescription className="text-center">
            <div className="relative w-32 h-32 sm:w-48 sm:h-48 mx-auto mb-4">
              <Image
                src="/exam-confirmation.png"
                alt="آماده‌ای؟"
                fill
                className="object-contain"
                priority
              />
            </div>
            <p className="text-base sm:text-lg text-gray-700 dark:text-gray-300 mb-6 px-2 sm:px-4">
              استرس نداشته باش! حواست رو جمع کن و با آرامش شروع کن.
              <br />
              تو می‌تونی! 💪
            </p>
            <Link href={`/student/exams/${examId}`} className="block w-full">
              <Button className="w-full h-12 text-base sm:text-lg font-bold bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-300">
                بزن بریم! 🚀
              </Button>
            </Link>
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
} 