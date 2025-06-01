import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { db } from '@/lib/prisma';
import { authOptions } from '@/app/api/auth/[...nextauth]/auth';

export async function DELETE(
  req: Request,
  { params }: { params: { resultId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user || session.user.role !== 'ADMIN') {
      return new NextResponse('Unauthorized', { status: 403 });
    }

    await db.examResult.delete({
      where: {
        id: params.resultId,
      },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('[EXAM_RESULT_DELETE]', error);
    return new NextResponse('Internal error', { status: 500 });
  }
} 