import type { FamilyData, Person, PersonInput, Relation, RelationInput } from "./types";

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...options,
    headers: { "Content-Type": "application/json", ...options?.headers }
  });
  if (!response.ok) {
    const body = await response.json().catch(() => ({ message: "请求失败" }));
    throw new Error(body.message || "请求失败");
  }
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

export const api = {
  getFamily: () => request<FamilyData>("/api/family"),
  updateFamily: (input: Pick<FamilyData, "surname" | "familyName" | "brandMark" | "subtitle" | "description" | "generationPoem">) =>
    request<FamilyData>("/api/family", { method: "PATCH", body: JSON.stringify(input) }),
  createPerson: (input: PersonInput) =>
    request<Person>("/api/people", { method: "POST", body: JSON.stringify(input) }),
  updatePerson: (id: string, input: PersonInput) =>
    request<Person>(`/api/people/${id}`, { method: "PUT", body: JSON.stringify(input) }),
  deletePerson: (id: string) => request<void>(`/api/people/${id}`, { method: "DELETE" }),
  createRelation: (input: RelationInput) =>
    request<Relation>("/api/relations", { method: "POST", body: JSON.stringify(input) }),
  deleteRelation: (id: string) => request<void>(`/api/relations/${id}`, { method: "DELETE" }),
  importFamily: (data: FamilyData) =>
    request<FamilyData>("/api/import", { method: "POST", body: JSON.stringify(data) })
};
