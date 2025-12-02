"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@clerk/nextjs"
import { Plus, Loader2, AlertCircle, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { NoteCard, type Note } from "@/components/notes/note-card"
import { NoteDialog } from "@/components/notes/note-dialog"
import { DecryptDialog } from "@/components/notes/decrypt-dialog"
import { Navbar } from "@/components/landing/navbar"
import { TodoSidebar } from "@/components/dashboard/todo-sidebar"
import { NotesFolderTree } from "@/components/dashboard/notes-folder-tree"

export default function DashboardPage() {
  const { isSignedIn, isLoaded } = useAuth()
  const router = useRouter()
  const [notes, setNotes] = useState<Note[]>([])
  const [folders, setFolders] = useState<Array<{ id: string; name: string }>>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [decryptDialogOpen, setDecryptDialogOpen] = useState(false)
  const [decryptingNoteId, setDecryptingNoteId] = useState<string | null>(null)
  const [decryptingNoteTitle, setDecryptingNoteTitle] = useState("")
  const [editingNote, setEditingNote] = useState<Note | null>(null)
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [tags, setTags] = useState<Array<{ id: string; name: string; color: string }>>([])

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push("/signin")
    }
  }, [isLoaded, isSignedIn, router])

  useEffect(() => {
    if (isSignedIn) {
      fetchNotes()
      fetchFolders()
      fetchTags()
    }
  }, [isSignedIn, selectedFolderId])

  const fetchTags = async () => {
    try {
      const response = await fetch("/api/tags")
      if (response.ok) {
        const data = await response.json()
        setTags(data)
      }
    } catch (error) {
      console.error("Error fetching tags:", error)
    }
  }

  const handleCreateTag = async (name: string, color: string) => {
    const response = await fetch("/api/tags", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, color }),
    })
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || "Failed to create tag")
    }
    const newTag = await response.json()
    setTags((prev) => [...prev, newTag])
    return newTag
  }

  const fetchFolders = async () => {
    try {
      const response = await fetch("/api/folders")
      if (!response.ok) throw new Error("Failed to fetch folders")
      const data = await response.json()
      // Flatten folder tree for dropdown, ensuring no duplicates
      const flattenFolders = (
        folders: any[],
        seen = new Set<string>()
      ): Array<{ id: string; name: string }> => {
        const result: Array<{ id: string; name: string }> = []
        folders.forEach((folder) => {
          if (!seen.has(folder.id)) {
            result.push({ id: folder.id, name: folder.name })
            seen.add(folder.id)
            if (folder.children) {
              result.push(...flattenFolders(folder.children, seen))
            }
          }
        })
        return result
      }
      setFolders(flattenFolders(data))
    } catch (err) {
      console.error("Error fetching folders:", err)
    }
  }

  const fetchNotes = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const url = selectedFolderId
        ? `/api/notes?folderId=${selectedFolderId}`
        : "/api/notes"
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error("Failed to fetch notes")
      }
      const data = await response.json()
      setNotes(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load notes")
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreate = () => {
    setEditingNote(null)
    setDialogOpen(true)
  }

  const handleEdit = (note: Note) => {
    setEditingNote(note)
    setDialogOpen(true)
  }

  const handleMoveToFolder = async (noteId: string, folderId: string | null) => {
    try {
      const response = await fetch(`/api/notes/${noteId}/move`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ folderId }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to move note")
      }

      await fetchNotes()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to move note")
    }
  }

  const handleDecryptClick = (noteId: string) => {
    const note = notes.find((n) => n.id === noteId)
    if (note) {
      setDecryptingNoteId(note.id)
      setDecryptingNoteTitle(note.title)
      setDecryptDialogOpen(true)
    }
  }

  const handleDecrypt = async (password: string) => {
    if (!decryptingNoteId) return

    try {
      const response = await fetch(`/api/notes/${decryptingNoteId}/decrypt`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to decrypt note")
      }

      const decryptedNote = await response.json()
      // Update the note in the list with decrypted content (temporary, not saved to DB)
      // This allows viewing/editing, but content remains encrypted in database
      setNotes((prev) =>
        prev.map((note) => 
          note.id === decryptingNoteId 
            ? { ...decryptedNote, _decrypted: true } // Mark as decrypted for UI
            : note
        )
      )
      setDecryptDialogOpen(false)
      setDecryptingNoteId(null)
      setDecryptingNoteTitle("")
    } catch (err) {
      throw err
    }
  }

      const handleSave = async (noteData: { title: string; content: string; encrypted: boolean; password?: string; color?: string; tagIds?: string[] }) => {
    try {
      if (editingNote) {
        // If editing an encrypted note that was decrypted, and user wants to keep it encrypted,
        // we need a password. If they're removing encryption, we can proceed.
        if (editingNote.encrypted && noteData.encrypted && !noteData.password) {
          throw new Error("Password is required to re-encrypt this note")
        }

        // Update existing note
        const response = await fetch(`/api/notes/${editingNote.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(noteData),
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error || "Failed to update note")
        }

        const updatedNote = await response.json()
        
        // Update tags separately
        if (noteData.tagIds !== undefined) {
          await fetch(`/api/notes/${editingNote.id}/tags`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ tagIds: noteData.tagIds }),
          })
          
          // Fetch updated note with tags
          const noteResponse = await fetch(`/api/notes/${editingNote.id}`)
          if (noteResponse.ok) {
            const noteWithTags = await noteResponse.json()
            setNotes((prev) =>
              prev.map((note) => (note.id === updatedNote.id ? noteWithTags : note))
            )
          } else {
            setNotes((prev) =>
              prev.map((note) => (note.id === updatedNote.id ? updatedNote : note))
            )
          }
        } else {
          setNotes((prev) =>
            prev.map((note) => (note.id === updatedNote.id ? updatedNote : note))
          )
        }
      } else {
        // Create new note - password is required if encrypting
        if (noteData.encrypted && !noteData.password) {
          throw new Error("Password is required for encryption")
        }

        const { tagIds, ...noteDataWithoutTags } = noteData
        const response = await fetch("/api/notes", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(noteDataWithoutTags),
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error || "Failed to create note")
        }

        const newNote = await response.json()
        
        // Add tags if provided
        if (tagIds && tagIds.length > 0) {
          await fetch(`/api/notes/${newNote.id}/tags`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ tagIds }),
          })
          
          // Fetch note with tags
          const noteResponse = await fetch(`/api/notes/${newNote.id}`)
          if (noteResponse.ok) {
            const noteWithTags = await noteResponse.json()
            setNotes((prev) => [noteWithTags, ...prev])
          } else {
            setNotes((prev) => [newNote, ...prev])
          }
        } else {
          setNotes((prev) => [newNote, ...prev])
        }
      }
    } catch (err) {
      throw err
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this note?")) {
      return
    }

    try {
      const response = await fetch(`/api/notes/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to delete note")
      }

      setNotes((prev) => prev.filter((note) => note.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete note")
    }
  }

  if (!isLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!isSignedIn) {
    return null
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <div className="flex flex-1 pt-16">
        {/* Left Sidebar with Folders */}
            <div className="hidden md:block w-64 border-r bg-muted/30 p-4">
              <NotesFolderTree
                selectedFolderId={selectedFolderId}
                onSelectFolder={setSelectedFolderId}
              />
            </div>

        {/* Main Content */}
        <div className="flex-1 overflow-auto">
          <div className="container mx-auto px-4 py-8">
              <div className="mb-8 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-3xl font-bold tracking-tight">My Notes</h1>
                    <p className="text-muted-foreground">
                      Manage and organize your notes
                    </p>
                  </div>
                  <Button onClick={handleCreate}>
                    <Plus className="mr-2 h-4 w-4" />
                    New Note
                  </Button>
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search notes by title, content, or tags..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>

            {error && (
              <div className="mb-6 flex items-center gap-2 rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-destructive">
                <AlertCircle className="h-5 w-5" />
                <span>{error}</span>
              </div>
            )}

            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : notes.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <p className="mb-4 text-lg text-muted-foreground">
                  No notes yet. Create your first note!
                </p>
                <Button onClick={handleCreate}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Note
                </Button>
              </div>
                ) : (
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {notes
                      .filter((note) => {
                        if (!searchQuery.trim()) return true
                        const query = searchQuery.toLowerCase()
                        const matchesTitle = note.title.toLowerCase().includes(query)
                        // Strip HTML tags for content search
                        const contentText = note.content.replace(/<[^>]*>/g, "").toLowerCase()
                        const matchesContent = contentText.includes(query)
                        const matchesTags = note.tags?.some((t) =>
                          t.tag.name.toLowerCase().includes(query)
                        )
                        return matchesTitle || matchesContent || matchesTags
                      })
                      .map((note) => (
                        <NoteCard
                          key={note.id}
                          note={note}
                          onEdit={handleEdit}
                          onDelete={handleDelete}
                          onMoveToFolder={handleMoveToFolder}
                          onDecrypt={handleDecryptClick}
                          folders={folders}
                        />
                      ))}
                  </div>
                )}
          </div>
        </div>

        {/* Right Sidebar with Todo List */}
        <div className="hidden lg:block">
          <TodoSidebar />
        </div>
      </div>

          <NoteDialog
            open={dialogOpen}
            onOpenChange={setDialogOpen}
            note={editingNote}
            onSave={handleSave}
            availableTags={tags}
            onCreateTag={handleCreateTag}
          />

      <DecryptDialog
        open={decryptDialogOpen}
        onOpenChange={setDecryptDialogOpen}
        onDecrypt={handleDecrypt}
        noteTitle={decryptingNoteTitle}
      />
    </div>
  )
}

