import { notFound } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/auth';
import { db } from '@/lib/prisma';
import { StudentDetailsClient } from './student-details-client';

interface StudentDetailsPageProps {
  params: {
    studentId: string;
  };
}

export default async function StudentDetailsPage({ params }: StudentDetailsPageProps) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || session.user.role !== 'ADMIN') {
    notFound();
  }

  console.log('Fetching student details for ID:', params.studentId);

  // Fetch student basic info
  const student = await db.student.findUnique({
    where: {
      id: params.studentId,
    },
  });

  if (!student) {
    console.log('Student not found');
    notFound();
  }

  // Fetch exam results for the student
  const examResults = await db.examResult.findMany({
    where: {
      studentId: params.studentId,
    },
    include: {
      exam: true, // Include exam details with results
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  // Convert Decimal types to string for serialization if necessary
  const studentData = JSON.parse(JSON.stringify(student, (key, value) => {
    if (typeof value === 'object' && value !== null && value.d) {
      return value.toString();
    }
    return value;
  }));

   const resultsData = JSON.parse(JSON.stringify(examResults, (key, value) => {
    if (typeof value === 'object' && value !== null && value.d) {
      return value.toString();
    }
    return value;
  }));

  console.log('Fetched student data:', JSON.stringify(studentData, null, 2));
  console.log('Fetched exam results:', JSON.stringify(resultsData, null, 2));

  return (
    <StudentDetailsClient student={studentData} examResults={resultsData} />
  );
} 