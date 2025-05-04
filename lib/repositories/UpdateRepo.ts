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

      await Promise.all([
        this.collection?.insertOne(omit(record, "chat")),
        this.chatRepo.upsert(record.me.id, record.chat),
        record.update.chat_member
          ? this.membersRepo.upsert(record.update)
          : Promise.resolve(),
      ]);

      this.logger.info(record, "Incoming Update");
    } catch (error) {
      this.logger.error(error);
    }
  }
}
