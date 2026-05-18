import { cn } from '@/lib/utils'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

/**
 * DocTable — shadcn Table wrapped in a card-style container.
 * Use DocTableHeader for the thead to get the standard muted background.
 *
 * Usage:
 *   <DocTable>
 *     <DocTableHeader>
 *       <TableRow><TableHead>Col</TableHead></TableRow>
 *     </DocTableHeader>
 *     <TableBody>
 *       <TableRow><TableCell>Value</TableCell></TableRow>
 *     </TableBody>
 *   </DocTable>
 */
function DocTable({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn(
      'mb-5 rounded-lg border border-border bg-card overflow-hidden',
      '[&_[data-slot=table-container]]:overflow-visible',
      className,
    )}>
      <Table>{children}</Table>
    </div>
  )
}

/** TableHeader with standard muted background — matches doc-table th style */
function DocTableHeader({
  className,
  ...props
}: React.ComponentProps<'thead'>) {
  return <TableHeader className={cn('bg-muted/50', className)} {...props} />
}

export {
  DocTable,
  DocTableHeader,
  // Re-export shadcn primitives so consumers only need one import
  TableBody,
  TableCell,
  TableHead,
  TableRow,
}
