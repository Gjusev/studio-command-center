import { SimpleForm } from '@/components/forms/simple-form'
import { getLocation, updateLocation } from '@/app/actions/locations'
import { requireStudioleiter } from '@/lib/auth/guards'
import { notFound } from 'next/navigation'

export default async function EditLocationPage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    await requireStudioleiter()
    const { id } = await params

    const location = await getLocation(id).catch(() => null)

    if (!location) {
        notFound()
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Standort bearbeiten</h1>
                <p className="text-muted-foreground">
                    {location.name} bearbeiten
                </p>
            </div>

            <SimpleForm
                fields={[
                    { name: 'name', label: 'Name', required: true },
                    { name: 'description', label: 'Beschreibung', type: 'textarea' },
                ]}
                onSubmit={updateLocation}
                id={id}
                submitLabel="Speichern"
                title="Standort bearbeiten"
                initialData={location}
            />
        </div>
    )
}
