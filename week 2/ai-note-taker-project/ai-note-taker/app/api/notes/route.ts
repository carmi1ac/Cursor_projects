import { auth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { encryptContent, decryptContent } from "@/lib/encryption"

export async function GET(request: Request) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const folderId = searchParams.get("folderId")

    const notes = await prisma.note.findMany({
      where: {
        userId,
        ...(folderId ? { folderId } : { folderId: null }),
      },
      include: {
        tags: {
          include: {
            tag: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    // For encrypted notes, show placeholder (password-encrypted notes need password to decrypt)
    const decryptedNotes = notes.map((note) => {
      if (note.encrypted) {
        // Don't try to decrypt automatically - user needs to provide password
        return {
          ...note,
          content: "🔒 Encrypted content",
        }
      }
      return note
    })

    return NextResponse.json(decryptedNotes)
  } catch (error) {
    console.error("Error fetching notes:", error)
    return NextResponse.json(
      { error: "Failed to fetch notes" },
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
    const { title, content, encrypted, password, color } = body

    if (!title || !content) {
      return NextResponse.json(
        { error: "Title and content are required" },
        { status: 400 }
      )
    }

    if (encrypted && !password) {
      return NextResponse.json(
        { error: "Password is required for encryption" },
        { status: 400 }
      )
    }

    // ALWAYS encrypt content if encryption is requested - never store plain text
    const finalContent = encrypted
      ? encryptContent(content, userId, password)
      : content

    const note = await prisma.note.create({
      data: {
        title,
        content: finalContent, // Store encrypted content in database
        encrypted: encrypted || false,
        userId,
        ...(color && { color }),
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
      ...note,
      content: encrypted ? "🔒 Encrypted content" : note.content,
    }

    return NextResponse.json(responseNote, { status: 201 })
  } catch (error) {
    console.error("Error creating note:", error)
    return NextResponse.json(
      { error: "Failed to create note" },
      { status: 500 }
    )
  }
}

