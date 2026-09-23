import { ConsumableForm } from '@/components/forms/consumable-form'
import { getCategories, getLocations, getSuppliers } from '@/app/actions'
import { getConsumable, updateConsumable } from '@/app/actions/consumables'
import { getUserWithPermissions } from '@/lib/auth/guards'
import { notFound, redirect } from 'next/navigation'

export default async function EditConsumablePage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const user = await getUserWithPermissions()
    if (user.role !== 'studioleiter' && !user.permissions.includes('consumables.edit')) {
        redirect('/consumables')
    }
    const { id } = await params

    const [consumable, categories, locations, suppliers] = await Promise.all([
        getConsumable(id).catch(() => null),
        getCategories(),
        getLocations(),
        getSuppliers(),
    ])

    if (!consumable) {
        notFound()
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Verbrauchsmaterial bearbeiten</h1>
                <p className="text-muted-foreground">
                    {consumable.name} bearbeiten
                </p>
            </div>

            <ConsumableForm
                categories={categories}
                locations={locations}
                suppliers={suppliers}
                initialData={consumable}
                onSubmit={updateConsumable}
                id={id}
                submitLabel="Speichern"
                title="Verbrauchsmaterial bearbeiten"
            />
        </div>
    )
}
