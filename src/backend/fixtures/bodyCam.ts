/**
 * Body-camera audio + transcript fixtures for UC1 (report writing).
 *
 * Two scenarios — a traffic stop and a domestic disturbance — chosen
 * because they exercise different report templates (MVA vs Domestic).
 */

import type { TranscriptSegment } from "../types";

export interface BodyCamClip {
  id: string;
  storageKey: string; // bucket/key in the simulated object store
  durationMs: number;
  capturedAt: string;
  officer: string;
  unit: string;
  location: string;
  scenario: "traffic-stop" | "domestic" | "trespass";
  segments: TranscriptSegment[];
  /** What an LLM would draft from the segments. */
  draftReport: {
    occurrenceType: string;
    narrative: string;
    /** Indices into segments that ground each paragraph. */
    paragraphCitations: number[][];
    suggestedCharges?: string[];
    parties: Array<{
      role: "complainant" | "subject" | "witness" | "officer";
      name?: string;
      dob?: string;
      redactionCategory?: "VICTIM" | "JUVENILE" | "PII" | "INFORMANT";
    }>;
  };
}

export const BODY_CAM_CLIPS: BodyCamClip[] = [
  {
    id: "bc-2026-04-12-0314",
    storageKey: "bodycam/2026-04-12/unit14-0314.mp4",
    durationMs: 168_000,
    capturedAt: "2026-04-12T03:14:22-04:00",
    officer: "Cst. J. Brand (5821)",
    unit: "Unit 14",
    location: "Yonge St & Bloor St E",
    scenario: "traffic-stop",
    segments: [
      {
        startMs: 1_200,
        endMs: 4_800,
        speaker: "Officer",
        text: "Toronto Police, can I see your driver's license, ownership and insurance please.",
        confidence: "high",
      },
      {
        startMs: 5_400,
        endMs: 9_600,
        speaker: "Driver",
        text: "Yeah, here you go. What did I do, officer?",
        confidence: "high",
      },
      {
        startMs: 10_400,
        endMs: 17_200,
        speaker: "Officer",
        text: "I clocked you doing 78 in a 50 zone on Yonge. Have you been drinking tonight?",
        confidence: "high",
      },
      {
        startMs: 18_000,
        endMs: 21_400,
        speaker: "Driver",
        text: "I had two beers about three hours ago at Cibo, that's it.",
        confidence: "high",
      },
      {
        startMs: 22_200,
        endMs: 26_500,
        speaker: "Officer",
        text: "Step out of the vehicle for me, sir. I'm going to administer a roadside screening.",
        confidence: "high",
      },
      {
        startMs: 88_500,
        endMs: 92_300,
        speaker: "Officer",
        text: "Roadside reads pass. I'm issuing you a Provincial Offences ticket for speeding.",
        confidence: "high",
      },
      {
        startMs: 102_400,
        endMs: 109_800,
        speaker: "Officer",
        text: "Sign here please. Court date's printed at the bottom if you choose to dispute. Drive safe.",
        confidence: "medium",
      },
    ],
    draftReport: {
      occurrenceType: "Highway Traffic Act — Speeding (s. 128)",
      narrative:
        "On 2026-04-12 at approximately 03:14 hours, Cst. Brand (5821) operating Unit 14 observed a black 2022 Honda Civic, Ontario plate CFGB-481, travelling southbound on Yonge Street north of Bloor Street East at a speed of 78 km/h in a posted 50 km/h zone. The radar reading was confirmed against the speedometer of the patrol vehicle. The driver, identified by Ontario driver's licence as the registered owner, was cooperative throughout the stop. Cst. Brand detected a faint odour of alcohol and administered an Approved Screening Device test which returned a PASS. The driver was issued a Provincial Offences ticket for speeding under s. 128 of the Highway Traffic Act. No further action taken; vehicle released to the driver at 03:18 hours.",
      paragraphCitations: [[0, 1, 2], [3, 4, 5], [5, 6]],
      parties: [
        {
          role: "subject",
          name: "Adrien Pelletier",
          dob: "1991-08-22",
          redactionCategory: "PII",
        },
        { role: "officer", name: "Cst. J. Brand (5821)" },
      ],
    },
  },
  {
    id: "bc-2026-04-12-0452",
    storageKey: "bodycam/2026-04-12/unit14-0452.mp4",
    durationMs: 412_000,
    capturedAt: "2026-04-12T04:52:08-04:00",
    officer: "Cst. J. Brand (5821)",
    unit: "Unit 14",
    location: "44 Charles St W, Apt 1208",
    scenario: "domestic",
    segments: [
      {
        startMs: 800,
        endMs: 4_200,
        speaker: "Officer",
        text: "Toronto Police, we got a call from this address. Is everything okay in there?",
        confidence: "high",
      },
      {
        startMs: 6_100,
        endMs: 11_400,
        speaker: "Complainant",
        text: "He's been drinking and yelling at me all night. I just want him out.",
        confidence: "medium",
      },
      {
        startMs: 12_000,
        endMs: 17_800,
        speaker: "Officer",
        text: "Okay, take a breath. Are you injured? Is there anyone else in the apartment?",
        confidence: "high",
      },
      {
        startMs: 18_400,
        endMs: 22_600,
        speaker: "Complainant",
        text: "No, no, he didn't hit me. My daughter is sleeping. She's eight.",
        confidence: "high",
      },
      {
        startMs: 38_900,
        endMs: 44_100,
        speaker: "Subject",
        text: "I didn't do anything. She's lying. I just want to go to bed.",
        confidence: "medium",
      },
      {
        startMs: 96_500,
        endMs: 104_800,
        speaker: "Officer",
        text: "Sir, given the disturbance and your level of intoxication, you can spend the night at your brother's. We'll arrange transport.",
        confidence: "high",
      },
      {
        startMs: 240_000,
        endMs: 248_400,
        speaker: "Officer",
        text: "Ma'am, I'm leaving you a victim-services pamphlet. Number on the back is 24/7. Call us back if anything changes tonight.",
        confidence: "high",
      },
    ],
    draftReport: {
      occurrenceType: "Domestic Disturbance — No Charges Laid",
      narrative:
        "On 2026-04-12 at 04:52 hours, Cst. Brand (5821) attended apartment 1208, 44 Charles Street West in response to a 911 call reporting a verbal disturbance. On arrival the complainant advised that her common-law partner had been drinking and yelling for several hours but had not been physically violent. No visible injuries were observed and the complainant declined ambulance. A juvenile (age 8) was sleeping in a separate bedroom and was not disturbed. The subject was found to be cooperative but visibly intoxicated; he denied any wrongdoing. To prevent escalation the subject was transported to a family member's residence at the complainant's request. A victim-services pamphlet was provided. No charges were laid. File flagged for follow-up by the Domestic Violence coordinator.",
      paragraphCitations: [[0, 1], [2, 3], [4, 5], [6]],
      parties: [
        {
          role: "complainant",
          name: "Maya Okafor",
          dob: "1989-03-11",
          redactionCategory: "VICTIM",
        },
        {
          role: "subject",
          name: "Daniel Reyes",
          dob: "1986-07-04",
          redactionCategory: "PII",
        },
        { role: "witness", name: "Minor (age 8)", redactionCategory: "JUVENILE" },
        { role: "officer", name: "Cst. J. Brand (5821)" },
      ],
    },
  },
];

export function findBodyCamClip(id: string): BodyCamClip | undefined {
  return BODY_CAM_CLIPS.find((c) => c.id === id);
}
