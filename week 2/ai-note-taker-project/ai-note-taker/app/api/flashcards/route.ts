import { auth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: Request) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const folderId = searchParams.get("folderId")

    const flashcards = await prisma.flashCard.findMany({
      where: {
        userId,
        ...(folderId ? { folderId } : { folderId: null }),
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json(flashcards)
  } catch (error) {
    console.error("Error fetching flashcards:", error)
    return NextResponse.json(
      { error: "Failed to fetch flashcards" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { front, back, folderId } = body

    if (!front || !back) {
      return NextResponse.json(
        { error: "Front and back content are required" },
        { status: 400 }
      )
    }

    // If folderId is provided, verify it belongs to the user
    if (folderId) {
      const folder = await prisma.folder.findFirst({
        where: {
          id: folderId,
          userId,
        },
      })

      if (!folder) {
        return NextResponse.json(
          { error: "Folder not found" },
          { status: 404 }
        )
      }
    }

    const flashcard = await prisma.flashCard.create({
      data: {
        front: front.trim(),
        back: back.trim(),
        userId,
        ...(folderId && { folderId }),
      },
    })

    return NextResponse.json(flashcard, { status: 201 })
  } catch (error) {
    console.error("Error creating flashcard:", error)
    return NextResponse.json(
      { error: "Failed to create flashcard" },
      { status: 500 }
    )
  }
}

