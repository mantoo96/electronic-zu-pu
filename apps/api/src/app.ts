import express from "express";
import cors from "cors";
import helmet from "helmet";
import { nanoid } from "nanoid";
import { ZodError } from "zod";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { familyInfoSchema, personInputSchema, relationInputSchema } from "./schemas.js";
import { createAdminAuth, type AdminAuthOptions } from "./auth.js";
import { JsonStore } from "./store.js";
import type { Person, Relation } from "./types.js";

const symmetricRelations = new Set(["spouse", "sibling"]);

export function createApp(store: JsonStore, authOptions: AdminAuthOptions = {}) {
  const app = express();
  const auth = createAdminAuth(authOptions);
  app.set("trust proxy", 1);
  app.use(helmet({ crossOriginResourcePolicy: false }));
  app.use(cors());
  app.use(express.json({ limit: "1mb" }));

  app.get("/api/health", (_req, res) => res.json({ status: "ok" }));

  app.get("/api/auth/status", auth.status);
  app.post("/api/auth/login", auth.login);
  app.post("/api/auth/logout", auth.logout);

  app.get("/api/family", async (_req, res, next) => {
    try { res.json(await store.read()); } catch (error) { next(error); }
  });

  app.use("/api", auth.requireAdmin);

  app.patch("/api/family", async (req, res, next) => {
    try {
      const input = familyInfoSchema.parse(req.body);
      const data = await store.update((database) => Object.assign(database, input));
      res.json(data);
    } catch (error) { next(error); }
  });

  app.post("/api/people", async (req, res, next) => {
    try {
      const input = personInputSchema.parse(req.body);
      const now = new Date().toISOString();
      const person: Person = { ...input, id: nanoid(), createdAt: now, updatedAt: now };
      await store.update((database) => { database.people.push(person); });
      res.status(201).json(person);
    } catch (error) { next(error); }
  });

  app.put("/api/people/:id", async (req, res, next) => {
    try {
      const input = personInputSchema.parse(req.body);
      let updated: Person | undefined;
      await store.update((database) => {
        const index = database.people.findIndex((person) => person.id === req.params.id);
        if (index < 0) return;
        updated = { ...database.people[index], ...input, updatedAt: new Date().toISOString() };
        database.people[index] = updated;
      });
      if (!updated) return res.status(404).json({ message: "成员不存在" });
      res.json(updated);
    } catch (error) { next(error); }
  });

  app.delete("/api/people/:id", async (req, res, next) => {
    try {
      let found = false;
      await store.update((database) => {
        found = database.people.some((person) => person.id === req.params.id);
        database.people = database.people.filter((person) => person.id !== req.params.id);
        database.relations = database.relations.filter(
          (relation) => relation.fromPersonId !== req.params.id && relation.toPersonId !== req.params.id
        );
      });
      if (!found) return res.status(404).json({ message: "成员不存在" });
      res.status(204).send();
    } catch (error) { next(error); }
  });

  app.post("/api/relations", async (req, res, next) => {
    try {
      const input = relationInputSchema.parse(req.body);
      let relation!: Relation;
      let validationError = "";
      await store.update((database) => {
        const ids = new Set(database.people.map((person) => person.id));
        if (!ids.has(input.fromPersonId) || !ids.has(input.toPersonId)) {
          validationError = "关系中的成员不存在";
          return;
        }
        const duplicate = database.relations.some((item) => {
          const sameDirection = item.fromPersonId === input.fromPersonId && item.toPersonId === input.toPersonId;
          const reverseDirection = symmetricRelations.has(input.type)
            && item.fromPersonId === input.toPersonId && item.toPersonId === input.fromPersonId;
          return item.type === input.type && (sameDirection || reverseDirection);
        });
        if (duplicate) {
          validationError = "该关系已经存在";
          return;
        }
        relation = { ...input, id: nanoid(), createdAt: new Date().toISOString() };
        database.relations.push(relation);
      });
      if (validationError) return res.status(400).json({ message: validationError });
      res.status(201).json(relation);
    } catch (error) { next(error); }
  });

  app.delete("/api/relations/:id", async (req, res, next) => {
    try {
      let found = false;
      await store.update((database) => {
        found = database.relations.some((relation) => relation.id === req.params.id);
        database.relations = database.relations.filter((relation) => relation.id !== req.params.id);
      });
      if (!found) return res.status(404).json({ message: "关系不存在" });
      res.status(204).send();
    } catch (error) { next(error); }
  });

  app.post("/api/import", async (req, res, next) => {
    try {
      const body = req.body;
      if (!body || !Array.isArray(body.people) || !Array.isArray(body.relations)) {
        return res.status(400).json({ message: "导入文件格式不正确" });
      }
      await store.write({
        surname: String(body.surname || ""),
        familyName: String(body.familyName || "我的家族"),
        brandMark: String(body.brandMark || "枝").slice(0, 2),
        subtitle: String(body.subtitle || "电子族谱 · 枝脉相承"),
        description: String(body.description || ""),
        generationPoem: String(body.generationPoem || ""),
        kinshipOverrides: body.kinshipOverrides && typeof body.kinshipOverrides === "object" && !Array.isArray(body.kinshipOverrides)
          ? Object.fromEntries(Object.entries(body.kinshipOverrides).map(([key, value]) => [String(key).slice(0, 100), String(value).slice(0, 40)]))
          : {},
        people: body.people,
        relations: body.relations,
        updatedAt: new Date().toISOString()
      });
      res.json(await store.read());
    } catch (error) { next(error); }
  });

  const currentDir = path.dirname(fileURLToPath(import.meta.url));
  const webDist = path.resolve(currentDir, "../../web/dist");
  app.use(express.static(webDist));
  app.get("*path", (_req, res, next) => {
    res.sendFile(path.join(webDist, "index.html"), (error) => error ? next() : undefined);
  });

  app.use((error: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    if (error instanceof ZodError) {
      return res.status(400).json({ message: error.issues[0]?.message ?? "输入内容有误", issues: error.issues });
    }
    console.error(error);
    res.status(500).json({ message: "服务器内部错误" });
  });

  return app;
}
