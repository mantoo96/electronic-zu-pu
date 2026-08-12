import { describe, expect, it } from "vitest";
import { resolveKinship, resolveMutualKinship } from "./kinship";
import type { FamilyData, Gender, Person, Relation } from "./types";

const now = "2026-08-11T00:00:00.000Z";
const people: Person[] = [];
const relations: Relation[] = [];

function person(id: string, name: string, gender: Gender, birthDate: string) {
  people.push({ id, name, gender, birthDate, isLiving: true, createdAt: now, updatedAt: now });
}

function parent(fromPersonId: string, toPersonId: string) {
  relations.push({ id: `${fromPersonId}-${toPersonId}`, fromPersonId, toPersonId, type: "parent", createdAt: now });
}

function spouse(fromPersonId: string, toPersonId: string) {
  relations.push({ id: `${fromPersonId}-${toPersonId}`, fromPersonId, toPersonId, type: "spouse", createdAt: now });
}

person("great-grandpa", "陈曾祖", "male", "1915-01-01");
person("grandpa", "陈爷爷", "male", "1940-01-01");
person("grandpa-sister", "陈姑奶", "female", "1942-01-01");
person("grandma", "陈奶奶", "female", "1943-01-01");
person("dad", "陈爸爸", "male", "1965-01-01");
person("aunt", "陈姑姑", "female", "1967-01-01");
person("uncle", "陈叔叔", "male", "1970-01-01");
person("maternal-grandpa", "林外公", "male", "1938-01-01");
person("mom", "林妈妈", "female", "1966-01-01");
person("maternal-uncle", "林舅舅", "male", "1960-01-01");
person("ego", "陈小明", "male", "1992-01-01");
person("sister", "陈姐姐", "female", "1989-01-01");
person("nephew", "林外甥", "male", "2012-01-01");
person("cousin", "陈堂弟", "male", "1995-01-01");
person("cousin-child", "陈堂侄", "male", "2020-01-01");
person("ego-spouse", "赵爱人", "female", "1993-01-01");
person("stranger", "路人", "unknown", "1990-01-01");

parent("great-grandpa", "grandpa");
parent("great-grandpa", "grandpa-sister");
parent("grandpa", "dad");
parent("grandma", "dad");
parent("grandpa", "aunt");
parent("grandpa", "uncle");
parent("maternal-grandpa", "mom");
parent("maternal-grandpa", "maternal-uncle");
parent("dad", "ego");
parent("mom", "ego");
parent("dad", "sister");
parent("mom", "sister");
parent("sister", "nephew");
parent("uncle", "cousin");
parent("cousin", "cousin-child");
spouse("ego", "ego-spouse");

function family(kinshipOverrides: Record<string, string> = {}): FamilyData {
  return {
    surname: "陈",
    familyName: "测试族谱",
    brandMark: "陈",
    subtitle: "",
    description: "",
    kinshipOverrides,
    people,
    relations,
    updatedAt: now
  };
}

describe("kinship resolver", () => {
  it("resolves mutual uncle and nephew terms using shared-parent paths", () => {
    const result = resolveMutualKinship(family(), "ego", "maternal-uncle");
    expect(result.firstToSecond.standardTerm).toBe("舅舅");
    expect(result.secondToFirst.standardTerm).toBe("外甥");
    expect(result.lineageTrace?.commonAncestor.name).toBe("林外公");
    expect(result.lineageTrace?.firstBranch.steps.map((step) => step.name)).toEqual(["林妈妈", "陈小明"]);
    expect(result.lineageTrace?.firstBranch.steps.map((step) => step.relation)).toEqual(["女儿", "外孙"]);
    expect(result.lineageTrace?.secondBranch.steps.map((step) => step.name)).toEqual(["林舅舅"]);
  });

  it("resolves paternal aunts, younger uncles and cousins without sibling edges", () => {
    expect(resolveKinship(family(), "ego", "aunt").standardTerm).toBe("姑姑");
    expect(resolveKinship(family(), "ego", "uncle").standardTerm).toBe("叔叔");
    expect(resolveKinship(family(), "ego", "cousin").standardTerm).toBe("堂弟");
    expect(resolveKinship(family(), "ego", "sister").standardTerm).toBe("姐姐");
  });

  it("resolves a grandparent's sibling and applies a regional override", () => {
    const result = resolveKinship(family({ paternal_grandfather_sister: "姑姑" }), "ego", "grandpa-sister");
    expect(result.standardTerm).toBe("姑祖母");
    expect(result.term).toBe("姑姑");
    expect(result.isCustom).toBe(true);
    expect(result.chain.at(-1)?.name).toBe("陈姑奶");
  });

  it("returns a useful empty result for disconnected members", () => {
    const result = resolveKinship(family(), "ego", "stranger");
    expect(result.connected).toBe(false);
    expect(result.term).toBe("暂未找到关系");
    expect(result.note).toContain("补充");
  });

  it("traces both family branches only as far as their nearest common ancestor", () => {
    const result = resolveMutualKinship(family(), "ego", "cousin");
    expect(result.lineageTrace?.commonAncestor.name).toBe("陈爷爷");
    expect(result.lineageTrace?.firstBranch.steps.map((step) => step.name)).toEqual(["陈爸爸", "陈小明"]);
    expect(result.lineageTrace?.firstBranch.steps.map((step) => step.relation)).toEqual(["儿子", "孙子"]);
    expect(result.lineageTrace?.secondBranch.steps.map((step) => step.name)).toEqual(["陈叔叔", "陈堂弟"]);
    expect(result.lineageTrace?.firstBranch.steps[0]?.personId).not.toBe(result.lineageTrace?.commonAncestor.personId);
    expect(result.lineageTrace?.secondBranch.steps[0]?.personId).not.toBe(result.lineageTrace?.commonAncestor.personId);
  });

  it("uses regional terms in lineage traces when they are configured", () => {
    const result = resolveMutualKinship(family({ son: "娃儿", grandson: "孙儿" }), "ego", "cousin");
    expect(result.lineageTrace?.firstBranch.steps.map((step) => step.relation)).toEqual(["娃儿", "孙儿"]);
  });

  it("collapses an ancestor and descendant comparison into one direct lineage", () => {
    const result = resolveMutualKinship(family(), "grandma", "ego");
    expect(result.lineageTrace?.commonAncestor.name).toBe("陈奶奶");
    expect(result.lineageTrace?.firstBranch.steps).toEqual([]);
    expect(result.lineageTrace?.secondBranch.steps.map((step) => [step.relation, step.name])).toEqual([
      ["儿子", "陈爸爸"],
      ["孙子", "陈小明"]
    ]);
  });

  it("describes a grandson's partner with the softer partner wording", () => {
    expect(resolveKinship(family(), "grandpa", "ego-spouse").standardTerm).toBe("孙子的对象");
  });

  it("resolves extended in-laws through their partner and traces them into the family line", () => {
    const result = resolveMutualKinship(family(), "ego-spouse", "cousin-child");
    expect(result.firstToSecond.standardTerm).toBe("堂侄子");
    expect(result.secondToFirst.standardTerm).toBe("堂伯母");
    expect(result.lineageTrace?.commonAncestor.name).toBe("陈爷爷");
    expect(result.lineageTrace?.firstBranch.steps.at(-1)).toMatchObject({ name: "赵爱人", relation: "孙子的对象" });
    expect(result.lineageTrace?.secondBranch.steps.at(-1)?.name).toBe("陈堂侄");
  });

  it("preserves a custom guardian term and keeps the reverse direction standard", () => {
    const data = family();
    data.relations = [...data.relations, {
      id: "guardian-ego-stranger",
      fromPersonId: "ego",
      toPersonId: "stranger",
      type: "guardian",
      label: "Godfather",
      createdAt: now
    }];

    const guardian = resolveKinship(data, "stranger", "ego");
    expect(guardian).toMatchObject({ term: "Godfather", standardTerm: "监护人", canonicalKey: "guardian", isCustom: true });
    expect(guardian.chain[0]).toMatchObject({ relation: "Godfather", canonicalKey: "guardian", isCustom: true });

    const ward = resolveKinship(data, "ego", "stranger");
    expect(ward).toMatchObject({ term: "被监护人", canonicalKey: "ward", isCustom: false });
  });
});
