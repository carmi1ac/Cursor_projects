import { auth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function PATCH(
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
    const { folderId } = body

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

    const updatedFlashcard = await prisma.flashCard.update({
      where: {
        id,
      },
      data: {
        folderId: folderId || null,
      },
    })

    return NextResponse.json(updatedFlashcard)
  } catch (error) {
    console.error("Error moving flashcard:", error)
    return NextResponse.json(
      { error: "Failed to move flashcard" },
      { status: 500 }
    )
  }
}

