import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { CollectionCreateSchema } from "@/lib/validations";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const collections = await prisma.collection.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: { items: true }
      }
    }
  });

  return NextResponse.json(collections);
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
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const validated = CollectionCreateSchema.safeParse(body);
  if (!validated.success) {
    return NextResponse.json(
      { error: "Validation failed", details: validated.error.flatten() },
      { status: 400 }
    );
  }

  try {
    const collection = await prisma.collection.create({
      data: {
        ...validated.data,
        userId: session.user.id,
      },
    });

    return NextResponse.json(collection);
  } catch (error) {
    console.error("Failed to create collection:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
