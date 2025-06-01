import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { db } from '@/lib/prisma';
import { authOptions } from '@/app/api/auth/[...nextauth]/auth';

const bulkDeleteSchema = z.object({
  studentIds: z.array(z.string()),
});

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user || session.user.role !== 'ADMIN') {
      return new NextResponse('Unauthorized', { status: 403 });
    }

    const body = await req.json();
    const { studentIds } = bulkDeleteSchema.parse(body);

    // Delete students and their associated users in a transaction
    await db.$transaction(async (prisma) => {
      // First get the students to find their user IDs
      const students = await prisma.student.findMany({
        where: {
          id: {
            in: studentIds,
          },
        },
        select: {
          userId: true,
        },
      });

      const userIds = students.map(student => student.userId);

      // Delete students
      await prisma.student.deleteMany({
        where: {
          id: {
            in: studentIds,
          },
        },
      });

      // Delete associated users
      await prisma.user.deleteMany({
        where: {
          id: {
            in: userIds,
          },
        },
      });
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('[STUDENTS_BULK_DELETE]', error);
    return new NextResponse('Internal error', { status: 500 });
  }
} 