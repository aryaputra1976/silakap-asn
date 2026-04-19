import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const ROOT_KODE = '7204'

async function main() {
  console.log('🔄 Generate kode hierarki UNOR...')

  const allUnor = await prisma.refUnor.findMany({
    orderBy: { sortOrder: 'asc' }
  })

  if (allUnor.length === 0) {
    console.error('❌ Tidak ada data UNOR')
    return
  }

  // Build tree map
  const tree = new Map<bigint | null, typeof allUnor>()

  for (const unor of allUnor) {
    const key = unor.parentId ?? null
    if (!tree.has(key)) tree.set(key, [])
    tree.get(key)!.push(unor)
  }

  // Cari root (parentId null)
  const root = allUnor.find((u) => u.parentId === null)

  if (!root) {
    console.error('❌ Root tidak ditemukan')
    return
  }

  // Set root kode
  await prisma.refUnor.update({
    where: { id: root.id },
    data: {
      kode: ROOT_KODE,
      level: 1
    }
  })

  async function assignKode(
    parentId: bigint,
    parentKode: string,
    level: number
  ) {
    const children = tree.get(parentId) || []

    let counter = 1

    for (const child of children) {
      const kodeBaru = `${parentKode}.${String(counter).padStart(2, '0')}`

      await prisma.refUnor.update({
        where: { id: child.id },
        data: {
          kode: kodeBaru,
          level
        }
      })

      await assignKode(child.id, kodeBaru, level + 1)
      counter++
    }
  }

  await assignKode(root.id, ROOT_KODE, 2)

  console.log('✅ Generate kode selesai')
}

main()
  .catch((e) => {
    console.error('❌ ERROR:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })