import type { Collection, MongoClient } from "mongodb";
import type { Logger } from "pino";
import { Wal } from "../wal";

export class UpdateRepo {
  private collection: Collection;
  private wal: Wal;

  constructor(
    client: MongoClient,
    dbName: string,
    collectionName: string,
    private logger: Logger,
  ) {
    this.collection = client.db(dbName).collection(collectionName);
    this.wal = new Wal(dbName, collectionName, this.logger);
  }

  async insert(update: Record<string, unknown>) {
    try {
      await this.wal.insert(update);

      await this.collection.insertOne(update);
    } catch (error) {
      this.logger.error(error);
    }
  }
}
