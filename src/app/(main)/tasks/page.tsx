import type { Metadata } from 'next'
import { TodoList } from '@/components/TodoList'
import { PageShell } from '@/components/shared/PageShell'

export const metadata: Metadata = {
  title: 'Tasks',
  description: 'Work in progress tasks and to-dos.',
}

export default function TasksPage() {
  return (
    <PageShell
      title="Tasks"
      description="Work in progress tasks and to-dos."
    >
      <div className="px-4">
        <TodoList />
      </div>
    </PageShell>
  )
}
