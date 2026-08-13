import { describe, expect, it } from "vitest";
import { localizeApiMessage, translate } from "./i18n";
import { localizedKinshipPresets, localizeChainRelation, localizeKinshipNote, localizeKinshipResultTerm, localizeKinshipTerm } from "./kinshipLocale";

describe("interface localization", () => {
  it("interpolates English interface messages", () => {
    expect(translate("en", "memberCount", { count: 12 })).toBe("12 members");
    expect(translate("en", "deletePersonConfirm", { name: "Alex" })).toContain("Alex");
  });

  it("uses Taiwan wording instead of character-by-character conversion", () => {
    expect(translate("zh-TW", "familySettings")).toBe("族譜設定");
    expect(translate("zh-TW", "saveSettings")).toBe("儲存設定");
    expect(translate("zh-TW", "importData")).toBe("匯入資料");
    expect(translate("zh-TW", "exportBackup")).toBe("匯出備份");
    expect(translate("zh-TW", "adminLogin")).toBe("管理員登入");
    expect(translate("zh-TW", "searchPlaceholder")).toBe("搜尋姓名、職業、居住地");
    expect(translate("zh-TW", "phone")).toBe("聯絡電話");
    expect(translate("zh-TW", "serverError")).toBe("伺服器內部錯誤");
    expect(translate("zh-TW", "standardChinese")).toBe("國語：{term}");
    expect(translate("zh-TW", "addMember")).toBe("新增成員");
    expect(translate("zh-TW", "ward")).toBe("受監護人");
    expect(translate("zh-TW", "privacyBody")).toContain("專案");
    expect(translate("zh-TW", "privacyBody")).toContain("儲存庫");
    expect(translate("zh-TW", "occupationPlaceholder")).toBe("職業或身分");
  });

  it("localizes common kinship terms without changing custom content", () => {
    expect(localizeKinshipTerm("爷爷", "paternal_grandfather", "en")).toBe("Paternal grandfather");
    expect(localizeKinshipTerm("爷爷", "paternal_grandfather", "zh-TW")).toBe("爺爺");
    expect(localizeKinshipTerm("侄子", "brothers_son", "zh-TW")).toBe("姪子");
    expect(localizeKinshipTerm("被监护人", "ward", "zh-TW")).toBe("受監護人");
    expect(localizeKinshipTerm("孙子的对象", "relative_in_law", "zh-TW")).toBe("孫子的對象");
    expect(localizeKinshipTerm("自定义关系", "custom_relation_1", "zh-TW")).toBe("自訂關係");
    expect(localizeKinshipResultTerm({
      connected: true,
      term: "Godparent",
      standardTerm: "自定义关系",
      canonicalKey: "custom_relation_1",
      isCustom: true,
      chain: []
    }, "en")).toBe("Godparent");
  });

  it("keeps dynamic English kinship terms semantically accurate", () => {
    expect(localizeKinshipTerm("暂未找到关系", undefined, "en")).toBe("No relationship found");
    expect(localizeKinshipTerm("大舅子", "wifes_older_brother", "en")).toBe("Brother-in-law");
    expect(localizeKinshipTerm("堂伯父", "tang_parent_older_uncle", "en")).toBe("Father's paternal cousin");
    expect(localizeKinshipTerm("曾祖父", "paternal_great_grandfather", "en")).toBe("Paternal great-grandfather");
  });

  it("localizes dynamic traditional kinship terms by key, not by glyph swapping", () => {
    expect(localizeKinshipTerm("曾祖父", "paternal_great_grandfather", "zh-TW")).toBe("曾祖父");
    expect(localizeKinshipTerm("堂伯父", "tang_parent_older_uncle", "zh-TW")).toBe("堂伯父");
    expect(localizeKinshipTerm("外伯祖父", "maternal_grandfather_older_brother", "zh-TW")).toBe("外伯祖父");
    expect(localizeKinshipTerm("外叔祖父", "maternal_grandfather_younger_brother", "zh-TW")).toBe("外叔祖父");
    expect(localizeKinshipTerm("远房侄辈", "distant_younger_1_male", "zh-TW")).toBe("遠房姪輩");
    expect(localizeKinshipTerm("养爷爷", "adoptive_paternal_grandfather", "zh-TW")).toBe("養爺爺");
    expect(localizeKinshipTerm("养远祖父", "adoptive_paternal_ancestor_8father", "zh-TW")).toBe("養遠祖父");
    expect(localizeKinshipTerm("养云孙", "adoptive_descendant_8_male", "zh-TW")).toBe("養雲孫");
    expect(localizeKinshipTerm("曾祖辈", "paternal_great_grandrelative", "zh-TW")).toBe("曾祖輩");
    expect(localizeKinshipTerm("曾祖辈", "paternal_great_grandrelative", "en")).toBe("Paternal great-grandparent");
    expect(localizeKinshipNote("未录入完整出生日期，暂不区分长幼", "zh-TW")).toBe("尚未登錄完整出生日期，暫不區分長幼");
    expect(localizeKinshipNote("属于第 2 代表亲；随对象称呼", "zh-TW")).toBe("屬於第 2 代表親；隨配偶的稱呼。");
  });

  it("keeps regional preset terms unchanged in every locale", () => {
    const terms = localizedKinshipPresets("zh-CN").map((preset) => preset.term);
    expect(localizedKinshipPresets("zh-TW").map((preset) => preset.term)).toEqual(terms);
    expect(localizedKinshipPresets("en").map((preset) => preset.term)).toEqual(terms);
    expect(localizedKinshipPresets("zh-TW")[2].label).toBe(`爸爸的弟弟 → ${terms[2]}`);
    expect(localizedKinshipPresets("en")[2].label).toBe(`Father's younger brother → ${terms[2]}`);
  });

  it("localizes structured path items and preserves regional terms", () => {
    expect(localizeChainRelation({ personId: "1", name: "A", relation: "爸爸", canonicalKey: "father" }, "en")).toBe("Father");
    expect(localizeChainRelation({ personId: "2", name: "B", relation: "娃儿", canonicalKey: "son", isCustom: true }, "en")).toBe("娃儿");
    expect(localizeChainRelation({ personId: "3", name: "C", relation: "侄女", canonicalKey: "brothers_daughter" }, "zh-TW")).toBe("姪女");
  });

  it("uses API error codes instead of depending on Chinese messages", () => {
    expect(localizeApiMessage("管理员密码不正确", "en", "INVALID_ADMIN_PASSWORD")).toBe("The administrator password is incorrect");
    expect(localizeApiMessage("输入内容有误", "en", "VALIDATION_ERROR")).toBe("Check the entered information and try again");
    expect(localizeApiMessage("管理员密码不正确", "zh-TW", "INVALID_ADMIN_PASSWORD")).toBe("管理員密碼不正確");
    expect(localizeApiMessage("未知的服务端消息", "zh-TW")).toBe("未知的服务端消息");
  });

  it("provides localized page metadata", () => {
    expect(translate("en", "pageTitle")).toBe("Branches · Digital Family Tree");
    expect(translate("zh-TW", "pageDescription")).toBe("可自行部署的電子族譜與親屬關係圖");
  });
});
