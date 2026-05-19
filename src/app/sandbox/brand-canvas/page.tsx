'use client'

import { DocLayout } from '@/components/doc/DocLayout'

export default function Page() {
  return (
    <DocLayout
      title="Brand Canvas"
      breadcrumbLabel="Sandbox"
      breadcrumbHref="/sandbox"
      tags={[
        { label: 'Prototype', type: 'tag' },
        { label: 'iGaming',   type: 'tag' },
      ]}
      description="[TBA]"
    >
      {null}
    </DocLayout>
  )
}
