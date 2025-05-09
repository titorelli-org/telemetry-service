import type { Logger } from "pino";
import type { UpdateRepo } from "../repositories";
import type { ChatRepo } from "../repositories/ChatRepo";
import type { MembersRepo } from "../repositories/MembersRepo";
import type { Wal } from "../wal";
import type {
  Update,
  ChatFullInfo,
  ChatMember,
  UserFromGetMe,
} from "@grammyjs/types";

export class TelemetryService {
  private readonly wal: Wal;
  private readonly updateRepo: UpdateRepo;
  private readonly chatRepo: ChatRepo;
  private readonly membersRepo: MembersRepo;
  private readonly logger: Logger;

  constructor({
    wal,
    updateRepo,
    chatRepo,
    membersRepo,
    logger,
  }: {
    wal: Wal;
    updateRepo: UpdateRepo;
    chatRepo: ChatRepo;
    membersRepo: MembersRepo;
    logger: Logger;
  }) {
    this.wal = wal;
    this.updateRepo = updateRepo;
    this.chatRepo = chatRepo;
    this.membersRepo = membersRepo;
    this.logger = logger;
  }

  public async update<
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
        this.updateRepo.insert(record),
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
