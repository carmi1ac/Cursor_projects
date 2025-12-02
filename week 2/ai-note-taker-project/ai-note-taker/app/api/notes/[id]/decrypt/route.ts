import { auth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { decryptContent } from "@/lib/encryption"

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
    const { password } = body

    if (!password) {
      return NextResponse.json(
        { error: "Password is required" },
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

    if (!note.encrypted) {
      return NextResponse.json(
        { error: "Note is not encrypted" },
        { status: 400 }
      )
    }

    try {
      // Try to decrypt with password - this validates the password is correct
      const decryptedContent = decryptContent(note.content, userId, password)

      // Return decrypted note for temporary display (NEVER save decrypted content to DB)
      // The decrypted content is only sent to client for display purposes
      return NextResponse.json({
        ...note,
        content: decryptedContent, // Only decrypted for this response, not saved
      })
    } catch (error) {
      return NextResponse.json(
        { error: "Incorrect password or failed to decrypt" },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error("Error decrypting note:", error)
    return NextResponse.json(
      { error: "Failed to decrypt note" },
      { status: 500 }
    )
  }
}

