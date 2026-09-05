import { useMemo, useState } from "react";
import {
  AIPromptBar,
  AIResponseCard,
  AuditTrail,
  Button,
  type Citation,
  CitationChip,
  CitationSources,
  ConfidenceBadge,
  DisclaimerBar,
  HumanReviewBanner,
  Icon,
  RedactionToken,
  Section,
  SourceSelector,
  type Source,
  StreamingIndicator,
  Workspace,
  type AuditEntry,
} from "@/components";

/**
 * Example use case — Narrative Drafting Assistant.
 *
 * Demonstrates the canonical wiring of:
 *   AIPromptBar → AIResponseCard → Citations → Confidence
 *   → HumanReviewBanner → AuditTrail
 *
 * This is the reference implementation. New use cases should follow
 * the same shape and use the same components from `@/components`.
 */

const SOURCES: Source[] = [
  {
    id: "occ-230000045",
    label: "Occurrence 23-0000045",
    icon: "document",
    description: "Break and enter — 14 May 2026",
  },
  {
    id: "person-burris",
    label: "Person — Burris, David",
    icon: "user",
    description: "Linked subject, DOB redacted",
  },
  {
    id: "note-1142",
    label: "Officer note 1142",
    icon: "document",
    description: "Patrol observations, Unit 14",
  },
  {
    id: "address-411",
    label: "Address — 411 Maple Ave.",
    icon: "folder",
    description: "Scene address, last 12 months",
  },
];

const CITATIONS: Citation[] = [
  {
    index: 1,
    title: "Occurrence 23-0000045 — Officer narrative §2",
    meta: "Created 2026-05-14 14:02 by Cst. P. Cole",
  },
  {
    index: 2,
    title: "Officer note 1142 — Scene description",
    meta: "Created 2026-05-14 14:18 by Cst. J. Brand",
  },
  {
    index: 3,
    title: "Person record — Burris, David",
    meta: "Most recent update 2026-04-22",
  },
];

export function NarrativeDraftUseCase() {
  const [selectedSources, setSelectedSources] = useState<string[]>([
    "occ-230000045",
    "note-1142",
  ]);
  const [generating, setGenerating] = useState(false);
  const [draft, setDraft] = useState<null | {
    text: JSX.Element;
    timestamp: Date;
  }>(null);
  const [auditEntries, setAuditEntries] = useState<AuditEntry[]>([
    {
      id: "1",
      timestamp: new Date(),
      actor: "Officer J. Brand",
      action: "Opened Narrative Drafting Assistant",
    },
  ]);

  const audit = useMemo(
    () => (entry: Omit<AuditEntry, "id" | "timestamp">) => {
      setAuditEntries((prev) => [
        ...prev,
        {
          ...entry,
          id: String(prev.length + 1),
          timestamp: new Date(),
        },
      ]);
    },
    [],
  );

  function toggleSource(id: string) {
    setSelectedSources((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id],
    );
    audit({
      actor: "Officer J. Brand",
      action: `Toggled source ${id}`,
    });
  }

  function handlePrompt(prompt: string) {
    audit({
      actor: "Officer J. Brand",
      action: `Submitted prompt (${prompt.length} chars)`,
    });
    setGenerating(true);
    setDraft(null);

    window.setTimeout(() => {
      setGenerating(false);
      setDraft({
        timestamp: new Date(),
        text: (
          <>
            <p>
              On 14 May 2026 at approximately 02:10 hours, units were
              dispatched to <strong>411 Maple Ave.</strong> in response to a
              reported break-and-enter
              <CitationChip citation={CITATIONS[0]!} />.
            </p>
            <p>
              On arrival, Cst. Brand observed the rear entry door open with
              visible pry marks on the strike plate
              <CitationChip citation={CITATIONS[1]!} />. The complainant,{" "}
              <RedactionToken
                category="VICTIM"
                value="Lin Sosa"
                revealable
                onReveal={() =>
                  audit({
                    actor: "Officer J. Brand",
                    action: "Revealed VICTIM identity",
                  })
                }
              />
              , reported that personal electronics and a 2014 silver Toyota
              Corolla were missing from the residence.
            </p>
            <p>
              A subject matching the description provided by the complainant
              was identified through prior records as{" "}
              <strong>Burris, David</strong>
              <CitationChip citation={CITATIONS[2]!} />. No determination has
              been made; subject was not on scene at time of attendance.
            </p>
          </>
        ),
      });
      audit({
        actor: "AISP",
        ai: true,
        action: `Generated narrative draft (medium confidence, 3 citations)`,
      });
    }, 1300);
  }

  function acceptDraft() {
    audit({
      actor: "Officer J. Brand",
      action: "Accepted AI draft into Occurrence 23-0000045 narrative",
    });
    setDraft(null);
  }

  function rejectDraft() {
    audit({
      actor: "Officer J. Brand",
      action: "Rejected AI draft",
    });
    setDraft(null);
  }

  return (
    <Workspace>
      <DisclaimerBar />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 280px",
          gap: 14,
          alignItems: "start",
        }}
      >
        {/* Left column — main work area */}
        <div style={{ minWidth: 0 }}>
          <Section title="Composition" trailing={null}>
            <AIPromptBar
              placeholder="Describe the section you want to draft. E.g. 'Draft the scene description for occurrence 23-0000045 in third person.'"
              onSubmit={handlePrompt}
              busy={generating}
            />
          </Section>

          {generating && (
            <Section title="Generating">
              <StreamingIndicator label="Drafting narrative" />
            </Section>
          )}

          {draft && (
            <>
              <HumanReviewBanner
                onAccept={acceptDraft}
                onReject={rejectDraft}
                onEdit={() =>
                  audit({
                    actor: "Officer J. Brand",
                    action: "Opened draft for manual editing",
                  })
                }
              />
              <AIResponseCard
                role="ai"
                model="AISP · Narrative Drafter"
                confidence="medium"
                timestamp={draft.timestamp}
                actions={
                  <>
                    <Button
                      variant="ghost"
                      size="sm"
                      leadingIcon={<Icon name="copy" size={14} />}
                      onClick={() =>
                        audit({
                          actor: "Officer J. Brand",
                          action: "Copied AI draft to clipboard",
                        })
                      }
                    >
                      Copy
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      leadingIcon={<Icon name="thumbs-up" size={14} />}
                      onClick={() =>
                        audit({
                          actor: "Officer J. Brand",
                          action: "Marked draft helpful (feedback)",
                        })
                      }
                      aria-label="Mark helpful"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      leadingIcon={<Icon name="thumbs-down" size={14} />}
                      onClick={() =>
                        audit({
                          actor: "Officer J. Brand",
                          action: "Marked draft unhelpful (feedback)",
                        })
                      }
                      aria-label="Mark unhelpful"
                    />
                  </>
                }
              >
                {draft.text}
              </AIResponseCard>

              <Section title="Sources" count={CITATIONS.length}>
                <CitationSources citations={CITATIONS} />
              </Section>
            </>
          )}
        </div>

        {/* Right column — controls */}
        <aside style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <SourceSelector
            sources={SOURCES}
            selectedIds={selectedSources}
            onToggle={toggleSource}
          />

          <Section title="Output controls">
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label
                style={{
                  display: "flex",
                  gap: 6,
                  alignItems: "center",
                  fontSize: "var(--font-size-sm)",
                }}
              >
                <input type="checkbox" defaultChecked /> Third-person voice
              </label>
              <label
                style={{
                  display: "flex",
                  gap: 6,
                  alignItems: "center",
                  fontSize: "var(--font-size-sm)",
                }}
              >
                <input type="checkbox" defaultChecked /> Redact victim PII
              </label>
              <label
                style={{
                  display: "flex",
                  gap: 6,
                  alignItems: "center",
                  fontSize: "var(--font-size-sm)",
                }}
              >
                <input type="checkbox" /> Include speculative leads
              </label>
            </div>
            <div
              style={{
                marginTop: 10,
                fontSize: "var(--font-size-xs)",
                color: "var(--aisp-text-muted)",
              }}
            >
              Trust: <ConfidenceBadge level="medium" />
            </div>
          </Section>

          <AuditTrail entries={auditEntries} />
        </aside>
      </div>
    </Workspace>
  );
}

export default NarrativeDraftUseCase;
