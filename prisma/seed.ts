import { PrismaClient, UserRole } from '@prisma/client'
import * as bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10)
  const admin = await prisma.user.create({
    data: {
      name: 'Admin User',
      email: 'admin@example.com',
      password: adminPassword,
      role: UserRole.ADMIN,
    },
  })

  // Create student user
  const nationalId = '1234567890'
  const mobileNumber = '09123456789'
  const studentPassword = await bcrypt.hash(mobileNumber, 10)
  const studentUser = await prisma.user.create({
    data: {
      name: 'John Doe',
      email: nationalId, // Using national ID as username
      password: studentPassword,
      role: UserRole.STUDENT,
      student: {
        create: {
          firstName: 'John',
          lastName: 'Doe',
          nationalId: nationalId,
          dateOfBirth: '2000-01-01',
          mobileNumber: mobileNumber,
          city: 'New York',
          term: '2024',
        },
      },
    },
    include: {
      student: true,
    },
  })

  if (!studentUser.student) {
    throw new Error('Failed to create student record')
  }

  // Create activities
  const activities = await Promise.all([
    prisma.activity.create({
      data: {
        title: 'Addition Practice',
        count: 20,
        date: '2024-03-15',
        completionTime: '10:00',
        score: 85,
        term: '2024',
        studentId: studentUser.student.id,
      },
    }),
    prisma.activity.create({
      data: {
        title: 'Multiplication Practice',
        count: 15,
        date: '2024-03-16',
        completionTime: '15:30',
        score: 90,
        term: '2024',
        studentId: studentUser.student.id,
      },
    }),
  ])

  // Create exams
  const exams = await Promise.all([
    prisma.exam.create({
      data: {
        title: 'Basic Math Exam',
        digitCount: 2,
        rowCount: 5,
        itemsPerRow: 4,
        timeLimit: 300,
        operators: '+,-',
        term: '2024',
        students: {
          connect: {
            id: studentUser.student.id,
          },
        },
      },
    }),
    prisma.exam.create({
      data: {
        title: 'Advanced Math Exam',
        digitCount: 3,
        rowCount: 6,
        itemsPerRow: 5,
        timeLimit: 600,
        operators: '+,-,*,/',
        term: '2024',
        students: {
          connect: {
            id: studentUser.student.id,
          },
        },
      },
    }),
  ])

  console.log('Seed data created successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 