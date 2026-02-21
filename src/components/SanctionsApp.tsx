"use client";

import { useState, useMemo } from "react";
import type {
  SanctionEntry,
  ChangelogEntry,
  Meta,
} from "@/lib/data";

type Tab = "list" | "changes" | "search";

interface Props {
  entries: SanctionEntry[];
  changelog: ChangelogEntry[];
  meta: Meta | null;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatDate(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleString("pl-PL", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

function getDisplayColumns(entries: SanctionEntry[]): string[] {
  if (entries.length === 0) return [];
  const allKeys = new Set<string>();
  entries.forEach((e) => {
    Object.keys(e).forEach((k) => {
      if (k !== "_id") allKeys.add(k);
    });
  });
  return Array.from(allKeys);
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function StatusBar({ meta, entryCount }: { meta: Meta | null; entryCount: number }) {
  return (
    <div className="flex flex-wrap gap-4 text-sm text-slate-400 mb-6">
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-green-500 inline-block animate-pulse" />
        <span>
          Ostatnie sprawdzenie:{" "}
          {meta?.last_checked ? formatDate(meta.last_checked) : "—"}
        </span>
      </div>
      <div>
        Ostatnia zmiana:{" "}
        {meta?.last_changed ? formatDate(meta.last_changed) : "—"}
      </div>
      <div>Wpisów na liście: <strong className="text-slate-200">{entryCount}</strong></div>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
  count,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  count?: number;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
        active
          ? "bg-blue-600 text-white shadow-lg shadow-blue-600/25"
          : "bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200"
      }`}
    >
      {children}
      {count !== undefined && (
        <span
          className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
            active ? "bg-blue-500" : "bg-slate-700"
          }`}
        >
          {count}
        </span>
      )}
    </button>
  );
}

// ---------------------------------------------------------------------------
// Sanctions List Tab
// ---------------------------------------------------------------------------

function SanctionsList({ entries }: { entries: SanctionEntry[] }) {
  const columns = useMemo(() => getDisplayColumns(entries), [entries]);
  const [page, setPage] = useState(0);
  const perPage = 50;
  const totalPages = Math.ceil(entries.length / perPage);
  const pageEntries = entries.slice(page * perPage, (page + 1) * perPage);

  if (entries.length === 0) {
    return (
      <div className="text-center py-20 text-slate-500">
        <p className="text-4xl mb-4">📋</p>
        <p>Brak danych. Uruchom skrypt monitorujący, aby pobrać pierwszą wersję listy.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="overflow-x-auto rounded-lg border border-slate-700/50">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-700/50">
              <th className="text-left px-4 py-3 text-slate-400 font-medium text-xs uppercase tracking-wider">
                #
              </th>
              {columns.map((col) => (
                <th
                  key={col}
                  className="text-left px-4 py-3 text-slate-400 font-medium text-xs uppercase tracking-wider whitespace-nowrap"
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pageEntries.map((entry, i) => (
              <tr
                key={entry._id || i}
                className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors"
              >
                <td className="px-4 py-3 text-slate-500 tabular-nums">
                  {page * perPage + i + 1}
                </td>
                {columns.map((col) => (
                  <td key={col} className="px-4 py-3 max-w-xs truncate" title={entry[col] || ""}>
                    {entry[col] || ""}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <span className="text-sm text-slate-500">
            Strona {page + 1} z {totalPages} ({entries.length} wpisów)
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(Math.max(0, page - 1))}
              disabled={page === 0}
              className="px-3 py-1.5 rounded bg-slate-800 text-slate-300 text-sm disabled:opacity-30 hover:bg-slate-700 transition"
            >
              ← Poprzednia
            </button>
            <button
              onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
              disabled={page >= totalPages - 1}
              className="px-3 py-1.5 rounded bg-slate-800 text-slate-300 text-sm disabled:opacity-30 hover:bg-slate-700 transition"
            >
              Następna →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Changelog Tab
// ---------------------------------------------------------------------------

function ChangelogView({ changelog }: { changelog: ChangelogEntry[] }) {
  const [expanded, setExpanded] = useState<number | null>(null);

  if (changelog.length === 0) {
    return (
      <div className="text-center py-20 text-slate-500">
        <p className="text-4xl mb-4">📜</p>
        <p>Brak historii zmian. Pojawi się po wykryciu pierwszych zmian.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {changelog.map((entry, idx) => {
        const isExpanded = expanded === idx;
        const hasChanges =
          entry.added_count > 0 ||
          entry.removed_count > 0 ||
          entry.modified_count > 0;

        return (
          <div
            key={idx}
            className="border border-slate-700/50 rounded-lg overflow-hidden"
          >
            <button
              onClick={() => setExpanded(isExpanded ? null : idx)}
              className="w-full flex items-center justify-between px-5 py-4 hover:bg-slate-800/30 transition-colors text-left"
            >
              <div className="flex items-center gap-4">
                <span className="text-slate-400 text-sm tabular-nums">
                  {formatDate(entry.timestamp)}
                </span>
                <div className="flex gap-3">
                  {entry.added_count > 0 && (
                    <span className="text-green-400 text-sm font-medium">
                      +{entry.added_count} dodanych
                    </span>
                  )}
                  {entry.removed_count > 0 && (
                    <span className="text-red-400 text-sm font-medium">
                      -{entry.removed_count} usuniętych
                    </span>
                  )}
                  {entry.modified_count > 0 && (
                    <span className="text-amber-400 text-sm font-medium">
                      ~{entry.modified_count} zmienionych
                    </span>
                  )}
                </div>
              </div>
              <span className="text-slate-500 text-lg">
                {isExpanded ? "▾" : "▸"}
              </span>
            </button>

            {isExpanded && hasChanges && (
              <div className="px-5 pb-5 space-y-4">
                {entry.added.length > 0 && (
                  <div>
                    <h4 className="text-green-400 font-medium text-sm mb-2 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                      Dodane wpisy
                    </h4>
                    <div className="space-y-2">
                      {entry.added.map((item, j) => (
                        <div
                          key={j}
                          className="bg-green-950/20 border border-green-900/30 rounded-md px-4 py-3 text-sm"
                        >
                          <div className="font-medium text-green-300 mb-1">
                            {item._id}
                          </div>
                          {Object.entries(item)
                            .filter(([k, v]) => k !== "_id" && v)
                            .map(([k, v]) => (
                              <div key={k} className="text-slate-400">
                                <span className="text-slate-500">{k}:</span> {v}
                              </div>
                            ))}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {entry.removed.length > 0 && (
                  <div>
                    <h4 className="text-red-400 font-medium text-sm mb-2 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                      Usunięte wpisy
                    </h4>
                    <div className="space-y-2">
                      {entry.removed.map((item, j) => (
                        <div
                          key={j}
                          className="bg-red-950/20 border border-red-900/30 rounded-md px-4 py-3 text-sm"
                        >
                          <div className="font-medium text-red-300 mb-1">
                            {item._id}
                          </div>
                          {Object.entries(item)
                            .filter(([k, v]) => k !== "_id" && v)
                            .map(([k, v]) => (
                              <div key={k} className="text-slate-400">
                                <span className="text-slate-500">{k}:</span> {v}
                              </div>
                            ))}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {entry.modified.length > 0 && (
                  <div>
                    <h4 className="text-amber-400 font-medium text-sm mb-2 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                      Zmodyfikowane wpisy
                    </h4>
                    <div className="space-y-2">
                      {entry.modified.map((item, j) => (
                        <div
                          key={j}
                          className="bg-amber-950/20 border border-amber-900/30 rounded-md px-4 py-3 text-sm"
                        >
                          <div className="font-medium text-amber-300 mb-2">
                            {item._id}
                          </div>
                          {Object.entries(item.changes).map(([field, change]) => (
                            <div key={field} className="text-slate-400 mb-1">
                              <span className="text-slate-500">{field}:</span>{" "}
                              <span className="line-through text-red-400/70">
                                {change.old || "(puste)"}
                              </span>{" "}
                              →{" "}
                              <span className="text-green-400">
                                {change.new || "(puste)"}
                              </span>
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Search Tab
// ---------------------------------------------------------------------------

function SearchView({ entries }: { entries: SanctionEntry[] }) {
  const [query, setQuery] = useState("");
  const columns = useMemo(() => getDisplayColumns(entries), [entries]);

  const results = useMemo(() => {
    if (!query.trim() || query.trim().length < 2) return [];
    const q = query.toLowerCase().trim();
    return entries.filter((entry) =>
      Object.values(entry).some(
        (val) => typeof val === "string" && val.toLowerCase().includes(q)
      )
    );
  }, [query, entries]);

  return (
    <div>
      <div className="relative mb-6">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Szukaj po nazwie, imieniu, nazwisku, NIP, KRS..."
          className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl px-5 py-4 text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition text-base"
        />
        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500">
          {query.trim().length >= 2 && (
            <span className="text-sm">
              {results.length}{" "}
              {results.length === 1
                ? "wynik"
                : results.length < 5
                ? "wyniki"
                : "wyników"}
            </span>
          )}
        </div>
      </div>

      {query.trim().length > 0 && query.trim().length < 2 && (
        <p className="text-slate-500 text-center py-8">
          Wpisz co najmniej 2 znaki...
        </p>
      )}

      {query.trim().length >= 2 && results.length === 0 && (
        <div className="text-center py-16 text-slate-500">
          <p className="text-4xl mb-4">🔍</p>
          <p>
            Brak wyników dla &ldquo;<span className="text-slate-300">{query}</span>&rdquo;
          </p>
        </div>
      )}

      {results.length > 0 && (
        <div className="space-y-3">
          {results.slice(0, 100).map((entry, i) => (
            <div
              key={entry._id || i}
              className="border border-slate-700/50 rounded-lg px-5 py-4 hover:bg-slate-800/30 transition-colors"
            >
              <div className="font-medium text-slate-200 mb-2">
                {entry._id}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
                {columns
                  .filter((col) => entry[col])
                  .map((col) => {
                    const val = entry[col] || "";
                    const q = query.toLowerCase();
                    const isMatch = val.toLowerCase().includes(q);
                    return (
                      <div key={col} className="text-sm">
                        <span className="text-slate-500">{col}: </span>
                        <span
                          className={
                            isMatch ? "text-blue-300 font-medium" : "text-slate-400"
                          }
                        >
                          {val}
                        </span>
                      </div>
                    );
                  })}
              </div>
            </div>
          ))}
          {results.length > 100 && (
            <p className="text-center text-slate-500 text-sm py-4">
              Pokazano 100 z {results.length} wyników. Zawęź wyszukiwanie.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main App
// ---------------------------------------------------------------------------

export default function SanctionsApp({ entries, changelog, meta }: Props) {
  const [tab, setTab] = useState<Tab>("list");

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <header className="mb-8">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-100 mb-2">
              Monitor Listy Sankcyjnej
            </h1>
            <p className="text-slate-400 text-sm">
              Automatyczne śledzenie zmian na{" "}
              <a
                href="https://www.gov.pl/web/mswia/lista-osob-i-podmiotow-objetych-sankcjami"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 underline underline-offset-2"
              >
                liście MSWiA
              </a>{" "}
              · Sprawdzane 4× dziennie
            </p>
          </div>
          <a
            href="https://www.gov.pl/web/mswia/lista-osob-i-podmiotow-objetych-sankcjami"
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 px-4 py-2 rounded-lg bg-slate-800 text-slate-300 text-sm hover:bg-slate-700 transition border border-slate-700/50"
          >
            Źródło: gov.pl ↗
          </a>
        </div>

        <StatusBar meta={meta} entryCount={entries.length} />

        {/* Tabs */}
        <div className="flex gap-2 flex-wrap">
          <TabButton
            active={tab === "list"}
            onClick={() => setTab("list")}
            count={entries.length}
          >
            📋 Lista
          </TabButton>
          <TabButton
            active={tab === "changes"}
            onClick={() => setTab("changes")}
            count={changelog.length}
          >
            📜 Historia zmian
          </TabButton>
          <TabButton
            active={tab === "search"}
            onClick={() => setTab("search")}
          >
            🔍 Wyszukiwarka
          </TabButton>
        </div>
      </header>

      {/* Content */}
      <main>
        {tab === "list" && <SanctionsList entries={entries} />}
        {tab === "changes" && <ChangelogView changelog={changelog} />}
        {tab === "search" && <SearchView entries={entries} />}
      </main>

      {/* Footer */}
      <footer className="mt-12 pt-6 border-t border-slate-800 text-center text-xs text-slate-600">
        Dane pobierane automatycznie ze strony MSWiA. Narzędzie nieoficjalne.
        Zawsze weryfikuj z{" "}
        <a
          href="https://www.gov.pl/web/mswia/lista-osob-i-podmiotow-objetych-sankcjami"
          className="underline hover:text-slate-400"
          target="_blank"
          rel="noopener noreferrer"
        >
          oficjalnym źródłem
        </a>
        .
      </footer>
    </div>
  );
}
