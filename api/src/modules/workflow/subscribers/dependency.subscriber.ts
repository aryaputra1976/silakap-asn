import { EventBus } from "../events/event.bus"
import { WorkflowEvents } from "../events/workflow.events"
import { DependencyEngine } from "../../dependency/engine/dependency.engine"
import { prisma } from "@/core/prisma/prisma.client"

EventBus.subscribe(
  WorkflowEvents.STATE_CHANGED,
  async (event) => {

    const {
      usulId,
      jenisLayananId,
      toStatus
    } = event

    try {

      await prisma.$transaction(async (tx) => {

        await DependencyEngine.trigger(
          tx,
          jenisLayananId,
          toStatus,
          usulId
        )

      })

    } catch (err) {

      console.error(
        "[DependencySubscriber] error",
        err
      )

    }

  }
)