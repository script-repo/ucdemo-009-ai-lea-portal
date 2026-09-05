/**
 * Simulated relational store.
 *
 * Tables:
 *   - calls911       : 911 transcript metadata (UC8)
 *   - evidence_items : evidence rows (UC2)
 *   - bodycam_clips  : body-cam metadata (UC1)
 *   - policy_index   : policy snippets (UC7)
 *
 * Supports column equality filters, free-text search, sort, paging.
 */

import { simulateLatency } from "../latency";
import type {
  RelationalClient,
  RelationalQueryRequest,
  RelationalQueryResult,
  ServiceResponse,
} from "../types";

import { CALLS_911 } from "../fixtures/calls911";
import { EVIDENCE_ITEMS } from "../fixtures/evidence";
import { BODY_CAM_CLIPS } from "../fixtures/bodyCam";
import { POLICY_SNIPPETS } from "../fixtures/policies";
import {
  TPS_PERSONS,
  TPS_OCCURRENCES,
  MTO_VEHICLES,
  MTO_DRIVERS,
  CPIC_SUBJECTS,
  COURT_PROCEEDINGS,
  VICTIM_SERVICES_FILES,
  ICES_FLAGS,
  INTEL_SUBJECTS,
} from "../fixtures/mcpFederation";

const TABLES: Record<string, Record<string, unknown>[]> = {
  calls911: CALLS_911 as unknown as Record<string, unknown>[],
  evidence_items: EVIDENCE_ITEMS as unknown as Record<string, unknown>[],
  bodycam_clips: BODY_CAM_CLIPS.map((c) => ({
    id: c.id,
    storageKey: c.storageKey,
    durationMs: c.durationMs,
    capturedAt: c.capturedAt,
    officer: c.officer,
    unit: c.unit,
    location: c.location,
    scenario: c.scenario,
  })),
  policy_index: POLICY_SNIPPETS as unknown as Record<string, unknown>[],

  // Federated tables — each is "owned" by a different MCP-backed
  // upstream system. The `where` clauses understood below extend the
  // basic equality match with a few synthetic predicates the canned
  // plans rely on (`contains_person`, `last_known_address_contains`,
  // `location_contains`).
  tps_persons: TPS_PERSONS as unknown as Record<string, unknown>[],
  tps_occurrences: TPS_OCCURRENCES as unknown as Record<string, unknown>[],
  mto_vehicles: MTO_VEHICLES as unknown as Record<string, unknown>[],
  mto_drivers: MTO_DRIVERS as unknown as Record<string, unknown>[],
  cpic_subjects: CPIC_SUBJECTS as unknown as Record<string, unknown>[],
  court_proceedings: COURT_PROCEEDINGS as unknown as Record<string, unknown>[],
  victim_services_files: VICTIM_SERVICES_FILES as unknown as Record<string, unknown>[],
  ices_flags: ICES_FLAGS as unknown as Record<string, unknown>[],
  intel_subjects: INTEL_SUBJECTS as unknown as Record<string, unknown>[],
};

/**
 * Synthetic predicates the federation plans rely on — implemented in the
 * simulated client so the use case never needs to know the difference.
 */
function applySyntheticPredicates(
  rows: Record<string, unknown>[],
  where: Record<string, unknown>,
): { rows: Record<string, unknown>[]; consumed: string[] } {
  const consumed: string[] = [];
  let out = rows;
  if (typeof where["contains_person"] === "string") {
    const personId = where["contains_person"] as string;
    out = out.filter((r) => {
      const pids = r["person_ids"];
      return Array.isArray(pids) && pids.includes(personId);
    });
    consumed.push("contains_person");
  }
  if (typeof where["last_known_address_contains"] === "string") {
    const needle = (where["last_known_address_contains"] as string).toLowerCase();
    out = out.filter((r) => {
      const v = r["last_known_address"];
      return typeof v === "string" && v.toLowerCase().includes(needle);
    });
    consumed.push("last_known_address_contains");
  }
  if (typeof where["location_contains"] === "string") {
    const needle = (where["location_contains"] as string).toLowerCase();
    out = out.filter((r) => {
      const v = r["location"];
      return typeof v === "string" && v.toLowerCase().includes(needle);
    });
    consumed.push("location_contains");
  }
  return { rows: out, consumed };
}

function applyFilter(rows: Record<string, unknown>[], where: Record<string, unknown>) {
  return rows.filter((r) => Object.entries(where).every(([k, v]) => r[k] === v));
}

function applySearch(rows: Record<string, unknown>[], search: string) {
  const needle = search.toLowerCase();
  return rows.filter((r) =>
    Object.values(r).some((v) => typeof v === "string" && v.toLowerCase().includes(needle)),
  );
}

function applySort(rows: Record<string, unknown>[], orderBy: string[]) {
  const sorters = orderBy.map((spec) => {
    const [col, dir] = spec.split(":");
    return { col: col!, dir: dir === "desc" ? -1 : 1 };
  });
  return [...rows].sort((a, b) => {
    for (const { col, dir } of sorters) {
      const av = a[col];
      const bv = b[col];
      if (av === bv) continue;
      if (av == null) return -1 * dir;
      if (bv == null) return 1 * dir;
      return (av < bv ? -1 : 1) * dir;
    }
    return 0;
  });
}

export const simulatedRelational: RelationalClient = {
  async query<T = Record<string, unknown>>(
    req: RelationalQueryRequest,
  ): Promise<ServiceResponse<RelationalQueryResult<T>>> {
    const latency = await simulateLatency("fast");
    const base = TABLES[req.table];
    if (!base) {
      return {
        data: { rows: [], total: 0, table: req.table },
        provenance: {
          mode: "simulated",
          service: "relational",
          source: `fixture: <unknown table ${req.table}>`,
          latencyMs: latency,
        },
      };
    }
    let rows = [...base];
    let where = req.where ? { ...req.where } : undefined;
    if (where) {
      const { rows: filtered, consumed } = applySyntheticPredicates(rows, where);
      rows = filtered;
      for (const k of consumed) delete where[k];
      if (Object.keys(where).length > 0) rows = applyFilter(rows, where);
    }
    if (req.search) rows = applySearch(rows, req.search);
    const total = rows.length;
    if (req.orderBy) rows = applySort(rows, req.orderBy);
    if (req.offset) rows = rows.slice(req.offset);
    if (req.limit) rows = rows.slice(0, req.limit);
    return {
      data: { rows: rows as T[], total, table: req.table },
      provenance: {
        mode: "simulated",
        service: "relational",
        source: `fixture: ${req.table}`,
        latencyMs: latency,
      },
    };
  },

  async listTables() {
    const latency = await simulateLatency("instant");
    return {
      data: { tables: Object.keys(TABLES) },
      provenance: {
        mode: "simulated",
        service: "relational",
        source: "fixture: meta",
        latencyMs: latency,
      },
    };
  },
};
