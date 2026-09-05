# Database Integration (MCP federation)

A demo of agentic federated query across multiple law-enforcement
databases via an MCP gateway.

## What this use case shows

Officers routinely need to combine information from multiple systems —
TPS RMS, MTO, CPIC, the Ontario Court of Justice, Victim Services, ICES
(health flag), and Intel — to answer a single question. Doing this by
hand means logging into 5+ consoles. This use case shows a single
prompt that:

1. is decomposed by the agent into a multi-step plan,
2. is run as typed tool calls against each MCP-fronted database,
3. produces a combined view with per-row provenance, and
4. is synthesised into a single grounded answer for the officer.

The plan is shown **before** anything runs — the officer can see exactly
which systems will be touched and why.

## Federated MCP servers

| Server | Upstream | Purpose |
| --- | --- | --- |
| `tps-records-mcp` | RMS | Persons + occurrences |
| `mto-bridge-mcp` | MTO | Vehicles + drivers |
| `cpic-mcp` | CPIC | National alerts / warrants |
| `court-records-mcp` | OCJ | Scheduling |
| `victim-services-mcp` | VST | File-existence + status only |
| `ices-flag-mcp` | ICES | Mental-health flag boolean |
| `intel-mcp` | TPS Intel | Intel reports (restricted) |

## Backend interaction

| Service | Used for |
| --- | --- |
| `inference.complete({ useCaseId: "database-integration" })` | Plan + final synthesis |
| `relational.query({ table })` | One call per plan step (the table name is what the MCP gateway routes to) |

## Hygiene

- DisclaimerBar at the top.
- Plan is always visible before execution.
- Per-row source badges (e.g. `MTO`, `CPIC`) on every result row.
- HumanReviewBanner gates the synthesised answer.
- AuditTrail captures the prompt, the plan, every step's latency and
  row count, the synthesis, and the officer's accept / reject.

## Sample questions that have canned plans

- "What do we know about Daniel Reyes (DOB 1989-11-02)?"
- "Vehicle CFGB-481 — registered owner and any active alerts."
- "44 Charles St W, Apt 1208 — all known activity."
