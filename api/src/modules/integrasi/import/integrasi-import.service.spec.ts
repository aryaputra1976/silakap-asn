import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { IntegrasiImportService } from './integrasi-import.service';
import { IntegrasiImportRepository } from './integrasi-import.repository';
import {
  INTEGRASI_IMPORT_STATUS,
  INTEGRASI_IMPORT_EVENT,
} from './integrasi-import-status.constant';

describe('IntegrasiImportService', () => {
  let service: IntegrasiImportService;
  let repository: IntegrasiImportRepository;

  const mockRepository = {
    findBatchById: jest.fn(),
    findBatches: jest.fn(),
    findRowsForValidation: jest.fn(),
    findExistingJabatanKeys: jest.fn(),
    findExistingUnorKeys: jest.fn(),
    findExistingPendidikanKeys: jest.fn(),
    createImportBatch: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        IntegrasiImportService,
        {
          provide: IntegrasiImportRepository,
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<IntegrasiImportService>(IntegrasiImportService);
    repository = module.get<IntegrasiImportRepository>(IntegrasiImportRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findBatchDetail', () => {
    it('should return batch detail when batch exists', async () => {
      const mockBatch = {
        id: BigInt(1),
        batchCode: 'BATCH001',
        fileName: 'test.xlsx',
        totalRows: 100,
        validRows: 100,
        invalidRows: 0,
        importedRows: 0,
        status: INTEGRASI_IMPORT_STATUS.DRAFT,
        errors: null,
        createdBy: 'user123',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockRepository.findBatchById.mockResolvedValue(mockBatch);

      const result = await service.findBatchDetail(BigInt(1));

      expect(result).toBeDefined();
      expect(mockRepository.findBatchById).toHaveBeenCalledWith(BigInt(1));
    });

    it('should throw NotFoundException when batch does not exist', async () => {
      mockRepository.findBatchById.mockResolvedValue(null);

      await expect(service.findBatchDetail(BigInt(999))).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('uploadPegawaiImport', () => {
    it('should create batch with valid Excel file', async () => {
      const mockFile = {
        originalname: 'pegawai.xlsx',
        buffer: Buffer.from('PK...'), // Mock Excel file magic bytes
        size: 1024,
        mimetype: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        fieldname: 'file',
        encoding: '7bit',
        destination: '/tmp',
        filename: 'pegawai.xlsx',
        path: '/tmp/pegawai.xlsx',
      } as any;

      const mockBatch = {
        id: BigInt(1),
        batchCode: 'BATCH001',
        fileName: 'pegawai.xlsx',
        totalRows: 10,
        validRows: 0,
        invalidRows: 0,
        importedRows: 0,
        status: INTEGRASI_IMPORT_STATUS.DRAFT,
        errors: { event: INTEGRASI_IMPORT_EVENT.IMPORT_FILE_UPLOADED },
        createdBy: 'user123',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Mock XLSX parsing - would normally parse the file
      // This test assumes the file parsing works, which would be tested separately
      jest
        .spyOn(service as any, 'parseWorkbookToRows')
        .mockReturnValue([
          {
            rowNumber: 1,
            rawData: { NIP: '123456' },
            mappedData: { nip: '123456' },
            nip: '123456',
            nik: null,
            nama: 'John Doe',
            siasnId: null,
          },
        ]);

      mockRepository.createImportBatch.mockResolvedValue(mockBatch);

      const result = await service.uploadPegawaiImport(mockFile, 'user123');

      expect(result).toHaveProperty('batchId');
      expect(result.batchId).toBe('1');
      expect(result.fileName).toBe('pegawai.xlsx');
      expect(mockRepository.createImportBatch).toHaveBeenCalled();
    });

    it('should throw BadRequestException when file is empty', async () => {
      const mockFile = {
        originalname: 'empty.xlsx',
        buffer: Buffer.from(''),
        size: 0,
        mimetype: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      } as any;

      jest
        .spyOn(service as any, 'parseWorkbookToRows')
        .mockReturnValue([]);

      await expect(service.uploadPegawaiImport(mockFile, 'user123')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('findBatches', () => {
    it('should return list of batches', async () => {
      const mockBatches = {
        items: [
          {
            id: BigInt(1),
            batchCode: 'BATCH001',
            fileName: 'pegawai.xlsx',
            totalRows: 100,
            validRows: 100,
            invalidRows: 0,
            importedRows: 0,
            status: INTEGRASI_IMPORT_STATUS.DRAFT,
            createdAt: new Date(),
          },
        ],
        total: 1,
        page: 1,
        limit: 10,
      };

      mockRepository.findBatches.mockResolvedValue(mockBatches);

      const result = await service.findBatches({ page: 1, limit: 10 });

      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('meta');
      expect(result.data).toHaveLength(1);
      expect(mockRepository.findBatches).toHaveBeenCalled();
    });
  });
});
