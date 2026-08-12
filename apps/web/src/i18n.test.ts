import { describe, expect, it } from "vitest";
import { localizeApiMessage, toTraditional, translate } from "./i18n";
import { localizeChainRelation, localizeKinshipResultTerm, localizeKinshipTerm } from "./kinshipLocale";

describe("interface localization", () => {
  it("interpolates English interface messages", () => {
    expect(translate("en", "memberCount", { count: 12 })).toBe("12 members");
    expect(translate("en", "deletePersonConfirm", { name: "Alex" })).toContain("Alex");
  });

  it("converts built-in wording to traditional Chinese", () => {
    expect(translate("zh-TW", "familySettings")).toBe("族譜設置");
    expect(toTraditional("亲属关系与资料记录")).toBe("親屬關係與資料記錄");
  });

  it("localizes common kinship terms without changing custom content", () => {
    expect(localizeKinshipTerm("爷爷", "paternal_grandfather", "en")).toBe("Paternal grandfather");
    expect(localizeKinshipTerm("爷爷", "paternal_grandfather", "zh-TW")).toBe("爺爺");
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

  it("localizes structured path items and preserves regional terms", () => {
    expect(localizeChainRelation({ personId: "1", name: "A", relation: "爸爸", canonicalKey: "father" }, "en")).toBe("Father");
    expect(localizeChainRelation({ personId: "2", name: "B", relation: "娃儿", canonicalKey: "son", isCustom: true }, "en")).toBe("娃儿");
  });

  it("uses API error codes instead of depending on Chinese messages", () => {
    expect(localizeApiMessage("管理员密码不正确", "en", "INVALID_ADMIN_PASSWORD")).toBe("The administrator password is incorrect");
    expect(localizeApiMessage("输入内容有误", "en", "VALIDATION_ERROR")).toBe("Check the entered information and try again");
  });

  it("provides localized page metadata", () => {
    expect(translate("en", "pageTitle")).toBe("Branches · Digital Family Tree");
    expect(translate("zh-TW", "pageDescription")).toContain("電子族譜");
  });
});
