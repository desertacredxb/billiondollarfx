import { BOARD_STAGES, dubaiTime, OUTCOME_LABELS, type BoardStage, type Lead, type LeadLane } from "../../lib/crm";

const accents: Record<BoardStage, string> = {
  new: "border-t-sky-400", follow_up: "border-t-amber-400", worked: "border-t-indigo-400",
  qualified: "border-t-emerald-400", account_opened: "border-t-teal-400", closed: "border-t-slate-500",
};

export default function LeadBoard({ lanes, agentNames, onOpen, onStage }: {
  lanes: LeadLane[];
  agentNames?: Map<string, string>;
  onOpen: (lead: Lead) => void;
  onStage: (stage: BoardStage) => void;
}) {
  return <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
    {lanes.map(lane => <section key={lane.stage} className={"min-w-0 rounded-lg border border-slate-700 border-t-2 bg-[#0b1423] p-3 " + accents[lane.stage]}>
      <h3 className="flex items-center justify-between gap-2 font-semibold">
        {BOARD_STAGES[lane.stage]}<span className="text-sm font-normal tabular-nums text-slate-300">{lane.total.toLocaleString("en-GB")}</span>
      </h3>
      {lane.total === 0 ? <p className="mt-3 text-sm text-slate-400">No leads</p> : <>
        <ul className="mt-3 space-y-2">{lane.rows.map(lead => <li key={lead.id}>
          <button type="button" onClick={() => onOpen(lead)} className="w-full rounded-md border border-slate-700 bg-[#141f31] px-3 py-2 text-left text-sm hover:border-[#d6b659]">
            <strong className="block truncate">{lead.name || lead.phone || lead.leadId}</strong>
            {lead.name && <span className="block text-slate-300">{lead.phone}</span>}
            <span className="block truncate text-xs text-slate-400">{[agentNames && lead.assignedTo ? agentNames.get(lead.assignedTo) : "", lead.source].filter(Boolean).join(" · ")}</span>
            {lead.outcome && <span className="mt-1 block text-xs">{OUTCOME_LABELS[lead.outcome]}</span>}
            {lead.note && <span className="line-clamp-2 break-words text-xs text-slate-300">{lead.note}</span>}
            {lead.followUpAt && <span className="mt-1 block text-xs text-amber-200">Callback · {dubaiTime(lead.followUpAt)} Dubai</span>}
          </button>
        </li>)}</ul>
        {lane.total > lane.rows.length && <button type="button" className="mt-3 text-sm text-[#e0bf65] underline underline-offset-4" onClick={() => onStage(lane.stage)}>View all {lane.total.toLocaleString("en-GB")} · {BOARD_STAGES[lane.stage]}</button>}
      </>}
    </section>)}
  </div>;
}
