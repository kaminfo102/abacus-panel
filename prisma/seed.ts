import { PrismaClient, UserRole } from '@prisma/client'
import * as bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  // Create admin user
  const adminPassword = await bcrypt.hash('Kaminfo102*', 10)
  const admin = await prisma.user.create({
    data: {
      name: 'کامیل میرزائی',
      email: 'mirzae.uast@gmail.com',
      password: adminPassword,
      role: UserRole.ADMIN,
    },
  })

  console.log('Admin user created:', admin)
  console.log('Seed completed successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 