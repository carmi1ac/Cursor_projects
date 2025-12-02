"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { RichTextEditor } from "@/components/ui/rich-text-editor"
import type { FlashCard } from "./flash-card"

interface FlashCardDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  flashcard?: FlashCard | null
  onSave: (flashcard: { front: string; back: string; folderId?: string | null }) => Promise<void>
  folders?: Array<{ id: string; name: string }>
}

export function FlashCardDialog({
  open,
  onOpenChange,
  flashcard,
  onSave,
  folders,
}: FlashCardDialogProps) {
  const [front, setFront] = useState("")
  const [back, setBack] = useState("")
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (flashcard) {
      setFront(flashcard.front)
      setBack(flashcard.back)
      setSelectedFolderId(flashcard.folderId || null)
    } else {
      setFront("")
      setBack("")
      setSelectedFolderId(null)
    }
    setError(null)
  }, [flashcard, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!front.trim() || !back.trim()) {
      setError("Both front and back content are required")
      return
    }

    setIsLoading(true)
    try {
      await onSave({
        front: front.trim(),
        back: back.trim(),
        folderId: selectedFolderId,
      })
      setFront("")
      setBack("")
      setSelectedFolderId(null)
      onOpenChange(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save flashcard")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {flashcard ? "Edit Flash Card" : "Create New Flash Card"}
          </DialogTitle>
          <DialogDescription>
            {flashcard
              ? "Update your flash card below."
              : "Add a new flash card with front and back content."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            {error && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <label htmlFor="front" className="text-sm font-medium">
                Front Side
              </label>
              <RichTextEditor
                value={front}
                onChange={setFront}
                placeholder="Enter the question or front side content"
                disabled={isLoading}
                rows={4}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="back" className="text-sm font-medium">
                Back Side
              </label>
              <RichTextEditor
                value={back}
                onChange={setBack}
                placeholder="Enter the answer or back side content"
                disabled={isLoading}
                rows={4}
              />
            </div>
            {folders && folders.length > 0 && (
              <div className="space-y-2">
                <label htmlFor="folder" className="text-sm font-medium">
                  Folder (Optional)
                </label>
                <select
                  id="folder"
                  value={selectedFolderId || ""}
                  onChange={(e) => setSelectedFolderId(e.target.value || null)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  disabled={isLoading}
                >
                  <option value="">No Folder</option>
                  {folders.map((folder) => (
                    <option key={folder.id} value={folder.id}>
                      {folder.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : flashcard ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

