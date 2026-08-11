import type { FamilyData } from "./types";

export interface LineageView {
  data: FamilyData;
  hiddenPersonIds: Set<string>;
  spouseRelationCount: number;
}

function belongsToFamily(name: string, surname: string) {
  return Boolean(surname) && name.trim().startsWith(surname);
}

export function createLineageView(data: FamilyData): LineageView {
  const surname = data.surname.trim();
  const peopleById = new Map(data.people.map((person) => [person.id, person]));
  const hiddenPersonIds = new Set<string>();
  const spouseRelations = data.relations.filter((relation) => relation.type === "spouse");

  spouseRelations.forEach((relation) => {
    const from = peopleById.get(relation.fromPersonId);
    const to = peopleById.get(relation.toPersonId);
    if (!from || !to) return;
    const fromBelongs = belongsToFamily(from.name, surname);
    const toBelongs = belongsToFamily(to.name, surname);

    if (fromBelongs !== toBelongs) {
      hiddenPersonIds.add(fromBelongs ? to.id : from.id);
      return;
    }

    // 同姓配偶无法仅凭现有资料可靠区分，避免误隐藏本家成员；
    // 没有姓氏线索时则沿用关系录入顺序，将“成员二”视作配偶。
    if (!fromBelongs && !toBelongs) hiddenPersonIds.add(to.id);
  });

  return {
    data: {
      ...data,
      people: data.people.filter((person) => !hiddenPersonIds.has(person.id)),
      relations: data.relations.filter((relation) =>
        relation.type !== "spouse"
        && !hiddenPersonIds.has(relation.fromPersonId)
        && !hiddenPersonIds.has(relation.toPersonId)
      )
    },
    hiddenPersonIds,
    spouseRelationCount: spouseRelations.length
  };
}
