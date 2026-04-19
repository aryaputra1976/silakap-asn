import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const username = 'admin'
  const plainPassword = 'admin123'

  const existing = await prisma.silakapUser.findUnique({
    where: { username },
  })

  if (existing) {
    console.log('⚠️ Admin already exists')
    return
  }

  const hashed = await bcrypt.hash(plainPassword, 10)

  const role = await prisma.silakapRole.findFirst({
    where: { name: 'SUPER_ADMIN' },
  })

  const user = await prisma.silakapUser.create({
    data: {
      username,
      password: hashed,
      isActive: true,
      roles: role
        ? {
            create: [{ roleId: role.id }],
          }
        : undefined,
    },
  })

  console.log('✅ Admin created')
  console.log('username:', username)
  console.log('password:', plainPassword)
  console.log('id:', user.id)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
