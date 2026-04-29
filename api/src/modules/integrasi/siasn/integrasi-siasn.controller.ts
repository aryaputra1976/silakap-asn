import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { Roles } from '../../../core/decorators/roles.decorator';
import { Role } from '../../../core/enums/roles.enum';
import { RolesGuard } from '../../../core/guards/roles.guard';
import { IntegrasiSiasnService } from './integrasi-siasn.service';

@Controller('integrasi/siasn')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN_BKPSDM, Role.SUPER_ADMIN)
export class IntegrasiSiasnController {
  constructor(private readonly service: IntegrasiSiasnService) {}

  @Get('summary')
  getSummary() {
    return this.service.getSummary();
  }

  @Get('status')
  getStatus() {
    return this.service.getStatus();
  }
}
