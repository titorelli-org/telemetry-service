import { Service, UpdateRepo, Wal, env, logger } from "./lib";
import { MongoClient } from "mongodb";
import { ChatRepo } from "./lib/repositories/ChatRepo";
import { MembersRepo } from "./lib/repositories/MembersRepo";
import { TelemetryService } from "./lib/telemetry-service";

const main = async () => {
  const mongoClient = await MongoClient.connect(env.MONGO_URL);

  new Service({
    port: env.PORT,
    host: env.HOST,
    telemetry: new TelemetryService({
      wal: new Wal("titorelli", "updates", logger),
      updateRepo: new UpdateRepo(
        mongoClient.db("titorelli").collection("updates"),
        logger,
      ),
      chatRepo: new ChatRepo(
        mongoClient.db("titorelli").collection("chats"),
        logger,
      ),
      membersRepo: new MembersRepo(
        mongoClient.db("titorelli").collection("members"),
        logger,
      ),
      logger,
    }),
    logger: logger,
  }).listen();
};

main();
