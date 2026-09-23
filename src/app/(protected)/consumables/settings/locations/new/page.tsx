import { SimpleForm } from '@/components/forms/simple-form'
import { createLocation } from '@/app/actions/locations'
import { requireStudioleiter } from '@/lib/auth/guards'

export default async function NewLocationPage() {
    await requireStudioleiter()

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Neuer Standort</h1>
                <p className="text-muted-foreground">
                    Einen neuen Standort erstellen
                </p>
            </div>

            <SimpleForm
                fields={[
                    { name: 'name', label: 'Name', required: true },
                    { name: 'description', label: 'Beschreibung', type: 'textarea' },
                ]}
                onSubmit={createLocation}
                submitLabel="Erstellen"
                title="Neuer Standort"
            />
        </div>
    )
}
