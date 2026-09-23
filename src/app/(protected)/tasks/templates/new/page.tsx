import { TaskTemplateForm } from '@/components/forms/task-template-form'
import { createTaskTemplate } from '@/app/actions/tasks'
import { getUserWithPermissions } from '@/lib/auth/guards'
import { redirect } from 'next/navigation'

export default async function NewTaskTemplatePage() {
    const user = await getUserWithPermissions()
    if (user.role !== 'studioleiter' && !user.permissions.includes('tasks.manage_templates')) {
        redirect('/tasks')
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Neue Task Vorlage</h1>
                <p className="text-muted-foreground">
                    Eine neue Vorlage für wiederkehrende Aufgaben erstellen
                </p>
            </div>

            <TaskTemplateForm
                onSubmit={createTaskTemplate}
                submitLabel="Erstellen"
                title="Neue Task Vorlage"
            />
        </div>
    )
}
