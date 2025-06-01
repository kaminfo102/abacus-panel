import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { db } from '@/lib/prisma';
import { authOptions } from '@/app/api/auth/[...nextauth]/auth';
import * as XLSX from 'xlsx';
import { z } from 'zod';

const studentImportSchema = z.object({
  firstName: z.string().min(2, 'نام باید حداقل ۲ کاراکتر باشد'),
  lastName: z.string().min(2, 'نام خانوادگی باید حداقل ۲ کاراکتر باشد'),
  nationalId: z.string().length(10, 'کد ملی باید ۱۰ رقم باشد'),
  mobileNumber: z.string().length(11, 'شماره موبایل باید ۱۱ رقم باشد'),
  dateOfBirth: z.string().optional(),
  city: z.string().min(1, 'شهرستان الزامی است'),
  term: z.string().min(1, 'ترم الزامی است'),
  role: z.enum(['STUDENT']).default('STUDENT'),
});

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user || session.user.role !== 'ADMIN') {
      return new NextResponse('Unauthorized', { status: 403 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return new NextResponse('No file uploaded', { status: 400 });
    }

    const buffer = await file.arrayBuffer();

    try {
      const workbook = XLSX.read(buffer);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const data = XLSX.utils.sheet_to_json(worksheet);

      const results = {
        success: 0,
        failed: 0,
        errors: [] as string[],
      };

      for (const row of data) {
        try {
          // Explicitly convert potential numbers to strings for validation
          const processedRow = {
            ...row as any,
            nationalId: String((row as any).nationalId),
            mobileNumber: String((row as any).mobileNumber),
            // Convert dateOfBirth to string if it exists and is not already a string
            ...(row as any).dateOfBirth !== undefined && {
              dateOfBirth: typeof (row as any).dateOfBirth !== 'string' 
                ? String((row as any).dateOfBirth) 
                : (row as any).dateOfBirth
            }
          };

          const studentData = studentImportSchema.parse(processedRow);
          
          // Check if student with this national ID already exists
          const existingStudent = await db.student.findFirst({
            where: { nationalId: studentData.nationalId },
          });

          if (existingStudent) {
            results.failed++;
            results.errors.push(`دانش‌آموز با کد ملی ${studentData.nationalId} قبلاً ثبت شده است`);
            continue;
          }

          // Create user account
          const user = await db.user.create({
            data: {
              name: `${studentData.firstName} ${studentData.lastName}`,
              email: `${studentData.nationalId}@example.com`,
              password: studentData.mobileNumber,
              role: studentData.role,
              student: {
                create: {
                  firstName: studentData.firstName,
                  lastName: studentData.lastName,
                  nationalId: studentData.nationalId,
                  mobileNumber: studentData.mobileNumber,
                  dateOfBirth: studentData.dateOfBirth,
                  city: studentData.city,
                  term: studentData.term,
                },
              },
            },
          });

          results.success++;
        } catch (error) {
          results.failed++;
          if (error instanceof z.ZodError) {
            results.errors.push(`خطا در داده‌های سطر ${data.indexOf(row) + 2}: ${error.errors[0].message}`);
          } else {
            // Capture the actual error message for unknown errors
            results.errors.push(`خطای ناشناخته در سطر ${data.indexOf(row) + 2}: ${(error as Error).message}`);
          }
        }
      }

      return NextResponse.json(results);
    } catch (fileProcessingError) {
      console.error('[STUDENTS_IMPORT - FILE PROCESSING]', fileProcessingError);
      return new NextResponse(`Error processing file: ${(fileProcessingError as Error).message}`, { status: 400 });
    }

  } catch (error) {
    console.error('[STUDENTS_IMPORT - GENERAL]', error);
    return new NextResponse('Internal error', { status: 500 });
  }
} 