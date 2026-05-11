/**
 * OpenTelemetry instrumentation — must be loaded BEFORE any other imports.
 * Called from main.ts and worker.ts as the first line.
 *
 * Traces HTTP requests, database queries, Redis commands, and BullMQ jobs.
 * Exports via OTLP to any compatible collector (Jaeger, Grafana Tempo, etc.).
 *
 * Configure via environment:
 *   OTEL_EXPORTER_OTLP_ENDPOINT  — collector URL (default: http://localhost:4318)
 *   OTEL_SERVICE_NAME            — overrides the default service name
 *   OTEL_TRACES_ENABLED          — set to "false" to disable (default: enabled)
 */
import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';

const isEnabled = process.env.OTEL_TRACES_ENABLED !== 'false';

let sdk: NodeSDK | null = null;

if (isEnabled) {
  const serviceName =
    process.env.OTEL_SERVICE_NAME || `taskforge-${process.env.npm_lifecycle_event === 'start:worker' ? 'worker' : 'api'}`;

  sdk = new NodeSDK({
    serviceName,
    traceExporter: new OTLPTraceExporter({
      url: process.env.OTEL_EXPORTER_OTLP_ENDPOINT || 'http://localhost:4318/v1/traces',
    }),
    instrumentations: [
      getNodeAutoInstrumentations({
        '@opentelemetry/instrumentation-fs': { enabled: false },
      }),
    ],
  });

  sdk.start();
}

export function shutdownTelemetry(): Promise<void> {
  return sdk?.shutdown() ?? Promise.resolve();
}
