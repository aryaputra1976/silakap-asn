import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IntegrasiImportRepository } from '../../modules/integrasi/import/integrasi-import.repository';

export const BATCH_OWNER_KEY = 'batchOwner';

/**
 * Guard untuk memastikan user hanya bisa akses batch yang dia buat atau user adalah admin
 * Cocok untuk: GET batch detail, PUT batch, DELETE batch, POST batch actions
 *
 * Usage di controller:
 * @UseGuards(JwtAuthGuard, BatchOwnershipGuard)
 * @Get(':batchId')
 * async getBatch(@Param('batchId', ParseBigIntPipe) batchId: bigint)
 */
@Injectable()
export class BatchOwnershipGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly repository: IntegrasiImportRepository,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new BadRequestException('User context tidak ditemukan');
    }

    // Get batchId from route params
    const batchId = request.params.batchId
      ? BigInt(request.params.batchId)
      : null;

    if (!batchId) {
      // If no batchId in params, skip guard
      return true;
    }

    // Fetch batch from database
    const batch = await this.repository.findBatchById(batchId);

    if (!batch) {
      throw new NotFoundException(
        `Batch dengan ID ${batchId} tidak ditemukan`,
      );
    }

    // Check if user owns the batch or is admin
    const userId = user.id === undefined || user.id === null
      ? null
      : String(user.id);
    const isOwner = Boolean(batch.createdBy && userId === batch.createdBy);
    const isAdmin =
      user.roles?.includes('SUPER_ADMIN') ||
      user.roles?.includes('ADMIN_BKPSDM') ||
      user.isAdmin;

    if (!isOwner && !isAdmin) {
      throw new ForbiddenException(
        'Anda tidak memiliki izin untuk mengakses batch ini',
      );
    }

    // Attach batch to request for later use
    request.batch = batch;

    return true;
  }
}
