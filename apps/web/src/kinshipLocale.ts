import type { Locale, Translate } from "./i18n";
import { toTraditional } from "./i18n";
import { kinshipCatalog, kinshipPresets, type KinshipCatalogItem, type KinshipChainItem, type KinshipResult } from "./kinship";

type CatalogTranslation = [label: string, description: string];

const englishCatalog: Record<string, CatalogTranslation> = {
  father: ["Father", "Male parent"],
  mother: ["Mother", "Female parent"],
  son: ["Son", "Male child"],
  daughter: ["Daughter", "Female child"],
  paternal_grandfather: ["Paternal grandfather", "Father's father"],
  paternal_grandmother: ["Paternal grandmother", "Father's mother"],
  maternal_grandfather: ["Maternal grandfather", "Mother's father"],
  maternal_grandmother: ["Maternal grandmother", "Mother's mother"],
  grandson: ["Grandson", "Son's son"],
  granddaughter: ["Granddaughter", "Son's daughter"],
  maternal_grandson: ["Daughter's son", "Grandson through a daughter"],
  maternal_granddaughter: ["Daughter's daughter", "Granddaughter through a daughter"],
  paternal_older_uncle: ["Older paternal uncle", "Father's older brother"],
  paternal_younger_uncle: ["Younger paternal uncle", "Father's younger brother"],
  paternal_uncle: ["Paternal uncle", "Father's brother; age unknown"],
  paternal_aunt: ["Paternal aunt", "Father's sister"],
  maternal_uncle: ["Maternal uncle", "Mother's brother"],
  maternal_aunt: ["Maternal aunt", "Mother's sister"],
  older_brother: ["Older brother", "Older male sibling"],
  younger_brother: ["Younger brother", "Younger male sibling"],
  older_sister: ["Older sister", "Older female sibling"],
  younger_sister: ["Younger sister", "Younger female sibling"],
  brothers_son: ["Nephew", "Brother's son"],
  brothers_daughter: ["Niece", "Brother's daughter"],
  sisters_son: ["Nephew", "Sister's son"],
  sisters_daughter: ["Niece", "Sister's daughter"],
  tang_older_brother: ["Older paternal cousin", "Older male cousin through the paternal male line"],
  tang_younger_brother: ["Younger paternal cousin", "Younger male cousin through the paternal male line"],
  tang_older_sister: ["Older paternal cousin", "Older female cousin through the paternal male line"],
  tang_younger_sister: ["Younger paternal cousin", "Younger female cousin through the paternal male line"],
  biao_older_brother: ["Older cousin", "Older male cousin outside the paternal male line"],
  biao_younger_brother: ["Younger cousin", "Younger male cousin outside the paternal male line"],
  biao_older_sister: ["Older cousin", "Older female cousin outside the paternal male line"],
  biao_younger_sister: ["Younger cousin", "Younger female cousin outside the paternal male line"],
  paternal_grandfather_older_brother: ["Granduncle", "Paternal grandfather's older brother"],
  paternal_grandfather_younger_brother: ["Granduncle", "Paternal grandfather's younger brother"],
  paternal_grandfather_brother: ["Granduncle", "Paternal grandfather's brother; age unknown"],
  paternal_grandfather_sister: ["Grandaunt", "Paternal grandfather's sister"],
  paternal_grandmother_brother: ["Granduncle", "Paternal grandmother's brother"],
  paternal_grandmother_sister: ["Grandaunt", "Paternal grandmother's sister"],
  maternal_grandfather_brother: ["Granduncle", "Maternal grandfather's brother"],
  maternal_grandfather_sister: ["Grandaunt", "Maternal grandfather's sister"],
  maternal_grandmother_brother: ["Granduncle", "Maternal grandmother's brother"],
  maternal_grandmother_sister: ["Grandaunt", "Maternal grandmother's sister"],
  husband: ["Husband", "Male spouse"],
  wife: ["Wife", "Female spouse"],
  wifes_father: ["Father-in-law", "Wife's father"],
  wifes_mother: ["Mother-in-law", "Wife's mother"],
  husbands_father: ["Father-in-law", "Husband's father"],
  husbands_mother: ["Mother-in-law", "Husband's mother"],
  older_brothers_wife: ["Sister-in-law", "Older brother's wife"],
  younger_brothers_wife: ["Sister-in-law", "Younger brother's wife"],
  older_sisters_husband: ["Brother-in-law", "Older sister's husband"],
  younger_sisters_husband: ["Brother-in-law", "Younger sister's husband"],
  sons_wife: ["Daughter-in-law", "Son's wife"],
  daughters_husband: ["Son-in-law", "Daughter's husband"],
  paternal_older_uncles_wife: ["Aunt", "Older paternal uncle's wife"],
  paternal_younger_uncles_wife: ["Aunt", "Younger paternal uncle's wife"],
  paternal_aunts_husband: ["Uncle", "Paternal aunt's husband"],
  maternal_uncles_wife: ["Aunt", "Maternal uncle's wife"],
  maternal_aunts_husband: ["Uncle", "Maternal aunt's husband"]
};

const extraEnglishTerms: Record<string, string> = {
  self: "Self",
  parent: "Parent",
  child: "Child",
  spouse: "Spouse",
  brother: "Brother",
  sister: "Sister",
  sibling: "Sibling",
  adoptive_father: "Adoptive father",
  adoptive_mother: "Adoptive mother",
  adoptive_parent: "Adoptive parent",
  adoptive_son: "Adopted son",
  adoptive_daughter: "Adopted daughter",
  adoptive_child: "Adopted child",
  guardian: "Guardian",
  ward: "Ward",
  stepdaughter: "Stepdaughter",
  stepson: "Stepson",
  relative_in_law: "Relative by marriage",
  extended_relative: "Extended relative",
  paternal_sibling: "Paternal aunt or uncle",
  maternal_sibling: "Maternal aunt or uncle",
  tang_brother: "Male paternal cousin",
  tang_sister: "Female paternal cousin",
  tang_sibling: "Paternal cousin",
  biao_brother: "Male cousin",
  biao_sister: "Female cousin",
  biao_sibling: "Cousin",
  brothers_wife: "Sister-in-law",
  sisters_husband: "Brother-in-law",
  tang_older_uncles_wife: "Paternal cousin by marriage",
  tang_younger_uncles_wife: "Paternal cousin by marriage",
  tang_uncles_wife: "Paternal cousin by marriage",
  tang_aunts_husband: "Paternal cousin by marriage",
  biao_older_uncles_wife: "Cousin by marriage",
  biao_younger_uncles_wife: "Cousin by marriage",
  biao_uncles_wife: "Cousin by marriage",
  biao_aunts_husband: "Cousin by marriage"
};

const englishTermByKey: Record<string, string> = {
  ...Object.fromEntries(Object.entries(englishCatalog).map(([key, [label]]) => [key, label])),
  ...extraEnglishTerms
};

const chineseToEnglish = new Map<string, string>([
  ...kinshipCatalog.map((item) => [item.label, englishTermByKey[item.key]] as const),
  ["父母", "Parent"], ["子女", "Child"], ["爱人", "Spouse"], ["兄弟", "Brother"], ["姐妹", "Sister"],
  ["兄弟姐妹", "Sibling"], ["养父", "Adoptive father"], ["养母", "Adoptive mother"], ["养父母", "Adoptive parent"],
  ["养子", "Adopted son"], ["养女", "Adopted daughter"], ["养子女", "Adopted child"], ["监护人", "Guardian"],
  ["被监护人", "Ward"], ["自己", "Self"], ["姻亲", "Relative by marriage"], ["远房亲属", "Extended relative"],
  ["成员不存在", "Member not found"], ["暂未找到关系", "No relationship found"], ["自定义关系", "Custom relationship"]
]);

function groupLabel(group: KinshipCatalogItem["group"], t: Translate) {
  if (group === "直系亲属") return t("groupDirect");
  if (group === "父母同辈") return t("groupParentPeers");
  if (group === "同辈与晚辈") return t("groupPeers");
  if (group === "祖辈旁系") return t("groupGrandCollateral");
  return t("groupInLaw");
}

export interface LocalizedKinshipCatalogItem extends Omit<KinshipCatalogItem, "group"> {
  group: string;
}

export function localizedKinshipCatalog(locale: Locale, t: Translate): LocalizedKinshipCatalogItem[] {
  return kinshipCatalog.map((item) => {
    if (locale === "en") {
      const [label, description] = englishCatalog[item.key] || ["Relative", "Family relationship"];
      return { ...item, label, description, group: groupLabel(item.group, t) };
    }
    if (locale === "zh-TW") {
      return { ...item, label: toTraditional(item.label), description: toTraditional(item.description), group: groupLabel(item.group, t) };
    }
    return { ...item, group: groupLabel(item.group, t) };
  });
}

export function localizedKinshipPresets(locale: Locale) {
  if (locale === "en") {
    return [
      { ...kinshipPresets[0], label: "Grandfather's sister → Gugu" },
      { ...kinshipPresets[1], label: "Father's sister → Niangniang" },
      { ...kinshipPresets[2], label: "Father's younger brother → Manman" }
    ];
  }
  if (locale === "zh-TW") return kinshipPresets.map((preset) => ({ ...preset, label: toTraditional(preset.label) }));
  return [...kinshipPresets];
}

function ordinal(value: number) {
  const remainder = value % 100;
  if (remainder >= 11 && remainder <= 13) return `${value}th`;
  if (value % 10 === 1) return `${value}st`;
  if (value % 10 === 2) return `${value}nd`;
  if (value % 10 === 3) return `${value}rd`;
  return `${value}th`;
}

function descendantTerm(depth: number, gender: string, throughDaughter: boolean) {
  const genderTerm = gender === "female" ? "daughter" : gender === "male" ? "son" : "child";
  const generation = depth <= 2 ? "grand" : `${"great-".repeat(depth - 2)}grand`;
  return `${throughDaughter ? "Maternal-line " : ""}${generation}${genderTerm}`;
}

function englishFallbackForKey(key: string): string {
  if (key.startsWith("custom_relation_")) return "Custom relationship";

  if (key.startsWith("adoptive_")) {
    const base: string = englishTermByKey[key.slice("adoptive_".length)] || englishFallbackForKey(key.slice("adoptive_".length));
    return `Adoptive ${base.charAt(0).toLowerCase()}${base.slice(1)}`;
  }

  const ancestor = key.match(/^(maternal|paternal)_(?:ancestor_(\d+)|great_grand)(mother|father)$/);
  if (ancestor) {
    const side = ancestor[1] === "maternal" ? "Maternal" : "Paternal";
    const depth = ancestor[2] ? `${ancestor[2]}-generation ` : "great-grand";
    const gender = ancestor[3] === "mother" ? "mother" : "father";
    return ancestor[2] ? `${side} ${depth}ancestor (${gender})` : `${side} ${depth}${gender}`;
  }

  const descendant = key.match(/^(maternal_)?descendant_(\d+)_(male|female|other|unknown)$/);
  if (descendant) return descendantTerm(Number(descendant[2]), descendant[3], Boolean(descendant[1]));

  const grandCollateral = key.match(/^(maternal|paternal)_(?:grandfather|grandmother)_(?:older_|younger_)?(brother|sister|sibling)$/);
  if (grandCollateral) {
    const side = grandCollateral[1] === "maternal" ? "Maternal" : "Paternal";
    const relative = grandCollateral[2] === "brother" ? "granduncle" : grandCollateral[2] === "sister" ? "grandaunt" : "grandparent's sibling";
    return `${side} ${relative}`;
  }

  const siblingDescendant = key.match(/^(brothers|sisters)_descendant_(\d+)_(male|female|other|unknown)$/);
  if (siblingDescendant) {
    const depth = Number(siblingDescendant[2]);
    if (siblingDescendant[3] !== "female" && siblingDescendant[3] !== "male") {
      return `Sibling's descendant (${depth} generations)`;
    }
    const gender = siblingDescendant[3] === "female" ? "niece" : "nephew";
    return `${"great-".repeat(Math.max(1, depth - 1))}${gender}`;
  }

  const distantCousin = key.match(/^distant_cousin_(\d+)_/);
  if (distantCousin) return `${ordinal(Number(distantCousin[1]))} cousin`;

  const cousinYounger = key.match(/^(tang|biao)_(niece|nephew)$/);
  if (cousinYounger) return `${cousinYounger[1] === "tang" ? "Paternal " : ""}cousin once removed (younger generation)`;

  const cousinOlder = key.match(/^(tang|biao)_parent_(?:older_|younger_|unknown_)?(?:uncle|aunt|relative)$/);
  if (cousinOlder) return `${cousinOlder[1] === "tang" ? "Father's paternal" : "Parent's"} cousin`;

  if (/^(wifes|husbands)_(?:older|younger|unknown)_brother$/.test(key)) return "Brother-in-law";
  if (/^(wifes|husbands)_(?:older|younger|unknown)_sister$/.test(key)) return "Sister-in-law";

  const distantGeneration = key.match(/^distant_(elder|younger)_(\d+)_/);
  if (distantGeneration) {
    return `Distant relative (${distantGeneration[2]} generation${distantGeneration[2] === "1" ? "" : "s"} ${distantGeneration[1] === "elder" ? "older" : "younger"})`;
  }

  return "Extended relative";
}

export function localizeKinshipTerm(source: string, canonicalKey: string | undefined, locale: Locale) {
  if (locale === "zh-CN") return source;
  if (locale === "zh-TW") return toTraditional(source);
  return englishTermByKey[canonicalKey || ""] || chineseToEnglish.get(source) || (canonicalKey ? englishFallbackForKey(canonicalKey) : "Extended relative");
}

export function localizeKinshipResultTerm(result: KinshipResult, locale: Locale) {
  return result.isCustom ? result.term : localizeKinshipTerm(result.term, result.canonicalKey, locale);
}

export function localizeKinshipNote(note: string | undefined, locale: Locale) {
  if (!note || locale === "zh-CN") return note;
  if (locale === "zh-TW") return toTraditional(note);
  if (note.includes("出生日期") && note.includes("长幼")) return "Complete birth dates are unavailable, so relative age cannot be determined.";
  if (note.includes("关系路径")) return "Use the relationship path as the source of truth.";
  if (note.includes("地区而异")) return "This term varies by region.";
  if (note.includes("随对象称呼")) return "Uses the spouse's form of address.";
  if (note.includes("请先补充")) return "Add parent, spouse, or sibling relationships between these people first.";
  return "See the relationship path for details.";
}

export function localizeChainRelation(item: KinshipChainItem, locale: Locale) {
  if (item.isCustom) return item.relation;
  return localizeKinshipTerm(item.relation, item.canonicalKey, locale);
}
