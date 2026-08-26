"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

type Preference = {
  id: string;
  category: string;
  key: string;
  value: string;
  confidence: number;
};

const CATEGORY_ICONS: Record<string, string> = {
  Health: "🏥",
  Finance: "💰",
  Groceries: "🛒",
};

export default function PreferencesPage() {
  const [prefs, setPrefs] = useState<Preference[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  const fetchPrefs = () => {
    fetch("/api/preferences")
      .then((r) => r.json())
      .then((data) => {
        if (data.preferences) setPrefs(data.preferences);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchPrefs();
  }, []);

  const handleSave = async (id: string) => {
    await fetch("/api/preferences", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, value: editValue }),
    });
    setEditingId(null);
    fetchPrefs();
  };

  const handleDelete = async (id: string) => {
    await fetch("/api/preferences", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    fetchPrefs();
  };

  // Group by category
  const categories = Array.from(new Set(prefs.map((p) => p.category)));

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b bg-white">
        <div className="mx-auto max-w-5xl px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-sm text-gray-600 hover:text-black">
              ← Dashboard
            </Link>
            <h1 className="text-xl font-semibold">Preferences</h1>
          </div>
        </div>
        <div className="border-t bg-gray-50">
          <div className="mx-auto max-w-5xl px-4 py-2 flex gap-4 text-sm">
            <Link href="/dashboard" className="text-gray-600 hover:text-black">Dashboard</Link>
            <Link href="/secretary" className="text-gray-600 hover:text-black">Secretary</Link>
            <Link href="/preferences" className="font-medium text-black">Preferences</Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6 pb-12 space-y-6">
        <p className="text-sm text-gray-500">
          LifeOS learns your preferences over time. Edit any preference to correct what it has learned.
          Confidence increases as LifeOS observes consistent choices.
        </p>

        {loading ? (
          <p className="text-sm text-gray-500">Loading...</p>
        ) : (
          categories.map((cat) => (
            <section key={cat} className="rounded-lg border border-gray-200 bg-white p-4">
              <h2 className="text-lg font-medium">
                {CATEGORY_ICONS[cat] ?? "📋"} {cat}
              </h2>
              <ul className="mt-4 space-y-3">
                {prefs
                  .filter((p) => p.category === cat)
                  .map((p) => (
                    <li key={p.id} className="border-b pb-3 last:border-0">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="text-sm font-medium text-gray-700">{p.key}</div>
                          {editingId === p.id ? (
                            <div className="mt-1 flex gap-2">
                              <input
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                className="flex-1 rounded border border-gray-300 px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-black"
                                autoFocus
                              />
                              <button
                                onClick={() => handleSave(p.id)}
                                className="rounded bg-black px-3 py-1 text-xs text-white hover:bg-gray-800"
                              >
                                Save
                              </button>
                              <button
                                onClick={() => setEditingId(null)}
                                className="rounded border border-gray-300 px-3 py-1 text-xs hover:bg-gray-100"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <div className="mt-0.5 text-sm text-gray-900">{p.value}</div>
                          )}
                        </div>
                        {editingId !== p.id && (
                          <div className="flex items-center gap-3">
                            <div className="text-right">
                              <div className="text-xs text-gray-500">
                                {Math.round(p.confidence * 100)}% confidence
                              </div>
                              <div className="mt-1 h-1.5 w-20 rounded-full bg-gray-100">
                                <div
                                  className="h-1.5 rounded-full bg-black"
                                  style={{ width: `${p.confidence * 100}%` }}
                                />
                              </div>
                            </div>
                            <button
                              onClick={() => {
                                setEditingId(p.id);
                                setEditValue(p.value);
                              }}
                              className="text-xs text-gray-600 hover:text-black"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(p.id)}
                              className="text-xs text-red-600 hover:text-red-800"
                            >
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </li>
                  ))}
              </ul>
            </section>
          ))
        )}
      </main>
    </div>
  );
}
