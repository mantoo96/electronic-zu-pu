import { useEffect, useState, type FormEvent } from "react";
import type { Person, PersonInput } from "./types";

const emptyPerson: PersonInput = {
  name: "",
  gender: "unknown",
  birthDate: "",
  deathDate: "",
  isLiving: true,
  avatar: "",
  phone: "",
  location: "",
  occupation: "",
  generation: undefined,
  biography: ""
};

interface Props {
  person?: Person;
  surname?: string;
  busy: boolean;
  onSubmit: (input: PersonInput) => Promise<void>;
  onCancel: () => void;
}

export function PersonForm({ person, surname, busy, onSubmit, onCancel }: Props) {
  const [form, setForm] = useState<PersonInput>(emptyPerson);

  useEffect(() => {
    if (!person) return setForm(emptyPerson);
    const { id: _id, createdAt: _createdAt, updatedAt: _updatedAt, ...input } = person;
    setForm(input);
  }, [person]);

  const update = <K extends keyof PersonInput>(key: K, value: PersonInput[K]) =>
    setForm((current) => ({ ...current, [key]: value }));

  async function submit(event: FormEvent) {
    event.preventDefault();
    await onSubmit(form);
  }

  return (
    <form className="drawer-form" onSubmit={submit}>
      <div className="form-grid">
        <label className="field field--wide">
          <span>姓名 *</span>
          <input autoFocus required value={form.name} onChange={(event) => update("name", event.target.value)} placeholder={`例如：${surname || "陈"}立山`} />
        </label>
        <label className="field">
          <span>性别</span>
          <select value={form.gender} onChange={(event) => update("gender", event.target.value as PersonInput["gender"])}>
            <option value="unknown">未填写</option>
            <option value="male">男</option>
            <option value="female">女</option>
            <option value="other">其他</option>
          </select>
        </label>
        <label className="field">
          <span>世代</span>
          <input type="number" value={form.generation ?? ""} onChange={(event) => update("generation", event.target.value ? Number(event.target.value) : undefined)} placeholder="如：3" />
        </label>
        <label className="field">
          <span>出生日期</span>
          <input type="date" value={form.birthDate} onChange={(event) => update("birthDate", event.target.value)} />
        </label>
        <label className="field checkbox-field">
          <input type="checkbox" checked={form.isLiving} onChange={(event) => update("isLiving", event.target.checked)} />
          <span>目前健在</span>
        </label>
        {!form.isLiving && (
          <label className="field">
            <span>离世日期</span>
            <input type="date" value={form.deathDate} onChange={(event) => update("deathDate", event.target.value)} />
          </label>
        )}
        <label className="field">
          <span>职业</span>
          <input value={form.occupation} onChange={(event) => update("occupation", event.target.value)} placeholder="职业或身份" />
        </label>
        <label className="field">
          <span>居住地</span>
          <input value={form.location} onChange={(event) => update("location", event.target.value)} placeholder="城市、乡镇" />
        </label>
        <label className="field">
          <span>联系电话</span>
          <input value={form.phone} onChange={(event) => update("phone", event.target.value)} placeholder="仅存于您的服务器" />
        </label>
        <label className="field field--wide">
          <span>头像网址</span>
          <input type="url" value={form.avatar} onChange={(event) => update("avatar", event.target.value)} placeholder="https://..." />
        </label>
        <label className="field field--wide">
          <span>人物小传</span>
          <textarea rows={5} value={form.biography} onChange={(event) => update("biography", event.target.value)} placeholder="记录生平、故事、迁徙经历或值得传承的记忆……" />
        </label>
      </div>
      <div className="form-actions">
        <button className="button button--ghost" type="button" onClick={onCancel}>取消</button>
        <button className="button button--primary" disabled={busy}>{busy ? "保存中…" : person ? "保存修改" : "添加成员"}</button>
      </div>
    </form>
  );
}
