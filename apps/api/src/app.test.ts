import { afterEach, describe, expect, it } from "vitest";
import request from "supertest";
import { mkdtemp, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { createApp } from "./app.js";
import { JsonStore } from "./store.js";

const directories: string[] = [];
const adminPassword = "test-admin-password";

async function testApp(configured = true) {
  const directory = await mkdtemp(path.join(os.tmpdir(), "family-tree-"));
  directories.push(directory);
  return createApp(new JsonStore(path.join(directory, "data.json")), configured ? {
    adminPassword,
    sessionSecret: "test-session-secret-that-is-long-enough"
  } : {});
}

async function loggedInAgent(app: Awaited<ReturnType<typeof testApp>>) {
  const agent = request.agent(app);
  const login = await agent.post("/api/auth/login").send({ password: adminPassword });
  expect(login.status).toBe(200);
  return agent;
}

afterEach(async () => {
  await Promise.all(directories.splice(0).map((directory) => rm(directory, { recursive: true, force: true })));
});

describe("family tree API", () => {
  it("creates people and relations", async () => {
    const app = await testApp();
    const agent = await loggedInAgent(app);
    const first = await agent.post("/api/people").send({ name: "张三", gender: "male", isLiving: true });
    const second = await agent.post("/api/people").send({ name: "张小明", gender: "male", isLiving: true });
    expect(first.status).toBe(201);
    expect(second.status).toBe(201);

    const relation = await agent.post("/api/relations").send({
      fromPersonId: first.body.id,
      toPersonId: second.body.id,
      type: "parent"
    });
    expect(relation.status).toBe(201);

    const family = await request(app).get("/api/family");
    expect(family.body.people).toHaveLength(2);
    expect(family.body.relations).toHaveLength(1);
  });

  it("removes a person's connected relations", async () => {
    const app = await testApp();
    const agent = await loggedInAgent(app);
    const first = await agent.post("/api/people").send({ name: "甲", gender: "unknown", isLiving: true });
    const second = await agent.post("/api/people").send({ name: "乙", gender: "unknown", isLiving: true });
    await agent.post("/api/relations").send({
      fromPersonId: first.body.id,
      toPersonId: second.body.id,
      type: "spouse"
    });
    await agent.delete(`/api/people/${first.body.id}`);
    const family = await request(app).get("/api/family");
    expect(family.body.people).toHaveLength(1);
    expect(family.body.relations).toHaveLength(0);
  });

  it("persists regional kinship terms and keeps them during import", async () => {
    const app = await testApp();
    const agent = await loggedInAgent(app);
    const settings = await agent.patch("/api/family").send({
      surname: "陈",
      familyName: "陈氏族谱",
      brandMark: "陈",
      subtitle: "电子族谱",
      description: "",
      generationPoem: "源远流长",
      kinshipOverrides: { paternal_aunt: "嬢嬢", paternal_younger_uncle: "满满" }
    });
    expect(settings.status).toBe(200);
    expect(settings.body.kinshipOverrides.paternal_aunt).toBe("嬢嬢");

    const imported = await agent.post("/api/import").send({ ...settings.body, people: [], relations: [] });
    expect(imported.status).toBe(200);
    expect(imported.body.generationPoem).toBe("源远流长");
    expect(imported.body.kinshipOverrides.paternal_younger_uncle).toBe("满满");
  });

  it("allows viewing but rejects mutations until an administrator logs in", async () => {
    const app = await testApp();
    expect((await request(app).get("/api/family")).status).toBe(200);
    expect((await request(app).post("/api/people").send({ name: "访客修改", gender: "unknown", isLiving: true })).status).toBe(401);
    expect((await request(app).post("/api/auth/login").send({ password: "wrong-password" })).status).toBe(401);

    const agent = await loggedInAgent(app);
    expect((await agent.get("/api/auth/status")).body.isAdmin).toBe(true);
    expect((await agent.post("/api/people").send({ name: "管理员修改", gender: "unknown", isLiving: true })).status).toBe(201);
    expect((await agent.post("/api/auth/logout")).body.isAdmin).toBe(false);
    expect((await agent.delete("/api/people/not-found")).status).toBe(401);
  });

  it("stays safely read-only when no administrator password is configured", async () => {
    const app = await testApp(false);
    const status = await request(app).get("/api/auth/status");
    expect(status.body).toEqual({ configured: false, isAdmin: false });
    expect((await request(app).post("/api/auth/login").send({ password: "anything" })).status).toBe(503);
    expect((await request(app).patch("/api/family").send({})).status).toBe(503);
  });
});
