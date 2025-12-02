"use client"

import { useState, useEffect } from "react"
import { Folder, FolderPlus, ChevronRight, ChevronDown, Edit2, MoreVertical } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"

interface FolderItem {
  id: string
  name: string
  parentId: string | null
  color?: string | null
  children?: FolderItem[]
  _count?: {
    notes: number
  }
}

interface NotesFolderTreeProps {
  selectedFolderId: string | null
  onSelectFolder: (folderId: string | null) => void
}

export function NotesFolderTree({ selectedFolderId, onSelectFolder }: NotesFolderTreeProps) {
  const [folders, setFolders] = useState<FolderItem[]>([])
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set())
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editingFolder, setEditingFolder] = useState<FolderItem | null>(null)
  const [parentFolderId, setParentFolderId] = useState<string | null>(null)
  const [newFolderName, setNewFolderName] = useState("")
  const [selectedColor, setSelectedColor] = useState<string>("")
  const [selectedParentId, setSelectedParentId] = useState<string | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)

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

    flatFolders.forEach((folder) => {
      folderMap.set(folder.id, { ...folder, children: [] })
    })

    flatFolders.forEach((folder) => {
      if (processed.has(folder.id)) return
      
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

  const flattenAllFolders = (folders: FolderItem[]): FolderItem[] => {
    const result: FolderItem[] = []
    folders.forEach((folder) => {
      result.push(folder)
      if (folder.children) {
        result.push(...flattenAllFolders(folder.children))
      }
    })
    return result
  }

  const getAllFolders = (): FolderItem[] => {
    return flattenAllFolders(folders)
  }

  const isDescendantOf = (folderId: string, ancestorId: string, allFolders: FolderItem[]): boolean => {
    const folder = allFolders.find((f) => f.id === folderId)
    if (!folder || !folder.parentId) return false
    if (folder.parentId === ancestorId) return true
    return isDescendantOf(folder.parentId, ancestorId, allFolders)
  }

  const getAvailableParentOptions = (): FolderItem[] => {
    const allFolders = getAllFolders()
    if (!editingFolder) return allFolders
    // Exclude the folder being edited and folders that are descendants of the folder being edited
    return allFolders.filter(
      (f) => f.id !== editingFolder.id && !isDescendantOf(f.id, editingFolder.id, allFolders)
    )
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
          parentId: parentFolderId || null,
          color: selectedColor || null,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Failed to create folder" }))
        throw new Error(errorData.error || "Failed to create folder")
      }

      setNewFolderName("")
      setSelectedColor("")
      setParentFolderId(null)
      setDialogOpen(false)
      fetchFolders()
    } catch (error) {
      console.error("Error creating folder:", error)
      alert(error instanceof Error ? error.message : "Failed to create folder")
    } finally {
      setIsCreating(false)
    }
  }

  const handleEditFolder = (folder: FolderItem) => {
    setEditingFolder(folder)
    setNewFolderName(folder.name)
    setSelectedColor(folder.color || "")
    setSelectedParentId(folder.parentId)
    setEditDialogOpen(true)
  }

  const handleUpdateFolder = async () => {
    if (!editingFolder || !newFolderName.trim() || isUpdating) return

    setIsUpdating(true)
    try {
      const response = await fetch(`/api/folders/${editingFolder.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newFolderName,
          parentId: selectedParentId || null,
          color: selectedColor || null,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Failed to update folder" }))
        throw new Error(errorData.error || "Failed to update folder")
      }

      setEditingFolder(null)
      setNewFolderName("")
      setSelectedColor("")
      setSelectedParentId(null)
      setEditDialogOpen(false)
      fetchFolders()
    } catch (error) {
      console.error("Error updating folder:", error)
      alert(error instanceof Error ? error.message : "Failed to update folder")
    } finally {
      setIsUpdating(false)
    }
  }

  const handleDeleteFolder = async (folderId: string) => {
    if (!confirm("Are you sure you want to delete this folder? Notes will be moved to root.")) {
      return
    }

    try {
      const response = await fetch(`/api/folders/${folderId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Failed to delete folder" }))
        throw new Error(errorData.error || "Failed to delete folder")
      }

      fetchFolders()
      if (selectedFolderId === folderId) {
        onSelectFolder(null)
      }
    } catch (error) {
      console.error("Error deleting folder:", error)
      alert(error instanceof Error ? error.message : "Failed to delete folder")
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
    const folderColor = folder.color || undefined

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
          <Folder 
            className="h-4 w-4" 
            style={{ color: folderColor }}
          />
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
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button variant="ghost" size="icon" className="h-6 w-6">
                <MoreVertical className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleEditFolder(folder) }}>
                <Edit2 className="mr-2 h-4 w-4" />
                Edit Folder
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setParentFolderId(folder.id); setDialogOpen(true) }}>
                <FolderPlus className="mr-2 h-4 w-4" />
                Add Subfolder
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={(e) => { e.stopPropagation(); handleDeleteFolder(folder.id) }}
                className="text-destructive focus:text-destructive"
              >
                Delete Folder
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
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
        <h2 className="text-lg font-semibold">Note Folders</h2>
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
                : "Create a new folder for your notes"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
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
            <div>
              <label className="mb-2 block text-sm font-medium">Folder Color</label>
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
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateFolder} disabled={isCreating}>
              {isCreating ? "Creating..." : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Folder</DialogTitle>
            <DialogDescription>
              Update folder name, color, and location.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="mb-2 block text-sm font-medium">Folder Name</label>
              <Input
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder="Folder name"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    handleUpdateFolder()
                  }
                }}
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">Parent Folder</label>
              <select
                value={selectedParentId || ""}
                onChange={(e) => setSelectedParentId(e.target.value || null)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="">Root (No Parent)</option>
                {getAvailableParentOptions().map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">Folder Color</label>
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
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateFolder} disabled={isUpdating}>
              {isUpdating ? "Updating..." : "Update"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

