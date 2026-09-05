/**
 * Investigative link-analysis graph for UC6.
 *
 * Nodes are entities (people, places, vehicles, accounts, phones,
 * cases); edges are relationships extracted from records. Coordinates
 * are pre-computed for a clean static layout — no force-directed
 * algorithm in the demo.
 *
 * The graph spans two related cases (TPS-26-417 + TPS-26-418, with a
 * historical link to TPS-25-9981) so the analyst can demonstrate
 * cross-case correlation. Each node carries a metadata block the UI
 * surfaces in the entity-detail side panel; each edge carries a
 * date window for time-window filtering.
 */

export type EntityKind =
  | "person"
  | "vehicle"
  | "address"
  | "account"
  | "phone"
  | "case";

export interface NetworkNode {
  id: string;
  kind: EntityKind;
  label: string;
  /** Pre-computed (x, y) for a 1100×680 svg viewport. */
  x: number;
  y: number;
  /** Display badge — e.g. "Subject", "Witness", "Tim's Visa". */
  tag?: string;
  /** Whether this node is the focal point of the investigation. */
  primary?: boolean;
  /** PII bucket — drives the redaction state. */
  redactionCategory?: "PII" | "VICTIM" | "JUVENILE" | "INFORMANT";
  /** Free-form key/value attributes shown in the detail panel. */
  attrs?: Array<[string, string]>;
}

export interface NetworkEdge {
  from: string;
  to: string;
  /** Type of relationship. */
  relation:
    | "owns"
    | "called"
    | "lives-at"
    | "associated-with"
    | "transacted-with"
    | "case-subject"
    | "co-defendant"
    | "witnessed-by"
    | "informed-by"
    | "co-occupant"
    | "frequents";
  /** Provenance — which records this edge was inferred from. */
  source: string;
  /** Categorical confidence. */
  confidence: "high" | "medium" | "low";
  /** Time window the relation was active (ISO dates). */
  activeFrom?: string;
  activeTo?: string;
}

export const INVESTIGATIVE_GRAPH: { nodes: NetworkNode[]; edges: NetworkEdge[] } = {
  nodes: [
    // ── Cases (top row) ──────────────────────────────────────────
    { id: "c-001", kind: "case", label: "TPS-26-417", x: 540, y: 70, tag: "Active", attrs: [["status", "Open"], ["lead", "Det. K. Singh"], ["opened", "2026-03-14"], ["offence", "Robbery"]] },
    { id: "c-002", kind: "case", label: "TPS-25-9981", x: 220, y: 70, tag: "Prior", attrs: [["status", "Closed — guilty plea"], ["lead", "Det. M. Wong"], ["opened", "2025-09-08"], ["offence", "Break & enter"]] },
    { id: "c-003", kind: "case", label: "TPS-26-418", x: 880, y: 70, tag: "Linked", attrs: [["status", "Open"], ["lead", "Det. K. Singh"], ["opened", "2026-04-02"], ["offence", "Possession for trafficking"]] },

    // ── Primary subject + close associates (centre cluster) ──────
    { id: "p-001", kind: "person", label: "Subject 1", tag: "Subject", x: 540, y: 320, primary: true, attrs: [["dob", "1992-06-14"], ["aliases", "Mike S., Mikey"], ["height", "5'11\""], ["last seen", "Yonge & College"], ["risk", "Medium"]] },
    { id: "p-002", kind: "person", label: "Cousin (M)", tag: "Associate", x: 280, y: 280, redactionCategory: "PII", attrs: [["relation", "1st cousin"], ["dob", "1990-02-23"], ["address", "[REDACTED]"], ["prior contact", "TPS-24-0883"]] },
    { id: "p-003", kind: "person", label: "Co-accused (R)", tag: "Co-defendant", x: 320, y: 170, attrs: [["dob", "1989-11-02"], ["status", "Released — bail"], ["surety", "Mother — confirmed"], ["prior contact", "TPS-25-9981"]] },
    { id: "p-006", kind: "person", label: "Associate (T)", tag: "Associate", x: 760, y: 200, attrs: [["dob", "1988-03-30"], ["aliases", "Tee"], ["status", "Person of interest"]] },
    { id: "p-007", kind: "person", label: "Associate (D)", tag: "Associate", x: 870, y: 270, attrs: [["dob", "1995-07-10"], ["status", "Frequent contact"]] },
    { id: "p-008", kind: "person", label: "Associate (J)", tag: "Associate", x: 220, y: 380, attrs: [["dob", "1991-12-04"], ["status", "Frequent contact"]] },

    // ── Witnesses & informants ───────────────────────────────────
    { id: "p-004", kind: "person", label: "Witness A", tag: "Witness", x: 380, y: 530, redactionCategory: "VICTIM", attrs: [["statement", "2026-03-15"], ["sworn", "yes"], ["status", "Cooperative"]] },
    { id: "p-005", kind: "person", label: "Informant CI-71", tag: "Informant", x: 720, y: 540, redactionCategory: "INFORMANT", attrs: [["handler", "Det. K. Singh"], ["reliability", "B"], ["productivity", "Medium"]] },
    { id: "p-009", kind: "person", label: "Witness B", tag: "Witness", x: 540, y: 620, attrs: [["statement", "2026-03-22"], ["sworn", "yes"], ["status", "Cooperative"]] },

    // ── Vehicles ─────────────────────────────────────────────────
    { id: "v-001", kind: "vehicle", label: "Honda Civic CFGB-481", x: 100, y: 320, attrs: [["year", "2022"], ["make", "Honda Civic"], ["plate", "CFGB-481"], ["registered to", "Subject 1"], ["status", "Active"]] },
    { id: "v-002", kind: "vehicle", label: "Ford F-150 BTRX-902", x: 130, y: 200, attrs: [["year", "2019"], ["make", "Ford F-150"], ["plate", "BTRX-902"], ["registered to", "Co-accused (R)"], ["status", "Active"]] },
    { id: "v-003", kind: "vehicle", label: "Audi A4 GHKW-220", x: 990, y: 200, attrs: [["year", "2020"], ["make", "Audi A4"], ["plate", "GHKW-220"], ["registered to", "Associate (T)"], ["status", "Stolen — flagged"]] },

    // ── Addresses ────────────────────────────────────────────────
    { id: "a-001", kind: "address", label: "44 Charles St W", x: 410, y: 200, attrs: [["type", "Residence"], ["unit", "1208"], ["occupants", "Subject 1; Cousin (M)"], ["last visit", "2026-04-12"]] },
    { id: "a-002", kind: "address", label: "1408 Yonge St", x: 540, y: 470, attrs: [["type", "Business"], ["business", "Tim Hortons"], ["link", "Interac transaction"]] },
    { id: "a-003", kind: "address", label: "612 Sherbourne St", x: 670, y: 130, attrs: [["type", "Residence"], ["unit", "404"], ["occupants", "Associate (T)"], ["link", "Surveillance hits"]] },
    { id: "a-004", kind: "address", label: "200 King St E", x: 990, y: 110, attrs: [["type", "Storage"], ["unit", "B-12"], ["link", "TPS-26-418 — recovered narcotics"]] },

    // ── Phones ───────────────────────────────────────────────────
    { id: "ph-001", kind: "phone", label: "+1 416-555-0142", x: 80, y: 470, attrs: [["subscriber", "Subject 1"], ["carrier", "Rogers"], ["activated", "2024-08-01"], ["CDR window", "2026-03-01 → present"]] },
    { id: "ph-002", kind: "phone", label: "+1 647-555-0033", x: 80, y: 380, attrs: [["subscriber", "Cousin (M)"], ["carrier", "Bell"], ["CDR window", "2026-03-01 → present"]] },
    { id: "ph-003", kind: "phone", label: "+1 437-555-9111", x: 990, y: 460, attrs: [["subscriber", "[burner]"], ["carrier", "Freedom"], ["activated", "2026-03-10"], ["link", "Single-use device"]] },

    // ── Accounts ─────────────────────────────────────────────────
    { id: "acc-001", kind: "account", label: "Interac •••4421", x: 730, y: 460, attrs: [["bank", "RBC"], ["holder", "Subject 1"], ["last txn", "2026-04-12 — Tim Hortons"]] },
    { id: "acc-002", kind: "account", label: "Visa •••8902", x: 990, y: 380, attrs: [["bank", "TD"], ["holder", "Co-accused (R)"], ["status", "Active"]] },
    { id: "acc-003", kind: "account", label: "Crypto wallet 0x71…f4", x: 870, y: 540, attrs: [["chain", "ETH"], ["first seen", "2026-02-04"], ["link", "TPS-26-418"]] },
  ],
  edges: [
    // Subject 1 ↔ vehicles / address / phone / account
    { from: "p-001", to: "v-001", relation: "owns", source: "MTO registry", confidence: "high", activeFrom: "2022-07-12" },
    { from: "p-001", to: "a-001", relation: "lives-at", source: "TPS records", confidence: "high", activeFrom: "2024-01-01" },
    { from: "p-001", to: "ph-001", relation: "owns", source: "Cellular subscriber check", confidence: "high", activeFrom: "2024-08-01" },
    { from: "p-001", to: "acc-001", relation: "owns", source: "Interac production order", confidence: "high" },
    { from: "p-001", to: "c-001", relation: "case-subject", source: "Case file", confidence: "high" },
    { from: "p-001", to: "c-002", relation: "case-subject", source: "Case file (co-accused)", confidence: "high" },
    { from: "p-001", to: "c-003", relation: "case-subject", source: "Case file", confidence: "medium", activeFrom: "2026-04-02" },

    // Cousin (M) — same address, frequent calls
    { from: "p-001", to: "p-002", relation: "associated-with", source: "Social media — 2024-2026", confidence: "medium" },
    { from: "p-002", to: "a-001", relation: "co-occupant", source: "Building intel; mail", confidence: "medium" },
    { from: "p-002", to: "ph-002", relation: "owns", source: "Cellular subscriber check", confidence: "high" },
    { from: "ph-001", to: "ph-002", relation: "called", source: "CDR Mar 1–Apr 12, 2026 (62 calls)", confidence: "high", activeFrom: "2026-03-01", activeTo: "2026-04-12" },

    // Co-accused (R) — vehicle, case, prior, account
    { from: "p-001", to: "p-003", relation: "co-defendant", source: "Case TPS-25-9981", confidence: "high", activeFrom: "2025-09-08" },
    { from: "p-003", to: "v-002", relation: "owns", source: "MTO registry", confidence: "high" },
    { from: "p-003", to: "c-002", relation: "case-subject", source: "Case file", confidence: "high" },
    { from: "p-003", to: "acc-002", relation: "owns", source: "TD production order", confidence: "high" },

    // Associate (T) — vehicle, address, phone, case 003
    { from: "p-001", to: "p-006", relation: "associated-with", source: "Surveillance — 2026-03-22", confidence: "medium", activeFrom: "2026-03-01" },
    { from: "p-006", to: "v-003", relation: "owns", source: "MTO registry", confidence: "high" },
    { from: "p-006", to: "a-003", relation: "lives-at", source: "Tenancy records", confidence: "high" },
    { from: "p-006", to: "ph-003", relation: "owns", source: "Inferred — single-use device pattern", confidence: "low", activeFrom: "2026-03-10" },
    { from: "p-006", to: "c-003", relation: "case-subject", source: "Case file", confidence: "high" },
    { from: "p-006", to: "a-004", relation: "frequents", source: "Surveillance — Apr 2026", confidence: "medium", activeFrom: "2026-04-01" },

    // Associate (D) — phone link only, low confidence
    { from: "p-001", to: "p-007", relation: "associated-with", source: "Phone record overlap", confidence: "low" },
    { from: "p-007", to: "acc-003", relation: "transacted-with", source: "On-chain analysis", confidence: "medium", activeFrom: "2026-02-04" },
    { from: "p-006", to: "acc-003", relation: "transacted-with", source: "On-chain analysis", confidence: "high", activeFrom: "2026-02-04" },

    // Associate (J) — long-time associate, no current activity
    { from: "p-001", to: "p-008", relation: "associated-with", source: "Prior surveillance — 2024", confidence: "medium", activeTo: "2025-12-31" },

    // Subject 1 — Tim Hortons transaction
    { from: "p-001", to: "a-002", relation: "associated-with", source: "Tim Hortons receipt 2026-03-14", confidence: "medium" },
    { from: "acc-001", to: "a-002", relation: "transacted-with", source: "Interac 22:41 2026-03-14", confidence: "high" },

    // Witnesses & informant
    { from: "p-004", to: "c-001", relation: "witnessed-by", source: "Witness statement 2026-03-15", confidence: "high" },
    { from: "p-009", to: "c-001", relation: "witnessed-by", source: "Witness statement 2026-03-22", confidence: "high" },
    { from: "p-005", to: "c-001", relation: "informed-by", source: "Source debrief 2026-03-12", confidence: "low" },
    { from: "p-005", to: "c-003", relation: "informed-by", source: "Source debrief 2026-04-01", confidence: "medium" },

    // Cross-case: cousin called informant once (sensitive)
    { from: "ph-001", to: "p-005", relation: "called", source: "CDR — 1 call 2026-03-12", confidence: "low", activeFrom: "2026-03-12", activeTo: "2026-03-12" },
  ],
};

export interface LinkAnalysisAnswer {
  match: RegExp;
  answer: {
    text: string;
    /** Edge indices supporting the claim. */
    edgeCitations: number[];
    confidence: "high" | "medium" | "low";
    /** Optional node IDs to highlight on the graph when this answer renders. */
    highlight?: string[];
  };
}

export const LINK_ANALYSIS_ANSWERS: LinkAnalysisAnswer[] = [
  {
    match: /co-?accused|co-?defendant|prior case/i,
    answer: {
      text:
        "Subject 1 is linked to a single co-defendant (R) through prior case TPS-25-9981 [1]. Both Subject 1 and R are listed as case subjects on that file [2][3]. R is the registered owner of a Ford F-150 (BTRX-902) which has surfaced in surveillance from the current investigation [4], and R retains an active TD Visa account flagged on the same production order chain [5].",
      edgeCitations: [11, 5, 13, 12, 14],
      confidence: "high",
      highlight: ["p-001", "p-003", "c-002", "v-002", "acc-002"],
    },
  },
  {
    match: /phone|call|cdr|cellular|burner/i,
    answer: {
      text:
        "Subject 1's primary phone (+1 416-555-0142) [1] shows three notable patterns in the call detail records for March 1 – April 12, 2026: 62 calls to the cousin (M)'s line [2] consistent with their long-running association, a single short call to a confidential informant on March 12 [3] (low confidence — corroborate before relying), and overlap with Associate (T)'s burner number [4] activated days before the cross-case TPS-26-418 began.",
      edgeCitations: [2, 10, 28, 19],
      confidence: "medium",
      highlight: ["ph-001", "ph-002", "ph-003", "p-005", "p-006"],
    },
  },
  {
    match: /vehicle|car|honda|ford|audi|plate/i,
    answer: {
      text:
        "Three vehicles are connected to this network. Subject 1's Honda Civic (CFGB-481) is registered to the subject directly [1]. Co-defendant R owns a Ford F-150 (BTRX-902) [2]. Associate (T) owns an Audi A4 (GHKW-220) [3] which is currently flagged stolen — that flag is the strongest single-vehicle lead in case TPS-26-418.",
      edgeCitations: [0, 12, 16],
      confidence: "high",
      highlight: ["v-001", "v-002", "v-003", "p-001", "p-003", "p-006"],
    },
  },
  {
    match: /witness|informant|source/i,
    answer: {
      text:
        "Two witnesses and one informant link to this case. Witness A provided a sworn statement on 2026-03-15 placing the subject fleeing east on Dundas [1]. Witness B corroborated the subject's presence at 1408 Yonge St one week later [2]. Informant CI-71 has contributed to both case TPS-26-417 and the linked case TPS-26-418 [3][4]; identity is protected per Source Handler protocol.",
      edgeCitations: [25, 26, 27, 28],
      confidence: "medium",
      highlight: ["p-004", "p-005", "p-009", "c-001", "c-003"],
    },
  },
  {
    match: /crypto|wallet|on.chain|blockchain/i,
    answer: {
      text:
        "An Ethereum wallet (0x71…f4) is the strongest financial indicator across cases TPS-26-417 and TPS-26-418. Associate (T) transacted to/from this wallet at high confidence beginning 2026-02-04 [1]; Associate (D) had a lower-confidence overlap [2]. The wallet is referenced in the seized-narcotics file for case TPS-26-418 — pursue a chain-analysis production order on Coinbase / Kraken if local exchange touchpoints exist.",
      edgeCitations: [22, 23],
      confidence: "medium",
      highlight: ["acc-003", "p-006", "p-007", "c-003"],
    },
  },
  {
    match: /address|residence|premise|storage|charles|sherbourne|king/i,
    answer: {
      text:
        "Four addresses are in this network. 44 Charles St W (apt 1208) is Subject 1's primary residence [1] and Cousin (M) is a co-occupant [2]. 1408 Yonge St (Tim Hortons) is the transactional touchpoint on the night of the original incident [3]. 612 Sherbourne St (apt 404) is Associate (T)'s residence [4]; 200 King St E (storage B-12) is the recovered-narcotics location for TPS-26-418 [5].",
      edgeCitations: [1, 8, 25, 17, 20],
      confidence: "high",
      highlight: ["a-001", "a-002", "a-003", "a-004", "p-001", "p-006"],
    },
  },
  {
    match: /case 003|tps-26-418|second case|linked case/i,
    answer: {
      text:
        "Case TPS-26-418 (linked) connects via three threads: Subject 1 is named as a case subject at medium confidence [1]; Associate (T) is the primary subject [2]; and the recovered-narcotics location at 200 King St E (storage B-12) is frequented by Associate (T) per April surveillance [3]. The Ethereum wallet 0x71…f4 ties both associates to the same on-chain pattern.",
      edgeCitations: [6, 20, 21],
      confidence: "high",
      highlight: ["c-003", "p-001", "p-006", "a-004", "acc-003"],
    },
  },
];
