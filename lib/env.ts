import { cleanEnv, host, port, url, str } from "envalid";

export const env = cleanEnv(process.env, {
  PORT: port({ default: 3000 }),
  HOST: host({ default: "0.0.0.0" }),
  MONGO_URL: url({ default: "mongodb://localhost:27017/" }),
  OO_AUTH_CRED: str(),
  OO_BASE_URL: url(),
});
