import { useEffect, useState, type FormEvent } from "react";
import { useI18n } from "./i18n";
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
  const { t } = useI18n();
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
          <span>{t("name")}</span>
          <input autoFocus required value={form.name} onChange={(event) => update("name", event.target.value)} placeholder={t("namePlaceholder", { surname: surname || "Chen" })} />
        </label>
        <label className="field">
          <span>{t("gender")}</span>
          <select value={form.gender} onChange={(event) => update("gender", event.target.value as PersonInput["gender"])}>
            <option value="unknown">{t("genderUnknown")}</option>
            <option value="male">{t("genderMale")}</option>
            <option value="female">{t("genderFemale")}</option>
            <option value="other">{t("genderOther")}</option>
          </select>
        </label>
        <label className="field">
          <span>{t("generation")}</span>
          <input type="number" value={form.generation ?? ""} onChange={(event) => update("generation", event.target.value ? Number(event.target.value) : undefined)} placeholder={t("generationInputPlaceholder")} />
        </label>
        <label className="field">
          <span>{t("birthDate")}</span>
          <input type="date" value={form.birthDate} onChange={(event) => update("birthDate", event.target.value)} />
        </label>
        <label className="field checkbox-field">
          <input type="checkbox" checked={form.isLiving} onChange={(event) => update("isLiving", event.target.checked)} />
          <span>{t("living")}</span>
        </label>
        {!form.isLiving && (
          <label className="field">
            <span>{t("deathDate")}</span>
            <input type="date" value={form.deathDate} onChange={(event) => update("deathDate", event.target.value)} />
          </label>
        )}
        <label className="field">
          <span>{t("occupation")}</span>
          <input value={form.occupation} onChange={(event) => update("occupation", event.target.value)} placeholder={t("occupationPlaceholder")} />
        </label>
        <label className="field">
          <span>{t("location")}</span>
          <input value={form.location} onChange={(event) => update("location", event.target.value)} placeholder={t("locationPlaceholder")} />
        </label>
        <label className="field">
          <span>{t("phone")}</span>
          <input value={form.phone} onChange={(event) => update("phone", event.target.value)} placeholder={t("phonePlaceholder")} />
        </label>
        <label className="field field--wide">
          <span>{t("avatarUrl")}</span>
          <input type="url" value={form.avatar} onChange={(event) => update("avatar", event.target.value)} placeholder="https://..." />
        </label>
        <label className="field field--wide">
          <span>{t("biography")}</span>
          <textarea rows={5} value={form.biography} onChange={(event) => update("biography", event.target.value)} placeholder={t("biographyPlaceholder")} />
        </label>
      </div>
      <div className="form-actions">
        <button className="button button--ghost" type="button" onClick={onCancel}>{t("cancel")}</button>
        <button className="button button--primary" disabled={busy}>{busy ? t("saving") : person ? t("saveChanges") : t("addMember")}</button>
      </div>
    </form>
  );
}
