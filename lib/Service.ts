import type { Logger } from "pino";
import fastify, { type FastifyInstance } from "fastify";
import telemetryPlugin from "./fastify/plugins/telemerty";
import type { TelemetryService } from "./telemetry-service";

export interface ServiceConfig {
  host: string;
  port: number;
  telemetry: TelemetryService;
  logger: Logger;
}

export class Service {
  private readonly host: string;
  private readonly port: number;
  private readonly telemetry: TelemetryService;
  private readonly logger: Logger;
  private server: FastifyInstance;
  private readonly ready: Promise<void>;

  constructor({ telemetry, logger, host, port }: ServiceConfig) {
    this.host = host;
    this.port = port;
    this.telemetry = telemetry;
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
      telemetry: this.telemetry,
      logger: this.logger,
    });
  }
}
