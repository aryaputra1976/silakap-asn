import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import fs from 'fs'
import path from 'path'

const prisma = new PrismaClient()

function loadJSON(file: string) {
  return JSON.parse(
    fs.readFileSync(path.join(__dirname, 'rbac', file), 'utf-8')
  )
}

async function seedRoles() {
  const roles = loadJSON('roles.json')

  for (const role of roles) {
    await prisma.silakapRole.upsert({
      where: { name: role.name },
      update: {},
      create: { name: role.name },
    })
  }
}

async function seedPermissions() {
  const permissions = loadJSON('permissions.json')

  for (const perm of permissions) {
    const existing = await prisma.silakapPermission.findUnique({
      where: { code: perm.code },
    })

    if (!existing) {
      await prisma.silakapPermission.create({
        data: perm,
      })
    } else if (existing.deletedAt) {
      await prisma.silakapPermission.update({
        where: { code: perm.code },
        data: { deletedAt: null },
      })
    }
  }
}

async function seedRolePermissions() {
  const mappings = loadJSON('role-permissions.json')

  for (const map of mappings) {
    const role = await prisma.silakapRole.findUnique({
      where: { name: map.role },
    })

    const permission = await prisma.silakapPermission.findUnique({
      where: { code: map.permission },
    })

    if (!role || !permission) continue

    await prisma.silakapRolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: role.id,
          permissionId: permission.id,
        },
      },
      update: {},
      create: {
        roleId: role.id,
        permissionId: permission.id,
      },
    })
  }

  // SUPER_ADMIN auto full access
  const superAdmin = await prisma.silakapRole.findUnique({
    where: { name: 'SUPER_ADMIN' },
  })

  const allPermissions = await prisma.silakapPermission.findMany({
    where: { deletedAt: null },
  })

  for (const perm of allPermissions) {
    await prisma.silakapRolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: superAdmin!.id,
          permissionId: perm.id,
        },
      },
      update: {},
      create: {
        roleId: superAdmin!.id,
        permissionId: perm.id,
      },
    })
  }
}

async function seedUsers() {
  const users = loadJSON('users.json')

  for (const user of users) {
    const hashed = await bcrypt.hash(user.password, 10)

    const createdUser = await prisma.silakapUser.upsert({
      where: { username: user.username },
      update: {},
      create: {
        username: user.username,
        password: hashed,
        isActive: true,
      },
    })

    for (const roleName of user.roles) {
      const role = await prisma.silakapRole.findUnique({
        where: { name: roleName },
      })

      if (!role) continue

      await prisma.silakapUserRole.upsert({
        where: {
          userId_roleId: {
            userId: createdUser.id,
            roleId: role.id,
          },
        },
        update: {},
        create: {
          userId: createdUser.id,
          roleId: role.id,
        },
      })
    }
  }
}

export async function seedRBAC() {
  console.log('--- RBAC SEED START ---')
  await seedRoles()
  await seedPermissions()
  await seedRolePermissions()
  await seedUsers()
  console.log('--- RBAC SEED COMPLETE ---')
}