/**
 * MCP federation fixture for the database-integration use case.
 *
 * Models a Toronto Police Service operator that, in production, would
 * have an MCP gateway federating across:
 *   - tps-records-mcp     → TPS RMS (occurrences, persons)
 *   - mto-bridge-mcp      → Ministry of Transportation (vehicles, drivers)
 *   - cpic-mcp            → Canadian Police Information Centre alerts
 *   - court-records-mcp   → Ontario Court of Justice scheduling
 *   - victim-services-mcp → Victim Services Toronto (limited disclosure)
 *   - ices-flag-mcp       → Health-system flag service (limited fields)
 *   - intel-mcp           → Intelligence database (restricted)
 *
 * Each MCP server exposes a tool catalog. The simulated relational
 * backend stores one table per MCP server's primary collection so the
 * use case can call `backend.relational.query({ table })` per step and
 * keep the abstraction layer honest — flipping to `real` would route
 * the same call through an MCP gateway endpoint.
 *
 * The fixture also ships pre-canned multi-step "plans" the agent emits
 * for sample questions. Each plan is deterministic so the demo
 * reproduces identically across reloads.
 */

export type MCPServerStatus = "connected" | "auth-pending" | "degraded" | "down";
export type MCPAuthMode = "mTLS" | "JWT" | "SAML" | "OAuth2 + DPoP";

export interface MCPServer {
  id: string;
  label: string;
  description: string;
  /** "Friendly" upstream name shown in the connector card. */
  upstream: string;
  status: MCPServerStatus;
  auth: MCPAuthMode;
  /** Average round-trip when the server is healthy. */
  rttMs: number;
  /** Tool catalog the server exposes to the gateway. */
  tools: Array<{ name: string; signature: string; description: string }>;
}

export const MCP_SERVERS: MCPServer[] = [
  {
    id: "tps-records-mcp",
    label: "TPS Records",
    description: "Toronto Police Service Records Management System.",
    upstream: "rms.tps.on.ca",
    status: "connected",
    auth: "mTLS",
    rttMs: 38,
    tools: [
      { name: "search_persons", signature: "({ name?, dob?, alias? })", description: "Person records — full match." },
      { name: "list_occurrences", signature: "({ person_id? | address? })", description: "Occurrence list scoped to a person or address." },
      { name: "get_occurrence", signature: "({ occ_number })", description: "Full occurrence detail incl. parties." },
    ],
  },
  {
    id: "mto-bridge-mcp",
    label: "Ministry of Transportation",
    description: "Vehicle / driver records via the MTO law-enforcement bridge.",
    upstream: "mto-bridge.ontario.ca",
    status: "connected",
    auth: "mTLS",
    rttMs: 92,
    tools: [
      { name: "lookup_plate", signature: "({ plate })", description: "Registered owner, status, lien, stolen flag." },
      { name: "lookup_driver", signature: "({ name?, dob?, license? })", description: "Driver record incl. infractions." },
    ],
  },
  {
    id: "cpic-mcp",
    label: "CPIC",
    description: "Canadian Police Information Centre alerts and warrants.",
    upstream: "cpic.rcmp-grc.gc.ca",
    status: "connected",
    auth: "mTLS",
    rttMs: 145,
    tools: [
      { name: "query_subject", signature: "({ name, dob? })", description: "Active alerts on a subject." },
      { name: "query_vehicle", signature: "({ plate | vin })", description: "Stolen / wanted vehicle flags." },
    ],
  },
  {
    id: "court-records-mcp",
    label: "Ontario Court",
    description: "Ontario Court of Justice scheduling (read-only).",
    upstream: "court-rec.ontario.ca",
    status: "connected",
    auth: "JWT",
    rttMs: 210,
    tools: [
      { name: "list_proceedings", signature: "({ name?, dob? })", description: "Active and upcoming proceedings." },
    ],
  },
  {
    id: "victim-services-mcp",
    label: "Victim Services",
    description: "Victim Services Toronto — limited disclosure.",
    upstream: "vstoronto.org",
    status: "connected",
    auth: "OAuth2 + DPoP",
    rttMs: 320,
    tools: [
      { name: "lookup_file", signature: "({ name?, occurrence? })", description: "Returns file ID + status only." },
    ],
  },
  {
    id: "ices-flag-mcp",
    label: "ICES Mental-health flag",
    description: "Health-system flag service — boolean only, no clinical data.",
    upstream: "ices.on.ca",
    status: "connected",
    auth: "SAML",
    rttMs: 410,
    tools: [
      { name: "check_mh_flag", signature: "({ name, dob })", description: "Boolean — historic MHA contact." },
    ],
  },
  {
    id: "intel-mcp",
    label: "Intel database",
    description: "TPS Intelligence Services — restricted-access.",
    upstream: "intel.tps.internal",
    status: "degraded",
    auth: "mTLS",
    rttMs: 880,
    tools: [
      { name: "query_intel", signature: "({ subject_id })", description: "Intel reports tagged to a subject." },
    ],
  },
];

// ──────────────────────────────────────────────────────────────────────
// Federated tables — these are what the simulated relational client
// returns when an MCP tool is invoked. Each row is decorated with the
// owning MCP `serverId` so the UI can show provenance per row.
// ──────────────────────────────────────────────────────────────────────

export interface FedRow {
  /** ID of the MCP server that produced this row. */
  serverId: string;
}

export interface TPSPerson extends FedRow {
  person_id: string;
  name: string;
  aliases?: string[];
  dob: string;
  height?: string;
  status?: "active" | "deceased";
  last_known_address?: string;
  notes?: string;
}

export interface TPSOccurrence extends FedRow {
  occ_number: string;
  date: string;
  type: string;
  status: "open" | "closed";
  location: string;
  person_ids: string[];
  summary: string;
}

export interface MTOVehicle extends FedRow {
  plate: string;
  make: string;
  model: string;
  year: number;
  owner_person_id?: string;
  status: "active" | "stolen" | "expired" | "suspended";
  last_renewal?: string;
}

export interface MTODriver extends FedRow {
  driver_id: string;
  person_id: string;
  license_class: "G" | "G1" | "G2" | "M" | "AZ" | "DZ";
  status: "valid" | "suspended" | "expired";
  infractions: number;
  last_renewal?: string;
}

export interface CPICSubject extends FedRow {
  cpic_id: string;
  person_id: string;
  alerts: Array<{ kind: string; severity: "info" | "caution" | "danger"; issued: string }>;
}

export interface CourtProceeding extends FedRow {
  proceeding_id: string;
  person_id: string;
  court: string;
  next_date: string;
  charge: string;
  status: "first-appearance" | "bail-review" | "trial" | "sentencing";
}

export interface VictimServicesFile extends FedRow {
  file_id: string;
  person_id: string;
  status: "open" | "closed";
  opened: string;
}

export interface ICESFlag extends FedRow {
  person_id: string;
  has_mh_flag: boolean;
  last_contact_year: number | null;
}

export interface IntelSubject extends FedRow {
  intel_id: string;
  person_id: string;
  /** Free-form intel summary — sparse and typically low-confidence. */
  summary: string;
  case_links: string[];
  reliability: "A" | "B" | "C";
}

// People referenced across the lab
const P_REYES = "p-r-1989";
const P_SUTHERLAND = "p-s-1992";
const P_OKAFOR = "p-o-1991";
const P_TEE = "p-t-1988";
const P_ADEYEMO = "p-a-1986";

export const TPS_PERSONS: TPSPerson[] = [
  {
    serverId: "tps-records-mcp",
    person_id: P_REYES,
    name: "Daniel Reyes",
    aliases: ["Danny R.", "Reyes, D."],
    dob: "1989-11-02",
    height: "5'10\"",
    status: "active",
    last_known_address: "112 St. Clair Ave W (mother)",
    notes: "Released on bail TPS-25-9981; surety confirmed.",
  },
  {
    serverId: "tps-records-mcp",
    person_id: P_SUTHERLAND,
    name: "Mike Sutherland",
    aliases: ["Mikey", "M. Sutherland"],
    dob: "1992-06-14",
    height: "5'11\"",
    status: "active",
    last_known_address: "44 Charles St W, Apt 1208",
    notes: "Subject of TPS-26-417, TPS-26-418.",
  },
  {
    serverId: "tps-records-mcp",
    person_id: P_OKAFOR,
    name: "Maya Okafor",
    dob: "1991-03-22",
    status: "active",
    last_known_address: "44 Charles St W, Apt 1208",
    notes: "Complainant — Occ 26-0044.",
  },
  {
    serverId: "tps-records-mcp",
    person_id: P_TEE,
    name: "Theodore Lin",
    aliases: ["Tee"],
    dob: "1988-03-30",
    status: "active",
    last_known_address: "612 Sherbourne St, Apt 404",
    notes: "Person of interest — TPS-26-418.",
  },
  {
    serverId: "tps-records-mcp",
    person_id: P_ADEYEMO,
    name: "Special Cst. R. Adeyemo (TTC)",
    dob: "1986-08-19",
    status: "active",
    notes: "Witness — Occ 26-0043.",
  },
];

export const TPS_OCCURRENCES: TPSOccurrence[] = [
  { serverId: "tps-records-mcp", occ_number: "26-0042", date: "2026-04-12", type: "MVA", status: "closed", location: "Yonge & Bloor", person_ids: [], summary: "Single-vehicle MVA, careless driving ticket issued." },
  { serverId: "tps-records-mcp", occ_number: "26-0043", date: "2026-04-12", type: "MHA s.17", status: "closed", location: "Bloor-Yonge subway", person_ids: [P_ADEYEMO], summary: "Juvenile EDP transferred to St Michael's." },
  { serverId: "tps-records-mcp", occ_number: "26-0044", date: "2026-04-12", type: "Domestic", status: "open", location: "44 Charles St W Apt 1208", person_ids: [P_OKAFOR, P_SUTHERLAND], summary: "Verbal-only disturbance; subject voluntarily relocated." },
  { serverId: "tps-records-mcp", occ_number: "25-9981", date: "2025-09-08", type: "Break & Enter", status: "closed", location: "Queen St E (commercial)", person_ids: [P_REYES, P_SUTHERLAND], summary: "Co-accused arrest; guilty plea Mar 2026." },
  { serverId: "tps-records-mcp", occ_number: "26-0417", date: "2026-03-14", type: "Robbery", status: "open", location: "1408 Yonge St", person_ids: [P_SUTHERLAND], summary: "Robbery with violence; lead Det. K. Singh." },
  { serverId: "tps-records-mcp", occ_number: "26-0418", date: "2026-04-02", type: "Possession for trafficking", status: "open", location: "200 King St E (storage)", person_ids: [P_TEE, P_SUTHERLAND], summary: "Recovered narcotics; surveillance ongoing." },
];

export const MTO_VEHICLES: MTOVehicle[] = [
  { serverId: "mto-bridge-mcp", plate: "CFGB-481", make: "Honda", model: "Civic", year: 2022, owner_person_id: P_SUTHERLAND, status: "active", last_renewal: "2025-07-12" },
  { serverId: "mto-bridge-mcp", plate: "BTRX-902", make: "Ford", model: "F-150", year: 2019, owner_person_id: P_REYES, status: "active", last_renewal: "2025-09-04" },
  { serverId: "mto-bridge-mcp", plate: "GHKW-220", make: "Audi", model: "A4", year: 2020, owner_person_id: P_TEE, status: "stolen", last_renewal: "2024-11-30" },
  { serverId: "mto-bridge-mcp", plate: "JKLM-771", make: "Toyota", model: "Corolla", year: 2018, owner_person_id: P_OKAFOR, status: "active", last_renewal: "2025-12-02" },
];

export const MTO_DRIVERS: MTODriver[] = [
  { serverId: "mto-bridge-mcp", driver_id: "D-99821", person_id: P_REYES, license_class: "G", status: "valid", infractions: 2, last_renewal: "2024-11-02" },
  { serverId: "mto-bridge-mcp", driver_id: "D-44120", person_id: P_SUTHERLAND, license_class: "G", status: "suspended", infractions: 5, last_renewal: "2023-06-14" },
  { serverId: "mto-bridge-mcp", driver_id: "D-71005", person_id: P_OKAFOR, license_class: "G", status: "valid", infractions: 0, last_renewal: "2025-03-22" },
  { serverId: "mto-bridge-mcp", driver_id: "D-66731", person_id: P_TEE, license_class: "G", status: "valid", infractions: 1, last_renewal: "2024-03-30" },
];

export const CPIC_SUBJECTS: CPICSubject[] = [
  { serverId: "cpic-mcp", cpic_id: "C-2025-44512", person_id: P_REYES, alerts: [{ kind: "Firearms prohibition s. 110 CCC", severity: "danger", issued: "2025-12-04" }] },
  { serverId: "cpic-mcp", cpic_id: "C-2026-01207", person_id: P_SUTHERLAND, alerts: [{ kind: "Bail conditions — non-attendance 1408 Yonge St", severity: "caution", issued: "2026-03-15" }] },
  { serverId: "cpic-mcp", cpic_id: "C-2026-02440", person_id: P_TEE, alerts: [{ kind: "Outstanding warrant — fail to appear", severity: "danger", issued: "2026-04-08" }] },
];

export const COURT_PROCEEDINGS: CourtProceeding[] = [
  { serverId: "court-records-mcp", proceeding_id: "OCJ-2026-7711", person_id: P_REYES, court: "OCJ — Old City Hall, Rm 101", next_date: "2026-11-14", charge: "Bail review (TPS-25-9981)", status: "bail-review" },
  { serverId: "court-records-mcp", proceeding_id: "OCJ-2026-7822", person_id: P_SUTHERLAND, court: "OCJ — 2201 Finch Ave W, Rm 304", next_date: "2026-04-28", charge: "Robbery (TPS-26-417) — first appearance", status: "first-appearance" },
];

export const VICTIM_SERVICES_FILES: VictimServicesFile[] = [
  { serverId: "victim-services-mcp", file_id: "VS-2026-184", person_id: P_OKAFOR, status: "open", opened: "2026-04-12" },
];

export const ICES_FLAGS: ICESFlag[] = [
  { serverId: "ices-flag-mcp", person_id: P_SUTHERLAND, has_mh_flag: true, last_contact_year: 2025 },
  { serverId: "ices-flag-mcp", person_id: P_REYES, has_mh_flag: false, last_contact_year: null },
  { serverId: "ices-flag-mcp", person_id: P_TEE, has_mh_flag: false, last_contact_year: null },
];

export const INTEL_SUBJECTS: IntelSubject[] = [
  { serverId: "intel-mcp", intel_id: "INT-2026-009", person_id: P_SUTHERLAND, summary: "Frequent contact with on-chain wallet 0x71…f4 (TPS-26-418).", case_links: ["TPS-26-417", "TPS-26-418"], reliability: "B" },
  { serverId: "intel-mcp", intel_id: "INT-2026-014", person_id: P_TEE, summary: "Surveillance — 200 King St E (storage B-12), April 2026.", case_links: ["TPS-26-418"], reliability: "B" },
];

// ──────────────────────────────────────────────────────────────────────
// Canned multi-step plans
// ──────────────────────────────────────────────────────────────────────

export type PlanStep = {
  step: number;
  serverId: string;
  tool: string;
  /** Pretty-printed parameter object for display. */
  params: Record<string, string>;
  /** Backing relational table the simulated client will hit. */
  table: string;
  /** Filter applied to that table to mimic the tool result. */
  where?: Record<string, string | number | boolean>;
  /** Optional column projection for display. */
  show?: string[];
  /** Short rationale for the step — what the agent is "thinking". */
  rationale: string;
};

export interface CannedPlan {
  match: RegExp;
  question: string;
  /** Natural-language label for the chip in the UI. */
  label: string;
  steps: PlanStep[];
  /** Final synthesis paragraph. */
  synthesis: string;
  confidence: "high" | "medium" | "low";
}

export const CANNED_PLANS: CannedPlan[] = [
  {
    match: /reyes|daniel/i,
    question: "What do we know about Daniel Reyes (DOB 1989-11-02), and is anything time-critical?",
    label: "Person — Daniel Reyes",
    steps: [
      {
        step: 1,
        serverId: "tps-records-mcp",
        tool: "search_persons",
        params: { name: "Daniel Reyes", dob: "1989-11-02" },
        table: "tps_persons",
        where: { person_id: P_REYES },
        show: ["name", "aliases", "dob", "last_known_address", "notes"],
        rationale: "Resolve subject in TPS RMS first to obtain person_id.",
      },
      {
        step: 2,
        serverId: "tps-records-mcp",
        tool: "list_occurrences",
        params: { person_id: P_REYES },
        table: "tps_occurrences",
        where: { contains_person: P_REYES },
        show: ["occ_number", "date", "type", "status"],
        rationale: "List local occurrences associated with this person.",
      },
      {
        step: 3,
        serverId: "mto-bridge-mcp",
        tool: "lookup_driver",
        params: { name: "Daniel Reyes", dob: "1989-11-02" },
        table: "mto_drivers",
        where: { person_id: P_REYES },
        show: ["license_class", "status", "infractions"],
        rationale: "Driver record — license status and infraction count.",
      },
      {
        step: 4,
        serverId: "cpic-mcp",
        tool: "query_subject",
        params: { name: "Daniel Reyes", dob: "1989-11-02" },
        table: "cpic_subjects",
        where: { person_id: P_REYES },
        show: ["alerts"],
        rationale: "CPIC alerts — firearms / weapons / warrants.",
      },
      {
        step: 5,
        serverId: "court-records-mcp",
        tool: "list_proceedings",
        params: { name: "Daniel Reyes", dob: "1989-11-02" },
        table: "court_proceedings",
        where: { person_id: P_REYES },
        show: ["court", "next_date", "charge", "status"],
        rationale: "Upcoming court dates — surface anything time-critical.",
      },
    ],
    synthesis:
      "Daniel Reyes (DOB 1989-11-02) is associated with TPS occurrence 25-9981 (Break & Enter, closed — guilty plea March 2026) as a co-accused with Mike Sutherland. He holds a valid Class G driver's license with 2 infractions. CPIC reports an active firearms prohibition (s. 110 CCC, issued 2025-12-04) — confirm before any contact involving lawful access to a firearm. A bail review is scheduled for 2026-11-14 at Old City Hall, Rm 101; surety previously confirmed. No active occurrences place him at the scene of any current investigation.",
    confidence: "high",
  },
  {
    match: /cfgb-?481|honda|civic/i,
    question: "Vehicle CFGB-481 — registered owner, status across all systems, and any active alerts.",
    label: "Vehicle — CFGB-481",
    steps: [
      {
        step: 1,
        serverId: "mto-bridge-mcp",
        tool: "lookup_plate",
        params: { plate: "CFGB-481" },
        table: "mto_vehicles",
        where: { plate: "CFGB-481" },
        show: ["make", "model", "year", "owner_person_id", "status", "last_renewal"],
        rationale: "Resolve registered owner and status.",
      },
      {
        step: 2,
        serverId: "tps-records-mcp",
        tool: "search_persons",
        params: { person_id: P_SUTHERLAND },
        table: "tps_persons",
        where: { person_id: P_SUTHERLAND },
        show: ["name", "dob", "last_known_address"],
        rationale: "Resolve owner identity in TPS RMS.",
      },
      {
        step: 3,
        serverId: "cpic-mcp",
        tool: "query_vehicle",
        params: { plate: "CFGB-481" },
        table: "cpic_subjects",
        where: { person_id: P_SUTHERLAND },
        show: ["alerts"],
        rationale: "CPIC vehicle / subject vehicle-related alerts.",
      },
      {
        step: 4,
        serverId: "tps-records-mcp",
        tool: "list_occurrences",
        params: { person_id: P_SUTHERLAND },
        table: "tps_occurrences",
        where: { contains_person: P_SUTHERLAND },
        show: ["occ_number", "date", "type", "status"],
        rationale: "Open occurrences involving the registered owner.",
      },
      {
        step: 5,
        serverId: "intel-mcp",
        tool: "query_intel",
        params: { subject_id: P_SUTHERLAND },
        table: "intel_subjects",
        where: { person_id: P_SUTHERLAND },
        show: ["summary", "case_links", "reliability"],
        rationale: "Intel context — case links, reliability.",
      },
    ],
    synthesis:
      "CFGB-481 is a 2022 Honda Civic, MTO-active, registered to Mike Sutherland (DOB 1992-06-14, last known 44 Charles St W Apt 1208). Sutherland's CPIC profile shows an active bail condition forbidding attendance at 1408 Yonge St (issued 2026-03-15) — note this if the vehicle is observed in that area. He is named on two open occurrences (TPS-26-417 robbery; TPS-26-418 trafficking) and one closed (TPS-25-9981 with co-accused Reyes). Intel reports B-reliability link to on-chain wallet 0x71…f4 across both open files. Driver's license is currently suspended.",
    confidence: "high",
  },
  {
    match: /44 charles|charles st w|address/i,
    question: "44 Charles St W, Apt 1208 — all known activity and current occupants.",
    label: "Address — 44 Charles St W",
    steps: [
      {
        step: 1,
        serverId: "tps-records-mcp",
        tool: "list_occurrences",
        params: { address: "44 Charles St W Apt 1208" },
        table: "tps_occurrences",
        where: { location_contains: "44 Charles St W" },
        show: ["occ_number", "date", "type", "status", "summary"],
        rationale: "Pull every TPS occurrence at this address.",
      },
      {
        step: 2,
        serverId: "tps-records-mcp",
        tool: "search_persons",
        params: { last_known_address: "44 Charles St W" },
        table: "tps_persons",
        where: { last_known_address_contains: "44 Charles St W" },
        show: ["name", "dob", "notes"],
        rationale: "Resolve current and prior occupants.",
      },
      {
        step: 3,
        serverId: "victim-services-mcp",
        tool: "lookup_file",
        params: { occurrence: "26-0044" },
        table: "victim_services_files",
        where: { person_id: P_OKAFOR },
        show: ["file_id", "status", "opened"],
        rationale: "Victim Services context — limited disclosure (file ID + status).",
      },
      {
        step: 4,
        serverId: "ices-flag-mcp",
        tool: "check_mh_flag",
        params: { name: "Mike Sutherland", dob: "1992-06-14" },
        table: "ices_flags",
        where: { person_id: P_SUTHERLAND },
        show: ["has_mh_flag", "last_contact_year"],
        rationale: "Mental-health flag for the current occupant — boolean only.",
      },
    ],
    synthesis:
      "44 Charles St W, Apt 1208 has one open TPS occurrence (26-0044 — domestic disturbance, 2026-04-12). Current occupants per RMS: Mike Sutherland (subject; subject of two unrelated open files) and Maya Okafor (complainant). Victim Services Toronto has an open file (VS-2026-184) for Okafor opened on 2026-04-12 — coordinate any follow-up via the DV coordinator. ICES reports a historic mental-health flag for Sutherland (most recent contact 2025); content is unavailable through this connector — escalate to MCIT if a co-response is being considered.",
    confidence: "medium",
  },
];
