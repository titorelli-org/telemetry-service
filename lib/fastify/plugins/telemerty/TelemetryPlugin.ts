import type { FastifyInstance } from "fastify";
import type { UpdateRepo } from "../../repositories";
import type { Logger } from "pino";
import type {
  Update,
  ChatFullInfo,
  ChatMember,
  UserFromGetMe,
} from "@grammyjs/types";

export class TelemetryPlugin {
  public readonly ready: Promise<void>;

  constructor(
    private readonly service: FastifyInstance,
    private readonly updates: UpdateRepo,
    private readonly logger: Logger,
  ) {
    this.ready = this.initialize();
  }

  private async initialize() {
    this.service.post<{
      Body: {
        update: Update;
        chat: ChatFullInfo;
        author: ChatMember;
        me: UserFromGetMe;
      };
    }>("/update", async ({ body }) => {
      await this.updates.insert(body);
    });
  }
}
