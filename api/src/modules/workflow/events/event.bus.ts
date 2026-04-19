type EventHandler = (payload: any) => Promise<void>

export class EventBus {

  private static handlers: Record<string, EventHandler[]> = {}

  static subscribe(event: string, handler: EventHandler) {

    if (!this.handlers[event]) {
      this.handlers[event] = []
    }

    this.handlers[event].push(handler)

  }

  static async publish(event: string, payload: any) {

    const handlers = [...(this.handlers[event] || [])]

    for (const handler of handlers) {

      try {

        await handler(payload)

      } catch (err) {

        console.error(
          `[EventBus] handler error for event ${event}`,
          err
        )

      }

    }

  }

}