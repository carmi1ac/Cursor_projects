"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@clerk/nextjs"
import { Plus, Loader2, AlertCircle, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { FlashCardComponent, type FlashCard } from "@/components/flashcards/flash-card"
import { FlashCardDialog } from "@/components/flashcards/flash-card-dialog"
import { Navbar } from "@/components/landing/navbar"
import { FlashcardsFolderTree } from "@/components/flashcards/flashcards-folder-tree"

export default function FlashCardsPage() {
  const { isSignedIn, isLoaded } = useAuth()
  const router = useRouter()
  const [flashcards, setFlashcards] = useState<FlashCard[]>([])
  const [folders, setFolders] = useState<Array<{ id: string; name: string }>>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingFlashcard, setEditingFlashcard] = useState<FlashCard | null>(null)
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push("/signin")
    }
  }, [isLoaded, isSignedIn, router])

  useEffect(() => {
    if (isSignedIn) {
      fetchFlashCards()
      fetchFolders()
    }
  }, [isSignedIn, selectedFolderId])

  const fetchFolders = async () => {
    try {
      const response = await fetch("/api/folders")
      if (!response.ok) throw new Error("Failed to fetch folders")
      const data = await response.json()
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

  const fetchFlashCards = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const url = selectedFolderId
        ? `/api/flashcards?folderId=${selectedFolderId}`
        : "/api/flashcards"
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error("Failed to fetch flashcards")
      }
      const data = await response.json()
      setFlashcards(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load flashcards")
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreate = () => {
    setEditingFlashcard(null)
    setDialogOpen(true)
  }

  const handleEdit = (flashcard: FlashCard) => {
    setEditingFlashcard(flashcard)
    setDialogOpen(true)
  }

  const handleSave = async (flashcardData: {
    front: string
    back: string
    folderId?: string | null
  }) => {
    try {
      if (editingFlashcard) {
        const response = await fetch(`/api/flashcards/${editingFlashcard.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(flashcardData),
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error || "Failed to update flashcard")
        }

        const updatedFlashcard = await response.json()
        setFlashcards((prev) =>
          prev.map((fc) =>
            fc.id === updatedFlashcard.id ? updatedFlashcard : fc
          )
        )
      } else {
        const response = await fetch("/api/flashcards", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(flashcardData),
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error || "Failed to create flashcard")
        }

        const newFlashcard = await response.json()
        setFlashcards((prev) => [newFlashcard, ...prev])
      }
    } catch (err) {
      throw err
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this flash card?")) {
      return
    }

    try {
      const response = await fetch(`/api/flashcards/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to delete flashcard")
      }

      setFlashcards((prev) => prev.filter((fc) => fc.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete flashcard")
    }
  }

  const handleMoveToFolder = async (
    flashcardId: string,
    folderId: string | null
  ) => {
    try {
      const response = await fetch(`/api/flashcards/${flashcardId}/move`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ folderId }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to move flashcard")
      }

      await fetchFlashCards()
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to move flashcard"
      )
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
          <FlashcardsFolderTree
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
                    <h1 className="text-3xl font-bold tracking-tight">
                      Flash Cards
                    </h1>
                    <p className="text-muted-foreground">
                      Create and study with interactive flash cards
                    </p>
                  </div>
                  <Button onClick={handleCreate}>
                    <Plus className="mr-2 h-4 w-4" />
                    New Card
                  </Button>
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search flash cards by front or back content..."
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
            ) : flashcards.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <p className="mb-4 text-lg text-muted-foreground">
                  No flash cards yet. Create your first card!
                </p>
                <Button onClick={handleCreate}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Card
                </Button>
              </div>
                ) : (
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {flashcards
                      .filter((flashcard) => {
                        if (!searchQuery.trim()) return true
                        const query = searchQuery.toLowerCase()
                        // Strip HTML tags for content search
                        const frontText = flashcard.front.replace(/<[^>]*>/g, "").toLowerCase()
                        const backText = flashcard.back.replace(/<[^>]*>/g, "").toLowerCase()
                        const matchesFront = frontText.includes(query)
                        const matchesBack = backText.includes(query)
                        return matchesFront || matchesBack
                      })
                      .map((flashcard) => (
                        <FlashCardComponent
                          key={flashcard.id}
                          flashcard={flashcard}
                          onEdit={handleEdit}
                          onDelete={handleDelete}
                          onMoveToFolder={handleMoveToFolder}
                          folders={folders}
                        />
                      ))}
                  </div>
                )}
          </div>
        </div>
      </div>

      <FlashCardDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        flashcard={editingFlashcard}
        onSave={handleSave}
        folders={folders}
      />
    </div>
  )
}

