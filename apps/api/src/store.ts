import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import type { FamilyDatabase } from "./types.js";

const emptyDatabase = (): FamilyDatabase => ({
  surname: "",
  familyName: "我的家族",
  brandMark: "枝",
  subtitle: "电子族谱 · 枝脉相承",
  description: "记录家族成员与亲属关系",
  generationPoem: undefined,
  kinshipOverrides: {},
  people: [],
  relations: [],
  updatedAt: new Date().toISOString()
});

export class JsonStore {
  private queue = Promise.resolve();

  constructor(private readonly filePath: string) {}

  async read(): Promise<FamilyDatabase> {
    await this.ensureFile();
    const parsed = JSON.parse(await readFile(this.filePath, "utf8")) as Partial<FamilyDatabase>;
    return {
      ...emptyDatabase(),
      ...parsed,
      kinshipOverrides: parsed.kinshipOverrides ?? {},
      people: parsed.people ?? [],
      relations: parsed.relations ?? []
    };
  }

  async write(data: FamilyDatabase): Promise<void> {
    const operation = async () => {
      await mkdir(path.dirname(this.filePath), { recursive: true });
      const tempPath = `${this.filePath}.tmp`;
      await writeFile(tempPath, `${JSON.stringify(data, null, 2)}\n`, "utf8");
      await rename(tempPath, this.filePath);
    };
    this.queue = this.queue.then(operation, operation);
    await this.queue;
  }

  async update(mutator: (data: FamilyDatabase) => FamilyDatabase | void): Promise<FamilyDatabase> {
    let result!: FamilyDatabase;
    const operation = async () => {
      const data = await this.read();
      result = mutator(data) ?? data;
      result.updatedAt = new Date().toISOString();
      await mkdir(path.dirname(this.filePath), { recursive: true });
      const tempPath = `${this.filePath}.tmp`;
      await writeFile(tempPath, `${JSON.stringify(result, null, 2)}\n`, "utf8");
      await rename(tempPath, this.filePath);
    };
    this.queue = this.queue.then(operation, operation);
    await this.queue;
    return result;
  }

  private async ensureFile(): Promise<void> {
    try {
      await readFile(this.filePath, "utf8");
    } catch {
      await mkdir(path.dirname(this.filePath), { recursive: true });
      try {
        await writeFile(this.filePath, `${JSON.stringify(emptyDatabase(), null, 2)}\n`, { encoding: "utf8", flag: "wx" });
      } catch (error) {
        const code = (error as NodeJS.ErrnoException).code;
        if (code !== "EEXIST") throw error;
      }
    }
  }
}
