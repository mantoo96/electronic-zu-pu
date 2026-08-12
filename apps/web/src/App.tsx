import { useEffect, useMemo, useRef, useState } from "react";
import {
  BookOpenText,
  CalendarDays,
  Download,
  GitBranch,
  HeartHandshake,
  LockKeyhole,
  MapPin,
  Menu,
  Pencil,
  Plus,
  Search,
  Settings2,
  ShieldCheck,
  Trash2,
  Upload,
  UserRoundPlus,
  UsersRound,
  X
} from "lucide-react";
import { AdminLoginForm } from "./AdminLoginForm";
import { api, ApiError } from "./api";
import { FamilyGraph } from "./FamilyGraph";
import { KinshipQueryPanel } from "./KinshipQueryPanel";
import { KinshipTermSettings } from "./KinshipTermSettings";
import { resolveMutualKinship } from "./kinship";
import { createLineageView } from "./lineageView";
import { getGenderLabels, getRelationLabels, nameAvatarText } from "./labels";
import { localeOptions, localizeApiMessage, useI18n } from "./i18n";
import { PersonForm } from "./PersonForm";
import { RelationForm } from "./RelationForm";
import type { AuthStatus, FamilyData, Person, PersonInput, Relation, RelationInput } from "./types";

type Drawer = "person" | "relation" | "settings" | "auth" | null;

export default function App() {
  const { locale, setLocale, t } = useI18n();
  const genderLabels = getGenderLabels(t);
  const relationLabels = getRelationLabels(t);
  const [family, setFamily] = useState<FamilyData | null>(null);
  const [auth, setAuth] = useState<AuthStatus | null>(null);
  const [selected, setSelected] = useState<Person>();
  const [editing, setEditing] = useState<Person>();
  const [drawer, setDrawer] = useState<Drawer>(null);
  const [busy, setBusy] = useState(false);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showGenerationPopup, setShowGenerationPopup] = useState(false);
  const [kinshipMode, setKinshipMode] = useState(false);
  const [kinshipSelection, setKinshipSelection] = useState<string[]>([]);
  const [kinshipDraft, setKinshipDraft] = useState<Record<string, string>>({});
  const [lineageOnly, setLineageOnly] = useState(false);
  const importRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    Promise.all([api.getFamily(), api.getAuthStatus()])
      .then(([familyData, authStatus]) => { setFamily(familyData); setAuth(authStatus); })
      .catch((reason) => setError(reason.message));
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

  const kinshipPeople = useMemo(() => kinshipSelection.map((id) => family?.people.find((person) => person.id === id)).filter((person): person is Person => Boolean(person)), [family, kinshipSelection]);
  const kinshipResult = useMemo(() => {
    if (!family || kinshipSelection.length !== 2) return undefined;
    return resolveMutualKinship(family, kinshipSelection[0], kinshipSelection[1]);
  }, [family, kinshipSelection]);
  const lineageView = useMemo(() => family ? createLineageView(family) : null, [family]);
  const graphData = lineageOnly && lineageView ? lineageView.data : family;
  const isAdmin = auth?.isAdmin === true;

  function personName(id: string) {
    return family?.people.find((person) => person.id === id)?.name || t("unknownMember");
  }

  function showError(reason: unknown) {
    if (reason instanceof ApiError && reason.status === 401) {
      setAuth((current) => ({ configured: current?.configured ?? true, isAdmin: false }));
      setDrawer("auth");
    }
    setError(reason instanceof ApiError
      ? localizeApiMessage(reason.message, locale, reason.code)
      : reason instanceof Error
        ? localizeApiMessage(reason.message, locale)
        : t("actionFailed"));
  }

  function openDrawer(nextDrawer: Exclude<Drawer, null>) {
    if (nextDrawer !== "auth" && nextDrawer !== "settings" && !isAdmin) return;
    setSidebarOpen(false);
    if (nextDrawer === "settings") setKinshipDraft({ ...(family?.kinshipOverrides || {}) });
    setDrawer(nextDrawer);
  }

  async function loginAdmin(password: string) {
    setBusy(true);
    setError("");
    try {
      setAuth(await api.login(password));
      setDrawer(null);
      setNotice(t("adminModeEntered"));
      window.setTimeout(() => setNotice(""), 3000);
    } catch (reason) { showError(reason); } finally { setBusy(false); }
  }

  async function logoutAdmin() {
    try {
      setAuth(await api.logout());
      setDrawer(null);
      setEditing(undefined);
      setNotice(t("browseModeEntered"));
      window.setTimeout(() => setNotice(""), 3000);
    } catch (reason) { showError(reason); }
  }

  function toggleKinshipMode() {
    setDrawer(null);
    setSelected(undefined);
    setSidebarOpen(false);
    setKinshipMode((current) => {
      if (current) setKinshipSelection([]);
      return !current;
    });
  }

  function selectFromGraph(person: Person) {
    if (!kinshipMode) {
      setSelected(person);
      return;
    }
    setKinshipSelection((current) => {
      if (current.length >= 2) return [person.id];
      if (current[0] === person.id) return [];
      return [...current, person.id];
    });
  }

  function switchGraphView(nextLineageOnly: boolean) {
    setLineageOnly(nextLineageOnly);
    setSelected(undefined);
    setKinshipSelection([]);
  }

  async function savePerson(input: PersonInput) {
    if (!isAdmin) return;
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
    if (!isAdmin) return;
    if (!window.confirm(t("deletePersonConfirm", { name: person.name }))) return;
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
    if (!isAdmin) return;
    setBusy(true);
    setError("");
    try {
      const relation = await api.createRelation(input);
      setFamily((current) => current && ({ ...current, relations: [...current.relations, relation] }));
      setDrawer(null);
    } catch (reason) { showError(reason); } finally { setBusy(false); }
  }

  async function deleteRelation(relation: Relation) {
    if (!isAdmin) return;
    if (!window.confirm(t("deleteRelationConfirm"))) return;
    try {
      await api.deleteRelation(relation.id);
      setFamily((current) => current && ({ ...current, relations: current.relations.filter((item) => item.id !== relation.id) }));
    } catch (reason) { showError(reason); }
  }

  async function saveFamilyInfo(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!family || !isAdmin) return;
    setBusy(true);
    const form = new FormData(event.currentTarget);
    try {
      const updated = await api.updateFamily({
        surname: String(form.get("surname")),
        familyName: String(form.get("familyName")),
        brandMark: String(form.get("brandMark")),
        subtitle: String(form.get("subtitle")),
        description: String(form.get("description")),
        generationPoem: String(form.get("generationPoem") || "").trim(),
        kinshipOverrides: Object.fromEntries(
          Object.entries(kinshipDraft)
            .map(([key, value]) => [key, value.trim()] as const)
            .filter(([, value]) => Boolean(value))
        )
      });
      setFamily(updated);
      setDrawer(null);
      setNotice(t("settingsSaved"));
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
    if (!isAdmin) return;
    const file = event.target.files?.[0];
    if (!file || !window.confirm(t("importConfirm"))) return;
    try {
      const data = JSON.parse(await file.text()) as FamilyData;
      const imported = await api.importFamily(data);
      setFamily(imported);
      setSelected(undefined);
      setKinshipMode(false);
      setKinshipSelection([]);
      setLineageOnly(false);
    } catch (reason) { showError(reason instanceof SyntaxError ? new Error(t("invalidJson")) : reason); }
    event.target.value = "";
  }

  function openNewPerson() {
    if (!isAdmin) return;
    setSidebarOpen(false);
    setEditing(undefined);
    setDrawer("person");
  }

  if (!family) {
    return <div className="loading-screen"><span>{t("loadingBrand")}</span><p>{error || t("loading")}</p></div>;
  }

  return (
    <div className="app-shell">
      <header className="topbar relative">
        <button className="icon-button mobile-only" onClick={() => { setDrawer(null); setSelected(undefined); setSidebarOpen(true); }} aria-label={t("openMembers")}><Menu /></button>
        <div className="brand">
          <div className="brand__seal">{family.brandMark || family.surname || "枝"}</div>
          <div><strong>{family.familyName}</strong><span>{family.subtitle || t("defaultSubtitle")}</span></div>
        </div>
        <div className="topbar__stats">
          <span><UsersRound size={16} /> {t("memberCount", { count: family.people.length })}</span>
          <span><GitBranch size={16} /> {t("relationCount", { count: family.relations.length })}</span>
        </div>
        <div className="topbar__actions relative">
          <button
            className={`button button--soft admin-trigger ${isAdmin ? "is-active" : ""}`}
            onClick={isAdmin ? logoutAdmin : () => openDrawer("auth")}
            title={isAdmin ? t("exitAdmin") : t("adminLogin")}
          >
            {isAdmin ? <ShieldCheck size={17} /> : <LockKeyhole size={17} />}
            {isAdmin ? t("adminMode") : t("browseMode")}
          </button>
          <button
            className={`button button--soft kinship-trigger ${kinshipMode ? "is-active" : ""}`}
            onClick={toggleKinshipMode}
            disabled={family.people.length < 2}
            title={t("kinshipButtonTitle")}
          >
            <Search size={17} /> {kinshipMode ? t("exitQuery") : t("queryKinship")}
          </button>
          {family?.generationPoem && (
            <button
              className="button button--soft"
              onClick={() => setShowGenerationPopup(!showGenerationPopup)}
              title={t("viewGenerationPoem")}
            >
              <BookOpenText size={17} /> {t("generationPoem")}
            </button>
          )}
          {isAdmin && <button className="button button--soft" onClick={() => openDrawer("relation")} disabled={family.people.length < 2}><HeartHandshake size={17} /> {t("addRelation")}</button>}
          {isAdmin && <button className="button button--primary" onClick={openNewPerson}><UserRoundPlus size={17} /> {t("addMember")}</button>}

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

      {sidebarOpen && <button className="sidebar-backdrop mobile-only" onClick={() => setSidebarOpen(false)} aria-label={t("closeMembers")} />}

      <aside className={`sidebar ${sidebarOpen ? "is-open" : ""}`}>
        <div className="sidebar__mobile-title mobile-only"><strong>{t("familyMembers")}</strong><button className="icon-button" onClick={() => setSidebarOpen(false)}><X /></button></div>
        <div className="search-box"><Search size={17} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder={t("searchPlaceholder")} /></div>
        <div className="member-list">
          {filteredPeople.map((person) => (
            <button
              key={person.id}
              className={`member-row ${selected?.id === person.id ? "is-active" : ""}`}
              onClick={() => { setSelected(person); setSidebarOpen(false); }}
            >
              <span className={`member-row__avatar gender-${person.gender}`}>{person.avatar ? <img src={person.avatar} alt="" /> : nameAvatarText(person.name)}</span>
              <span><strong>{person.name}</strong><small>{person.occupation || person.location || (person.generation !== undefined ? t("generationNumber", { count: person.generation }) : t("infoPending"))}</small></span>
            </button>
          ))}
          {!filteredPeople.length && <div className="list-empty">{search ? t("noSearchResults") : t("noMembers")}</div>}
        </div>
        <div className="sidebar__footer">
          {isAdmin && <>
            <button onClick={exportData}><Download size={16} /> {t("exportBackup")}</button>
            <button onClick={() => importRef.current?.click()}><Upload size={16} /> {t("importData")}</button>
          </>}
          <button onClick={() => openDrawer("settings")}><Settings2 size={16} /> {t("settings")}</button>
          {!isAdmin && <div className="readonly-note"><LockKeyhole size={14} /><span>{t("readOnlyMode")}</span></div>}
          <input ref={importRef} type="file" accept="application/json" hidden onChange={importData} />
        </div>
      </aside>

      <main className="graph-stage">
        <div className="graph-stage__caption">
          <span>{kinshipMode ? t("queryingKinship") : lineageOnly ? t("lineageOverview") : t("familyOverview")}</span>
          <small>{kinshipMode
            ? kinshipSelection.length === 2
              ? t("queryCompleteHint")
              : kinshipSelection.length === 1
                ? t("querySecondHint")
                : t("queryFirstHint")
            : lineageOnly
              ? t("lineageHint", { count: lineageView?.hiddenPersonIds.size || 0 })
              : t("graphHint")}</small>
        </div>
        <div className="graph-view-switch" role="group" aria-label={t("graphViewLabel")}>
          <button type="button" className={!lineageOnly ? "is-active" : ""} onClick={() => switchGraphView(false)}>{t("fullTree")}</button>
          <button
            type="button"
            className={lineageOnly ? "is-active" : ""}
            onClick={() => switchGraphView(true)}
            disabled={!lineageView?.spouseRelationCount}
            title={t("directLineTitle")}
          >{t("directLine")}</button>
        </div>
        <FamilyGraph
          key={lineageOnly ? "lineage-left-to-right" : "full-top-to-bottom"}
          data={graphData || family}
          selectedId={selected?.id}
          selectionIds={kinshipMode ? kinshipSelection : []}
          layoutDirection={lineageOnly ? "LR" : "TB"}
          onSelect={selectFromGraph}
        />
        {kinshipMode && (
          <KinshipQueryPanel
            first={kinshipPeople[0]}
            second={kinshipPeople[1]}
            result={kinshipResult}
            onReset={() => setKinshipSelection([])}
            onClose={() => { setKinshipMode(false); setKinshipSelection([]); }}
          />
        )}
      </main>

      {selected && (
        <aside className="detail-panel">
          <button className="detail-panel__close" onClick={() => setSelected(undefined)}><X size={20} /></button>
          <div className={`detail-hero gender-${selected.gender}`}>
            <div className="detail-avatar">{selected.avatar ? <img src={selected.avatar} alt="" /> : nameAvatarText(selected.name)}</div>
            <div><span>{selected.generation !== undefined ? t("generationNumber", { count: selected.generation }) : genderLabels[selected.gender]}</span><h2>{selected.name}</h2><p>{selected.occupation || t("familyMember")}</p></div>
          </div>
          {isAdmin && <div className="detail-actions">
            <button onClick={() => { setEditing(selected); openDrawer("person"); }}><Pencil size={15} /> {t("edit")}</button>
            <button onClick={() => openDrawer("relation")}><Plus size={15} /> {t("connect")}</button>
            <button className="danger" onClick={() => deletePerson(selected)} disabled={busy}><Trash2 size={15} /> {t("delete")}</button>
          </div>}
          <div className="detail-content">
            {(selected.birthDate || selected.deathDate) && <div className="detail-line"><CalendarDays /><div><small>{t("lifespan")}</small><span>{selected.birthDate || t("unknown")} — {selected.isLiving ? t("present") : selected.deathDate || t("unknown")}</span></div></div>}
            {selected.location && <div className="detail-line"><MapPin /><div><small>{t("location")}</small><span>{selected.location}</span></div></div>}
            {selected.biography && <div className="biography"><h3><BookOpenText size={17} /> {t("biography")}</h3><p>{selected.biography}</p></div>}
            <div className="relations-list">
              <h3><GitBranch size={17} /> {t("relationships")} <span>{selectedRelations.length}</span></h3>
              {selectedRelations.map((relation) => {
                const otherId = relation.fromPersonId === selected.id ? relation.toPersonId : relation.fromPersonId;
                return (
                  <div className="relation-row" key={relation.id}>
                    <div><strong>{personName(otherId)}</strong><span>{relation.label || relationLabels[relation.type]}</span></div>
                    {isAdmin && <button onClick={() => deleteRelation(relation)} title={t("deleteRelationship")}><X size={15} /></button>}
                  </div>
                );
              })}
              {!selectedRelations.length && <p className="muted">{t("noRelationships")}</p>}
            </div>
          </div>
        </aside>
      )}

      {drawer && (
        <div className="drawer-backdrop" onMouseDown={(event) => event.target === event.currentTarget && setDrawer(null)}>
          <section className="drawer">
            <header className="drawer__header">
              <div>
                <span>{drawer === "person" ? t("memberMeta") : drawer === "relation" ? t("relationMeta") : drawer === "settings" ? t("settingsMeta") : t("adminMeta")}</span>
                <h2>{drawer === "person" ? (editing ? t("editMember") : t("addFamilyMember")) : drawer === "relation" ? t("createRelationship") : drawer === "settings" ? t("settings") : t("adminLogin")}</h2>
              </div>
              <button className="icon-button" onClick={() => { setDrawer(null); setEditing(undefined); }}><X /></button>
            </header>
            {error && <div className="error-banner">{error}<button onClick={() => setError("")}><X size={14} /></button></div>}
            {drawer === "auth" && <AdminLoginForm configured={auth?.configured ?? false} busy={busy} onSubmit={loginAdmin} onCancel={() => { setDrawer(null); setError(""); }} />}
            {drawer === "person" && <PersonForm person={editing} surname={family.surname} busy={busy} onSubmit={savePerson} onCancel={() => setDrawer(null)} />}
            {drawer === "relation" && <RelationForm people={family.people} initialFromId={selected?.id} busy={busy} onSubmit={saveRelation} onCancel={() => setDrawer(null)} />}
            {drawer === "settings" && (
              <form className="drawer-form" onSubmit={saveFamilyInfo}>
                <section className="language-settings" aria-labelledby="language-settings-title">
                  <div className="settings-section-heading">
                    <div>
                      <span id="language-settings-title">{t("languageAndDisplay")}</span>
                      <p>{t("languageHelp")}</p>
                    </div>
                  </div>
                  <div className="language-options" role="radiogroup" aria-label={t("languageAndDisplay")}>
                    {localeOptions.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        role="radio"
                        aria-checked={locale === option.value}
                        className={locale === option.value ? "is-active" : ""}
                        onClick={() => setLocale(option.value)}
                      >
                        <strong>{option.shortLabel}</strong><span>{option.label}</span>
                      </button>
                    ))}
                  </div>
                </section>
                {isAdmin ? <>
                  <section className="settings-family-section">
                    <div className="settings-section-heading settings-family-heading">
                      <div><span>{t("familySettings")}</span><p>{t("adminSettingsHelp")}</p></div>
                    </div>
                    <div className="form-grid settings-brand-grid">
                      <label className="field">
                        <span>{t("surname")}</span>
                        <input name="surname" maxLength={20} defaultValue={family.surname} placeholder={t("surnamePlaceholder")} />
                      </label>
                      <label className="field">
                        <span>{t("sealCharacter")}</span>
                        <input name="brandMark" maxLength={2} required defaultValue={family.brandMark || family.surname || "枝"} placeholder={t("surnamePlaceholder")} />
                      </label>
                    </div>
                    <label className="field"><span>{t("familyName")}</span><input name="familyName" required defaultValue={family.familyName} /></label>
                    <label className="field"><span>{t("topSubtitle")}</span><input name="subtitle" maxLength={100} defaultValue={family.subtitle || t("defaultSubtitle")} placeholder={t("subtitlePlaceholder")} /></label>
                    <label className="field"><span>{t("familyDescription")}</span><textarea name="description" rows={5} defaultValue={family.description} /></label>
                    <label className="field"><span>{t("generationText")}</span><textarea name="generationPoem" rows={3} defaultValue={family.generationPoem} placeholder={t("generationPlaceholder")} /></label>
                  </section>
                  <KinshipTermSettings value={kinshipDraft} onChange={setKinshipDraft} />
                  <div className="privacy-note"><strong>{t("privacyTitle")}</strong><p>{t("privacyBody")}</p></div>
                </> : (
                  <div className="settings-readonly-note"><LockKeyhole size={16} /><span>{t("adminSettingsHelp")}</span></div>
                )}
                <div className="form-actions">
                  <button className="button button--ghost" type="button" onClick={() => setDrawer(null)}>{isAdmin ? t("cancel") : t("close")}</button>
                  {isAdmin && <button className="button button--primary" disabled={busy}>{t("saveSettings")}</button>}
                </div>
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
