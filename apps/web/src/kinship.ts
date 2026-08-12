import type { FamilyData, Gender, Person, Relation } from "./types";

type Direction =
  | "up"
  | "down"
  | "sibling"
  | "spouse"
  | "adoptive-up"
  | "adoptive-down";

interface PathStep {
  fromId: string;
  toId: string;
  direction: Direction;
  label: string;
  canonicalKey: string;
}

interface KinshipName {
  key: string;
  standardTerm: string;
  customTerm?: string;
  note?: string;
}

export interface KinshipChainItem {
  personId: string;
  name: string;
  relation: string;
  canonicalKey?: string;
  isCustom?: boolean;
}

export interface KinshipResult {
  connected: boolean;
  term: string;
  standardTerm: string;
  canonicalKey?: string;
  isCustom: boolean;
  chain: KinshipChainItem[];
  note?: string;
}

export interface KinshipLineageBranch {
  personId: string;
  name: string;
  /** 从共同长辈向当前成员排列，steps 不包含共同长辈本身。 */
  steps: KinshipChainItem[];
}

export interface KinshipLineageTrace {
  commonAncestor: Pick<KinshipChainItem, "personId" | "name">;
  firstBranch: KinshipLineageBranch;
  secondBranch: KinshipLineageBranch;
}

export interface MutualKinshipResult {
  firstToSecond: KinshipResult;
  secondToFirst: KinshipResult;
  lineageTrace?: KinshipLineageTrace;
}

export interface KinshipCatalogItem {
  key: string;
  label: string;
  description: string;
  group: "直系亲属" | "父母同辈" | "同辈与晚辈" | "祖辈旁系" | "姻亲";
}

export const kinshipCatalog: KinshipCatalogItem[] = [
  { key: "father", label: "爸爸", description: "父亲", group: "直系亲属" },
  { key: "mother", label: "妈妈", description: "母亲", group: "直系亲属" },
  { key: "son", label: "儿子", description: "男性子女", group: "直系亲属" },
  { key: "daughter", label: "女儿", description: "女性子女", group: "直系亲属" },
  { key: "paternal_grandfather", label: "爷爷", description: "爸爸的爸爸", group: "直系亲属" },
  { key: "paternal_grandmother", label: "奶奶", description: "爸爸的妈妈", group: "直系亲属" },
  { key: "maternal_grandfather", label: "外公", description: "妈妈的爸爸", group: "直系亲属" },
  { key: "maternal_grandmother", label: "外婆", description: "妈妈的妈妈", group: "直系亲属" },
  { key: "grandson", label: "孙子", description: "儿子的儿子", group: "直系亲属" },
  { key: "granddaughter", label: "孙女", description: "儿子的女儿", group: "直系亲属" },
  { key: "maternal_grandson", label: "外孙", description: "女儿的儿子", group: "直系亲属" },
  { key: "maternal_granddaughter", label: "外孙女", description: "女儿的女儿", group: "直系亲属" },
  { key: "paternal_older_uncle", label: "伯父", description: "爸爸的哥哥", group: "父母同辈" },
  { key: "paternal_younger_uncle", label: "叔叔", description: "爸爸的弟弟", group: "父母同辈" },
  { key: "paternal_uncle", label: "伯父 / 叔叔", description: "爸爸的兄弟（长幼未知）", group: "父母同辈" },
  { key: "paternal_aunt", label: "姑姑", description: "爸爸的姐妹", group: "父母同辈" },
  { key: "maternal_uncle", label: "舅舅", description: "妈妈的兄弟", group: "父母同辈" },
  { key: "maternal_aunt", label: "姨妈", description: "妈妈的姐妹", group: "父母同辈" },
  { key: "older_brother", label: "哥哥", description: "年长的兄弟", group: "同辈与晚辈" },
  { key: "younger_brother", label: "弟弟", description: "年幼的兄弟", group: "同辈与晚辈" },
  { key: "older_sister", label: "姐姐", description: "年长的姐妹", group: "同辈与晚辈" },
  { key: "younger_sister", label: "妹妹", description: "年幼的姐妹", group: "同辈与晚辈" },
  { key: "brothers_son", label: "侄子", description: "兄弟的儿子", group: "同辈与晚辈" },
  { key: "brothers_daughter", label: "侄女", description: "兄弟的女儿", group: "同辈与晚辈" },
  { key: "sisters_son", label: "外甥", description: "姐妹的儿子", group: "同辈与晚辈" },
  { key: "sisters_daughter", label: "外甥女", description: "姐妹的女儿", group: "同辈与晚辈" },
  { key: "tang_older_brother", label: "堂哥", description: "伯叔家的年长男性同辈", group: "同辈与晚辈" },
  { key: "tang_younger_brother", label: "堂弟", description: "伯叔家的年幼男性同辈", group: "同辈与晚辈" },
  { key: "tang_older_sister", label: "堂姐", description: "伯叔家的年长女性同辈", group: "同辈与晚辈" },
  { key: "tang_younger_sister", label: "堂妹", description: "伯叔家的年幼女性同辈", group: "同辈与晚辈" },
  { key: "biao_older_brother", label: "表哥", description: "姑姨舅家的年长男性同辈", group: "同辈与晚辈" },
  { key: "biao_younger_brother", label: "表弟", description: "姑姨舅家的年幼男性同辈", group: "同辈与晚辈" },
  { key: "biao_older_sister", label: "表姐", description: "姑姨舅家的年长女性同辈", group: "同辈与晚辈" },
  { key: "biao_younger_sister", label: "表妹", description: "姑姨舅家的年幼女性同辈", group: "同辈与晚辈" },
  { key: "paternal_grandfather_older_brother", label: "伯祖父", description: "爷爷的哥哥", group: "祖辈旁系" },
  { key: "paternal_grandfather_younger_brother", label: "叔祖父", description: "爷爷的弟弟", group: "祖辈旁系" },
  { key: "paternal_grandfather_brother", label: "伯祖父 / 叔祖父", description: "爷爷的兄弟（长幼未知）", group: "祖辈旁系" },
  { key: "paternal_grandfather_sister", label: "姑祖母", description: "爷爷的姐妹", group: "祖辈旁系" },
  { key: "paternal_grandmother_brother", label: "舅祖父", description: "奶奶的兄弟", group: "祖辈旁系" },
  { key: "paternal_grandmother_sister", label: "姨祖母", description: "奶奶的姐妹", group: "祖辈旁系" },
  { key: "maternal_grandfather_brother", label: "外伯祖父 / 外叔祖父", description: "外公的兄弟", group: "祖辈旁系" },
  { key: "maternal_grandfather_sister", label: "外姑祖母", description: "外公的姐妹", group: "祖辈旁系" },
  { key: "maternal_grandmother_brother", label: "外舅祖父", description: "外婆的兄弟", group: "祖辈旁系" },
  { key: "maternal_grandmother_sister", label: "外姨祖母", description: "外婆的姐妹", group: "祖辈旁系" },
  { key: "husband", label: "丈夫", description: "男性对象", group: "姻亲" },
  { key: "wife", label: "妻子", description: "女性对象", group: "姻亲" },
  { key: "wifes_father", label: "岳父", description: "妻子的父亲", group: "姻亲" },
  { key: "wifes_mother", label: "岳母", description: "妻子的母亲", group: "姻亲" },
  { key: "husbands_father", label: "公公", description: "丈夫的父亲", group: "姻亲" },
  { key: "husbands_mother", label: "婆婆", description: "丈夫的母亲", group: "姻亲" },
  { key: "older_brothers_wife", label: "嫂子", description: "哥哥的妻子", group: "姻亲" },
  { key: "younger_brothers_wife", label: "弟媳", description: "弟弟的妻子", group: "姻亲" },
  { key: "older_sisters_husband", label: "姐夫", description: "姐姐的丈夫", group: "姻亲" },
  { key: "younger_sisters_husband", label: "妹夫", description: "妹妹的丈夫", group: "姻亲" },
  { key: "sons_wife", label: "儿媳", description: "儿子的妻子", group: "姻亲" },
  { key: "daughters_husband", label: "女婿", description: "女儿的丈夫", group: "姻亲" },
  { key: "paternal_older_uncles_wife", label: "伯母", description: "伯父的妻子", group: "姻亲" },
  { key: "paternal_younger_uncles_wife", label: "婶婶", description: "叔叔的妻子", group: "姻亲" },
  { key: "paternal_aunts_husband", label: "姑父", description: "姑姑的丈夫", group: "姻亲" },
  { key: "maternal_uncles_wife", label: "舅妈", description: "舅舅的妻子", group: "姻亲" },
  { key: "maternal_aunts_husband", label: "姨父", description: "姨妈的丈夫", group: "姻亲" }
];

export const kinshipPresets = [
  { key: "paternal_grandfather_sister", term: "姑姑", label: "爷爷的姐妹 → 姑姑" },
  { key: "paternal_aunt", term: "嬢嬢", label: "爸爸的姐妹 → 嬢嬢" },
  { key: "paternal_younger_uncle", term: "满满", label: "爸爸的弟弟 → 满满" }
] as const;

const catalogTermByKey = new Map(kinshipCatalog.map((item) => [item.key, item.label]));

function compareAge(person: Person, reference: Person): "older" | "younger" | "unknown" {
  if (!person.birthDate || !reference.birthDate || person.birthDate === reference.birthDate) return "unknown";
  return person.birthDate < reference.birthDate ? "older" : "younger";
}

function siblingName(person: Person, reference: Person, prefix = ""): KinshipName {
  const age = compareAge(person, reference);
  const relationPrefix = prefix === "tang_" ? "堂" : prefix === "biao_" ? "表" : "";
  if (person.gender === "male") {
    if (age === "older") return { key: `${prefix}older_brother`, standardTerm: `${relationPrefix}哥${prefix ? "" : "哥"}` };
    if (age === "younger") return { key: `${prefix}younger_brother`, standardTerm: `${relationPrefix}弟${prefix ? "" : "弟"}` };
    return {
      key: prefix ? `${prefix}brother` : "brother",
      standardTerm: prefix === "tang_" ? "堂兄弟" : prefix === "biao_" ? "表兄弟" : "兄弟",
      note: "未录入完整出生日期，暂不区分长幼"
    };
  }
  if (person.gender === "female") {
    if (age === "older") return { key: `${prefix}older_sister`, standardTerm: `${relationPrefix}姐${prefix ? "" : "姐"}` };
    if (age === "younger") return { key: `${prefix}younger_sister`, standardTerm: `${relationPrefix}妹${prefix ? "" : "妹"}` };
    return {
      key: prefix ? `${prefix}sister` : "sister",
      standardTerm: prefix === "tang_" ? "堂姐妹" : prefix === "biao_" ? "表姐妹" : "姐妹",
      note: "未录入完整出生日期，暂不区分长幼"
    };
  }
  return { key: prefix ? `${prefix}sibling` : "sibling", standardTerm: prefix === "tang_" ? "堂亲同辈" : prefix === "biao_" ? "表亲同辈" : "兄弟姐妹" };
}

function directName(direction: Direction, ego: Person, target: Person): KinshipName {
  if (direction === "up") {
    return target.gender === "male"
      ? { key: "father", standardTerm: "爸爸" }
      : target.gender === "female"
        ? { key: "mother", standardTerm: "妈妈" }
        : { key: "parent", standardTerm: "父母" };
  }
  if (direction === "down") {
    return target.gender === "male"
      ? { key: "son", standardTerm: "儿子" }
      : target.gender === "female"
        ? { key: "daughter", standardTerm: "女儿" }
        : { key: "child", standardTerm: "子女" };
  }
  if (direction === "sibling") return siblingName(target, ego);
  if (direction === "spouse") {
    return target.gender === "male"
      ? { key: "husband", standardTerm: "丈夫" }
      : target.gender === "female"
        ? { key: "wife", standardTerm: "妻子" }
        : { key: "spouse", standardTerm: "爱人" };
  }
  if (direction === "adoptive-up") {
    return target.gender === "male"
      ? { key: "adoptive_father", standardTerm: "养父" }
      : target.gender === "female"
        ? { key: "adoptive_mother", standardTerm: "养母" }
        : { key: "adoptive_parent", standardTerm: "养父母" };
  }
  return target.gender === "male"
    ? { key: "adoptive_son", standardTerm: "养子" }
    : target.gender === "female"
      ? { key: "adoptive_daughter", standardTerm: "养女" }
      : { key: "adoptive_child", standardTerm: "养子女" };
}

function ancestorName(nodes: Person[]): KinshipName {
  const depth = nodes.length - 1;
  const first = nodes[1];
  const target = nodes.at(-1)!;
  if (depth === 1) return directName("up", nodes[0], target);
  if (depth === 2) {
    const branch = first.gender === "female" ? "maternal" : "paternal";
    const key = `${branch}_${target.gender === "female" ? "grandmother" : "grandfather"}`;
    const standardTerm = first.gender === "female"
      ? target.gender === "female" ? "外婆" : "外公"
      : target.gender === "female" ? "奶奶" : "爷爷";
    return { key, standardTerm };
  }
  const generationNames = ["", "", "祖", "曾祖", "高祖", "天祖", "烈祖", "太祖", "远祖", "鼻祖"];
  const generationName = generationNames[depth] || `第 ${depth} 代祖`;
  const maternalPrefix = first.gender === "female" ? "外" : "";
  const genderSuffix = target.gender === "female" ? "母" : target.gender === "male" ? "父" : "辈";
  const keyDepth = depth === 3 ? "great_grand" : `ancestor_${depth}`;
  return { key: `${first.gender === "female" ? "maternal" : "paternal"}_${keyDepth}${target.gender === "female" ? "mother" : "father"}`, standardTerm: `${maternalPrefix}${generationName}${genderSuffix}` };
}

function descendantName(nodes: Person[]): KinshipName {
  const depth = nodes.length - 1;
  const first = nodes[1];
  const target = nodes.at(-1)!;
  if (depth === 1) return directName("down", nodes[0], target);
  const isMaternal = first.gender === "female";
  if (depth === 2) {
    const key = `${isMaternal ? "maternal_" : ""}grand${target.gender === "female" ? "daughter" : "son"}`;
    return { key, standardTerm: `${isMaternal ? "外" : ""}孙${target.gender === "female" ? "女" : target.gender === "male" ? (isMaternal ? "" : "子") : "辈"}` };
  }
  const generationNames = ["", "", "孙", "曾孙", "玄孙", "来孙", "晜孙", "仍孙", "云孙", "耳孙"];
  const generationName = generationNames[depth] || `第 ${depth} 代孙`;
  return {
    key: `${isMaternal ? "maternal_" : ""}descendant_${depth}_${target.gender}`,
    standardTerm: `${isMaternal ? "外" : ""}${generationName}${target.gender === "female" ? "女" : target.gender === "unknown" || target.gender === "other" ? "辈" : ""}`
  };
}

function parentSiblingName(parent: Person, relative: Person): KinshipName {
  if (parent.gender === "female") {
    return relative.gender === "male"
      ? { key: "maternal_uncle", standardTerm: "舅舅" }
      : relative.gender === "female"
        ? { key: "maternal_aunt", standardTerm: "姨妈" }
        : { key: "maternal_sibling", standardTerm: "舅姨" };
  }
  if (relative.gender === "female") return { key: "paternal_aunt", standardTerm: "姑姑" };
  if (relative.gender !== "male") return { key: "paternal_sibling", standardTerm: "叔伯姑" };
  const age = compareAge(relative, parent);
  if (age === "older") return { key: "paternal_older_uncle", standardTerm: "伯父" };
  if (age === "younger") return { key: "paternal_younger_uncle", standardTerm: "叔叔" };
  return { key: "paternal_uncle", standardTerm: "伯父 / 叔叔", note: "未录入完整出生日期，暂不区分长幼" };
}

function grandparentSiblingName(egoLine: Person[], relative: Person): KinshipName {
  const parent = egoLine[0];
  const grandparent = egoLine[1];
  const side = parent.gender === "female" ? "maternal" : "paternal";
  const grandparentSide = grandparent.gender === "female" ? "grandmother" : "grandfather";
  const prefix = `${side}_${grandparentSide}`;
  if (relative.gender === "female") {
    const label = side === "paternal"
      ? grandparentSide === "grandfather" ? "姑祖母" : "姨祖母"
      : grandparentSide === "grandfather" ? "外姑祖母" : "外姨祖母";
    return { key: `${prefix}_sister`, standardTerm: label };
  }
  if (relative.gender !== "male") return { key: `${prefix}_sibling`, standardTerm: "祖辈的兄弟姐妹" };
  if (grandparentSide === "grandmother") {
    return { key: `${prefix}_brother`, standardTerm: side === "paternal" ? "舅祖父" : "外舅祖父" };
  }
  const age = compareAge(relative, grandparent);
  const outside = side === "maternal" ? "外" : "";
  if (age === "older") return { key: `${prefix}_older_brother`, standardTerm: `${outside}伯祖父` };
  if (age === "younger") return { key: `${prefix}_younger_brother`, standardTerm: `${outside}叔祖父` };
  return { key: `${prefix}_brother`, standardTerm: `${outside}伯祖父 / ${outside}叔祖父`, note: "未录入完整出生日期，暂不区分长幼" };
}

function siblingChildName(sibling: Person, target: Person): KinshipName {
  const sisterSide = sibling.gender === "female";
  return {
    key: `${sisterSide ? "sisters" : "brothers"}_${target.gender === "female" ? "daughter" : "son"}`,
    standardTerm: `${sisterSide ? "外甥" : "侄"}${target.gender === "female" ? "女" : target.gender === "male" ? (sisterSide ? "" : "子") : "辈"}`
  };
}

function distantCollateralName(a: number, b: number, ego: Person, egoLine: Person[], targetLine: Person[]): KinshipName {
  const target = targetLine.at(-1)!;
  const targetBranch = targetLine[0];
  if (a === 1 && b === 1) return siblingName(target, ego);
  if (a === 2 && b === 1) return parentSiblingName(egoLine[0], target);
  if (a === 1 && b === 2) return siblingChildName(targetBranch, target);
  if (a === 2 && b === 2) {
    const isTang = egoLine[0]?.gender === "male" && targetBranch.gender === "male";
    return siblingName(target, ego, isTang ? "tang_" : "biao_");
  }
  if (a === 3 && b === 1) return grandparentSiblingName(egoLine, target);
  if (a === 1 && b >= 3) {
    const outside = targetBranch.gender === "female";
    const generation = b === 3 ? "孙" : b === 4 ? "曾孙" : `第 ${b - 1} 代孙`;
    return {
      key: `${outside ? "sisters" : "brothers"}_descendant_${b - 1}_${target.gender}`,
      standardTerm: `${outside ? "外甥" : "侄"}${generation}${target.gender === "female" ? "女" : ""}`
    };
  }
  if (a === b) {
    const degree = a - 1;
    const prefix = degree === 2 ? "再从" : `${degree}从`;
    const peer = siblingName(target, ego);
    return { key: `distant_cousin_${degree}_${target.gender}`, standardTerm: `${prefix}${peer.standardTerm}`, note: `属于第 ${degree} 代表亲` };
  }
  if (a >= 2 && b === a + 1) {
    const isTang = egoLine.at(-1)?.gender === "male" && targetBranch.gender === "male";
    const prefix = isTang ? "堂" : "表";
    return {
      key: `${isTang ? "tang" : "biao"}_${target.gender === "female" ? "niece" : "nephew"}`,
      standardTerm: `${prefix}侄${target.gender === "female" ? "女" : target.gender === "male" ? "子" : "辈"}`
    };
  }
  if (b >= 2 && a === b + 1) {
    const isTang = egoLine.at(-1)?.gender === "male" && targetBranch.gender === "male";
    const prefix = isTang ? "堂" : "表";
    if (target.gender === "female") {
      return { key: `${isTang ? "tang" : "biao"}_parent_aunt`, standardTerm: `${prefix}${isTang ? "姑" : "姑姨"}` };
    }
    if (target.gender !== "male") {
      return { key: `${isTang ? "tang" : "biao"}_parent_relative`, standardTerm: `${prefix}叔伯姑辈` };
    }
    const age = compareAge(target, egoLine[0] || ego);
    return {
      key: `${isTang ? "tang" : "biao"}_parent_${age}_uncle`,
      standardTerm: age === "older" ? `${prefix}伯父` : age === "younger" ? `${prefix}叔父` : `${prefix}伯父 / ${prefix}叔父`,
      note: age === "unknown" ? "未录入完整出生日期，暂不区分长幼" : undefined
    };
  }
  const generationGap = a - b;
  if (generationGap > 0) {
    const level = generationGap === 1 ? "叔伯姑姨" : generationGap === 2 ? "叔祖姑祖" : `${generationGap} 代旁系长辈`;
    return { key: `distant_elder_${generationGap}_${target.gender}`, standardTerm: `远房${level}`, note: "远房关系以关系路径为准" };
  }
  const level = generationGap === -1 ? "侄辈" : generationGap === -2 ? "侄孙辈" : `${Math.abs(generationGap)} 代旁系晚辈`;
  return { key: `distant_younger_${Math.abs(generationGap)}_${target.gender}`, standardTerm: `远房${level}`, note: "远房关系以关系路径为准" };
}

function inLawName(base: KinshipName, target: Person): KinshipName | undefined {
  const names: Record<string, KinshipName> = {
    older_brother: { key: "older_brothers_wife", standardTerm: "嫂子" },
    younger_brother: { key: "younger_brothers_wife", standardTerm: "弟媳" },
    older_sister: { key: "older_sisters_husband", standardTerm: "姐夫" },
    younger_sister: { key: "younger_sisters_husband", standardTerm: "妹夫" },
    son: { key: "sons_wife", standardTerm: "儿媳" },
    daughter: { key: "daughters_husband", standardTerm: "女婿" },
    paternal_older_uncle: { key: "paternal_older_uncles_wife", standardTerm: "伯母" },
    paternal_younger_uncle: { key: "paternal_younger_uncles_wife", standardTerm: "婶婶" },
    paternal_aunt: { key: "paternal_aunts_husband", standardTerm: "姑父" },
    maternal_uncle: { key: "maternal_uncles_wife", standardTerm: "舅妈" },
    maternal_aunt: { key: "maternal_aunts_husband", standardTerm: "姨父" },
    tang_parent_older_uncle: { key: "tang_older_uncles_wife", standardTerm: "堂伯母" },
    tang_parent_younger_uncle: { key: "tang_younger_uncles_wife", standardTerm: "堂婶婶" },
    tang_parent_unknown_uncle: { key: "tang_uncles_wife", standardTerm: "堂伯母 / 堂婶婶", note: base.note },
    tang_parent_aunt: { key: "tang_aunts_husband", standardTerm: "堂姑父" },
    biao_parent_older_uncle: { key: "biao_older_uncles_wife", standardTerm: "表伯母" },
    biao_parent_younger_uncle: { key: "biao_younger_uncles_wife", standardTerm: "表婶婶" },
    biao_parent_unknown_uncle: { key: "biao_uncles_wife", standardTerm: "表伯母 / 表婶婶", note: base.note },
    biao_parent_aunt: { key: "biao_aunts_husband", standardTerm: "表姑父 / 表姨父" }
  };
  if (names[base.key]) return names[base.key];
  if (base.key === "brother" && target.gender === "female") return { key: "brothers_wife", standardTerm: "嫂子 / 弟媳", note: base.note };
  if (base.key === "sister" && target.gender === "male") return { key: "sisters_husband", standardTerm: "姐夫 / 妹夫", note: base.note };
  return undefined;
}

function classifyCore(directions: Direction[], nodes: Person[]): KinshipName {
  const ego = nodes[0];
  const target = nodes.at(-1)!;
  if (directions.length === 1) return directName(directions[0], ego, target);

  if (directions.at(-1) === "spouse") {
    const base = classifyCore(directions.slice(0, -1), nodes.slice(0, -1));
    return inLawName(base, target) || { key: "relative_in_law", standardTerm: `${base.standardTerm}的对象`, note: "姻亲称呼因地区而异" };
  }

  if (directions[0] === "spouse") {
    const spouse = nodes[1];
    if (directions.length === 2 && directions[1] === "up") {
      if (spouse.gender === "female") {
        return target.gender === "female" ? { key: "wifes_mother", standardTerm: "岳母" } : { key: "wifes_father", standardTerm: "岳父" };
      }
      if (spouse.gender === "male") {
        return target.gender === "female" ? { key: "husbands_mother", standardTerm: "婆婆" } : { key: "husbands_father", standardTerm: "公公" };
      }
    }
    if (directions.length === 2 && directions[1] === "sibling") {
      const age = compareAge(target, spouse);
      if (spouse.gender === "female") {
        if (target.gender === "male") return { key: `wifes_${age}_brother`, standardTerm: age === "older" ? "大舅子" : age === "younger" ? "小舅子" : "内兄弟", note: age === "unknown" ? "未录入完整出生日期，暂不区分长幼" : undefined };
        if (target.gender === "female") return { key: `wifes_${age}_sister`, standardTerm: age === "older" ? "大姨子" : age === "younger" ? "小姨子" : "姨姐/姨妹", note: age === "unknown" ? "未录入完整出生日期，暂不区分长幼" : undefined };
      }
      if (spouse.gender === "male") {
        if (target.gender === "male") return { key: `husbands_${age}_brother`, standardTerm: age === "older" ? "大伯子" : age === "younger" ? "小叔子" : "伯叔", note: age === "unknown" ? "未录入完整出生日期，暂不区分长幼" : undefined };
        if (target.gender === "female") return { key: `husbands_${age}_sister`, standardTerm: age === "older" ? "大姑子" : age === "younger" ? "小姑子" : "姑姐/姑妹", note: age === "unknown" ? "未录入完整出生日期，暂不区分长幼" : undefined };
      }
    }
    if (directions.length === 2 && directions[1] === "down") {
      return target.gender === "female" ? { key: "stepdaughter", standardTerm: "继女" } : { key: "stepson", standardTerm: "继子" };
    }
    const throughPartner = classifyCore(directions.slice(1), nodes.slice(1));
    return {
      ...throughPartner,
      note: throughPartner.note ? `${throughPartner.note}；随对象称呼` : "随对象称呼"
    };
  }

  if (directions.some((direction) => direction === "spouse")) {
    return { key: "relative_in_law", standardTerm: "姻亲", note: "具体称呼请参考关系路径" };
  }

  const hasAdoptive = directions.some((direction) => direction.startsWith("adoptive"));
  const normalized = directions.map((direction) => direction === "adoptive-up" ? "up" : direction === "adoptive-down" ? "down" : direction);
  if (normalized.every((direction) => direction === "up")) {
    const result = ancestorName(nodes);
    return hasAdoptive ? { ...result, key: `adoptive_${result.key}`, standardTerm: `养${result.standardTerm}` } : result;
  }
  if (normalized.every((direction) => direction === "down")) {
    const result = descendantName(nodes);
    return hasAdoptive ? { ...result, key: `adoptive_${result.key}`, standardTerm: `养${result.standardTerm}` } : result;
  }

  const siblingIndex = normalized.indexOf("sibling");
  if (siblingIndex >= 0 && normalized.lastIndexOf("sibling") === siblingIndex) {
    const before = normalized.slice(0, siblingIndex);
    const after = normalized.slice(siblingIndex + 1);
    if (before.every((direction) => direction === "up") && after.every((direction) => direction === "down")) {
      const a = before.length + 1;
      const b = after.length + 1;
      const egoLine = nodes.slice(1, siblingIndex + 1);
      const targetLine = nodes.slice(siblingIndex + 1);
      return distantCollateralName(a, b, ego, egoLine, targetLine);
    }
  }

  const firstDown = normalized.indexOf("down");
  if (firstDown > 0 && normalized.slice(0, firstDown).every((direction) => direction === "up") && normalized.slice(firstDown).every((direction) => direction === "down")) {
    const a = firstDown;
    const b = normalized.length - firstDown;
    const egoLine = nodes.slice(1, a);
    const targetLine = nodes.slice(a + 1);
    return distantCollateralName(a, b, ego, egoLine, targetLine);
  }

  return { key: "extended_relative", standardTerm: "远房亲属", note: "具体称呼请参考关系路径" };
}

function stepName(direction: Direction, from: Person, to: Person) {
  return direction === "sibling" ? siblingName(to, from) : directName(direction, from, to);
}

function addEdge(adjacency: Map<string, PathStep[]>, from: Person, to: Person, direction: Direction) {
  const name = stepName(direction, from, to);
  adjacency.set(from.id, [...(adjacency.get(from.id) || []), {
    fromId: from.id,
    toId: to.id,
    direction,
    label: name.standardTerm,
    canonicalKey: name.key
  }]);
}

function buildAdjacency(data: FamilyData) {
  const people = new Map(data.people.map((person) => [person.id, person]));
  const adjacency = new Map<string, PathStep[]>();
  data.relations.forEach((relation) => {
    const from = people.get(relation.fromPersonId);
    const to = people.get(relation.toPersonId);
    if (!from || !to) return;
    if (relation.type === "parent") {
      addEdge(adjacency, from, to, "down");
      addEdge(adjacency, to, from, "up");
    } else if (relation.type === "adoptive_parent") {
      addEdge(adjacency, from, to, "adoptive-down");
      addEdge(adjacency, to, from, "adoptive-up");
    } else if (relation.type === "spouse") {
      addEdge(adjacency, from, to, "spouse");
      addEdge(adjacency, to, from, "spouse");
    } else if (relation.type === "sibling") {
      addEdge(adjacency, from, to, "sibling");
      addEdge(adjacency, to, from, "sibling");
    }
  });
  return { people, adjacency };
}

function findDirectSpecial(relations: Relation[], egoId: string, targetId: string): KinshipName | undefined {
  const relation = relations.find((item) =>
    (item.fromPersonId === egoId && item.toPersonId === targetId)
    || (item.fromPersonId === targetId && item.toPersonId === egoId));
  if (!relation || !["guardian", "other"].includes(relation.type)) return undefined;
  if (relation.type === "other") {
    return { key: `custom_relation_${relation.id}`, standardTerm: "自定义关系", customTerm: relation.label };
  }
  return relation.fromPersonId === targetId
    ? { key: "guardian", standardTerm: "监护人", customTerm: relation.label }
    : { key: "ward", standardTerm: "被监护人" };
}

function findPath(data: FamilyData, egoId: string, targetId: string): { steps: PathStep[]; people: Map<string, Person> } | undefined {
  const { people, adjacency } = buildAdjacency(data);
  if (!people.has(egoId) || !people.has(targetId)) return undefined;
  const queue: Array<{ personId: string; steps: PathStep[] }> = [{ personId: egoId, steps: [] }];
  const visited = new Set([egoId]);
  while (queue.length) {
    const current = queue.shift()!;
    if (current.personId === targetId) return { steps: current.steps, people };
    if (current.steps.length >= 12) continue;
    for (const edge of adjacency.get(current.personId) || []) {
      if (visited.has(edge.toId)) continue;
      visited.add(edge.toId);
      queue.push({ personId: edge.toId, steps: [...current.steps, edge] });
    }
  }
  return undefined;
}

function findAncestorPaths(data: FamilyData, startId: string) {
  const people = new Map(data.people.map((person) => [person.id, person]));
  const start = people.get(startId);
  if (!start) return new Map<string, KinshipChainItem[]>();
  const parentEdges = new Map<string, Array<{ parent: Person; direction: "up" | "adoptive-up" }>>();
  data.relations.forEach((relation) => {
    if (relation.type !== "parent" && relation.type !== "adoptive_parent") return;
    const parent = people.get(relation.fromPersonId);
    if (!parent || !people.has(relation.toPersonId)) return;
    const direction = relation.type === "parent" ? "up" : "adoptive-up";
    parentEdges.set(relation.toPersonId, [...(parentEdges.get(relation.toPersonId) || []), { parent, direction }]);
  });

  const paths = new Map<string, { steps: KinshipChainItem[]; directions: Direction[] }>([[startId, { steps: [], directions: [] }]]);
  const queue = [startId];
  while (queue.length) {
    const personId = queue.shift()!;
    const path = paths.get(personId)!;
    if (path.steps.length >= 12) continue;
    for (const edge of parentEdges.get(personId) || []) {
      if (paths.has(edge.parent.id)) continue;
      const directions = [...path.directions, edge.direction];
      const lineagePeople = [start, ...path.steps.map((step) => people.get(step.personId)!).filter(Boolean), edge.parent];
      const relativeName = classifyCore(directions, lineagePeople);
      const customTerm = data.kinshipOverrides?.[relativeName.key]?.trim();
      paths.set(edge.parent.id, {
        directions,
        steps: [...path.steps, {
          personId: edge.parent.id,
          name: edge.parent.name,
          relation: customTerm || relativeName.standardTerm,
          canonicalKey: relativeName.key,
          isCustom: Boolean(customTerm)
        }]
      });
      queue.push(edge.parent.id);
    }
  }
  return new Map([...paths].map(([personId, path]) => [personId, path.steps]));
}

function findLineageTrace(data: FamilyData, firstId: string, secondId: string): KinshipLineageTrace | undefined {
  const first = data.people.find((person) => person.id === firstId);
  const second = data.people.find((person) => person.id === secondId);
  if (!first || !second) return undefined;

  const peopleById = new Map(data.people.map((person) => [person.id, person]));
  const partnerAnchors = (person: Person) => [person, ...data.relations
    .filter((relation) => relation.type === "spouse" && (relation.fromPersonId === person.id || relation.toPersonId === person.id))
    .map((relation) => peopleById.get(relation.fromPersonId === person.id ? relation.toPersonId : relation.fromPersonId))
    .filter((partner): partner is Person => Boolean(partner))];
  const pathCache = new Map<string, ReturnType<typeof findAncestorPaths>>();
  const pathsFor = (person: Person) => {
    if (!pathCache.has(person.id)) pathCache.set(person.id, findAncestorPaths(data, person.id));
    return pathCache.get(person.id)!;
  };
  const traceCandidates = (anchorPairs: Array<[Person, Person]>) => anchorPairs.flatMap(([firstAnchor, secondAnchor]) => {
    const firstPaths = pathsFor(firstAnchor);
    const secondPaths = pathsFor(secondAnchor);
    return [...firstPaths.keys()]
      .filter((personId) => secondPaths.has(personId))
      .map((personId) => {
        const person = peopleById.get(personId)!;
        const firstDistance = firstPaths.get(personId)!.length;
        const secondDistance = secondPaths.get(personId)!.length;
        return {
          person,
          firstAnchor,
          secondAnchor,
          firstPaths,
          secondPaths,
          firstDistance,
          secondDistance,
          proxyCount: Number(firstAnchor.id !== first.id) + Number(secondAnchor.id !== second.id),
          familySurnamePenalty: data.surname && person.name.startsWith(data.surname) ? 0 : 1
        };
      });
  });
  const directCandidates = traceCandidates([[first, second]]);
  const partnerPairs = partnerAnchors(first).flatMap((firstAnchor) =>
    partnerAnchors(second).map((secondAnchor): [Person, Person] => [firstAnchor, secondAnchor]))
    .filter(([firstAnchor, secondAnchor]) => firstAnchor.id !== first.id || secondAnchor.id !== second.id);
  const candidates = (directCandidates.length ? directCandidates : traceCandidates(partnerPairs))
    .sort((a, b) =>
      (a.firstDistance + a.secondDistance + a.proxyCount) - (b.firstDistance + b.secondDistance + b.proxyCount)
      || a.proxyCount - b.proxyCount
      || Math.max(a.firstDistance, a.secondDistance) - Math.max(b.firstDistance, b.secondDistance)
      || a.familySurnamePenalty - b.familySurnamePenalty
      || a.person.name.localeCompare(b.person.name, "zh-CN"));

  const match = candidates[0];
  const commonAncestor = match?.person;
  if (!match || !commonAncestor) return undefined;

  const descendantBranch = (person: Person, anchor: Person, ancestorSteps: KinshipChainItem[]): KinshipLineageBranch => {
    const descendantIds = anchor.id === commonAncestor.id
      ? []
      : [...ancestorSteps.slice(0, -1).reverse().map((step) => step.personId), anchor.id];
    if (person.id !== anchor.id) descendantIds.push(person.id);
    return {
      personId: person.id,
      name: person.name,
      steps: descendantIds.map((personId) => {
        const descendant = data.people.find((item) => item.id === personId)!;
        const result = resolveKinship(data, commonAncestor.id, personId);
        return {
          personId,
          name: descendant.name,
          relation: result.term,
          canonicalKey: result.canonicalKey,
          isCustom: result.isCustom
        };
      })
    };
  };

  return {
    commonAncestor: { personId: commonAncestor.id, name: commonAncestor.name },
    firstBranch: descendantBranch(first, match.firstAnchor, match.firstPaths.get(commonAncestor.id)!),
    secondBranch: descendantBranch(second, match.secondAnchor, match.secondPaths.get(commonAncestor.id)!)
  };
}

export function resolveKinship(data: FamilyData, egoId: string, targetId: string): KinshipResult {
  const ego = data.people.find((person) => person.id === egoId);
  const target = data.people.find((person) => person.id === targetId);
  if (!ego || !target) return { connected: false, term: "成员不存在", standardTerm: "成员不存在", isCustom: false, chain: [] };
  if (egoId === targetId) return { connected: true, term: "自己", standardTerm: "自己", canonicalKey: "self", isCustom: false, chain: [] };

  const directSpecial = findDirectSpecial(data.relations, egoId, targetId);
  const path = findPath(data, egoId, targetId);
  if (!path && !directSpecial) {
    return { connected: false, term: "暂未找到关系", standardTerm: "暂未找到关系", isCustom: false, chain: [], note: "请先补充两人之间的父母、对象或兄弟姐妹关系" };
  }

  const standard = directSpecial || classifyCore(path!.steps.map((step) => step.direction), [ego, ...path!.steps.map((step) => path!.people.get(step.toId)!)].filter(Boolean));
  const regionalTerm = data.kinshipOverrides?.[standard.key]?.trim();
  const customTerm = standard.customTerm?.trim() || regionalTerm;
  const term = customTerm || standard.standardTerm;
  const chain = path?.steps.map((step) => ({
    personId: step.toId,
    name: path.people.get(step.toId)?.name || "未知成员",
    relation: step.label,
    canonicalKey: step.canonicalKey,
    isCustom: false
  })) || [{
    personId: target.id,
    name: target.name,
    relation: term,
    canonicalKey: standard.key,
    isCustom: Boolean(customTerm)
  }];
  return {
    connected: true,
    term,
    standardTerm: standard.standardTerm,
    canonicalKey: standard.key,
    isCustom: Boolean(customTerm),
    chain,
    note: standard.note
  };
}

export function resolveMutualKinship(data: FamilyData, firstId: string, secondId: string): MutualKinshipResult {
  return {
    firstToSecond: resolveKinship(data, firstId, secondId),
    secondToFirst: resolveKinship(data, secondId, firstId),
    lineageTrace: findLineageTrace(data, firstId, secondId)
  };
}

export function defaultTermForKey(key: string) {
  return catalogTermByKey.get(key) || key;
}
