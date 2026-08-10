export type Gender = "male" | "female" | "other" | "unknown";
export type RelationType = "parent" | "spouse" | "sibling" | "adoptive_parent" | "guardian" | "other";

export interface Person {
  id: string;
  name: string;
  gender: Gender;
  birthDate?: string;
  deathDate?: string;
  isLiving: boolean;
  avatar?: string;
  phone?: string;
  location?: string;
  occupation?: string;
  generation?: number;
  biography?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PersonInput extends Omit<Person, "id" | "createdAt" | "updatedAt"> {}

export interface Relation {
  id: string;
  fromPersonId: string;
  toPersonId: string;
  type: RelationType;
  label?: string;
  startDate?: string;
  endDate?: string;
  createdAt: string;
}

export interface RelationInput extends Omit<Relation, "id" | "createdAt"> {}

export interface FamilyData {
  surname: string;
  familyName: string;
  brandMark: string;
  subtitle: string;
  description: string;
  generationPoem?: string;
  people: Person[];
  relations: Relation[];
  updatedAt: string;
}
