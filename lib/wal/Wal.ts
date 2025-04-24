import path from "node:path";
import { appendFile } from "node:fs/promises";
import { mkdirpSync } from "mkdirp";

export class Wal {
  private fileTemplate: string;

  constructor(dbName: string, collectionName: string, private logger) {
    this.fileTemplate = path.join(
      process.cwd(),
      `data/{year}-${dbName}-${collectionName}.jsonl`,
    );

    mkdirpSync(path.dirname(this.fileTemplate));
  }

  async insert(data: Record<string, unknown>) {
    try {
      const dataStr = JSON.stringify(data);

      await appendFile(this.filename, dataStr + "\n", {
        flag: "a+",
        encoding: "utf-8",
      });
    } catch (error) {
      this.logger.error(error);
    }
  }

  private get filename() {
    const now = new Date();

    return this.fileTemplate.replace("{year}", String(now.getFullYear()));
  }
}
