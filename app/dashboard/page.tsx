"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useVoiceCommands } from "@/hooks/useVoiceCommands";

// Simple types for MVP
type Transaction = {
  id: string;
  amount: number;
  currency: string;
  date: string;
  merchant: string | null;
  category: string | null;
};

type Task = {
  id: string;
  title: string;
  dueDate: string | null;
  completed: boolean;
};

type Subscription = {
  id: string;
  merchant: string;
  amount: number;
  nextBillingDate: string | null;
  isActive: boolean;
};

export default function VoiceDashboardPage() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState<"money" | "tasks" | "local">("money");

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [voiceStatus, setVoiceStatus] = useState<string>('Tap mic or say "Hey LifeOS"');

  // Fetch demo data on mount
  useEffect(() => {
    fetch("/api/dashboard/data")
      .then((r) => r.json())
      .then((data) => {
        if (data.transactions) setTransactions(data.transactions);
        if (data.tasks) setTasks(data.tasks);
        if (data.subscriptions) setSubscriptions(data.subscriptions);
      })
      .catch(() => {});
  }, [session]);

  // Text-to-speech helper
  const speak = useCallback((text: string) => {
    if (typeof window === "undefined") return;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.rate = 1;
    window.speechSynthesis.speak(utterance);
  }, []);

  const triggerAi = useCallback(
    async (prompt: string) => {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, context: { plan: "free" } }),
      });
      const data = await res.json();
      if (data.response) {
        setAiResponse(data.response);
        speak(data.response);
      } else if (data.error) {
        setAiResponse(data.error);
      }
    },
    [speak]
  );

  // Task helpers
  const addTask = useCallback((title: string) => {
    if (!title.trim()) return;
    setTasks((prev) => [
      ...prev,
      { id: crypto.randomUUID(), title, dueDate: null, completed: false },
    ]);
  }, []);

  const toggleTask = useCallback((id: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  }, []);

  // Voice command handler
  const handleVoiceCommand = useCallback(
    (transcript: string) => {
      setVoiceStatus(`Heard: "${transcript}"`);
      const lower = transcript.toLowerCase();

      // Simple intent routing
      if (lower.includes("money") || lower.includes("spend") || lower.includes("balance")) {
        setActiveTab("money");
        setAiPrompt(transcript);
        triggerAi(transcript);
      } else if (
        lower.includes("task") ||
        lower.includes("add") ||
        lower.includes("plan") ||
        lower.includes("day")
      ) {
        setActiveTab("tasks");
        if (lower.startsWith("add task") || lower.includes("remind me")) {
          const taskText = transcript.replace(/add task|remind me to/gi, "").trim();
          if (taskText) {
            addTask(taskText);
            speak(`Okay, I added: ${taskText}`);
            return;
          }
        }
        setAiPrompt(transcript);
        triggerAi(transcript);
      } else if (
        lower.includes("grocer") ||
        lower.includes("pharmacy") ||
        lower.includes("gas") ||
        lower.includes("nearby") ||
        lower.includes("local")
      ) {
        setActiveTab("local");
        setAiPrompt(transcript);
        triggerAi(transcript);
      } else {
        // Default: send to AI
        setAiPrompt(transcript);
        triggerAi(transcript);
      }
    },
    [addTask, speak, triggerAi]
  );

  const { isListening, error: voiceError, startListening, stopListening } = useVoiceCommands({
    onCommand: handleVoiceCommand,
    enabled: true,
  });

  const handleAiSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiPrompt.trim()) return;
    triggerAi(aiPrompt);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top bar */}
      <header className="border-b bg-white">
        <div className="mx-auto max-w-5xl px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-semibold">LifeOS</h1>
          <div className="flex items-center gap-3">
            {/* Voice status */}
            <div className="hidden sm:block text-sm text-gray-600">
              {voiceError ? (
                <span className="text-red-600">{voiceError}</span>
              ) : (
                voiceStatus
              )}
            </div>
            <button
              onClick={isListening ? stopListening : startListening}
              className={`rounded-full px-4 py-2 text-sm font-medium ${
                isListening ? "bg-red-600 text-white" : "bg-black text-white"
              }`}
              title={isListening ? "Stop listening" : "Start voice commands"}
            >
              {isListening ? "🔴 Listening" : "🎤 Voice"}
            </button>
            <nav className="flex gap-2">
              <button
                onClick={() => setActiveTab("money")}
                className={`px-3 py-2 rounded ${activeTab === "money" ? "bg-black text-white" : "hover:bg-gray-100"}`}
              >
                Money
              </button>
              <button
                onClick={() => setActiveTab("tasks")}
                className={`px-3 py-2 rounded ${activeTab === "tasks" ? "bg-black text-white" : "hover:bg-gray-100"}`}
              >
                Tasks
              </button>
              <button
                onClick={() => setActiveTab("local")}
                className={`px-3 py-2 rounded ${activeTab === "local" ? "bg-black text-white" : "hover:bg-gray-100"}`}
              >
                Local
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* AI Command Bar + Voice hint */}
      <section className="mx-auto max-w-5xl px-4 py-6">
        <div className="mb-2 text-xs text-gray-500">
          Try: &ldquo;Show me my spending&rdquo;, &ldquo;Add task call mom&rdquo;, &ldquo;Find cheap groceries nearby&rdquo;
        </div>
        <form onSubmit={handleAiSubmit} className="flex gap-2">
          <input
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            placeholder="Ask LifeOS or speak naturally..."
            className="flex-1 rounded border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-black"
          />
          <button
            type="submit"
            className="rounded bg-black px-4 py-2 text-white hover:bg-gray-800"
          >
            Ask
          </button>
        </form>
        {aiResponse && (
          <div className="mt-4 rounded border border-gray-200 bg-white p-4 text-sm">
            {aiResponse}
          </div>
        )}
      </section>

      {/* Main content */}
      <main className="mx-auto max-w-5xl px-4 pb-12">
        {activeTab === "money" && (
          <MoneyTab
            transactions={transactions}
            subscriptions={subscriptions}
          />
        )}
        {activeTab === "tasks" && (
          <TasksTab
            tasks={tasks}
            addTask={addTask}
            toggleTask={toggleTask}
          />
        )}
        {activeTab === "local" && <LocalTab />}
      </main>
    </div>
  );
}

function MoneyTab({
  transactions,
  subscriptions,
}: {
  transactions: Transaction[];
  subscriptions: Subscription[];
}) {
  const totalBalance = 1234.56;
  const monthlySpend = transactions
    .filter((t) => {
      const d = new Date(t.date);
      const now = new Date();
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    })
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-gray-200 bg-white p-4">
        <h2 className="text-lg font-medium">Overview</h2>
        <div className="mt-4 grid grid-cols-2 gap-4">
          <div>
            <div className="text-sm text-gray-500">Total balance</div>
            <div className="text-2xl font-semibold">${totalBalance.toFixed(2)}</div>
          </div>
          <div>
            <div className="text-sm text-gray-500">This month&apos;s spend</div>
            <div className="text-2xl font-semibold">${monthlySpend.toFixed(2)}</div>
          </div>
        </div>
        <div className="mt-3 text-xs text-gray-500">
          Voice: &ldquo;Where am I overspending?&rdquo;, &ldquo;Show subscriptions&rdquo;
        </div>
      </section>

      <section className="rounded-lg border border-gray-200 bg-white p-4">
        <h2 className="text-lg font-medium">Subscriptions</h2>
        {subscriptions.length === 0 ? (
          <p className="mt-2 text-sm text-gray-500">No subscriptions detected yet.</p>
        ) : (
          <ul className="mt-4 space-y-2">
            {subscriptions.map((sub) => (
              <li key={sub.id} className="flex items-center justify-between border-b pb-2 last:border-0">
                <div>
                  <div className="font-medium">{sub.merchant}</div>
                  <div className="text-sm text-gray-500">
                    Next billing: {sub.nextBillingDate ? new Date(sub.nextBillingDate).toLocaleDateString() : "Unknown"}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium">${sub.amount.toFixed(2)}</div>
                  <div className="text-xs text-gray-500">{sub.isActive ? "Active" : "Canceled"}</div>
                </div>
              </li>
            ))}
          </ul>
        )}
        <div className="mt-3 text-xs text-gray-500">
          Voice: &ldquo;Cancel my gym subscription&rdquo;, &ldquo;How much am I paying for streaming?&rdquo;
        </div>
      </section>

      <section className="rounded-lg border border-gray-200 bg-white p-4">
        <h2 className="text-lg font-medium">Recent transactions</h2>
        {transactions.length === 0 ? (
          <p className="mt-2 text-sm text-gray-500">No transactions yet. Connect a bank account to get started.</p>
        ) : (
          <ul className="mt-4 space-y-2">
            {transactions.slice(0, 10).map((t) => (
              <li key={t.id} className="flex items-center justify-between border-b pb-2 last:border-0">
                <div>
                  <div className="font-medium">{t.merchant ?? "Unknown"}</div>
                  <div className="text-sm text-gray-500">
                    {new Date(t.date).toLocaleDateString()} • {t.category ?? "Uncategorized"}
                  </div>
                </div>
                <div className={`font-medium ${t.amount < 0 ? "text-red-600" : "text-green-600"}`}>
                  {t.amount < 0 ? "-" : "+"}${Math.abs(t.amount).toFixed(2)}
                </div>
              </li>
            ))}
          </ul>
        )}
        <div className="mt-3 text-xs text-gray-500">
          Voice: &ldquo;Show my recent transactions&rdquo;, &ldquo;How much did I spend on dining?&rdquo;
        </div>
      </section>
    </div>
  );
}

function TasksTab({
  tasks,
  addTask,
  toggleTask,
}: {
  tasks: Task[];
  addTask: (title: string) => void;
  toggleTask: (id: string) => void;
}) {
  const [newTask, setNewTask] = useState("");

  const handleAdd = () => {
    if (!newTask.trim()) return;
    addTask(newTask);
    setNewTask("");
  };

  const today = new Date().toLocaleDateString(undefined, {
    weekday: "long",
    month: "short",
    day: "numeric",
  });

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-gray-200 bg-white p-4">
        <h2 className="text-lg font-medium">Today • {today}</h2>

        <div className="mt-4 flex gap-2">
          <input
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            placeholder="Add a task..."
            className="flex-1 rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
          />
          <button
            onClick={handleAdd}
            className="rounded bg-black px-4 py-2 text-white hover:bg-gray-800"
          >
            Add
          </button>
        </div>

        {tasks.length === 0 ? (
          <p className="mt-4 text-sm text-gray-500">No tasks yet. Add your first task above.</p>
        ) : (
          <ul className="mt-4 space-y-2">
            {tasks.map((task) => (
              <li key={task.id} className="flex items-center gap-3 border-b pb-2 last:border-0">
                <input
                  type="checkbox"
                  checked={task.completed}
                  onChange={() => toggleTask(task.id)}
                  className="h-4 w-4"
                />
                <span className={task.completed ? "text-gray-400 line-through" : ""}>
                  {task.title}
                </span>
                {task.dueDate && (
                  <span className="ml-auto text-xs text-gray-500">
                    Due {new Date(task.dueDate).toLocaleDateString()}
                  </span>
                )}
              </li>
            ))}
          </ul>
        )}
        <div className="mt-3 text-xs text-gray-500">
          Voice: &ldquo;Add task call mom&rdquo;, &ldquo;Plan my day&rdquo;
        </div>
      </section>

      <section className="rounded-lg border border-gray-200 bg-white p-4">
        <h2 className="text-lg font-medium">Habits</h2>
        <p className="mt-2 text-sm text-gray-500">
          Habit tracking UI goes here (e.g., sleep, exercise, meds).
        </p>
      </section>
    </div>
  );
}

function LocalTab() {
  const stores = [
    { name: "Trader Joe's", distance: "0.5 miles", price: "$", icon: "🛒" },
    { name: "Whole Foods", distance: "0.8 miles", price: "$$$", icon: "🛒" },
    { name: "Safeway", distance: "1.2 miles", price: "$$", icon: "🛒" },
    { name: "CVS Pharmacy", distance: "0.3 miles", price: "$$", icon: "💊" },
    { name: "Walgreens", distance: "0.7 miles", price: "$$", icon: "💊" },
    { name: "Shell Gas Station", distance: "1.0 miles", price: "$$", icon: "⛽" },
  ];

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-gray-200 bg-white p-4">
        <h2 className="text-lg font-medium">Nearby essentials</h2>
        <p className="mt-2 text-sm text-gray-500">
          Grocery stores, pharmacies, and gas stations based on your location.
        </p>
        <ul className="mt-4 space-y-2">
          {stores.map((store) => (
            <li key={store.name} className="flex items-center justify-between border-b pb-2 last:border-0">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{store.icon}</span>
                <div>
                  <div className="font-medium">{store.name}</div>
                  <div className="text-sm text-gray-500">{store.distance}</div>
                </div>
              </div>
              <div className="text-sm text-gray-600">{store.price}</div>
            </li>
          ))}
        </ul>
        <div className="mt-4 flex gap-2">
          <button className="rounded bg-black px-4 py-2 text-sm text-white hover:bg-gray-800">
            Order groceries for pickup
          </button>
          <button className="rounded border border-gray-300 px-4 py-2 text-sm hover:bg-gray-100">
            Get directions
          </button>
        </div>
        <div className="mt-3 text-xs text-gray-500">
          Voice: &ldquo;Find cheap groceries near me&rdquo;, &ldquo;Where is the nearest pharmacy?&rdquo;
        </div>
      </section>
    </div>
  );
}
