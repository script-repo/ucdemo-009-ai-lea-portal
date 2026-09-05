# UC7 — Policy & Legal Reference Chatbot

Pure RAG over TPS procedures, the Criminal Code, the Charter, and
Ontario statutes. Every answer cites the authoritative section.
Read-only — never writes to a record.

## Backend calls

| Call | Source service | Fixture in sim mode |
|---|---|---|
| `backend.vector.query({ collection: "policy" })` | Vector DB | `POLICY_SNIPPETS` keyword bag |
| `backend.inference.complete({ useCaseId: "policy-chatbot", … })` | LLM | `POLICY_ANSWERS` |

## Pivot to real

1. Index the live policy corpus (TPS Records Management, Justice
   Canada CCC, Ontario e-Laws) into the `policy` vector collection.
2. The LLM endpoint must accept the `context` array as RAG passages
   and return citations as indices into that array.
3. Add an admin-side workflow to refresh the index on policy
   amendments — the use case picks up updates on the next query.
