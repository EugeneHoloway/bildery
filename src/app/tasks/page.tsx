import type { Metadata } from 'next'
import { TodoList } from '@/components/TodoList'

export const metadata: Metadata = {
  title: 'Tasks',
  description: 'Work in progress tasks and to-dos.',
}

export default function TasksPage() {
  return (
    <div className="py-12 pb-20">
      <div className="mx-auto max-w-[1240px] px-4">

        {/* Page header */}
        <div className="mb-10">
          <h1 className="mb-2 text-xl font-bold tracking-heading">Tasks</h1>
          <p className="text-base leading-relaxed text-muted-foreground">
            Work in progress tasks and to-dos.
          </p>
        </div>

        <TodoList />

      </div>
    </div>
  )
}
