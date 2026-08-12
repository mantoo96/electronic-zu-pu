import { Plus, Trash2 } from "lucide-react";
import { defaultTermForKey, kinshipCatalog } from "./kinship";
import { useI18n } from "./i18n";
import { localizedKinshipCatalog, localizedKinshipPresets } from "./kinshipLocale";

interface Props {
  value: Record<string, string>;
  onChange: (value: Record<string, string>) => void;
}

export function KinshipTermSettings({ value, onChange }: Props) {
  const { locale, t } = useI18n();
  const rows = Object.entries(value);
  const catalog = localizedKinshipCatalog(locale, t);
  const presets = localizedKinshipPresets(locale);
  const groups = [...new Set(catalog.map((item) => item.group))];

  function addRow() {
    const next = kinshipCatalog.find((item) => !(item.key in value));
    if (next) onChange({ ...value, [next.key]: "" });
  }

  function changeKey(previousKey: string, nextKey: string) {
    if (previousKey === nextKey) return;
    const next = { ...value };
    const term = next[previousKey];
    delete next[previousKey];
    next[nextKey] = term;
    onChange(next);
  }

  function changeTerm(key: string, term: string) {
    onChange({ ...value, [key]: term });
  }

  function removeRow(key: string) {
    const next = { ...value };
    delete next[key];
    onChange(next);
  }

  function applyPreset(key: string, term: string) {
    onChange({ ...value, [key]: term });
  }

  return (
    <section className="kinship-settings">
      <div className="settings-section-heading">
        <div>
          <span>{t("regionalTerms")}</span>
          <p>{t("regionalTermsHelp")}</p>
        </div>
        <button className="button button--ghost settings-add-term" type="button" onClick={addRow} disabled={rows.length >= kinshipCatalog.length}>
          <Plus size={15} /> {t("addTerm")}
        </button>
      </div>

      <div className="kinship-presets" aria-label={t("dialectExamples")}>
        {presets.map((preset) => (
          <button
            key={preset.key}
            type="button"
            className={value[preset.key] === preset.term ? "is-active" : ""}
            onClick={() => applyPreset(preset.key, preset.term)}
          >
            {preset.label}
          </button>
        ))}
      </div>

      {rows.length > 0 && (
        <div className="kinship-term-list">
          {rows.map(([key, term]) => (
            <div className="kinship-term-row" key={key}>
              <label>
                <span>{t("standardRelation")}</span>
                <select value={key} onChange={(event) => changeKey(key, event.target.value)}>
                  {!kinshipCatalog.some((item) => item.key === key) && <option value={key}>{defaultTermForKey(key)}</option>}
                  {groups.map((group) => (
                    <optgroup key={group} label={group}>
                      {catalog.filter((item) => item.group === group).map((item) => (
                        <option key={item.key} value={item.key} disabled={item.key !== key && item.key in value}>
                          {item.label} · {item.description}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </label>
              <label>
                <span>{t("localName")}</span>
                <input
                  value={term}
                  maxLength={40}
                  onChange={(event) => changeTerm(key, event.target.value)}
                  placeholder={t("localTermPlaceholder", { term: catalog.find((item) => item.key === key)?.label || defaultTermForKey(key) })}
                />
              </label>
              <button type="button" className="kinship-term-remove" onClick={() => removeRow(key)} title={t("removeCustomTerm")}>
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      )}

      {!rows.length && <p className="kinship-settings-empty">{t("noCustomTerms")}</p>}
    </section>
  );
}
