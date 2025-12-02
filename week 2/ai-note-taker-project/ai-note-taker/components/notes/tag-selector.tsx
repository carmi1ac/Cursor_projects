"use client"

import { useState, useEffect } from "react"
import { X, Plus, Tag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface Tag {
  id: string
  name: string
  color: string
}

interface TagSelectorProps {
  selectedTagIds: string[]
  onTagsChange: (tagIds: string[]) => void
  availableTags: Tag[]
  onCreateTag: (name: string, color: string) => Promise<Tag>
}

export function TagSelector({
  selectedTagIds,
  onTagsChange,
  availableTags,
  onCreateTag,
}: TagSelectorProps) {
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [newTagName, setNewTagName] = useState("")
  const [selectedColor, setSelectedColor] = useState<string>("#3b82f6")
  const [isCreating, setIsCreating] = useState(false)

  const colorOptions = [
    { value: "#ef4444", label: "Red", color: "bg-red-500" },
    { value: "#f97316", label: "Orange", color: "bg-orange-500" },
    { value: "#eab308", label: "Yellow", color: "bg-yellow-500" },
    { value: "#22c55e", label: "Green", color: "bg-green-500" },
    { value: "#3b82f6", label: "Blue", color: "bg-blue-500" },
    { value: "#8b5cf6", label: "Purple", color: "bg-purple-500" },
    { value: "#ec4899", label: "Pink", color: "bg-pink-500" },
    { value: "#06b6d4", label: "Cyan", color: "bg-cyan-500" },
  ]

  const selectedTags = availableTags.filter((tag) => selectedTagIds.includes(tag.id))
  const unselectedTags = availableTags.filter((tag) => !selectedTagIds.includes(tag.id))

  const handleCreateTag = async () => {
    if (!newTagName.trim() || isCreating) return

    setIsCreating(true)
    try {
      const newTag = await onCreateTag(newTagName.trim(), selectedColor)
      onTagsChange([...selectedTagIds, newTag.id])
      setNewTagName("")
      setSelectedColor("#3b82f6")
      setCreateDialogOpen(false)
    } catch (error) {
      console.error("Error creating tag:", error)
      alert(error instanceof Error ? error.message : "Failed to create tag")
    } finally {
      setIsCreating(false)
    }
  }

  const toggleTag = (tagId: string) => {
    if (selectedTagIds.includes(tagId)) {
      onTagsChange(selectedTagIds.filter((id) => id !== tagId))
    } else {
      onTagsChange([...selectedTagIds, tagId])
    }
  }

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Tags</label>
      <div className="flex flex-wrap gap-2">
        {selectedTags.map((tag) => (
          <button
            key={tag.id}
            type="button"
            onClick={() => toggleTag(tag.id)}
            className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium text-white transition-colors hover:opacity-80"
            style={{ backgroundColor: tag.color }}
          >
            <Tag className="h-3 w-3" />
            {tag.name}
            <X className="h-3 w-3" />
          </button>
        ))}
        {unselectedTags.map((tag) => (
          <button
            key={tag.id}
            type="button"
            onClick={() => toggleTag(tag.id)}
            className="inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-medium transition-colors hover:bg-accent"
            style={{ borderColor: tag.color, color: tag.color }}
          >
            <Tag className="h-3 w-3" />
            {tag.name}
          </button>
        ))}
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-7 gap-1"
          onClick={() => setCreateDialogOpen(true)}
        >
          <Plus className="h-3 w-3" />
          New Tag
        </Button>
      </div>

      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Tag</DialogTitle>
            <DialogDescription>
              Create a new tag to organize your notes.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Input
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                placeholder="Tag name"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    handleCreateTag()
                  }
                }}
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">Tag Color</label>
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
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateTag} disabled={isCreating}>
              {isCreating ? "Creating..." : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

