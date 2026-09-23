import { MachineForm } from '@/components/forms/machine-form'
import { getMachineCategories, getLocations } from '@/app/actions'
import { createMachine } from '@/app/actions/machines'
import { getUserWithPermissions } from '@/lib/auth/guards'
import { redirect } from 'next/navigation'

export default async function NewMachinePage() {
    const user = await getUserWithPermissions()
    if (user.role !== 'studioleiter' && !user.permissions.includes('machines.create')) {
        redirect('/machines')
    }

    const [categories, locations] = await Promise.all([
        getMachineCategories(),
        getLocations(),
    ])

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Neue Maschine</h1>
                <p className="text-muted-foreground">
                    Eine neue Maschine zum Inventar hinzufügen
                </p>
            </div>

            <MachineForm
                categories={categories}
                locations={locations}
                onSubmit={createMachine}
                submitLabel="Erstellen"
                title="Neue Maschine"
                studioId={user.studioId}
                // machineId not provided - image upload will be skipped for new machines
            />
        </div>
    )
}
