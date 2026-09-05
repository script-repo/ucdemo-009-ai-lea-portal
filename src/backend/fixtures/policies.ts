/**
 * Policy / legal-reference corpus for UC7 (internal knowledge chatbot).
 *
 * Snippets are deliberately brief and clearly labelled as illustrative.
 * Real deployments would replace this with the live TPS policy library
 * and Ontario / Criminal Code text via the relational + vector backends.
 */

export interface PolicySnippet {
  id: string;
  source: "TPS Policy" | "Ontario Statute" | "Criminal Code of Canada" | "Charter";
  title: string;
  reference: string;
  excerpt: string;
  tags: string[];
}

export const POLICY_SNIPPETS: PolicySnippet[] = [
  {
    id: "p-001",
    source: "Criminal Code of Canada",
    title: "Search and seizure without warrant — exigent circumstances",
    reference: "s. 487.11",
    excerpt:
      "A peace officer may exercise any of the powers described in subsection 487(1) without a warrant if the conditions for obtaining a warrant exist but, by reason of exigent circumstances, it would be impracticable to obtain one. Exigent circumstances include the imminent loss or destruction of evidence and risk of bodily harm.",
    tags: ["search", "warrantless", "exigent", "evidence"],
  },
  {
    id: "p-002",
    source: "Charter",
    title: "Search and seizure",
    reference: "s. 8",
    excerpt:
      "Everyone has the right to be secure against unreasonable search or seizure. A search is reasonable when authorized by law, the law itself is reasonable, and the search is conducted in a reasonable manner.",
    tags: ["charter", "search", "rights"],
  },
  {
    id: "p-003",
    source: "TPS Policy",
    title: "Use of Force — Reporting",
    reference: "Procedure 15-01",
    excerpt:
      "Officers must complete a Use of Force Report (TPS-UFR-2018) for any incident in which (a) a firearm is drawn in the presence of the public, (b) a CEW is drawn or used, (c) a weapon is pointed at a person, or (d) physical force results in injury requiring medical attention. Reports are submitted within the same shift.",
    tags: ["use-of-force", "reporting", "ceew", "firearm"],
  },
  {
    id: "p-004",
    source: "TPS Policy",
    title: "Body-Worn Camera — Activation",
    reference: "Procedure 15-22",
    excerpt:
      "Body-worn cameras shall be activated for all enforcement and investigative interactions with members of the public, including but not limited to: arrests, searches, traffic stops, mental-health apprehensions under s. 17 of the MHA, and any incident likely to result in a use-of-force report. Officers may de-activate during sensitive interviews of victims of sexual assault upon their request.",
    tags: ["body-cam", "activation", "policy", "victim-rights"],
  },
  {
    id: "p-005",
    source: "Ontario Statute",
    title: "Mental Health Act — Apprehension by police officer",
    reference: "MHA s. 17",
    excerpt:
      "Where a police officer has reasonable and probable grounds to believe that a person is acting or has acted in a disorderly manner and the officer is of the opinion that the person is suffering from a mental disorder of a nature or quality that will likely result in serious bodily harm to the person, harm to another person, or imminent and serious physical impairment of the person, the officer may take the person into custody to be examined by a physician.",
    tags: ["mha", "mental-health", "apprehension", "ontario"],
  },
  {
    id: "p-006",
    source: "Criminal Code of Canada",
    title: "Arrest without warrant by peace officer",
    reference: "s. 495(1)",
    excerpt:
      "A peace officer may arrest without warrant: (a) a person who has committed an indictable offence or who, on reasonable grounds, the officer believes has committed or is about to commit an indictable offence; (b) a person whom the officer finds committing a criminal offence; or (c) a person for whose arrest a warrant is in force.",
    tags: ["arrest", "warrantless", "indictable"],
  },
  {
    id: "p-007",
    source: "TPS Policy",
    title: "Disclosure & FOI — Body-Worn Camera Footage",
    reference: "Procedure 04-13",
    excerpt:
      "Body-worn camera footage released under Crown disclosure or under the Municipal Freedom of Information and Protection of Privacy Act (MFIPPA) shall be redacted to obscure the identities of victims, juveniles under 18, informants, and uninvolved third parties. Redaction shall be reviewed and approved by a Sergeant or higher prior to release. A redaction audit log shall be retained for 7 years.",
    tags: ["disclosure", "foi", "mfippa", "redaction", "body-cam"],
  },
  {
    id: "p-008",
    source: "Criminal Code of Canada",
    title: "Sentencing — purpose and principles",
    reference: "s. 718",
    excerpt:
      "The fundamental purpose of sentencing is to protect society and to contribute to respect for the law and the maintenance of a just, peaceful and safe society by imposing just sanctions that have one or more of the following objectives: denunciation, deterrence, separation from society where necessary, rehabilitation, reparations, and promoting a sense of responsibility.",
    tags: ["sentencing", "principles"],
  },
];

export interface PolicyAnswer {
  match: RegExp;
  answer: {
    text: string;
    citations: number[];
    confidence: "high" | "medium" | "low";
  };
}

export const POLICY_ANSWERS: PolicyAnswer[] = [
  {
    match: /warrantless.*search|exigent|search.*without.*warrant/i,
    answer: {
      text:
        "A warrantless search may be conducted under exigent circumstances per s. 487.11 of the Criminal Code, where the conditions for a warrant exist but obtaining one is impracticable due to imminent loss or destruction of evidence or risk of bodily harm [1]. Any such search must still be reasonable under s. 8 of the Charter [2]. Document grounds in your notes contemporaneously and articulate the exigency.",
      citations: [0, 1],
      confidence: "high",
    },
  },
  {
    match: /use of force|ufr|force report/i,
    answer: {
      text:
        "Per TPS Procedure 15-01, a Use of Force Report (TPS-UFR-2018) must be completed within the same shift for any incident involving (a) drawing a firearm in public view, (b) drawing or deploying a CEW, (c) pointing a weapon at a person, or (d) physical force causing injury requiring medical attention [1].",
      citations: [2],
      confidence: "high",
    },
  },
  {
    match: /body.cam|bodycam|body worn|bwc/i,
    answer: {
      text:
        "TPS Procedure 15-22 requires body-worn cameras to be activated for all enforcement and investigative interactions, including arrests, searches, traffic stops, MHA s. 17 apprehensions, and any incident likely to result in a use-of-force report [1]. De-activation is permitted only at the request of a sexual-assault victim during sensitive interviews.",
      citations: [3],
      confidence: "high",
    },
  },
  {
    match: /mental health|mha|s\.?\s*17|apprehension/i,
    answer: {
      text:
        "Mental Health Act s. 17 authorizes a police officer to take a person into custody for examination by a physician where the officer has reasonable and probable grounds to believe the person is acting in a disorderly manner due to a mental disorder likely to result in serious bodily harm or imminent serious physical impairment [1]. Body-worn camera should be activated per Procedure 15-22.",
      citations: [4],
      confidence: "high",
    },
  },
  {
    match: /arrest.*warrant|s\.?\s*495|warrantless arrest/i,
    answer: {
      text:
        "Section 495(1) of the Criminal Code authorizes warrantless arrest in three situations: (a) where the officer has reasonable grounds to believe a person has committed or is about to commit an indictable offence; (b) where the officer finds the person committing any criminal offence; or (c) where a warrant is in force for the person's arrest [1].",
      citations: [5],
      confidence: "high",
    },
  },
  {
    match: /foi|freedom of information|disclosure|mfippa|redact/i,
    answer: {
      text:
        "Per TPS Procedure 04-13, body-cam footage released under Crown disclosure or MFIPPA must be redacted to obscure victims, juveniles under 18, informants, and uninvolved third parties [1]. A Sergeant or higher must review and approve redactions prior to release; the redaction audit log is retained for 7 years.",
      citations: [6],
      confidence: "high",
    },
  },
];
