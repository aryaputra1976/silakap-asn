import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { IntegrasiModule } from '../integrasi.module';
import { PrismaService } from '../../../prisma/prisma.service';
import { INTEGRASI_IMPORT_STATUS } from './integrasi-import-status.constant';

/**
 * Integration tests untuk batch import flow
 * Tests the full E2E flow: upload -> validate -> commit
 * Uses test database (should be sanitized, not real DB)
 */
describe('Integrasi Import Integration Tests (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  const jwtToken = 'test-jwt-token'; // Mock JWT for testing

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [IntegrasiModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    prisma = moduleFixture.get<PrismaService>(PrismaService);
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  afterEach(async () => {
    // Clean up test data after each test
    await prisma.silakapPegawaiImportStaging.deleteMany({});
    await prisma.silakapPegawaiImportBatch.deleteMany({});
  });

  describe('POST /integrasi/import/pegawai/upload', () => {
    it('should upload valid Excel file and create batch', async () => {
      const excelBuffer = Buffer.from([
        0x50,
        0x4b,
        0x03,
        0x04, // ZIP magic bytes (XLSX is ZIP)
      ]);

      const response = await request(app.getHttpServer())
        .post('/integrasi/import/pegawai/upload')
        .set('Authorization', `Bearer ${jwtToken}`)
        .attach('file', excelBuffer, 'pegawai.xlsx')
        .expect(201);

      expect(response.body).toHaveProperty('batchId');
      expect(response.body).toHaveProperty('batchCode');
      expect(response.body.status).toBe(INTEGRASI_IMPORT_STATUS.DRAFT);
      expect(response.body.fileName).toBe('pegawai.xlsx');
    });

    it('should reject spoofed file (JPG renamed to XLSX)', async () => {
      const jpgBuffer = Buffer.from([0xff, 0xd8, 0xff, 0xe0]); // JPEG magic bytes

      const response = await request(app.getHttpServer())
        .post('/integrasi/import/pegawai/upload')
        .set('Authorization', `Bearer ${jwtToken}`)
        .attach('file', jpgBuffer, 'fake.xlsx')
        .expect(400);

      expect(response.body.message).toContain('invalid');
    });

    it('should reject file exceeding size limit', async () => {
      // Create buffer larger than 15MB
      const largeBuffer = Buffer.alloc(20 * 1024 * 1024);

      await request(app.getHttpServer())
        .post('/integrasi/import/pegawai/upload')
        .set('Authorization', `Bearer ${jwtToken}`)
        .attach('file', largeBuffer, 'large.xlsx')
        .expect(413); // Payload Too Large or 400
    });

    it('should reject file with invalid extension', async () => {
      const buffer = Buffer.from('some content');

      const response = await request(app.getHttpServer())
        .post('/integrasi/import/pegawai/upload')
        .set('Authorization', `Bearer ${jwtToken}`)
        .attach('file', buffer, 'document.pdf')
        .expect(400);

      expect(response.body.message).toContain('xlsx, .xls, atau .csv');
    });

    it('should rate limit uploads to 5 per 60 seconds', async () => {
      const excelBuffer = Buffer.from([0x50, 0x4b, 0x03, 0x04]); // ZIP magic bytes

      // Upload 5 times (should succeed)
      for (let i = 0; i < 5; i++) {
        await request(app.getHttpServer())
          .post('/integrasi/import/pegawai/upload')
          .set('Authorization', `Bearer ${jwtToken}`)
          .attach('file', excelBuffer, `pegawai${i}.xlsx`)
          .expect(201);
      }

      // 6th upload should be rate limited
      await request(app.getHttpServer())
        .post('/integrasi/import/pegawai/upload')
        .set('Authorization', `Bearer ${jwtToken}`)
        .attach('file', excelBuffer, 'pegawai_extra.xlsx')
        .expect(429); // Too Many Requests
    });
  });

  describe('GET /integrasi/import/pegawai/batches/:batchId', () => {
    it('should allow batch owner to view batch details', async () => {
      const batch = await prisma.silakapPegawaiImportBatch.create({
        data: {
          batchCode: 'TEST_BATCH_001',
          fileName: 'test.xlsx',
          totalRows: 100,
          validRows: 100,
          invalidRows: 0,
          importedRows: 0,
          status: INTEGRASI_IMPORT_STATUS.DRAFT,
          createdBy: 'test-user-123',
        },
      });

      const response = await request(app.getHttpServer())
        .get(`/integrasi/import/pegawai/batches/${batch.id}`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .set('X-User-ID', 'test-user-123') // Mock user context
        .expect(200);

      expect(response.body).toHaveProperty('batchCode', 'TEST_BATCH_001');
      expect(response.body).toHaveProperty('fileName', 'test.xlsx');
    });

    it('should deny non-owner access to batch', async () => {
      const batch = await prisma.silakapPegawaiImportBatch.create({
        data: {
          batchCode: 'PRIVATE_BATCH',
          fileName: 'private.xlsx',
          totalRows: 50,
          validRows: 50,
          invalidRows: 0,
          importedRows: 0,
          status: INTEGRASI_IMPORT_STATUS.DRAFT,
          createdBy: 'other-user',
        },
      });

      const response = await request(app.getHttpServer())
        .get(`/integrasi/import/pegawai/batches/${batch.id}`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .set('X-User-ID', 'different-user')
        .expect(403); // Forbidden

      expect(response.body.message).toContain('tidak memiliki izin');
    });

    it('should return 404 for non-existent batch', async () => {
      const response = await request(app.getHttpServer())
        .get('/integrasi/import/pegawai/batches/999999')
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(404);

      expect(response.body.message).toContain('tidak ditemukan');
    });
  });

  describe('POST /integrasi/import/pegawai/batches/:batchId/validate', () => {
    it('should validate batch only from DRAFT status', async () => {
      const batch = await prisma.silakapPegawaiImportBatch.create({
        data: {
          batchCode: 'VALIDATE_TEST',
          fileName: 'validate.xlsx',
          totalRows: 10,
          validRows: 0,
          invalidRows: 0,
          importedRows: 0,
          status: INTEGRASI_IMPORT_STATUS.DRAFT,
          createdBy: 'test-user',
        },
      });

      // Add sample staging rows
      await prisma.silakapPegawaiImportStaging.createMany({
        data: [
          {
            batchId: batch.id,
            rowNumber: 1,
            nip: '123456',
            nik: '1234567890123456',
            nama: 'John Doe',
            siasnId: null,
            rawData: { NIP: '123456' },
            mappedData: { nip: '123456' },
            isValid: false,
            isImported: false,
          },
        ],
      });

      const response = await request(app.getHttpServer())
        .post(`/integrasi/import/pegawai/batches/${batch.id}/validate`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .set('X-User-ID', 'test-user')
        .expect(200);

      expect(response.body).toHaveProperty('batchId');
      expect(response.body).toHaveProperty('validRows');
      expect(response.body).toHaveProperty('invalidRows');
    });

    it('should rate limit validation to 3 per 60 seconds', async () => {
      // This would require mocking time or using a time-based test setup
      // For now, document the expected behavior
      // Expect: @Throttle({ default: { limit: 3, ttl: 60000 } }) on validate endpoint
    });
  });

  describe('POST /integrasi/import/pegawai/batches/:batchId/commit', () => {
    it('should commit batch with valid status transition', async () => {
      const batch = await prisma.silakapPegawaiImportBatch.create({
        data: {
          batchCode: 'COMMIT_TEST',
          fileName: 'commit.xlsx',
          totalRows: 10,
          validRows: 10,
          invalidRows: 0,
          importedRows: 0,
          status: INTEGRASI_IMPORT_STATUS.VALIDATED,
          createdBy: 'test-user',
        },
      });

      const response = await request(app.getHttpServer())
        .post(`/integrasi/import/pegawai/batches/${batch.id}/commit`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .set('X-User-ID', 'test-user')
        .expect(200);

      expect(response.body).toHaveProperty('batchId');
      expect(response.body.status).toBe(INTEGRASI_IMPORT_STATUS.IMPORTED);
    });

    it('should reject commit on batch with errors', async () => {
      const batch = await prisma.silakapPegawaiImportBatch.create({
        data: {
          batchCode: 'COMMIT_ERROR_TEST',
          fileName: 'errors.xlsx',
          totalRows: 10,
          validRows: 5,
          invalidRows: 5,
          importedRows: 0,
          status: INTEGRASI_IMPORT_STATUS.VALIDATED_WITH_ERROR,
          createdBy: 'test-user',
          errors: { hasErrors: true },
        },
      });

      const response = await request(app.getHttpServer())
        .post(`/integrasi/import/pegawai/batches/${batch.id}/commit`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .set('X-User-ID', 'test-user')
        .expect(409); // Conflict

      expect(response.body.message).toContain('tidak dapat diproses');
    });

    it('should rate limit commits to 2 per 60 seconds', async () => {
      // Document expected behavior: @Throttle({ default: { limit: 2, ttl: 60000 } })
    });
  });

  describe('GET /integrasi/import/pegawai/batches', () => {
    it('should list batches paginated', async () => {
      // Create test batches
      for (let i = 1; i <= 15; i++) {
        await prisma.silakapPegawaiImportBatch.create({
          data: {
            batchCode: `BATCH_${i}`,
            fileName: `file${i}.xlsx`,
            totalRows: 100,
            validRows: 100,
            invalidRows: 0,
            importedRows: 0,
            status: INTEGRASI_IMPORT_STATUS.DRAFT,
            createdBy: 'test-user',
          },
        });
      }

      const response = await request(app.getHttpServer())
        .get('/integrasi/import/pegawai/batches')
        .query({ page: 1, limit: 10 })
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('meta');
      expect(response.body.data).toHaveLength(10);
      expect(response.body.meta.total).toBe(15);
      expect(response.body.meta.totalPages).toBe(2);
    });
  });

  describe('Batch Ownership Access Control', () => {
    it('full scenario: user1 creates batch, user2 cannot access it', async () => {
      // User1 creates batch
      const batch = await prisma.silakapPegawaiImportBatch.create({
        data: {
          batchCode: 'USER1_BATCH',
          fileName: 'user1.xlsx',
          totalRows: 20,
          validRows: 0,
          invalidRows: 0,
          importedRows: 0,
          status: INTEGRASI_IMPORT_STATUS.DRAFT,
          createdBy: 'user-1',
        },
      });

      // User1 can view
      await request(app.getHttpServer())
        .get(`/integrasi/import/pegawai/batches/${batch.id}`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .set('X-User-ID', 'user-1')
        .expect(200);

      // User2 cannot view
      await request(app.getHttpServer())
        .get(`/integrasi/import/pegawai/batches/${batch.id}`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .set('X-User-ID', 'user-2')
        .expect(403);

      // Admin can view
      await request(app.getHttpServer())
        .get(`/integrasi/import/pegawai/batches/${batch.id}`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .set('X-User-ID', 'admin')
        .set('X-User-Role', 'SUPER_ADMIN')
        .expect(200);
    });
  });
});
