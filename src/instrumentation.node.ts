import { Metadata, credentials } from '@grpc/grpc-js';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-grpc';
import { Resource } from '@opentelemetry/resources';
import { NodeSDK } from '@opentelemetry/sdk-node';
import { BatchSpanProcessor } from '@opentelemetry/sdk-trace-node';
import { SEMRESATTRS_SERVICE_NAME } from '@opentelemetry/semantic-conventions';

const metadata = new Metadata();
// metadata.set('api-key', process.env.NEW_RELIC_LICENSE_KEY || '');
metadata.set(
  'x-honeycomb-team',
  process.env.HONEYCOMB_API_KEY || '',
);

const sdk = new NodeSDK({
  serviceName: `otel-prop-issue-test`,
  resource: new Resource({
    [SEMRESATTRS_SERVICE_NAME]: `otel-prop-issue-test`,
  }),
  spanProcessor: new BatchSpanProcessor(
    new OTLPTraceExporter({
      url: 'grpc://api.honeycomb.io:443/',
      metadata: metadata,
      credentials: credentials.createSsl(),
    }),
    {
      scheduledDelayMillis: 500,
      maxQueueSize: 16000,
      maxExportBatchSize: 1000,
    },
  ),
  instrumentations: [
    getNodeAutoInstrumentations({
      '@opentelemetry/instrumentation-fs': {
        enabled: false,
      },
      '@opentelemetry/instrumentation-http': {
        // NextJS already has OTel root span to handle incoming requests
        // we only want to trace outgoing requests with instrumentation-http
        disableIncomingRequestInstrumentation: true,
      },
    }),
  ],
});
sdk.start();
