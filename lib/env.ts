import { cleanEnv, num, str } from "envalid";

export const env = cleanEnv(process.env, {
  PORT: num({ default: 3000 }),
  HOST: str({ default: "0.0.0.0" }),
  MONGO_URL: str({ default: "mongodb://localhost:27017/" }),
});
