"use client"

import { useState } from "react"
import { Edit2, Trash2, Folder, MoreVertical } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@/components/ui/dropdown-menu"

export interface FlashCard {
  id: string
  front: string
  back: string
  folderId?: string | null
  createdAt: Date | string
  updatedAt: Date | string
}

interface FlashCardProps {
  flashcard: FlashCard
  onEdit: (flashcard: FlashCard) => void
  onDelete: (id: string) => void
  onMoveToFolder?: (flashcardId: string, folderId: string | null) => void
  folders?: Array<{ id: string; name: string }>
}

export function FlashCardComponent({
  flashcard,
  onEdit,
  onDelete,
  onMoveToFolder,
  folders,
}: FlashCardProps) {
  const [isFlipped, setIsFlipped] = useState(false)

  const handleFlip = () => {
    setIsFlipped(!isFlipped)
  }

  return (
    <div className="group relative h-64 w-full [perspective:1000px]">
      <div
        className="relative h-full w-full cursor-pointer"
        onClick={handleFlip}
      >
        <div
          className={`relative h-full w-full transition-transform duration-500 [transform-style:preserve-3d] ${
            isFlipped ? "[transform:rotateY(180deg)]" : ""
          }`}
        >
          {/* Front Side */}
          <div
            className={`absolute inset-0 [backface-visibility:hidden] rounded-lg border bg-card p-6 shadow-sm transition-shadow hover:shadow-md ${
              isFlipped ? "opacity-0" : "opacity-100"
            }`}
          >
            <div className="mb-2 flex items-start justify-between">
              <h3 className="text-sm font-medium text-muted-foreground">Front</h3>
              <div className="opacity-0 transition-opacity group-hover:opacity-100">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                    <Button variant="ghost" size="icon" className="h-6 w-6">
                      <MoreVertical className="h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit(flashcard) }}>
                      <Edit2 className="mr-2 h-4 w-4" />
                      Edit Card
                    </DropdownMenuItem>
                    {onMoveToFolder && folders && (
                      <DropdownMenuSub>
                        <DropdownMenuSubTrigger onClick={(e) => e.stopPropagation()}>
                          <Folder className="mr-2 h-4 w-4" />
                          Move to Folder
                        </DropdownMenuSubTrigger>
                        <DropdownMenuSubContent>
                          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onMoveToFolder(flashcard.id, null) }}>
                            Root
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {folders.map((folder) => (
                            <DropdownMenuItem
                              key={folder.id}
                              onClick={(e) => { e.stopPropagation(); onMoveToFolder(flashcard.id, folder.id) }}
                            >
                              {folder.name}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuSubContent>
                      </DropdownMenuSub>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={(e) => { e.stopPropagation(); onDelete(flashcard.id) }}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete Card
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
            <div className="flex h-full items-center justify-center">
              <div className="text-center text-lg" dangerouslySetInnerHTML={{ __html: flashcard.front }} />
            </div>
            <p className="absolute bottom-2 right-2 text-xs text-muted-foreground">
              Click to flip
            </p>
          </div>

          {/* Back Side */}
          <div
            className={`absolute inset-0 [transform:rotateY(180deg)] [backface-visibility:hidden] rounded-lg border bg-muted p-6 shadow-sm transition-shadow hover:shadow-md ${
              isFlipped ? "opacity-100" : "opacity-0"
            }`}
          >
            <div className="mb-2 flex items-start justify-between">
              <h3 className="text-sm font-medium text-muted-foreground">Back</h3>
              <div className="opacity-0 transition-opacity group-hover:opacity-100">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                    <Button variant="ghost" size="icon" className="h-6 w-6">
                      <MoreVertical className="h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit(flashcard) }}>
                      <Edit2 className="mr-2 h-4 w-4" />
                      Edit Card
                    </DropdownMenuItem>
                    {onMoveToFolder && folders && (
                      <DropdownMenuSub>
                        <DropdownMenuSubTrigger onClick={(e) => e.stopPropagation()}>
                          <Folder className="mr-2 h-4 w-4" />
                          Move to Folder
                        </DropdownMenuSubTrigger>
                        <DropdownMenuSubContent>
                          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onMoveToFolder(flashcard.id, null) }}>
                            Root
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {folders.map((folder) => (
                            <DropdownMenuItem
                              key={folder.id}
                              onClick={(e) => { e.stopPropagation(); onMoveToFolder(flashcard.id, folder.id) }}
                            >
                              {folder.name}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuSubContent>
                      </DropdownMenuSub>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={(e) => { e.stopPropagation(); onDelete(flashcard.id) }}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete Card
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
            <div className="flex h-full items-center justify-center">
              <div className="text-center text-lg" dangerouslySetInnerHTML={{ __html: flashcard.back }} />
            </div>
            <p className="absolute bottom-2 right-2 text-xs text-muted-foreground">
              Click to flip
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

