import { EventBus } from "../events/event.bus"
import { WorkflowEvents } from "../events/workflow.events"
import { SLAEngine } from "../../services/sla/engine/sla.engine"
import { prisma } from "@/core/prisma/prisma.client"

EventBus.subscribe(
  WorkflowEvents.STATE_CHANGED,
  async (event) => {

    const {
      usulId,
      jenisLayananId,
      fromStatus,
      toStatus
    } = event

    try {

      await prisma.$transaction(async (tx) => {

        await SLAEngine.finish(
          tx,
          usulId,
          fromStatus
        )

        await SLAEngine.start(
          tx,
          usulId,
          jenisLayananId,
          toStatus
        )

      })

    } catch (err) {

      console.error(
        "[SLASubscriber] error",
        err
      )

    }

  }
)