"use client"

import { useState, useEffect } from "react"
import { Lock, Unlock } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { RichTextEditor } from "@/components/ui/rich-text-editor"
import { TagSelector } from "./tag-selector"
import type { Note } from "./note-card"

interface Tag {
  id: string
  name: string
  color: string
}

interface NoteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  note?: Note | null
  onSave: (note: { title: string; content: string; encrypted: boolean; password?: string; color?: string; tagIds?: string[] }) => Promise<void>
  availableTags?: Tag[]
  onCreateTag?: (name: string, color: string) => Promise<Tag>
}

export function NoteDialog({
  open,
  onOpenChange,
  note,
  onSave,
  availableTags = [],
  onCreateTag,
}: NoteDialogProps) {
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [encrypted, setEncrypted] = useState(false)
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [selectedColor, setSelectedColor] = useState<string>("")
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const colorOptions = [
    { value: "", label: "Default", color: "bg-gray-200" },
    { value: "#ef4444", label: "Red", color: "bg-red-500" },
    { value: "#f97316", label: "Orange", color: "bg-orange-500" },
    { value: "#eab308", label: "Yellow", color: "bg-yellow-500" },
    { value: "#22c55e", label: "Green", color: "bg-green-500" },
    { value: "#3b82f6", label: "Blue", color: "bg-blue-500" },
    { value: "#8b5cf6", label: "Purple", color: "bg-purple-500" },
    { value: "#ec4899", label: "Pink", color: "bg-pink-500" },
  ]

  useEffect(() => {
    if (note) {
      setTitle(note.title)
      // Only show content if note is decrypted or not encrypted
      // If encrypted and showing placeholder, don't populate content field
      if (note.encrypted && note.content === "🔒 Encrypted content") {
        setContent("")
        // Keep encryption state but don't pre-fill password
      } else {
        setContent(note.content)
      }
      setEncrypted(note.encrypted || false)
      setSelectedColor(note.color || "")
      setSelectedTagIds((note as any).tags?.map((t: any) => t.tag?.id || t.tagId) || [])
    } else {
      setTitle("")
      setContent("")
      setEncrypted(false)
      setSelectedColor("")
      setSelectedTagIds([])
    }
    setPassword("")
    setConfirmPassword("")
    setError(null)
  }, [note, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!title.trim() || !content.trim()) {
      setError("Title and content are required")
      return
    }

    // If encrypting (new note or re-encrypting existing), password is required
    if (encrypted) {
      if (!password.trim()) {
        setError("Password is required for encryption")
        return
      }
      if (password !== confirmPassword) {
        setError("Passwords do not match")
        return
      }
      if (password.length < 4) {
        setError("Password must be at least 4 characters long")
        return
      }
    }
    
    // If editing an encrypted note and keeping it encrypted, password is required
    if (note && note.encrypted && encrypted && !password.trim()) {
      setError("Password is required to re-encrypt this note")
      return
    }

    setIsLoading(true)
    try {
      await onSave({ 
        title: title.trim(), 
        content: content.trim(),
        encrypted,
        password: encrypted ? password.trim() : undefined,
        color: selectedColor || undefined,
        tagIds: selectedTagIds
      })
      setTitle("")
      setContent("")
      setEncrypted(false)
      setSelectedColor("")
      setSelectedTagIds([])
      setPassword("")
      setConfirmPassword("")
      onOpenChange(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save note")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{note ? "Edit Note" : "Create New Note"}</DialogTitle>
          <DialogDescription>
            {note
              ? "Update your note below."
              : "Add a new note with a title and content."}
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
              <label htmlFor="title" className="text-sm font-medium">
                Title
              </label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter note title"
                disabled={isLoading}
                required
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="content" className="text-sm font-medium">
                  Content
                </label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setEncrypted(!encrypted)}
                  disabled={isLoading}
                  className="gap-2"
                >
                  {encrypted ? (
                    <>
                      <Lock className="h-4 w-4" />
                      Encrypted
                    </>
                  ) : (
                    <>
                      <Unlock className="h-4 w-4" />
                      Not Encrypted
                    </>
                  )}
                </Button>
              </div>
              <RichTextEditor
                value={content}
                onChange={setContent}
                placeholder="Enter note content"
                disabled={isLoading}
                rows={8}
              />
              {encrypted && (
                <>
                  <div className="space-y-2">
                    <label htmlFor="password" className="text-sm font-medium">
                      Encryption Password
                    </label>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter password for encryption"
                      disabled={isLoading}
                      required={encrypted}
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="confirmPassword" className="text-sm font-medium">
                      Confirm Password
                    </label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm password"
                      disabled={isLoading}
                      required={encrypted}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    🔒 This note will be encrypted with your password. Make sure to remember it!
                  </p>
                </>
              )}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Note Color</label>
              <div className="flex flex-wrap gap-2">
                {colorOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setSelectedColor(option.value)}
                    className={`h-8 w-8 rounded-full border-2 transition-all ${
                      selectedColor === option.value
                        ? "border-foreground scale-110"
                        : "border-transparent hover:scale-105"
                    } ${option.color}`}
                    title={option.label}
                  />
                ))}
              </div>
            </div>
            {availableTags.length > 0 || onCreateTag ? (
              <TagSelector
                selectedTagIds={selectedTagIds}
                onTagsChange={setSelectedTagIds}
                availableTags={availableTags}
                onCreateTag={onCreateTag || (async () => ({ id: "", name: "", color: "" }))}
              />
            ) : null}
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
              {isLoading ? "Saving..." : note ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

