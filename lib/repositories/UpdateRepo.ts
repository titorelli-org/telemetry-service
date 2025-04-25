import type { Collection } from "mongodb";
import type { Logger } from "pino";
import { Wal } from "../wal";

export class UpdateRepo {
  constructor(
    private wal: Wal | null,
    private collection: Collection | null,
    private logger: Logger,
  ) {}

  async insert(update: Record<string, unknown>) {
    try {
      const record = { update };

      await this.wal?.insert(record);

      await this.collection?.insertOne(record);

      this.logger.info(record, "Incoming Update");
    } catch (error) {
      this.logger.error(error);
    }
  }
}
