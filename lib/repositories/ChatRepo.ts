import { isEqual, omit } from "lodash";
import type { Collection } from "mongodb";
import type { Logger } from "pino";

class CreateOrUpdateTransaction {
  constructor(
    private collection: Collection,
    private logger: Logger,
    private reporterId: number,
  ) {}

  public async run(chat: Record<string, unknown>) {
    return this.createOrUpdate(chat);
  }

  private async createOrUpdate(chat: Record<string, unknown>) {
    const prevResult = await this.getById(chat.id as number);

    if (prevResult == null) {
      return this.insert(chat);
    }

    if (false === isEqual(omit(prevResult, "reporterId"), chat)) {
      return this.updateById(chat.id as number, chat);
    }
  }

  private async getById(id: number) {
    return this.collection.findOne({ id });
  }

  private async insert(chat: Record<string, unknown>) {
    await this.collection.insertOne({ ...chat, reporterId: this.reporterId });
  }

  private async updateById(chatId: number, chat: Record<string, unknown>) {
    await this.collection.updateOne({ id: chatId }, { ...chat, reporterId: this.reporterId })
  }
}

export class ChatRepo {
  constructor(private collection: Collection, private logger: Logger) {}

  public get CreateOrUpdateTransaction() {
    return CreateOrUpdateTransaction.bind(
      null,
      this.collection,
      this.logger,
    ) as new (reporterId: number) => CreateOrUpdateTransaction;
  }
}
