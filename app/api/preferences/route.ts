import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const preferences = await db.preference.findMany({
    where: { userId: user.id },
    orderBy: { category: "asc" },
  });

  return NextResponse.json({ preferences });
}

export async function PUT(req: NextRequest) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, value } = await req.json();

  await db.preference.update({
    where: { id },
    data: { value, confidence: 0.1 }, // reset confidence on manual edit
  });

  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await req.json();

  await db.preference.delete({ where: { id } });

  return NextResponse.json({ ok: true });
}
