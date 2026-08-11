import { describe, expect, it } from "vitest";
import { layoutGraph } from "./FamilyGraph";
import type { FamilyData, Gender, Person, Relation, RelationType } from "./types";

const now = "2026-08-11T00:00:00.000Z";
const person = (id: string, name: string, gender: Gender, generation: number): Person => ({
  id, name, gender, generation, isLiving: true, createdAt: now, updatedAt: now
});
const relation = (id: string, fromPersonId: string, toPersonId: string, type: RelationType): Relation => ({
  id, fromPersonId, toPersonId, type, createdAt: now
});

describe("family graph layout", () => {
  it("connects generations through each couple's center junction", () => {
    const data: FamilyData = {
      surname: "陈",
      familyName: "测试族谱",
      brandMark: "陈",
      subtitle: "",
      description: "",
      kinshipOverrides: {},
      updatedAt: now,
      people: [
        person("grandpa", "陈爷爷", "male", 1),
        person("grandma", "李奶奶", "female", 1),
        person("father", "陈爸爸", "male", 2),
        person("mother", "王妈妈", "female", 2),
        person("child", "陈孩子", "male", 3)
      ],
      relations: [
        relation("grandparents", "grandpa", "grandma", "spouse"),
        relation("parents", "father", "mother", "spouse"),
        relation("grandpa-father", "grandpa", "father", "parent"),
        relation("grandma-father", "grandma", "father", "parent"),
        relation("father-child", "father", "child", "parent"),
        relation("mother-child", "mother", "child", "parent")
      ]
    };

    const layout = layoutGraph(data);
    const generationEdge = layout.edges.find((edge) => edge.id === "family-child-unit-grandpa-father");
    expect(generationEdge?.target).toBe("junction-unit-father");
    expect(generationEdge?.targetHandle).toBe("parents-in");

    const nextGenerationEdge = layout.edges.find((edge) => edge.id === "family-child-unit-father-child");
    expect(nextGenerationEdge?.target).toBe("child");
    expect(nextGenerationEdge?.targetHandle).toBe("parent-top");
  });
});
