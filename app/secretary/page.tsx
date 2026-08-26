"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

type SecretaryAction = {
  id: string;
  actionType: string;
  target: string;
  payload: string;
  status: string;
  createdAt: string;
  executedAt: string | null;
};

const ACTION_ICONS: Record<string, string> = {
  call: "📞",
  sms: "💬",
  order: "🛒",
  cancel: "❌",
  book: "📅",
};

const STATUS_STYLES: Record<string, string> = {
  completed: "text-green-600",
  pending: "text-yellow-600",
  failed: "text-red-600",
};

export default function SecretaryDashboardPage() {
  const [actions, setActions] = useState<SecretaryAction[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchActions = () => {
    fetch("/api/secretary/actions")
      .then((r) => r.json())
      .then((data) => {
        if (data.actions) setActions(data.actions);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchActions();
  }, []);

  const handleAction = async (id: string, approve: boolean) => {
    await fetch("/api/secretary/actions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, action: approve ? "approve" : "reject" }),
    });
    fetchActions();
  };

  const pending = actions.filter((a) => a.status === "pending");
  const history = actions.filter((a) => a.status !== "pending");

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b bg-white">
        <div className="mx-auto max-w-5xl px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-sm text-gray-600 hover:text-black">
              ← Dashboard
            </Link>
            <h1 className="text-xl font-semibold">Secretary Dashboard</h1>
          </div>
        </div>
        <div className="border-t bg-gray-50">
          <div className="mx-auto max-w-5xl px-4 py-2 flex gap-4 text-sm">
            <Link href="/dashboard" className="text-gray-600 hover:text-black">Dashboard</Link>
            <Link href="/secretary" className="font-medium text-black">Secretary</Link>
            <Link href="/preferences" className="text-gray-600 hover:text-black">Preferences</Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6 pb-12 space-y-6">
        {/* Pending Approvals */}
        <section className="rounded-lg border border-gray-200 bg-white p-4">
          <h2 className="text-lg font-medium">Pending Approvals</h2>
          {loading ? (
            <p className="mt-2 text-sm text-gray-500">Loading...</p>
          ) : pending.length === 0 ? (
            <p className="mt-2 text-sm text-gray-500">No pending actions. LifeOS is up to date.</p>
          ) : (
            <ul className="mt-4 space-y-3">
              {pending.map((a) => (
                <li key={a.id} className="rounded border border-yellow-200 bg-yellow-50 p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{ACTION_ICONS[a.actionType] ?? "📋"}</span>
                      <div>
                        <div className="font-medium">{a.target}</div>
                        <div className="text-xs text-gray-500 capitalize">{a.actionType}</div>
                      </div>
                    </div>
                    <span className="text-xs font-medium text-yellow-600">Awaiting approval</span>
                  </div>
                  {a.payload && (
                    <pre className="mt-2 text-xs text-gray-600 bg-white rounded p-2 overflow-x-auto">
                      {JSON.stringify(JSON.parse(a.payload), null, 2)}
                    </pre>
                  )}
                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={() => handleAction(a.id, true)}
                      className="rounded bg-green-600 px-4 py-2 text-sm text-white hover:bg-green-700"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleAction(a.id, false)}
                      className="rounded bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700"
                    >
                      Reject
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Action History */}
        <section className="rounded-lg border border-gray-200 bg-white p-4">
          <h2 className="text-lg font-medium">Action History</h2>
          {history.length === 0 ? (
            <p className="mt-2 text-sm text-gray-500">No actions taken yet.</p>
          ) : (
            <ul className="mt-4 space-y-2">
              {history.map((a) => (
                <li key={a.id} className="flex items-center justify-between border-b pb-2 last:border-0">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{ACTION_ICONS[a.actionType] ?? "📋"}</span>
                    <div>
                      <div className="font-medium">{a.target}</div>
                      <div className="text-xs text-gray-500 capitalize">{a.actionType}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-sm font-medium capitalize ${STATUS_STYLES[a.status] ?? ""}`}>
                      {a.status === "completed" ? "✅" : "❌"} {a.status}
                    </div>
                    {a.executedAt && (
                      <div className="text-xs text-gray-500">
                        {new Date(a.executedAt).toLocaleString(undefined, {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                          hour: "numeric",
                          minute: "2-digit",
                        })}
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}
