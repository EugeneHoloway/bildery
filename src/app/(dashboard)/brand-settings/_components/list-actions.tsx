'use client'
import { toast } from 'sonner'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

// The one way brand-settings lists handle limits and removal:
// - a capped list shows "count/max noun" right next to its add button;
// - the add button, when disabled, explains why in a tooltip;
// - every removal shows a toast with Undo;
// - removing a container that still holds items asks for confirmation first.

/** "2/10 rows" -- sits right before the list's add button. */
export function LimitCount({ count, max, noun }: { count: number; max: number; noun: string }) {
  return (
    <span className="shrink-0 text-sm text-muted-foreground tabular-nums">
      {count}/{max} {noun}
    </span>
  )
}

/** Wraps an add button; while `reason` is set the (disabled) button explains itself on hover and focus. */
export function DisabledReason({ reason, children }: { reason?: string; children: React.ReactNode }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        {/* The span keeps the tooltip on the disabled button */}
        <span className="w-fit">{children}</span>
      </TooltipTrigger>
      {reason && <TooltipContent>{reason}</TooltipContent>}
    </Tooltip>
  )
}

/** Toast after a removal, with Undo putting the item back. */
export function toastRemoved(message: string, undo: () => void) {
  toast(message, { action: { label: 'Undo', onClick: undo } })
}

/** Puts an item back where it was removed from (or at the end, if the list got shorter meanwhile). */
export function insertAt<T>(list: T[], index: number, item: T) {
  const next = [...list]
  next.splice(Math.min(index, next.length), 0, item)
  return next
}

/** "1 row" / "2 rows" -- for messages about how many items go along. */
export function pluralize(count: number, noun: string) {
  return `${count} ${noun}${count === 1 ? '' : 's'}`
}

/** Confirmation before removing a container together with what's inside it. */
export function ConfirmRemoveDialog({ open, onOpenChange, title, description, onConfirm }: {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  onConfirm: () => void
}) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          {/* Same destructive action as the brand deactivation dialog */}
          <AlertDialogAction onClick={onConfirm} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
            Remove
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
