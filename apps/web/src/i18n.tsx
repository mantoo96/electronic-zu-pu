import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type Locale = "zh-CN" | "zh-TW" | "en";

const zhCN = {
  unknownMember: "未知成员",
  requestFailed: "请求失败",
  actionFailed: "操作失败，请稍后重试",
  adminNotConfiguredError: "管理员密码尚未配置",
  tooManyLoginAttempts: "登录尝试次数过多，请 15 分钟后再试",
  invalidAdminPassword: "管理员密码不正确",
  adminRequired: "仅管理员可以执行此操作，请先进入管理模式",
  relationMemberNotFound: "关系中的成员不存在",
  relationAlreadyExists: "该关系已经存在",
  relationNotFound: "关系不存在",
  invalidImportFormat: "导入文件格式不正确",
  invalidInput: "输入内容有误，请检查后重试",
  serverError: "服务器内部错误",
  adminModeEntered: "已进入管理模式",
  browseModeEntered: "已切换到浏览模式",
  deletePersonConfirm: "确定删除“{name}”吗？与其相连的关系也会一并删除。",
  deleteRelationConfirm: "确定删除这条亲属关系吗？",
  settingsSaved: "族谱设置已保存",
  importConfirm: "导入会覆盖当前全部族谱数据，确定继续吗？",
  invalidJson: "文件不是有效的 JSON 数据",
  loadingBrand: "枝脉",
  loading: "正在展开家族脉络…",
  pageTitle: "枝脉 · 电子族谱",
  pageDescription: "可私有部署的电子族谱和亲属关系图",
  openMembers: "打开成员列表",
  closeMembers: "关闭成员列表",
  defaultSubtitle: "电子族谱 · 枝脉相承",
  memberCount: "{count} 位成员",
  relationCount: "{count} 条关系",
  exitAdmin: "退出管理模式",
  adminLogin: "管理员登录",
  adminMode: "管理模式",
  browseMode: "浏览",
  kinshipButtonTitle: "在主图中选两个人，查询双方称呼",
  exitQuery: "退出查询",
  queryKinship: "查称呼",
  viewGenerationPoem: "查看字辈",
  generationPoem: "字辈",
  addRelation: "添加关系",
  addMember: "添加成员",
  familyMembers: "家族成员",
  searchPlaceholder: "搜索姓名、职业、居住地",
  generationNumber: "第 {count} 代",
  infoPending: "资料待补充",
  noSearchResults: "没有找到匹配成员",
  noMembers: "尚未添加成员",
  exportBackup: "导出备份",
  importData: "导入数据",
  settings: "设置",
  familySettings: "族谱设置",
  readOnlyMode: "当前为浏览模式",
  queryingKinship: "正在查询称呼",
  lineageOverview: "本家直系脉络",
  familyOverview: "家族关系全景",
  queryCompleteHint: "已显示双方称呼 · 点其他成员可重新开始",
  querySecondHint: "请再点一位成员 · 再点已选成员可取消",
  queryFirstHint: "请依次点击主图中的两位成员",
  lineageHint: "已隐藏 {count} 位对象 · 点击成员查看资料",
  graphHint: "滚轮缩放 · 拖动画布 · 点击成员查看资料",
  graphViewLabel: "关系图展示模式",
  fullTree: "全谱",
  directLine: "纯直",
  directLineTitle: "隐藏对象，仅展示本家上下代关系",
  familyMember: "家族成员",
  edit: "编辑",
  connect: "连接",
  delete: "删除",
  lifespan: "生卒",
  unknown: "未知",
  present: "今",
  location: "居住地",
  biography: "人物小传",
  relationships: "亲属关系",
  deleteRelationship: "删除关系",
  noRelationships: "尚未连接亲属关系",
  memberMeta: "MEMBER",
  relationMeta: "RELATION",
  settingsMeta: "SETTINGS",
  adminMeta: "ADMIN",
  editMember: "编辑成员资料",
  addFamilyMember: "添加家族成员",
  createRelationship: "建立亲属关系",
  languageAndDisplay: "语言与显示",
  languageHelp: "语言偏好只保存在当前浏览器，不会修改族谱数据。",
  simplifiedChinese: "简体中文",
  traditionalChinese: "繁體中文",
  english: "English",
  adminSettingsHelp: "族谱资料与地域称呼仅可由管理员修改。",
  surname: "家族姓氏",
  surnamePlaceholder: "例如：陈",
  sealCharacter: "印章字 *",
  familyName: "族谱名称 *",
  topSubtitle: "顶部副标题",
  subtitlePlaceholder: "例如：电子族谱 · 血脉相承",
  familyDescription: "族谱简介",
  generationText: "字辈诗文",
  generationPlaceholder: "例如：源远流长枝脉相承（无需空格，自动按字展示）",
  privacyTitle: "隐私提示",
  privacyBody: "本项目不会主动上传数据，但导出的备份包含全部成员资料。将仓库公开到 GitHub 时，请勿提交 data 目录中的私人数据。",
  cancel: "取消",
  close: "关闭",
  saveSettings: "保存设置",
  name: "姓名 *",
  namePlaceholder: "例如：{surname}立山",
  gender: "性别",
  genderUnknown: "未填写",
  genderMale: "男",
  genderFemale: "女",
  genderOther: "其他",
  generation: "世代",
  generationInputPlaceholder: "如：3",
  birthDate: "出生日期",
  living: "目前健在",
  deathDate: "离世日期",
  occupation: "职业",
  occupationPlaceholder: "职业或身份",
  locationPlaceholder: "城市、乡镇",
  phone: "联系电话",
  phonePlaceholder: "仅存于您的服务器",
  avatarUrl: "头像网址",
  biographyPlaceholder: "记录生平、故事、迁徙经历或值得传承的记忆……",
  saving: "保存中…",
  saveChanges: "保存修改",
  relationDirectionHint: "“父母、养父母、监护人”是有方向的关系，请将长辈或监护人放在前面。",
  relationType: "关系类型 *",
  parentOne: "父亲 / 母亲",
  adoptiveParentOne: "养父 / 养母",
  guardianOne: "监护人",
  firstMember: "成员一",
  child: "子女",
  adoptiveChild: "养子女",
  ward: "被监护人",
  secondMember: "成员二",
  select: "请选择",
  customTerm: "自定义称谓",
  customTermPlaceholder: "选填，例如：义父、堂兄",
  connecting: "连接中…",
  establishRelation: "建立关系",
  adminIntroTitle: "进入管理模式",
  adminIntroBody: "族人默认以浏览模式访问，可查看族谱和查询称呼。管理员登录后才可修改成员、关系和族谱设置。",
  adminPassword: "管理员密码",
  adminPasswordPlaceholder: "请输入管理员密码",
  authNotConfigured: "尚未配置管理员密码",
  authNotConfiguredBody: "请在服务端环境变量中设置 ADMIN_PASSWORD 和 SESSION_SECRET 后重启服务。",
  verifying: "验证中…",
  enterAdminMode: "进入管理模式",
  kinshipQuery: "称呼查询",
  resultReady: "已算出双方称呼",
  chooseAnother: "再点一位成员",
  chooseTwo: "依次点选两位成员",
  exitKinshipAria: "退出称呼查询",
  personOrder: "第 {count} 位",
  selectInGraph: "请在主图中选择",
  directLineage: "直系脉络",
  commonAncestor: "共同长辈",
  branchOf: "{name}这一支",
  relationshipPath: "关系路径",
  calls: "{first}称呼{second}",
  standardChinese: "普通话：{term}",
  resetSelection: "重新选择",
  selectedMarkerHint: "点过的成员会标为 ①、②",
  relationParent: "父母 → 子女",
  relationSpouse: "对象",
  relationSibling: "兄弟姐妹",
  relationAdoptiveParent: "养父母 → 养子女",
  relationGuardian: "监护人 → 被监护人",
  relationOther: "其他关系",
  graphParent: "父母",
  graphChild: "子女",
  startWithFirst: "从第一位家人开始",
  emptyGraphHelp: "点击“添加成员”录入基础信息，再用“添加关系”连接彼此。",
  regionalTerms: "地域称呼",
  regionalTermsHelp: "查询时优先显示本地叫法，标准称呼仍会保留在结果中。",
  addTerm: "添加称呼",
  dialectExamples: "方言称呼示例",
  standardRelation: "标准关系",
  localName: "你们当地叫",
  localTermPlaceholder: "例如：{term}",
  removeCustomTerm: "删除这条自定义称呼",
  noCustomTerms: "尚未自定义，当前使用普通话标准称呼。也可以直接点击上面的示例。",
  groupDirect: "直系亲属",
  groupParentPeers: "父母同辈",
  groupPeers: "同辈与晚辈",
  groupGrandCollateral: "祖辈旁系",
  groupInLaw: "姻亲"
} as const;

type TranslationKey = keyof typeof zhCN;
type Params = Record<string, string | number>;

const en: Record<TranslationKey, string> = {
  unknownMember: "Unknown member",
  requestFailed: "Request failed",
  actionFailed: "Something went wrong. Please try again.",
  adminNotConfiguredError: "The administrator password is not configured",
  tooManyLoginAttempts: "Too many sign-in attempts. Try again in 15 minutes.",
  invalidAdminPassword: "The administrator password is incorrect",
  adminRequired: "Administrator access is required for this action",
  relationMemberNotFound: "A member in this relationship no longer exists",
  relationAlreadyExists: "This relationship already exists",
  relationNotFound: "Relationship not found",
  invalidImportFormat: "The import file has an invalid format",
  invalidInput: "Check the entered information and try again",
  serverError: "Internal server error",
  adminModeEntered: "Admin mode enabled",
  browseModeEntered: "Switched to browse mode",
  deletePersonConfirm: "Delete “{name}”? All connected relationships will also be deleted.",
  deleteRelationConfirm: "Delete this relationship?",
  settingsSaved: "Family tree settings saved",
  importConfirm: "Importing will replace all current family tree data. Continue?",
  invalidJson: "This file does not contain valid JSON data",
  loadingBrand: "Branches",
  loading: "Unfolding the family tree…",
  pageTitle: "Branches · Digital Family Tree",
  pageDescription: "A self-hosted digital family tree and interactive kinship graph",
  openMembers: "Open member list",
  closeMembers: "Close member list",
  defaultSubtitle: "Digital family tree · Roots and branches",
  memberCount: "{count} members",
  relationCount: "{count} relationships",
  exitAdmin: "Exit admin mode",
  adminLogin: "Admin sign in",
  adminMode: "Admin",
  browseMode: "Browse",
  kinshipButtonTitle: "Select two people in the graph to see how they are related",
  exitQuery: "Exit query",
  queryKinship: "Kinship",
  viewGenerationPoem: "View generation poem",
  generationPoem: "Generation poem",
  addRelation: "Add relationship",
  addMember: "Add member",
  familyMembers: "Family members",
  searchPlaceholder: "Search name, occupation, or location",
  generationNumber: "Generation {count}",
  infoPending: "Details pending",
  noSearchResults: "No matching members",
  noMembers: "No members yet",
  exportBackup: "Export backup",
  importData: "Import data",
  settings: "Settings",
  familySettings: "Family tree settings",
  readOnlyMode: "Currently in browse mode",
  queryingKinship: "Kinship query",
  lineageOverview: "Direct family lineage",
  familyOverview: "Full family network",
  queryCompleteHint: "Both terms are shown · Select another member to start over",
  querySecondHint: "Select one more member · Select the first again to cancel",
  queryFirstHint: "Select two members in the graph",
  lineageHint: "{count} spouses hidden · Select a member to view details",
  graphHint: "Scroll to zoom · Drag to pan · Select a member for details",
  graphViewLabel: "Family graph display mode",
  fullTree: "Full tree",
  directLine: "Direct line",
  directLineTitle: "Hide spouses and show only the direct family lineage",
  familyMember: "Family member",
  edit: "Edit",
  connect: "Connect",
  delete: "Delete",
  lifespan: "Lifespan",
  unknown: "Unknown",
  present: "Present",
  location: "Location",
  biography: "Biography",
  relationships: "Relationships",
  deleteRelationship: "Delete relationship",
  noRelationships: "No relationships yet",
  memberMeta: "MEMBER",
  relationMeta: "RELATIONSHIP",
  settingsMeta: "SETTINGS",
  adminMeta: "ADMIN",
  editMember: "Edit member",
  addFamilyMember: "Add family member",
  createRelationship: "Create relationship",
  languageAndDisplay: "Language & display",
  languageHelp: "Your language preference is stored only in this browser and does not change family data.",
  simplifiedChinese: "简体中文",
  traditionalChinese: "繁體中文",
  english: "English",
  adminSettingsHelp: "Only an administrator can edit family details and regional kinship terms.",
  surname: "Family surname",
  surnamePlaceholder: "For example: Chen",
  sealCharacter: "Seal text *",
  familyName: "Family tree name *",
  topSubtitle: "Header subtitle",
  subtitlePlaceholder: "For example: Our family · Roots and branches",
  familyDescription: "Family description",
  generationText: "Generation poem",
  generationPlaceholder: "Enter the generation poem; punctuation and line breaks are preserved",
  privacyTitle: "Privacy note",
  privacyBody: "This project does not upload data by itself, but exported backups contain every member's details. Do not commit private files from the data directory when publishing the repository.",
  cancel: "Cancel",
  close: "Close",
  saveSettings: "Save settings",
  name: "Name *",
  namePlaceholder: "For example: {surname} Lishan",
  gender: "Gender",
  genderUnknown: "Not specified",
  genderMale: "Male",
  genderFemale: "Female",
  genderOther: "Other",
  generation: "Generation",
  generationInputPlaceholder: "For example: 3",
  birthDate: "Date of birth",
  living: "Living",
  deathDate: "Date of death",
  occupation: "Occupation",
  occupationPlaceholder: "Occupation or role",
  locationPlaceholder: "City or town",
  phone: "Phone",
  phonePlaceholder: "Stored only on your server",
  avatarUrl: "Avatar URL",
  biographyPlaceholder: "Record a life story, migration history, or memories worth preserving…",
  saving: "Saving…",
  saveChanges: "Save changes",
  relationDirectionHint: "Parent, adoptive-parent, and guardian relationships are directional. Put the elder or guardian first.",
  relationType: "Relationship type *",
  parentOne: "Father / mother",
  adoptiveParentOne: "Adoptive parent",
  guardianOne: "Guardian",
  firstMember: "First member",
  child: "Child",
  adoptiveChild: "Adopted child",
  ward: "Ward",
  secondMember: "Second member",
  select: "Select",
  customTerm: "Custom label",
  customTermPlaceholder: "Optional, for example: godfather or cousin",
  connecting: "Connecting…",
  establishRelation: "Create relationship",
  adminIntroTitle: "Enter admin mode",
  adminIntroBody: "Visitors use browse mode by default and can view the tree and query kinship. Only signed-in administrators can edit members, relationships, and settings.",
  adminPassword: "Admin password",
  adminPasswordPlaceholder: "Enter the admin password",
  authNotConfigured: "Admin password is not configured",
  authNotConfiguredBody: "Set ADMIN_PASSWORD and SESSION_SECRET in the server environment, then restart the service.",
  verifying: "Verifying…",
  enterAdminMode: "Enter admin mode",
  kinshipQuery: "Kinship query",
  resultReady: "Both terms calculated",
  chooseAnother: "Select one more member",
  chooseTwo: "Select two members",
  exitKinshipAria: "Exit kinship query",
  personOrder: "Person {count}",
  selectInGraph: "Select from the graph",
  directLineage: "Direct lineage",
  commonAncestor: "Common ancestor",
  branchOf: "{name}'s branch",
  relationshipPath: "Relationship path",
  calls: "{first} calls {second}",
  standardChinese: "Standard term: {term}",
  resetSelection: "Start over",
  selectedMarkerHint: "Selected members are marked ① and ②",
  relationParent: "Parent → child",
  relationSpouse: "Spouse / partner",
  relationSibling: "Siblings",
  relationAdoptiveParent: "Adoptive parent → child",
  relationGuardian: "Guardian → ward",
  relationOther: "Other relationship",
  graphParent: "Parent",
  graphChild: "Child",
  startWithFirst: "Start with your first family member",
  emptyGraphHelp: "Select “Add member” to enter basic details, then use “Add relationship” to connect people.",
  regionalTerms: "Regional kinship terms",
  regionalTermsHelp: "Queries show your local term first while retaining the standard term for reference.",
  addTerm: "Add term",
  dialectExamples: "Regional term examples",
  standardRelation: "Standard relationship",
  localName: "Your local term",
  localTermPlaceholder: "For example: {term}",
  removeCustomTerm: "Remove this custom term",
  noCustomTerms: "No custom terms yet. Standard kinship terms are currently used; you can also select an example above.",
  groupDirect: "Direct family",
  groupParentPeers: "Parents' generation",
  groupPeers: "Peers & descendants",
  groupGrandCollateral: "Grandparents' relatives",
  groupInLaw: "In-laws"
};

const traditionalCharacters: Record<string, string> = {
  "万": "萬", "与": "與", "业": "業", "个": "個", "为": "為", "么": "麼", "义": "義", "云": "雲", "亲": "親", "仅": "僅", "们": "們", "会": "會", "传": "傳", "体": "體", "关": "關", "兴": "興", "养": "養", "内": "內", "写": "寫", "军": "軍", "冲": "衝", "决": "決", "况": "況", "几": "幾", "击": "擊", "刘": "劉", "则": "則", "创": "創", "删": "刪", "别": "別", "动": "動", "务": "務", "区": "區", "华": "華", "单": "單", "卫": "衛", "却": "卻", "厅": "廳", "历": "歷", "压": "壓", "厦": "廈", "县": "縣", "参": "參", "双": "雙", "发": "發", "变": "變", "叶": "葉", "号": "號", "后": "後", "吗": "嗎", "听": "聽", "启": "啟", "员": "員", "问": "問", "团": "團", "园": "園", "围": "圍", "图": "圖", "场": "場", "块": "塊", "坚": "堅", "坛": "壇", "坏": "壞", "声": "聲", "处": "處", "备": "備", "复": "復", "够": "夠", "头": "頭", "夹": "夾", "奖": "獎", "妇": "婦", "妈": "媽", "孙": "孫", "学": "學", "宁": "寧", "实": "實", "审": "審", "对": "對", "导": "導", "寿": "壽", "将": "將", "尔": "爾", "层": "層", "届": "屆", "属": "屬", "岁": "歲", "岛": "島", "岭": "嶺", "币": "幣", "师": "師", "带": "帶", "库": "庫", "应": "應", "开": "開", "张": "張", "归": "歸", "当": "當", "录": "錄", "忆": "憶", "总": "總", "恋": "戀", "恶": "惡", "惊": "驚", "惯": "慣", "愿": "願", "戏": "戲", "户": "戶", "执": "執", "扩": "擴", "扫": "掃", "扬": "揚", "护": "護", "报": "報", "拟": "擬", "拥": "擁", "择": "擇", "挡": "擋", "挥": "揮", "损": "損", "换": "換", "据": "據", "摆": "擺", "摇": "搖", "敌": "敵", "数": "數", "断": "斷", "无": "無", "旧": "舊", "时": "時", "显": "顯", "暂": "暫", "术": "術", "机": "機", "杂": "雜", "权": "權", "条": "條", "来": "來", "极": "極", "构": "構", "标": "標", "树": "樹", "样": "樣", "档": "檔", "桥": "橋", "梦": "夢", "检": "檢", "楼": "樓", "欢": "歡", "欧": "歐", "毁": "毀", "气": "氣", "汉": "漢", "汤": "湯", "沟": "溝", "没": "沒", "泪": "淚", "泽": "澤", "洁": "潔", "浅": "淺", "浆": "漿", "测": "測", "济": "濟", "浓": "濃", "涌": "湧", "涛": "濤", "涟": "漣", "涡": "渦", "涣": "渙", "润": "潤", "涨": "漲", "渐": "漸", "渔": "漁", "浏": "瀏", "温": "溫", "湾": "灣", "湿": "濕", "滚": "滾", "满": "滿", "滤": "濾", "滥": "濫", "滨": "濱", "滩": "灘", "灭": "滅", "灯": "燈", "灵": "靈", "点": "點", "炼": "煉", "烟": "煙", "烦": "煩", "烧": "燒", "爱": "愛", "爷": "爺", "牵": "牽", "状": "狀", "独": "獨", "狮": "獅", "猫": "貓", "现": "現", "环": "環", "电": "電", "画": "畫", "疗": "療", "疯": "瘋", "皱": "皺", "盖": "蓋", "监": "監", "盘": "盤", "着": "著", "睁": "睜", "瞒": "瞞", "矿": "礦", "码": "碼", "砖": "磚", "础": "礎", "确": "確", "碍": "礙", "礼": "禮", "祷": "禱", "离": "離", "积": "積", "称": "稱", "稳": "穩", "穷": "窮", "窃": "竊", "竞": "競", "笔": "筆", "笼": "籠", "筑": "築", "签": "簽", "简": "簡", "类": "類", "粮": "糧", "紧": "緊", "红": "紅", "约": "約", "级": "級", "纪": "紀", "纯": "純", "纳": "納", "纵": "縱", "纸": "紙", "纹": "紋", "线": "線", "组": "組", "终": "終", "绍": "紹", "经": "經", "绑": "綁", "结": "結", "绕": "繞", "绘": "繪", "给": "給", "绝": "絕", "统": "統", "继": "繼", "续": "續", "维": "維", "绿": "綠", "编": "編", "缘": "緣", "缩": "縮", "缚": "縛", "缝": "縫", "网": "網", "罗": "羅", "罚": "罰", "联": "聯", "职": "職", "肠": "腸", "肤": "膚", "胜": "勝", "胶": "膠", "脉": "脈", "脑": "腦", "脸": "臉", "舰": "艦", "舱": "艙", "艰": "艱", "艺": "藝", "节": "節", "苏": "蘇", "范": "範", "获": "獲", "营": "營", "蓝": "藍", "虑": "慮", "虽": "雖", "虫": "蟲", "补": "補", "装": "裝", "见": "見", "观": "觀", "规": "規", "视": "視", "览": "覽", "觉": "覺", "触": "觸", "计": "計", "订": "訂", "认": "認", "讨": "討", "让": "讓", "议": "議", "讯": "訊", "记": "記", "讲": "講", "许": "許", "论": "論", "设": "設", "访": "訪", "证": "證", "评": "評", "识": "識", "诉": "訴", "词": "詞", "译": "譯", "试": "試", "诗": "詩", "话": "話", "该": "該", "详": "詳", "语": "語", "误": "誤", "说": "說", "请": "請", "诸": "諸", "读": "讀", "谁": "誰", "调": "調", "谈": "談", "谊": "誼", "谋": "謀", "谢": "謝", "谱": "譜", "贝": "貝", "负": "負", "财": "財", "责": "責", "账": "賬", "质": "質", "购": "購", "贵": "貴", "资": "資", "赋": "賦", "赏": "賞", "赖": "賴", "赞": "讚", "赠": "贈", "赶": "趕", "趋": "趨", "跃": "躍", "践": "踐", "踪": "蹤", "车": "車", "转": "轉", "轮": "輪", "轻": "輕", "载": "載", "较": "較", "辅": "輔", "辆": "輛", "辈": "輩", "输": "輸", "边": "邊", "辽": "遼", "达": "達", "迁": "遷", "过": "過", "运": "運", "还": "還", "这": "這", "进": "進", "远": "遠", "违": "違", "连": "連", "迟": "遲", "适": "適", "选": "選", "递": "遞", "遗": "遺", "邮": "郵", "邻": "鄰", "郑": "鄭", "释": "釋", "鉴": "鑑", "钟": "鐘", "钱": "錢", "锁": "鎖", "镇": "鎮", "长": "長", "门": "門", "闭": "閉", "间": "間", "闷": "悶", "闹": "鬧", "闻": "聞", "阅": "閱", "阔": "闊", "队": "隊", "阳": "陽", "阴": "陰", "阵": "陣", "阶": "階", "际": "際", "陆": "陸", "陈": "陳", "险": "險", "随": "隨", "隐": "隱", "难": "難", "雾": "霧", "静": "靜", "页": "頁", "项": "項", "顺": "順", "须": "須", "顾": "顧", "预": "預", "领": "領", "颇": "頗", "题": "題", "额": "額", "颜": "顏", "风": "風", "飞": "飛", "饭": "飯", "饮": "飲", "饰": "飾", "饱": "飽", "馆": "館", "马": "馬", "驱": "驅", "验": "驗", "骤": "驟", "鱼": "魚", "鸟": "鳥", "鸡": "雞", "黄": "黃", "齐": "齊", "齿": "齒", "龄": "齡", "龙": "龍"
};

function toTraditional(value: string) {
  const phrases: Record<string, string> = {
    "关系": "關係",
    "联系": "聯繫",
    "系统": "系統"
  };
  const withPhrases = Object.entries(phrases).reduce(
    (text, [source, replacement]) => text.replaceAll(source, replacement),
    value
  );
  return Array.from(withPhrases).map((character) => traditionalCharacters[character] || character).join("");
}

const zhTW = Object.fromEntries(
  Object.entries(zhCN).map(([key, value]) => [key, toTraditional(value)])
) as Record<TranslationKey, string>;

const dictionaries: Record<Locale, Record<TranslationKey, string>> = { "zh-CN": zhCN, "zh-TW": zhTW, en };

export const localeOptions: Array<{ value: Locale; label: string; shortLabel: string }> = [
  { value: "zh-CN", label: "简体中文", shortLabel: "简" },
  { value: "zh-TW", label: "繁體中文", shortLabel: "繁" },
  { value: "en", label: "English", shortLabel: "EN" }
];

export function translate(locale: Locale, key: TranslationKey, params: Params = {}) {
  return Object.entries(params).reduce(
    (value, [name, replacement]) => value.replaceAll(`{${name}}`, String(replacement)),
    dictionaries[locale][key]
  );
}

export type Translate = (key: TranslationKey, params?: Params) => string;

function detectLocale(): Locale {
  try {
    const saved = window.localStorage.getItem("family-tree-locale");
    if (saved === "zh-CN" || saved === "zh-TW" || saved === "en") return saved;
  } catch { /* Storage may be disabled. */ }
  const browserLocale = navigator.language.toLowerCase();
  if (browserLocale.startsWith("zh-tw") || browserLocale.startsWith("zh-hk") || browserLocale.startsWith("zh-mo") || browserLocale.includes("hant")) return "zh-TW";
  if (browserLocale.startsWith("en")) return "en";
  return "zh-CN";
}

interface I18nValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: Translate;
}

const I18nContext = createContext<I18nValue | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>(detectLocale);

  useEffect(() => {
    document.documentElement.lang = locale;
    document.title = translate(locale, "pageTitle");
    document.querySelector('meta[name="description"]')?.setAttribute("content", translate(locale, "pageDescription"));
    try { window.localStorage.setItem("family-tree-locale", locale); } catch { /* Storage may be disabled. */ }
  }, [locale]);

  const value = useMemo<I18nValue>(() => ({
    locale,
    setLocale,
    t: (key, params) => translate(locale, key, params)
  }), [locale]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const value = useContext(I18nContext);
  if (!value) throw new Error("useI18n must be used inside I18nProvider");
  return value;
}

const apiMessages: Record<string, TranslationKey> = {
  "请求失败": "requestFailed",
  "成员不存在": "unknownMember"
};

const apiCodes: Record<string, TranslationKey> = {
  ADMIN_NOT_CONFIGURED: "adminNotConfiguredError",
  TOO_MANY_LOGIN_ATTEMPTS: "tooManyLoginAttempts",
  INVALID_ADMIN_PASSWORD: "invalidAdminPassword",
  ADMIN_REQUIRED: "adminRequired",
  MEMBER_NOT_FOUND: "unknownMember",
  RELATION_MEMBER_NOT_FOUND: "relationMemberNotFound",
  RELATION_EXISTS: "relationAlreadyExists",
  RELATION_NOT_FOUND: "relationNotFound",
  INVALID_IMPORT_FORMAT: "invalidImportFormat",
  VALIDATION_ERROR: "invalidInput",
  INTERNAL_ERROR: "serverError"
};

export function localizeApiMessage(message: string, locale: Locale, code?: string) {
  const key = (code && apiCodes[code]) || apiMessages[message];
  if (key) return translate(locale, key);
  return locale === "zh-TW" ? toTraditional(message) : message;
}

export { toTraditional };
