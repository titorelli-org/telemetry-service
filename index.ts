import { Service, UpdateRepo, Wal, env, logger } from "./lib";
import { MongoClient } from "mongodb";
import { ChatRepo } from "./lib/repositories/ChatRepo";
import { MembersRepo } from "./lib/repositories/MembersRepo";

const main = async () => {
  const mongoClient = await MongoClient.connect(env.MONGO_URL);
  const updateRepo = new UpdateRepo(
    new Wal("titorelli", "updates", logger),
    mongoClient.db("titorelli").collection("updates"),
    new ChatRepo(mongoClient.db("titorelli").collection("chats"), logger),
    new MembersRepo(mongoClient.db("titorelli").collection("members"), logger),
    logger,
  );

  new Service({
    port: env.PORT,
    host: env.HOST,
    updates: updateRepo,
    logger: logger,
  }).listen();
};

main();
