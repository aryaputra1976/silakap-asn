import { Injectable } from '@nestjs/common'
import { PrismaService } from '@/prisma/prisma.service'
import { BusinessException } from '@/core/exceptions'
import bcrypt from 'bcryptjs'
import { Prisma } from '@prisma/client'
import { UpdateMyProfileDto } from './dto/update-my-profile.dto'
import { ChangePasswordDto } from './dto/change-password.dto'

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
}

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async getUserList() {
    const rows = await this.prisma.$queryRaw<UserListRow[]>(
      Prisma.sql`
        SELECT
          u.id,
          u.username,
          u.is_active,
          u.pegawai_id,
          peg.nama AS pegawai_nama,
          peg.nip AS pegawai_nip,
          unor.nama AS unor_nama,
          GROUP_CONCAT(role.name ORDER BY role.name SEPARATOR ', ') AS roles
        FROM silakap_user u
        LEFT JOIN silakap_pegawai peg
          ON peg.id = u.pegawai_id
        LEFT JOIN ref_unor unor
          ON unor.id = peg.unor_id
        LEFT JOIN silakap_user_role ur
          ON ur.user_id = u.id
        LEFT JOIN silakap_role role
          ON role.id = ur.role_id
        GROUP BY
          u.id,
          u.username,
          u.is_active,
          u.pegawai_id,
          peg.nama,
          peg.nip,
          unor.nama
        ORDER BY u.id DESC
      `,
    )

    return rows.map((row) => ({
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
        ? row.roles.split(", ").filter(Boolean)
        : [],
    }))
  }

  async getRegistrationQueue(status?: string) {
    const rows = await this.prisma.$queryRaw<RegistrationRow[]>(
      status
        ? Prisma.sql`
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
            WHERE r.status = ${status}
            ORDER BY r.submitted_at DESC, r.id DESC
          `
        : Prisma.sql`
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
            ORDER BY r.submitted_at DESC, r.id DESC
          `,
    )

    return rows.map((row) => ({
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
    }))
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
}
