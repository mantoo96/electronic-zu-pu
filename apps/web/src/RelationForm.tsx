import { useState, type FormEvent } from "react";
import { useI18n } from "./i18n";
import { getRelationLabels } from "./labels";
import type { Person, RelationInput, RelationType } from "./types";

interface Props {
  people: Person[];
  initialFromId?: string;
  busy: boolean;
  onSubmit: (input: RelationInput) => Promise<void>;
  onCancel: () => void;
}

export function RelationForm({ people, initialFromId, busy, onSubmit, onCancel }: Props) {
  const { t } = useI18n();
  const relationLabels = getRelationLabels(t);
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
        {t("relationDirectionHint")}
      </div>
      <div className="form-grid">
        <label className="field field--wide">
          <span>{t("relationType")}</span>
          <select value={form.type} onChange={(event) => update("type", event.target.value as RelationType)}>
            {Object.entries(relationLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
        </label>
        <label className="field">
          <span>{form.type === "parent" ? t("parentOne") : form.type === "adoptive_parent" ? t("adoptiveParentOne") : form.type === "guardian" ? t("guardianOne") : t("firstMember")}</span>
          <select required value={form.fromPersonId} onChange={(event) => update("fromPersonId", event.target.value)}>
            <option value="">{t("select")}</option>
            {people.map((person) => <option key={person.id} value={person.id}>{person.name}</option>)}
          </select>
        </label>
        <label className="field">
          <span>{form.type === "parent" ? t("child") : form.type === "adoptive_parent" ? t("adoptiveChild") : form.type === "guardian" ? t("ward") : t("secondMember")}</span>
          <select required value={form.toPersonId} onChange={(event) => update("toPersonId", event.target.value)}>
            <option value="">{t("select")}</option>
            {people.map((person) => <option key={person.id} value={person.id}>{person.name}</option>)}
          </select>
        </label>
        <label className="field field--wide">
          <span>{t("customTerm")}</span>
          <input value={form.label} onChange={(event) => update("label", event.target.value)} placeholder={t("customTermPlaceholder")} />
        </label>
      </div>
      <div className="form-actions">
        <button className="button button--ghost" type="button" onClick={onCancel}>{t("cancel")}</button>
        <button className="button button--primary" disabled={busy || people.length < 2}>{busy ? t("connecting") : t("establishRelation")}</button>
      </div>
    </form>
  );
}
