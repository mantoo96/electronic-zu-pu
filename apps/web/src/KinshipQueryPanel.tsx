import { ArrowLeftRight, ArrowRight, RotateCcw, X } from "lucide-react";
import type { KinshipChainItem, KinshipLineageBranch, KinshipLineageTrace, MutualKinshipResult } from "./kinship";
import { nameAvatarText } from "./labels";
import type { Person } from "./types";
import { useI18n } from "./i18n";
import { localizeChainRelation, localizeKinshipNote, localizeKinshipResultTerm, localizeKinshipTerm } from "./kinshipLocale";

interface Props {
  first?: Person;
  second?: Person;
  result?: MutualKinshipResult;
  onReset: () => void;
  onClose: () => void;
}

function PersonSlot({ person, order }: { person?: Person; order: number }) {
  const { t } = useI18n();
  return (
    <div className={`kinship-person-slot ${person ? "is-filled" : ""}`}>
      <span className={`kinship-person-avatar ${person ? `gender-${person.gender}` : ""}`}>
        {person ? (person.avatar ? <img src={person.avatar} alt="" /> : nameAvatarText(person.name)) : order}
      </span>
      <div><small>{t("personOrder", { count: order })}</small><strong>{person?.name || t("selectInGraph")}</strong></div>
    </div>
  );
}

function TraceChain({ branch, commonAncestor }: { branch: KinshipLineageBranch; commonAncestor: KinshipLineageTrace["commonAncestor"] }) {
  const { locale } = useI18n();
  return (
    <div className="kinship-trace-chain">
      <strong className="is-common">{commonAncestor.name}</strong>
      {branch.steps.map((step) => (
        <span className="kinship-trace-step" key={step.personId}>
          <ArrowRight size={12} aria-hidden="true" />
          <em>{localizeChainRelation(step, locale)}</em>
          <strong>{step.name}</strong>
        </span>
      ))}
    </div>
  );
}

function LineageTraceView({ trace, first, second }: { trace: KinshipLineageTrace; first: Person; second: Person }) {
  const { t } = useI18n();
  const directBranch = trace.commonAncestor.personId === first.id
    ? trace.secondBranch
    : trace.commonAncestor.personId === second.id
      ? trace.firstBranch
      : undefined;

  if (directBranch) {
    return (
      <>
        <div className="kinship-trace-heading"><span>{t("directLineage")}</span></div>
        <div className="kinship-trace-branch is-direct">
          <TraceChain branch={directBranch} commonAncestor={trace.commonAncestor} />
        </div>
      </>
    );
  }

  return (
    <>
      <div className="kinship-trace-heading">
        <span>{t("commonAncestor")}</span>
        <strong>{trace.commonAncestor.name}</strong>
      </div>
      <div className="kinship-trace-branch">
        <span>{t("branchOf", { name: first.name })}</span>
        <TraceChain branch={trace.firstBranch} commonAncestor={trace.commonAncestor} />
      </div>
      <div className="kinship-trace-branch">
        <span>{t("branchOf", { name: second.name })}</span>
        <TraceChain branch={trace.secondBranch} commonAncestor={trace.commonAncestor} />
      </div>
    </>
  );
}

function RelationshipChain({ firstName, chain }: { firstName: string; chain: KinshipChainItem[] }) {
  const { locale } = useI18n();
  return (
    <div className="kinship-trace-chain">
      <strong>{firstName}</strong>
      {chain.map((step) => (
        <span className="kinship-trace-step" key={step.personId}>
          <ArrowRight size={12} aria-hidden="true" />
          <em>{localizeChainRelation(step, locale)}</em>
          <strong>{step.name}</strong>
        </span>
      ))}
    </div>
  );
}

export function KinshipQueryPanel({ first, second, result, onReset, onClose }: Props) {
  const { locale, t } = useI18n();
  return (
    <section className={`kinship-query-panel ${result ? "has-result" : ""}`} aria-live="polite">
      <header>
        <div><span>{t("kinshipQuery")}</span><small>{second ? t("resultReady") : first ? t("chooseAnother") : t("chooseTwo")}</small></div>
        <button type="button" onClick={onClose} aria-label={t("exitKinshipAria")}><X size={18} /></button>
      </header>

      <div className="kinship-selection">
        <PersonSlot person={first} order={1} />
        <ArrowLeftRight size={18} />
        <PersonSlot person={second} order={2} />
      </div>

      {first && second && result && (
        <div className="kinship-result">
          <div className="kinship-answer">
            <span>{t("calls", { first: first.name, second: second.name })}</span>
            <strong>{localizeKinshipResultTerm(result.firstToSecond, locale)}</strong>
            {result.firstToSecond.isCustom && <small>{t("standardChinese", { term: localizeKinshipTerm(result.firstToSecond.standardTerm, result.firstToSecond.canonicalKey, locale) })}</small>}
          </div>
          <div className="kinship-answer">
            <span>{t("calls", { first: second.name, second: first.name })}</span>
            <strong>{localizeKinshipResultTerm(result.secondToFirst, locale)}</strong>
            {result.secondToFirst.isCustom && <small>{t("standardChinese", { term: localizeKinshipTerm(result.secondToFirst.standardTerm, result.secondToFirst.canonicalKey, locale) })}</small>}
          </div>
          <div className="kinship-path">
            {result.lineageTrace ? (
              <LineageTraceView trace={result.lineageTrace} first={first} second={second} />
            ) : (
              <>
                <div className="kinship-trace-heading"><span>{t("relationshipPath")}</span></div>
                <RelationshipChain firstName={first.name} chain={result.firstToSecond.chain} />
              </>
            )}
            {(result.firstToSecond.note || !result.firstToSecond.connected) && <small>{localizeKinshipNote(result.firstToSecond.note, locale)}</small>}
          </div>
        </div>
      )}

      <footer>
        <button type="button" onClick={onReset} disabled={!first}><RotateCcw size={15} /> {t("resetSelection")}</button>
        <span>{t("selectedMarkerHint")}</span>
      </footer>
    </section>
  );
}
