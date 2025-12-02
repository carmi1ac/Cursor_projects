import { auth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { encryptContent, decryptContent } from "@/lib/encryption"

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

    const note = await prisma.note.findFirst({
      where: {
        id,
        userId,
      },
    })

    if (!note) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 })
    }

    // For encrypted notes, show placeholder (password-encrypted notes need password)
    if (note.encrypted) {
      note.content = "🔒 Encrypted content"
    }

    return NextResponse.json(note)
  } catch (error) {
    console.error("Error fetching note:", error)
    return NextResponse.json(
      { error: "Failed to fetch note" },
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
    const { title, content, encrypted, password, color } = body

    if (!title || !content) {
      return NextResponse.json(
        { error: "Title and content are required" },
        { status: 400 }
      )
    }

    const note = await prisma.note.findFirst({
      where: {
        id,
        userId,
      },
    })

    if (!note) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 })
    }

    // Handle encryption/decryption logic
    let finalContent = content
    let isEncrypting = encrypted
    
    // If note was encrypted and we're updating, check if we need to decrypt first
    if (note.encrypted && !encrypted) {
      // User is removing encryption - content should already be decrypted in the request
      finalContent = content
      isEncrypting = false
    } else if (encrypted) {
      // Encrypting or re-encrypting - require password
      if (!password) {
        return NextResponse.json(
          { error: "Password is required for encryption" },
          { status: 400 }
        )
      }
      // ALWAYS encrypt content before storing
      finalContent = encryptContent(content, userId, password)
      isEncrypting = true
    }

    const updatedNote = await prisma.note.update({
      where: {
        id,
      },
      data: {
        title,
        content: finalContent, // Store encrypted content in database
        encrypted: isEncrypting,
        ...(color !== undefined && { color }),
      },
      include: {
        tags: {
          include: {
            tag: true,
          },
        },
      },
    })

    // NEVER return encrypted content to client - always return placeholder
    const responseNote = {
      ...updatedNote,
      content: isEncrypting ? "🔒 Encrypted content" : updatedNote.content,
    }

    return NextResponse.json(responseNote)
  } catch (error) {
    console.error("Error updating note:", error)
    return NextResponse.json(
      { error: "Failed to update note" },
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

    const note = await prisma.note.findFirst({
      where: {
        id,
        userId,
      },
    })

    if (!note) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 })
    }

    await prisma.note.delete({
      where: {
        id,
      },
    })

    return NextResponse.json({ message: "Note deleted successfully" })
  } catch (error) {
    console.error("Error deleting note:", error)
    return NextResponse.json(
      { error: "Failed to delete note" },
      { status: 500 }
    )
  }
}

