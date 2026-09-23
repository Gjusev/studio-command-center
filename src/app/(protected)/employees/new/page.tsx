import { requireStudioleiter } from '@/lib/auth/guards'
import { NewEmployeeForm } from './new-employee-form'

export default async function NewEmployeePage() {
    await requireStudioleiter()

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 text-muted-foreground text-sm font-medium mb-1">
                    <span className="material-symbols-outlined text-sm">group</span>
                    <span>Mitarbeiter</span>
                    <span className="material-symbols-outlined text-sm">chevron_right</span>
                    <span className="text-foreground">Neu</span>
                </div>
                <h1 className="text-foreground text-4xl font-black leading-tight tracking-tight">
                    Neuer Mitarbeiter
                </h1>
                <p className="text-muted-foreground text-base max-w-2xl">
                    Fügen Sie einen neuen Mitarbeiter zu Ihrem Studio-Team hinzu
                </p>
            </div>

            <NewEmployeeForm />
        </div>
    )
}
