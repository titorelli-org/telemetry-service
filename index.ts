import fastify from "fastify";
import { UpdateRepo, Wal, env, logger } from "./lib";
import { MongoClient } from "mongodb";

export * from "./lib";

export const createServer = async () => {
  const mongoClient = await MongoClient.connect(env.MONGO_URL);
  const updateRepo = new UpdateRepo(
    new Wal("titorelli", "updates", logger),
    mongoClient.db("titorelli").collection("updates"),
    logger,
  );
  const server = fastify({ loggerInstance: logger, trustProxy: true });

  server.post<{ Body: Record<string, unknown> }>(
    "/update",
    async ({ body }) => {
      await updateRepo.insert(body);
    },
  );

  return server;
};
