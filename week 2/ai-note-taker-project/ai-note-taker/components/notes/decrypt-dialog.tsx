"use client"

import { useState } from "react"
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

interface DecryptDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onDecrypt: (password: string) => Promise<void>
  noteTitle: string
}

export function DecryptDialog({
  open,
  onOpenChange,
  onDecrypt,
  noteTitle,
}: DecryptDialogProps) {
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleDecrypt = async () => {
    if (!password.trim()) {
      setError("Password is required")
      return
    }

    setIsLoading(true)
    setError(null)
    try {
      await onDecrypt(password.trim())
      setPassword("")
      onOpenChange(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to decrypt note")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Decrypt Note</DialogTitle>
          <DialogDescription>
            Enter the password to decrypt "{noteTitle}"
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          {error && (
            <div className="mb-4 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}
          <div className="space-y-2">
            <label htmlFor="decrypt-password" className="text-sm font-medium">
              Password
            </label>
            <Input
              id="decrypt-password"
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                setError(null)
              }}
              placeholder="Enter password"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault()
                  handleDecrypt()
                }
              }}
              disabled={isLoading}
              autoFocus
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              setPassword("")
              setError(null)
              onOpenChange(false)
            }}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button onClick={handleDecrypt} disabled={isLoading}>
            {isLoading ? "Decrypting..." : "Decrypt"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

