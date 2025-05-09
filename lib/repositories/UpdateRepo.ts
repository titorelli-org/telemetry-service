import { omit } from "lodash";
import type { Collection } from "mongodb";
import type { Logger } from "pino";
import type {
  ChatFullInfo,
  ChatMember,
  Update,
  UserFromGetMe,
} from "@grammyjs/types";

export class UpdateRepo {
  constructor(private collection: Collection | null, private logger: Logger) {}

  async insert<
    R extends {
      update: Update;
      chat: ChatFullInfo;
      author: ChatMember;
      me: UserFromGetMe;
    },
  >(record: R) {
    try {
      await this.collection?.insertOne(omit(record, "chat"));
    } catch (error) {
      this.logger.error(error);
    }
  }
}
