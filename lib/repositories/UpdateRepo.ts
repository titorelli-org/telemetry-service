import type { Collection } from "mongodb";
import type { Logger } from "pino";
import type { ChatRepo } from "./ChatRepo";
import { Wal } from "../wal";
import { omit } from "lodash";

export class UpdateRepo {
  constructor(
    private wal: Wal | null,
    private collection: Collection | null,
    private chatRepo: ChatRepo,
    private logger: Logger,
  ) {}

  async insert(record: Record<string, unknown>) {
    try {
      await this.wal?.insert(record);

      await this.collection?.insertOne(omit(record, "chat"));

      await new this.chatRepo.CreateOrUpdateTransaction(
        (record.me as { id: number }).id,
      ).run(record.chat as Record<string, unknown>);

      this.logger.info(record, "Incoming Update");
    } catch (error) {
      this.logger.error(error);
    }
  }
}
