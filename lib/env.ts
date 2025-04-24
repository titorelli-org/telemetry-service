import { cleanEnv, host, port, url } from "envalid";

export const env = cleanEnv(process.env, {
  PORT: port({ default: 3000 }),
  HOST: host({ default: "0.0.0.0" }),
  MONGO_URL: url({ default: "mongodb://localhost:27017/" }),
});
