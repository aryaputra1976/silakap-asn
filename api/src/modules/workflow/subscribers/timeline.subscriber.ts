import { EventBus } from "../events/event.bus"
import { WorkflowEvents } from "../events/workflow.events"
import { WorkflowTimelineService } from "../service/workflow.timeline.service"
import { prisma } from "@/core/prisma/prisma.client"

EventBus.subscribe(
  WorkflowEvents.STATE_CHANGED,
  async (event) => {

    const {
      usulId,
      fromStatus,
      toStatus
    } = event

    if (!usulId || !fromStatus || !toStatus) {
      return
    }

    try {

      await prisma.$transaction(async (tx) => {

        await WorkflowTimelineService.create(
          tx,
          usulId,
          fromStatus,
          toStatus
        )

      })

    } catch (err) {

      console.error(
        "[TimelineSubscriber] error",
        err
      )

    }

  }
)