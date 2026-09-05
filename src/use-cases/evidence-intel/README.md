# UC2 — Ask Your Case File

Plain-English Q&A over a single case's mixed-media evidence. Vector
retrieval surfaces candidate exhibits; the LLM drafts a grounded
answer with citations back into the exhibit list. Chain of custody
appears inline whenever an exhibit is opened.

## Backend calls

| Call | Source service | Fixture in sim mode |
|---|---|---|
| `backend.vector.query({ collection: "evidence:TPS-26-417" })` | Vector DB | `EVIDENCE_ITEMS` keyword bag |
| `backend.inference.complete({ useCaseId: "evidence-intel", … })` | LLM | `CANNED_EVIDENCE_ANSWERS` |

## Pivot to real

1. Index the case-file corpus into a real vector store (pgvector /
   Milvus). The collection name `evidence:<caseId>` is the contract.
2. Have the LLM endpoint accept the `context` array as RAG passages
   and return citations as indices into that array.
3. Have the object-storage client serve presigned URLs for the
   exhibit blobs (the UI already calls `presign` on click in this
   pattern).
4. Flip the Infrastructure toggle.
