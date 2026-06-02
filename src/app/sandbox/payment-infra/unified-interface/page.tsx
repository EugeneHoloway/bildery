'use client'

import { ArrowRight } from 'lucide-react'
import { DocLayout }  from '@/components/doc/DocLayout'
import { DocSection } from '@/components/doc/DocSection'

const methods = [
  { signature: 'initiateDeposit(req)',              returns: 'UnifiedResponse'  },
  { signature: 'initiateWithdrawal(req)',           returns: 'UnifiedResponse'  },
  { signature: 'getTransactionStatus(id)',          returns: 'UnifiedStatus'    },
  { signature: 'handleWebhook(payload)',            returns: 'UnifiedEvent'     },
  { signature: 'getSupportedMethods(geo, currency)',returns: 'Method[]'         },
]

export default function Page() {
  return (
    <DocLayout
      title="Unified Interface"
      breadcrumbLabel="Payment Infrastructure"
      breadcrumbHref="/sandbox/payment-infra"
      parentCrumb={{ label: 'Sandbox', href: '/sandbox' }}
      description="IPaymentProvider -- a unified contract for all PSP adapters. The orchestrator only works with this interface and never sees raw provider data."
      tags={[
        { label: 'Phase 1',        type: 'tag'    },
        { label: 'Infrastructure', type: 'status' },
        { label: 'EN',             type: 'tag'    },
      ]}
      footnote="DEPO44 | PAYMENT MODULE v1 | PHASE 0 ARCHITECTURE"
    >
      <DocSection num="1" title="Interface Methods">
        <div className="flex flex-col divide-y divide-border border border-border rounded-2xl overflow-hidden">
          {methods.map((m, i) => (
            <div key={i} className="flex items-center gap-3 px-4 py-3 bg-card">
              <ArrowRight className="size-3.5 shrink-0 text-muted-foreground" />
              <span className="text-sm text-foreground font-medium">{m.signature}</span>
              <ArrowRight className="size-3 shrink-0 text-muted-foreground/40 ml-auto" />
              <span className="text-sm text-muted-foreground shrink-0">{m.returns}</span>
            </div>
          ))}
        </div>
      </DocSection>
    </DocLayout>
  )
}
