'use client';

import { ExamForm } from '@/components/exam/exam-form';

interface EditPageProps {
  examData: any;
}

export function EditPage({ examData }: EditPageProps) {
  return (
    <div className="container mx-auto py-10">
      <ExamForm initialData={examData} />
    </div>
  );
} 