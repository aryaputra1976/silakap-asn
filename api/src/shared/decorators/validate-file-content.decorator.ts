import {
  BadRequestException,
  createParamDecorator,
  ExecutionContext,
  PipeTransform,
  Injectable,
} from '@nestjs/common';
import { fileTypeFromBuffer } from 'file-type';
import type { Express } from 'express';

export interface FileValidationOptions {
  allowedMimeTypes?: string[];
  maxSizeBytes?: number;
  validateContent?: boolean;
}

/**
 * Validates file content by checking magic bytes (actual file type, not just extension/MIME)
 * Prevents file spoofing attacks where .jpg files are renamed to .xlsx
 */
@Injectable()
export class ValidateFileContentPipe implements PipeTransform {
  constructor(private readonly options: FileValidationOptions = {}) {}

  async transform(file: Express.Multer.File): Promise<Express.Multer.File> {
    if (!file) {
      throw new BadRequestException('File wajib diunggah');
    }

    const {
      allowedMimeTypes = [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel',
        'application/octet-stream',
        'text/csv',
        'application/csv',
      ],
      maxSizeBytes = 15 * 1024 * 1024,
      validateContent = true,
    } = this.options;

    // Check file size
    if (file.size > maxSizeBytes) {
      throw new BadRequestException(
        `Ukuran file tidak boleh lebih dari ${maxSizeBytes / 1024 / 1024}MB`,
      );
    }

    // Check extension
    const filename = file.originalname.toLowerCase();
    const isAllowedExtension =
      filename.endsWith('.xlsx') ||
      filename.endsWith('.xls') ||
      filename.endsWith('.csv');

    if (!isAllowedExtension) {
      throw new BadRequestException(
        'File harus berformat .xlsx, .xls, atau .csv',
      );
    }

    // Check MIME type from client
    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        'Tipe file tidak didukung. Gunakan Excel atau CSV.',
      );
    }

    // Validate actual file content (magic bytes) to prevent spoofing
    if (validateContent) {
      await this.validateFileByContent(file);
    }

    return file;
  }

  private async validateFileByContent(file: Express.Multer.File) {
    try {
      const fileType = await fileTypeFromBuffer(file.buffer);

      if (!fileType) {
        // Some CSV files might not be detected by magic bytes
        // Only reject if filename indicates it should be Excel
        if (
          file.originalname.toLowerCase().endsWith('.xlsx') ||
          file.originalname.toLowerCase().endsWith('.xls')
        ) {
          throw new BadRequestException(
            'File tidak valid atau file Excel terkorupsi',
          );
        }
      }

      // If file type is detected, validate it matches expected types
      if (fileType && fileType.mime) {
        const acceptableTypes = [
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
          'application/vnd.ms-excel', // .xls
          'text/plain', // CSV (sometimes detected as text/plain)
          'text/csv', // CSV
          'application/csv', // CSV
        ];

        if (!acceptableTypes.includes(fileType.mime)) {
          throw new BadRequestException(
            `File content tidak sesuai. Terdeteksi: ${fileType.mime}`,
          );
        }
      }
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      // If file-type detection fails for other reasons, still allow for CSV
      if (file.originalname.toLowerCase().endsWith('.csv')) {
        return;
      }
      throw new BadRequestException(
        'Gagal memvalidasi konten file. Pastikan file valid.',
      );
    }
  }
}
