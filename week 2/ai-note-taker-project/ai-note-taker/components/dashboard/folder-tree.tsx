"use client"

import { useState, useEffect } from "react"
import { Folder, FolderPlus, ChevronRight, ChevronDown, MoreVertical } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"

interface FolderItem {
  id: string
  name: string
  parentId: string | null
  children?: FolderItem[]
  _count?: {
    notes: number
  }
}

interface FolderTreeProps {
  selectedFolderId: string | null
  onSelectFolder: (folderId: string | null) => void
}

export function FolderTree({ selectedFolderId, onSelectFolder }: FolderTreeProps) {
  const [folders, setFolders] = useState<FolderItem[]>([])
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set())
  const [dialogOpen, setDialogOpen] = useState(false)
  const [parentFolderId, setParentFolderId] = useState<string | null>(null)
  const [newFolderName, setNewFolderName] = useState("")
  const [isCreating, setIsCreating] = useState(false)

  useEffect(() => {
    fetchFolders()
  }, [])

  const fetchFolders = async () => {
    try {
      const response = await fetch("/api/folders")
      if (!response.ok) throw new Error("Failed to fetch folders")
      const data = await response.json()
      setFolders(buildFolderTree(data))
    } catch (error) {
      console.error("Error fetching folders:", error)
    }
  }

  const buildFolderTree = (flatFolders: FolderItem[]): FolderItem[] => {
    const folderMap = new Map<string, FolderItem>()
    const rootFolders: FolderItem[] = []
    const processed = new Set<string>()

    // First pass: create all folder objects
    flatFolders.forEach((folder) => {
      folderMap.set(folder.id, { ...folder, children: [] })
    })

    // Second pass: build tree structure
    flatFolders.forEach((folder) => {
      if (processed.has(folder.id)) return // Skip if already processed
      
      const folderWithChildren = folderMap.get(folder.id)!
      if (folder.parentId && folderMap.has(folder.parentId)) {
        const parent = folderMap.get(folder.parentId)!
        if (!parent.children) parent.children = []
        parent.children.push(folderWithChildren)
      } else {
        rootFolders.push(folderWithChildren)
      }
      processed.add(folder.id)
    })

    return rootFolders
  }

  const handleCreateFolder = async () => {
    if (!newFolderName.trim() || isCreating) return

    setIsCreating(true)
    try {
      const response = await fetch("/api/folders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newFolderName,
          parentId: parentFolderId,
        }),
      })

      if (!response.ok) throw new Error("Failed to create folder")

      setNewFolderName("")
      setParentFolderId(null)
      setDialogOpen(false)
      fetchFolders()
    } catch (error) {
      console.error("Error creating folder:", error)
    } finally {
      setIsCreating(false)
    }
  }

  const toggleFolder = (folderId: string) => {
    setExpandedFolders((prev) => {
      const next = new Set(prev)
      if (next.has(folderId)) {
        next.delete(folderId)
      } else {
        next.add(folderId)
      }
      return next
    })
  }

  const renderFolder = (folder: FolderItem, level: number = 0) => {
    const isExpanded = expandedFolders.has(folder.id)
    const hasChildren = folder.children && folder.children.length > 0

    return (
      <div key={folder.id}>
        <div
          className={`flex items-center gap-1 rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-accent ${
            selectedFolderId === folder.id ? "bg-accent" : ""
          }`}
          style={{ paddingLeft: `${level * 16 + 8}px` }}
        >
          <button
            onClick={() => toggleFolder(folder.id)}
            className="mr-1"
            disabled={!hasChildren}
          >
            {hasChildren ? (
              isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )
            ) : (
              <span className="w-4" />
            )}
          </button>
          <Folder className="h-4 w-4 text-muted-foreground" />
          <button
            onClick={() => onSelectFolder(folder.id)}
            className="flex-1 text-left"
          >
            {folder.name}
            {folder._count && folder._count.notes > 0 && (
              <span className="ml-2 text-xs text-muted-foreground">
                ({folder._count.notes})
              </span>
            )}
          </button>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={(e) => {
              e.stopPropagation()
              setParentFolderId(folder.id)
              setDialogOpen(true)
            }}
          >
            <FolderPlus className="h-3 w-3" />
          </Button>
        </div>
        {isExpanded && hasChildren && (
          <div>
            {folder.children!.map((child) => renderFolder(child, level + 1))}
          </div>
        )}
      </div>
    )
  }

  return (
    <>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Folders</h2>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => {
            setParentFolderId(null)
            setDialogOpen(true)
          }}
        >
          <FolderPlus className="h-4 w-4" />
        </Button>
      </div>
      <div className="space-y-1">
        <button
          onClick={() => onSelectFolder(null)}
          className={`w-full rounded-md px-2 py-1.5 text-left text-sm transition-colors hover:bg-accent ${
            selectedFolderId === null ? "bg-accent" : ""
          }`}
        >
          All Notes
        </button>
        {folders.map((folder) => renderFolder(folder))}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Folder</DialogTitle>
            <DialogDescription>
              {parentFolderId
                ? "Create a nested folder inside the selected folder"
                : "Create a new folder"}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              placeholder="Folder name"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault()
                  handleCreateFolder()
                }
              }}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateFolder} disabled={isCreating}>
              {isCreating ? "Creating..." : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

