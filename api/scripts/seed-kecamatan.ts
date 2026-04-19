import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const data = [
    'Dampal Selatan',
    'Dampal Utara',
    'Dondo',
    'Basidondo',
    'Ogodeide',
    'Lampasio',
    'Baolan',
    'Galang',
    'Dako Pemean',
    'Tolitoli Utara'
  ]

  for (const nama of data) {
    await prisma.refKecamatan.upsert({
      where: { nama },
      update: {},
      create: { nama }
    })
  }

  console.log('✅ Kecamatan berhasil di-seed')
}

main()
  .finally(() => prisma.$disconnect())