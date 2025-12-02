import { auth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    const flashcard = await prisma.flashCard.findFirst({
      where: {
        id,
        userId,
      },
    })

    if (!flashcard) {
      return NextResponse.json({ error: "Flashcard not found" }, { status: 404 })
    }

    return NextResponse.json(flashcard)
  } catch (error) {
    console.error("Error fetching flashcard:", error)
    return NextResponse.json(
      { error: "Failed to fetch flashcard" },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { front, back, folderId } = body

    if (!front || !back) {
      return NextResponse.json(
        { error: "Front and back content are required" },
        { status: 400 }
      )
    }

    const flashcard = await prisma.flashCard.findFirst({
      where: {
        id,
        userId,
      },
    })

    if (!flashcard) {
      return NextResponse.json({ error: "Flashcard not found" }, { status: 404 })
    }

    // If folderId is provided, verify it belongs to the user
    if (folderId !== undefined) {
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
    }

    const updatedFlashcard = await prisma.flashCard.update({
      where: {
        id,
      },
      data: {
        front: front.trim(),
        back: back.trim(),
        ...(folderId !== undefined && { folderId: folderId || null }),
      },
    })

    return NextResponse.json(updatedFlashcard)
  } catch (error) {
    console.error("Error updating flashcard:", error)
    return NextResponse.json(
      { error: "Failed to update flashcard" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    const flashcard = await prisma.flashCard.findFirst({
      where: {
        id,
        userId,
      },
    })

    if (!flashcard) {
      return NextResponse.json({ error: "Flashcard not found" }, { status: 404 })
    }

    await prisma.flashCard.delete({
      where: {
        id,
      },
    })

    return NextResponse.json({ message: "Flashcard deleted successfully" })
  } catch (error) {
    console.error("Error deleting flashcard:", error)
    return NextResponse.json(
      { error: "Failed to delete flashcard" },
      { status: 500 }
    )
  }
}

