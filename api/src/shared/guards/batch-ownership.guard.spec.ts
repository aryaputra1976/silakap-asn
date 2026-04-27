import { ForbiddenException, NotFoundException, BadRequestException } from '@nestjs/common';
import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Test, TestingModule } from '@nestjs/testing';
import { BatchOwnershipGuard } from './batch-ownership.guard';
import { IntegrasiImportRepository } from '../../modules/integrasi/import/integrasi-import.repository';

describe('BatchOwnershipGuard', () => {
  let guard: BatchOwnershipGuard;
  let repository: IntegrasiImportRepository;
  let reflector: Reflector;

  const mockRepository = {
    findBatchById: jest.fn(),
  };

  const mockReflector = {
    get: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BatchOwnershipGuard,
        {
          provide: IntegrasiImportRepository,
          useValue: mockRepository,
        },
        {
          provide: Reflector,
          useValue: mockReflector,
        },
      ],
    }).compile();

    guard = module.get<BatchOwnershipGuard>(BatchOwnershipGuard);
    repository = module.get<IntegrasiImportRepository>(IntegrasiImportRepository);
    reflector = module.get<Reflector>(Reflector);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  function createMockContext(params: any, user: any): ExecutionContext {
    const mockRequest = {
      params,
      user,
    };

    return {
      switchToHttp: () => ({
        getRequest: () => mockRequest,
      }),
    } as unknown as ExecutionContext;
  }

  describe('canActivate', () => {
    it('should throw BadRequestException when user context is missing', async () => {
      const context = createMockContext({ batchId: '1' }, null);

      await expect(guard.canActivate(context)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should return true when no batchId in params', async () => {
      const context = createMockContext({}, { id: 'user123' });

      const result = await guard.canActivate(context);
      expect(result).toBe(true);
    });

    it('should throw NotFoundException when batch does not exist', async () => {
      mockRepository.findBatchById.mockResolvedValue(null);
      const context = createMockContext({ batchId: '999' }, { id: 'user123' });

      await expect(guard.canActivate(context)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should return true when user owns the batch', async () => {
      const mockBatch = {
        id: BigInt(1),
        createdBy: 'user123',
        batchCode: 'BATCH001',
      };

      mockRepository.findBatchById.mockResolvedValue(mockBatch);
      const context = createMockContext(
        { batchId: '1' },
        { id: 'user123', roles: [] },
      );

      const result = await guard.canActivate(context);
      expect(result).toBe(true);

      // Check that batch is attached to request
      const request = context.switchToHttp().getRequest();
      expect(request.batch).toBe(mockBatch);
    });

    it('should return true when user is SUPER_ADMIN', async () => {
      const mockBatch = {
        id: BigInt(1),
        createdBy: 'otheruser',
        batchCode: 'BATCH001',
      };

      mockRepository.findBatchById.mockResolvedValue(mockBatch);
      const context = createMockContext(
        { batchId: '1' },
        { id: 'admin', roles: ['SUPER_ADMIN'] },
      );

      const result = await guard.canActivate(context);
      expect(result).toBe(true);
    });

    it('should return true when user.isAdmin is true', async () => {
      const mockBatch = {
        id: BigInt(1),
        createdBy: 'otheruser',
        batchCode: 'BATCH001',
      };

      mockRepository.findBatchById.mockResolvedValue(mockBatch);
      const context = createMockContext(
        { batchId: '1' },
        { id: 'admin', isAdmin: true, roles: [] },
      );

      const result = await guard.canActivate(context);
      expect(result).toBe(true);
    });

    it('should throw ForbiddenException when user does not own batch and is not admin', async () => {
      const mockBatch = {
        id: BigInt(1),
        createdBy: 'otheruser',
        batchCode: 'BATCH001',
      };

      mockRepository.findBatchById.mockResolvedValue(mockBatch);
      const context = createMockContext(
        { batchId: '1' },
        { id: 'user123', roles: ['USER'] },
      );

      await expect(guard.canActivate(context)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('access control scenarios', () => {
    it('should allow owner to access own batch', async () => {
      const batch = {
        id: BigInt(1),
        createdBy: 'owner_user',
      };

      mockRepository.findBatchById.mockResolvedValue(batch);
      const context = createMockContext(
        { batchId: '1' },
        { id: 'owner_user' },
      );

      const result = await guard.canActivate(context);
      expect(result).toBe(true);
    });

    it('should deny other users from accessing batch', async () => {
      const batch = {
        id: BigInt(1),
        createdBy: 'owner_user',
      };

      mockRepository.findBatchById.mockResolvedValue(batch);
      const context = createMockContext(
        { batchId: '1' },
        { id: 'different_user' },
      );

      await expect(guard.canActivate(context)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should allow admin to access any batch', async () => {
      const batch = {
        id: BigInt(1),
        createdBy: 'owner_user',
      };

      mockRepository.findBatchById.mockResolvedValue(batch);
      const context = createMockContext(
        { batchId: '1' },
        { id: 'admin_user', isAdmin: true },
      );

      const result = await guard.canActivate(context);
      expect(result).toBe(true);
    });
  });
});
