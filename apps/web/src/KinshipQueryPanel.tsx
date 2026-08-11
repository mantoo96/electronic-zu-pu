import { ArrowLeftRight, ArrowRight, RotateCcw, X } from "lucide-react";
import type { KinshipChainItem, KinshipLineageBranch, KinshipLineageTrace, MutualKinshipResult } from "./kinship";
import { nameAvatarText } from "./labels";
import type { Person } from "./types";

interface Props {
  first?: Person;
  second?: Person;
  result?: MutualKinshipResult;
  onReset: () => void;
  onClose: () => void;
}

function PersonSlot({ person, order }: { person?: Person; order: number }) {
  return (
    <div className={`kinship-person-slot ${person ? "is-filled" : ""}`}>
      <span className={`kinship-person-avatar ${person ? `gender-${person.gender}` : ""}`}>
        {person ? (person.avatar ? <img src={person.avatar} alt="" /> : nameAvatarText(person.name)) : order}
      </span>
      <div><small>第 {order} 位</small><strong>{person?.name || "请在主图中选择"}</strong></div>
    </div>
  );
}

function TraceChain({ branch, commonAncestor }: { branch: KinshipLineageBranch; commonAncestor: KinshipLineageTrace["commonAncestor"] }) {
  return (
    <div className="kinship-trace-chain">
      <strong className="is-common">{commonAncestor.name}</strong>
      {branch.steps.map((step) => (
        <span className="kinship-trace-step" key={step.personId}>
          <ArrowRight size={12} aria-hidden="true" />
          <em title={`${commonAncestor.name}称呼${step.name}`}>{step.relation}</em>
          <strong>{step.name}</strong>
        </span>
      ))}
    </div>
  );
}

function LineageTraceView({ trace, first, second }: { trace: KinshipLineageTrace; first: Person; second: Person }) {
  const directBranch = trace.commonAncestor.personId === first.id
    ? trace.secondBranch
    : trace.commonAncestor.personId === second.id
      ? trace.firstBranch
      : undefined;

  if (directBranch) {
    return (
      <>
        <div className="kinship-trace-heading"><span>直系脉络</span></div>
        <div className="kinship-trace-branch is-direct">
          <TraceChain branch={directBranch} commonAncestor={trace.commonAncestor} />
        </div>
      </>
    );
  }

  return (
    <>
      <div className="kinship-trace-heading">
        <span>共同长辈</span>
        <strong>{trace.commonAncestor.name}</strong>
      </div>
      <div className="kinship-trace-branch">
        <span>{first.name}这一支</span>
        <TraceChain branch={trace.firstBranch} commonAncestor={trace.commonAncestor} />
      </div>
      <div className="kinship-trace-branch">
        <span>{second.name}这一支</span>
        <TraceChain branch={trace.secondBranch} commonAncestor={trace.commonAncestor} />
      </div>
    </>
  );
}

function RelationshipChain({ firstName, chain }: { firstName: string; chain: KinshipChainItem[] }) {
  return (
    <div className="kinship-trace-chain">
      <strong>{firstName}</strong>
      {chain.map((step) => (
        <span className="kinship-trace-step" key={step.personId}>
          <ArrowRight size={12} aria-hidden="true" />
          <em>{step.relation}</em>
          <strong>{step.name}</strong>
        </span>
      ))}
    </div>
  );
}

export function KinshipQueryPanel({ first, second, result, onReset, onClose }: Props) {
  return (
    <section className={`kinship-query-panel ${result ? "has-result" : ""}`} aria-live="polite">
      <header>
        <div><span>称呼查询</span><small>{second ? "已算出双方称呼" : first ? "再点一位成员" : "依次点选两位成员"}</small></div>
        <button type="button" onClick={onClose} aria-label="退出称呼查询"><X size={18} /></button>
      </header>

      <div className="kinship-selection">
        <PersonSlot person={first} order={1} />
        <ArrowLeftRight size={18} />
        <PersonSlot person={second} order={2} />
      </div>

      {first && second && result && (
        <div className="kinship-result">
          <div className="kinship-answer">
            <span>{first.name}称呼{second.name}</span>
            <strong>{result.firstToSecond.term}</strong>
            {result.firstToSecond.isCustom && <small>普通话：{result.firstToSecond.standardTerm}</small>}
          </div>
          <div className="kinship-answer">
            <span>{second.name}称呼{first.name}</span>
            <strong>{result.secondToFirst.term}</strong>
            {result.secondToFirst.isCustom && <small>普通话：{result.secondToFirst.standardTerm}</small>}
          </div>
          <div className="kinship-path">
            {result.lineageTrace ? (
              <LineageTraceView trace={result.lineageTrace} first={first} second={second} />
            ) : (
              <>
                <div className="kinship-trace-heading"><span>关系路径</span></div>
                <RelationshipChain firstName={first.name} chain={result.firstToSecond.chain} />
              </>
            )}
            {(result.firstToSecond.note || !result.firstToSecond.connected) && <small>{result.firstToSecond.note}</small>}
          </div>
        </div>
      )}

      <footer>
        <button type="button" onClick={onReset} disabled={!first}><RotateCcw size={15} /> 重新选择</button>
        <span>点过的成员会标为 ①、②</span>
      </footer>
    </section>
  );
}
