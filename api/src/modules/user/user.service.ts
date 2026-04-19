import { Injectable } from '@nestjs/common'
import { PrismaService } from '@/prisma/prisma.service'
import { CryptoHelper } from '@/core/helpers'
import { BusinessException } from '@/core/exceptions'
import bcrypt from 'bcryptjs'
import { UpdateMyProfileDto } from './dto/update-my-profile.dto'
import { ChangePasswordDto } from './dto/change-password.dto'

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

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