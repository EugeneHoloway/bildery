'use client'

import { Suspense, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  Building2,
  Check,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  CircleCheck,
  Copy,
  MoreHorizontal,
  Pencil,
  Plus,
  Power,
  RefreshCw,
  Search,
  Store,
  Trash2,
} from 'lucide-react'
import { useAuth } from '@/components/AuthProvider'
import { DashboardHeader } from '@/components/DashboardHeader'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
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
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------

interface Operator {
  id: string
  name: string
  active: boolean
}

interface Brand {
  id: string
  operatorId: string
  name: string
  active: boolean
}

const OPERATORS: Operator[] = [
  { id: 'bet', name: 'Betsy', active: true },
  { id: 'nova', name: 'Nova Gaming', active: true },
  { id: 'orbit', name: 'Orbit Entertainment', active: true },
]

const BRANDS: Brand[] = [
  { id: 'bet1', operatorId: 'bet', name: 'BetUp', active: true },
  { id: 'nova1', operatorId: 'nova', name: 'NovaBet', active: true },
  { id: 'nova2', operatorId: 'nova', name: 'NovaCasino', active: false },
  { id: 'nova3', operatorId: 'nova', name: 'Nova3', active: true },
  { id: 'orbit1', operatorId: 'orbit', name: 'OrbitPlay', active: true },
]

type TabValue = 'operators' | 'brands'
type Kind = 'operator' | 'brand'

const PAGE_SIZE_OPTIONS = ['10', '20', '50']
const ID_PATTERN = /^[a-z0-9-]+$/

// ---------------------------------------------------------------------------
// Pieces
// ---------------------------------------------------------------------------

function StatusBadge({ active }: { active: boolean }) {
  return active ? (
    <Badge variant="success">
      <CircleCheck data-icon="inline-start" />
      Active
    </Badge>
  ) : (
    <Badge variant="secondary">Inactive</Badge>
  )
}

function IdCell({
  id,
  href,
  label,
  onNavigate,
}: {
  id: string
  href: string
  label: string
  // Handles plain clicks in place (same-page targets); modifier clicks still follow the href
  onNavigate?: () => void
}) {
  const [copied, setCopied] = useState(false)
  function copy() {
    navigator.clipboard.writeText(id)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="flex items-center gap-1">
      <Link
        href={href}
        onClick={e => {
          if (!onNavigate || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return
          e.preventDefault()
          onNavigate()
        }}
        className="font-mono text-sm underline underline-offset-2 hover:text-muted-foreground transition-colors"
      >
        {id}
      </Link>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon-xs" onClick={copy} aria-label={`Copy ${label}`}>
            {copied ? <Check className="text-success" /> : <Copy className="text-muted-foreground" />}
          </Button>
        </TooltipTrigger>
        <TooltipContent>{copied ? 'Copied' : 'Copy'}</TooltipContent>
      </Tooltip>
    </div>
  )
}

function RowActions({
  name,
  active,
  onRename,
  onToggle,
  onDelete,
}: {
  name: string
  active: boolean
  onRename: () => void
  onToggle: () => void
  onDelete: () => void
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon-sm" aria-label={`Actions for ${name}`}>
          <MoreHorizontal />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onSelect={onRename}>
          <Pencil />
          Rename
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={onToggle}>
          <Power />
          {active ? 'Deactivate' : 'Activate'}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" onSelect={onDelete}>
          <Trash2 />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function SectionHeader({ title, refreshing, onRefresh }: { title: string; refreshing: boolean; onRefresh: () => void }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <h2 className="text-xl font-semibold">{title}</h2>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="outline" size="icon" onClick={onRefresh} disabled={refreshing} aria-label="Refresh">
            <RefreshCw className={cn(refreshing && 'animate-spin')} />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Refresh</TooltipContent>
      </Tooltip>
    </div>
  )
}

function TablePagination({
  page,
  pageSize,
  total,
  onPageChange,
  onPageSizeChange,
}: {
  page: number
  pageSize: number
  total: number
  onPageChange: (page: number) => void
  onPageSizeChange: (size: number) => void
}) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize))

  return (
    <div className="flex flex-col items-end gap-2 sm:flex-row sm:items-center sm:justify-end">
      <div className="flex items-center gap-2">
        <span className="whitespace-nowrap text-sm font-medium">Rows per page</span>
        <Select value={String(pageSize)} onValueChange={v => onPageSizeChange(Number(v))}>
          <SelectTrigger size="sm" className="w-16">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PAGE_SIZE_OPTIONS.map(opt => (
              <SelectItem key={opt} value={opt}>{opt}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex items-center gap-2">
        <span className="whitespace-nowrap text-sm font-medium">
          Page {page} of {totalPages}
        </span>
        <div className="flex items-center gap-1">
          <Button variant="outline" size="icon-sm" onClick={() => onPageChange(1)} disabled={page === 1} aria-label="First page">
            <ChevronsLeft />
          </Button>
          <Button variant="outline" size="icon-sm" onClick={() => onPageChange(page - 1)} disabled={page === 1} aria-label="Previous page">
            <ChevronLeft />
          </Button>
          <Button variant="outline" size="icon-sm" onClick={() => onPageChange(page + 1)} disabled={page === totalPages} aria-label="Next page">
            <ChevronRight />
          </Button>
          <Button variant="outline" size="icon-sm" onClick={() => onPageChange(totalPages)} disabled={page === totalPages} aria-label="Last page">
            <ChevronsRight />
          </Button>
        </div>
      </div>
    </div>
  )
}

// Pagination state that snaps back into range when rows disappear (delete, search)
function usePagination(total: number) {
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const current = Math.min(page, totalPages)
  return {
    page: current,
    pageSize,
    start: (current - 1) * pageSize,
    setPage,
    setPageSize: (size: number) => { setPageSize(size); setPage(1) },
  }
}

// ---------------------------------------------------------------------------
// Dialogs
// ---------------------------------------------------------------------------

type EditorState =
  | { mode: 'create'; kind: Kind }
  | { mode: 'rename'; kind: Kind; id: string; name: string }
  | null

function EditorDialog({
  state,
  operators,
  takenIds,
  onClose,
  onSubmit,
}: {
  state: EditorState
  operators: Operator[]
  takenIds: Set<string>
  onClose: () => void
  onSubmit: (values: { id: string; name: string; operatorId: string }) => void
}) {
  const [id, setId] = useState('')
  const [name, setName] = useState('')
  const [operatorId, setOperatorId] = useState('')
  const [submitted, setSubmitted] = useState(false)

  // Keeps the last opened state so the content does not flip while the close animation runs
  const [shown, setShown] = useState<NonNullable<EditorState>>({ mode: 'create', kind: 'operator' })

  // Reset the form every time the dialog opens
  useEffect(() => {
    if (!state) return
    setShown(state)
    setId('')
    setName(state.mode === 'rename' ? state.name : '')
    setOperatorId('')
    setSubmitted(false)
  }, [state])

  const creating = shown.mode === 'create'
  const kind = shown.kind
  const noun = kind === 'operator' ? 'operator' : 'brand'

  const idError = !creating
    ? null
    : !id.trim()
      ? 'ID is required'
      : !ID_PATTERN.test(id)
        ? 'Use lowercase letters, digits and hyphens'
        : takenIds.has(id)
          ? 'This ID is already taken'
          : null
  const nameError = !name.trim() ? 'Name is required' : null
  const operatorError = creating && kind === 'brand' && !operatorId ? 'Choose an operator' : null
  const valid = !idError && !nameError && !operatorError

  function submit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitted(true)
    if (!valid) return
    onSubmit({ id, name: name.trim(), operatorId })
  }

  return (
    <Dialog open={state !== null} onOpenChange={open => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={submit} className="grid gap-6">
          <DialogHeader>
            <DialogTitle>{creating ? `Create ${noun}` : `Rename ${noun}`}</DialogTitle>
            <DialogDescription>
              {creating
                ? `The ID is permanent and cannot be changed after the ${noun} is created.`
                : `The ${noun} ID stays the same.`}
            </DialogDescription>
          </DialogHeader>

          <FieldGroup>
            {creating && kind === 'brand' && (
              <Field data-invalid={submitted && !!operatorError}>
                <FieldLabel htmlFor="editor-operator">Operator</FieldLabel>
                <Select value={operatorId} onValueChange={setOperatorId}>
                  <SelectTrigger id="editor-operator" className="w-full" aria-invalid={submitted && !!operatorError}>
                    <SelectValue placeholder="Select operator" />
                  </SelectTrigger>
                  <SelectContent>
                    {operators.map(o => (
                      <SelectItem key={o.id} value={o.id}>{o.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {submitted && operatorError && <FieldError>{operatorError}</FieldError>}
              </Field>
            )}
            {creating && (
              <Field data-invalid={submitted && !!idError}>
                <FieldLabel htmlFor="editor-id">ID</FieldLabel>
                <Input
                  id="editor-id"
                  className="font-mono"
                  placeholder={kind === 'operator' ? 'nova' : 'nova4'}
                  value={id}
                  onChange={e => setId(e.target.value.toLowerCase())}
                  aria-invalid={submitted && !!idError}
                />
                {submitted && idError && <FieldError>{idError}</FieldError>}
              </Field>
            )}
            <Field data-invalid={submitted && !!nameError}>
              <FieldLabel htmlFor="editor-name">Name</FieldLabel>
              <Input
                id="editor-name"
                value={name}
                onChange={e => setName(e.target.value)}
                aria-invalid={submitted && !!nameError}
              />
              {submitted && nameError && <FieldError>{nameError}</FieldError>}
            </Field>
          </FieldGroup>

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">Cancel</Button>
            </DialogClose>
            <Button type="submit">{creating ? 'Create' : 'Save'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

function OperatorsBrandsPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()

  const [tab, setTab] = useState<TabValue>(() =>
    searchParams.get('tab') === 'brands' ? 'brands' : 'operators'
  )
  const [search, setSearch] = useState(() => searchParams.get('q') ?? '')

  const [operators, setOperators] = useState(OPERATORS)
  const [brands, setBrands] = useState(BRANDS)
  const [refreshing, setRefreshing] = useState(false)

  const [editor, setEditor] = useState<EditorState>(null)
  const [deleting, setDeleting] = useState<{ kind: Kind; id: string; name: string } | null>(null)

  useEffect(() => {
    if (!loading && !user) router.replace('/')
  }, [user, loading, router])

  // Only deviations from the defaults end up in the query; replaceState keeps tab switches out of history
  useEffect(() => {
    const url = new URL(window.location.href)
    url.search = ''
    if (tab === 'brands') {
      url.searchParams.set('tab', 'brands')
      if (search) url.searchParams.set('q', search)
    }
    window.history.replaceState(null, '', url)
  }, [tab, search])

  const operatorName = useMemo(
    () => new Map(operators.map(o => [o.id, o.name])),
    [operators]
  )
  const brandCount = useMemo(() => {
    const counts = new Map<string, number>()
    for (const b of brands) counts.set(b.operatorId, (counts.get(b.operatorId) ?? 0) + 1)
    return counts
  }, [brands])

  const filteredBrands = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return brands
    return brands.filter(b =>
      [b.id, b.name, operatorName.get(b.operatorId) ?? ''].some(v => v.toLowerCase().includes(q))
    )
  }, [brands, search, operatorName])

  const operatorsPage = usePagination(operators.length)
  const brandsPage = usePagination(filteredBrands.length)

  if (loading || !user) return null

  function refresh() {
    setRefreshing(true)
    setTimeout(() => setRefreshing(false), 600)
  }

  function showOperatorBrands(operator: Operator) {
    setSearch(operator.name)
    brandsPage.setPage(1)
    setTab('brands')
  }

  function submitEditor(values: { id: string; name: string; operatorId: string }) {
    if (!editor) return
    if (editor.mode === 'create') {
      if (editor.kind === 'operator') {
        setOperators(prev => [...prev, { id: values.id, name: values.name, active: true }])
        setTab('operators')
      } else {
        setBrands(prev => [...prev, { id: values.id, operatorId: values.operatorId, name: values.name, active: true }])
        setTab('brands')
      }
    } else if (editor.kind === 'operator') {
      setOperators(prev => prev.map(o => (o.id === editor.id ? { ...o, name: values.name } : o)))
    } else {
      setBrands(prev => prev.map(b => (b.id === editor.id ? { ...b, name: values.name } : b)))
    }
    setEditor(null)
  }

  function confirmDelete() {
    if (!deleting) return
    if (deleting.kind === 'operator') {
      setOperators(prev => prev.filter(o => o.id !== deleting.id))
      setBrands(prev => prev.filter(b => b.operatorId !== deleting.id))
    } else {
      setBrands(prev => prev.filter(b => b.id !== deleting.id))
    }
    setDeleting(null)
  }

  const takenIds = new Set(
    editor?.kind === 'brand' ? brands.map(b => b.id) : operators.map(o => o.id)
  )
  const deletingBrandCount = deleting?.kind === 'operator' ? brandCount.get(deleting.id) ?? 0 : 0

  const operatorRows = operators.slice(operatorsPage.start, operatorsPage.start + operatorsPage.pageSize)
  const brandRows = filteredBrands.slice(brandsPage.start, brandsPage.start + brandsPage.pageSize)

  return (
    <>
      <DashboardHeader
        breadcrumbs={[
          { label: 'Organization settings', href: '/settings/operators-brands' },
          { label: 'Operators & Brands' },
        ]}
      />

      <div className="flex flex-1 flex-col gap-6 px-6 pt-4 pb-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold">Operators & Brands</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Create, rename, activate and delete operators and their brands. Brand configuration
              lives in <Link href="/brand-settings" className="underline underline-offset-2 hover:text-foreground">Brand settings</Link>.
            </p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="shrink-0">
                <Plus data-icon="inline-start" />
                Create...
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onSelect={() => setEditor({ mode: 'create', kind: 'operator' })}>
                <Building2 />
                Operator
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setEditor({ mode: 'create', kind: 'brand' })}>
                <Store />
                Brand
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <Tabs value={tab} onValueChange={v => setTab(v as TabValue)} className="gap-6">
          <TabsList variant="line">
            <TabsTrigger value="operators">Operators</TabsTrigger>
            <TabsTrigger value="brands">Brands</TabsTrigger>
          </TabsList>

          <TabsContent value="operators" className="flex flex-col gap-4">
            <SectionHeader title="Operators" refreshing={refreshing} onRefresh={refresh} />

            <div className="overflow-hidden rounded-xl border border-border bg-card">
              <Table>
                <TableHeader className="bg-muted/60">
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="pl-4">ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Brands</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-12"><span className="sr-only">Actions</span></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {operatorRows.length ? operatorRows.map(o => (
                    <TableRow key={o.id}>
                      <TableCell className="pl-4">
                        <IdCell
                          id={o.id}
                          label="operator ID"
                          href={`/settings/operators-brands?tab=brands&q=${encodeURIComponent(o.name)}`}
                          onNavigate={() => showOperatorBrands(o)}
                        />
                      </TableCell>
                      <TableCell className="w-full">{o.name}</TableCell>
                      <TableCell className="tabular-nums">
                        <Button variant="link" className="h-auto p-0 text-foreground" onClick={() => showOperatorBrands(o)}>
                          {brandCount.get(o.id) ?? 0}
                        </Button>
                      </TableCell>
                      <TableCell><StatusBadge active={o.active} /></TableCell>
                      <TableCell className="pr-4 text-right">
                        <RowActions
                          name={o.name}
                          active={o.active}
                          onRename={() => setEditor({ mode: 'rename', kind: 'operator', id: o.id, name: o.name })}
                          onToggle={() => setOperators(prev => prev.map(x => (x.id === o.id ? { ...x, active: !x.active } : x)))}
                          onDelete={() => setDeleting({ kind: 'operator', id: o.id, name: o.name })}
                        />
                      </TableCell>
                    </TableRow>
                  )) : (
                    <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                        No operators yet.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            <TablePagination
              page={operatorsPage.page}
              pageSize={operatorsPage.pageSize}
              total={operators.length}
              onPageChange={operatorsPage.setPage}
              onPageSizeChange={operatorsPage.setPageSize}
            />
          </TabsContent>

          <TabsContent value="brands" className="flex flex-col gap-4">
            <SectionHeader title="Brands" refreshing={refreshing} onRefresh={refresh} />

            <InputGroup className="max-w-sm">
              <InputGroupAddon>
                <Search />
              </InputGroupAddon>
              <InputGroupInput
                type="search"
                placeholder="Search brands or operators..."
                aria-label="Search brands or operators"
                value={search}
                onChange={e => { setSearch(e.target.value); brandsPage.setPage(1) }}
              />
            </InputGroup>

            <div className="overflow-hidden rounded-xl border border-border bg-card">
              <Table>
                <TableHeader className="bg-muted/60">
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="pl-4">ID</TableHead>
                    <TableHead>Operator</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-12"><span className="sr-only">Actions</span></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {brandRows.length ? brandRows.map(b => (
                    <TableRow key={b.id}>
                      <TableCell className="pl-4">
                        <IdCell id={b.id} label="brand ID" href="/brand-settings" />
                      </TableCell>
                      <TableCell>{operatorName.get(b.operatorId)}</TableCell>
                      <TableCell className="w-full">{b.name}</TableCell>
                      <TableCell><StatusBadge active={b.active} /></TableCell>
                      <TableCell className="pr-4 text-right">
                        <RowActions
                          name={b.name}
                          active={b.active}
                          onRename={() => setEditor({ mode: 'rename', kind: 'brand', id: b.id, name: b.name })}
                          onToggle={() => setBrands(prev => prev.map(x => (x.id === b.id ? { ...x, active: !x.active } : x)))}
                          onDelete={() => setDeleting({ kind: 'brand', id: b.id, name: b.name })}
                        />
                      </TableCell>
                    </TableRow>
                  )) : (
                    <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                        {search ? 'No brands match your search.' : 'No brands yet.'}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            <TablePagination
              page={brandsPage.page}
              pageSize={brandsPage.pageSize}
              total={filteredBrands.length}
              onPageChange={brandsPage.setPage}
              onPageSizeChange={brandsPage.setPageSize}
            />
          </TabsContent>
        </Tabs>
      </div>

      <EditorDialog
        state={editor}
        operators={operators}
        takenIds={takenIds}
        onClose={() => setEditor(null)}
        onSubmit={submitEditor}
      />

      <AlertDialog open={deleting !== null} onOpenChange={open => !open && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {deleting?.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleting?.kind === 'operator' && deletingBrandCount > 0
                ? `This also deletes its ${deletingBrandCount} ${deletingBrandCount === 1 ? 'brand' : 'brands'}. This cannot be undone.`
                : 'This cannot be undone.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={confirmDelete}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

// useSearchParams needs a Suspense boundary for static prerendering
export default function OperatorsBrandsPageWrapper() {
  return (
    <Suspense>
      <OperatorsBrandsPage />
    </Suspense>
  )
}
