"use client"

import { useState } from "react"
import { Plus } from "lucide-react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog"

// ─── Delete page ──────────────────────────────────────────────────────────────

export function DeletePageDialog({ pageName, onConfirm }: { pageName: string; onConfirm: () => void }) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="text-destructive border-destructive/30 hover:bg-destructive/5 hover:text-destructive">
          Delete page
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete "{pageName}"?</DialogTitle>
          <DialogDescription>This will permanently remove the page and all its content. This action cannot be undone.</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild><Button variant="outline" size="sm">Cancel</Button></DialogClose>
          <Button size="sm" className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            onClick={() => { onConfirm(); setOpen(false) }}>
            Delete page
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ─── Add provider ─────────────────────────────────────────────────────────────

export function AddProviderDialog({ onAdd }: { onAdd: (name: string) => void }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")

  function handleAdd() {
    if (!name.trim()) return
    onAdd(name.trim()); setName(""); setOpen(false)
    router.push("/sandbox/seo-editor")
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="size-3.5" />
          Add provider
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add game provider</DialogTitle>
          <DialogDescription>Enter the provider name. You'll be taken to the SEO editor to configure its page.</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-1.5 py-1">
          <Label className="text-xs font-medium text-muted-foreground">Provider name</Label>
          <Input autoFocus placeholder="e.g. Red Tiger" value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()} />
        </div>
        <DialogFooter>
          <DialogClose asChild><Button variant="outline" size="sm">Cancel</Button></DialogClose>
          <Button size="sm" disabled={!name.trim()} onClick={handleAdd}>Add &amp; open SEO editor</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
