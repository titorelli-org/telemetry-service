import type { FastifyInstance } from "fastify";
import type { Logger } from "pino";
import type {
  Update,
  ChatFullInfo,
  ChatMember,
  UserFromGetMe,
} from "@grammyjs/types";
import type { TelemetryService } from "../../../telemetry-service";

export class TelemetryPlugin {
  public readonly ready: Promise<void>;
  private readonly updatePath = "/update";

  constructor(
    private readonly service: FastifyInstance,
    private readonly telemetry: TelemetryService,
    private readonly logger: Logger,
  ) {
    this.ready = this.initialize();
  }

  private async initialize() {
    await this.installUpdateRoute();
  }

  private async installUpdateRoute() {
    await this.service.post<{
      Body: {
        update: Update;
        chat: ChatFullInfo;
        author: ChatMember;
        me: UserFromGetMe;
      };
    }>(this.updatePath, async ({ body }) => {
      return this.telemetry.update(body);
    });
  }
}
