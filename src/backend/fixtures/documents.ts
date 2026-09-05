/**
 * Document corpus for the document-redaction use case.
 *
 * Each document is a small narrative (witness statement, officer
 * narrative, FOIA reply, etc.) tokenized into plain-text and entity
 * spans. Pre-computing the spans (rather than asking a NER model on
 * the demo path) keeps the use case deterministic and screenshot-
 * friendly while still exercising every accept/reject and category
 * pathway in the UI.
 *
 * Categories map directly onto the design system's RedactionToken
 * enum (PII, JUVENILE, VICTIM, CONFIDENTIAL, INFORMANT, MEDICAL).
 * The optional `subtype` field carries the finer-grained NER label
 * (NAME, ADDRESS, PHONE, etc.) that the detection panel surfaces.
 */

import type { RedactionCategory } from "@aisp/components";

export type DetectionSubtype =
  | "NAME"
  | "ADDRESS"
  | "PHONE"
  | "EMAIL"
  | "DOB"
  | "PLATE"
  | "BADGE"
  | "OHIP"
  | "FILE_NUMBER"
  | "OCCURRENCE_NUMBER"
  | "DIAGNOSIS"
  | "ACCOUNT"
  | "URL";

export interface DocEntity {
  id: string;
  text: string;
  category: RedactionCategory;
  subtype: DetectionSubtype;
  confidence: "high" | "medium" | "low";
  /**
   * Whether the redaction reviewer should *almost certainly* accept this
   * detection. Drives a "recommended" hint badge in the UI.
   */
  recommended: boolean;
  /** One-line rationale shown in the side panel. */
  note?: string;
}

export type DocSegment =
  | { kind: "text"; text: string }
  | { kind: "entity"; entityId: string };

export interface RedactionDocument {
  id: string;
  title: string;
  type: "Witness statement" | "Officer narrative" | "FOIA disclosure" | "Medical disclosure" | "Intel briefing";
  author: string;
  occurrenceRef?: string;
  date: string;
  /** Pages only meaningful for formal letter-style docs. */
  pages?: number;
  /** Document body as an alternating text + entity stream. */
  segments: DocSegment[];
  entities: DocEntity[];
}

// ──────────────────────────────────────────────────────────────────────
// Helpers — build segments terser than declaring each one inline.
// ──────────────────────────────────────────────────────────────────────

function t(text: string): DocSegment {
  return { kind: "text", text };
}
function e(entityId: string): DocSegment {
  return { kind: "entity", entityId };
}

// ──────────────────────────────────────────────────────────────────────
// 1. Witness statement — Occurrence 26-0044 (Domestic)
// ──────────────────────────────────────────────────────────────────────

const DOC_WITNESS: RedactionDocument = {
  id: "doc-26-0044-witness",
  title: "Witness Statement — Occurrence 26-0044",
  type: "Witness statement",
  author: "Cst. J. Brand, Badge 5821",
  occurrenceRef: "26-0044",
  date: "2026-04-12",
  segments: [
    t("Statement of "),
    e("w-name-1"),
    t(", a 35-year-old Canadian citizen residing at "),
    e("w-addr-1"),
    t(". Reachable at "),
    e("w-phone-1"),
    t(" (mobile) or "),
    e("w-email-1"),
    t(".\n\nAt approximately 04:52 hrs on 12 April 2026, "),
    e("w-name-1b"),
    t(" called 911 to report an ongoing verbal altercation with her common-law partner, "),
    e("w-name-2"),
    t(" (DOB "),
    e("w-dob-2"),
    t("). Both parties were present in the residence at "),
    e("w-addr-1b"),
    t(". Their child, "),
    e("w-name-juv"),
    t(" (age 8), was in an adjacent bedroom and could be heard crying.\n\n"),
    e("w-name-1c"),
    t(" stated that "),
    e("w-name-2b"),
    t(" had returned home intoxicated at approximately 04:30 and that an argument escalated when she asked him to leave. She declined ambulance services and stated she had no visible injuries. "),
    e("w-name-2c"),
    t(" voluntarily relocated for the night to the residence of his mother at "),
    e("w-addr-2"),
    t(". The file has been forwarded to the Domestic Violence coordinator under file reference "),
    e("w-file-1"),
    t(".\n\nStatement read back to "),
    e("w-name-1d"),
    t(" who confirmed it as accurate and signed the original.\n\n— Cst. J. Brand, Badge "),
    e("w-badge-1"),
    t("."),
  ],
  entities: [
    { id: "w-name-1", text: "Maya Okafor", category: "VICTIM", subtype: "NAME", confidence: "high", recommended: true, note: "Complainant — VS file open." },
    { id: "w-addr-1", text: "44 Charles St W, Apt 1208, Toronto", category: "VICTIM", subtype: "ADDRESS", confidence: "high", recommended: true },
    { id: "w-phone-1", text: "+1 (416) 555-0181", category: "VICTIM", subtype: "PHONE", confidence: "high", recommended: true },
    { id: "w-email-1", text: "m.okafor@protonmail.com", category: "VICTIM", subtype: "EMAIL", confidence: "high", recommended: true },
    { id: "w-name-1b", text: "Ms Okafor", category: "VICTIM", subtype: "NAME", confidence: "high", recommended: true },
    { id: "w-name-2", text: "Daniel Reyes", category: "PII", subtype: "NAME", confidence: "high", recommended: false, note: "Subject — keep visible if disclosure is to defence." },
    { id: "w-dob-2", text: "1989-11-02", category: "PII", subtype: "DOB", confidence: "high", recommended: true },
    { id: "w-addr-1b", text: "44 Charles St W, Apt 1208", category: "VICTIM", subtype: "ADDRESS", confidence: "high", recommended: true },
    { id: "w-name-juv", text: "L. Okafor-Reyes", category: "JUVENILE", subtype: "NAME", confidence: "high", recommended: true, note: "Minor — mandatory redaction." },
    { id: "w-name-1c", text: "Ms Okafor", category: "VICTIM", subtype: "NAME", confidence: "high", recommended: true },
    { id: "w-name-2b", text: "Mr Reyes", category: "PII", subtype: "NAME", confidence: "high", recommended: false },
    { id: "w-name-2c", text: "Mr Reyes", category: "PII", subtype: "NAME", confidence: "high", recommended: false },
    { id: "w-addr-2", text: "112 St. Clair Ave W, Toronto", category: "PII", subtype: "ADDRESS", confidence: "medium", recommended: true, note: "Third-party residence (mother)." },
    { id: "w-file-1", text: "DV-2026-0184", category: "CONFIDENTIAL", subtype: "FILE_NUMBER", confidence: "high", recommended: false, note: "Internal reference — keep on internal copies." },
    { id: "w-name-1d", text: "Ms Okafor", category: "VICTIM", subtype: "NAME", confidence: "high", recommended: true },
    { id: "w-badge-1", text: "5821", category: "PII", subtype: "BADGE", confidence: "high", recommended: false, note: "Officer ID — usually retained on internal copy." },
  ],
};

// ──────────────────────────────────────────────────────────────────────
// 2. Officer narrative — Occurrence 26-0042 (MVA)
// ──────────────────────────────────────────────────────────────────────

const DOC_NARRATIVE: RedactionDocument = {
  id: "doc-26-0042-narrative",
  title: "Officer Narrative — Occurrence 26-0042",
  type: "Officer narrative",
  author: "Cst. J. Brand, Badge 5821",
  occurrenceRef: "26-0042",
  date: "2026-04-12",
  segments: [
    t("On 12 April 2026 at approximately 02:48 hrs, Unit 14 (writer, Badge "),
    e("n-badge-1"),
    t(") attended Yonge St & Bloor St E for a single-vehicle MVA.\n\nOn arrival the writer observed a 2018 Toyota Corolla bearing Ontario plate "),
    e("n-plate-1"),
    t(" with damage to the front passenger fender. The driver, identified by Ontario driver's license as "),
    e("n-name-1"),
    t(" (DOB "),
    e("n-dob-1"),
    t("), was cooperative and stated that he had struck a parked vehicle while reaching for a coffee. The parked vehicle, a 2014 Honda Accord bearing plate "),
    e("n-plate-2"),
    t(", is registered to "),
    e("n-name-2"),
    t(", who attended on scene at the writer's request.\n\nNo injuries were reported by either party. Both vehicles remained drivable. The writer issued a Provincial Offences Act ticket "),
    e("n-poa-1"),
    t(" to "),
    e("n-name-1b"),
    t(" for careless driving (s. 130 HTA). Scene was cleared at 03:14 hrs. Photos uploaded to the occurrence file."),
  ],
  entities: [
    { id: "n-badge-1", text: "5821", category: "PII", subtype: "BADGE", confidence: "high", recommended: false },
    { id: "n-plate-1", text: "JKLM-771", category: "PII", subtype: "PLATE", confidence: "high", recommended: true },
    { id: "n-name-1", text: "Andre Pelletier", category: "PII", subtype: "NAME", confidence: "high", recommended: true },
    { id: "n-dob-1", text: "1990-07-19", category: "PII", subtype: "DOB", confidence: "high", recommended: true },
    { id: "n-plate-2", text: "TXKR-018", category: "PII", subtype: "PLATE", confidence: "high", recommended: true },
    { id: "n-name-2", text: "Tunde Okorie", category: "PII", subtype: "NAME", confidence: "high", recommended: true },
    { id: "n-poa-1", text: "POA-2026-1771-0042", category: "CONFIDENTIAL", subtype: "FILE_NUMBER", confidence: "high", recommended: false, note: "Public-facing reference." },
    { id: "n-name-1b", text: "Mr Pelletier", category: "PII", subtype: "NAME", confidence: "high", recommended: true },
  ],
};

// ──────────────────────────────────────────────────────────────────────
// 3. FOIA disclosure response
// ──────────────────────────────────────────────────────────────────────

const DOC_FOIA: RedactionDocument = {
  id: "doc-foia-2026-0142",
  title: "FOIA Disclosure Response — File 2026-0142",
  type: "FOIA disclosure",
  author: "Records Disclosure Unit",
  date: "2026-04-30",
  pages: 2,
  segments: [
    t("Re: Freedom of Information request "),
    e("f-file-1"),
    t(" — incident at "),
    e("f-addr-1"),
    t(", 14 March 2026.\n\nFurther to your request received on 18 March 2026, please find enclosed records related to TPS occurrence "),
    e("f-occ-1"),
    t(". The lead investigator on this matter is "),
    e("f-name-1"),
    t(", reachable at "),
    e("f-phone-1"),
    t(" or "),
    e("f-email-1"),
    t(".\n\nThe primary subject of the occurrence is identified as "),
    e("f-name-2"),
    t(" (DOB "),
    e("f-dob-1"),
    t("), residing at "),
    e("f-addr-2"),
    t(". A vehicle of interest, Ontario plate "),
    e("f-plate-1"),
    t(", is registered to the same subject. Two witnesses provided sworn statements: "),
    e("f-name-3"),
    t(" and "),
    e("f-name-4"),
    t(". A third source provided information confidentially under handle "),
    e("f-inf-1"),
    t(".\n\nThis response is partial. Withholdings are claimed under MFIPPA s. 14 (personal privacy), s. 8 (law-enforcement records), and s. 38(b) (third-party privacy). Reasons are itemized in the attached schedule."),
  ],
  entities: [
    { id: "f-file-1", text: "FOI-2026-0142", category: "CONFIDENTIAL", subtype: "FILE_NUMBER", confidence: "high", recommended: false, note: "FOI request reference — public-facing." },
    { id: "f-addr-1", text: "1408 Yonge St, Toronto", category: "PII", subtype: "ADDRESS", confidence: "medium", recommended: false, note: "Public business address — discretionary." },
    { id: "f-occ-1", text: "TPS-26-417", category: "CONFIDENTIAL", subtype: "OCCURRENCE_NUMBER", confidence: "high", recommended: false },
    { id: "f-name-1", text: "Det. K. Singh", category: "PII", subtype: "NAME", confidence: "high", recommended: false, note: "Investigator — typically retained." },
    { id: "f-phone-1", text: "+1 (416) 808-2222", category: "PII", subtype: "PHONE", confidence: "high", recommended: false, note: "Public-facing investigator line." },
    { id: "f-email-1", text: "k.singh@torontopolice.on.ca", category: "PII", subtype: "EMAIL", confidence: "high", recommended: false },
    { id: "f-name-2", text: "Mike Sutherland", category: "PII", subtype: "NAME", confidence: "high", recommended: true, note: "Subject — redact for public release." },
    { id: "f-dob-1", text: "1992-06-14", category: "PII", subtype: "DOB", confidence: "high", recommended: true },
    { id: "f-addr-2", text: "44 Charles St W, Apt 1208, Toronto", category: "PII", subtype: "ADDRESS", confidence: "high", recommended: true },
    { id: "f-plate-1", text: "CFGB-481", category: "PII", subtype: "PLATE", confidence: "high", recommended: true },
    { id: "f-name-3", text: "Witness A", category: "VICTIM", subtype: "NAME", confidence: "high", recommended: true, note: "Civilian witness — protect identity." },
    { id: "f-name-4", text: "Witness B", category: "VICTIM", subtype: "NAME", confidence: "high", recommended: true },
    { id: "f-inf-1", text: "CI-71", category: "INFORMANT", subtype: "NAME", confidence: "high", recommended: true, note: "Confidential informant — mandatory." },
  ],
};

// ──────────────────────────────────────────────────────────────────────
// 4. Medical disclosure
// ──────────────────────────────────────────────────────────────────────

const DOC_MEDICAL: RedactionDocument = {
  id: "doc-26-0043-medical",
  title: "Medical Disclosure — Occurrence 26-0043",
  type: "Medical disclosure",
  author: "St. Michael's Hospital — Emergency",
  occurrenceRef: "26-0043",
  date: "2026-04-12",
  segments: [
    t("Patient: "),
    e("m-name-1"),
    t(" (DOB "),
    e("m-dob-1"),
    t("; OHIP "),
    e("m-ohip-1"),
    t("). Apprehended under MHA s. 17 by Cst. J. Brand and presented to St. Michael's Emergency at 04:24 hrs on 12 April 2026 (TPS occurrence "),
    e("m-occ-1"),
    t(").\n\nOn assessment: alert and oriented x3. Patient disclosed active suicidal ideation with a plan; no means in possession. Working impression: "),
    e("m-dx-1"),
    t(". Admitted for observation; psychiatry consult requested.\n\nGuardian of record: "),
    e("m-name-2"),
    t(" (mother), reachable at "),
    e("m-phone-1"),
    t(". Patient's permanent address on file is "),
    e("m-addr-1"),
    t(".\n\nReceiving physician acknowledged transfer of custody from TPS at 04:24 hrs. Disclosure to TPS is limited to transfer-of-custody confirmation under PHIPA; clinical detail is withheld under PHIPA s. 38."),
  ],
  entities: [
    { id: "m-name-1", text: "T. (juvenile)", category: "JUVENILE", subtype: "NAME", confidence: "high", recommended: true, note: "Minor — mandatory redaction." },
    { id: "m-dob-1", text: "2008-09-11", category: "JUVENILE", subtype: "DOB", confidence: "high", recommended: true },
    { id: "m-ohip-1", text: "1234-567-890-AB", category: "MEDICAL", subtype: "OHIP", confidence: "high", recommended: true, note: "Health card number — mandatory." },
    { id: "m-occ-1", text: "26-0043", category: "CONFIDENTIAL", subtype: "OCCURRENCE_NUMBER", confidence: "high", recommended: false },
    { id: "m-dx-1", text: "acute depressive episode with suicidal ideation", category: "MEDICAL", subtype: "DIAGNOSIS", confidence: "high", recommended: true, note: "Clinical detail — PHIPA-protected." },
    { id: "m-name-2", text: "S. (mother)", category: "JUVENILE", subtype: "NAME", confidence: "high", recommended: true, note: "Identifies the minor by association." },
    { id: "m-phone-1", text: "+1 (905) 555-0204", category: "JUVENILE", subtype: "PHONE", confidence: "high", recommended: true },
    { id: "m-addr-1", text: "1217 Lawrence Ave E, Apt 6, Scarborough", category: "JUVENILE", subtype: "ADDRESS", confidence: "high", recommended: true },
  ],
};

// ──────────────────────────────────────────────────────────────────────
// 5. Intel briefing
// ──────────────────────────────────────────────────────────────────────

const DOC_INTEL: RedactionDocument = {
  id: "doc-intel-2026-014",
  title: "Intel Briefing — INT-2026-014",
  type: "Intel briefing",
  author: "Det. Sgt. M. Wong",
  date: "2026-04-25",
  segments: [
    t("Source: "),
    e("i-inf-1"),
    t(" (handler: Det. K. Singh, reliability B). Reporting period: 1 – 24 April 2026.\n\nSubject of interest: "),
    e("i-name-1"),
    t(" (DOB "),
    e("i-dob-1"),
    t("). Source reports surveillance-grade observations of the subject frequenting a storage facility at "),
    e("i-addr-1"),
    t(" (unit B-12) on at least four occasions during the reporting period. The subject's vehicle, Ontario plate "),
    e("i-plate-1"),
    t(", is currently flagged stolen and was observed at the location on two of these occasions.\n\nThe subject is associated with two open files (TPS occurrences "),
    e("i-occ-1"),
    t(" and "),
    e("i-occ-2"),
    t("). Source has further reported transactional activity on the wallet "),
    e("i-acc-1"),
    t(" consistent with low-frequency, mid-value disbursements. Recommend a production order on the named exchange touchpoints if a prosecutorial path is being considered.\n\nThis report is restricted under TPS Intel Services class C handling. Onward distribution requires the originator's release authority."),
  ],
  entities: [
    { id: "i-inf-1", text: "CI-71", category: "INFORMANT", subtype: "NAME", confidence: "high", recommended: true, note: "Confidential informant handle." },
    { id: "i-name-1", text: "Theodore Lin (\"Tee\")", category: "PII", subtype: "NAME", confidence: "high", recommended: true },
    { id: "i-dob-1", text: "1988-03-30", category: "PII", subtype: "DOB", confidence: "high", recommended: true },
    { id: "i-addr-1", text: "200 King St E, Toronto", category: "CONFIDENTIAL", subtype: "ADDRESS", confidence: "medium", recommended: true, note: "Operational location — surveillance ongoing." },
    { id: "i-plate-1", text: "GHKW-220", category: "PII", subtype: "PLATE", confidence: "high", recommended: true },
    { id: "i-occ-1", text: "TPS-26-417", category: "CONFIDENTIAL", subtype: "OCCURRENCE_NUMBER", confidence: "high", recommended: false },
    { id: "i-occ-2", text: "TPS-26-418", category: "CONFIDENTIAL", subtype: "OCCURRENCE_NUMBER", confidence: "high", recommended: false },
    { id: "i-acc-1", text: "0x71fa…40f4", category: "CONFIDENTIAL", subtype: "ACCOUNT", confidence: "medium", recommended: true, note: "On-chain wallet — handle under PIPEDA + intel class C." },
  ],
};

export const REDACTION_DOCUMENTS: RedactionDocument[] = [
  DOC_WITNESS,
  DOC_NARRATIVE,
  DOC_FOIA,
  DOC_MEDICAL,
  DOC_INTEL,
];

export function findRedactionDocument(id: string): RedactionDocument | undefined {
  return REDACTION_DOCUMENTS.find((d) => d.id === id);
}
