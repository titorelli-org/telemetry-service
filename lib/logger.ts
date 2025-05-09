import pino from "pino";
import pinoPretty from "pino-pretty";
import OpenobserveTransport from "@openobserve/pino-openobserve";
import { env } from "./env";

const ooBaseUrl = new URL(env.OO_BASE_URL);
const [username, password] = atob(env.OO_AUTH_CRED).split(":");

export const logger = pino(
  {
    name: "telemetry-service",
    level: "info",
  },
  pino.multistream([
    {
      level: "info",
      stream: new OpenobserveTransport({
        url: `${ooBaseUrl.protocol}//${ooBaseUrl.host}`,
        organization: "default",
        streamName: "telemetry-service",
        auth: { username, password },
        batchSize: 1,
        silentSuccess: true,
      }),
    },
    {
      level: "info",
      stream: pinoPretty({ colorize: true }),
    },
  ]),
);
