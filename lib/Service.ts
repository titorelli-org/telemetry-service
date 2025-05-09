import type { Logger } from "pino";
import fastify, { type FastifyInstance } from "fastify";
import telemetryPlugin from "./fastify/plugins/telemerty";
import { UpdateRepo } from "./repositories";

export interface ServiceConfig {
  host: string;
  port: number;
  updates: UpdateRepo;
  logger: Logger;
}

export class Service {
  private readonly host: string;
  private readonly port: number;
  private readonly updates: UpdateRepo;
  private readonly logger: Logger;
  private server: FastifyInstance;
  private readonly ready: Promise<void>;

  constructor({ updates, logger, host, port }: ServiceConfig) {
    this.host = host;
    this.port = port;
    this.updates = updates;
    this.logger = logger;

    this.ready = this.initialize();
  }

  public async listen() {
    await this.ready;

    await this.server.listen({ port: this.port, host: this.host });
  }

  private async initialize() {
    this.server = fastify({ loggerInstance: this.logger, trustProxy: true });

    await this.server.register(telemetryPlugin, {
      updates: this.updates,
      logger: this.logger,
    });
  }
}
