import type { Locale, Translate } from "./i18n";
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

const traditionalCatalog: Record<string, CatalogTranslation> = {
  father: ["爸爸", "父親"],
  mother: ["媽媽", "母親"],
  son: ["兒子", "男性子女"],
  daughter: ["女兒", "女性子女"],
  paternal_grandfather: ["爺爺", "爸爸的爸爸"],
  paternal_grandmother: ["奶奶", "爸爸的媽媽"],
  maternal_grandfather: ["外公", "媽媽的爸爸"],
  maternal_grandmother: ["外婆", "媽媽的媽媽"],
  grandson: ["孫子", "兒子的兒子"],
  granddaughter: ["孫女", "兒子的女兒"],
  maternal_grandson: ["外孫", "女兒的兒子"],
  maternal_granddaughter: ["外孫女", "女兒的女兒"],
  paternal_older_uncle: ["伯父", "爸爸的哥哥"],
  paternal_younger_uncle: ["叔叔", "爸爸的弟弟"],
  paternal_uncle: ["伯父 / 叔叔", "爸爸的兄弟（長幼未知）"],
  paternal_aunt: ["姑姑", "爸爸的姊妹"],
  maternal_uncle: ["舅舅", "媽媽的兄弟"],
  maternal_aunt: ["姨媽", "媽媽的姊妹"],
  older_brother: ["哥哥", "年長的兄弟"],
  younger_brother: ["弟弟", "年幼的兄弟"],
  older_sister: ["姐姐", "年長的姊妹"],
  younger_sister: ["妹妹", "年幼的姊妹"],
  brothers_son: ["姪子", "兄弟的兒子"],
  brothers_daughter: ["姪女", "兄弟的女兒"],
  sisters_son: ["外甥", "姊妹的兒子"],
  sisters_daughter: ["外甥女", "姊妹的女兒"],
  tang_older_brother: ["堂哥", "伯叔家的年長男性同輩"],
  tang_younger_brother: ["堂弟", "伯叔家的年幼男性同輩"],
  tang_older_sister: ["堂姐", "伯叔家的年長女性同輩"],
  tang_younger_sister: ["堂妹", "伯叔家的年幼女性同輩"],
  biao_older_brother: ["表哥", "姑姨舅家的年長男性同輩"],
  biao_younger_brother: ["表弟", "姑姨舅家的年幼男性同輩"],
  biao_older_sister: ["表姐", "姑姨舅家的年長女性同輩"],
  biao_younger_sister: ["表妹", "姑姨舅家的年幼女性同輩"],
  paternal_grandfather_older_brother: ["伯祖父", "爺爺的哥哥"],
  paternal_grandfather_younger_brother: ["叔祖父", "爺爺的弟弟"],
  paternal_grandfather_brother: ["伯祖父 / 叔祖父", "爺爺的兄弟（長幼未知）"],
  paternal_grandfather_sister: ["姑祖母", "爺爺的姊妹"],
  paternal_grandmother_brother: ["舅祖父", "奶奶的兄弟"],
  paternal_grandmother_sister: ["姨祖母", "奶奶的姊妹"],
  maternal_grandfather_brother: ["外伯祖父 / 外叔祖父", "外公的兄弟"],
  maternal_grandfather_sister: ["外姑祖母", "外公的姊妹"],
  maternal_grandmother_brother: ["外舅祖父", "外婆的兄弟"],
  maternal_grandmother_sister: ["外姨祖母", "外婆的姊妹"],
  husband: ["丈夫", "男性對象"],
  wife: ["妻子", "女性對象"],
  wifes_father: ["岳父", "妻子的父親"],
  wifes_mother: ["岳母", "妻子的母親"],
  husbands_father: ["公公", "丈夫的父親"],
  husbands_mother: ["婆婆", "丈夫的母親"],
  older_brothers_wife: ["嫂子", "哥哥的妻子"],
  younger_brothers_wife: ["弟媳", "弟弟的妻子"],
  older_sisters_husband: ["姐夫", "姐姐的丈夫"],
  younger_sisters_husband: ["妹夫", "妹妹的丈夫"],
  sons_wife: ["兒媳", "兒子的妻子"],
  daughters_husband: ["女婿", "女兒的丈夫"],
  paternal_older_uncles_wife: ["伯母", "伯父的妻子"],
  paternal_younger_uncles_wife: ["嬸嬸", "叔叔的妻子"],
  paternal_aunts_husband: ["姑父", "姑姑的丈夫"],
  maternal_uncles_wife: ["舅媽", "舅舅的妻子"],
  maternal_aunts_husband: ["姨父", "姨媽的丈夫"]
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
  paternal_grandparent: "Paternal grandparent",
  maternal_grandparent: "Maternal grandparent",
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

const extraTraditionalTerms: Record<string, string> = {
  self: "自己",
  parent: "父母",
  child: "子女",
  spouse: "愛人",
  brother: "兄弟",
  sister: "姊妹",
  sibling: "兄弟姊妹",
  adoptive_father: "養父",
  adoptive_mother: "養母",
  adoptive_parent: "養父母",
  adoptive_son: "養子",
  adoptive_daughter: "養女",
  adoptive_child: "養子女",
  guardian: "監護人",
  ward: "受監護人",
  stepdaughter: "繼女",
  stepson: "繼子",
  relative_in_law: "姻親",
  extended_relative: "遠房親屬",
  paternal_sibling: "叔伯姑",
  maternal_sibling: "舅姨",
  paternal_grandparent: "祖輩",
  maternal_grandparent: "外祖輩",
  tang_brother: "堂兄弟",
  tang_sister: "堂姊妹",
  tang_sibling: "堂親同輩",
  biao_brother: "表兄弟",
  biao_sister: "表姊妹",
  biao_sibling: "表親同輩",
  brothers_wife: "嫂子 / 弟媳",
  sisters_husband: "姐夫 / 妹夫",
  tang_older_uncles_wife: "堂伯母",
  tang_younger_uncles_wife: "堂嬸嬸",
  tang_uncles_wife: "堂伯母 / 堂嬸嬸",
  tang_aunts_husband: "堂姑父",
  biao_older_uncles_wife: "表伯母",
  biao_younger_uncles_wife: "表嬸嬸",
  biao_uncles_wife: "表伯母 / 表嬸嬸",
  biao_aunts_husband: "表姑父 / 表姨父"
};

const englishTermByKey: Record<string, string> = {
  ...Object.fromEntries(Object.entries(englishCatalog).map(([key, [label]]) => [key, label])),
  ...extraEnglishTerms
};

const traditionalTermByKey: Record<string, string> = {
  ...Object.fromEntries(Object.entries(traditionalCatalog).map(([key, [label]]) => [key, label])),
  ...extraTraditionalTerms
};

const chineseToEnglish = new Map<string, string>([
  ...kinshipCatalog.map((item) => [item.label, englishTermByKey[item.key]] as const),
  ["父母", "Parent"], ["子女", "Child"], ["爱人", "Spouse"], ["兄弟", "Brother"], ["姐妹", "Sister"],
  ["兄弟姐妹", "Sibling"], ["养父", "Adoptive father"], ["养母", "Adoptive mother"], ["养父母", "Adoptive parent"],
  ["养子", "Adopted son"], ["养女", "Adopted daughter"], ["养子女", "Adopted child"], ["监护人", "Guardian"],
  ["被监护人", "Ward"], ["自己", "Self"], ["姻亲", "Relative by marriage"], ["远房亲属", "Extended relative"],
  ["成员不存在", "Member not found"], ["暂未找到关系", "No relationship found"], ["自定义关系", "Custom relationship"]
]);

const chineseToTraditional = new Map<string, string>([
  ...kinshipCatalog.map((item) => [item.label, traditionalTermByKey[item.key]] as const),
  ["父母", "父母"], ["子女", "子女"], ["爱人", "愛人"], ["兄弟", "兄弟"], ["姐妹", "姊妹"],
  ["兄弟姐妹", "兄弟姊妹"], ["堂亲同辈", "堂親同輩"], ["表亲同辈", "表親同輩"],
  ["养父", "養父"], ["养母", "養母"], ["养父母", "養父母"],
  ["养子", "養子"], ["养女", "養女"], ["养子女", "養子女"], ["监护人", "監護人"],
  ["被监护人", "受監護人"], ["自己", "自己"], ["姻亲", "姻親"], ["远房亲属", "遠房親屬"],
  ["成员不存在", "未知成員"], ["暂未找到关系", "尚未找到關係"], ["自定义关系", "自訂關係"],
  ["侄子", "姪子"], ["侄女", "姪女"], ["侄辈", "姪輩"],
  ["继女", "繼女"], ["继子", "繼子"],
  ["大舅子", "大舅子"], ["小舅子", "小舅子"], ["内兄弟", "內兄弟"],
  ["大姨子", "大姨子"], ["小姨子", "小姨子"], ["姨姐/姨妹", "姨姐/姨妹"],
  ["大伯子", "大伯子"], ["小叔子", "小叔子"], ["伯叔", "伯叔"], ["姑姐/姑妹", "姑姐/姑妹"]
]);

const ancestorGenerationNames = ["", "", "祖", "曾祖", "高祖", "天祖", "烈祖", "太祖", "遠祖", "鼻祖"];
const descendantGenerationNames = ["", "", "孫", "曾孫", "玄孫", "來孫", "晜孫", "仍孫", "雲孫", "耳孫"];

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
      const [label, description] = traditionalCatalog[item.key] || [item.label, item.description];
      return { ...item, label, description, group: groupLabel(item.group, t) };
    }
    return { ...item, group: groupLabel(item.group, t) };
  });
}

export function localizedKinshipPresets(locale: Locale) {
  if (locale === "en") {
    return [
      { ...kinshipPresets[0], label: `Grandfather's sister → ${kinshipPresets[0].term}` },
      { ...kinshipPresets[1], label: `Father's sister → ${kinshipPresets[1].term}` },
      { ...kinshipPresets[2], label: `Father's younger brother → ${kinshipPresets[2].term}` }
    ];
  }
  if (locale === "zh-TW") {
    return [
      { ...kinshipPresets[0], label: `爺爺的姊妹 → ${kinshipPresets[0].term}` },
      { ...kinshipPresets[1], label: `爸爸的姊妹 → ${kinshipPresets[1].term}` },
      { ...kinshipPresets[2], label: `爸爸的弟弟 → ${kinshipPresets[2].term}` }
    ];
  }
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

function traditionalDescendantTerm(depth: number, gender: string, throughDaughter: boolean) {
  const generationName = descendantGenerationNames[depth] || `第 ${depth} 代孫`;
  const genderSuffix = gender === "female" ? "女" : gender === "male" ? "" : "輩";
  return `${throughDaughter ? "外" : ""}${generationName}${genderSuffix}`;
}

function englishFallbackForKey(key: string): string {
  if (key.startsWith("custom_relation_")) return "Custom relationship";

  if (key.startsWith("adoptive_")) {
    const base: string = englishTermByKey[key.slice("adoptive_".length)] || englishFallbackForKey(key.slice("adoptive_".length));
    return `Adoptive ${base.charAt(0).toLowerCase()}${base.slice(1)}`;
  }

  const ancestor = key.match(/^(maternal|paternal)_(?:ancestor_(\d+)|great_grand)(mother|father|relative)$/);
  if (ancestor) {
    const side = ancestor[1] === "maternal" ? "Maternal" : "Paternal";
    const gender = ancestor[3] === "mother" ? "mother" : ancestor[3] === "father" ? "father" : "relative";
    if (ancestor[2]) return `${side} ${ancestor[2]}-generation ancestor (${gender})`;
    return `${side} great-grand${gender === "relative" ? "parent" : gender}`;
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

function traditionalFallbackForKey(key: string): string {
  if (key.startsWith("custom_relation_")) return "自訂關係";

  if (key.startsWith("adoptive_")) {
    const base = traditionalTermByKey[key.slice("adoptive_".length)] || traditionalFallbackForKey(key.slice("adoptive_".length));
    return base.startsWith("養") ? base : `養${base}`;
  }

  const ancestor = key.match(/^(maternal|paternal)_(?:ancestor_(\d+)|great_grand)(mother|father|relative)$/);
  if (ancestor) {
    const maternal = ancestor[1] === "maternal";
    const depth = ancestor[2] ? Number(ancestor[2]) : 3;
    const generationName = ancestorGenerationNames[depth] || `第 ${depth} 代祖`;
    const genderSuffix = ancestor[3] === "mother" ? "母" : ancestor[3] === "father" ? "父" : "輩";
    return `${maternal ? "外" : ""}${generationName}${genderSuffix}`;
  }

  const descendant = key.match(/^(maternal_)?descendant_(\d+)_(male|female|other|unknown)$/);
  if (descendant) return traditionalDescendantTerm(Number(descendant[2]), descendant[3], Boolean(descendant[1]));

  const grandCollateral = key.match(/^(maternal|paternal)_(grandfather|grandmother)_(?:(older|younger)_)?(brother|sister|sibling)$/);
  if (grandCollateral) {
    const maternal = grandCollateral[1] === "maternal";
    const fromGrandfather = grandCollateral[2] === "grandfather";
    const age = grandCollateral[3];
    const relative = grandCollateral[4];
    if (relative === "sister") return `${maternal ? "外" : ""}${fromGrandfather ? "姑祖母" : "姨祖母"}`;
    if (relative === "sibling") return "祖輩的兄弟姊妹";
    if (!fromGrandfather) return `${maternal ? "外" : ""}舅祖父`;
    if (age === "older") return `${maternal ? "外" : ""}伯祖父`;
    if (age === "younger") return `${maternal ? "外" : ""}叔祖父`;
    return `${maternal ? "外" : ""}伯祖父 / ${maternal ? "外" : ""}叔祖父`;
  }

  const siblingDescendant = key.match(/^(brothers|sisters)_descendant_(\d+)_(male|female|other|unknown)$/);
  if (siblingDescendant) {
    const depth = Number(siblingDescendant[2]);
    const generation = depth === 2 ? "孫" : depth === 3 ? "曾孫" : `第 ${depth} 代孫`;
    const prefix = siblingDescendant[1] === "sisters" ? "外甥" : "姪";
    const genderSuffix = siblingDescendant[3] === "female" ? "女" : siblingDescendant[3] === "male" ? "" : "輩";
    return `${prefix}${generation}${genderSuffix}`;
  }

  const distantCousin = key.match(/^distant_cousin_(\d+)_(male|female|other|unknown)$/);
  if (distantCousin) {
    const prefix = Number(distantCousin[1]) === 2 ? "再從" : `${distantCousin[1]}從`;
    const peer = distantCousin[2] === "female" ? "姊妹" : distantCousin[2] === "male" ? "兄弟" : "同輩";
    return `${prefix}${peer}`;
  }

  const cousinYounger = key.match(/^(tang|biao)_(niece|nephew)$/);
  if (cousinYounger) {
    const prefix = cousinYounger[1] === "tang" ? "堂" : "表";
    return `${prefix}姪${cousinYounger[2] === "niece" ? "女" : "子"}`;
  }

  const cousinOlder = key.match(/^(tang|biao)_parent_(older|younger|unknown)?_?(uncle|aunt|relative)$/);
  if (cousinOlder) {
    const prefix = cousinOlder[1] === "tang" ? "堂" : "表";
    if (cousinOlder[3] === "aunt") return `${prefix}${cousinOlder[1] === "tang" ? "姑" : "姑姨"}`;
    if (cousinOlder[3] === "relative") return `${prefix}叔伯姑輩`;
    if (cousinOlder[2] === "older") return `${prefix}伯父`;
    if (cousinOlder[2] === "younger") return `${prefix}叔父`;
    return `${prefix}伯父 / ${prefix}叔父`;
  }

  if (/^wifes_(?:older|younger|unknown)_brother$/.test(key)) {
    if (key.includes("older")) return "大舅子";
    if (key.includes("younger")) return "小舅子";
    return "內兄弟";
  }
  if (/^wifes_(?:older|younger|unknown)_sister$/.test(key)) {
    if (key.includes("older")) return "大姨子";
    if (key.includes("younger")) return "小姨子";
    return "姨姐/姨妹";
  }
  if (/^husbands_(?:older|younger|unknown)_brother$/.test(key)) {
    if (key.includes("older")) return "大伯子";
    if (key.includes("younger")) return "小叔子";
    return "伯叔";
  }
  if (/^husbands_(?:older|younger|unknown)_sister$/.test(key)) {
    if (key.includes("older")) return "大姑子";
    if (key.includes("younger")) return "小姑子";
    return "姑姐/姑妹";
  }

  const distantGeneration = key.match(/^distant_(elder|younger)_(\d+)_/);
  if (distantGeneration) {
    const gap = Number(distantGeneration[2]);
    if (distantGeneration[1] === "elder") {
      const level = gap === 1 ? "叔伯姑姨" : gap === 2 ? "叔祖姑祖" : `${gap} 代旁系長輩`;
      return `遠房${level}`;
    }
    const level = gap === 1 ? "姪輩" : gap === 2 ? "姪孫輩" : `${gap} 代旁系晚輩`;
    return `遠房${level}`;
  }

  if (key === "relative_in_law") return "姻親";
  return "遠房親屬";
}

function localizeCompoundTraditional(source: string, canonicalKey?: string) {
  const partnerSuffix = source.match(/^(.+)的对象$/);
  if (partnerSuffix) {
    const base = chineseToTraditional.get(partnerSuffix[1]) || partnerSuffix[1];
    return `${base}的對象`;
  }
  const adoptivePrefix = source.match(/^养(.+)$/);
  if (adoptivePrefix) {
    if (canonicalKey?.startsWith("adoptive_")) return traditionalFallbackForKey(canonicalKey);
    const base = chineseToTraditional.get(adoptivePrefix[1]);
    return base ? `養${base}` : undefined;
  }
  return undefined;
}

export function localizeKinshipTerm(source: string, canonicalKey: string | undefined, locale: Locale) {
  if (locale === "zh-CN") return source;
  if (locale === "zh-TW") {
    return chineseToTraditional.get(source)
      || localizeCompoundTraditional(source, canonicalKey)
      || traditionalTermByKey[canonicalKey || ""]
      || (canonicalKey ? traditionalFallbackForKey(canonicalKey) : undefined)
      || source;
  }
  return englishTermByKey[canonicalKey || ""] || chineseToEnglish.get(source) || (canonicalKey ? englishFallbackForKey(canonicalKey) : "Extended relative");
}

export function localizeKinshipResultTerm(result: KinshipResult, locale: Locale) {
  return result.isCustom ? result.term : localizeKinshipTerm(result.term, result.canonicalKey, locale);
}

function localizeNotePart(note: string, locale: Locale) {
  const cousinDegree = note.match(/属于第 (\d+) 代表亲/);
  if (cousinDegree) {
    return locale === "zh-TW" ? `屬於第 ${cousinDegree[1]} 代表親` : `${ordinal(Number(cousinDegree[1]))} cousin`;
  }
  if (note.includes("出生日期") && note.includes("长幼")) {
    return locale === "zh-TW" ? "尚未登錄完整出生日期，暫不區分長幼" : "Complete birth dates are unavailable, so relative age cannot be determined.";
  }
  if (note.includes("关系路径")) {
    return locale === "zh-TW" ? "遠房關係請以關係路徑為準。" : "Use the relationship path as the source of truth.";
  }
  if (note.includes("地区而异")) {
    return locale === "zh-TW" ? "姻親稱呼會因地區而異。" : "This term varies by region.";
  }
  if (note.includes("随对象称呼")) {
    return locale === "zh-TW" ? "隨配偶的稱呼。" : "Uses the spouse's form of address.";
  }
  if (note.includes("请先补充")) {
    return locale === "zh-TW" ? "請先補上兩人之間的父母、配偶或兄弟姊妹關係。" : "Add parent, spouse, or sibling relationships between these people first.";
  }
  return locale === "zh-TW" ? note : "See the relationship path for details.";
}

export function localizeKinshipNote(note: string | undefined, locale: Locale) {
  if (!note || locale === "zh-CN") return note;
  const separator = locale === "zh-TW" ? "；" : "; ";
  return note.split("；").map((part) => localizeNotePart(part, locale)).join(separator);
}

export function localizeChainRelation(item: KinshipChainItem, locale: Locale) {
  if (item.isCustom) return item.relation;
  return localizeKinshipTerm(item.relation, item.canonicalKey, locale);
}
