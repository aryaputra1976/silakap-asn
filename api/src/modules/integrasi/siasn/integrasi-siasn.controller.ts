import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { IntegrasiSiasnService } from './integrasi-siasn.service';

@Controller('integrasi/siasn')
@UseGuards(JwtAuthGuard)
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