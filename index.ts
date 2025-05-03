import fastify from "fastify";
import { UpdateRepo, Wal, env, logger } from "./lib";
import { MongoClient } from "mongodb";
import { ChatRepo } from "./lib/repositories/ChatRepo";
import { MembersRepo } from "./lib/repositories/MembersRepo";
import type {
  ChatFullInfo,
  ChatMember,
  Update,
  UserFromGetMe,
} from "@grammyjs/types";

export * from "./lib";

export const createServer = async () => {
  const mongoClient = await MongoClient.connect(env.MONGO_URL);
  const updateRepo = new UpdateRepo(
    new Wal("titorelli", "updates", logger),
    mongoClient.db("titorelli").collection("updates"),
    new ChatRepo(mongoClient.db("titorelli").collection("chats"), logger),
    new MembersRepo(mongoClient.db("titorelli").collection("members"), logger),
    logger,
  );
  const server = fastify({ loggerInstance: logger, trustProxy: true });

  server.post<{
    Body: {
      update: Update;
      chat: ChatFullInfo;
      author: ChatMember;
      me: UserFromGetMe;
    };
  }>("/update", async ({ body }) => {
    await updateRepo.insert(body);
  });

  return server;
};
