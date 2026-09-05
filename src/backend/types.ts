/**
 * Shared types for every AISP backend service.
 *
 * These are the contracts the UI binds to. Both the simulated and the
 * real implementations of every service must satisfy these shapes —
 * which is what lets a use case flip from sim → real without touching
 * a single line of UI code.
 */

// ──────────────────────────────────────────────────────────────────────
// Common
// ──────────────────────────────────────────────────────────────────────

export type BackendMode = "simulated" | "real";

/** Where this response came from. Useful for showing a "(simulated)" tag. */
export type ProvenanceTag = {
  mode: BackendMode;
  service: BackendServiceName;
  /** Free-form note ("nutanix-nai/llama-3.1-70b" or "fixture: bodycam-clip-04"). */
  source: string;
  /** Wall-clock ms the call took. */
  latencyMs: number;
};

export type BackendServiceName =
  | "inference"
  | "vector"
  | "relational"
  | "objectStorage"
  | "virtualization"
  | "kubernetes";

export interface ServiceResponse<T> {
  data: T;
  provenance: ProvenanceTag;
}

// ──────────────────────────────────────────────────────────────────────
// 1. Inference (LLM completion, embedding, ASR, translation, vision)
// ──────────────────────────────────────────────────────────────────────

export interface CompletionRequest {
  /** Free-form user prompt. */
  prompt: string;
  /** Optional system prompt to steer behaviour. */
  system?: string;
  /** Optional grounded context (RAG passages). */
  context?: GroundedPassage[];
  /** Maximum new tokens. */
  maxTokens?: number;
  /** Use case identifier for fixture routing in simulated mode. */
  useCaseId?: string;
  /** Streaming callback invoked with successive partial chunks. */
  onChunk?: (chunk: string) => void;
}

export interface GroundedPassage {
  id: string;
  title: string;
  snippet: string;
  meta?: string;
}

export interface CompletionResult {
  text: string;
  /** Citation indices that map into the request's `context` array. */
  citations: number[];
  /** Categorical confidence — never expose raw scores in the UI. */
  confidence: "high" | "medium" | "low";
  /** Tokens consumed (estimated in simulated mode). */
  tokensUsed: number;
  model: string;
}

export interface EmbeddingRequest {
  inputs: string[];
  useCaseId?: string;
}

export interface EmbeddingResult {
  /** Each embedding is a fixed-length vector. */
  vectors: number[][];
  model: string;
  dim: number;
}

export interface TranscriptionRequest {
  /** Object-storage key OR a base64-encoded audio blob. */
  audioRef: string;
  /** Hint for diarization. */
  speakers?: number;
  language?: string;
  useCaseId?: string;
}

export interface TranscriptSegment {
  startMs: number;
  endMs: number;
  speaker: string;
  text: string;
  /** Optional source language detected for this segment. */
  language?: string;
  /** Optional inline translation (English target). */
  translation?: string;
  /** Optional confidence at the word level — categorical. */
  confidence?: "high" | "medium" | "low";
}

export interface TranscriptionResult {
  segments: TranscriptSegment[];
  durationMs: number;
  detectedLanguages: string[];
  model: string;
}

export interface VisionRedactionRequest {
  /** Object-storage key for the source video / image. */
  sourceRef: string;
  categories: VisionRedactionCategory[];
  useCaseId?: string;
}

export type VisionRedactionCategory =
  | "FACE"
  | "LICENSE_PLATE"
  | "TATTOO"
  | "SCREEN_TEXT"
  | "DOCUMENT_TEXT";

export interface VisionRedactionDetection {
  /** Frame timestamp in ms. */
  frameMs: number;
  category: VisionRedactionCategory;
  /** Normalized bounding box (0..1). */
  bbox: { x: number; y: number; w: number; h: number };
  confidence: "high" | "medium" | "low";
}

export interface VisionRedactionResult {
  detections: VisionRedactionDetection[];
  outputRef: string;
  durationMs: number;
  model: string;
}

export interface InferenceClient {
  complete(req: CompletionRequest): Promise<ServiceResponse<CompletionResult>>;
  embed(req: EmbeddingRequest): Promise<ServiceResponse<EmbeddingResult>>;
  transcribe(req: TranscriptionRequest): Promise<ServiceResponse<TranscriptionResult>>;
  redactVideo(req: VisionRedactionRequest): Promise<ServiceResponse<VisionRedactionResult>>;
}

// ──────────────────────────────────────────────────────────────────────
// 2. Vector database
// ──────────────────────────────────────────────────────────────────────

export interface VectorRecord {
  id: string;
  /** The embedding itself. */
  vector: number[];
  /** Source-document identifier (object-storage key or relational row id). */
  docId: string;
  /** Free-form metadata used by the UI for citations. */
  meta: {
    title: string;
    snippet: string;
    [k: string]: string | number | boolean | undefined;
  };
}

export interface VectorQueryRequest {
  collection: string;
  /** Either a raw query string (the backend embeds it) or a pre-computed vector. */
  query: string | number[];
  topK?: number;
  /** Optional metadata filters: `{ caseId: "26-0042" }`. */
  filter?: Record<string, string | number | boolean>;
}

export interface VectorMatch {
  id: string;
  /** 0..1 cosine similarity. */
  score: number;
  meta: VectorRecord["meta"];
  docId: string;
}

export interface VectorQueryResult {
  matches: VectorMatch[];
  collection: string;
}

export interface VectorClient {
  query(req: VectorQueryRequest): Promise<ServiceResponse<VectorQueryResult>>;
  listCollections(): Promise<ServiceResponse<{ collections: string[] }>>;
}

// ──────────────────────────────────────────────────────────────────────
// 3. Relational database
// ──────────────────────────────────────────────────────────────────────

export interface RelationalQueryRequest {
  /** Logical table name — never raw SQL across the wire. */
  table: string;
  /** Column-equality filters. */
  where?: Record<string, string | number | boolean>;
  /** Free-text search across configured text columns. */
  search?: string;
  /** Sort spec: `["createdAt:desc"]`. */
  orderBy?: string[];
  limit?: number;
  offset?: number;
}

export interface RelationalQueryResult<T = Record<string, unknown>> {
  rows: T[];
  total: number;
  table: string;
}

export interface RelationalClient {
  query<T = Record<string, unknown>>(
    req: RelationalQueryRequest,
  ): Promise<ServiceResponse<RelationalQueryResult<T>>>;
  listTables(): Promise<ServiceResponse<{ tables: string[] }>>;
}

// ──────────────────────────────────────────────────────────────────────
// 4. Object storage (videos, audio, documents)
// ──────────────────────────────────────────────────────────────────────

export interface ObjectMeta {
  key: string;
  bucket: string;
  contentType: string;
  sizeBytes: number;
  createdAt: string;
  /** Sha-256 hash for chain-of-custody verification. */
  sha256: string;
  meta?: Record<string, string>;
}

export interface ListObjectsRequest {
  bucket: string;
  prefix?: string;
  limit?: number;
}

export interface GetObjectRequest {
  bucket: string;
  key: string;
}

export interface ObjectStorageClient {
  list(req: ListObjectsRequest): Promise<ServiceResponse<{ objects: ObjectMeta[] }>>;
  head(req: GetObjectRequest): Promise<ServiceResponse<ObjectMeta>>;
  /** Returns a (potentially time-limited) URL to fetch the object. */
  presign(req: GetObjectRequest): Promise<ServiceResponse<{ url: string; expiresAt: string }>>;
}

// ──────────────────────────────────────────────────────────────────────
// 5. Virtualization (KVM / AHV)
// ──────────────────────────────────────────────────────────────────────

export interface VirtualMachine {
  id: string;
  name: string;
  state: "running" | "stopped" | "paused" | "error";
  vcpu: number;
  memMiB: number;
  ipv4?: string;
  cluster: string;
  /** Owning use case (purpose label). */
  purpose?: string;
}

export interface VirtualizationClient {
  list(): Promise<ServiceResponse<{ vms: VirtualMachine[] }>>;
  status(id: string): Promise<ServiceResponse<VirtualMachine>>;
}

// ──────────────────────────────────────────────────────────────────────
// 6. Kubernetes (workloads)
// ──────────────────────────────────────────────────────────────────────

export interface K8sWorkload {
  namespace: string;
  name: string;
  kind: "Deployment" | "StatefulSet" | "Job" | "CronJob";
  ready: number;
  desired: number;
  /** Most recent pod image. */
  image: string;
  /** Use case this workload backs, if any. */
  useCaseId?: string;
}

export interface KubernetesClient {
  listWorkloads(namespace?: string): Promise<ServiceResponse<{ workloads: K8sWorkload[] }>>;
  listNamespaces(): Promise<ServiceResponse<{ namespaces: string[] }>>;
}

// ──────────────────────────────────────────────────────────────────────
// Aggregate
// ──────────────────────────────────────────────────────────────────────

export interface BackendClient {
  mode: BackendMode;
  inference: InferenceClient;
  vector: VectorClient;
  relational: RelationalClient;
  objectStorage: ObjectStorageClient;
  virtualization: VirtualizationClient;
  kubernetes: KubernetesClient;
}
