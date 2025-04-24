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
      await this.wal?.insert(update);

      await this.collection?.insertOne(update);

      this.logger.info(update);
    } catch (error) {
      this.logger.error(error);
    }
  }
}
