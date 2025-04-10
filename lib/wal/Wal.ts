import path from "node:path";
import { appendFile } from "node:fs/promises";
import { createWriteStream, WriteStream } from "node:fs";
import { mkdirpSync } from "mkdirp";

interface CacheRecord {
  stream: WriteStream;
  timer: NodeJS.Timeout;
}

export class Wal {
  private fileTemplate: string;
  private streamCache = new Map<string, CacheRecord>();
  private streamTimeout = 10_8000 * 1000; /* 3 hours */

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

      this.getWriteStream().write(`${dataStr}\n`);
    } catch (error) {
      this.logger.error(error);
    }
  }

  private getWriteStream() {
    const filename = this.getFilename();

    if (this.streamCache.has(filename)) {
      const { stream, timer } = this.streamCache.get(filename);

      clearTimeout(timer);

      this.streamCache.set(filename, {
        stream,
        timer: setTimeout(
          this.closeStreamByFilename,
          this.streamTimeout,
          filename,
        ),
      });

      return stream;
    }

    const stream = createWriteStream(filename, {
      encoding: "utf-8",
      flush: true,
    });

    this.streamCache.set(filename, {
      stream,
      timer: setTimeout(
        this.closeStreamByFilename,
        this.streamTimeout,
        filename,
      ),
    });

    return stream;
  }

  private getFilename() {
    const now = new Date();

    return this.fileTemplate.replace("{year}", String(now.getFullYear()));
  }

  private closeStreamByFilename(filename: string) {
    if (this.streamCache.has(filename)) {
      const { stream, timer } = this.streamCache.get(filename);

      clearTimeout(timer);

      stream.close();

      this.streamCache.delete(filename);
    }
  }
}
