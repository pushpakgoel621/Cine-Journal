import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { WatchLogCreateSchema } from "@/lib/validations";
import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@/generated/prisma/client";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const cursor = searchParams.get("cursor");
  const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 50);
  const sortBy = searchParams.get("sortBy") || "createdAt";
  const sortOrder = searchParams.get("sortOrder") === "asc" ? "asc" : "desc";
  const status = searchParams.get("status");
  const genre = searchParams.get("genre");
  const emotion = searchParams.get("emotion");
  const platform = searchParams.get("platform");

  // Build where clause
  const where: Prisma.WatchLogWhereInput = {
    userId: session.user.id,
  };

  if (status === "WATCHED" || status === "TO_WATCH") {
    where.watchStatus = status;
  }
  if (genre) {
    where.genre = genre;
  }
  if (emotion) {
    where.emotions = { has: emotion };
  }
  if (platform) {
    where.platform = platform;
  }

  // Validate sortBy field
  const allowedSortFields = [
    "createdAt",
    "watchedAt",
    "rating",
    "title",
  ] as const;
  type SortField = (typeof allowedSortFields)[number];
  const safeSortBy: SortField = allowedSortFields.includes(
    sortBy as SortField
  )
    ? (sortBy as SortField)
    : "createdAt";

  const watchLogs = await prisma.watchLog.findMany({
    where,
    take: limit + 1, // Fetch one extra to check if there's a next page
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    orderBy: { [safeSortBy]: sortOrder },
  });

  let nextCursor: string | null = null;
  if (watchLogs.length > limit) {
    const nextItem = watchLogs.pop();
    nextCursor = nextItem!.id;
  }

  return NextResponse.json({
    data: watchLogs,
    nextCursor,
  });
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  const validated = WatchLogCreateSchema.safeParse(body);
  if (!validated.success) {
    return NextResponse.json(
      { error: "Validation failed", details: validated.error.flatten() },
      { status: 400 }
    );
  }

  const watchLog = await prisma.watchLog.create({
    data: {
      ...validated.data,
      userId: session.user.id,
      watchedAt: validated.data.watchedAt
        ? new Date(validated.data.watchedAt)
        : validated.data.watchStatus === "WATCHED"
          ? new Date()
          : null,
    },
  });

  return NextResponse.json(watchLog, { status: 201 });
}
