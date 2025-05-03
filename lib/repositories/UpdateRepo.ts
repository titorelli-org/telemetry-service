import { omit } from "lodash";
import type { Collection } from "mongodb";
import type { Logger } from "pino";
import type {
  ChatFullInfo,
  ChatMember,
  Update,
  UserFromGetMe,
} from "@grammyjs/types";
import type { ChatRepo } from "./ChatRepo";
import type { MembersRepo } from "./MembersRepo";
import type { Wal } from "../wal";

export class UpdateRepo {
  constructor(
    private wal: Wal | null,
    private collection: Collection | null,
    private chatRepo: ChatRepo,
    private membersRepo: MembersRepo,
    private logger: Logger,
  ) {}

  async insert<
    R extends {
      update: Update;
      chat: ChatFullInfo;
      author: ChatMember;
      me: UserFromGetMe;
    },
  >(record: R) {
    try {
      await this.wal?.insert(record);

      await this.collection?.insertOne(omit(record, "chat"));

      await new this.chatRepo.CreateOrUpdateTransaction(record.me.id).run(
        record.chat,
      );

      if (record.update.chat_member) {
        await this.membersRepo.upsert(record.update);
      }

      this.logger.info(record, "Incoming Update");
    } catch (error) {
      this.logger.error(error);
    }
  }
}
