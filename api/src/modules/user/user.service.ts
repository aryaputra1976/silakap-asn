import { Injectable } from '@nestjs/common'
import { PrismaService } from '@/prisma/prisma.service'
import { BusinessException } from '@/core/exceptions'
import bcrypt from 'bcryptjs'
import { Prisma } from '@prisma/client'
import { UpdateMyProfileDto } from './dto/update-my-profile.dto'
import { ChangePasswordDto } from './dto/change-password.dto'
import { RegistrationStatusQueryDto } from './dto/registration-status-query.dto'
import { QueryUserListDto } from './dto/query-user-list.dto'
import { QueryUserOptionsDto } from './dto/query-user-options.dto'
import { CreateUserDto } from './dto/create-user.dto'
import { UpdateUserDto } from './dto/update-user.dto'

type RegistrationRow = {
  id: bigint
  username: string
  pegawai_id: bigint
  status: string
  password_hash: string
  email: string
  no_hp: string
  review_note: string | null
  submitted_at: Date
  reviewed_at: Date | null
  requested_role_id: bigint | null
  requested_role_name: string | null
  selected_unor_id: bigint | null
  pegawai_nama: string
  pegawai_nip: string
  unor_nama: string | null
  reviewer_name: string | null
}

type UserListRow = {
  id: bigint
  username: string
  is_active: boolean
  pegawai_id: bigint | null
  pegawai_nama: string | null
  pegawai_nip: string | null
  unor_nama: string | null
  roles: string | null
  role_ids: string | null
  can_delete: number
}

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async getUserList(query: QueryUserListDto) {
    const page = query.page ?? 1
    const limit = query.limit ?? 10
    const offset = (page - 1) * limit
    const search = query.search?.trim()
    const roleId = query.roleId ? BigInt(query.roleId) : undefined
    const isActive = query.isActive

    const filters: Prisma.Sql[] = []

    if (search) {
      const keyword = `%${search}%`
      filters.push(Prisma.sql`
        (
          u.username LIKE ${keyword}
          OR peg.nama LIKE ${keyword}
          OR peg.nip LIKE ${keyword}
          OR unor.nama LIKE ${keyword}
        )
      `)
    }

    if (typeof isActive === 'boolean') {
      filters.push(Prisma.sql`u.is_active = ${isActive}`)
    }

    if (roleId) {
      filters.push(Prisma.sql`
        EXISTS (
          SELECT 1
          FROM silakap_user_role ur_filter
          WHERE ur_filter.user_id = u.id
            AND ur_filter.role_id = ${roleId}
        )
      `)
    }

    const whereClause =
      filters.length > 0
        ? Prisma.sql`WHERE ${Prisma.join(filters, ' AND ')}`
        : Prisma.empty

    const [rows, totalRows] = await Promise.all([
      this.prisma.$queryRaw<UserListRow[]>(
        Prisma.sql`
        SELECT
          u.id,
          u.username,
          u.is_active,
          u.pegawai_id,
          peg.nama AS pegawai_nama,
          peg.nip AS pegawai_nip,
          unor.nama AS unor_nama,
          GROUP_CONCAT(role.name ORDER BY role.name SEPARATOR ', ') AS roles,
          GROUP_CONCAT(role.id ORDER BY role.name SEPARATOR ',') AS role_ids,
          CASE
            WHEN EXISTS (SELECT 1 FROM silakap_activity a WHERE a.user_id = u.id)
              OR EXISTS (SELECT 1 FROM audit_log al WHERE al.user_id = u.id)
              OR EXISTS (SELECT 1 FROM silakap_notification n WHERE n.user_id = u.id)
              OR EXISTS (SELECT 1 FROM auth_session s WHERE s.user_id = u.id)
              OR EXISTS (SELECT 1 FROM silakap_registrasi_user r WHERE r.reviewed_by_user_id = u.id)
              OR EXISTS (SELECT 1 FROM silakap_dms_batch b WHERE b.imported_by = u.id)
            THEN 0
            ELSE 1
          END AS can_delete
        FROM silakap_user u
        LEFT JOIN silakap_pegawai peg
          ON peg.id = u.pegawai_id
        LEFT JOIN ref_unor unor
          ON unor.id = peg.unor_id
        LEFT JOIN silakap_user_role ur
          ON ur.user_id = u.id
        LEFT JOIN silakap_role role
          ON role.id = ur.role_id
        ${whereClause}
        GROUP BY
          u.id,
          u.username,
          u.is_active,
          u.pegawai_id,
          peg.nama,
          peg.nip,
          unor.nama
        ORDER BY u.id DESC
        LIMIT ${limit} OFFSET ${offset}
      `,
      ),
      this.prisma.$queryRaw<Array<{ total: bigint }>>(
        Prisma.sql`
        SELECT COUNT(*) AS total
        FROM silakap_user u
        LEFT JOIN silakap_pegawai peg
          ON peg.id = u.pegawai_id
        LEFT JOIN ref_unor unor
          ON unor.id = peg.unor_id
        ${whereClause}
      `,
      ),
    ])

    const total = Number(totalRows[0]?.total ?? 0n)

    return {
      data: rows.map((row) => ({
        id: row.id.toString(),
        username: row.username,
        isActive: Boolean(row.is_active),
        pegawaiId: row.pegawai_id?.toString() ?? null,
        pegawai: row.pegawai_id
          ? {
              nama: row.pegawai_nama,
              nip: row.pegawai_nip,
              unor: row.unor_nama,
            }
          : null,
        roles: row.roles
          ? row.roles.split(', ').filter(Boolean)
          : [],
        roleIds: row.role_ids
          ? row.role_ids.split(',').filter(Boolean)
          : [],
        canDelete: Boolean(row.can_delete),
        deleteBlockedReason: row.can_delete
          ? null
          : 'Pengguna ini sudah memiliki jejak aktivitas. Nonaktifkan akun jika tidak lagi dipakai.',
      })),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
    }
  }

  async getRoleOptions() {
    const roles = await this.prisma.silakapRole.findMany({
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
      },
    })

    return roles.map((role) => ({
      id: role.id.toString(),
      name: role.name,
    }))
  }

  async getPegawaiOptions(query: QueryUserOptionsDto) {
    const search = query.search?.trim()
    const limit = query.limit ?? 20

    const rows = await this.prisma.silakapPegawai.findMany({
      where: {
        deletedAt: null,
        ...(search
          ? {
              OR: [
                { nama: { contains: search } },
                { nip: { contains: search } },
                { unor: { nama: { contains: search } } },
              ],
            }
          : {}),
      },
      take: limit,
      orderBy: [{ nama: 'asc' }],
      select: {
        id: true,
        nama: true,
        nip: true,
        unor: {
          select: {
            nama: true,
          },
        },
        user: {
          select: {
            id: true,
          },
        },
      },
    })

    return rows.map((row) => ({
      id: row.id.toString(),
      nama: row.nama,
      nip: row.nip,
      unor: row.unor?.nama ?? null,
      hasUser: Boolean(row.user),
      userId: row.user?.id.toString() ?? null,
    }))
  }

  async getRegistrationQueue(query: RegistrationStatusQueryDto) {
    const page = query.page ?? 1
    const limit = query.limit ?? 10
    const offset = (page - 1) * limit
    const filters: Prisma.Sql[] = []

    if (query.status) {
      filters.push(Prisma.sql`r.status = ${query.status}`)
    }

    if (query.search?.trim()) {
      const keyword = `%${query.search.trim()}%`
      filters.push(Prisma.sql`
        (
          peg.nama LIKE ${keyword}
          OR peg.nip LIKE ${keyword}
          OR r.username LIKE ${keyword}
          OR r.email LIKE ${keyword}
          OR COALESCE(selected_unor.nama, unor.nama) LIKE ${keyword}
        )
      `)
    }

    const whereClause =
      filters.length > 0
        ? Prisma.sql`WHERE ${Prisma.join(filters, ' AND ')}`
        : Prisma.empty

    const [rows, totalRows] = await Promise.all([
      this.prisma.$queryRaw<RegistrationRow[]>(
        Prisma.sql`
            SELECT
              r.id,
              r.username,
              r.pegawai_id,
              r.status,
              r.password_hash,
              r.email,
              r.no_hp,
              r.review_note,
              r.submitted_at,
              r.reviewed_at,
              r.requested_role_id,
              role.name AS requested_role_name,
              r.selected_unor_id,
              peg.nama AS pegawai_nama,
              peg.nip AS pegawai_nip,
              COALESCE(selected_unor.nama, unor.nama) AS unor_nama,
              reviewer.username AS reviewer_name
            FROM silakap_registrasi_user r
            INNER JOIN silakap_pegawai peg
              ON peg.id = r.pegawai_id
            LEFT JOIN silakap_role role
              ON role.id = r.requested_role_id
            LEFT JOIN ref_unor selected_unor
              ON selected_unor.id = r.selected_unor_id
            LEFT JOIN ref_unor unor
              ON unor.id = peg.unor_id
            LEFT JOIN silakap_user reviewer
              ON reviewer.id = r.reviewed_by_user_id
            ${whereClause}
            ORDER BY r.submitted_at DESC, r.id DESC
            LIMIT ${limit} OFFSET ${offset}
          `,
      ),
      this.prisma.$queryRaw<Array<{ total: bigint }>>(
        Prisma.sql`
          SELECT COUNT(*) AS total
          FROM silakap_registrasi_user r
          INNER JOIN silakap_pegawai peg
            ON peg.id = r.pegawai_id
          LEFT JOIN ref_unor selected_unor
            ON selected_unor.id = r.selected_unor_id
          LEFT JOIN ref_unor unor
            ON unor.id = peg.unor_id
          ${whereClause}
        `,
      ),
    ])

    const total = Number(totalRows[0]?.total ?? 0n)

    return {
      data: rows.map((row) => ({
        id: row.id.toString(),
        username: row.username,
        pegawaiId: row.pegawai_id.toString(),
        status: row.status,
        email: row.email,
        noHp: row.no_hp,
        note: row.review_note,
        submittedAt: new Date(row.submitted_at).toISOString(),
        reviewedAt: row.reviewed_at
          ? new Date(row.reviewed_at).toISOString()
          : null,
        requestedRoleId: row.requested_role_id?.toString() ?? null,
        requestedRole: row.requested_role_name,
        selectedUnorId: row.selected_unor_id?.toString() ?? null,
        reviewerName: row.reviewer_name,
        pegawai: {
          nama: row.pegawai_nama,
          nip: row.pegawai_nip,
          unor: row.unor_nama,
        },
      })),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
    }
  }

  async createUser(dto: CreateUserDto) {
    const username = dto.username.trim()
    const roleIds = dto.roleIds.map((item) => BigInt(item))
    const pegawaiId = dto.pegawaiId ? BigInt(dto.pegawaiId) : null

    const existingUsername = await this.prisma.silakapUser.findUnique({
      where: { username },
      select: { id: true },
    })

    if (existingUsername) {
      throw new BusinessException('Username sudah digunakan')
    }

    if (pegawaiId) {
      const existingPegawaiUser = await this.prisma.silakapUser.findUnique({
        where: { pegawaiId },
        select: { id: true },
      })

      if (existingPegawaiUser) {
        throw new BusinessException('Pegawai ini sudah memiliki akun pengguna')
      }
    }

    const roles = await this.prisma.silakapRole.findMany({
      where: { id: { in: roleIds } },
      select: { id: true },
    })

    if (roles.length !== roleIds.length) {
      throw new BusinessException('Satu atau lebih role tidak valid')
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10)

    const user = await this.prisma.$transaction(async (tx) => {
      const createdUser = await tx.silakapUser.create({
        data: {
          username,
          password: hashedPassword,
          pegawaiId,
          isActive: dto.isActive ?? true,
        },
      })

      await tx.silakapUserRole.createMany({
        data: roleIds.map((roleId) => ({
          userId: createdUser.id,
          roleId,
        })),
      })

      return createdUser
    })

    return {
      message: 'Pengguna berhasil ditambahkan',
      data: await this.getUserDetail(user.id),
    }
  }

  async updateUser(userId: bigint, dto: UpdateUserDto) {
    const existingUser = await this.prisma.silakapUser.findUnique({
      where: { id: userId },
      select: { id: true },
    })

    if (!existingUser) {
      throw new BusinessException('Pengguna tidak ditemukan')
    }

    const username = dto.username.trim()
    const roleIds = dto.roleIds.map((item) => BigInt(item))
    const pegawaiId = dto.pegawaiId ? BigInt(dto.pegawaiId) : null

    const usernameOwner = await this.prisma.silakapUser.findFirst({
      where: {
        username,
        NOT: { id: userId },
      },
      select: { id: true },
    })

    if (usernameOwner) {
      throw new BusinessException('Username sudah digunakan pengguna lain')
    }

    if (pegawaiId) {
      const pegawaiOwner = await this.prisma.silakapUser.findFirst({
        where: {
          pegawaiId,
          NOT: { id: userId },
        },
        select: { id: true },
      })

      if (pegawaiOwner) {
        throw new BusinessException('Pegawai ini sudah dipakai akun lain')
      }
    }

    const roles = await this.prisma.silakapRole.findMany({
      where: { id: { in: roleIds } },
      select: { id: true },
    })

    if (roles.length !== roleIds.length) {
      throw new BusinessException('Satu atau lebih role tidak valid')
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.silakapUser.update({
        where: { id: userId },
        data: {
          username,
          pegawaiId,
          ...(typeof dto.isActive === 'boolean' ? { isActive: dto.isActive } : {}),
        },
      })

      await tx.silakapUserRole.deleteMany({
        where: { userId },
      })

      await tx.silakapUserRole.createMany({
        data: roleIds.map((roleId) => ({
          userId,
          roleId,
        })),
      })
    })

    return {
      message: 'Pengguna berhasil diperbarui',
      data: await this.getUserDetail(userId),
    }
  }

  async toggleUserStatus(userId: bigint, isActive: boolean) {
    const user = await this.prisma.silakapUser.findUnique({
      where: { id: userId },
      select: { id: true },
    })

    if (!user) {
      throw new BusinessException('Pengguna tidak ditemukan')
    }

    await this.prisma.silakapUser.update({
      where: { id: userId },
      data: { isActive },
    })

    return {
      message: `Pengguna berhasil ${isActive ? 'diaktifkan' : 'dinonaktifkan'}`,
      data: await this.getUserDetail(userId),
    }
  }

  async deleteUser(userId: bigint) {
    const user = await this.prisma.silakapUser.findUnique({
      where: { id: userId },
      select: { id: true, username: true },
    })

    if (!user) {
      throw new BusinessException('Pengguna tidak ditemukan')
    }

    const [
      hasActivity,
      hasAudit,
      hasNotifications,
      hasSessions,
      hasReviewedRegistrations,
      hasImportedBatches,
    ] = await Promise.all([
      this.prisma.silakapActivity.count({ where: { userId } }),
      this.prisma.auditLog.count({ where: { userId } }),
      this.prisma.silakapNotification.count({ where: { userId } }),
      this.prisma.authSession.count({ where: { userId } }),
      this.prisma.silakapRegistrasiUser.count({
        where: { reviewedByUserId: userId },
      }),
      this.prisma.silakapDmsBatch.count({
        where: { importedBy: userId },
      }),
    ])

    if (
      hasActivity > 0 ||
      hasAudit > 0 ||
      hasNotifications > 0 ||
      hasSessions > 0 ||
      hasReviewedRegistrations > 0 ||
      hasImportedBatches > 0
    ) {
      throw new BusinessException(
        'Pengguna ini sudah memiliki jejak aktivitas. Nonaktifkan akun jika tidak lagi dipakai.',
      )
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.silakapUserRole.deleteMany({
        where: { userId },
      })

      await tx.silakapUser.delete({
        where: { id: userId },
      })
    })

    return {
      message: 'Pengguna berhasil dihapus',
      userId: user.id.toString(),
    }
  }

  async approveRegistration(registrationId: bigint, reviewerUserId: bigint, note?: string) {
    return this.prisma.$transaction(async (tx) => {
      const [registration] = await tx.$queryRaw<RegistrationRow[]>(
        Prisma.sql`
          SELECT
            r.id,
            r.username,
            r.pegawai_id,
            r.status,
            r.password_hash,
            r.email,
            r.no_hp,
            r.review_note,
            r.submitted_at,
            r.reviewed_at,
            r.requested_role_id,
            role.name AS requested_role_name,
            r.selected_unor_id,
            peg.nama AS pegawai_nama,
            peg.nip AS pegawai_nip,
            COALESCE(selected_unor.nama, unor.nama) AS unor_nama,
            reviewer.username AS reviewer_name
          FROM silakap_registrasi_user r
          INNER JOIN silakap_pegawai peg
            ON peg.id = r.pegawai_id
          LEFT JOIN silakap_role role
            ON role.id = r.requested_role_id
          LEFT JOIN ref_unor selected_unor
            ON selected_unor.id = r.selected_unor_id
          LEFT JOIN ref_unor unor
            ON unor.id = peg.unor_id
          LEFT JOIN silakap_user reviewer
            ON reviewer.id = r.reviewed_by_user_id
          WHERE r.id = ${registrationId}
          LIMIT 1
        `,
      )

      if (!registration) {
        throw new BusinessException('Registrasi tidak ditemukan')
      }

      if (registration.status === 'APPROVED') {
        throw new BusinessException('Registrasi sudah disetujui sebelumnya')
      }

      const existingUser = await tx.silakapUser.findFirst({
        where: {
          OR: [
            { username: registration.username },
            { pegawaiId: registration.pegawai_id },
          ],
        },
        select: { id: true },
      })

      if (existingUser) {
        throw new BusinessException(
          'Akun pengguna untuk registrasi ini sudah ada',
        )
      }

      const roleId = registration.requested_role_id
      if (!roleId) {
        throw new BusinessException(
          'Role registrasi belum tersedia untuk disetujui',
        )
      }

      await tx.silakapPegawai.update({
        where: { id: registration.pegawai_id },
        data: {
          email: registration.email,
          noHp: registration.no_hp,
          ...(registration.selected_unor_id
            ? { unorId: registration.selected_unor_id }
            : {}),
        },
      })

      const user = await tx.silakapUser.create({
        data: {
          username: registration.username,
          password: registration.password_hash,
          pegawaiId: registration.pegawai_id,
          isActive: true,
        },
      })

      await tx.silakapUserRole.create({
        data: {
          userId: user.id,
          roleId,
        },
      })

      await tx.$executeRaw(Prisma.sql`
        UPDATE silakap_registrasi_user
        SET
          status = 'APPROVED',
          review_note = ${note?.trim() || null},
          reviewed_by_user_id = ${reviewerUserId},
          reviewed_at = NOW(3),
          updated_at = NOW(3)
        WHERE id = ${registrationId}
      `)

      return {
        message: 'Registrasi berhasil disetujui',
        registrationId: registration.id.toString(),
        userId: user.id.toString(),
        username: user.username,
      }
    })
  }

  async rejectRegistration(
    registrationId: bigint,
    reviewerUserId: bigint,
    note?: string,
  ) {
    const [registration] = await this.prisma.$queryRaw<
      Array<{ id: bigint; status: string }>
    >(Prisma.sql`
      SELECT id, status
      FROM silakap_registrasi_user
      WHERE id = ${registrationId}
      LIMIT 1
    `)

    if (!registration) {
      throw new BusinessException('Registrasi tidak ditemukan')
    }

    if (registration.status === 'APPROVED') {
      throw new BusinessException(
        'Registrasi yang sudah disetujui tidak dapat ditolak',
      )
    }

    await this.prisma.$executeRaw(Prisma.sql`
      UPDATE silakap_registrasi_user
      SET
        status = 'REJECTED',
        review_note = ${note?.trim() || null},
        reviewed_by_user_id = ${reviewerUserId},
        reviewed_at = NOW(3),
        updated_at = NOW(3)
      WHERE id = ${registrationId}
    `)

    return {
      message: 'Registrasi berhasil ditolak',
      registrationId: registration.id.toString(),
    }
  }

  async getMyProfile(userId: bigint) {
    const user = await this.prisma.silakapUser.findUnique({
      where: { id: userId },
      include: {
        pegawai: true,
        roles: {
          include: {
            role: true
          }
        }
      }
    })

    if (!user) {
      throw new BusinessException('User tidak ditemukan')
    }

    return {
      id: user.id.toString(),
      username: user.username,
      isActive: user.isActive,
      pegawaiId: user.pegawaiId?.toString(),
      roles: user.roles.map(r => r.role.name),
      pegawai: user.pegawai
        ? {
            id: user.pegawai.id.toString(),
            nama: user.pegawai.nama,
            nip: user.pegawai.nip
          }
        : null
    }
  }

  async updateMyProfile(userId: bigint, dto: UpdateMyProfileDto) {
    return this.prisma.silakapUser.update({
      where: { id: userId },
      data: {
        username: dto.username
      }
    })
  }

  async changePassword(userId: bigint, dto: ChangePasswordDto) {
    
    const user = await this.prisma.silakapUser.findUnique({
      where: { id: userId }
    })

    if (!user) {
      throw new BusinessException('User tidak ditemukan')
    }
console.log('OLD PASSWORD INPUT:', dto.oldPassword)
console.log('HASH DI DB:', user.password)
    const isMatch = await bcrypt.compare(
      dto.oldPassword,
      user.password
    )

    if (!isMatch) {
      throw new BusinessException('Password lama salah')
    }

    const newHashed = await bcrypt.hash(dto.newPassword, 10)

    await this.prisma.silakapUser.update({
      where: { id: userId },
      data: { password: newHashed }
    })

    return { message: 'Password berhasil diubah' }
  }

  private async getUserDetail(userId: bigint) {
    const user = await this.prisma.silakapUser.findUnique({
      where: { id: userId },
      include: {
        pegawai: {
          include: {
            unor: {
              select: {
                nama: true,
              },
            },
          },
        },
        roles: {
          include: {
            role: true,
          },
        },
      },
    })

    if (!user) {
      throw new BusinessException('Pengguna tidak ditemukan')
    }

    const canDelete = await this.canDeleteUser(user.id)

    return {
      id: user.id.toString(),
      username: user.username,
      isActive: user.isActive,
      pegawaiId: user.pegawaiId?.toString() ?? null,
      pegawai: user.pegawai
        ? {
            nama: user.pegawai.nama,
            nip: user.pegawai.nip,
            unor: user.pegawai.unor?.nama ?? null,
          }
        : null,
      roles: user.roles.map((item) => item.role.name),
      roleIds: user.roles.map((item) => item.roleId.toString()),
      canDelete,
      deleteBlockedReason: canDelete
        ? null
        : 'Pengguna ini sudah memiliki jejak aktivitas. Nonaktifkan akun jika tidak lagi dipakai.',
    }
  }

  private async canDeleteUser(userId: bigint) {
    const [
      hasActivity,
      hasAudit,
      hasNotifications,
      hasSessions,
      hasReviewedRegistrations,
      hasImportedBatches,
    ] = await Promise.all([
      this.prisma.silakapActivity.count({ where: { userId } }),
      this.prisma.auditLog.count({ where: { userId } }),
      this.prisma.silakapNotification.count({ where: { userId } }),
      this.prisma.authSession.count({ where: { userId } }),
      this.prisma.silakapRegistrasiUser.count({
        where: { reviewedByUserId: userId },
      }),
      this.prisma.silakapDmsBatch.count({
        where: { importedBy: userId },
      }),
    ])

    return !(
      hasActivity > 0 ||
      hasAudit > 0 ||
      hasNotifications > 0 ||
      hasSessions > 0 ||
      hasReviewedRegistrations > 0 ||
      hasImportedBatches > 0
    )
  }
}
