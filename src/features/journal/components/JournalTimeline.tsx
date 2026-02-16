"use client";

import { useMemo, useState } from "react";
import type { JournalEntry, MoodCheckIn } from "@/core/storage/models";
import { isWithinRange, toDayKey } from "@/core/lib/date";

interface JournalTimelineProps {
  entries: JournalEntry[];
  moods: MoodCheckIn[];
  onDelete: (id: string) => Promise<void>;
  onEdit: (
    id: string,
    patch: Partial<{
      title: string;
      body: string;
      tags: string[];
    }>
  ) => Promise<void>;
}

export function JournalTimeline({ entries, moods, onDelete, onEdit }: JournalTimelineProps) {
  const [query, setQuery] = useState("");
  const [tagFilter, setTagFilter] = useState("");
  const [minMood, setMinMood] = useState("");
  const [maxMood, setMaxMood] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editBody, setEditBody] = useState("");
  const [editTitle, setEditTitle] = useState("");

  const moodById = useMemo(() => new Map(moods.map((item) => [item.id, item])), [moods]);
  const allTags = useMemo(
    () => Array.from(new Set(entries.flatMap((item) => item.tags))).slice(0, 20),
    [entries]
  );

  const filtered = useMemo(() => {
    return entries.filter((entry) => {
      if (
        query &&
        !`${entry.title} ${entry.body} ${entry.context.gratitude} ${entry.context.intention}`
          .toLowerCase()
          .includes(query.toLowerCase())
      ) {
        return false;
      }

      if (tagFilter && !entry.tags.includes(tagFilter)) return false;
      if (!isWithinRange(entry.createdAt, startDate || null, endDate || null)) return false;

      if (entry.moodLinkId && (minMood || maxMood)) {
        const linkedMood = moodById.get(entry.moodLinkId);
        if (!linkedMood) return false;
        if (minMood && linkedMood.valence < Number(minMood)) return false;
        if (maxMood && linkedMood.valence > Number(maxMood)) return false;
      }

      return true;
    });
  }, [endDate, entries, maxMood, minMood, moodById, query, startDate, tagFilter]);

  const groupedByDay = useMemo(() => {
    const grouped = new Map<string, JournalEntry[]>();
    for (const entry of filtered) {
      const key = toDayKey(entry.createdAt);
      const current = grouped.get(key) ?? [];
      current.push(entry);
      grouped.set(key, current);
    }
    return [...grouped.entries()].sort((a, b) => (a[0] > b[0] ? -1 : 1));
  }, [filtered]);

  async function handleSaveEdit(id: string) {
    await onEdit(id, {
      title: editTitle.trim(),
      body: editBody.trim(),
    });
    setEditingId(null);
  }

  return (
    <section className="space-y-4">
      <div className="rounded-2xl border border-[var(--surface-border)] bg-[var(--surface-glass)] p-4">
        <div className="grid gap-2 md:grid-cols-5">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search text"
            className="rounded-xl border border-[var(--surface-border)] bg-[var(--surface-glass-strong)] px-3 py-2 text-sm"
          />
          <select
            value={tagFilter}
            onChange={(event) => setTagFilter(event.target.value)}
            className="rounded-xl border border-[var(--surface-border)] bg-[var(--surface-glass-strong)] px-3 py-2 text-sm"
          >
            <option value="">All tags</option>
            {allTags.map((tag) => (
              <option key={tag} value={tag}>
                {tag}
              </option>
            ))}
          </select>
          <input
            type="date"
            value={startDate}
            onChange={(event) => setStartDate(event.target.value)}
            className="rounded-xl border border-[var(--surface-border)] bg-[var(--surface-glass-strong)] px-3 py-2 text-sm"
          />
          <input
            type="date"
            value={endDate}
            onChange={(event) => setEndDate(event.target.value)}
            className="rounded-xl border border-[var(--surface-border)] bg-[var(--surface-glass-strong)] px-3 py-2 text-sm"
          />
          <div className="flex gap-2">
            <input
              type="number"
              min={1}
              max={10}
              value={minMood}
              onChange={(event) => setMinMood(event.target.value)}
              placeholder="Mood min"
              className="w-full rounded-xl border border-[var(--surface-border)] bg-[var(--surface-glass-strong)] px-3 py-2 text-sm"
            />
            <input
              type="number"
              min={1}
              max={10}
              value={maxMood}
              onChange={(event) => setMaxMood(event.target.value)}
              placeholder="Mood max"
              className="w-full rounded-xl border border-[var(--surface-border)] bg-[var(--surface-glass-strong)] px-3 py-2 text-sm"
            />
          </div>
        </div>
      </div>

      {groupedByDay.length === 0 ? (
        <div className="rounded-2xl border border-[var(--surface-border)] bg-[var(--surface-glass)] p-4 text-sm text-[var(--text-muted)]">
          No entries match your filters yet.
        </div>
      ) : (
        groupedByDay.map(([day, dayEntries]) => (
          <div key={day} className="space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--text-soft)]">
              {new Date(day).toLocaleDateString()}
            </h3>
            {dayEntries.map((entry) => {
              const linkedMood = entry.moodLinkId ? moodById.get(entry.moodLinkId) : null;
              const isEditing = editingId === entry.id;
              return (
                <article
                  key={entry.id}
                  className="rounded-2xl border border-[var(--surface-border)] bg-[var(--surface-glass)] p-4"
                >
                  {isEditing ? (
                    <div className="space-y-2">
                      <input
                        value={editTitle}
                        onChange={(event) => setEditTitle(event.target.value)}
                        className="w-full rounded-xl border border-[var(--surface-border)] bg-[var(--surface-glass-strong)] px-3 py-2 text-sm"
                      />
                      <textarea
                        value={editBody}
                        onChange={(event) => setEditBody(event.target.value)}
                        className="min-h-24 w-full rounded-xl border border-[var(--surface-border)] bg-[var(--surface-glass-strong)] px-3 py-2 text-sm"
                      />
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <h4 className="text-base font-semibold text-[var(--text-primary)]">
                        {entry.title || "Untitled entry"}
                      </h4>
                      <p className="whitespace-pre-wrap text-sm text-[var(--text-muted)]">{entry.body}</p>
                    </div>
                  )}
                  <div className="mt-3 flex flex-wrap gap-2 text-xs">
                    {entry.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-[12px] bg-[var(--interactive-active)] px-2 py-1 text-[var(--text-muted)]"
                      >
                        #{tag}
                      </span>
                    ))}
                    {linkedMood ? (
                      <span className="rounded-[12px] bg-[var(--interactive-active)] px-2 py-1 text-[var(--text-muted)]">
                        mood {linkedMood.valence}/10 energy {linkedMood.energy}/10
                      </span>
                    ) : null}
                  </div>
                  <div className="mt-3 flex gap-2">
                    {isEditing ? (
                      <>
                        <button
                          type="button"
                          onClick={() => handleSaveEdit(entry.id)}
                          className="rounded-[12px] bg-[#5a4fff] px-3 py-1.5 text-xs font-medium text-white"
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingId(null)}
                          className="rounded-[12px] border border-[var(--surface-border)] px-3 py-1.5 text-xs"
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingId(entry.id);
                            setEditTitle(entry.title);
                            setEditBody(entry.body);
                          }}
                          className="rounded-[12px] border border-[var(--surface-border)] px-3 py-1.5 text-xs"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => onDelete(entry.id)}
                          className="rounded-[12px] border border-rose-300 px-3 py-1.5 text-xs text-rose-600"
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        ))
      )}
    </section>
  );
}
