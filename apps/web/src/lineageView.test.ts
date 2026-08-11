import { describe, expect, it } from "vitest";
import { createLineageView } from "./lineageView";
import type { FamilyData, Person, Relation } from "./types";

const now = "2026-08-11T00:00:00.000Z";
const person = (id: string, name: string): Person => ({ id, name, gender: "unknown", isLiving: true, createdAt: now, updatedAt: now });
const relation = (id: string, fromPersonId: string, toPersonId: string, type: Relation["type"]): Relation => ({ id, fromPersonId, toPersonId, type, createdAt: now });

function family(people: Person[], relations: Relation[], surname = "陈"): FamilyData {
  return { surname, familyName: "陈氏族谱", brandMark: "陈", subtitle: "", description: "", kinshipOverrides: {}, people, relations, updatedAt: now };
}

describe("lineage-only view", () => {
  it("hides an external-surname spouse but keeps the direct child and lineage edge", () => {
    const data = family(
      [person("father", "陈国安"), person("mother", "李慧芳"), person("child", "陈小明")],
      [
        relation("spouse", "father", "mother", "spouse"),
        relation("father-child", "father", "child", "parent"),
        relation("mother-child", "mother", "child", "parent")
      ]
    );
    const view = createLineageView(data);
    expect(view.data.people.map((item) => item.id)).toEqual(["father", "child"]);
    expect(view.data.relations.map((item) => item.id)).toEqual(["father-child"]);
    expect(view.hiddenPersonIds.has("mother")).toBe(true);
  });

  it("uses the family surname regardless of spouse relation direction", () => {
    const data = family(
      [person("husband", "王海"), person("wife", "陈晓雨")],
      [relation("spouse", "husband", "wife", "spouse")]
    );
    const view = createLineageView(data);
    expect(view.data.people.map((item) => item.id)).toEqual(["wife"]);
  });

  it("keeps same-surname spouses to avoid hiding a direct member by mistake", () => {
    const data = family(
      [person("first", "陈甲"), person("second", "陈乙")],
      [relation("spouse", "first", "second", "spouse")]
    );
    const view = createLineageView(data);
    expect(view.data.people).toHaveLength(2);
    expect(view.data.relations).toHaveLength(0);
  });
});
