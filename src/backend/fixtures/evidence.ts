/**
 * Evidence corpus fixtures for UC2 (Ask Your Case File) and UC3 (redaction).
 *
 * Mixed media: surveillance video, body cam, photos, witness statements,
 * and transactional records. The vector "embedding" is a simple keyword
 * bag — enough to demonstrate semantic retrieval in the UI without
 * shipping a real embedding model in the browser.
 */

export type EvidenceMediaType =
  | "surveillance-video"
  | "body-cam"
  | "photo"
  | "witness-statement"
  | "interview-audio"
  | "transaction-log"
  | "social-media";

export interface EvidenceItem {
  id: string;
  caseId: string;
  type: EvidenceMediaType;
  title: string;
  description: string;
  /** Object-storage key. */
  storageKey: string;
  capturedAt: string;
  location?: string;
  /** Bounding-box rectangle on a notional Toronto street grid for visualisation. */
  geo?: { lat: number; lon: number };
  durationMs?: number;
  /** Tags the LLM agent uses to ground a response. */
  tags: string[];
  /** People referenced in this evidence item. */
  entities: Array<{ name: string; role: "subject" | "witness" | "victim" | "officer" }>;
  /** Chain-of-custody log. */
  custody: Array<{ at: string; actor: string; action: string }>;
}

export const EVIDENCE_CASE_ID = "TPS-26-417";

export const EVIDENCE_ITEMS: EvidenceItem[] = [
  {
    id: "ev-001",
    caseId: EVIDENCE_CASE_ID,
    type: "surveillance-video",
    title: "Yonge & Dundas — south-east CCTV",
    description:
      "City of Toronto CCTV camera CT-YD-04, looking south-east across Yonge-Dundas Square.",
    storageKey: "evidence/TPS-26-417/cctv/yd-04-21h00.mp4",
    capturedAt: "2026-03-14T21:04:00-04:00",
    location: "Yonge & Dundas",
    geo: { lat: 43.6562, lon: -79.3804 },
    durationMs: 7_200_000,
    tags: ["yonge", "dundas", "subject-in-grey-hoodie", "21:00-23:00"],
    entities: [{ name: "Subject 1", role: "subject" }],
    custody: [
      { at: "2026-03-14T23:42:00-04:00", actor: "Det. K. Singh", action: "Acquired from City of Toronto Transportation Services" },
      { at: "2026-03-15T08:15:00-04:00", actor: "TPS Digital Evidence Mgmt", action: "Hashed (SHA-256), stored in case bucket" },
    ],
  },
  {
    id: "ev-002",
    caseId: EVIDENCE_CASE_ID,
    type: "surveillance-video",
    title: "Eaton Centre — north entrance",
    description:
      "Cadillac Fairview private CCTV from the Yonge-side north entrance of the Eaton Centre.",
    storageKey: "evidence/TPS-26-417/cctv/ef-north-21h45.mp4",
    capturedAt: "2026-03-14T21:45:00-04:00",
    location: "220 Yonge St",
    geo: { lat: 43.6544, lon: -79.3807 },
    durationMs: 5_400_000,
    tags: ["eaton-centre", "subject-in-grey-hoodie", "21:30-23:00", "interior"],
    entities: [{ name: "Subject 1", role: "subject" }],
    custody: [
      { at: "2026-03-15T11:20:00-04:00", actor: "Det. K. Singh", action: "Production order served on Cadillac Fairview" },
      { at: "2026-03-15T16:45:00-04:00", actor: "TPS Digital Evidence Mgmt", action: "Received, hashed, stored" },
    ],
  },
  {
    id: "ev-003",
    caseId: EVIDENCE_CASE_ID,
    type: "body-cam",
    title: "Body cam — Cst. Wallace, arrest at College & Yonge",
    description: "First-officer body cam at the arrest scene, 22:48.",
    storageKey: "evidence/TPS-26-417/bodycam/wallace-2248.mp4",
    capturedAt: "2026-03-14T22:48:00-04:00",
    location: "College & Yonge",
    geo: { lat: 43.6611, lon: -79.3823 },
    durationMs: 624_000,
    tags: ["arrest", "college-yonge", "22:48", "subject-in-grey-hoodie"],
    entities: [
      { name: "Subject 1", role: "subject" },
      { name: "Cst. Wallace (4117)", role: "officer" },
    ],
    custody: [
      { at: "2026-03-14T23:55:00-04:00", actor: "Cst. Wallace (4117)", action: "Uploaded to TPS DEMS at end of shift" },
      { at: "2026-03-15T00:12:00-04:00", actor: "TPS DEMS", action: "Auto-hashed, indexed to case TPS-26-417" },
    ],
  },
  {
    id: "ev-004",
    caseId: EVIDENCE_CASE_ID,
    type: "witness-statement",
    title: "Witness statement — Witness A",
    description:
      "Sworn statement by Witness A, taken 2026-03-15 at 51 Division. Saw subject flee east on Dundas.",
    storageKey: "evidence/TPS-26-417/statements/witness-a.pdf",
    capturedAt: "2026-03-15T10:30:00-04:00",
    location: "51 Division",
    tags: ["witness", "fled-east", "dundas", "grey-hoodie"],
    entities: [
      { name: "Witness A", role: "witness" },
      { name: "Subject 1", role: "subject" },
    ],
    custody: [
      { at: "2026-03-15T10:30:00-04:00", actor: "Det. K. Singh", action: "Statement taken under oath" },
      { at: "2026-03-15T11:02:00-04:00", actor: "Det. K. Singh", action: "Scanned to case file" },
    ],
  },
  {
    id: "ev-005",
    caseId: EVIDENCE_CASE_ID,
    type: "transaction-log",
    title: "Tap-to-pay transaction — Tim Hortons, 25 Dundas E",
    description:
      "PRESTO/Interac purchase $4.21 attributed to subject's card at 22:41, three minutes before arrest.",
    storageKey: "evidence/TPS-26-417/transactions/interac-22h41.json",
    capturedAt: "2026-03-14T22:41:00-04:00",
    location: "25 Dundas St E",
    geo: { lat: 43.6560, lon: -79.3792 },
    tags: ["transaction", "22:41", "yonge-dundas", "interac"],
    entities: [{ name: "Subject 1", role: "subject" }],
    custody: [
      { at: "2026-03-16T09:00:00-04:00", actor: "Det. K. Singh", action: "Production order served on Interac Corp." },
      { at: "2026-03-16T14:15:00-04:00", actor: "TPS Digital Evidence Mgmt", action: "Received, hashed, stored" },
    ],
  },
  {
    id: "ev-006",
    caseId: EVIDENCE_CASE_ID,
    type: "photo",
    title: "Photo — recovered hoodie",
    description: "Crime-scene photo of the grey hoodie recovered at College & Yonge.",
    storageKey: "evidence/TPS-26-417/photos/hoodie-001.jpg",
    capturedAt: "2026-03-14T23:10:00-04:00",
    location: "College & Yonge",
    tags: ["physical-evidence", "hoodie", "grey", "college-yonge"],
    entities: [{ name: "Subject 1", role: "subject" }],
    custody: [
      { at: "2026-03-14T23:10:00-04:00", actor: "Cst. Lee (4823)", action: "Photo taken, item bagged" },
      { at: "2026-03-15T00:30:00-04:00", actor: "TPS Property Bureau", action: "Logged as exhibit #4" },
    ],
  },
];

/** Pre-canned answers for the agentic Q&A demo. */
export interface CannedAnswer {
  match: RegExp;
  answer: {
    text: string;
    /** Indices into EVIDENCE_ITEMS that ground each claim. */
    citations: number[];
    confidence: "high" | "medium" | "low";
  };
}

export const CANNED_EVIDENCE_ANSWERS: CannedAnswer[] = [
  {
    match: /yonge.*dundas|dundas.*yonge|grey hoodie|subject.*hoodie/i,
    answer: {
      text:
        "Three pieces of evidence place Subject 1 in the Yonge & Dundas area between 21:00 and 23:00 on 2026-03-14: City of Toronto CCTV at Yonge-Dundas Square shows a male in a grey hoodie at 21:04 [1]; Cadillac Fairview interior CCTV shows the same individual entering the Eaton Centre at 21:45 [2]; and an Interac transaction at the Tim Hortons at 25 Dundas E was completed at 22:41 — three minutes before arrest [3]. Witness A's sworn statement corroborates the subject fleeing east on Dundas [4]. The hoodie itself was recovered at the arrest scene and photographed [5].",
      citations: [0, 1, 4, 3, 5],
      confidence: "high",
    },
  },
  {
    match: /timeline|sequence|order of events|when/i,
    answer: {
      text:
        "Reconstructed timeline for case TPS-26-417 on 2026-03-14: 21:04 — subject observed at Yonge-Dundas Square (CCTV CT-YD-04) [1]. 21:45 — subject enters Eaton Centre via north Yonge entrance (CF private CCTV) [2]. 22:41 — Interac transaction at Tim Hortons, 25 Dundas E [3]. 22:48 — arrest at College & Yonge captured on Cst. Wallace's body cam [4]. 23:10 — physical evidence (grey hoodie) photographed and bagged at scene [5].",
      citations: [0, 1, 4, 2, 5],
      confidence: "high",
    },
  },
  {
    match: /custody|chain.of.custody|provenance/i,
    answer: {
      text:
        "All six exhibits in case TPS-26-417 have an unbroken chain of custody. Each item is SHA-256 hashed at intake and every transfer is logged with actor and timestamp. Two exhibits required production orders (CCTV from Cadillac Fairview [2], transaction record from Interac Corp [3]); the rest were collected directly by attending officers and uploaded to TPS DEMS within 24 hours.",
      citations: [1, 4],
      confidence: "high",
    },
  },
  {
    match: /witness|statement/i,
    answer: {
      text:
        "One sworn witness statement is on file. Witness A was interviewed at 51 Division on 2026-03-15 at 10:30 by Det. K. Singh and described seeing a male in a grey hoodie flee east on Dundas Street shortly after the incident [1]. The description is consistent with the subject visible in the Yonge & Dundas CCTV [2] and the body-cam footage of the arrest [3].",
      citations: [3, 0, 2],
      confidence: "medium",
    },
  },
];
