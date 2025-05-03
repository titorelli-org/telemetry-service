import type { ChatMember, Update } from "@grammyjs/types";
import type { Collection } from "mongodb";
import type { Logger } from "pino";

export class MembersRepo {
  constructor(private collection: Collection | null, private logger: Logger) {}

  async upsert({ chat_member }: Update) {
    try {
      if (
        await this.exists(
          chat_member.chat.id,
          chat_member.new_chat_member.user.id,
        )
      ) {
        await this.update(chat_member.chat.id, chat_member.new_chat_member);
      } else {
        await this.create(chat_member.chat.id, chat_member.new_chat_member);
      }
    } catch (error) {
      this.logger.error(error);
    }
  }

  private async exists(tgChatId: number, tgUserId: number) {
    const count = await this.collection.countDocuments({
      tgChatId,
      tgUserId,
    });

    return count > 0;
  }

  private async update(tgChatId: number, newChatMember: ChatMember) {
    await this.collection.updateOne(
      { tgChatId, tgUserId: newChatMember.user.id },
      {
        status: newChatMember.status,
        user: newChatMember.user,
      },
    );
  }

  private async create(tgChatId: number, newChatMember: ChatMember) {
    await this.collection.insertOne({
      tgChatId,
      tgUserId: newChatMember.user.id,
      status: newChatMember.status,
      user: newChatMember.user,
    });
  }
}
