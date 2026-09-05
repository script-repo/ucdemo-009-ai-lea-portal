/**
 * 911 transcript corpus for UC8.
 *
 * Aggregated, de-identified samples used to demonstrate trend analysis,
 * call-disposition statistics, and process-improvement insights without
 * exposing caller PII.
 *
 * Composition:
 *   - 20 hand-curated samples with authentic-feeling excerpts (front).
 *   - ~280 procedurally-generated samples (back) that follow real
 *     urban-dispatch distributions (time-of-day, day-of-week, category,
 *     division, disposition, response time, interpreter rate).
 *
 * The procedural generator is deterministic (seeded LCG) so the demo
 * reproduces identically across reloads — important for screenshots
 * and stat call-outs in scripted demos.
 */

export type CallDisposition =
  | "Officer dispatched"
  | "Referred to non-emergency line"
  | "Referred to mental-health team"
  | "Caller hung up"
  | "Resolved on call"
  | "False alarm";

export type CallCategory =
  | "Domestic"
  | "Mental health"
  | "Property"
  | "Suspicious person"
  | "Traffic"
  | "Medical"
  | "Hang-up"
  | "Other";

export const TPS_DIVISIONS = [11, 12, 13, 14, 22, 31, 32, 33, 41, 42, 43, 51, 52, 53, 54, 55] as const;
export type TPSDivision = (typeof TPS_DIVISIONS)[number];

export interface Call911 {
  id: string;
  timestamp: string;
  /** Anonymized — derived hash, never raw phone or location. */
  callerHash: string;
  /** Coarse geography only — division, never address. */
  division: TPSDivision;
  category: CallCategory;
  durationSec: number;
  disposition: CallDisposition;
  /** Quote, scrubbed of names/addresses. */
  excerpt: string;
  /** Time from call connect to officer on-scene, when applicable. */
  responseTimeSec?: number;
  hadInterpreter: boolean;
  /** Detected interpreter language (when applicable). */
  interpreterLanguage?: string;
  /** Whether the call had a Mobile Crisis Intervention Team co-response. */
  mcitDispatched?: boolean;
}

function mkHash(seed: number): string {
  return `c-${seed.toString(16).padStart(4, "0")}-${(seed * 7919).toString(16).slice(-4)}`;
}

const CURATED: Array<Omit<Call911, "id" | "callerHash">> = [
  {
    timestamp: "2026-04-12T03:14:00-04:00",
    division: 51,
    category: "Domestic",
    durationSec: 180,
    disposition: "Officer dispatched",
    excerpt: "He's drunk and yelling at me. I just want him out of the apartment.",
    responseTimeSec: 540,
    hadInterpreter: false,
  },
  {
    timestamp: "2026-04-12T04:08:00-04:00",
    division: 14,
    category: "Mental health",
    durationSec: 360,
    disposition: "Referred to mental-health team",
    excerpt: "My brother says he wants to hurt himself. He's been off his medication for two weeks.",
    responseTimeSec: 720,
    hadInterpreter: false,
    mcitDispatched: true,
  },
  {
    timestamp: "2026-04-12T22:51:00-04:00",
    division: 32,
    category: "Property",
    durationSec: 96,
    disposition: "Officer dispatched",
    excerpt: "Someone broke the back window of my shop. They're gone now but they took the till.",
    responseTimeSec: 1_240,
    hadInterpreter: true,
    interpreterLanguage: "Mandarin",
  },
  {
    timestamp: "2026-04-13T01:38:00-04:00",
    division: 51,
    category: "Suspicious person",
    durationSec: 72,
    disposition: "Officer dispatched",
    excerpt: "There's a man walking up and down our street looking into cars. He's been at it for 30 minutes.",
    responseTimeSec: 480,
    hadInterpreter: false,
  },
  {
    timestamp: "2026-04-13T11:22:00-04:00",
    division: 22,
    category: "Hang-up",
    durationSec: 6,
    disposition: "Caller hung up",
    excerpt: "[silence, line dropped]",
    hadInterpreter: false,
  },
  {
    timestamp: "2026-04-13T19:04:00-04:00",
    division: 13,
    category: "Mental health",
    durationSec: 540,
    disposition: "Referred to mental-health team",
    excerpt: "She's standing on the bridge. Please send someone who knows how to talk to her.",
    responseTimeSec: 360,
    hadInterpreter: false,
    mcitDispatched: true,
  },
  {
    timestamp: "2026-04-13T22:13:00-04:00",
    division: 14,
    category: "Domestic",
    durationSec: 240,
    disposition: "Officer dispatched",
    excerpt: "I can hear them screaming through the wall. The kids are crying.",
    responseTimeSec: 480,
    hadInterpreter: true,
    interpreterLanguage: "Tagalog",
  },
  {
    timestamp: "2026-04-14T08:12:00-04:00",
    division: 41,
    category: "Traffic",
    durationSec: 120,
    disposition: "Officer dispatched",
    excerpt: "Two-vehicle collision at the intersection, no injuries that I can see, traffic is backing up.",
    responseTimeSec: 720,
    hadInterpreter: false,
  },
  {
    timestamp: "2026-04-14T14:48:00-04:00",
    division: 53,
    category: "Property",
    durationSec: 84,
    disposition: "Resolved on call",
    excerpt: "Never mind, I found my wallet. Sorry.",
    hadInterpreter: false,
  },
  {
    timestamp: "2026-04-14T17:30:00-04:00",
    division: 42,
    category: "Medical",
    durationSec: 96,
    disposition: "Referred to non-emergency line",
    excerpt: "I think I need to talk to someone, my chest feels weird but it's not too bad.",
    hadInterpreter: false,
  },
  {
    timestamp: "2026-04-14T23:45:00-04:00",
    division: 51,
    category: "Mental health",
    durationSec: 480,
    disposition: "Referred to mental-health team",
    excerpt: "He's been in his room for three days, won't come out, won't eat. He's 19.",
    responseTimeSec: 540,
    hadInterpreter: false,
    mcitDispatched: true,
  },
  {
    timestamp: "2026-04-15T02:18:00-04:00",
    division: 14,
    category: "Suspicious person",
    durationSec: 60,
    disposition: "False alarm",
    excerpt: "There was someone in our backyard but it turned out to be the neighbour's dog.",
    responseTimeSec: 600,
    hadInterpreter: false,
  },
  {
    timestamp: "2026-04-15T13:02:00-04:00",
    division: 32,
    category: "Domestic",
    durationSec: 300,
    disposition: "Officer dispatched",
    excerpt: "He's outside the house again, I have a restraining order.",
    responseTimeSec: 240,
    hadInterpreter: false,
  },
  {
    timestamp: "2026-04-15T20:55:00-04:00",
    division: 13,
    category: "Property",
    durationSec: 144,
    disposition: "Officer dispatched",
    excerpt: "My car was stolen, it was parked right outside the building.",
    responseTimeSec: 1_800,
    hadInterpreter: false,
  },
  {
    timestamp: "2026-04-16T00:33:00-04:00",
    division: 51,
    category: "Mental health",
    durationSec: 420,
    disposition: "Referred to mental-health team",
    excerpt: "She's been talking about ending things. I don't know what to do.",
    responseTimeSec: 480,
    hadInterpreter: false,
    mcitDispatched: true,
  },
  {
    timestamp: "2026-04-16T11:15:00-04:00",
    division: 22,
    category: "Other",
    durationSec: 180,
    disposition: "Referred to non-emergency line",
    excerpt: "There's a noise complaint at the construction site, they started before 7am.",
    hadInterpreter: false,
  },
  {
    timestamp: "2026-04-16T15:42:00-04:00",
    division: 14,
    category: "Traffic",
    durationSec: 96,
    disposition: "Officer dispatched",
    excerpt: "There's a driver doing donuts in the parking lot, I think he's drunk.",
    responseTimeSec: 360,
    hadInterpreter: false,
  },
  {
    timestamp: "2026-04-16T22:29:00-04:00",
    division: 41,
    category: "Domestic",
    durationSec: 360,
    disposition: "Officer dispatched",
    excerpt: "He pushed me down the stairs, I think my arm is broken.",
    responseTimeSec: 240,
    hadInterpreter: true,
    interpreterLanguage: "Spanish",
  },
  {
    timestamp: "2026-04-17T04:00:00-04:00",
    division: 13,
    category: "Hang-up",
    durationSec: 12,
    disposition: "Caller hung up",
    excerpt: "[muffled audio, line disconnected]",
    hadInterpreter: false,
  },
  {
    timestamp: "2026-04-17T18:50:00-04:00",
    division: 32,
    category: "Suspicious person",
    durationSec: 132,
    disposition: "Officer dispatched",
    excerpt: "A man matching the description from the news is in the coffee shop across the street.",
    responseTimeSec: 480,
    hadInterpreter: false,
  },
];

// ──────────────────────────────────────────────────────────────────────
// Procedural extension
// ──────────────────────────────────────────────────────────────────────

/** Linear congruential generator — deterministic, seedable, fast. */
function lcg(seed: number) {
  let s = seed >>> 0 || 1;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0x1_0000_0000;
  };
}

function pickWeighted<T>(rng: () => number, items: Array<[T, number]>): T {
  const total = items.reduce((a, [, w]) => a + w, 0);
  let r = rng() * total;
  for (const [v, w] of items) {
    r -= w;
    if (r <= 0) return v;
  }
  return items[items.length - 1]![0];
}

const CATEGORY_WEIGHTS: Array<[CallCategory, number]> = [
  ["Domestic", 18],
  ["Mental health", 14],
  ["Property", 16],
  ["Suspicious person", 12],
  ["Traffic", 14],
  ["Medical", 10],
  ["Hang-up", 8],
  ["Other", 8],
];

const DIVISION_WEIGHTS: Array<[TPSDivision, number]> = [
  [51, 14], [14, 13], [32, 11], [13, 9], [41, 9],
  [22, 7], [33, 6], [42, 6], [43, 5], [11, 5],
  [12, 4], [31, 4], [52, 3], [53, 2], [54, 1], [55, 1],
];

const HOUR_WEIGHTS: number[] = [
  // 0-23 — late evening / early hours busiest
  10, 9, 8, 7, 5, 4, 3, 4, 6, 7, 8, 9, 10, 11, 12, 12, 13, 14, 15, 16, 15, 14, 13, 12,
];

function pickHour(rng: () => number) {
  const total = HOUR_WEIGHTS.reduce((a, b) => a + b, 0);
  let r = rng() * total;
  for (let h = 0; h < 24; h++) {
    r -= HOUR_WEIGHTS[h]!;
    if (r <= 0) return h;
  }
  return 23;
}

/** Per-category disposition weights. */
const DISPOSITION_BY_CATEGORY: Record<CallCategory, Array<[CallDisposition, number]>> = {
  Domestic: [["Officer dispatched", 75], ["Referred to mental-health team", 8], ["Resolved on call", 10], ["False alarm", 4], ["Caller hung up", 3]],
  "Mental health": [["Referred to mental-health team", 60], ["Officer dispatched", 25], ["Referred to non-emergency line", 10], ["Resolved on call", 5]],
  Property: [["Officer dispatched", 75], ["Referred to non-emergency line", 12], ["Resolved on call", 8], ["False alarm", 5]],
  "Suspicious person": [["Officer dispatched", 65], ["False alarm", 18], ["Resolved on call", 10], ["Referred to non-emergency line", 7]],
  Traffic: [["Officer dispatched", 80], ["Resolved on call", 10], ["Referred to non-emergency line", 8], ["False alarm", 2]],
  Medical: [["Referred to non-emergency line", 55], ["Officer dispatched", 25], ["Resolved on call", 20]],
  "Hang-up": [["Caller hung up", 100]],
  Other: [["Referred to non-emergency line", 50], ["Officer dispatched", 25], ["Resolved on call", 25]],
};

/** Per-category response-time band (seconds). */
const RESPONSE_BAND: Record<CallCategory, [number, number]> = {
  Domestic: [240, 720],
  "Mental health": [360, 900],
  Property: [600, 1800],
  "Suspicious person": [360, 720],
  Traffic: [300, 900],
  Medical: [360, 600],
  "Hang-up": [600, 1200],
  Other: [600, 1500],
};

/** Per-category duration band (seconds). */
const DURATION_BAND: Record<CallCategory, [number, number]> = {
  Domestic: [120, 420],
  "Mental health": [180, 600],
  Property: [60, 180],
  "Suspicious person": [60, 180],
  Traffic: [60, 180],
  Medical: [60, 240],
  "Hang-up": [3, 30],
  Other: [60, 240],
};

const INTERPRETER_LANGUAGES: Array<[string, number]> = [
  ["Mandarin", 24],
  ["Tagalog", 14],
  ["Spanish", 12],
  ["Tamil", 8],
  ["Cantonese", 8],
  ["Punjabi", 8],
  ["Russian", 6],
  ["Arabic", 8],
  ["Korean", 5],
  ["Persian", 4],
  ["Italian", 3],
];

const EXCERPTS: Record<CallCategory, string[]> = {
  Domestic: [
    "He's been drinking again and won't leave.",
    "She's hitting me, please send somebody.",
    "They're arguing in the unit above mine, it's getting loud.",
    "My ex is outside, he's not supposed to be here.",
    "I locked myself in the bathroom, he's banging on the door.",
    "The kids are crying, I think he hit her.",
  ],
  "Mental health": [
    "He's talking to people who aren't there, I'm worried.",
    "She hasn't slept in three days, she's not making sense.",
    "He took a whole bottle of pills, he's still breathing.",
    "She's standing on the balcony again, please hurry.",
    "He stopped his medication, he's getting paranoid.",
    "She wants to hurt herself, she has a knife.",
  ],
  Property: [
    "Someone smashed our window overnight.",
    "My bike was locked here this morning, it's gone.",
    "They got into the car, my laptop is missing.",
    "Catalytic converter was cut off the truck, you can hear the difference.",
    "Mailbox has been broken into, the cheques are missing.",
    "Storage locker padlock was cut, equipment missing.",
  ],
  "Suspicious person": [
    "There's a guy looking through car windows on our street.",
    "Someone's been pacing in front of the school for 30 minutes.",
    "He's been hanging around the bank since it opened.",
    "Two men in dark clothing are trying door handles.",
    "There's a group on the corner, they look like they're casing the store.",
    "She keeps walking up and down past our building.",
  ],
  Traffic: [
    "Two-vehicle collision in the intersection, no injuries visible.",
    "Driver looks impaired, swerving across lanes.",
    "Truck hit a pole, the driver is out and looks confused.",
    "Cyclist down at the corner, possible head injury.",
    "Car flipped on its side at the off-ramp.",
    "Van blocking the streetcar tracks, refusing to move.",
  ],
  Medical: [
    "Elderly neighbour fell, can't get up but is conscious.",
    "Difficulty breathing, no chest pain.",
    "Allergic reaction, face is swelling.",
    "Diabetic, very confused, blood sugar might be low.",
    "Possible overdose, unresponsive but breathing.",
    "Severe abdominal pain, can't drive ourselves.",
  ],
  "Hang-up": [
    "[silence, line dropped]",
    "[muffled audio, line disconnected]",
    "[child voice briefly, then disconnect]",
    "[background TV, line disconnected]",
    "[coughing, then disconnect]",
  ],
  Other: [
    "Construction noise before legal hours.",
    "Loose dog running through traffic.",
    "Smoke from the alley behind the building.",
    "Power line down across the sidewalk.",
    "Bonfire in the park, group is large.",
    "Fireworks complaint, late at night.",
  ],
};

function ts(date: Date) {
  const tzOffset = "-04:00";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}${tzOffset}`;
}

function genProcedural(count: number, startSeed: number): Array<Omit<Call911, "id" | "callerHash">> {
  const rng = lcg(startSeed);
  const out: Array<Omit<Call911, "id" | "callerHash">> = [];
  // Spread across the 30 days preceding 2026-04-30.
  const baseDay = new Date(2026, 3, 30); // April 30, 2026 (month is 0-indexed)
  for (let i = 0; i < count; i++) {
    const dayOffset = -Math.floor(rng() * 30);
    const date = new Date(baseDay);
    date.setDate(date.getDate() + dayOffset);
    // Day-of-week weighting — weekends slightly busier.
    const dow = date.getDay();
    if ((dow === 0 || dow === 6) && rng() < 0.15) {
      // bump weekend sample by skipping less
    } else if (dow >= 1 && dow <= 4 && rng() < 0.08) {
      continue;
    }
    const hour = pickHour(rng);
    const minute = Math.floor(rng() * 60);
    date.setHours(hour, minute, Math.floor(rng() * 60), 0);

    const category = pickWeighted(rng, CATEGORY_WEIGHTS);
    const division = pickWeighted(rng, DIVISION_WEIGHTS);
    const disposition = pickWeighted(rng, DISPOSITION_BY_CATEGORY[category]);
    const [dLo, dHi] = DURATION_BAND[category];
    const durationSec = Math.round(dLo + rng() * (dHi - dLo));

    let responseTimeSec: number | undefined;
    if (disposition === "Officer dispatched" || disposition === "Referred to mental-health team") {
      const [rLo, rHi] = RESPONSE_BAND[category];
      responseTimeSec = Math.round(rLo + rng() * (rHi - rLo));
    }

    const hadInterpreter = rng() < 0.12;
    const interpreterLanguage = hadInterpreter
      ? pickWeighted(rng, INTERPRETER_LANGUAGES)
      : undefined;

    const mcitDispatched =
      category === "Mental health" && disposition === "Referred to mental-health team"
        ? rng() < 0.85
        : undefined;

    const pool = EXCERPTS[category];
    const excerpt = pool[Math.floor(rng() * pool.length)] ?? pool[0]!;

    out.push({
      timestamp: ts(date),
      division,
      category,
      durationSec,
      disposition,
      excerpt,
      responseTimeSec,
      hadInterpreter,
      interpreterLanguage,
      mcitDispatched,
    });
  }
  // Sort newest first to match curated ordering convention.
  out.sort((a, b) => (a.timestamp < b.timestamp ? 1 : -1));
  return out;
}

const ALL = [...CURATED, ...genProcedural(280, 0xC0FFEE)];

export const CALLS_911: Call911[] = ALL.map((s, i) => ({
  ...s,
  id: `911-${s.timestamp.slice(0, 10)}-${i.toString().padStart(4, "0")}`,
  callerHash: mkHash(i + 1),
}));

/** Pre-computed index of available date range for the date-picker UI. */
export const CALLS_911_DATE_RANGE = (() => {
  const ts = CALLS_911.map((c) => c.timestamp).sort();
  return {
    min: ts[0] ?? "",
    max: ts[ts.length - 1] ?? "",
    count: ts.length,
  };
})();
