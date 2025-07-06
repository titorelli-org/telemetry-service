import path from "node:path";
import { MongoClient } from "mongodb";
import {
  Service,
  UpdateRepo,
  ChatRepo,
  MembersRepo,
  TelemetryService,
  Wal,
  env,
  logger,
} from "./lib";
import { JwksStore } from "@titorelli-org/jwks-store";

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
    jwksStore: new JwksStore(path.join(__dirname, "data/jwks.json")),
    logger: logger,
  }).listen();
};

main();
