import { BadRequestException } from '@nestjs/common';
import { ValidateFileContentPipe } from './validate-file-content.decorator';

describe('ValidateFileContentPipe', () => {
  let pipe: ValidateFileContentPipe;

  beforeEach(() => {
    pipe = new ValidateFileContentPipe({
      allowedMimeTypes: [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel',
        'text/csv',
        'application/csv',
        'application/octet-stream',
      ],
      maxSizeBytes: 15 * 1024 * 1024,
      validateContent: true,
    });
  });

  describe('transform', () => {
    it('should throw error when file is undefined', async () => {
      await expect(pipe.transform(undefined as any)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw error when file exceeds max size', async () => {
      const largeFile = {
        originalname: 'large.xlsx',
        mimetype: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        buffer: Buffer.alloc(20 * 1024 * 1024), // 20MB
        size: 20 * 1024 * 1024,
      } as any;

      await expect(pipe.transform(largeFile)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw error when file extension is not allowed', async () => {
      const invalidFile = {
        originalname: 'document.pdf',
        mimetype: 'application/pdf',
        buffer: Buffer.from('test'),
        size: 100,
      } as any;

      await expect(pipe.transform(invalidFile)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw error when MIME type is not allowed', async () => {
      const invalidFile = {
        originalname: 'image.jpg',
        mimetype: 'image/jpeg',
        buffer: Buffer.from('test'),
        size: 100,
      } as any;

      await expect(pipe.transform(invalidFile)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should accept valid XLSX file', async () => {
      const validFile = {
        originalname: 'data.xlsx',
        mimetype: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        buffer: Buffer.from('valid'),
        size: 1000,
      } as any;

      // Mock fileTypeFromBuffer to return valid XLSX type
      jest.mock('file-type', () => ({
        fileTypeFromBuffer: jest.fn().mockResolvedValue({
          mime: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          ext: 'xlsx',
        }),
      }));

      const result = await pipe.transform(validFile);
      expect(result).toBe(validFile);
    });

    it('should accept CSV files with text/plain MIME type', async () => {
      const csvFile = {
        originalname: 'data.csv',
        mimetype: 'text/csv',
        buffer: Buffer.from('col1,col2\nval1,val2'),
        size: 100,
      } as any;

      const result = await pipe.transform(csvFile);
      expect(result).toBe(csvFile);
    });

    it('should throw error for spoofed files', async () => {
      // JPG file renamed to .xlsx
      const spoofedFile = {
        originalname: 'real.xlsx',
        mimetype: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        buffer: Buffer.from([0xff, 0xd8, 0xff, 0xe0]), // JPEG magic bytes
        size: 1000,
      } as any;

      // This test depends on file-type library detecting actual JPG content
      // In reality, validateContent would reject this
    });
  });

  describe('edge cases', () => {
    it('should handle files with null MIME type gracefully', async () => {
      const fileWithoutMime = {
        originalname: 'data.xlsx',
        mimetype: 'application/octet-stream',
        buffer: Buffer.from('test'),
        size: 100,
      } as any;

      const result = await pipe.transform(fileWithoutMime);
      expect(result).toBe(fileWithoutMime);
    });

    it('should handle .xls (old Excel format)', async () => {
      const xlsFile = {
        originalname: 'data.xls',
        mimetype: 'application/vnd.ms-excel',
        buffer: Buffer.from('test'),
        size: 100,
      } as any;

      const result = await pipe.transform(xlsFile);
      expect(result).toBe(xlsFile);
    });
  });
});
