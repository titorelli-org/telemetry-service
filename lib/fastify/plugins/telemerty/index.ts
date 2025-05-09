import fastifyPlugin from "fastify-plugin";
import type { FastifyPluginAsync } from "fastify";
import type { Logger } from "pino";
import { TelemetryPlugin } from "./TelemetryPlugin";
import type { UpdateRepo } from "../../repositories";

export interface CasPlugonOpts {
  updates: UpdateRepo;
  logger: Logger;
}

const telemetryPlugin: FastifyPluginAsync<CasPlugonOpts> = async (
  fastify,
  { updates, logger },
) => {
  const plugin = new TelemetryPlugin(fastify, updates, logger);

  await plugin.ready;
};

export default fastifyPlugin(telemetryPlugin);
