import type { Gender, RelationType } from "./types";
import type { Translate } from "./i18n";

export const genderLabels: Record<Gender, string> = {
  male: "男",
  female: "女",
  other: "其他",
  unknown: "未填写"
};

export const relationLabels: Record<RelationType, string> = {
  parent: "父母 → 子女",
  spouse: "对象",
  sibling: "兄弟姐妹",
  adoptive_parent: "养父母 → 养子女",
  guardian: "监护人 → 被监护人",
  other: "其他关系"
};

export function getGenderLabels(t: Translate): Record<Gender, string> {
  return {
    male: t("genderMale"),
    female: t("genderFemale"),
    other: t("genderOther"),
    unknown: t("genderUnknown")
  };
}

export function getRelationLabels(t: Translate): Record<RelationType, string> {
  return {
    parent: t("relationParent"),
    spouse: t("relationSpouse"),
    sibling: t("relationSibling"),
    adoptive_parent: t("relationAdoptiveParent"),
    guardian: t("relationGuardian"),
    other: t("relationOther")
  };
}

export function nameAvatarText(name: string) {
  return Array.from(name.trim()).at(-1) || "人";
}
