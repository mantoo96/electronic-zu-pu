import type { AuthStatus, FamilyData, Person, PersonInput, Relation, RelationInput } from "./types";

export class ApiError extends Error {
  constructor(message: string, public readonly status: number) {
    super(message);
  }
}

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...options,
    credentials: "same-origin",
    headers: { "Content-Type": "application/json", ...options?.headers }
  });
  if (!response.ok) {
    const body = await response.json().catch(() => ({ message: "请求失败" }));
    throw new ApiError(body.message || "请求失败", response.status);
  }
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

export const api = {
  getAuthStatus: () => request<AuthStatus>("/api/auth/status"),
  login: (password: string) => request<AuthStatus>("/api/auth/login", { method: "POST", body: JSON.stringify({ password }) }),
  logout: () => request<AuthStatus>("/api/auth/logout", { method: "POST" }),
  getFamily: () => request<FamilyData>("/api/family"),
  updateFamily: (input: Pick<FamilyData, "surname" | "familyName" | "brandMark" | "subtitle" | "description" | "generationPoem" | "kinshipOverrides">) =>
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
