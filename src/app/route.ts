import { context, isSpanContextValid, trace } from '@opentelemetry/api';
import axios from 'axios';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
// import got from 'got';
import getConfig from 'next/config';
import { NextResponse } from 'next/server';


export const dynamic = 'force-dynamic';

export async function GET() {
  let traceId = 'no trace ID';
  let spanId = 'no span ID';
  const span = trace.getSpan(context.active());

  if (span && isSpanContextValid(span.spanContext())) {
    traceId = span.spanContext().traceId;
    spanId = span.spanContext().spanId;
  }

  // Call echo service to see if traceparent is propagated
  const echoResponseAxios = await axios.get('https://echo.free.beeceptor.com');
  const echoResponseAxiosObj = echoResponseAxios.data;
  echoResponseAxiosObj.ip = "Removed";
  const echoResponseObjHeaders = echoResponseAxiosObj.headers;

  const traceparentKey = Object.keys(echoResponseObjHeaders).find(key => key.toLowerCase() === "traceparent");
  const traceparent = traceparentKey ? echoResponseObjHeaders[traceparentKey] : undefined;

  // Extract traceId from traceparent
  const traceIdFromTraceparent = traceparent?.split("-")[1];

  const { publicRuntimeConfig } = getConfig();

  return NextResponse.json({
    "nextJsVersion": publicRuntimeConfig?.nextVersion,
    "traceIdMatches": traceId === traceIdFromTraceparent,
    "traceId": traceId,
    "spanId": spanId,
    "echoFromAxios": echoResponseAxiosObj,
    "traceparent": traceparent
  })
}