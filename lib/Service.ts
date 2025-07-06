import type { Logger } from "pino";
import fastify, { type FastifyInstance } from "fastify";
import type { JwksStore } from "@titorelli-org/jwks-store";
import { oidcProvider } from "@titorelli-org/fastify-oidc-provider";
import { protectedRoutes } from "@titorelli-org/fastify-protected-routes";
import telemetryPlugin from "./fastify/plugins/telemerty";
import type { TelemetryService } from "./telemetry-service";
import { env } from "./env";

export interface ServiceConfig {
  host: string;
  port: number;
  telemetry: TelemetryService;
  jwksStore: JwksStore;
  logger: Logger;
}

export class Service {
  private readonly host: string;
  private readonly port: number;
  private readonly telemetry: TelemetryService;
  private readonly jwksStore: JwksStore;
  private readonly logger: Logger;
  private server: FastifyInstance;
  private readonly ready: Promise<void>;

  constructor({ telemetry, logger, host, port, jwksStore }: ServiceConfig) {
    this.host = host;
    this.port = port;
    this.telemetry = telemetry;
    this.jwksStore = jwksStore;
    this.logger = logger;

    this.ready = this.initialize();
  }

  public async listen() {
    await this.ready;

    await this.server.listen({ port: this.port, host: this.host });
  }

  private async initialize() {
    this.server = fastify({ loggerInstance: this.logger, trustProxy: true });

    await this.server.register(oidcProvider, {
      origin: env.TELEMETRY_ORIGIN,
      jwksStore: this.jwksStore,
      logger: this.logger,
    });

    await this.server.register(protectedRoutes, {
      origin: env.TELEMETRY_ORIGIN,
      authorizationServers: [`${env.TELEMETRY_ORIGIN}/oidc`],
      allRoutesRequireAuthorization: false,
      logger: this.logger,
      async checkToken() {
        return true;
      },
    });

    await this.server.register(telemetryPlugin, {
      telemetry: this.telemetry,
      logger: this.logger,
    });
  }
}
