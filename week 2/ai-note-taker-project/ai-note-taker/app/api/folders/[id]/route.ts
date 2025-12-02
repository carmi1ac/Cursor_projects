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

    const folder = await prisma.folder.findFirst({
      where: {
        id,
        userId,
      },
      include: {
        children: true,
        notes: true,
      },
    })

    if (!folder) {
      return NextResponse.json({ error: "Folder not found" }, { status: 404 })
    }

    return NextResponse.json(folder)
  } catch (error) {
    console.error("Error fetching folder:", error)
    return NextResponse.json(
      { error: "Failed to fetch folder" },
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
    const { name, parentId, color } = body

    const folder = await prisma.folder.findFirst({
      where: {
        id,
        userId,
      },
    })

    if (!folder) {
      return NextResponse.json({ error: "Folder not found" }, { status: 404 })
    }

    // Prevent circular references
    if (parentId === id) {
      return NextResponse.json(
        { error: "Cannot set folder as its own parent" },
        { status: 400 }
      )
    }

    // If parentId is provided, verify it belongs to the user
    if (parentId) {
      const parent = await prisma.folder.findFirst({
        where: {
          id: parentId,
          userId,
        },
      })

      if (!parent) {
        return NextResponse.json(
          { error: "Parent folder not found" },
          { status: 404 }
        )
      }
    }

    const updatedFolder = await prisma.folder.update({
      where: {
        id,
      },
      data: {
        ...(name !== undefined && { name: name.trim() }),
        ...(parentId !== undefined && { parentId: parentId || null }),
        ...(color !== undefined && { color: color && color.trim() ? color.trim() : null }),
      },
    })

    return NextResponse.json(updatedFolder)
  } catch (error) {
    console.error("Error updating folder:", error)
    return NextResponse.json(
      { error: "Failed to update folder" },
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

    const folder = await prisma.folder.findFirst({
      where: {
        id,
        userId,
      },
      include: {
        children: true,
        notes: true,
      },
    })

    if (!folder) {
      return NextResponse.json({ error: "Folder not found" }, { status: 404 })
    }

    // Delete folder (cascade will handle children and notes will be set to null)
    await prisma.folder.delete({
      where: {
        id,
      },
    })

    return NextResponse.json({ message: "Folder deleted successfully" })
  } catch (error) {
    console.error("Error deleting folder:", error)
    return NextResponse.json(
      { error: "Failed to delete folder" },
      { status: 500 }
    )
  }
}

