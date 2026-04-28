import { ServicesWorkflowGuard } from './services.workflow.guard'
import { BusinessError } from '@/core/errors/business.error'

// Minimal tx mock factory
function makeTx(overrides: Record<string, unknown> = {}) {
  return {
    silakapUsulLayanan: {
      findUnique: jest.fn(),
    },
    silakapWorkflowTransition: {
      findFirst: jest.fn(),
    },
    silakapRole: {
      findMany: jest.fn(),
    },
    ...overrides,
  } as unknown as Parameters<ServicesWorkflowGuard['validate']>[0]
}

describe('ServicesWorkflowGuard.validate – multi-role', () => {
  let guard: ServicesWorkflowGuard

  beforeEach(() => {
    guard = new ServicesWorkflowGuard()
  })

  const usul = { id: 1n, status: 'DRAFT', jenisLayananId: 10n }
  const transition = { id: 99n, fromState: 'DRAFT', toState: 'DIAJUKAN', role: 'VERIFIKATOR' }

  it('lolos jika salah satu role user cocok dengan transition.role', async () => {
    const tx = makeTx()
    ;(tx.silakapUsulLayanan.findUnique as jest.Mock).mockResolvedValue(usul)
    ;(tx.silakapWorkflowTransition.findFirst as jest.Mock).mockResolvedValue(transition)
    // User memiliki 2 role; VERIFIKATOR adalah yang cocok
    ;(tx.silakapRole.findMany as jest.Mock).mockResolvedValue([
      { id: 1n, name: 'ADMIN' },
      { id: 2n, name: 'VERIFIKATOR' },
    ])

    const result = await guard.validate(tx, 1n, 'SUBMIT', [1n, 2n])

    expect(result.matchedRoleId).toBe(2n)
  })

  it('gagal jika tidak ada role user yang cocok', async () => {
    const tx = makeTx()
    ;(tx.silakapUsulLayanan.findUnique as jest.Mock).mockResolvedValue(usul)
    ;(tx.silakapWorkflowTransition.findFirst as jest.Mock).mockResolvedValue(transition)
    ;(tx.silakapRole.findMany as jest.Mock).mockResolvedValue([
      { id: 1n, name: 'ADMIN' },
    ])

    await expect(
      guard.validate(tx, 1n, 'SUBMIT', [1n]),
    ).rejects.toThrow(BusinessError)
  })

  it('gagal jika actorRoleIds kosong dan transition.role ada', async () => {
    const tx = makeTx()
    ;(tx.silakapUsulLayanan.findUnique as jest.Mock).mockResolvedValue(usul)
    ;(tx.silakapWorkflowTransition.findFirst as jest.Mock).mockResolvedValue(transition)

    await expect(
      guard.validate(tx, 1n, 'SUBMIT', []),
    ).rejects.toThrow(BusinessError)
  })

  it('lolos tanpa role check jika transition.role null', async () => {
    const tx = makeTx()
    ;(tx.silakapUsulLayanan.findUnique as jest.Mock).mockResolvedValue(usul)
    ;(tx.silakapWorkflowTransition.findFirst as jest.Mock).mockResolvedValue({
      ...transition,
      role: null,
    })

    const result = await guard.validate(tx, 1n, 'SUBMIT', undefined)

    expect(result.matchedRoleId).toBeUndefined()
  })
})
