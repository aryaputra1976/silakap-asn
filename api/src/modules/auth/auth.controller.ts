import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Request, Response } from 'express'
import {
  ApiTags,
  ApiBody,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger'

import { AuthService } from './auth.service'
import { LoginBruteforceRedisGuard } from '../../core/guards/login-bruteforce-redis.guard'
import { LoginDto } from './dto/login.dto'
import { RegisterPegawaiQueryDto } from './dto/register-pegawai-query.dto'
import { RegisterDto } from './dto/register.dto'
import { Public } from '../../core/decorators/public.decorator'

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly auth: AuthService,
    private readonly config: ConfigService,
  ) {}

  private getRefreshCookieOptions() {
    return {
      httpOnly: true,
      secure: this.config.get<boolean>('COOKIE_SECURE') ?? false,
      sameSite:
        this.config.get<'strict' | 'lax' | 'none'>(
          'COOKIE_SAME_SITE',
        ) ?? 'strict',
      path: '/api/auth/refresh',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    } as const
  }

  @Public()
  @Get('register/pegawai')
  @ApiOperation({ summary: 'Lookup pegawai untuk form registrasi' })
  @ApiResponse({ status: 200, description: 'Data pegawai ditemukan' })
  async findPegawaiForRegister(
    @Query() query: RegisterPegawaiQueryDto,
  ) {
    return this.auth.findPegawaiForRegister(query.nip)
  }

  @Public()
  @Post('register')
  @ApiOperation({ summary: 'Registrasi user baru' })
  @ApiBody({ type: RegisterDto })
  @ApiResponse({ status: 201, description: 'Registrasi berhasil' })
  @ApiResponse({
    status: 400,
    description: 'Data registrasi tidak valid',
  })
  async register(@Body() body: RegisterDto) {
    return this.auth.register(body)
  }

  @Public()
  @UseGuards(LoginBruteforceRedisGuard)
  @Post('login')
  @ApiOperation({ summary: 'Login user dan generate access token' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({ status: 201, description: 'Login berhasil' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async login(
    @Body() body: LoginDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.auth.login(body.username, body.password, {
      userAgent: req.headers['user-agent'],
      ip: req.ip,
    })

    res.cookie(
      'refresh_token',
      result.refresh_token,
      this.getRefreshCookieOptions(),
    )

    return {
      access_token: result.access_token,
      expires_in: result.expires_in,
      user: result.user,
      permissions: result.permissions,
    }
  }

  @Public()
  @Post('refresh')
  @ApiOperation({
    summary: 'Refresh access token menggunakan cookie',
  })
  @ApiResponse({
    status: 201,
    description: 'Token berhasil diperbarui',
  })
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = req.cookies?.refresh_token

    const result = await this.auth.refresh(refreshToken, {
      userAgent: req.headers['user-agent'],
      ip: req.ip,
    })

    res.cookie(
      'refresh_token',
      result.refresh_token,
      this.getRefreshCookieOptions(),
    )

    return {
      access_token: result.access_token,
      expires_in: result.expires_in,
    }
  }

  @Public()
  @Post('logout')
  @ApiOperation({
    summary: 'Logout user dan hapus refresh token',
  })
  @ApiResponse({ status: 201, description: 'Logout berhasil' })
  async logout(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = req.cookies?.refresh_token

    if (refreshToken) {
      await this.auth.logout(refreshToken)
    }

    res.clearCookie(
      'refresh_token',
      this.getRefreshCookieOptions(),
    )

    return { success: true }
  }
}
