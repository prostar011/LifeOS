import { NextResponse } from "next/server";
import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  const user = await currentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [transactions, tasks, subscriptions] = await Promise.all([
    db.transaction.findMany({
      where: { userId: user.id },
      orderBy: { date: "desc" },
      take: 50,
    }),
    db.task.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    }),
    db.subscription.findMany({
      where: { userId: user.id },
    }),
  ]);

  return NextResponse.json({
    transactions: transactions.map((t) => ({
      ...t,
      date: t.date.toISOString(),
    })),
    tasks: tasks.map((t) => ({
      ...t,
      dueDate: t.dueDate?.toISOString() ?? null,
    })),
    subscriptions: subscriptions.map((s) => ({
      ...s,
      nextBillingDate: s.nextBillingDate?.toISOString() ?? null,
    })),
  });
}
