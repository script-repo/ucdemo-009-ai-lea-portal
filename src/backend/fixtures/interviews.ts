/**
 * Multilingual interview fixtures for UC4 (interview transcription &
 * translation).
 */

import type { TranscriptSegment } from "../types";

export interface InterviewClip {
  id: string;
  storageKey: string;
  durationMs: number;
  capturedAt: string;
  intervieweeRole: "witness" | "suspect" | "victim";
  primaryLanguage: string;
  detectedLanguages: string[];
  segments: TranscriptSegment[];
  /** Concise English summary an analyst would receive. */
  englishSummary: {
    text: string;
    /** Segment indices grounding each sentence. */
    citations: number[][];
  };
}

export const INTERVIEWS: InterviewClip[] = [
  {
    id: "iv-2026-04-09-mandarin",
    storageKey: "interviews/2026-04-09/witness-mandarin.wav",
    durationMs: 312_000,
    capturedAt: "2026-04-09T14:22:00-04:00",
    intervieweeRole: "witness",
    primaryLanguage: "zh-CN",
    detectedLanguages: ["zh-CN", "en-US"],
    segments: [
      {
        startMs: 0,
        endMs: 4_200,
        speaker: "Officer",
        text: "Thank you for coming in. Please state your name for the record.",
        language: "en-US",
        confidence: "high",
      },
      {
        startMs: 5_100,
        endMs: 9_800,
        speaker: "Witness",
        text: "我叫陈丽华。",
        language: "zh-CN",
        translation: "My name is Chen Li-Hua.",
        confidence: "high",
      },
      {
        startMs: 11_000,
        endMs: 16_400,
        speaker: "Officer",
        text: "Can you tell me what you saw last Friday evening at the convenience store?",
        language: "en-US",
        confidence: "high",
      },
      {
        startMs: 17_200,
        endMs: 28_400,
        speaker: "Witness",
        text:
          "我大概晚上九点半的时候去买东西。我看到一个男人戴着黑色的帽子，他从店里跑出来，手里拿着一个袋子。",
        language: "zh-CN",
        translation:
          "I went to buy something around 9:30 in the evening. I saw a man wearing a black hat. He ran out of the store carrying a bag.",
        confidence: "high",
      },
      {
        startMs: 29_500,
        endMs: 32_600,
        speaker: "Officer",
        text: "Did you see his face?",
        language: "en-US",
        confidence: "high",
      },
      {
        startMs: 33_400,
        endMs: 41_900,
        speaker: "Witness",
        text:
          "没有看清楚。他跑得很快，往南边的方向跑了。我觉得他大概三十岁左右，瘦瘦的。",
        language: "zh-CN",
        translation:
          "I didn't see clearly. He ran very fast, in the direction of the south. I think he was about thirty years old, thin.",
        confidence: "medium",
      },
      {
        startMs: 43_000,
        endMs: 47_200,
        speaker: "Officer",
        text: "Was there anyone else in the store at the time?",
        language: "en-US",
        confidence: "high",
      },
      {
        startMs: 48_100,
        endMs: 56_800,
        speaker: "Witness",
        text: "只有店员，一个年轻的女孩。她吓坏了，一直在哭。",
        language: "zh-CN",
        translation: "Only the clerk, a young girl. She was terrified and kept crying.",
        confidence: "high",
      },
    ],
    englishSummary: {
      text:
        "Witness Chen Li-Hua attended the convenience store at approximately 21:30 last Friday and observed a male wearing a black hat exit the store at speed carrying a bag, fleeing southbound. The witness was unable to see the suspect's face clearly but described him as approximately thirty years old and slim build. The only other person present was a young female clerk who appeared to be in distress. Interview conducted in Mandarin (Simplified) with simultaneous English translation; both transcripts retained.",
      citations: [[1, 3], [3, 5], [7]],
    },
  },
  {
    id: "iv-2026-04-10-tagalog",
    storageKey: "interviews/2026-04-10/victim-tagalog.wav",
    durationMs: 248_000,
    capturedAt: "2026-04-10T11:08:00-04:00",
    intervieweeRole: "victim",
    primaryLanguage: "tl-PH",
    detectedLanguages: ["tl-PH", "en-US"],
    segments: [
      {
        startMs: 0,
        endMs: 5_400,
        speaker: "Officer",
        text: "I'm sorry to ask you to talk about this again. Take your time.",
        language: "en-US",
        confidence: "high",
      },
      {
        startMs: 6_100,
        endMs: 13_800,
        speaker: "Victim",
        text:
          "Salamat po. Sabihin ko na lang kung ano ang nangyari kahapon ng gabi.",
        language: "tl-PH",
        translation: "Thank you. Let me just tell you what happened last night.",
        confidence: "high",
      },
      {
        startMs: 15_200,
        endMs: 27_400,
        speaker: "Victim",
        text:
          "Pumasok siya sa bahay namin gamit ang sariling susi niya. Sumigaw siya sa akin tungkol sa pera. Tinulak niya ako sa pader.",
        language: "tl-PH",
        translation:
          "He came into our home using his own key. He shouted at me about money. He pushed me against the wall.",
        confidence: "high",
      },
      {
        startMs: 29_000,
        endMs: 33_400,
        speaker: "Officer",
        text: "Are you injured? Have you seen a doctor?",
        language: "en-US",
        confidence: "high",
      },
      {
        startMs: 34_200,
        endMs: 41_500,
        speaker: "Victim",
        text:
          "May pasa sa likod ko, pero hindi ako tumawag ng doktor. Takot ako na malaman niya.",
        language: "tl-PH",
        translation:
          "There is a bruise on my back, but I did not call a doctor. I was afraid he would find out.",
        confidence: "medium",
      },
      {
        startMs: 43_000,
        endMs: 49_800,
        speaker: "Officer",
        text:
          "Thank you. We can arrange medical attention privately, and victim services can help with safe accommodation tonight.",
        language: "en-US",
        confidence: "high",
      },
    ],
    englishSummary: {
      text:
        "Complainant (identified by full name in the case file, redacted from this summary) reports that a known male — believed to be her common-law partner — entered the residence using his own key on the previous evening, shouted at her over financial matters, and pushed her against an interior wall. Complainant disclosed bruising to her back but did not seek medical attention out of fear of retaliation. Complainant accepted referral to TPS Victim Services and a same-day medical assessment. Interview conducted in Tagalog with simultaneous English translation; both transcripts retained.",
      citations: [[1, 2], [2, 4], [4, 5]],
    },
  },
];
