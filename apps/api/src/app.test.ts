import { afterEach, describe, expect, it } from "vitest";
import request from "supertest";
import { mkdtemp, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { createApp } from "./app.js";
import { JsonStore } from "./store.js";

const directories: string[] = [];

async function testApp() {
  const directory = await mkdtemp(path.join(os.tmpdir(), "family-tree-"));
  directories.push(directory);
  return createApp(new JsonStore(path.join(directory, "data.json")));
}

afterEach(async () => {
  await Promise.all(directories.splice(0).map((directory) => rm(directory, { recursive: true, force: true })));
});

describe("family tree API", () => {
  it("creates people and relations", async () => {
    const app = await testApp();
    const first = await request(app).post("/api/people").send({ name: "张三", gender: "male", isLiving: true });
    const second = await request(app).post("/api/people").send({ name: "张小明", gender: "male", isLiving: true });
    expect(first.status).toBe(201);
    expect(second.status).toBe(201);

    const relation = await request(app).post("/api/relations").send({
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
    const first = await request(app).post("/api/people").send({ name: "甲", gender: "unknown", isLiving: true });
    const second = await request(app).post("/api/people").send({ name: "乙", gender: "unknown", isLiving: true });
    await request(app).post("/api/relations").send({
      fromPersonId: first.body.id,
      toPersonId: second.body.id,
      type: "spouse"
    });
    await request(app).delete(`/api/people/${first.body.id}`);
    const family = await request(app).get("/api/family");
    expect(family.body.people).toHaveLength(1);
    expect(family.body.relations).toHaveLength(0);
  });
});
