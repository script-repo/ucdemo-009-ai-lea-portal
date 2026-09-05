/**
 * Shift-handover fixture for the reference use case.
 *
 * Modelled as one officer's full 4-hour overnight shift on Unit 14:
 *   - 5 occurrences attended (3 open, 2 closed)
 *   - 1 officer-notes journal (8 entries)
 *   - 1 outstanding-task list (3 items handed forward)
 *   - 1 radio communications log (key calls only)
 *
 * The simulated inference returns a multi-paragraph narrative grounded
 * in these sources; citations index `HANDOVER_CITATIONS`.
 */

export interface HandoverSource {
  id: string;
  /** Human-readable label for the SourceSelector. */
  label: string;
  description: string;
  iconHint: "document" | "list" | "mail" | "user" | "occurrence" | "shield";
  kind: "occurrence" | "notes" | "tasks" | "radio";
  /** Status only meaningful for occurrence sources. */
  status?: "open" | "closed";
}

export interface HandoverCitation {
  index: number;
  title: string;
  meta: string;
}

export interface HandoverOccurrence {
  id: string;
  occNumber: string;
  type: string;
  status: "open" | "closed";
  attended: string;
  cleared?: string;
  location: string;
  summary: string;
  parties: Array<{ role: "complainant" | "subject" | "witness"; name?: string; redact?: "VICTIM" | "PII" | "JUVENILE" }>;
  followUps: string[];
}

export interface OutstandingTask {
  id: string;
  title: string;
  due: string;
  priority: "high" | "medium" | "low";
  detail: string;
}

export interface RadioEntry {
  id: string;
  at: string;
  channel: "Pri-1" | "Pri-2" | "Tac-3";
  text: string;
}

export interface OfficerNote {
  id: string;
  at: string;
  text: string;
  occurrenceId?: string;
}

// ──────────────────────────────────────────────────────────────────────
// Sources (the items that show up in the SourceSelector)
// ──────────────────────────────────────────────────────────────────────

export const HANDOVER_SOURCES: HandoverSource[] = [
  {
    id: "occ-26-0042",
    label: "Occurrence 26-0042 — MVA",
    description: "Single-vehicle MVA, 02:48, Yonge & Bloor",
    iconHint: "occurrence",
    kind: "occurrence",
    status: "closed",
  },
  {
    id: "occ-26-0043",
    label: "Occurrence 26-0043 — Mental health",
    description: "EDP at Bloor subway, 03:36",
    iconHint: "occurrence",
    kind: "occurrence",
    status: "closed",
  },
  {
    id: "occ-26-0044",
    label: "Occurrence 26-0044 — Domestic",
    description: "Disturbance, 04:52, 44 Charles St W",
    iconHint: "occurrence",
    kind: "occurrence",
    status: "open",
  },
  {
    id: "occ-26-0045",
    label: "Occurrence 26-0045 — Property",
    description: "B&E to commercial unit, 05:18",
    iconHint: "occurrence",
    kind: "occurrence",
    status: "open",
  },
  {
    id: "occ-26-0046",
    label: "Occurrence 26-0046 — Suspicious",
    description: "Subject loitering, 06:04",
    iconHint: "occurrence",
    kind: "occurrence",
    status: "open",
  },
  {
    id: "notes-shift",
    label: "Officer notes — this shift",
    description: "8 contemporaneous entries",
    iconHint: "document",
    kind: "notes",
  },
  {
    id: "tasks-open",
    label: "Outstanding tasks (3)",
    description: "Follow-up items handed to relief",
    iconHint: "list",
    kind: "tasks",
  },
  {
    id: "radio-log",
    label: "Radio communications",
    description: "Key Pri-1 / Pri-2 / Tac-3 traffic",
    iconHint: "mail",
    kind: "radio",
  },
];

// ──────────────────────────────────────────────────────────────────────
// Occurrences
// ──────────────────────────────────────────────────────────────────────

export const HANDOVER_OCCURRENCES: HandoverOccurrence[] = [
  {
    id: "occ-26-0042",
    occNumber: "26-0042",
    type: "Highway Traffic Act — Single-vehicle MVA",
    status: "closed",
    attended: "02:48",
    cleared: "03:14",
    location: "Yonge St & Bloor St E",
    summary: "Single-vehicle collision into a parked vehicle, no injuries. Driver of the moving vehicle issued a Provincial Offences ticket for careless driving (s. 130 HTA). Both vehicles released to drivers; no tow required.",
    parties: [
      { role: "complainant", name: "T. Okorie" },
      { role: "subject", name: "A. Pelletier", redact: "PII" },
    ],
    followUps: [],
  },
  {
    id: "occ-26-0043",
    occNumber: "26-0043",
    type: "Mental Health Act s. 17 — Apprehension",
    status: "closed",
    attended: "03:36",
    cleared: "04:24",
    location: "Bloor-Yonge subway, southbound platform",
    summary: "Emotionally Disturbed Person reported by TTC special constable. Subject was lucid but disclosed active suicidal ideation. Apprehended under MHA s. 17, transported to St. Michael's Emergency without incident. Receiving physician acknowledged transfer at 04:24.",
    parties: [
      { role: "subject", name: "Minor (age 17)", redact: "JUVENILE" },
      { role: "witness", name: "Sp. Cst. R. Adeyemo (TTC)" },
    ],
    followUps: ["Notify guardian via Family Liaison once subject is medically stable."],
  },
  {
    id: "occ-26-0044",
    occNumber: "26-0044",
    type: "Domestic Disturbance — No charges laid",
    status: "open",
    attended: "04:52",
    location: "44 Charles St W, Apt 1208",
    summary: "Verbal-only disturbance between common-law partners. Complainant declined ambulance; no visible injuries. Subject voluntarily relocated to a family member's residence to prevent escalation. File flagged for follow-up by the Domestic Violence coordinator.",
    parties: [
      { role: "complainant", name: "Maya Okafor", redact: "VICTIM" },
      { role: "subject", name: "Daniel Reyes", redact: "PII" },
      { role: "witness", name: "Minor (age 8)", redact: "JUVENILE" },
    ],
    followUps: [
      "Domestic Violence coordinator to schedule follow-up call before 12:00.",
      "Confirm subject relocation held overnight.",
    ],
  },
  {
    id: "occ-26-0045",
    occNumber: "26-0045",
    type: "Break & Enter (Commercial)",
    status: "open",
    attended: "05:18",
    location: "1408 Yonge St — Tim Hortons",
    summary: "Rear service-door window smashed; cash drawer (~$240 CAD) and a tablet missing. CCTV recovered from manager's office shows a single male suspect, dark hooded jacket, entry at 04:41 and exit 04:47. Forensic Identification Services notified for daylight attendance.",
    parties: [
      { role: "complainant", name: "Manager — name on file" },
    ],
    followUps: [
      "Forensic Identification Services to attend after 09:00.",
      "Pull adjacent City of Toronto CCTV (Yonge & Roxborough) for 04:30–05:00.",
      "Cross-reference suspect description against case TPS-26-417 (open).",
    ],
  },
  {
    id: "occ-26-0046",
    occNumber: "26-0046",
    type: "Suspicious Person — No grounds",
    status: "open",
    attended: "06:04",
    location: "1 Yorkville Ave (loading area)",
    summary: "Concierge reported a male loitering near the loading area. On arrival the subject was cooperative, identified, and could not be associated with any active flag. Information report filed for divisional awareness; no offence disclosed.",
    parties: [
      { role: "complainant", name: "Concierge — name on file" },
      { role: "subject", name: "Information report only" },
    ],
    followUps: ["Pass description to day-shift Community Officer for the Yorkville beat."],
  },
];

// ──────────────────────────────────────────────────────────────────────
// Officer notes (chronological)
// ──────────────────────────────────────────────────────────────────────

export const HANDOVER_NOTES: OfficerNote[] = [
  { id: "n-1", at: "02:00", text: "Parade — Sgt. Quinn briefing. 2× FTOs absent. Carry the Charles & Yorkville beats." },
  { id: "n-2", at: "02:50", text: "On-scene 26-0042. Both drivers cooperative; no tow.", occurrenceId: "occ-26-0042" },
  { id: "n-3", at: "03:38", text: "TTC SC flagged me down at Bloor-Yonge — EDP on platform.", occurrenceId: "occ-26-0043" },
  { id: "n-4", at: "04:24", text: "Cleared from St. Mike's after transfer; subject calm.", occurrenceId: "occ-26-0043" },
  { id: "n-5", at: "04:54", text: "On-scene 26-0044. No injuries; subject voluntarily relocating.", occurrenceId: "occ-26-0044" },
  { id: "n-6", at: "05:22", text: "B&E at the Tim Hortons. CCTV pulled — single male suspect.", occurrenceId: "occ-26-0045" },
  { id: "n-7", at: "06:08", text: "Yorkville loitering call cleared as IR only.", occurrenceId: "occ-26-0046" },
  { id: "n-8", at: "06:40", text: "Returned to station for handover briefing." },
];

// ──────────────────────────────────────────────────────────────────────
// Outstanding tasks
// ──────────────────────────────────────────────────────────────────────

export const HANDOVER_TASKS: OutstandingTask[] = [
  {
    id: "t-1",
    title: "Domestic follow-up call to 26-0044 complainant",
    due: "12:00",
    priority: "high",
    detail: "Domestic Violence coordinator. Ensure subject relocation held overnight. Confirm safety plan with complainant.",
  },
  {
    id: "t-2",
    title: "FIS attendance for 26-0045 B&E",
    due: "10:00",
    priority: "medium",
    detail: "Forensic Identification Services to attend after 09:00. Hold scene access if possible.",
  },
  {
    id: "t-3",
    title: "Pull City CCTV — Yonge & Roxborough",
    due: "End of day",
    priority: "medium",
    detail: "Window 04:30–05:00, 2026-04-12. Cross-reference suspect description against TPS-26-417.",
  },
];

// ──────────────────────────────────────────────────────────────────────
// Radio log
// ──────────────────────────────────────────────────────────────────────

export const HANDOVER_RADIO: RadioEntry[] = [
  { id: "r-1", at: "02:46", channel: "Pri-1", text: "14: 10-23, Yonge & Bloor, single-vehicle MVA, no injuries." },
  { id: "r-2", at: "03:34", channel: "Pri-1", text: "14: copy EDP at Bloor-Yonge, en route." },
  { id: "r-3", at: "04:18", channel: "Pri-2", text: "14: at St. Mike's, awaiting transfer of custody." },
  { id: "r-4", at: "04:50", channel: "Pri-1", text: "14: copy 26-0044 — domestic, 44 Charles W apt 1208." },
  { id: "r-5", at: "05:18", channel: "Pri-1", text: "14: 10-23, 1408 Yonge — B&E, suspect departed scene." },
  { id: "r-6", at: "05:24", channel: "Tac-3", text: "14 to FIS sup'r — request daylight attendance, evidence preserved." },
  { id: "r-7", at: "06:04", channel: "Pri-2", text: "14: copy Yorkville suspicious." },
];

// ──────────────────────────────────────────────────────────────────────
// Citations the AI uses to ground each paragraph
// ──────────────────────────────────────────────────────────────────────

export const HANDOVER_CITATIONS: HandoverCitation[] = [
  { index: 1, title: "Occurrence 26-0042 — MVA", meta: "02:48 — Cleared 03:14" },
  { index: 2, title: "Occurrence 26-0043 — MHA s.17", meta: "03:36 — Cleared 04:24" },
  { index: 3, title: "Occurrence 26-0044 — Domestic", meta: "04:52 — Open" },
  { index: 4, title: "Occurrence 26-0045 — B&E commercial", meta: "05:18 — Open" },
  { index: 5, title: "Occurrence 26-0046 — Suspicious (IR)", meta: "06:04 — Information report" },
  { index: 6, title: "Officer notes — entry n-5", meta: "04:54 — On-scene 26-0044" },
  { index: 7, title: "Outstanding task t-1", meta: "Due 12:00 — High priority" },
  { index: 8, title: "Radio log r-6 (Tac-3)", meta: "05:24 — FIS daylight attendance request" },
];

// ──────────────────────────────────────────────────────────────────────
// Canned narrative the simulated LLM "generates"
// ──────────────────────────────────────────────────────────────────────

export const HANDOVER_NARRATIVE = {
  text: [
    "Shift summary — 02:00–06:40, Unit 14, Cst. Brand. Five occurrences attended, three open at handover. Two were closed in-shift (single-vehicle MVA, MHA apprehension); three remain open and require relief attention (domestic, commercial B&E, suspicious-person information report).",
    "Closed in-shift: Occurrence 26-0042 (MVA, no injuries) cleared 03:14; both drivers released, ticket issued to the at-fault driver [1]. Occurrence 26-0043 (MHA s. 17 apprehension) cleared 04:24 with transfer to St. Michael's Emergency; juvenile subject (age 17) — guardian notification still pending via Family Liaison once medically stable [2].",
    "Highest-priority handover: Occurrence 26-0044 (domestic, 44 Charles St W) is open. No charges laid; subject voluntarily relocated overnight. The Domestic Violence coordinator is to schedule a follow-up call to the complainant before 12:00 [3][6][7]. Confirm subject relocation held; if not, escalate.",
    "Investigative carry-over: Occurrence 26-0045 (commercial B&E, 1408 Yonge — Tim Hortons) is open. CCTV recovered shows a single male suspect; description appears consistent with the open file TPS-26-417 — cross-reference is requested [4]. Forensic Identification Services has been requested for daylight attendance [8]; please hold scene access if feasible.",
    "Information only: Occurrence 26-0046 (suspicious person, Yorkville) cleared as IR; description has been passed to the day-shift Community Officer for the Yorkville beat [5]. No offence disclosed.",
  ].join("\n\n"),
  /** Each paragraph's grounding citation indices (into HANDOVER_CITATIONS). */
  paragraphCitations: [[1, 2, 3, 4, 5], [1, 2], [3, 6, 7], [4, 8], [5]],
  confidence: "high" as const,
};
