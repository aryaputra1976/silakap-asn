import { Injectable, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import * as bcrypt from 'bcryptjs'
import { PrismaService } from '@/prisma/prisma.service'
import { RbacService } from '@/modules/rbac/rbac.service'
import {
  BusinessException,
  ConflictException,
} from '@/core/exceptions'
import {
  generateRefreshToken,
  hashRefreshToken,
} from './utils/refresh-token.util'
import { Prisma } from '@prisma/client'

const ACCESS_TOKEN_TTL = 60 * 15
const REFRESH_TOKEN_TTL = 60 * 60 * 24 * 7

// =====================
// TYPE DEFINITIONS
// =====================

type UserWithRoles = Prisma.SilakapUserGetPayload<{
  include: {
    pegawai: {
      include: {
        riwayatJabatan: {
          orderBy: { tmtJabatan: 'desc' }
          take: 1
        }
      }
    }
    roles: {
      include: {
        role: true
      }
    }
  }
}>

type SessionWithUserAndRoles = Prisma.AuthSessionGetPayload<{
  include: {
    user: {
      include: {
        roles: {
          include: {
            role: true
          }
        }
      }
    }
  }
}>

type RegistrationRecord = {
  id: bigint
  status: string
  username: string
  pegawai_id: bigint
  email: string
  no_hp: string
  submitted_at: Date
  requested_role_name: string | null
  pegawai_nama: string
  pegawai_nip: string
  unor_nama: string | null
}

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private rbac: RbacService,
  ) {}

  // =====================
  // REGISTER
  // =====================
  async register(input: {
    password: string
    confirmPassword: string
    nip: string
    email: string
    noHp: string
  }) {
    const nip = input.nip.replace(/\s+/g, '').trim()
    const email = input.email.trim()
    const noHp = input.noHp.trim()
    const username = nip

    if (input.password !== input.confirmPassword) {
      throw new BusinessException(
        'Konfirmasi password tidak sesuai',
      )
    }

    const existingUser = await this.prisma.silakapUser.findUnique({
      where: { username },
      select: { id: true },
    })

    if (existingUser) {
      throw new ConflictException(
        'Pegawai dengan NIP tersebut sudah memiliki akun aktif',
      )
    }

    const pegawai = await this.prisma.silakapPegawai.findFirst({
      where: {
        OR: [{ nip }, { nipLama: nip }],
      },
      select: {
        id: true,
        nip: true,
        nama: true,
        noHp: true,
        email: true,
        unor: {
          select: {
            nama: true,
          },
        },
      },
    })

    if (!pegawai) {
      throw new BusinessException('NIP tidak ditemukan')
    }

    const existingPegawaiUser =
      await this.prisma.silakapUser.findFirst({
        where: { pegawaiId: pegawai.id },
        select: { id: true },
      })

    if (existingPegawaiUser) {
      throw new ConflictException(
        'Pegawai dengan NIP tersebut sudah memiliki akun',
      )
    }

    const defaultRole = await this.prisma.silakapRole.findFirst({
      where: { name: 'OPERATOR' },
      select: { id: true, name: true },
    })
    const [existingRegistration] = await this.prisma.$queryRaw<
      Array<{ id: bigint; status: string }>
    >(Prisma.sql`
      SELECT id, status
      FROM silakap_registrasi_user
      WHERE pegawai_id = ${pegawai.id}
      LIMIT 1
    `)

    if (existingRegistration?.status === 'PENDING') {
      throw new ConflictException(
        'Pengajuan registrasi untuk NIP ini sudah dikirim dan masih menunggu verifikasi admin',
      )
    }

    if (existingRegistration?.status === 'APPROVED') {
      throw new ConflictException(
        'Pengajuan registrasi untuk NIP ini sudah disetujui sebelumnya',
      )
    }

    const hashedPassword = await bcrypt.hash(input.password, 10)

    const registration = await this.prisma.$transaction(
      async (tx) => {
        if (existingRegistration) {
          await tx.$executeRaw(Prisma.sql`
            UPDATE silakap_registrasi_user
            SET
              username = ${username},
              password_hash = ${hashedPassword},
              email = ${email},
              no_hp = ${noHp},
              requested_role_id = ${defaultRole?.id ?? null},
              status = 'PENDING',
              review_note = NULL,
              reviewed_by_user_id = NULL,
              reviewed_at = NULL,
              submitted_at = NOW(3)
            WHERE id = ${existingRegistration.id}
          `)
        } else {
          await tx.$executeRaw(Prisma.sql`
            INSERT INTO silakap_registrasi_user (
              pegawai_id,
              username,
              password_hash,
              email,
              no_hp,
              requested_role_id,
              status,
              submitted_at,
              created_at,
              updated_at
            )
            VALUES (
              ${pegawai.id},
              ${username},
              ${hashedPassword},
              ${email},
              ${noHp},
              ${defaultRole?.id ?? null},
              'PENDING',
              NOW(3),
              NOW(3),
              NOW(3)
            )
          `)
        }

        const [record] = await tx.$queryRaw<RegistrationRecord[]>(
          Prisma.sql`
            SELECT
              r.id,
              r.status,
              r.username,
              r.pegawai_id,
              r.email,
              r.no_hp,
              r.submitted_at,
              role.name AS requested_role_name,
              peg.nama AS pegawai_nama,
              peg.nip AS pegawai_nip,
              unor.nama AS unor_nama
            FROM silakap_registrasi_user r
            INNER JOIN silakap_pegawai peg
              ON peg.id = r.pegawai_id
            LEFT JOIN silakap_role role
              ON role.id = r.requested_role_id
            LEFT JOIN ref_unor unor
              ON unor.id = peg.unor_id
            WHERE r.pegawai_id = ${pegawai.id}
            LIMIT 1
          `,
        )

        return record
      },
    )

    return {
      message:
        'Registrasi berhasil dikirim dan sedang menunggu verifikasi admin BKPSDM.',
      registration: {
        id: registration.id.toString(),
        status: registration.status,
        requestedRole:
          registration.requested_role_name ??
          defaultRole?.name ??
          null,
        username: registration.username,
        pegawaiId: registration.pegawai_id.toString(),
        submittedAt: new Date(
          registration.submitted_at,
        ).toISOString(),
        pegawai: {
          nama: registration.pegawai_nama,
          nip: registration.pegawai_nip,
          unor: registration.unor_nama,
          email: registration.email,
          noHp: registration.no_hp,
        },
      },
    }
  }

  async findPegawaiForRegister(nip: string) {
    const normalizedNip = nip.replace(/\s+/g, '').trim()

    const pegawai = await this.prisma.silakapPegawai.findFirst({
      where: {
        OR: [{ nip: normalizedNip }, { nipLama: normalizedNip }],
      },
      select: {
        id: true,
        nip: true,
        nipLama: true,
        nama: true,
        email: true,
        noHp: true,
        unor: {
          select: {
            nama: true,
          },
        },
      },
    })

    if (!pegawai) {
      throw new BusinessException('NIP tidak ditemukan')
    }

    return {
      id: pegawai.id.toString(),
      nip: pegawai.nip,
      nipLama: pegawai.nipLama ?? '',
      nama: pegawai.nama,
      email: '',
      noHp: '',
      unorNama: pegawai.unor?.nama ?? '-',
    }
  }

  // =====================
  // LOGIN
  // =====================
  async login(
    username: string,
    password: string,
    meta?: { userAgent?: string; ip?: string },
  ) {
    const user: UserWithRoles | null =
      await this.prisma.silakapUser.findUnique({
        where: { username },
        include: {
          pegawai: {
            include: {
              riwayatJabatan: {
                orderBy: { tmtJabatan: 'desc' },
                take: 1,
              },
            },
          },
          roles: { include: { role: true } },
        },
      })

    if (!user) throw new UnauthorizedException('User not found')

    const valid = await bcrypt.compare(password, user.password)

    if (!valid) throw new UnauthorizedException('Wrong password')

    const roleNames = user.roles.map((r) => r.role.name)

    const jabatanAktif = user.pegawai?.riwayatJabatan?.[0]

    const permissions = await this.rbac.getUserPermissions(user.id)

    const payload = {
      sub: user.id.toString(),
      id: user.id.toString(),
      name: user.username,
      role: roleNames[0] ?? null,
      roles: roleNames,
      unitKerjaId: jabatanAktif?.unorId?.toString() ?? null,
      permissions,
    }

    const access_token = await this.jwt.signAsync(payload, {
      expiresIn: ACCESS_TOKEN_TTL,
    })

    const refreshToken = generateRefreshToken()
    const refreshHash = hashRefreshToken(refreshToken)
    const expiresAt = new Date(Date.now() + REFRESH_TOKEN_TTL * 1000)

    await this.prisma.authSession.create({
      data: {
        userId: user.id,
        refreshHash,
        userAgent: meta?.userAgent,
        ipAddress: meta?.ip,
        expiresAt,
        revoked: false,
      },
    })

    return {
      access_token,
      refresh_token: refreshToken,
      expires_in: ACCESS_TOKEN_TTL,
      user: {
        id: user.id.toString(),
        username: user.username,
        roles: roleNames,
        unitKerjaId: payload.unitKerjaId,
      },
      permissions,
    }
  }

  // =====================
  // REFRESH
  // =====================
  async refresh(
    refreshToken: string,
    meta?: { userAgent?: string; ip?: string },
  ) {
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token missing')
    }

    const refreshHash = hashRefreshToken(refreshToken)

    const session: SessionWithUserAndRoles | null =
      await this.prisma.authSession.findFirst({
        where: { refreshHash, revoked: false },
        include: {
          user: {
            include: { roles: { include: { role: true } } },
          },
        },
      })

    if (!session) throw new UnauthorizedException('Invalid refresh token')

    if (session.expiresAt < new Date()) {
      await this.prisma.authSession.update({
        where: { id: session.id },
        data: { revoked: true },
      })
      throw new UnauthorizedException('Refresh token expired')
    }

    await this.prisma.authSession.update({
      where: { id: session.id },
      data: { revoked: true },
    })

    const newRefreshToken = generateRefreshToken()
    const newRefreshHash = hashRefreshToken(newRefreshToken)
    const expiresAt = new Date(Date.now() + REFRESH_TOKEN_TTL * 1000)

    await this.prisma.authSession.create({
      data: {
        userId: session.userId,
        refreshHash: newRefreshHash,
        userAgent: meta?.userAgent,
        ipAddress: meta?.ip,
        expiresAt,
        revoked: false,
      },
    })

    const permissions = await this.rbac.getUserPermissions(session.userId)

    const roleNames = session.user.roles.map((r) => r.role.name)

    const payload = {
      sub: session.user.id.toString(),
      id: session.user.id.toString(),
      name: session.user.username,
      role: roleNames[0] ?? null,
      roles: roleNames,
      permissions,
    }

    const access_token = await this.jwt.signAsync(payload, {
      expiresIn: ACCESS_TOKEN_TTL,
    })

    return {
      access_token,
      refresh_token: newRefreshToken,
      expires_in: ACCESS_TOKEN_TTL,
    }
  }

  // =====================
  // LOGOUT
  // =====================
  async logout(refreshToken: string) {
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token missing')
    }

    const refreshHash = hashRefreshToken(refreshToken)

    const session = await this.prisma.authSession.findFirst({
      where: { refreshHash, revoked: false },
    })

    if (!session) return { success: true }

    await this.prisma.authSession.update({
      where: { id: session.id },
      data: { revoked: true },
    })

    return { success: true }
  }
}
