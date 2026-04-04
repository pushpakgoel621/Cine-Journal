import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { CollectionItemSchema } from "@/lib/validations";
import { NextRequest, NextResponse } from "next/server";

type RouteParams = { params: Promise<{ id: string }> };

export async function POST(request: NextRequest, { params }: RouteParams) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  // Verify ownership of the collection
  const collection = await prisma.collection.findUnique({
    where: { id },
  });

  if (!collection) {
    return NextResponse.json({ error: "Collection not found" }, { status: 404 });
  }
  if (collection.userId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const validated = CollectionItemSchema.safeParse(body);
  if (!validated.success) {
    return NextResponse.json(
      { error: "Validation failed", details: validated.error.flatten() },
      { status: 400 }
    );
  }

  // Verify watchlog belongs to user
  const watchLog = await prisma.watchLog.findUnique({
    where: { id: validated.data.watchLogId }
  });

  if (!watchLog || watchLog.userId !== session.user.id) {
    return NextResponse.json({ error: "Invalid watch log" }, { status: 400 });
  }

  try {
    // Determine order
    let order = validated.data.order;
    if (order === undefined || order === null) {
      const maxItem = await prisma.collectionItem.findFirst({
        where: { collectionId: id },
        orderBy: { order: 'desc' }
      });
      order = (maxItem?.order ?? 0) + 1;
    }

    const item = await prisma.collectionItem.create({
      data: {
        collectionId: id,
        watchLogId: validated.data.watchLogId,
        order,
      },
    });

    return NextResponse.json(item);
  } catch (error) {
    // Ignore unique constraint violation, meaning it's already in the list
    if (typeof error === 'object' && error !== null && 'code' in error && error.code === 'P2002') {
       return NextResponse.json({ error: "Already in collection" }, { status: 409 });
    }
    console.error("Failed to add to collection:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// Optional DELETE endpoint to remove an item could be added if needed
