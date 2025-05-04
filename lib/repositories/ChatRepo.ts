import { isEqual, omit } from "lodash";
import type { Collection } from "mongodb";
import type { Logger } from "pino";
import type { ChatFullInfo } from "@grammyjs/types";

export class ChatRepo {
  constructor(private collection: Collection, private logger: Logger) {}

  public async upsert(reporterId: number, chat: ChatFullInfo) {
    const prevResult = await this.getById(chat.id as number);

    if (prevResult == null) {
      return this.insert(reporterId, chat);
    }

    if (false === isEqual(omit(prevResult, "reporterId"), chat)) {
      return this.updateById(reporterId, chat.id, chat);
    }
  }

  private async getById(id: number) {
    return this.collection.findOne({ id });
  }

  private async insert(reporterId: number, chat: ChatFullInfo) {
    await this.collection.insertOne({ ...chat, reporterId });
  }

  private async updateById(
    reporterId: number,
    chatId: number,
    chat: ChatFullInfo,
  ) {
    await this.collection.updateOne(
      { id: chatId },
      { $set: { ...chat, reporterId } },
    );
  }
}
