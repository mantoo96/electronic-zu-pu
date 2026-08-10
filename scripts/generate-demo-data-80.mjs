import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

// ============================================================
// 80 人 · 9 代 · 1826 ~ 2025（近 200 年）演示数据生成器
// 结构：每代人数 2→4→6→8→10→12→14→16→8，金字塔式扩张。
// 奇数编号为陈氏血亲（男性），偶数编号为配偶（随夫姓改嫁入其他姓氏），
// 第 1~4 代全部离世、第 5 代部分离世，第 6 代以后在世。
// ============================================================

// ---------- 姓名 ----------
// 血亲（奇数 id，姓陈）的男性名字
const maleGivenNames = [
  "敬堂", "国安", "国平", "国华", "建军", "建民", "志强", "志敏", "思远", "宇航",
  "泽宇", "嘉豪", "子涵", "明哲", "天佑", "星辰", "可为", "云舟", "念初", "景行",
  "家兴", "世荣", "光耀", "承志", "绍先", "裕昆", "立言", "明德", "思源", "正本",
  "清源", "修远", "敬亭", "允文", "启后", "守成", "立德", "立功", "传芳", "继业",
  "开泰", "永昌", "文远", "武安"
];
// 配偶（偶数 id）的姓氏与女性名字
const spouseSurnames = [
  "王", "李", "张", "刘", "杨", "黄", "周", "吴", "徐", "孙",
  "马", "朱", "胡", "郭", "何", "高", "林", "罗", "郑", "梁",
  "谢", "宋", "唐", "许", "韩", "冯", "邓", "曹", "彭", "曾",
  "肖", "田", "董", "袁", "潘", "蒋"
];
const femaleGivenNames = [
  "秀兰", "慧芳", "淑贞", "素梅", "桂英", "玉珍", "金莲", "春兰", "秋月", "冬梅",
  "碧云", "翠华", "明珠", "锦书", "芳华", "静怡", "雅琴", "丽娟", "晓霞", "瑞芳",
  "婉清", "素心", "云锦", "雪梅", "月华", "书香", "文静", "惠娟", "英华", "巧云",
  "凤英", "桂香", "玉莲", "秀英", "兰芳", "淑华"
];
// 第 9 代（73~80 号）陈姓孩子，男女交替
const childGivenNames = [
  "一诺", "安然", "乐言", "沐阳", "知夏", "书瑶", "可为", "星辰"
];
const childGenders = ["female", "male", "female", "male", "female", "male", "female", "male"];

// ---------- 出生年份（1826 → 2025，每代约 25 年） ----------
// id 1~80 的出生年。奇数位血亲早于配偶 1~2 年出生。
const birthYearByGen = {
  1: 1826, 2: 1850, 3: 1876, 4: 1900, 5: 1924, 6: 1948, 7: 1968, 8: 2000, 9: 2022
};
const genStartId = {
  1: 1, 2: 3, 3: 7, 4: 13, 5: 21, 6: 31, 7: 43, 8: 57, 9: 73
};
const genEndId = {
  1: 2, 2: 6, 3: 12, 4: 20, 5: 30, 6: 42, 7: 56, 8: 72, 9: 80
};

const generationById = (id) => {
  for (let gen = 1; gen <= 9; gen += 1) {
    if (id >= genStartId[gen] && id <= genEndId[gen]) return gen;
  }
  return 9;
};

// 每位成员出生年：血亲（奇数）按代内序号逐年 +2，配偶紧随血亲 +1
// 第 9 代是纯孩子代（73~80 全部为陈氏血亲，男女交替），出生 2022~2025
const birthYears = Array.from({ length: 80 }, (_, index) => {
  const id = index + 1;
  const gen = generationById(id);
  const base = birthYearByGen[gen];
  if (gen === 9) return base + Math.floor((id - 73) / 2);
  const siblings = [...Array(genEndId[gen] - genStartId[gen] + 1).keys()].map((i) => genStartId[gen] + i);
  const bloodIndex = siblings.filter((sid) => sid % 2 === 1).indexOf(id);
  const spouseOf = id % 2 === 0 ? id - 1 : null;
  if (id % 2 === 1) return base + (bloodIndex >= 0 ? bloodIndex * 2 : 0);
  const spouseBloodIndex = siblings.filter((sid) => sid % 2 === 1).indexOf(spouseOf);
  return base + (spouseBloodIndex >= 0 ? spouseBloodIndex * 2 + 1 : 1);
});

// ---------- 生卒 ----------
// 第 1~4 代全部离世（寿命 72~87 岁，确定性公式）；
// 第 5 代：1924~1930 年出生者（前 4 人）离世，其余在世；
// 第 6 代及以后在世。
const isDeceased = (id) => {
  const gen = generationById(id);
  if (gen <= 4) return true;
  if (gen === 5) return birthYears[id - 1] < 1931;
  return false;
};
const deathYearOf = (id) => {
  const birth = birthYears[id - 1];
  const lifespan = 72 + ((id * 7) % 16); // 72~87 岁
  return birth + lifespan;
};

// ---------- 资料字段 ----------
const locations = ["浙江杭州", "江苏苏州", "上海", "安徽黄山", "广东深圳", "北京", "四川成都", "福建厦门", "湖北武汉", "陕西西安", "湖南永州", "江苏南京"];
const adultOccupations = ["教师", "医生", "工程师", "会计", "木匠", "裁缝", "摄影师", "厨师", "建筑师", "公务员", "设计师", "程序员", "记者", "园艺师", "个体经营", "粮农"];
const elderOccupations = ["私塾先生", "铁匠", "地主", "船工", "郎中", "木匠", "织布工", "货郎"];
const studentLabels = ["幼儿园学生", "小学生", "中学生"];
const lifeNotes = [
  "热爱阅读与地方历史，喜欢整理老照片。",
  "性格温和，擅长烹饪，是家庭聚会的组织者。",
  "工作认真，闲暇时喜欢书法和旅行。",
  "喜欢音乐、运动，也常参与社区活动。",
  "重视家庭教育，保存了许多家族口述故事。",
  "一生勤劳朴素，晚年仍坚持每天晨练。"
];

const people = Array.from({ length: 80 }, (_, index) => {
  const id = index + 1;
  const gen = generationById(id);
  const isBlood = id % 2 === 1 || gen === 9; // 奇数号或第 9 代都是陈氏血亲
  const isChild = gen === 9;
  const deceased = isDeceased(id);
  const birthYear = birthYears[index];
  const now = 2026;

  let name;
  if (gen === 9) {
    name = `陈${childGivenNames[index - (genStartId[9] - 1)]}`;
  } else if (isBlood) {
    name = `陈${maleGivenNames[(id - 1) / 2 % maleGivenNames.length]}`;
  } else {
    const spouseIndex = (id - 2) / 2;
    name = `${spouseSurnames[spouseIndex % spouseSurnames.length]}${femaleGivenNames[spouseIndex % femaleGivenNames.length]}`;
  }

  const gender = gen === 9 ? childGenders[index - (genStartId[9] - 1)] : (isBlood ? "male" : "female");
  const age = now - birthYear;
  const occupation = isChild
    ? studentLabels[index % studentLabels.length]
    : age >= 75
      ? (deceased ? elderOccupations[index % elderOccupations.length] : "退休")
      : adultOccupations[index % adultOccupations.length];

  return {
    id: `demo80-person-${String(id).padStart(2, "0")}`,
    name,
    gender,
    birthDate: `${birthYear}-${String((id * 3) % 12 + 1).padStart(2, "0")}-${String((id * 7) % 27 + 1).padStart(2, "0")}`,
    deathDate: deceased ? `${deathYearOf(id)}-${String((id * 5) % 12 + 1).padStart(2, "0")}-${String((id * 11) % 27 + 1).padStart(2, "0")}` : "",
    isLiving: !deceased,
    avatar: "",
    phone: !deceased && age >= 18 ? `1380000${String(id).padStart(4, "0")}` : "",
    location: locations[index % locations.length],
    occupation,
    generation: gen,
    biography: `${name}是陈氏九代演示族谱中的虚构成员（第 ${gen} 代，${birthYear} 年生${deceased ? "，已故" : ""}）。${lifeNotes[index % lifeNotes.length]}`,
    createdAt: "2026-08-01T08:00:00.000Z",
    updatedAt: "2026-08-01T08:00:00.000Z"
  };
});

// ---------- 关系 ----------
let relationIndex = 1;
const relations = [];
const personId = (id) => `demo80-person-${String(id).padStart(2, "0")}`;
const addRelation = (from, to, type, label = "") => relations.push({
  id: `demo80-relation-${String(relationIndex++).padStart(3, "0")}`,
  fromPersonId: personId(from),
  toPersonId: personId(to),
  type,
  label,
  startDate: "",
  endDate: "",
  createdAt: "2026-08-01T08:00:00.000Z"
});

// 每代夫妻（配偶关系）
const couples = [];
for (let gen = 1; gen <= 8; gen += 1) {
  const count = gen; // 第 gen 代有 gen 对夫妻（1~8 代分别为 1~8 对）
  for (let i = 0; i < count; i += 1) {
    const bloodId = genStartId[gen] + i * 2;
    couples.push([bloodId, bloodId + 1]);
  }
}
couples.forEach(([left, right]) => addRelation(left, right, "spouse"));

// 父母子女：第 n 代的第 i 对夫妻，生育第 n+1 代血亲；
// 早期代每对 2 个孩子，末代每对 1 个，其余按均衡分配。
const families = [];
for (let gen = 1; gen <= 8; gen += 1) {
  const coupleCount = gen;
  const nextGenBloodIds = [];
  // 第 9 代是纯孩子代，全部成员都是血亲；其余代只取奇数（血亲）编号
  const step = gen === 8 ? 1 : 2;
  for (let i = genStartId[gen + 1]; i <= genEndId[gen + 1]; i += step) nextGenBloodIds.push(i);
  // 把孩子依次分给各对夫妻（余数补到最后一对）
  let start = 0;
  for (let c = 0; c < coupleCount; c += 1) {
    const base = Math.floor(nextGenBloodIds.length / coupleCount);
    const extra = c < (nextGenBloodIds.length % coupleCount) ? 1 : 0;
    const take = base + extra;
    const children = nextGenBloodIds.slice(start, start + take);
    start += take;
    if (children.length) families.push([couples[gen - 1][0], couples[gen - 1][1], children]);
  }
}
families.forEach(([father, mother, children]) => {
  children.forEach((child) => {
    addRelation(father, child, "parent");
    addRelation(mother, child, "parent");
  });
});

// ---------- 输出 ----------
const database = {
  surname: "陈",
  familyName: "陈氏九代演示族谱",
  brandMark: "陈",
  subtitle: "九代两百年 · 虚构测试数据",
  description: "包含 80 位虚构成员、36 对夫妻，覆盖 1826 至 2025 近两百年的九代谱系，含已故成员，用于展示与压力测试。",
  people,
  relations,
  updatedAt: "2026-08-01T08:00:00.000Z"
};

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const outputPath = path.resolve(currentDir, "../examples/family-tree-80.demo.json");
await mkdir(path.dirname(outputPath), { recursive: true });
await writeFile(outputPath, `${JSON.stringify(database, null, 2)}\n`, "utf8");

const importArg = process.argv.indexOf("--import");
if (importArg >= 0) {
  const portArg = process.argv.indexOf("--port");
  const port = portArg >= 0 ? process.argv[portArg + 1] : "3000";
  const response = await fetch(`http://localhost:${port}/api/import`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(database)
  });
  if (!response.ok) throw new Error(`导入失败：HTTP ${response.status}`);
  console.log(`已导入到 http://localhost:${port}`);
}

const deceasedCount = people.filter((p) => !p.isLiving).length;
const years = [Math.min(...people.map((p) => parseInt(p.birthDate, 10))), Math.max(...people.map((p) => parseInt(p.birthDate, 10)))];
console.log(`已生成 ${people.length} 位成员、${relations.length} 条关系：${outputPath}`);
console.log(`  年代跨度 ${years[0]} ~ ${years[1]}（${years[1] - years[0]} 年）| 已故 ${deceasedCount} 人 | 在世 ${people.length - deceasedCount} 人`);
