import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const names = [
  "陈敬堂", "林秀兰",
  "陈国安", "周慧琴", "陈国平", "叶梅芳", "陈国华", "赵文斌",
  "陈建军", "吴丽珍", "陈建民", "孙雅静", "陈晓红", "刘志远", "陈晓东", "黄春燕", "赵海峰", "郑雪梅", "赵海燕", "王新明",
  "陈志强", "李婉婷", "陈志敏", "徐浩然", "陈思远", "方雨晴", "陈思琪", "高俊杰", "刘晨曦", "陈宇航",
  "刘泽宇", "唐可欣", "陈嘉豪", "罗欣怡", "赵子涵", "何明哲", "赵天佑", "蒋梦瑶", "王若琳", "胡景行",
  "陈一诺", "陈星辰", "陈安然", "陈乐言", "刘书瑶", "刘沐阳", "陈可为", "赵知夏", "赵云舟", "王念初"
];

const genders = [
  "male", "female",
  "male", "female", "male", "female", "female", "male",
  "male", "female", "male", "female", "female", "male", "male", "female", "male", "female", "female", "male",
  "male", "female", "female", "male", "male", "female", "female", "male", "female", "male",
  "male", "female", "male", "female", "female", "male", "male", "female", "female", "male",
  "female", "male", "female", "male", "female", "male", "male", "female", "male", "female"
];

const birthYears = [
  1932, 1935,
  1955, 1957, 1958, 1960, 1962, 1959,
  1978, 1980, 1981, 1983, 1982, 1980, 1985, 1986, 1984, 1987, 1988, 1986,
  1999, 2000, 2001, 1998, 2003, 2002, 2004, 2001, 2005, 2003,
  2006, 2005, 2007, 2006, 2008, 2005, 2008, 2007, 2009, 2006,
  2021, 2021, 2022, 2022, 2023, 2023, 2024, 2024, 2025, 2025
];

const generationById = (id) => id <= 2 ? 1 : id <= 8 ? 2 : id <= 20 ? 3 : id <= 40 ? 4 : 5;
const locations = ["浙江杭州", "江苏苏州", "上海", "安徽黄山", "广东深圳", "北京", "四川成都", "福建厦门", "湖北武汉", "陕西西安"];
const adultOccupations = ["教师", "医生", "工程师", "会计", "木匠", "裁缝", "摄影师", "厨师", "建筑师", "公务员", "设计师", "程序员", "记者", "园艺师", "个体经营"];
const childLabels = ["幼儿园学生", "小学生", "在家成长"];
const lifeNotes = [
  "热爱阅读与地方历史，喜欢整理老照片。",
  "性格温和，擅长烹饪，是家庭聚会的组织者。",
  "工作认真，闲暇时喜欢书法和旅行。",
  "喜欢音乐、运动，也常参与社区活动。",
  "重视家庭教育，保存了许多家族口述故事。"
];

const people = names.map((name, index) => {
  const idNumber = index + 1;
  const generation = generationById(idNumber);
  const birthYear = birthYears[index];
  const isLiving = idNumber !== 1;
  const isChild = generation === 5;
  return {
    id: `demo-person-${String(idNumber).padStart(2, "0")}`,
    name,
    gender: genders[index],
    birthDate: `${birthYear}-${String((idNumber * 3) % 12 + 1).padStart(2, "0")}-${String((idNumber * 7) % 27 + 1).padStart(2, "0")}`,
    deathDate: isLiving ? "" : "2018-09-16",
    isLiving,
    avatar: "",
    phone: !isChild && isLiving ? `1380000${String(idNumber).padStart(4, "0")}` : "",
    location: locations[index % locations.length],
    occupation: isChild ? childLabels[index % childLabels.length] : adultOccupations[index % adultOccupations.length],
    generation,
    biography: `${name}是陈氏五代演示族谱中的虚构成员。${lifeNotes[index % lifeNotes.length]}`,
    createdAt: `2026-01-${String(index % 28 + 1).padStart(2, "0")}T08:00:00.000Z`,
    updatedAt: "2026-07-14T00:00:00.000Z"
  };
});

let relationIndex = 1;
const relations = [];
const personId = (id) => `demo-person-${String(id).padStart(2, "0")}`;
const addRelation = (from, to, type, label = "") => relations.push({
  id: `demo-relation-${String(relationIndex++).padStart(3, "0")}`,
  fromPersonId: personId(from),
  toPersonId: personId(to),
  type,
  label,
  startDate: "",
  endDate: "",
  createdAt: "2026-07-14T00:00:00.000Z"
});

const couples = [
  [1, 2], [3, 4], [5, 6], [7, 8],
  [9, 10], [11, 12], [13, 14], [15, 16], [17, 18], [19, 20],
  [21, 22], [23, 24], [25, 26], [27, 28], [29, 30], [31, 32], [33, 34], [35, 36], [37, 38], [39, 40]
];
couples.forEach(([left, right]) => addRelation(left, right, "spouse"));

const families = [
  [1, 2, [3, 5, 7]],
  [3, 4, [9, 11]], [5, 6, [13, 15]], [7, 8, [17, 19]],
  [9, 10, [21, 23]], [11, 12, [25, 27]], [13, 14, [29, 31]], [15, 16, [33]], [17, 18, [35, 37]], [19, 20, [39]],
  [21, 22, [41]], [23, 24, [42]], [25, 26, [43]], [27, 28, [44]], [29, 30, [45]],
  [31, 32, [46]], [33, 34, [47]], [35, 36, [48]], [37, 38, [49]], [39, 40, [50]]
];
families.forEach(([father, mother, children]) => {
  children.forEach((child) => {
    addRelation(father, child, "parent");
    addRelation(mother, child, "parent");
  });
});

const database = {
  surname: "陈",
  familyName: "陈氏五代演示族谱",
  brandMark: "陈",
  subtitle: "五代同堂 · 虚构测试数据",
  description: "包含 50 位虚构成员、20 对夫妻和完整父母子女链路，用于展示与压力测试。",
  people,
  relations,
  updatedAt: "2026-07-14T00:00:00.000Z"
};

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const outputPath = path.resolve(currentDir, "../examples/family-tree-50.demo.json");
await mkdir(path.dirname(outputPath), { recursive: true });
await writeFile(outputPath, `${JSON.stringify(database, null, 2)}\n`, "utf8");

if (process.argv.includes("--import")) {
  const response = await fetch("http://localhost:3000/api/import", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(database)
  });
  if (!response.ok) throw new Error(`导入失败：HTTP ${response.status}`);
}

console.log(`已生成 ${people.length} 位成员、${relations.length} 条关系：${outputPath}`);
