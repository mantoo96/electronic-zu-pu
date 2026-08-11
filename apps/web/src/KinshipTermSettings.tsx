import { Plus, Trash2 } from "lucide-react";
import { defaultTermForKey, kinshipCatalog, kinshipPresets } from "./kinship";

interface Props {
  value: Record<string, string>;
  onChange: (value: Record<string, string>) => void;
}

const groups = ["直系亲属", "父母同辈", "同辈与晚辈", "祖辈旁系", "姻亲"] as const;

export function KinshipTermSettings({ value, onChange }: Props) {
  const rows = Object.entries(value);

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
          <span>地域称呼</span>
          <p>查询时优先显示本地叫法，标准称呼仍会保留在结果中。</p>
        </div>
        <button className="button button--ghost settings-add-term" type="button" onClick={addRow} disabled={rows.length >= kinshipCatalog.length}>
          <Plus size={15} /> 添加称呼
        </button>
      </div>

      <div className="kinship-presets" aria-label="方言称呼示例">
        {kinshipPresets.map((preset) => (
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
                <span>标准关系</span>
                <select value={key} onChange={(event) => changeKey(key, event.target.value)}>
                  {!kinshipCatalog.some((item) => item.key === key) && <option value={key}>{defaultTermForKey(key)}</option>}
                  {groups.map((group) => (
                    <optgroup key={group} label={group}>
                      {kinshipCatalog.filter((item) => item.group === group).map((item) => (
                        <option key={item.key} value={item.key} disabled={item.key !== key && item.key in value}>
                          {item.label} · {item.description}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </label>
              <label>
                <span>你们当地叫</span>
                <input
                  value={term}
                  maxLength={40}
                  onChange={(event) => changeTerm(key, event.target.value)}
                  placeholder={`例如：${defaultTermForKey(key)}`}
                />
              </label>
              <button type="button" className="kinship-term-remove" onClick={() => removeRow(key)} title="删除这条自定义称呼">
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      )}

      {!rows.length && <p className="kinship-settings-empty">尚未自定义，当前使用普通话标准称呼。也可以直接点击上面的示例。</p>}
    </section>
  );
}
