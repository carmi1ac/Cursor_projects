"use client"

import { format } from "date-fns"
import { Edit2, Trash2, Download, Folder, Lock, Unlock, MoreVertical } from "lucide-react"
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
import { exportNoteAsText, exportNoteAsPDF, exportNoteAsDOCX } from "@/lib/export-utils"

export interface Note {
  id: string
  title: string
  content: string
  createdAt: Date | string
  updatedAt: Date | string
  encrypted?: boolean
  folderId?: string | null
  color?: string | null
  tags?: Array<{ tag: { id: string; name: string; color: string } }>
}

interface NoteCardProps {
  note: Note
  onEdit: (note: Note) => void
  onDelete: (id: string) => void
  onMoveToFolder?: (noteId: string, folderId: string | null) => void
  onDecrypt?: (noteId: string) => void
  folders?: Array<{ id: string; name: string }>
}

export function NoteCard({ note, onEdit, onDelete, onMoveToFolder, onDecrypt, folders }: NoteCardProps) {
  const formattedDate = format(
    new Date(note.createdAt),
    "MMM d, yyyy 'at' h:mm a"
  )
  const formattedUpdated = format(
    new Date(note.updatedAt),
    "MMM d, yyyy 'at' h:mm a"
  )

  const noteColor = note.color || undefined

  return (
    <div 
      className="group relative rounded-lg border bg-card p-6 shadow-sm transition-shadow hover:shadow-md"
      style={{ borderLeftColor: noteColor, borderLeftWidth: noteColor ? "4px" : "1px" }}
    >
      <div className="mb-2 flex items-start justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold leading-tight">{note.title}</h3>
          {note.encrypted && (
            <Lock className="h-4 w-4 text-muted-foreground" title="Encrypted" />
          )}
        </div>
        <div className="opacity-0 transition-opacity group-hover:opacity-100">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {note.encrypted && onDecrypt && (
                <DropdownMenuItem onClick={() => onDecrypt(note.id)}>
                  <Unlock className="mr-2 h-4 w-4" />
                  Decrypt Note
                </DropdownMenuItem>
              )}
              {note.encrypted && onDecrypt && <DropdownMenuSeparator />}
              <DropdownMenuItem
                onClick={() => onEdit(note)}
                disabled={note.encrypted && note.content === "🔒 Encrypted content"}
              >
                <Edit2 className="mr-2 h-4 w-4" />
                Edit Note
              </DropdownMenuItem>
              {onMoveToFolder && folders && (
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>
                    <Folder className="mr-2 h-4 w-4" />
                    Move to Folder
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent>
                    <DropdownMenuItem onClick={() => onMoveToFolder(note.id, null)}>
                      Root
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    {folders.map((folder) => (
                      <DropdownMenuItem
                        key={folder.id}
                        onClick={() => onMoveToFolder(note.id, folder.id)}
                      >
                        {folder.name}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
              )}
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <Download className="mr-2 h-4 w-4" />
                  Export
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  <DropdownMenuItem onClick={() => exportNoteAsText(note)}>
                    Export as TXT
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => exportNoteAsPDF(note)}>
                    Export as PDF
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => exportNoteAsDOCX(note)}>
                    Export as DOCX
                  </DropdownMenuItem>
                </DropdownMenuSubContent>
              </DropdownMenuSub>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => onDelete(note.id)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Note
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <div 
        className="mb-4 line-clamp-3 text-sm text-muted-foreground"
        dangerouslySetInnerHTML={{ 
          __html: note.encrypted && note.content === "🔒 Encrypted content" 
            ? "🔒 Encrypted content" 
            : note.content 
        }} 
      />
      {note.tags && note.tags.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-1">
          {note.tags.map((noteTag) => (
            <span
              key={noteTag.tag.id}
              className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium text-white"
              style={{ backgroundColor: noteTag.tag.color }}
            >
              {noteTag.tag.name}
            </span>
          ))}
        </div>
      )}
      <div className="text-xs text-muted-foreground">
        <div>Created: {formattedDate}</div>
        {formattedUpdated !== formattedDate && (
          <div>Updated: {formattedUpdated}</div>
        )}
      </div>
    </div>
  )
}

