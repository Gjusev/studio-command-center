import { getTaskTemplates, getEmployees } from '@/app/actions'
import { assignTask } from '@/app/actions/tasks'
import { getUserWithPermissions } from '@/lib/auth/guards'
import { redirect } from 'next/navigation'
import { AssignTaskForm } from '@/components/forms/assign-task-form'

export default async function AssignTaskPage() {
    const user = await getUserWithPermissions()
    if (user.role !== 'studioleiter' && !user.permissions.includes('tasks.assign')) {
        redirect('/tasks')
    }

    const [templates, employees] = await Promise.all([
        getTaskTemplates(),
        getEmployees(),
    ])

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Aufgabe zuweisen</h1>
                <p className="text-muted-foreground">
                    Einer Mitarbeiter eine Aufgabe zuweisen
                </p>
            </div>

            <AssignTaskForm
                templates={templates}
                employees={employees}
                onSubmit={assignTask}
            />
        </div>
    )
}
