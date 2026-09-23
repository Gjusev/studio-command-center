import { ConsumableForm } from '@/components/forms/consumable-form'
import { getCategories, getLocations, getSuppliers } from '@/app/actions'
import { createConsumable } from '@/app/actions/consumables'
import { getUserWithPermissions } from '@/lib/auth/guards'
import { redirect } from 'next/navigation'

export default async function NewConsumablePage() {
    const user = await getUserWithPermissions()
    if (user.role !== 'studioleiter' && !user.permissions.includes('consumables.create')) {
        redirect('/consumables')
    }

    const [categories, locations, suppliers] = await Promise.all([
        getCategories(),
        getLocations(),
        getSuppliers(),
    ])

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Neuer Verbrauchsmaterial</h1>
                <p className="text-muted-foreground">
                    Einen neuen Artikel zum Inventar hinzufügen
                </p>
            </div>

            <ConsumableForm
                categories={categories}
                locations={locations}
                suppliers={suppliers}
                onSubmit={createConsumable}
                submitLabel="Erstellen"
                title="Neuer Verbrauchsmaterial"
            />
        </div>
    )
}
