import type { Gender, RelationType } from "./types";

export const genderLabels: Record<Gender, string> = {
  male: "男",
  female: "女",
  other: "其他",
  unknown: "未填写"
};

export const relationLabels: Record<RelationType, string> = {
  parent: "父母 → 子女",
  spouse: "配偶",
  sibling: "兄弟姐妹",
  adoptive_parent: "养父母 → 养子女",
  guardian: "监护人 → 被监护人",
  other: "其他关系"
};

export function nameAvatarText(name: string) {
  return Array.from(name.trim()).at(-1) || "人";
}
