'use client'
import { useContext } from 'react'
import { Link2, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Field, FieldContent, FieldError, FieldLabel } from '@/components/ui/field'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { SectionContext } from '../_lib/section'

// Shared building blocks of the Sidebar and Mobile Bottom Bar sections

export function BlockTitle({ title, description, aside }: { title: string; description: React.ReactNode; aside?: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="flex flex-col gap-1">
        <h3 className="text-base font-medium">{title}</h3>
        <div className="flex flex-col gap-2 text-sm text-muted-foreground">{description}</div>
      </div>
      {aside && <div className="flex shrink-0 items-center gap-3">{aside}</div>}
    </div>
  )
}

export function SubTitle({ title, hint, description }: { title: string; hint?: string; description: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <h4 className="text-sm font-medium">
        {title}
        {hint && <span className="font-normal text-muted-foreground"> -- {hint}</span>}
      </h4>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  )
}

/** Inline link to another brand-settings section, through the unsaved-changes guard. */
export function SectionLink({ section, children }: { section: string; children: React.ReactNode }) {
  const { go } = useContext(SectionContext)
  return (
    <Button variant="link" size="xs" className="h-auto p-0 align-baseline text-sm font-medium text-foreground" onClick={() => go(section)}>
      {children}
    </Button>
  )
}

export function RemoveButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="ghost" size="icon-sm" className="relative" aria-label={label} onClick={onClick}>
          <Trash2 className="text-muted-foreground" />
        </Button>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  )
}

/** Link (href) input with the External checkbox under it, like the footer links; without `external` only the input. */
export function HrefFields({ id, href, external, onChange, label = 'Link', error }: {
  id: string
  href: string
  external?: boolean
  onChange: (patch: { href?: string; external?: boolean }) => void
  label?: string
  /** Shown only after a failed save, like every other required-field error */
  error?: string
}) {
  return (
    <>
      <Field data-invalid={!!error || undefined}>
        <FieldLabel htmlFor={`${id}-href`}>{label}</FieldLabel>
        <InputGroup>
          <InputGroupAddon>
            <Link2 />
          </InputGroupAddon>
          <InputGroupInput
            id={`${id}-href`}
            value={href}
            onChange={e => onChange({ href: e.target.value })}
            placeholder={external ? 'https://example.com' : '/promotions'}
            autoComplete="off"
            spellCheck={false}
            aria-invalid={!!error || undefined}
          />
        </InputGroup>
        <FieldError>{error}</FieldError>
      </Field>
      {external !== undefined && (
        <Field orientation="horizontal">
          <Checkbox id={`${id}-external`} checked={external} onCheckedChange={v => onChange({ external: v === true })} />
          <FieldContent>
            <FieldLabel htmlFor={`${id}-external`}>External</FieldLabel>
          </FieldContent>
        </Field>
      )}
    </>
  )
}
