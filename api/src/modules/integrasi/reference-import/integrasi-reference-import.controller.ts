import {
  BadRequestException,
  Controller,
  Param,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Express } from 'express';
import { memoryStorage } from 'multer';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { Roles } from '../../../core/decorators/roles.decorator';
import { Role } from '../../../core/enums/roles.enum';
import { RolesGuard } from '../../../core/guards/roles.guard';
import { IntegrasiReferenceImportService } from './integrasi-reference-import.service';

const MAX_UPLOAD_SIZE_BYTES = 15 * 1024 * 1024;

const ALLOWED_EXCEL_MIME_TYPES = new Set([
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-excel',
  'application/octet-stream',
]);

type JabatanJenisParam = 'fungsional' | 'pelaksana' | 'struktural';

@Controller('integrasi/import/referensi')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN_BKPSDM, Role.SUPER_ADMIN)
export class IntegrasiReferenceImportController {
  constructor(private readonly service: IntegrasiReferenceImportService) {}

  @Post('jabatan/:jenis')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: {
        fileSize: MAX_UPLOAD_SIZE_BYTES,
        files: 1,
      },
      fileFilter: (_request, file, callback) => {
        const filename = file.originalname.toLowerCase();
        const isAllowedExtension = filename.endsWith('.xlsx') || filename.endsWith('.xls');
        const isAllowedMime = ALLOWED_EXCEL_MIME_TYPES.has(file.mimetype);

        if (!isAllowedExtension || !isAllowedMime) {
          callback(new BadRequestException('File harus berformat .xlsx atau .xls'), false);
          return;
        }

        callback(null, true);
      },
    }),
  )
  importJabatanReferences(
    @Param('jenis') jenis: JabatanJenisParam,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('File referensi jabatan wajib diunggah');
    }

    if (!['fungsional', 'pelaksana', 'struktural'].includes(jenis)) {
      throw new BadRequestException('Jenis jabatan tidak valid');
    }

    return this.service.importJabatanReferences(file, jenis.toUpperCase() as never);
  }

  @Post('unor')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: {
        fileSize: MAX_UPLOAD_SIZE_BYTES,
        files: 1,
      },
      fileFilter: (_request, file, callback) => {
        const filename = file.originalname.toLowerCase();
        const isAllowedExtension = filename.endsWith('.xlsx') || filename.endsWith('.xls');
        const isAllowedMime = ALLOWED_EXCEL_MIME_TYPES.has(file.mimetype);

        if (!isAllowedExtension || !isAllowedMime) {
          callback(new BadRequestException('File harus berformat .xlsx atau .xls'), false);
          return;
        }

        callback(null, true);
      },
    }),
  )
  importUnorReferences(@UploadedFile() file?: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('File referensi UNOR wajib diunggah');
    }

    return this.service.importUnorReferences(file);
  }
}
