import { createServer } from "./index";
import { env } from "./lib";

createServer().then((server) => {
  server.listen({
    port: env.PORT,
    host: env.HOST,
  });
});
