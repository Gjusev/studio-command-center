import { MachineForm } from '@/components/forms/machine-form'
import { getMachineCategories, getLocations } from '@/app/actions'
import { getMachine, updateMachine } from '@/app/actions/machines'
import { getUserWithPermissions } from '@/lib/auth/guards'
import { notFound, redirect } from 'next/navigation'

export default async function EditMachinePage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const user = await getUserWithPermissions()
    if (user.role !== 'studioleiter' && !user.permissions.includes('machines.edit')) {
        redirect('/machines')
    }
    const { id } = await params

    const [machine, categories, locations] = await Promise.all([
        getMachine(id).catch(() => null),
        getMachineCategories(),
        getLocations(),
    ])

    if (!machine) {
        notFound()
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Maschine bearbeiten</h1>
                <p className="text-muted-foreground">
                    {machine.name} bearbeiten
                </p>
            </div>

            <MachineForm
                categories={categories}
                locations={locations}
                initialData={machine}
                onSubmit={updateMachine}
                id={id}
                submitLabel="Speichern"
                title="Maschine bearbeiten"
                studioId={user.studioId}
                machineId={id}
            />
        </div>
    )
}
