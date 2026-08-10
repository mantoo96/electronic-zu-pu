import { useEffect, useMemo, useRef, useState } from "react";
import {
  BookOpenText,
  CalendarDays,
  Download,
  GitBranch,
  HeartHandshake,
  MapPin,
  Menu,
  Pencil,
  Plus,
  Search,
  Settings2,
  Trash2,
  Upload,
  UserRoundPlus,
  UsersRound,
  X
} from "lucide-react";
import { api } from "./api";
import { FamilyGraph } from "./FamilyGraph";
import { genderLabels, nameAvatarText, relationLabels } from "./labels";
import { PersonForm } from "./PersonForm";
import { RelationForm } from "./RelationForm";
import type { FamilyData, Person, PersonInput, Relation, RelationInput } from "./types";

type Drawer = "person" | "relation" | "settings" | null;

export default function App() {
  const [family, setFamily] = useState<FamilyData | null>(null);
  const [selected, setSelected] = useState<Person>();
  const [editing, setEditing] = useState<Person>();
  const [drawer, setDrawer] = useState<Drawer>(null);
  const [busy, setBusy] = useState(false);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showGenerationPopup, setShowGenerationPopup] = useState(false);
  const importRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    api.getFamily().then(setFamily).catch((reason) => setError(reason.message));
  }, []);

  useEffect(() => {
    if (!showGenerationPopup) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.topbar__actions, .generation-popover')) {
        setShowGenerationPopup(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showGenerationPopup]);

  const filteredPeople = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!family || !keyword) return family?.people || [];
    return family.people.filter((person) =>
      [person.name, person.location, person.occupation].some((value) => value?.toLowerCase().includes(keyword))
    );
  }, [family, search]);

  const selectedRelations = useMemo(() => {
    if (!family || !selected) return [];
    return family.relations.filter((relation) => relation.fromPersonId === selected.id || relation.toPersonId === selected.id);
  }, [family, selected]);

  function personName(id: string) {
    return family?.people.find((person) => person.id === id)?.name || "未知成员";
  }

  function showError(reason: unknown) {
    setError(reason instanceof Error ? reason.message : "操作失败，请稍后重试");
  }

  function openDrawer(nextDrawer: Exclude<Drawer, null>) {
    setSidebarOpen(false);
    setDrawer(nextDrawer);
  }

  async function savePerson(input: PersonInput) {
    setBusy(true);
    setError("");
    try {
      if (editing) {
        const updated = await api.updatePerson(editing.id, input);
        setFamily((current) => current && ({ ...current, people: current.people.map((item) => item.id === updated.id ? updated : item) }));
        setSelected(updated);
      } else {
        const created = await api.createPerson(input);
        setFamily((current) => current && ({ ...current, people: [...current.people, created] }));
        setSelected(created);
      }
      setDrawer(null);
      setEditing(undefined);
    } catch (reason) { showError(reason); } finally { setBusy(false); }
  }

  async function deletePerson(person: Person) {
    if (!window.confirm(`确定删除“${person.name}”吗？与其相连的关系也会一并删除。`)) return;
    setBusy(true);
    try {
      await api.deletePerson(person.id);
      setFamily((current) => current && ({
        ...current,
        people: current.people.filter((item) => item.id !== person.id),
        relations: current.relations.filter((item) => item.fromPersonId !== person.id && item.toPersonId !== person.id)
      }));
      setSelected(undefined);
    } catch (reason) { showError(reason); } finally { setBusy(false); }
  }

  async function saveRelation(input: RelationInput) {
    setBusy(true);
    setError("");
    try {
      const relation = await api.createRelation(input);
      setFamily((current) => current && ({ ...current, relations: [...current.relations, relation] }));
      setDrawer(null);
    } catch (reason) { showError(reason); } finally { setBusy(false); }
  }

  async function deleteRelation(relation: Relation) {
    if (!window.confirm("确定删除这条亲属关系吗？")) return;
    try {
      await api.deleteRelation(relation.id);
      setFamily((current) => current && ({ ...current, relations: current.relations.filter((item) => item.id !== relation.id) }));
    } catch (reason) { showError(reason); }
  }

  async function saveFamilyInfo(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!family) return;
    setBusy(true);
    const form = new FormData(event.currentTarget);
    try {
      const updated = await api.updateFamily({
        surname: String(form.get("surname")),
        familyName: String(form.get("familyName")),
        brandMark: String(form.get("brandMark")),
        subtitle: String(form.get("subtitle")),
        description: String(form.get("description")),
        generationPoem: String(form.get("generationPoem") || "").trim()
      });
      setFamily(updated);
      setDrawer(null);
      setNotice("族谱设置已保存");
      window.setTimeout(() => setNotice(""), 3000);
    } catch (reason) { showError(reason); } finally { setBusy(false); }
  }

  function exportData() {
    if (!family) return;
    const blob = new Blob([JSON.stringify(family, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${family.familyName}-${new Date().toISOString().slice(0, 10)}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  async function importData(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file || !window.confirm("导入会覆盖当前全部族谱数据，确定继续吗？")) return;
    try {
      const data = JSON.parse(await file.text()) as FamilyData;
      const imported = await api.importFamily(data);
      setFamily(imported);
      setSelected(undefined);
    } catch (reason) { showError(reason instanceof SyntaxError ? new Error("文件不是有效的 JSON 数据") : reason); }
    event.target.value = "";
  }

  function openNewPerson() {
    setSidebarOpen(false);
    setEditing(undefined);
    setDrawer("person");
  }

  if (!family) {
    return <div className="loading-screen"><span>枝脉</span><p>{error || "正在展开家族脉络…"}</p></div>;
  }

  return (
    <div className="app-shell">
      <header className="topbar relative">
        <button className="icon-button mobile-only" onClick={() => { setDrawer(null); setSelected(undefined); setSidebarOpen(true); }} aria-label="打开成员列表"><Menu /></button>
        <div className="brand">
          <div className="brand__seal">{family.brandMark || family.surname || "枝"}</div>
          <div><strong>{family.familyName}</strong><span>{family.subtitle || "电子族谱 · 枝脉相承"}</span></div>
        </div>
        <div className="topbar__stats">
          <span><UsersRound size={16} /> {family.people.length} 位成员</span>
          <span><GitBranch size={16} /> {family.relations.length} 条关系</span>
        </div>
        <div className="topbar__actions relative">
          {family?.generationPoem && (
            <button
              className="button button--soft"
              onClick={() => setShowGenerationPopup(!showGenerationPopup)}
              title="查看字辈"
            >
              <BookOpenText size={17} /> 字辈
            </button>
          )}
          <button className="button button--soft" onClick={() => openDrawer("relation")} disabled={family.people.length < 2}><HeartHandshake size={17} /> 添加关系</button>
          <button className="button button--primary" onClick={openNewPerson}><UserRoundPlus size={17} /> 添加成员</button>

          {family?.generationPoem && showGenerationPopup && (
            <div className="generation-popover" onClick={(e) => e.stopPropagation()}>
              <div className="generation-content">
                {family.generationPoem.split("\n").map((line, lineIndex) => (
                  <div className="generation-line" key={lineIndex}>
                    {Array.from(line).map((char, index) =>
                      /[\u4e00-\u9fa5]/.test(char) ? (
                        <span key={index} className="char">{char}</span>
                      ) : (
                        <span key={index} className="punct">{char}</span>
                      )
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </header>

      {sidebarOpen && <button className="sidebar-backdrop mobile-only" onClick={() => setSidebarOpen(false)} aria-label="关闭成员列表" />}

      <aside className={`sidebar ${sidebarOpen ? "is-open" : ""}`}>
        <div className="sidebar__mobile-title mobile-only"><strong>家族成员</strong><button className="icon-button" onClick={() => setSidebarOpen(false)}><X /></button></div>
        <div className="search-box"><Search size={17} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="搜索姓名、职业、居住地" /></div>
        <div className="member-list">
          {filteredPeople.map((person) => (
            <button
              key={person.id}
              className={`member-row ${selected?.id === person.id ? "is-active" : ""}`}
              onClick={() => { setSelected(person); setSidebarOpen(false); }}
            >
              <span className={`member-row__avatar gender-${person.gender}`}>{person.avatar ? <img src={person.avatar} alt="" /> : nameAvatarText(person.name)}</span>
              <span><strong>{person.name}</strong><small>{person.occupation || person.location || (person.generation !== undefined ? `第 ${person.generation} 代` : "资料待补充")}</small></span>
            </button>
          ))}
          {!filteredPeople.length && <div className="list-empty">{search ? "没有找到匹配成员" : "尚未添加成员"}</div>}
        </div>
        <div className="sidebar__footer">
          <button onClick={exportData}><Download size={16} /> 导出备份</button>
          <button onClick={() => importRef.current?.click()}><Upload size={16} /> 导入数据</button>
          <button onClick={() => openDrawer("settings")}><Settings2 size={16} /> 族谱设置</button>
          <input ref={importRef} type="file" accept="application/json" hidden onChange={importData} />
        </div>
      </aside>

      <main className="graph-stage">
        <div className="graph-stage__caption">
          <span>家族关系全景</span>
          <small>滚轮缩放 · 拖动画布 · 点击成员查看资料</small>
        </div>
        <FamilyGraph data={family} selectedId={selected?.id} onSelect={setSelected} />
      </main>

      {selected && (
        <aside className="detail-panel">
          <button className="detail-panel__close" onClick={() => setSelected(undefined)}><X size={20} /></button>
          <div className={`detail-hero gender-${selected.gender}`}>
            <div className="detail-avatar">{selected.avatar ? <img src={selected.avatar} alt="" /> : nameAvatarText(selected.name)}</div>
            <div><span>{selected.generation !== undefined ? `第 ${selected.generation} 代` : genderLabels[selected.gender]}</span><h2>{selected.name}</h2><p>{selected.occupation || "家族成员"}</p></div>
          </div>
          <div className="detail-actions">
            <button onClick={() => { setEditing(selected); openDrawer("person"); }}><Pencil size={15} /> 编辑</button>
            <button onClick={() => openDrawer("relation")}><Plus size={15} /> 连接</button>
            <button className="danger" onClick={() => deletePerson(selected)} disabled={busy}><Trash2 size={15} /> 删除</button>
          </div>
          <div className="detail-content">
            {(selected.birthDate || selected.deathDate) && <div className="detail-line"><CalendarDays /><div><small>生卒</small><span>{selected.birthDate || "未知"} — {selected.isLiving ? "今" : selected.deathDate || "未知"}</span></div></div>}
            {selected.location && <div className="detail-line"><MapPin /><div><small>居住地</small><span>{selected.location}</span></div></div>}
            {selected.biography && <div className="biography"><h3><BookOpenText size={17} /> 人物小传</h3><p>{selected.biography}</p></div>}
            <div className="relations-list">
              <h3><GitBranch size={17} /> 亲属关系 <span>{selectedRelations.length}</span></h3>
              {selectedRelations.map((relation) => {
                const otherId = relation.fromPersonId === selected.id ? relation.toPersonId : relation.fromPersonId;
                return (
                  <div className="relation-row" key={relation.id}>
                    <div><strong>{personName(otherId)}</strong><span>{relation.label || relationLabels[relation.type]}</span></div>
                    <button onClick={() => deleteRelation(relation)} title="删除关系"><X size={15} /></button>
                  </div>
                );
              })}
              {!selectedRelations.length && <p className="muted">尚未连接亲属关系</p>}
            </div>
          </div>
        </aside>
      )}

      {drawer && (
        <div className="drawer-backdrop" onMouseDown={(event) => event.target === event.currentTarget && setDrawer(null)}>
          <section className="drawer">
            <header className="drawer__header">
              <div><span>{drawer === "person" ? "MEMBER" : drawer === "relation" ? "RELATION" : "SETTINGS"}</span><h2>{drawer === "person" ? (editing ? "编辑成员资料" : "添加家族成员") : drawer === "relation" ? "建立亲属关系" : "族谱设置"}</h2></div>
              <button className="icon-button" onClick={() => { setDrawer(null); setEditing(undefined); }}><X /></button>
            </header>
            {error && <div className="error-banner">{error}<button onClick={() => setError("")}><X size={14} /></button></div>}
            {drawer === "person" && <PersonForm person={editing} surname={family.surname} busy={busy} onSubmit={savePerson} onCancel={() => setDrawer(null)} />}
            {drawer === "relation" && <RelationForm people={family.people} initialFromId={selected?.id} busy={busy} onSubmit={saveRelation} onCancel={() => setDrawer(null)} />}
            {drawer === "settings" && (
              <form className="drawer-form" onSubmit={saveFamilyInfo}>
                <div className="form-grid settings-brand-grid">
                  <label className="field">
                    <span>家族姓氏</span>
                    <input name="surname" maxLength={20} defaultValue={family.surname} placeholder="例如：陈" />
                  </label>
                  <label className="field">
                    <span>印章字 *</span>
                    <input name="brandMark" maxLength={2} required defaultValue={family.brandMark || family.surname || "枝"} placeholder="例如：陈" />
                  </label>
                </div>
                <label className="field"><span>族谱名称 *</span><input name="familyName" required defaultValue={family.familyName} /></label>
                <label className="field"><span>顶部副标题</span><input name="subtitle" maxLength={100} defaultValue={family.subtitle || "电子族谱 · 枝脉相承"} placeholder="例如：电子族谱 · 血脉相承" /></label>
                <label className="field"><span>族谱简介</span><textarea name="description" rows={5} defaultValue={family.description} /></label>
                <label className="field"><span>字辈诗文</span><textarea name="generationPoem" rows={3} defaultValue={family.generationPoem} placeholder="例如：源远流长枝脉相承（无需空格，自动按字展示）" /></label>
                <div className="privacy-note"><strong>隐私提示</strong><p>本项目不会主动上传数据，但导出的备份包含全部成员资料。将仓库公开到 GitHub 时，请勿提交 data 目录中的私人数据。</p></div>
                <div className="form-actions"><button className="button button--ghost" type="button" onClick={() => setDrawer(null)}>取消</button><button className="button button--primary" disabled={busy}>保存设置</button></div>
              </form>
            )}
          </section>
        </div>
      )}

      {notice && !drawer && <div className="toast toast--success">{notice}</div>}
      {error && !drawer && <div className="toast">{error}<button onClick={() => setError("")}><X size={15} /></button></div>}
    </div>
  );
}
