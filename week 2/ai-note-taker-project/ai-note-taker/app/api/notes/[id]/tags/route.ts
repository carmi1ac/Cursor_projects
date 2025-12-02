import { auth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(
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
    const { tagIds } = body

    const note = await prisma.note.findFirst({
      where: {
        id,
        userId,
      },
    })

    if (!note) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 })
    }

    // Verify all tags belong to the user
    if (tagIds && tagIds.length > 0) {
      const tags = await prisma.tag.findMany({
        where: {
          id: { in: tagIds },
          userId,
        },
      })

      if (tags.length !== tagIds.length) {
        return NextResponse.json(
          { error: "One or more tags not found" },
          { status: 404 }
        )
      }
    }

    // Delete existing tags for this note
    await prisma.noteTag.deleteMany({
      where: {
        noteId: id,
      },
    })

    // Add new tags
    if (tagIds && tagIds.length > 0) {
      await prisma.noteTag.createMany({
        data: tagIds.map((tagId: string) => ({
          noteId: id,
          tagId,
        })),
      })
    }

    const updatedNote = await prisma.note.findFirst({
      where: {
        id,
      },
      include: {
        tags: {
          include: {
            tag: true,
          },
        },
      },
    })

    return NextResponse.json(updatedNote)
  } catch (error) {
    console.error("Error updating note tags:", error)
    return NextResponse.json(
      { error: "Failed to update note tags" },
      { status: 500 }
    )
  }
}

