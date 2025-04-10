import fastify from "fastify";
import { env, logger, UpdateRepo } from "./lib";
import { MongoClient } from "mongodb";

const mongoClient = new MongoClient(env.MONGO_URL);
const repo = new UpdateRepo(mongoClient, "titorelli", "updates", logger);
const server = fastify({ loggerInstance: logger });

server.post<{
  Body: Record<string, unknown>;
}>("/update", async ({ body }) => {
  await repo.insert(body);
});

server.listen({
  port: env.PORT,
  host: env.HOST ?? "0.0.0.0",
});

mongoClient.connect();
