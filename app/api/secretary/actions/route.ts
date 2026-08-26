import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const actions = await db.secretaryAction.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({
    actions: actions.map((a) => ({
      ...a,
      createdAt: a.createdAt.toISOString(),
      executedAt: a.executedAt?.toISOString() ?? null,
    })),
  });
}

export async function POST(req: NextRequest) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, action } = await req.json();

  if (action === "approve") {
    await db.secretaryAction.update({
      where: { id },
      data: { status: "completed", executedAt: new Date() },
    });
  } else if (action === "reject") {
    await db.secretaryAction.update({
      where: { id },
      data: { status: "failed" },
    });
  }

  return NextResponse.json({ ok: true });
}
