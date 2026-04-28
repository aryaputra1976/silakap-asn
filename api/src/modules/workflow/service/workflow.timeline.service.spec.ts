import { WorkflowTimelineService } from './workflow.timeline.service'

function makeTx(existing: unknown) {
  return {
    silakapWorkflowTimeline: {
      findFirst: jest.fn().mockResolvedValue(existing),
      create: jest.fn().mockResolvedValue({}),
    },
  } as unknown as Parameters<typeof WorkflowTimelineService.create>[0]
}

describe('WorkflowTimelineService.create – dedupe', () => {
  it('membuat record jika belum ada', async () => {
    const tx = makeTx(null)
    await WorkflowTimelineService.create(tx, 1n, 'DRAFT', 'DIAJUKAN', 99n)
    expect(tx.silakapWorkflowTimeline.create).toHaveBeenCalledTimes(1)
  })

  it('skip jika (usulId, fromStatus, toStatus) sudah ada', async () => {
    const tx = makeTx({ id: 1n }) // existing record
    await WorkflowTimelineService.create(tx, 1n, 'DRAFT', 'DIAJUKAN', 99n)
    expect(tx.silakapWorkflowTimeline.create).not.toHaveBeenCalled()
  })
})
