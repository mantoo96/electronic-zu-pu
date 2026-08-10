import { useState, type FormEvent } from "react";
import { relationLabels } from "./labels";
import type { Person, RelationInput, RelationType } from "./types";

interface Props {
  people: Person[];
  initialFromId?: string;
  busy: boolean;
  onSubmit: (input: RelationInput) => Promise<void>;
  onCancel: () => void;
}

export function RelationForm({ people, initialFromId, busy, onSubmit, onCancel }: Props) {
  const [form, setForm] = useState<RelationInput>({
    fromPersonId: initialFromId || people[0]?.id || "",
    toPersonId: people.find((person) => person.id !== initialFromId)?.id || "",
    type: "parent",
    label: "",
    startDate: "",
    endDate: ""
  });
  const update = <K extends keyof RelationInput>(key: K, value: RelationInput[K]) =>
    setForm((current) => ({ ...current, [key]: value }));

  async function submit(event: FormEvent) {
    event.preventDefault();
    await onSubmit(form);
  }

  return (
    <form className="drawer-form" onSubmit={submit}>
      <div className="relation-hint">
        “父母、养父母、监护人”是有方向的关系，请将长辈或监护人放在前面。
      </div>
      <div className="form-grid">
        <label className="field field--wide">
          <span>关系类型 *</span>
          <select value={form.type} onChange={(event) => update("type", event.target.value as RelationType)}>
            {Object.entries(relationLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
        </label>
        <label className="field">
          <span>{form.type === "parent" ? "父亲 / 母亲" : form.type === "adoptive_parent" ? "养父 / 养母" : form.type === "guardian" ? "监护人" : "成员一"}</span>
          <select required value={form.fromPersonId} onChange={(event) => update("fromPersonId", event.target.value)}>
            <option value="">请选择</option>
            {people.map((person) => <option key={person.id} value={person.id}>{person.name}</option>)}
          </select>
        </label>
        <label className="field">
          <span>{form.type === "parent" ? "子女" : form.type === "adoptive_parent" ? "养子女" : form.type === "guardian" ? "被监护人" : "成员二"}</span>
          <select required value={form.toPersonId} onChange={(event) => update("toPersonId", event.target.value)}>
            <option value="">请选择</option>
            {people.map((person) => <option key={person.id} value={person.id}>{person.name}</option>)}
          </select>
        </label>
        <label className="field field--wide">
          <span>自定义称谓</span>
          <input value={form.label} onChange={(event) => update("label", event.target.value)} placeholder="选填，例如：义父、堂兄" />
        </label>
      </div>
      <div className="form-actions">
        <button className="button button--ghost" type="button" onClick={onCancel}>取消</button>
        <button className="button button--primary" disabled={busy || people.length < 2}>{busy ? "连接中…" : "建立关系"}</button>
      </div>
    </form>
  );
}
