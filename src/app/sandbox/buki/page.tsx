'use client'

import { useState } from 'react'
import { DocLayout } from '@/components/doc/DocLayout'

type Lang = 'ua' | 'en'

function LangSwitcher({ lang, onChange }: { lang: Lang; onChange: (l: Lang) => void }) {
  return (
    <div className="flex items-center gap-0.5 rounded-lg border border-border bg-muted p-0.5">
      {(['en', 'ua'] as Lang[]).map((l) => (
        <button
          key={l}
          onClick={() => onChange(l)}
          className={[
            'px-2.5 py-1 rounded-md text-xs font-semibold transition-colors',
            lang === l
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground',
          ].join(' ')}
        >
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  )
}

export default function Page() {
  const [lang, setLang] = useState<Lang>('en')

  return (
    <DocLayout
      title="Audit"
      breadcrumbLabel="Sandbox"
      breadcrumbHref="/sandbox"
      titleExtra={<LangSwitcher lang={lang} onChange={setLang} />}
      tags={[
        { label: 'Tech Task',         type: 'tag' },
        { label: 'Growth Strategy',   type: 'tag' },
        { label: 'Product Execution', type: 'tag' },
      ]}
      description="[TBA]"
    >
      {null}
    </DocLayout>
  )
}
