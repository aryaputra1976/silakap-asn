import { NodeSDK } from '@opentelemetry/sdk-node'
import {
  detectResources,
  resourceFromAttributes,
} from '@opentelemetry/resources'
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions'

import { HttpInstrumentation } from '@opentelemetry/instrumentation-http'
import { ExpressInstrumentation } from '@opentelemetry/instrumentation-express'
import { RedisInstrumentation } from '@opentelemetry/instrumentation-redis'

import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http'

export async function createTracingSDK(): Promise<NodeSDK> {
  const auto = await detectResources()

  const manual = resourceFromAttributes({
    [SemanticResourceAttributes.SERVICE_NAME]: 'silakap-api',
    [SemanticResourceAttributes.SERVICE_VERSION]: '1.0.0',
  })

  return new NodeSDK({
    resource: auto.merge(manual),

    traceExporter: new OTLPTraceExporter({
      url:
        process.env.OTEL_EXPORTER_OTLP_ENDPOINT ??
        'http://localhost:4318/v1/traces',
    }),

    instrumentations: [
      new HttpInstrumentation(),
      new ExpressInstrumentation(),
      new RedisInstrumentation(),
    ],
  })
}