import fastifyPlugin from "fastify-plugin";
import type { FastifyPluginAsync } from "fastify";
import type { Logger } from "pino";
import { TelemetryPlugin } from "./TelemetryPlugin";
import { TelemetryService } from "../../../telemetry-service";

export interface CasPlugonOpts {
  telemetry: TelemetryService;
  logger: Logger;
}

const telemetryPlugin: FastifyPluginAsync<CasPlugonOpts> = async (
  fastify,
  { telemetry, logger },
) => {
  const plugin = new TelemetryPlugin(fastify, telemetry, logger);

  await plugin.ready;
};

export default fastifyPlugin(telemetryPlugin);
