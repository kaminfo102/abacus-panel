import { notFound } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/auth';
import { db } from '@/lib/prisma';
import { EditPage } from './edit-page';

interface EditExamPageProps {
  params: {
    examId: string;
  };
}

export default async function EditExamPage({ params }: EditExamPageProps) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || session.user.role !== 'ADMIN') {
    notFound();
  }

  console.log('Fetching exam for edit:', params.examId);

  const exam = await db.exam.findUnique({
    where: {
      id: params.examId,
    },
    select: {
      id: true,
      title: true,
      digitCount: true,
      rowCount: true,
      itemsPerRow: true,
      timeLimit: true,
      operators: true,
      term: true,
      addSubQuestions: true,
      mulDivQuestions: true,
    }
  });

  if (!exam) {
    console.log('Exam not found');
    notFound();
  }

  console.log('Raw exam data:', JSON.stringify(exam, null, 2));

  // تبدیل داده‌ها برای نمایش در فرم
  const examData = {
    ...exam,
    timeLimit: exam.timeLimit,
    operators: exam.operators.split(','),
    addSubQuestions: typeof exam.addSubQuestions === 'string' 
      ? JSON.parse(exam.addSubQuestions)
      : exam.addSubQuestions || [],
    mulDivQuestions: typeof exam.mulDivQuestions === 'string'
      ? JSON.parse(exam.mulDivQuestions)
      : exam.mulDivQuestions || [],
  };

  console.log('Processed exam data:', JSON.stringify(examData, null, 2));

  return <EditPage examData={examData} />;
} 