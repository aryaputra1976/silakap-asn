import { trace, ROOT_CONTEXT } from '@opentelemetry/api';
import type { Queue } from 'bullmq';

export function instrumentBullQueue(queue: Queue) {
  const tracer = trace.getTracer('bullmq');

  const originalAdd: typeof queue.add = queue.add.bind(queue);

  queue.add = (async function (...args) {
    const [name] = args;

    return tracer.startActiveSpan(
      `bullmq.add ${queue.name}`,
      {},                 // SpanOptions
      ROOT_CONTEXT,       // Context
      async (span) => {
        try {
          span.setAttribute('queue.name', queue.name);
          span.setAttribute('job.name', String(name));

          const result = await originalAdd(...args);

          if (result?.id) {
            span.setAttribute('job.id', result.id);
          }

          span.end();
          return result;
        } catch (err) {
          // ⭐ FIX: err is unknown → narrow it
          if (err instanceof Error) {
            span.recordException(err);
          } else {
            span.recordException(String(err));
          }

          span.setStatus({ code: 2 });
          span.end();
          throw err;
        }
      }
    );
  }) as typeof queue.add;

  return queue;
}
